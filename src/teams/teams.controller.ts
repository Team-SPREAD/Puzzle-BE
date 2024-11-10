// src/teams/team.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TeamDto } from './teams.dto';
import { Team } from './teams.schema';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TeamService } from './teams.service';

@ApiTags('Teams') // API 태그 추가
@ApiBearerAuth()
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '팀 생성', description: '새로운 팀을 생성합니다.' })
  async createTeam(@Body() teamDto: TeamDto, @Req() req: Request): Promise<Team> {
    const userId = req.user['id'];
    return this.teamService.createTeam(teamDto, userId);
  }

  @Get('my-teams')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '사용자의 팀 조회', description: '로그인된 사용자가 속한 팀들을 조회합니다.' })
  async getMyTeams(@Req() req: Request): Promise<Team[]> {
    const userId = req.user['id'];
    return this.teamService.findTeamsByUserId(userId);
  }

  @Get(':id/users')
  @ApiOperation({ summary: '팀 사용자 조회', description: '특정 팀에 속한 모든 사용자를 조회합니다.' })
  async getTeamUsers(@Param('id') teamId: string) {
    return this.teamService.getTeamUsers(teamId);
  }
}
