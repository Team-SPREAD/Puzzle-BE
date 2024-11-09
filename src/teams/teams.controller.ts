// src/teams/team.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common'; // Param 추가
import { TeamDto } from './teams.dto';
import { Team } from './teams.schema';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TeamService } from './teams.service';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createTeam(@Body() teamDto: TeamDto, @Req() req: Request): Promise<Team> {
    const userId = req.user['id'];
    return this.teamService.createTeam(teamDto, userId);
  }

  // 현재 로그인된 사용자가 속해 있는 모든 팀을 불러오는 엔드포인트
  @Get('my-teams')
  @UseGuards(AuthGuard('jwt'))
  async getMyTeams(@Req() req: Request): Promise<Team[]> {
    const userId = req.user['id'];
    return this.teamService.findTeamsByUserId(userId);
  }

  @Get(':id/users')
  async getTeamUsers(@Param('id') teamId: string) {
    return this.teamService.getTeamUsers(teamId);
  }
}
