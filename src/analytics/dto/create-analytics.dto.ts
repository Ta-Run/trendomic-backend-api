import { IsString, IsOptional, IsObject, MinLength } from 'class-validator';

export class CreateAnalyticsDto {
  @IsString()
  @MinLength(1)
  event: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
