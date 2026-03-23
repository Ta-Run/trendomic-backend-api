import { ApiProperty } from '@nestjs/swagger';

export class GenerationResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    id: string;
    platform: string;
    topic: string;
    result: any;
    creditsUsed: number;
    createdAt: string;
  };
}

export class GenerationHistoryResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    generations: any[];
    total: number;
    page: number;
    limit: number;
  };
}
