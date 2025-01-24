import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import * as argon2 from "argon2";
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { CreateUserDto } from 'src/user/dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY) private readonly refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>
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

    return { id: user.id };
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

  public async login(req: any, res: Response) {
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
