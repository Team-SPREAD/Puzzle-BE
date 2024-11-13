// src/boards/boards.controller.ts
import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BoardService } from './boards.service';
import { BoardDto } from './boards.dto';
import { S3Service } from '../aws/s3/s3.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
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

  @Get('/:teamId')
  @ApiOperation({ summary: '팀의 모든 보드 조회', description: '특정 팀의 모든 보드를 조회합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)' })
  @ApiParam({
    name: 'teamId',
    required: true,
    description: '조회할 팀의 고유 ID (ObjectId 형식)',
    example: '60d9f6f10c1a1b2f7c3d9a20'
  })
  @ApiResponse({
    status: 200,
    description: '팀의 모든 보드 조회 성공!',
    schema: {
      example: [
        {
          "_id": "6734af252b7be406ab531132",
          "boardName": "TestBoard",
          "description": "테스트 보드입니다.(설명) ",
          "boardImgUrl": "https://보드이미지URL.png",
          "currentStep": "1",
          "createdDate": "2024-11-12T13:52:37.649Z",
          "updatedDate": "2024-11-13T13:52:37.649Z",
          "team": "67346c47ce80db054ae1234",
          "like": false,
          "__v": 0
      },
      {
        "_id": "6734af252b7be406ab535678",
          "boardName": "NiceBoard",
          "description": "나이스한 보드입니다.(설명) ",
          "boardImgUrl": "https://보드이미지URL.png",
          "currentStep": "3",
          "createdDate": "2024-11-11T13:52:37.649Z",
          "updatedDate": "2024-11-12T13:52:37.649Z",
          "team": "67346c47ce80db054ae5678",
          "like": true,
          "__v": 0
      }
    ]
    }
  })
  async getBoardsByTeamId(@Param('teamId') teamId: string) {
    return this.boardService.findBoardsByTeamId(teamId);
  }
}