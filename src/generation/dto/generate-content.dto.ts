import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateContentDto {
  @ApiProperty({ description: 'Social media platform', example: 'instagram' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ description: 'Content topic', example: 'fitness motivation' })
  @IsString()
  @IsNotEmpty()
  topic: string;
}
