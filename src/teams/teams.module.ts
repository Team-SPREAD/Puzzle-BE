// src/teams/teams.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from './teams.schema';
import { TeamService } from './teams.service';
import { TeamController } from './teams.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    UsersModule,
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService, MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }])], 
})
export class TeamModule {}
