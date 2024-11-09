// src/teams/team.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team } from './teams.schema';
import { TeamDto } from './teams.dto';

@Injectable()
export class TeamService {
  constructor(@InjectModel(Team.name) private readonly teamModel: Model<Team>) {}

  async createTeam(teamDto: TeamDto, userId: string): Promise<Team> {
    const team = new this.teamModel({
      ...teamDto,
      users: [new Types.ObjectId(userId)], // ObjectId로 변환하여 저장
      createdDate: new Date(),
      updatedDate: new Date(),
    });
    return team.save();
  }

  // 사용자가 속한 모든 팀을 조회하는 메서드 (ObjectId로 검색)
  async findTeamsByUserId(userId: string): Promise<Team[]> {
    return this.teamModel.find({ users: new Types.ObjectId(userId) }).exec();
  }
}
