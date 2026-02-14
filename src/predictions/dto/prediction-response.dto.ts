import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HashtagScoreDto {
  @ApiProperty()
  tag: string;

  @ApiProperty()
  score: number;

  @ApiPropertyOptional()
  tier?: string;

  @ApiPropertyOptional()
  reason?: string;
}

export class ScriptSuggestionDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  outline: string;

  @ApiPropertyOptional()
  hook?: string;
}

export class BestPostingTimeDto {
  @ApiProperty({ description: 'Suggested slot (e.g. 09:00-11:00)' })
  slot: string;

  @ApiProperty({ description: 'Confidence 0-1' })
  confidence: number;

  @ApiPropertyOptional()
  reason?: string;
}

export class TrafficForecastDto {
  @ApiProperty({ description: 'Minimum expected range' })
  min: number;

  @ApiProperty({ description: 'Maximum expected range' })
  max: number;

  @ApiProperty({ description: 'Confidence 0-1' })
  confidence: number;

  @ApiPropertyOptional()
  unit?: string;
}

export class ExplanationDto {
  @ApiProperty({ description: 'Why hashtags were selected' })
  hashtags: string;

  @ApiProperty({ description: 'Why posting time was chosen' })
  postingTime: string;

  @ApiProperty({ description: 'How confidence was calculated' })
  confidence: string;

  @ApiProperty({ description: 'Disclaimer text' })
  disclaimer: string;
}

export class CreatePredictionResponseDto {
  @ApiProperty()
  predictionId: string;

  @ApiProperty({ enum: ['PENDING', 'COMPLETED', 'FAILED'] })
  status: string;
}

export class PredictionResultDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ type: [HashtagScoreDto] })
  scoredHashtags?: HashtagScoreDto[];

  @ApiPropertyOptional({ type: [ScriptSuggestionDto] })
  scriptSuggestions?: ScriptSuggestionDto[];

  @ApiPropertyOptional()
  bestPostingTime?: BestPostingTimeDto;

  @ApiPropertyOptional()
  trafficForecast?: TrafficForecastDto;

  @ApiPropertyOptional()
  explanation?: ExplanationDto;

  @ApiPropertyOptional()
  modelVersion?: string;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional()
  failureReason?: string;
}

export class ExplainResponseDto {
  @ApiProperty()
  explanation: ExplanationDto;

  @ApiProperty({ description: 'Confidence scores by component' })
  confidenceScores: {
    hashtags: number;
    postingTime: number;
    traffic: number;
  };

  @ApiProperty({ description: 'Disclaimer text' })
  disclaimer: string;
}
