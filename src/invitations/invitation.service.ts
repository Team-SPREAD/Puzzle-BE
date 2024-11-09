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
      html: `<p>You have been invited to join a team.</p><p><a href="${inviteLink}">Accept Invitation</a></p>`,
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
