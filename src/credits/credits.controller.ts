import { 
  Controller, 
  Get, 
  Post, 
  Query, 
  Body, 
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreditsService } from './credits.service';
import { DeductCreditsDto } from './dto/deduct-credits.dto';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { 
  CreditsBalanceResponseDto, 
  CreditsHistoryResponseDto, 
  PurchaseCreditsResponseDto 
} from './dto/credits-response.dto';

@ApiTags('credits')
@Controller('credits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get user credit balance' })
  @ApiResponse({ 
    status: 200, 
    description: 'Credit balance retrieved successfully',
    type: CreditsBalanceResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBalance(@Request() req: any) {
    return await this.creditsService.getBalance(req.user);
  }

  @Post('deduct')
  @ApiOperation({ summary: 'Deduct credits from user account' })
  @ApiResponse({ 
    status: 200, 
    description: 'Credits deducted successfully',
    type: CreditsBalanceResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Insufficient credits' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deductCredits(
    @Request() req: any,
    @Body() deductCreditsDto: DeductCreditsDto,
  ) {
    try {
      return await this.creditsService.deductCredits(req.user, deductCreditsDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to deduct credits');
    }
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user credit transaction history' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transaction history retrieved successfully',
    type: CreditsHistoryResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactionHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    return await this.creditsService.getTransactionHistory(req.user, pageNum, limitNum);
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Purchase credits' })
  @ApiResponse({ 
    status: 200, 
    description: 'Checkout session created successfully',
    type: PurchaseCreditsResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async purchaseCredits(
    @Request() req: any,
    @Body() purchaseCreditsDto: PurchaseCreditsDto,
  ) {
    try {
      return await this.creditsService.purchaseCredits(req.user, purchaseCreditsDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create purchase session');
    }
  }
}
