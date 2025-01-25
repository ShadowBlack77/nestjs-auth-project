import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
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
    return await this.authService.login(req, res, true);
  }

  @Public()
  @Post('/send-email-verification')
  public sendEmailVerification() {

  }

  @Public()
  @Post('/reset-password')
  public resetPassword(@Body() resetPasswordDto: any) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Patch('/change-password/:tokenId')
  public changePassword(@Param('tokenId') tokenId: string, @Query('token') token: string, @Body() changePassworDto: any) {
    return this.authService.changePassword(tokenId, token, changePassworDto);
  }

  @Public()
  @Get('/email-verify')
  public emailVerification(@Query('tokenId') tokenId: string, @Query('token') token: string) {
    return this.authService.emailVerify(tokenId, token);
  }
}
