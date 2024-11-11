// src/boards/boards.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board } from './boards.schema';
import { BoardDto } from './boards.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<Board>,
  ) {}

  async createBoard(boardDto: BoardDto): Promise<Board> {
    const board = new this.boardModel({
      ...boardDto,
      createdDate: new Date(),
      updatedDate: new Date(),
    });
    return board.save();
  }
}