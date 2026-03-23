import { IsInt, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseCreditsDto {
  @ApiProperty({ description: 'Number of credits to purchase', example: 50 })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Payment method token', example: 'pm_123456789' })
  @IsString()
  paymentMethodId: string;
}
