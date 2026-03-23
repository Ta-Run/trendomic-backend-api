import { ApiProperty } from '@nestjs/swagger';

export class TrendingHashtagsResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    platform: string;
    category?: string;
    hashtags: Array<{
      tag: string;
      score: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    cached: boolean;
    lastUpdated: string;
  };
}

export class TrendingTopicsResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    platform: string;
    topics: Array<{
      topic: string;
      description: string;
      engagement: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }>;
    cached: boolean;
    lastUpdated: string;
  };
}
