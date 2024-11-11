// src/boards/boards.controller.ts
import { Body, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BoardService } from './boards.service';
import { BoardDto } from './boards.dto';
import { S3Service } from '../aws/s3/s3.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Boards')
@ApiBearerAuth()
@Controller('api/board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly s3Service: S3Service
  ) {}

  @Post()
  //@UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '보드 생성', description: '새로운 보드를 생성합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)' })
  @ApiResponse({ status: 201, description: '보드 생성 완료!', schema: { example: { message: '보드 생성 완료!' } } })
  @UseInterceptors(FileInterceptor('boardImg'))
  async createBoard(
    @Body() boardDto: BoardDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ) {
    let boardImgUrl: string | null = null;
    if (file) {
      const uploadResult = await this.s3Service.uploadSingleFile(file);
      boardImgUrl = uploadResult.url;
    }

    // 보드 생성
    await this.boardService.createBoard({ ...boardDto, boardImgUrl });
    
    // 성공 메시지 반환
    return { message: '보드 생성 완료!' };
  }
}
