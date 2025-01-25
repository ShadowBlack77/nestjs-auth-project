import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import googleOauthConfig from "../config/google-oauth.config";
import { ConfigType } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { VerifyCallback } from "passport-jwt";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {

  constructor(
    @Inject(googleOauthConfig.KEY) private readonly googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private readonly authService: AuthService
  ) {
    super({
      clientID: googleConfiguration.clientID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ['email', 'profile']
    });
  }

  public async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback){
    const user: any = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      username: profile.name.givenName,
      avatarUrl: profile.photos[0].value,
      password: ''
    });

    done(null, user);
  }
}