import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GoogleRequest } from './auth.googleuser.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: Request) {
    // 구글 로그인 로직이 여기에서 처리됩니다.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    // 구글 로그인 콜백을 처리하고, 서비스에서 로그인 후 리다이렉션 처리
    return this.authService.googleLogin(req, res);
  }
}
