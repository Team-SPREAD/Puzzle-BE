import { Controller, Param, Post, UploadedFile, UseGuards, UseInterceptors, Req, BadRequestException, UnauthorizedException, Get, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StepsService } from './steps.service';
import { S3Service } from '../aws/s3/s3.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiConsumes, ApiParam, ApiBody, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Types } from 'mongoose';
import { Request } from 'express'
import { HttpService } from '@nestjs/axios';
import * as jwt from 'jsonwebtoken';

@ApiTags('Steps')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/step')
export class StepsController {
  constructor(
    private readonly stepsService: StepsService,
    private readonly s3Service: S3Service,
    private readonly httpService: HttpService, 
  ) {}

  @Post(':boardId/:stepNumber')
  @ApiOperation({
    summary: '단계 이미지 저장',
    description: '3~9단계의 이미지를 저장합니다. Liveblocks 토큰이 필요합니다.<br>(추가로 사용자 JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '단계 이미지 저장 완료!', schema: { example: { message: '단계 이미지 저장 완료!' } } })
  @ApiParam({ name: 'boardId', description: '보드 ID' })
  @ApiParam({ name: 'stepNumber', description: '단계 번호 (3~9)' })
  @ApiHeader({
    name: 'liveblocks-token',
    description: 'Liveblocks 인증 토큰',
    required: true,
  })
  @UseInterceptors(FileInterceptor('stepImg'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stepImg: {
          type: 'string',
          format: 'binary',
          description: '단계 이미지 파일',
        },
      },
    },
  })
  async saveStepImage(
    @Param('boardId') boardId: string,
    @Param('stepNumber') stepNumber: string, // 문자열로 받음
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const validSteps = [3, 4, 5, 6, 7, 8, 9];
    const parsedStepNumber = Number(stepNumber); // 숫자로 변환
  
    if (!validSteps.includes(parsedStepNumber)) {
      throw new BadRequestException(`유효하지 않은 단계 번호입니다: ${stepNumber}. 유효한 단계는 ${validSteps.join(', ')}입니다.`);
    }
  
    if (!file) {
      throw new BadRequestException('이미지가 제공되지 않았습니다.');
    }
  
    const liveblocksToken = req.headers['liveblocks-token'] as string;
    if (!liveblocksToken) {
      throw new BadRequestException('Liveblocks 토큰이 필요합니다.');
    }
  
    const isTokenValid = await this.verifyLiveblocksToken(liveblocksToken, boardId);
    if (!isTokenValid) {
      throw new UnauthorizedException('유효하지 않은 Liveblocks 토큰입니다.');
    }
  
    const boardObjectId = new Types.ObjectId(boardId);
  
    const uploadResult = await this.s3Service.uploadSingleFile(file);
    const stepImgUrl = uploadResult.url;
  
    const step = await this.stepsService.saveStepImage(boardObjectId, parsedStepNumber, stepImgUrl);
  
    return { message: `단계 ${stepNumber} 이미지 저장 완료!` };
  }

@Get(':boardId/result')
@ApiOperation({
  summary: '단계 결과 조회',
  description: '해당 보드의 최종 결과 데이터를 반환합니다. Liveblocks 토큰이 필요합니다.<br>(추가로 사용자 JWT 토큰 인증이 필요합니다 - 헤더에 포함할 것!)',
})
@ApiParam({ name: 'boardId', description: '결과를 조회할 보드 ID' })
@ApiHeader({
  name: 'liveblocks-token',
  description: 'Liveblocks 인증 토큰',
  required: true,
})
@ApiResponse({
  status: 200,
  description: '결과 조회 성공',
  schema: {
    example: {
      boardId: '60d9f6f10c1a1b2f7c3d9a20',
      result: 'Markdown 형식의 최종 결과물',
    },
  },
})
@ApiResponse({
  status: 404,
  description: '보드를 찾을 수 없습니다.',
})
@ApiResponse({
  status: 401,
  description: '유효하지 않은 Liveblocks 토큰입니다.',
})
async getResult(@Param('boardId') boardId: string, @Req() req: Request) {
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

  // 3. 단계 결과 조회
  const step = await this.stepsService.findStepByBoardId(boardId);

  if (!step) {
    throw new NotFoundException('해당 보드와 관련된 결과를 찾을 수 없습니다.');
  }

  return {
    boardId,
    result: step.result || '결과가 아직 생성되지 않았습니다.',
  };
}

private async verifyLiveblocksToken(token: string, boardId: string): Promise<boolean> {
  try {
    console.log('Liveblocks 토큰 디코딩 시작');
    const decoded = jwt.decode(token) as any;

    console.log('디코딩된 토큰:', decoded);

    // 1. 토큰 내 roomId 확인
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
    console.error('토큰 검증 실패:', error.message);
    return false;
  }
}
}