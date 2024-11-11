// src/teams/teams.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class TeamDto {
  @ApiProperty({
    description: '생성할 팀의 이름',
    example: 'Team-Spread',
    required: true,
  })
  readonly teamName: string;

  readonly users?: string[];
}
