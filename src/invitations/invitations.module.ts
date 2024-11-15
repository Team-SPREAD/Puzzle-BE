// src/invitations/invitations.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { Invitation, InvitationSchema } from './invitation.schema';
import { TeamModule } from '../teams/teams.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invitation.name, schema: InvitationSchema }]),
    TeamModule, // TeamModule을 임포트하여 TeamService 접근 가능하게 설정
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
