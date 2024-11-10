// src/users/user.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'; // 추가
import { UserService } from './users.service';

@ApiTags('User') // API 태그 추가
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '사용자 정보 조회', description: '현재 로그인된 사용자의 정보를 조회합니다.' }) // 설명 추가
  async getUserInfo(@Req() req) {
    const userId = req.user.id;
    return this.userService.getUserInfo(userId);
  }
}
