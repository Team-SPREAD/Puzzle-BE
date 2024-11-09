import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // AuthGuard import 추가
import { UserService } from './users.service'; // UserService의 정확한 경로로 수정

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt')) // JWT 인증 가드 추가
  async getUserInfo(@Req() req) {
    const userId = req.user.id; // 로그인된 사용자 ID
    return this.userService.getUserInfo(userId);
  }

}
