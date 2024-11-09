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
    // 팀 조회
    const team = await this.teamModel.findById(teamId).exec();

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // users 배열의 ObjectId에 해당하는 모든 사용자 정보를 조회
    const users = await this.userModel.find({ _id: { $in: team.users } }).exec();

    return users;
  }
}
