// src/invitations/invitation.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Invitation } from './invitation.schema';
import { TeamService } from '../teams/teams.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectModel(Invitation.name) private readonly invitationModel: Model<Invitation>,
    private readonly teamService: TeamService,
  ) {}

  // 여러 사용자 초대 및 이메일 전송
  async inviteToMultipleUsers(teamId: string, invitedEmails: string[], sender: string): Promise<any[]> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 팀 이름 조회
    const team = await this.teamService.findTeamById(teamId);
    const teamName = team?.teamName || '팀';

    const results = await Promise.all(
      invitedEmails.map(async (email) => {
        const invitation = new this.invitationModel({
          teamId: new Types.ObjectId(teamId),
          invitedEmail: email,
          sender,
        });
        await invitation.save();

        const inviteLink = `http://localhost:3000/invitations/accept/${invitation._id}`;
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `${sender}님이 '${teamName}'팀에 초대했습니다!`,
            text: `You have been invited to join ${teamName}. Click the link to accept: ${inviteLink}`,
            html: `
  <div style="max-width: 600px; margin: 0 auto; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; color: #333333; background-color: #ffffff;">
    <!-- 헤더 섹션 -->
    <div style="background-color: #007BFF; padding: 32px 24px; text-align: center;">
        <img src="https://spread-puzzle-bucket.s3.ap-northeast-2.amazonaws.com/app-images/puzzle-logo.png" alt="Service Logo" style="width: 360px; height: auto; margin-bottom: 24px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
            '${teamName}' 팀에 초대합니다
        </h1>
    </div>
    
    <!-- 본문 섹션 -->
    <div style="padding: 32px 24px; background-color: #ffffff;">
        <!-- 초대자 정보 박스 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-collapse: separate;">
            <tr>
                <td style="background-color: #F0F7FF; padding: 16px; border-radius: 8px;">
                    <p style="margin: 0; font-size: 16px; color: #007BFF;">
                        <strong style="color: #333333">${sender}</strong>님이 보낸 초대장입니다
                    </p>
                </td>
            </tr>
        </table>
        
        <!-- 메시지 -->
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #333333;">
            안녕하세요!<br><br>
            '${teamName}'의 새로운 여정에 함께하실 분을 찾고 있습니다.<br>
            당신의 역량과 열정이 우리 팀을 더욱 빛나게 할 거라 믿습니다.
        </p>
        
        <!-- 버튼 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
            <tr>
                <td align="center">
                    <table cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="background-color: #007BFF; border-radius: 4px;">
                                <a href="${inviteLink}" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none;">팀 참여하기</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        
        <!-- 대체 링크 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
            <tr>
                <td style="background-color: #F8F9FA; padding: 16px; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                        버튼이 작동하지 않나요? 아래 링크를 복사하여 브라우저에 붙여넣어 주세요:
                    </p>
                    <p style="margin: 0; font-size: 14px; word-break: break-all;">
                        <a href="${inviteLink}" style="color: #007BFF; text-decoration: none;">${inviteLink}</a>
                    </p>
                </td>
            </tr>
        </table>
        
        <!-- 구분선 -->
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="border-top: 1px solid #E9ECEF; padding-top: 24px;">
                    <p style="margin: 0; text-align: center; font-size: 14px; color: #666666;">
                        도움이 필요하신가요?
                        <a href="https://spread-puzzle.io" style="color: #007BFF; text-decoration: none;">고객센터 방문하기</a>
                    </p>
                </td>
            </tr>
        </table>
    </div>
</div>`

          });
          return { email, status: '메일 전송 성공' };
        } catch (error) {
          return { email, status: '메일 전송 실패', error: error.message };
        }
      })
    );

    return results;
  }

  // 초대 수락
  async acceptInvite(invitationId: string, userId: string): Promise<string> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation || invitation.status !== 'pending') {
      throw new Error('Invalid or already accepted invitation');
    }

    await this.teamService.addUserToTeam(invitation.teamId, userId);
    invitation.status = 'accepted';
    await invitation.save();

    return 'Invitation accepted';
  }

  // 초대 ID로 초대 조회
  async findInvitationById(id: string): Promise<Invitation | null> {
    return this.invitationModel.findById(id).exec();
  }
}
