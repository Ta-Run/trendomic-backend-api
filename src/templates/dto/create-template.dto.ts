import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Fitness Motivation' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Social media platform', example: 'instagram' })
  @IsString()
  platform: string;

  @ApiProperty({ description: 'Topic or niche', example: 'fitness motivation' })
  @IsString()
  topic: string;

  @ApiProperty({ description: 'Template description', example: 'Perfect for fitness influencers' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Whether template is public', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
