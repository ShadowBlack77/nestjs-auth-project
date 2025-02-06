import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import jwtConfig from "../config/jwt.config";
import { ConfigType } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { Request } from "express";
import { Payload } from "../models";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        if (req && req.cookies) {
          return req.cookies['full-nest-auth-at'];
        }

        return null;
      },
      secretOrKey: jwtConfiguration.secret,
      ignoreExpiration: false,
      passReqToCallback: true
    });
  }

  public validate(req: Request, payload: Payload) {
    const accessToken = req.cookies['full-nest-auth-at'];
    const userId = payload.sub;

    return this.authService.validateJwtUser(userId, accessToken);
  }
}