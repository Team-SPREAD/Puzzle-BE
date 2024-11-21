// src/invitations/invitation.controller.ts
import { Controller, Post, Param, Req, UseGuards, Body, Get, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
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
  @ApiOperation({
    summary: '초대 수락',
    description: '사용자가 팀 초대를 수락합니다. 로그인 여부와 관계없이 처리됩니다.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '초대 ID',
    example: '673c90235dcc21f2847c7cee',
  })
  async acceptInvite(
    @Param('id') invitationId: string,
    @Res() res: Response
  ) {
    try {
      const message = await this.invitationService.acceptInviteWithoutUser(invitationId);
      return res.redirect('https://spread-puzzle.io');
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
  
}