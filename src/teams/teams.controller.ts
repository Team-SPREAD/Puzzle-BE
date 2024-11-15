// src/teams/team.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards, Param, Delete, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { TeamDto } from './teams.dto';
import { Team } from './teams.schema';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TeamService } from './teams.service';

@ApiTags('Teams') // Teams API 태그 설정
@ApiBearerAuth() // JWT 인증 필요
@Controller('api/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '팀 생성',
    description: '새로운 팀을 생성합니다. 팀 이름과 (선택적으로) 초기 사용자 목록을 포함할 수 있습니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)'
  })
  @ApiBody({
    description: '팀 생성 요청 데이터',
    type: TeamDto,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: '팀 생성 성공',
    schema: { example: { _id: '123', teamName: 'Development Team', users: ['user1'  ], createdDate: '2024-11-11T12:34:56Z' } }
  })
  async createTeam(@Body() teamDto: TeamDto, @Req() req: Request): Promise<Team> {
    const userId = req.user['id'];
    return this.teamService.createTeam(teamDto, userId);
  }

  @Get('my-teams')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '사용자의 팀 조회',
    description: 'J로그인된 사용자가 속한 팀 목록을 조회합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)'
  })
  @ApiResponse({
    status: 200,
    description: '사용자의 팀 목록 조회 성공',
    schema: {
      example: [
        { _id: '123', teamName: 'Development Team', users: ['userID1', 'userID2'], createdDate: '2024-11-11T12:34:56Z' }
      ]
    }
  })
  async getMyTeams(@Req() req: Request): Promise<Team[]> {
    const userId = req.user['id'];
    return this.teamService.findTeamsByUserId(userId);
  }

  @Get(':id/users')
  @ApiOperation({
    summary: '팀 사용자 조회',
    description: '특정 팀에 속한 모든 사용자 정보를 조회합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '팀의 고유 ID',
    example: '60d9f6f10c1a1b2f7c3d9a20'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 상세 정보',
    schema: {
      example: [
        {
        "_id": "6730f3f12cc10f74c30bfc33",
        "email": "user@gmail.com",
        "firstName": "홍",
        "lastName": "길동",
        "avatar": "https://user-google-profile-image-url.com",
        "createdDate": "2024-11-10T17:57:05.581Z",
        "updatedDate": "2024-11-10T17:57:05.581Z",
      },
      {
        "_id": "6730f3f12cc10f74c30bfc33",
        "email": "user2@gmail.com",
        "firstName": "김",
        "lastName": "철수",
        "avatar": "https://user-google-profile-image-url.com",
        "createdDate": "2024-11-11T17:57:05.581Z",
        "updatedDate": "2024-11-10T17:57:05.581Z",
      }
    ]
    }
  })
  async getTeamUsers(@Param('id') teamId: string) {
    return this.teamService.getTeamUsers(teamId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '팀 이름 수정',
    description: '팀 ID를 받아 팀 이름을 수정합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '수정할 팀의 고유 ID',
  })
  @ApiBody({
    description: '새로운 팀 이름',
    schema: { example: { teamName: '수정할 팀이름' } },
  })
  @ApiResponse({
    status: 200,
    description: '팀 이름 수정 성공',
    schema: { example: { message: '팀 이름이 @@으로(로) 변경되었습니다.' } }
  })
  async updateTeamName(@Param('id') teamId: string, @Body('teamName') teamName: string): Promise<{ message: string }> {
    const updatedTeam = await this.teamService.updateTeamName(teamId, teamName);
    return { message: `팀 이름이 '${updatedTeam.teamName}'으로(로) 변경되었습니다.` };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '팀 삭제',
    description: '팀 ID를 받아 해당 팀을 삭제합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '삭제할 팀의 고유 ID',
  })
  @ApiResponse({
    status: 200,
    description: '팀 삭제 성공',
    schema: { example: { message: '팀 삭제 완료' } }
  })
  async deleteTeam(@Param('id') teamId: string): Promise<{ message: string }> {
    await this.teamService.deleteTeam(teamId);
    return { message: '팀 삭제 완료' };
  }

}
