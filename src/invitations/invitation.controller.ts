// src/invitations/invitation.controller.ts
import { Controller, Post, Param, Req, UseGuards, Body, Get, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InvitationService } from './invitation.service';
import { Request, Response } from 'express';

@ApiTags('Invitations')
@ApiBearerAuth()
@Controller('api/invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '팀 초대',
    description: '여러 사용자를 팀에 초대합니다.',
  })
  @ApiBody({
    description: '초대 생성 데이터',
    required: true,
    schema: {
      properties: {
        emails: { type: 'array', items: { type: 'string' }, example: ['user1@example.com'], description: '초대할 이메일' },
        teamId: { type: 'string', example: 'teamId123', description: '팀 ID' },
        sender: { type: 'string', example: '홍길동', description: '송신자' },
      },
    },
  })
  async inviteToTeam(
    @Req() req: Request,
    @Body() { emails, teamId, sender }: { emails: string[]; teamId: string; sender: string }
  ) {
    const results = await this.invitationService.inviteToMultipleUsers(teamId, emails, sender);
    return { message: '이메일 발송 성공!', results };
  }

  @Post('acceptance/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '초대 수락',
    description: '사용자가 팀 초대를 수락합니다.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '초대 ID',
    example: 'invitationId123',
  })
  async acceptInvite(@Param('id') invitationId: string, @Req() req: Request) {
    const userId = req.user['id'];
    await this.invitationService.acceptInvite(invitationId, userId);
    return { message: '초대 수락 성공!' };
  }

  @Get('redirection/:id')
  @ApiOperation({
    summary: '초대 수락 링크',
    description: '초대 수락 페이지로 리디렉션합니다.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '초대 ID',
  })
  async handleGetAcceptInvite(@Param('id') invitationId: string, @Req() req: Request, @Res() res: Response) {
    const invitation = await this.invitationService.findInvitationById(invitationId);
  
    if (!invitation) {
      // 초대가 없는 경우 오류 페이지로 이동
      return res.redirect(`http://localhost:3000/error?message=Invitation not found`);
    }
  
    if (!req.user) {
      // 쿠키에 redirectUrl 저장 (로그인 후 초대 수락 페이지로 리다이렉션)
      const redirectUrl = `http://localhost:3000/invitation/accept/${invitationId}`;
      console.log('Setting redirectUrl cookie:', redirectUrl); // 디버깅 로그
      res.cookie('redirectUrl', redirectUrl, {
        httpOnly: true,
        maxAge: 10 * 60 * 1000, // 10분
        secure: false, // HTTPS가 아닌 개발 환경에서는 false
        path: '/', // 모든 경로에서 쿠키 접근 가능
      });
  
      // 로그인 페이지로 리다이렉트
      return res.redirect(`http://localhost:3000/auth/google`);
    }
  
    // 로그인된 사용자는 초대 수락 페이지로 바로 이동
    const team = await this.invitationService.getTeamName(invitation.teamId);
    return res.redirect(
      `http://localhost:3000/invitation/accept/${invitationId}/${encodeURIComponent(invitation.sender)}/${encodeURIComponent(team.teamName)}`
    );
  }
}