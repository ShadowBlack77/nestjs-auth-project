import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import * as argon2 from "argon2";
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { CreateUserDto } from 'src/user/dto';
import { MailsService } from 'src/mails/mails.service';
import { AuthProvider, EmailTokensTypes } from './enum';
import { Exception } from 'handlebars';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY) private readonly refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private readonly mailsService: MailsService
  ) {}

  public async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException("Invalid Credentials");
    }

    return { id: user.id, email: user.email, emailVerified: user.emailVerified, tfa: user.tfa };
  }

  public async validateJwtUser(userId: number, accessToken: string) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (!user.hashedAccessToken) {
      throw new UnauthorizedException("Token is not valid");
    }

    const isAccessTokenValid = await argon2.verify(user.hashedAccessToken, accessToken);

    if (!isAccessTokenValid) {
      throw new UnauthorizedException("Token is not valid");
    }

    const currentUser = {
      id: user.id,
      role: user.role
    };

    return currentUser;
  }

  public async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);

    if (user) {
      return user;
    }

    return await this.userService.create(googleUser);
  }

  public async login(req: any, res: Response, isGoogleLogin: boolean = false) {

    // User Informations
    const userId = req.user.id;
    const userEmail = req.user.email;
    const emailVerified = req.user.emailVerified;
    const is2faEnabled = req.user.tfa;

    if (!emailVerified && !isGoogleLogin) {
      const { tokenId, token } = await this.mailsService.generateEmailTokens(userId, EmailTokensTypes.VERIFY_EMAIL);
      this.mailsService.sendMail(userEmail, 'Email Verification', { tokenId, token }, 'email-verification');

      return res.status(201).json({
        email: userEmail,
        emailVerified: emailVerified
      })
    }

    if (!emailVerified && isGoogleLogin) {
      const { tokenId, token } = await this.mailsService.generateEmailTokens(userId, EmailTokensTypes.VERIFY_EMAIL);
      this.mailsService.sendMail(userEmail, 'Email Verification', { tokenId, token }, 'email-verification');

      return res.redirect(`http://localhost:5173?email=${userEmail}&email-verified=${emailVerified}`);
    }

    if (is2faEnabled) {
      // Jeżeli jest 2FA uruchmione, należy NIE LOGOWAĆ użytkownika bez podania kodu z Google Authenticatora. 
      // Jeżeli użtywkonika ma uruchomione 2FA musi być to inne URL do logowania, proces logowania jest zupełnie inny, tokeny generowane są dopiero w momencie walidacji nie tylko hasła ale i również kodu wygenerowanego przez aplikację Google Authenticator.

      // Jeżeli 2FA jest uruchomine wysyła odpowiedź zawierającą informację na temat wyamaganego procesu 2FA
      // Po otrzymaniu informacji na temat 2FA FE powinno przekierować użytkownika na route /auth/2fa/validation, gdzie zobaczy tylko i wyłacznie pole do podania KODU, po którym użytkownik zostanie zwalidowany i otrzyma w odpowiedzi zwrotnej access-token oraz refresh-token (O ile kod jest poprawny)
      // Wtedy logowanie następują z innego Routa: POST[/2fa/validate]
      return res.status(201).json({
        status: '2FA_REQUIRED',
        content: 'Two-factory authentication required.'
      })
    }

    // JWT and Refresh tokens genereted by localy method
    const tokens = await this.generateTokens(userId);
    const hashedAccessToken = await argon2.hash(tokens.accessToken);
    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);

    await this.userService.updateHashedAccessToken(userId, hashedAccessToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

    res.cookie('full-nest-auth', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    });

    if (!isGoogleLogin) {
      return res.status(201).json({
        id : userId,
        accessToken: tokens.accessToken,
        emailVerified: emailVerified
      });
    }

    return res.redirect(`http://localhost:5173?token=${tokens.accessToken}`);
  }

  public async signOut(req: any, res: Response) {
    const userId = req.user.id;

    await this.userService.updateHashedAccessToken(userId, null);
    await this.userService.updateHashedRefreshToken(userId, null);

    res.cookie('full-nest-auth', '', {
      httpOnly: true,
      secure: false,
      maxAge: 0,
      path: '/',
      sameSite: 'lax'
    });

    res.status(201).json({ content: 'logout' });
  }

  public async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException("Invalid Refresh Token");
    }

    const refreshTokenMatches = await argon2.verify(user.hashedRefreshToken, refreshToken);

    if (!refreshTokenMatches) {
      throw new UnauthorizedException("Invalid Refresh Token");
    }

    return {
      id: userId
    }
  }

  public async refreshToken(req: any, res: Response) {
    const userId = req.user.id;
    const tokens = await this.generateTokens(userId);
    const hashedAccessToken = await argon2.hash(tokens.accessToken);
    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);

    await this.userService.updateHashedAccessToken(userId, hashedAccessToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

    res.cookie('full-nest-auth', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    });

    return res.status(201).json({
      id : userId,
      accessToken: tokens.accessToken,
    });
  }

  public async emailVerify(tokenId: string, token: string) {
    return await this.mailsService.checkTokenValidation(tokenId, token);
  }

  public async resetPassword(resetPasswordDto: any) {
    const userEmail = resetPasswordDto.email;

    const user = await this.userService.findByEmail(userEmail);
    
    if (user.authProvider === AuthProvider.GOOGLE_PROVIDER) {
      throw new BadRequestException("Google accounts cant't change password!");
    }
    
    const { tokenId, token } = await this.mailsService.generateEmailTokens(user.id, EmailTokensTypes.RESET_PASSWORD);
    return this.mailsService.sendMail(userEmail, 'Reset Password', { tokenId, token }, 'reset-password');
  }

  public async changePassword(tokenId: string, token: string, changePassworDto: any) {
    const newPassword = changePassworDto.newPassword;
    return await this.mailsService.checkTokenValidation(tokenId, token, newPassword);
  }

  private async generateTokens(userId: number) {
    const payload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshJwtConfiguration)
    ]);

    return {
      accessToken,
      refreshToken
    }
  }
}
