// src/teams/teams.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from './teams.schema';
import { TeamService } from './teams.service';
import { TeamController } from './teams.controller';
import { UsersModule } from '../users/users.module'; // UsersModule 임포트

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    UsersModule, // UsersModule 추가
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
