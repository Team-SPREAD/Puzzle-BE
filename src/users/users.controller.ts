// src/users/user.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './users.service';

@ApiTags('User') // API 태그 추가
@ApiBearerAuth()
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '사용자 정보 조회', description: '현재 로그인된 사용자의 정보를 조회합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)' })
  @ApiResponse({
    status: 200,
    description: '사용자 상세 정보',
    schema: {
      example: {
        "_id": "6730f3f12cc10f74c30bfc33",
        "email": "user@gmail.com",
        "firstName": "홍",
        "lastName": "길동",
        "avatar": "https://user-google-profile-image-url.com",
        "createdDate": "2024-11-10T17:57:05.581Z",
        "updatedDate": "2024-11-10T17:57:05.581Z",
        "__v": 0
      }
    }
  })
  async getUserInfo(@Req() req) {
    const userId = req.user.id;
    return this.userService.getUserInfo(userId);
  }
}
