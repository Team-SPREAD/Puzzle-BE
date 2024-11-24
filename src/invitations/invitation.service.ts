import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Invitation } from './invitation.schema';
import { TeamService } from '../teams/teams.service';
import { User } from 'src/users/users.schema';
import { Team } from 'src/teams/teams.schema';

@Injectable()
export class InvitationService {
  constructor(
    @InjectModel(Invitation.name) private readonly invitationModel: Model<Invitation>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    private readonly teamService: TeamService,
  ) {}

  async inviteToMultipleUsers(
    teamId: string,
    invitedEmails: string[],
    sender: string,
  ): Promise<{ email: string; status: string; error?: string }[]> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      const team = await this.teamService.findTeamById(teamId);
      const teamName = team?.teamName || '팀';

      const results = await Promise.all(
        invitedEmails.map(async (email) => {
          try {
            const invitation = new this.invitationModel({
              teamId: new Types.ObjectId(teamId),
              invitedEmail: email,
              sender,
            });
            await invitation.save();

            const inviteLink = `http://kim-sun-woo.com:3000/api/invitation/acceptance/${invitation._id}`;

            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: `${sender}님이 '${teamName}'팀에 초대했습니다!`,
              text: `You have been invited to join ${teamName}. Click the link to accept: ${inviteLink}`,
              html: this.generateEmailTemplate(sender, teamName, inviteLink),

            });

            return { email, status: '메일 전송 성공' };
          } catch (error) {
            return { email, status: '메일 전송 실패', error: error.message };
          }
        }),
      );

      return results;
    } catch (error) {
      throw new Error(`Invitation processing failed: ${error.message}`);
    }
  }

  async acceptInviteWithoutUser(invitationId: string): Promise<string> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation || invitation.status !== 'pending') {
      throw new Error('유효하지 않거나 이미 수락된 초대입니다.');
    }

    invitation.status = 'accepted';
    await invitation.save();

    const user = await this.userModel.findOne({ email: invitation.invitedEmail });

    if (user) {
      await this.addUserToTeam(invitation.teamId.toString(), user._id.toString());
    }

    return '초대가 수락되었습니다.';
  }

  async addUserToTeam(teamId: string, userId: string): Promise<void> {
    const team = await this.teamModel.findById(new Types.ObjectId(teamId));
    if (!team) {
      throw new Error('팀을 찾을 수 없습니다.');
    }

    const userIdObject = new Types.ObjectId(userId);
    if (!team.users.some((user) => user.equals(userIdObject))) {
      team.users.push(userIdObject);
      await team.save();
    }
  }

  async findInvitationById(id: string): Promise<Invitation | null> {
    return this.invitationModel.findById(id).exec();
  }

  async getTeamName(teamId: Types.ObjectId): Promise<{ teamName: string }> {
    const team = await this.teamService.findTeamById(teamId.toString());
    if (!team) {
      throw new Error('팀을 찾을 수 없습니다.');
    }
    return { teamName: team.teamName };
  }

  private generateEmailTemplate(sender: string, teamName: string, inviteLink: string): string {
    return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff;">
            <tr>
                <td style="padding: 40px 20px; text-align: center;">
                    <!-- 배경 이미지를 테이블 셀의 배경으로 설정 -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="
                        background-image: url('https://spread-puzzle-bucket.s3.ap-northeast-2.amazonaws.com/app-images/Puzlle-mail-template.png');
                        background-repeat: no-repeat;
                        background-position: center;
                        background-size: cover;
                        height: 700px;
                        border-radius: 10px;">
                        <tr>
                            <td style="padding-top: 30%; text-align: center;">
                                <p style="font-size: 28px; font-weight: bold; color: #333; margin: 0;">
                                    ${sender}님이 보낸 초대장입니다
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 15%; text-align: center;">
                                <p style="font-size: 20px; color: #333; margin: 30px 0;">
                                    <strong>'${teamName}'</strong>에 당신을 초대합니다!
                                </p>
                                <p style="font-size: 20px; color: #333; margin: 10px 0;">
                                    당신의 독창적인 아이디어와 열정이
                                </p>
                                <p style="font-size: 20px; color: #333; margin: 10px 0;">
                                    팀을 더욱 빛나게 할 것이라 믿습니다.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 40px; text-align: center;">
                                    <form action="${inviteLink}" method="POST" style="margin: 0; display: inline;">
                                            <button type="submit"style="
                                    display: inline-block;
                                    background-color: #4f46e5;
                                    color: #ffffff;
                                    padding: 15px 20px;
                                    font-size: 16px;
                                    border-radius: 5px;
                                    text-decoration: none;
                                    margin: 20px 0;">
                                                팀 참여하기
                                            </button>
                                         </form>   
                                <p style="font-size: 20px; font-weight: bold; color: #333; margin: 30px 0;">
                                    지금 바로 초대를 수락하고 Puzzle을 시작해보세요!
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>`;
}
}
