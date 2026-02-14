import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export enum PlatformDto {
  INSTAGRAM = 'INSTAGRAM',
  YOUTUBE = 'YOUTUBE',
  X = 'X',
  LINKEDIN = 'LINKEDIN',
}

export enum ContentTypeDto {
  REEL = 'REEL',
  SHORT = 'SHORT',
  POST = 'POST',
  VIDEO = 'VIDEO',
}

export class CreatePredictionDto {
  @ApiProperty({ enum: PlatformDto, description: 'Target platform' })
  @IsEnum(PlatformDto)
  @IsNotEmpty()
  platform: PlatformDto;

  @ApiProperty({ enum: ContentTypeDto, description: 'Content format' })
  @IsEnum(ContentTypeDto)
  @IsNotEmpty()
  contentType: ContentTypeDto;

  @ApiProperty({ minLength: 1, maxLength: 500, description: 'Content topic' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  topic: string;

  @ApiPropertyOptional({ default: 'US', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({ default: 'UTC', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;
}
