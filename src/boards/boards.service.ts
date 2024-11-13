// src/boards/boards.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board } from './boards.schema';
import { BoardDto } from './boards.dto';
import { Team } from 'src/teams/teams.schema';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<Board>,
  ) {}

  async createBoard(boardDto: BoardDto): Promise<Board> {
    const board = new this.boardModel({
      ...boardDto,
      team: new Types.ObjectId(boardDto.teamId),  // teamId를 ObjectId로 변환
      currentStep: '1', 
      like: false,
      createdDate: new Date(),
      updatedDate: new Date(),
    });
    return board.save();
  }

  async findBoardsByTeamId(teamId: string): Promise<Board[]> {
    return this.boardModel.find({ team: new Types.ObjectId(teamId) }).exec();
  }
}
