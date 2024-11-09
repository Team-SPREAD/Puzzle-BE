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

  // 초대 생성 및 이메일 전송
  async inviteToTeam(teamId: string, invitedEmail: string): Promise<Invitation> {
    const invitation = new this.invitationModel({
      teamId: new Types.ObjectId(teamId),
      invitedEmail,
    });
    await invitation.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const inviteLink = `http://localhost:3000/invitations/accept/${invitation._id}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: invitedEmail,
      subject: 'Team Invitation',
      text: `You have been invited to join a team. Click the link to accept: ${inviteLink}`,
      html: `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
      <img src="https://private-user-images.githubusercontent.com/114386406/382481320-4c5c1b24-499a-4f53-9861-bdc4f2c9b0ca.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzExOTAyOTUsIm5iZiI6MTczMTE4OTk5NSwicGF0aCI6Ii8xMTQzODY0MDYvMzgyNDgxMzIwLTRjNWMxYjI0LTQ5OWEtNGY1My05ODYxLWJkYzRmMmM5YjBjYS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMTA5JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTEwOVQyMjA2MzVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT02OWFjZDJiZmRkOTI4NDc0NWNmYjE4ZjhkOWJiYjM4MzNhZGU5MmJmNDdhYzk4OTMwMjQ2ZTE0OGM5NTM1ODI4JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.YNG--9XH6QoFWUo0WeNFOEOCDFsJauVIOwInmk01ZFY" alt="Service Logo" style="width: 360px; height: auto;">
      <h2 style="color: #007bff; margin-top: 20px;">You've been invited to join our team!</h2>
    </div>
    <div style="padding: 20px;">
      <p>Hi there!</p>
      <p>We're excited to invite you to join our team. This invitation allows you to collaborate with us and be part of something amazing.</p>
      <p>To accept the invitation and join our team, please click the button below:</p>
      <div style="text-align: center; margin: 20px;">
        <a href="${inviteLink}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Accept Invitation</a>
      </div>
      <p>If the button above doesn’t work, please copy and paste the following URL into your browser:</p>
      <p style="word-break: break-all;"><a href="${inviteLink}">${inviteLink}</a></p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #888;">If you have any questions, please contact us at https://spread-puzzle.io.</p>
    </div>
  </div>
`,

    });

    return invitation;
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
