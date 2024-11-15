// src/teams/team.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team } from './teams.schema';
import { TeamDto } from './teams.dto';
import { User } from 'src/users/users.schema';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createTeam(teamDto: TeamDto, userId: string): Promise<Team> {
    const team = new this.teamModel({
      ...teamDto,
      users: [new Types.ObjectId(userId)],
      createdDate: new Date(),
      updatedDate: new Date(),
    });
    return team.save();
  }

  async findTeamsByUserId(userId: string): Promise<Team[]> {
    return this.teamModel.find({ users: new Types.ObjectId(userId) }).exec();
  }

  async addUserToTeam(teamId: Types.ObjectId, userId: string): Promise<Team> {
    return this.teamModel.findByIdAndUpdate(
      teamId,
      { $addToSet: { users: new Types.ObjectId(userId) } },
      { new: true },
    );
  }

  async getTeamUsers(teamId: string): Promise<User[]> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      throw new NotFoundException('팀을 찾을 수 없습니다.');
    }
    const users = await this.userModel.find({ _id: { $in: team.users } }).exec();
    return users;
  }

  async updateTeamName(teamId: string, teamName: string): Promise<Team> {
    const team = await this.teamModel.findByIdAndUpdate(
      teamId,
      { teamName, updatedDate: new Date() },
      { new: true },
    );
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async deleteTeam(teamId: string): Promise<void> {
    const result = await this.teamModel.findByIdAndDelete(teamId).exec();
    if (!result) {
      throw new NotFoundException('Team not found');
    }
  }

  // teamId로 팀을 조회하는 메서드 추가
  async findTeamById(teamId: string): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }
}
