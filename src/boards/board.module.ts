// src/boards/board.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardController } from './boards.controller';
import { BoardService } from './boards.service';
import { Board, BoardSchema } from './boards.schema';
import { S3Service } from '../aws/s3/s3.service';
import { ConfigModule } from '@nestjs/config'; 
import { TeamModule } from 'src/teams/teams.module';

@Module({
  imports: [
    ConfigModule, 
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
    TeamModule, 
  ],
  controllers: [BoardController],
  providers: [BoardService, S3Service],
  exports: [BoardService],
})
export class BoardModule {}
