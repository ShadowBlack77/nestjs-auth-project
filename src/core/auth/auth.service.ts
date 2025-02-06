import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import * as argon2 from "argon2";
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthProvider, EmailTokensTypes } from './enum';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { AuthRequest, ResetPasswordDto } from './models';
import { ChangePasswordDto } from './models/change-password.dto';
import { UserService } from '../user/user.service';
import { MailsService } from '../mails/mails.service';
import { LoginSessionService } from '../login-session/login-session.service';
import { CreateUserDto, TfaDto, UserRequest } from '../user/models';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY) private readonly refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private readonly mailsService: MailsService,
    private readonly loginSessionService: LoginSessionService
  ) {}

  public async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid Credentials");
    }

    const isPasswordMatch = await compare(password, user.password);

    if (user.isAccountLocked) {
      const currentTime = new Date();
      const lastFiledAttemp = user.lastFailedLogin;

      const isAccountUnlocked = currentTime.getTime() - lastFiledAttemp.getTime() >= parseInt(process.env.ACCOUNT_TIME_BLOCK);

      if (!isAccountUnlocked) {
        throw new UnauthorizedException("The account has been blocked due to too many failed login attempts. Please wait a while to try logging in again. If you were not the one who logged in just now, we recommend that you change your password as soon as possible.");
      }

      await this.userService.unlockUserAccount(user.id);
    }

    if (!isPasswordMatch) {
      if (!user.isAccountLocked) {
        const lastFailedLogin = new Date(); 
        const failedLoginAttemps = user.failedLoginAttemps;
  
        await this.userService.failedLoginAttempt(user.id, lastFailedLogin, failedLoginAttemps);
      }

      throw new UnauthorizedException("Invalid Credentials");
    }

    await this.userService.clearFailedAttemps(user.id);

    return { id: user.id, email: user.email, emailVerified: user.emailVerified, tfa: user.tfa, role: user.role };
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
      return { id: user.id, email: user.email, emailVerified: user.emailVerified, tfa: user.tfa, role: user.role };
    }

    return await this.userService.create(googleUser);
  }

  public async validate2faAuthorization(tfaDto: TfaDto, req: Request, res: Response) {
    const authCode = tfaDto.code;
    const loginSessionId = req.cookies['login-session-id'];

    const sessionUser = await this.loginSessionService.validateLoginSessionId(loginSessionId);

    if (!sessionUser) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const user = await this.userService.findOne(sessionUser.id);
    const isValid = this.verifyOTP(user.tfaSecret, authCode);

    if (!isValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const tokens = await this.generateTokens(user.id);
    const hashedAccessToken = await argon2.hash(tokens.accessToken);
    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);

    await this.userService.updateHashedAccessToken(user.id, hashedAccessToken);
    await this.userService.updateHashedRefreshToken(user.id, hashedRefreshToken);

    res.cookie('full-nest-auth', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'strict'
    });

    res.cookie('full-nest-auth-at', tokens.accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 1000,
      path: '/',
      sameSite: 'strict'
    });

    await this.loginSessionService.removeLoginSessionId(user);

    return res.status(201).json({
      id : user.id,
      emailVerified: true,
      role: user.role
    });
  }

  public async login(req: AuthRequest, res: Response, isGoogleLogin: boolean = false) {

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
      const user = await this.userService.findOne(userId);
      const loginSessionId = await this.loginSessionService.generateSessionLoginId(user);
      const authProvider = user.authProvider;

      res.cookie('login-session-id', loginSessionId, {
        httpOnly: true,
        secure: false,
        maxAge: 15 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'strict'
      })

      if (authProvider !== AuthProvider.GOOGLE_PROVIDER) {
        return res.status(201).json({
          status: '2FA_REQUIRED',
          content: 'Two-factory authentication required.',
        });
      }

      return res.redirect(`http://localhost:5173`);
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
      sameSite: 'strict'
    });

    res.cookie('full-nest-auth-at', tokens.accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 1000,
      path: '/',
      sameSite: 'strict'
    });

    if (!isGoogleLogin) {
      return res.status(201).json({
        id : userId,
        emailVerified: emailVerified,
        role: req.user.role
      });
    }

    return res.redirect(`http://localhost:5173`);
  }

  public async signOut(req: UserRequest, res: Response) {
    const userId = req.user.id;

    await this.userService.updateHashedAccessToken(userId, null);
    await this.userService.updateHashedRefreshToken(userId, null);

    res.cookie('full-nest-auth', '', {
      httpOnly: true,
      secure: false,
      maxAge: 0,
      path: '/',
      sameSite: 'strict'
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

  public async refreshToken(req: UserRequest, res: Response) {
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
      sameSite: 'strict'
    });

    res.cookie('full-nest-auth-at', tokens.accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 1000,
      path: '/',
      sameSite: 'strict'
    });

    return res.status(201).json({
      id : userId,
    });
  }

  public async emailVerify(tokenId: string, token: string) {
    return await this.mailsService.checkTokenValidation(tokenId, token);
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const userEmail = resetPasswordDto.email;

    const user = await this.userService.findByEmail(userEmail);

    if (!user) {
      throw new BadRequestException('Email was not found');
    }
    
    if (user.authProvider === AuthProvider.GOOGLE_PROVIDER) {
      throw new BadRequestException("Google accounts cant't change password!");
    }
    
    const { tokenId, token } = await this.mailsService.generateEmailTokens(user.id, EmailTokensTypes.RESET_PASSWORD);
    return this.mailsService.sendMail(userEmail, 'Reset Password', { tokenId, token }, 'reset-password');
  }

  public async changePassword(tokenId: string, token: string, changePassworDto: ChangePasswordDto) {
    const newPassword = changePassworDto.newPassword;
    return await this.mailsService.checkTokenValidation(tokenId, token, newPassword);
  }

  public async enable2fa(req: UserRequest, res: Response) {

    const user = await this.userService.findOne(req.user.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.tfa) {
      throw new BadRequestException('2fa already enabled');
    }

    const secret = this.generateSecret();
    const qrCode = await this.generateQRCode(secret, user.email);

    await this.userService.enable2fa(user.id, secret);

    return res.status(201).json({ content: '2fa-enabled', qrCode: qrCode });
  }

  public async disable2fa(req: UserRequest, res: Response) {
    const user = await this.userService.findOne(req.user.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.tfa) {
      throw new BadRequestException('2fa was not enabled, nothing change');
    }

    await this.userService.disable2fa(user.id);

    return res.status(201).json({ content: '2fa-disabled' });
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

  private generateSecret(): string {
    return authenticator.generateSecret();
  }

  private async generateQRCode(secret: string, email: string) {
    try {
      const otpAuthURL = authenticator.keyuri(email, 'FullAuthNestJs', secret);
      const qrImage = await qrcode.toDataURL(otpAuthURL);

      return qrImage
    } catch(err) {
      console.log(err);

      throw new BadRequestException('QR Code cannot be generated');
    }
  }

  private async verifyOTP(secret: string, token: string) {
    return authenticator.verify({ secret, token });
  }
}
