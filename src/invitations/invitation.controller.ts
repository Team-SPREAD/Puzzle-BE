// src/invitations/invitation.controller.ts
import { Controller, Post, Param, Req, UseGuards, Body, Get, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InvitationService } from './invitation.service';
import { Request, Response } from 'express';

@ApiTags('Invitations') // Invitations 태그 설정
@ApiBearerAuth() // JWT 인증 요구
@Controller('api/invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '팀 초대',
    description: '특정 사용자를 팀에 초대합니다. <br>초대하려는 사용자의 이메일, 팀ID, 송신자의 이름을 입력하세요.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)',
  })
  @ApiBody({
    description: '초대 생성 데이터',
    required: true,
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com', description: '초대할 사용자의 이메일 주소' },
        teamId: { type: 'string', example: '60d9f6f10c1a1b2f7c3d9a20', description: '초대를 보낼 팀의 ID' },
        sender: { type: 'string', example: '홍길동', description: '송신자' },
      },
    },
  })
  @ApiResponse({ status: 201, description: '이메일 발송 완료', schema: { example: { message: '이메일 발송 성공!' } }})
  async inviteToTeam(@Req() req: Request, @Body() { email, teamId, sender }: { email: string; teamId: string; sender: string}) {
    await this.invitationService.inviteToTeam(teamId, email, sender);
    
    return { message: '이메일 발송 성공!' };
  }


  @Post('acceptance/:id')
  //@UseGuards(AuthGuard('jwt')) 일단 안 막음
  @ApiOperation({
    summary: '초대 수락',
    description: '사용자가 팀 초대를 수락합니다.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '초대 ID를 파라미터 값으로 넘겨주세요.',
    example: '60d9f6f10c1a1b2f7c3d9a20',
  })
  @ApiResponse({ status: 200, description: '초대 수락 성공', schema: { example: { message: '초대 수락 성공!' } } })
  async acceptInvite(@Param('id') invitationId: string, @Req() req: Request) {
    const userId = req.user['id'];
    
    await this.invitationService.acceptInvite(invitationId, userId);
    return { message: '초대 수락 성공!' };
  }

  @Get('redirection/:id')
  @ApiOperation({
    summary: '초대 수락 링크',
    description: '사용자가 이메일 초대 링크를 클릭하면 초대를 수락하는 페이지로 리디렉션합니다.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '초대 ID를 파라미터 값으로 넘겨주세요.',
    example: '60d9f6f10c1a1b2f7c3d9a20',
  })
  @ApiResponse({ status: 302, description: '초대 수락 페이지로 리디렉션' })
  @ApiResponse({ status: 404, description: '초대를 찾을 수 없습니다. 오류 페이지로 리디렉션합니다.' })
  async handleGetAcceptInvite(@Param('id') invitationId: string, @Res() res: Response) {
    const invitation = await this.invitationService.findInvitationById(invitationId);

    if (!invitation) {
      return res.redirect(`http://localhost:3000/error?message=Invitation not found`);
    }
    
    // 프론트엔드 수락 페이지로 리디렉션
    return res.redirect(`http://localhost:3000/invitation/accept/${invitationId}`);
  }
}