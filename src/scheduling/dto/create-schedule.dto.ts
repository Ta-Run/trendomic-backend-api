import { IsString, IsOptional, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
