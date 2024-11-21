// src/invitations/invitations.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { Invitation, InvitationSchema } from './invitation.schema';
import { TeamModule } from '../teams/teams.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invitation.name, schema: InvitationSchema }]),
    UsersModule,
    TeamModule,
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
