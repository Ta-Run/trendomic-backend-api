import { ApiProperty } from '@nestjs/swagger';

export class CreditsBalanceResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    balance: number;
  };
}

export class CreditsHistoryResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    transactions: any[];
    total: number;
    page: number;
    limit: number;
  };
}

export class PurchaseCreditsResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    sessionId: string;
    url: string;
  };
}
