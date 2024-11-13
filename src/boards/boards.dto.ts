// src/boards/boards.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class BoardDto {
  @ApiProperty({
    description: '보드의 이름',
    example: 'TestBoard',
    required: true,
  })
  readonly boardName: string;
  
  @ApiProperty({
    description: '보드 설명',
    example: '이건 @@을 위한 보드입니다.',
    required: true,
  })
  readonly description: string;
  
  @ApiProperty({
    description: '업로드할 보드 이미지 파일(File 업로드 하시면 됩니다.)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  readonly boardImg: any;
  
  @ApiProperty({
    description: '팀 ID (보드를 생성할 팀의 고유 ID)',
    example: '60d9f6f10c1a1b2f7c3d9a20',
    required: true,
  })
  readonly teamId: string;
  
  
  readonly boardImgUrl?: string;
}
