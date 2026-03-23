import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeductCreditsDto {
  @ApiProperty({ description: 'Number of credits to deduct', example: 1 })
  @IsInt()
  @IsPositive()
  amount: number;
}
