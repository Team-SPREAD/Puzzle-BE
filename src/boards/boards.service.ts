// src/boards/boards.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board } from './boards.schema';
import { BoardDto } from './boards.dto';
import { Team } from 'src/teams/teams.schema';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<Board>,
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
  ) {}

  async createBoard(boardDto: BoardDto): Promise<Board> {
    const board = new this.boardModel({
      ...boardDto,
      team: new Types.ObjectId(boardDto.teamId),
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

  async findBoardById(boardId: string): Promise<Board | null> {
    return this.boardModel.findById(new Types.ObjectId(boardId)).exec();
  }

  async findBoardCurrentStepById(boardId: string): Promise<number | null> {
    console.log('Service - Received boardId:', boardId);
  
    if (!Types.ObjectId.isValid(boardId)) {
      console.log('Service - Invalid ObjectId:', boardId);
      throw new BadRequestException('유효하지 않은 ObjectId 형식입니다.');
    }
  
    const result = await this.boardModel.findById(new Types.ObjectId(boardId)).select('currentStep').exec();
    console.log('Service - Query result:', result);
  
    // result가 null이 아닌 경우 currentStep 반환
    return result ? result.currentStep : null;
  }

  async updateBoard(
    boardId: string,
    updateData: Partial<BoardDto & { boardImgUrl?: string }>
  ): Promise<Board> {
    const updateFields: any = {
      ...updateData,
      updatedDate: new Date(),
    };

    if (updateData.boardImgUrl !== undefined) {
      updateFields.boardImgUrl = updateData.boardImgUrl;
    }

    const updatedBoard = await this.boardModel.findByIdAndUpdate(
      boardId,
      updateFields,
      { new: true }
    );

    if (!updatedBoard) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }

    return updatedBoard;
  }

  async deleteBoard(boardId: string): Promise<void> {
    const result = await this.boardModel.findByIdAndDelete(boardId).exec();
    if (!result) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }
  }

  async toggleLikeBoard(boardId: string): Promise<void> {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }

    board.like = !board.like;
    board.updatedDate = new Date();
    await board.save();
  }

  async findLikedBoardsByUser(userId: string): Promise<Board[]> {
    const teams = await this.teamModel.find({ users: new Types.ObjectId(userId) });
    const teamIds = teams.map(team => team._id);
    return this.boardModel.find({ team: { $in: teamIds }, like: true }).exec();
  }

  async findMyAllBoardsByUser(userId: string): Promise<Board[]> {
    const teams = await this.teamModel.find({ users: new Types.ObjectId(userId) });
    const teamIds = teams.map(team => team._id);
    return this.boardModel.find({ team: { $in: teamIds } }).exec();
  }


  async updateCurrentStep(boardId: string, currentStep: number): Promise<void> {
    const board = await this.boardModel.findByIdAndUpdate(
      boardId,
      { currentStep, updatedDate: new Date() },
      { new: true }
    );
  
    if (!board) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }
  }
}

