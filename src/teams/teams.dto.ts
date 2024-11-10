import { ApiProperty } from "@nestjs/swagger";

export class TeamDto {

    @ApiProperty()
    readonly teamName: string;
    @ApiProperty()
    readonly users?: string[];
  }
  