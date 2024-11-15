// src/auth/auth.controller.ts
import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GoogleRequest } from './auth.googleuser.dto';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인', description: '구글 OAuth를 통해 로그인합니다.' })
  async googleLogin(@Req() req: Request) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인 콜백', description: '구글 OAuth 콜백을 처리하고 JWT를 생성합니다.' })
  async googleLoginCallback(
    @Req() req: GoogleRequest,
    @Res() res: Response,
    @Query('redirectUrl') redirectUrl?: string
  ) {
    return this.authService.googleLogin(req, res, redirectUrl);
  }
}
