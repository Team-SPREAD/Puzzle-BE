import { Controller, Get, Req, Res, UseGuards, Query } from '@nestjs/common';
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
  async googleLogin(@Req() req: Request, @Res() res: Response, @Query('redirectUrl') redirectUrl?: string) {
    if (redirectUrl) {
      // 쿠키에 redirectUrl 저장
      res.cookie('redirectUrl', redirectUrl, { httpOnly: true });
    }
    // 구글 인증 페이지로 리다이렉트
    return res.end();
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인 콜백', description: '구글 OAuth 콜백을 처리하고 JWT를 생성합니다.' })
  async googleLoginCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    // 쿠키에서 redirectUrl 가져오기
    const redirectUrl = req.cookies['redirectUrl'];
    // 구글 로그인 후 redirectUrl 파라미터 사용하여 리다이렉트
    return this.authService.googleLogin(req, res, redirectUrl);
  }
}
