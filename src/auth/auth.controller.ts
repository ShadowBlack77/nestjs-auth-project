import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard, JwtAuthGuard, LocalAuthGuard, RefreshAuthGuard } from './guards';
import { Response } from 'express';
import { Public } from './decorators';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post("/login")
  public login(@Req() req: any, @Res() res: Response) {
    return this.authService.login(req, res);
  }

  @UseGuards(RefreshAuthGuard)
  @Post("/refresh")
  public refreshToken(@Req() req: any, @Res() res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/sign-out")
  public signOut(@Req() req: any, @Res() res: Response) {
    return this.authService.signOut(req, res);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('/google/login')
  public googleLogin() {

  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  public async googleCallback(@Req() req: any, @Res() res: any) {
    const response: any = await this.authService.login(req, res);

    console.log(response);

    res.redirect(`http://localhost:5173?token=${response.accessToken}`);
  }
}
