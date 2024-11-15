import { Request } from 'express';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BoardService } from './boards.service';
import { BoardDto } from './boards.dto';
import { S3Service } from '../aws/s3/s3.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Boards')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly s3Service: S3Service
  ) {}

  @Post()
  @ApiOperation({ summary: '보드 생성', description: '새로운 보드를 생성합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)' })
  @ApiConsumes('multipart/form-data')
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
        }
      ]
    }
  })
  async getBoardsByTeamId(@Param('teamId') teamId: string) {
    return this.boardService.findBoardsByTeamId(teamId);
  }

  
  @Patch('/:id')
  @ApiOperation({
    summary: '보드 수정',
    description: '기존 보드의 이름, 설명, 이미지 URL을 수정합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    required: true,
    description: '수정할 보드의 고유 ID',
    example: '60d9f6f10c1a1b2f7c3d9a20'
  })
  @ApiBody({
    description: '보드 수정 사항을 입력하세요.',
    schema: {
      type: 'object',
      properties: {
        boardName: {
          type: 'string',
          description: '새로운 보드 이름',
          example: 'Updated Board Name',
        },
        description: {
          type: 'string',
          description: '새로운 보드 설명',
          example: '업데이트된 보드 설명입니다.',
        },
        boardImg: {
          type: 'string',
          format: 'binary',
          description: '업로드할 새로운 보드 이미지 (선택 사항)',
        },
      },
      required: ['boardName', 'description'],
    },
  })
  @ApiResponse({ status: 200, description: '보드 수정 완료!', schema: { example: { message: '보드 수정 완료!' } } })
  @ApiResponse({ status: 404, description: '보드를 찾을 수 없습니다.' })
  @UseInterceptors(FileInterceptor('boardImg'))
  async updateBoard(
    @Param('id') boardId: string,
    @Body() boardDto: Partial<BoardDto>,
    @UploadedFile() file?: Express.Multer.File
  ) {
    let boardImgUrl: string | undefined;

    if (file) {
      const uploadResult = await this.s3Service.uploadSingleFile(file);
      boardImgUrl = uploadResult.url;
    }

    await this.boardService.updateBoard(boardId, { ...boardDto, boardImgUrl });

    return { message: '보드 수정 완료!' };
  }


  @Delete('/:id')
  @ApiOperation({
    summary: '보드 삭제',
    description: '보드 ID를 받아 해당 보드를 삭제합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '삭제할 보드의 고유 ID',
  })
  @ApiResponse({ status: 200, description: '보드 삭제 성공', schema: { example: { message: '보드 삭제 완료!' } } })
  async deleteBoard(@Param('id') boardId: string) {
    await this.boardService.deleteBoard(boardId);
    return { message: '보드 삭제 완료!' };
  }

  @Patch('/like/:id')
  @ApiOperation({ summary: '좋아요 토글', description: '보드의 좋아요 상태를 토글합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)' })
  @ApiParam({
    name: 'id',
    required: true,
    description: '좋아요를 토글할 보드의 고유 ID',
  })
  @ApiResponse({ status: 200, description: '좋아요 토글 성공', schema: { example: { message: '좋아요 토글 완료!' } } })
  async toggleLikeBoard(@Param('id') boardId: string) {
    await this.boardService.toggleLikeBoard(boardId);
    return { message: '좋아요 토글 완료!' };
  }

  @Get('/like/all')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '모든 좋아요 보드 조회',
    description: '사용자가 속한 모든 팀에서 좋아요가 설정된 보드를 조회합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)'
  })
  @ApiResponse({
    status: 200,
    description: '좋아요가 설정된 보드 목록 조회 성공',
    schema: {
      example: [
        {
          "_id": "6734af252b7be406ab531132",
          "boardName": "TestBoard",
          "description": "테스트 보드입니다.",
          "boardImgUrl": "https://보드이미지URL.png",
          "currentStep": "1",
          "createdDate": "2024-11-12T13:52:37.649Z",
          "updatedDate": "2024-11-13T13:52:37.649Z",
          "team": "67346c47ce80db054ae1234",
          "like": true,
          "__v": 0
        }
      ]
    }
  })
  async getLikedBoards(@Req() req: Request) {
    const userId = req.user['id'];
    return this.boardService.findLikedBoardsByUser(userId);
  }

  @Patch('/currentStep/:id')
@ApiOperation({
  summary: '보드 단계 업데이트',
  description: '보드의 현재 진행중인 단계를 업데이트합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)'
})
@ApiParam({
  name: 'id',
  required: true,
  description: '업데이트할 보드의 고유 ID',
  example: '60d9f6f10c1a1b2f7c3d9a20'
})
@ApiBody({
  description: '업데이트할 단계 정보',
  schema: {
    type: 'object',
    properties: {
      currentStep: {
        type: 'string',
        description: '새로운 현재 단계 값',
        example: '2'
      }
    },
    required: ['currentStep'],
  },
})
@ApiResponse({
  status: 200,
  description: '단계 업데이트 성공!',
  schema: { example: { message: 'currentStep 업데이트 완료!' } }
})
@ApiResponse({ status: 404, description: '보드를 찾을 수 없습니다.' })
async updateCurrentStep(
  @Param('id') boardId: string,
  @Body('currentStep') currentStep: string
) {
  await this.boardService.updateCurrentStep(boardId, currentStep);
  return { message: 'currentStep 업데이트 완료!' };
}


}
