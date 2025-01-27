import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import refreshJwtConfig from "../config/refresh-jwt.config";
import { ConfigType } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { Request } from "express";
import { Payload } from "../models";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {

  constructor(
    @Inject(refreshJwtConfig.KEY) private readonly refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        if (req && req.cookies) {
          return req.cookies['full-nest-auth'];
        }

        return null;
      },
      secretOrKey: refreshJwtConfiguration.secret,
      ignoreExpiration: false,
      passReqToCallback: true
    });
  }

  public validate(req: Request, payload: Payload) {
    const refreshToken = req.cookies['full-nest-auth'];
    const userId = payload.sub;

    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}