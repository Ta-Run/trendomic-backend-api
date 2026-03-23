import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateDto {
  @ApiProperty({ example: 'instagram' })
  @IsIn(['instagram', 'youtube', 'twitter'])
  platform: string;

  @ApiProperty({ example: 'fitness motivation' })
  @IsString()
  topic: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niche?: string;
}
