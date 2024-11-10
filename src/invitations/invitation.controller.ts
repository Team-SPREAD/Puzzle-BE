// src/invitations/invitation.controller.ts
import { Controller, Post, Param, Req, UseGuards, Body, Get, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InvitationService } from './invitation.service';
import { Request, Response } from 'express';

@ApiTags('Invitations')
@ApiBearerAuth()
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('invite')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '팀 초대', description: '특정 사용자를 팀에 초대합니다.' })
  async inviteToTeam(@Req() req: Request, @Body() { email, teamId }: { email: string; teamId: string }) {
    return this.invitationService.inviteToTeam(teamId, email);
  }

  @Post('accept-invite/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '초대 수락', description: '사용자가 팀 초대를 수락합니다.' })
  async acceptInvite(@Param('id') invitationId: string, @Req() req: Request) {
    const userId = req.user['id'];
    return this.invitationService.acceptInvite(invitationId, userId);
  }

  @Get('accept/:id')
  @ApiOperation({ summary: '초대 수락 링크', description: '초대를 수락하는 페이지로 리디렉션합니다.' })
  async handleGetAcceptInvite(@Param('id') invitationId: string, @Res() res: Response) {
    const invitation = await this.invitationService.findInvitationById(invitationId);

    if (!invitation) {
      return res.redirect(`http://localhost:3000/error?message=Invitation not found`);
    }

    return res.redirect(`http://localhost:3000/accept-invite/${invitationId}`);
  }
}
