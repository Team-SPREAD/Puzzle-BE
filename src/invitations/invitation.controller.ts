// src/invitations/invitation.controller.ts
import { Controller, Post, Param, Req, UseGuards, Body, Get, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvitationService } from './invitation.service';
import { Request, Response } from 'express';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('invite')
  @UseGuards(AuthGuard('jwt'))
  async inviteToTeam(@Req() req: Request, @Body() { email, teamId }: { email: string; teamId: string }) {
    return this.invitationService.inviteToTeam(teamId, email);
  }

  @Post('accept-invite/:id')
  @UseGuards(AuthGuard('jwt'))
  async acceptInvite(@Param('id') invitationId: string, @Req() req: Request) {
    const userId = req.user['id'];
    return this.invitationService.acceptInvite(invitationId, userId);
  }

  @Get('accept/:id')
  async handleGetAcceptInvite(@Param('id') invitationId: string, @Res() res: Response) {
    const invitation = await this.invitationService.findInvitationById(invitationId);

    // 프론트 페이지
    if (!invitation) {
      return res.redirect(`http://localhost:3000/error?message=Invitation not found`);
    }

    return res.redirect(`http://localhost:3000/accept-invite/${invitationId}`);
  }
}
