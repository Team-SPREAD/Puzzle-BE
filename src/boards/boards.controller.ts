import { Request } from 'express';
import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BoardService } from './boards.service';
import { BoardDto } from './boards.dto';
import { S3Service } from '../aws/s3/s3.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody, ApiConsumes, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Team } from 'src/teams/teams.schema';
import axios from 'axios';
import { TeamService } from 'src/teams/teams.service';
import { Types } from 'mongoose';
import * as jwt from 'jsonwebtoken';

@ApiTags('Boards')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly s3Service: S3Service,
    private readonly teamService: TeamService, // TeamService 주입
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


  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '사용자의 모든 보드 조회',
    description: '사용자가 속한 모든 팀에서 가진 보드들을 조회합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)'
  })
  @ApiResponse({
    status: 200,
    description: '모든 보드 목록 조회 성공',
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
  async getMyAllBoards(@Req() req: Request) {
    const userId = req.user['id'];
    return this.boardService.findMyAllBoardsByUser(userId);
  }




  @Patch('/currentStep/:id')
  @ApiOperation({
    summary: '보드 단계 업데이트',
    description: '보드의 현재 진행 중인 단계를 업데이트합니다.<br>(JWT 토큰 및 Liveblocks 토큰 인증이 필요합니다 - 헤더에 포함할 것!)',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '업데이트할 보드의 고유 ID',
    example: '60d9f6f10c1a1b2f7c3d9a20',
  })
  @ApiBody({
    description: '업데이트할 단계 정보',
    schema: {
      type: 'object',
      properties: {
        currentStep: {
          type: 'number',
          description: '새로운 현재 단계 값',
          example: 2,
        },
      },
      required: ['currentStep'],
    },
  })
  @ApiHeader({
    name: 'liveblocks-token',
    description: 'Liveblocks 인증 토큰',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '단계 업데이트 성공!',
    schema: { example: { message: 'currentStep 업데이트 완료!' } },
  })
  @ApiResponse({ status: 404, description: '보드를 찾을 수 없습니다.' })
  @ApiResponse({
    status: 401,
    description: '유효하지 않은 Liveblocks 토큰입니다.',
  })
  async updateCurrentStep(
    @Param('id') boardId: string,
    @Body('currentStep') currentStep: string,
    @Req() req: Request,
  ) {
    const parsedStep = Number(currentStep);
  
    if (isNaN(parsedStep)) {
      throw new BadRequestException('currentStep는 숫자여야 합니다.');
    }
  
    // 1. Liveblocks 토큰 확인
    const liveblocksToken = req.headers['liveblocks-token'] as string;
    if (!liveblocksToken) {
      throw new BadRequestException('Liveblocks 토큰이 필요합니다.');
    }
  
    // 2. Liveblocks 토큰 검증
    const isTokenValid = await this.verifyLiveblocksToken(liveblocksToken, boardId);
    if (!isTokenValid) {
      throw new UnauthorizedException('유효하지 않은 Liveblocks 토큰입니다.');
    }
  
    // 3. 단계 업데이트
    await this.boardService.updateCurrentStep(boardId, parsedStep);
  
    return { message: 'currentStep 업데이트 완료!' };
  }


@Post('/token')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth() // Swagger에 JWT 인증 표시
@ApiOperation({
  summary: 'Liveblocks 방 토큰 발급',
  description: '방 ID(roomId)를 기반으로 사용자가 방에 대한 권한이 있는지 확인하고, Liveblocks 방에 접속할 수 있는 토큰을 발급합니다.<br>(JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)',
})
@ApiBody({
  description: '방 토큰 발급 요청 데이터',
  schema: {
    type: 'object',
    properties: {
      roomId: {
        type: 'string',
        description: '방의 고유 ID',
        example: 'room-123',
      },
    },
    required: ['roomId'],
  },
})
@ApiResponse({
  status: 201,
  description: '토큰 발급 성공',
  schema: {
    example: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  },
})
@ApiResponse({
  status: 400,
  description: '유효하지 않은 요청 데이터 (roomId 누락)',
  schema: {
    example: {
      statusCode: 400,
      message: 'roomId는 필수입니다.',
    },
  },
})
@ApiResponse({
  status: 401,
  description: '인증 실패 또는 권한 없음',
  schema: {
    example: {
      statusCode: 401,
      message: '사용자 인증이 필요합니다.',
    },
  },
})
@ApiResponse({
  status: 404,
  description: '방 또는 팀을 찾을 수 없음',
  schema: {
    example: {
      statusCode: 404,
      message: '해당 방을 찾을 수 없습니다.',
    },
  },
})
@ApiResponse({
  status: 500,
  description: '내부 서버 오류',
  schema: {
    example: {
      statusCode: 500,
      message: 'Internal server error',
    },
  },
})
@Post('/token')
@UseGuards(AuthGuard('jwt'))
async generateRoomToken(@Body('roomId') roomId: string, @Req() req) {
  // 1. roomId 검증
  if (!roomId) {
    throw new BadRequestException('roomId는 필수입니다.');
  }
  if (!Types.ObjectId.isValid(roomId)) {
    throw new BadRequestException('유효하지 않은 roomId 형식입니다.');
  }

  const userId = req.user.id;
  if (!userId) {
    throw new UnauthorizedException('사용자 인증이 필요합니다.');
  }

  // 2. roomId로 보드 찾기
  const board = await this.boardService.findBoardById(roomId);
  if (!board) {
    throw new NotFoundException('해당 방을 찾을 수 없습니다.');
  }

  // 3. 팀 정보 가져오기
  const team = await this.teamService.findTeamById(board.team.toString());
  if (!team) {
    throw new NotFoundException('해당 보드와 연결된 팀을 찾을 수 없습니다.');
  }

  // 4. 사용자가 팀에 속해 있는지 확인
  const isUserInTeam = team.users.some(user => user.toString() === userId);
  if (!isUserInTeam) {
    throw new UnauthorizedException('해당 방에 대한 권한이 없습니다.');
  }

  // 5. Liveblocks API 호출
  const secretKey = process.env.LIVEBLOCKS_SECRET_KEY;
  const apiUrl = 'https://api.liveblocks.io/v2/authorize-user';

  const response = await axios.post(
    apiUrl,
    {
      userId,
      userInfo: {
        name: req.user.firstName + ' ' + req.user.lastName,
        avatar: req.user.avatar,
      },
      permissions: {
        [roomId]: ['room:write'],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    },
  );

  // 6. 응답 반환
  return { token: response.data.token };
}


// Liveblocks 토큰 검증 메서드
private async verifyLiveblocksToken(token: string, boardId: string): Promise<boolean> {
  try {
    const decoded = jwt.decode(token) as any;

    console.log('디코딩된 토큰:', decoded);

    // 1. roomId 확인
    const permissions = decoded?.perms || {};
    if (!permissions[boardId]?.includes('room:write')) {
      console.error('토큰에 room:write 권한 없음');
      return false;
    }

    // 2. 토큰 만료 확인
    const now = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)
    if (decoded.exp && decoded.exp < now) {
      console.error('토큰 만료됨');
      return false;
    }

    console.log('Liveblocks 토큰 유효성 확인 완료');
    return true;
  } catch (error) {
    console.error('Liveblocks 토큰 검증 실패:', error.message);
    return false;
  }
}

}
