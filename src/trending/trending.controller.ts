import { 
  Controller, 
  Get, 
  Query, 
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TrendingService } from './trending.service';
import { 
  TrendingHashtagsResponseDto, 
  TrendingTopicsResponseDto 
} from './dto/trending-response.dto';

@ApiTags('trending')
@Controller('trending')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Get('hashtags')
  @ApiOperation({ summary: 'Get trending hashtags' })
  @ApiQuery({ name: 'platform', required: true, description: 'Social media platform' })
  @ApiQuery({ name: 'category', required: false, description: 'Content category' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trending hashtags retrieved successfully',
    type: TrendingHashtagsResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid platform or category' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTrendingHashtags(
    @Query('platform') platform: string,
    @Query('category') category?: string,
  ) {
    if (!platform) {
      throw new BadRequestException('Platform parameter is required');
    }

    try {
      return await this.trendingService.getTrendingHashtags(platform, category);
    } catch (error) {
      throw new BadRequestException('Failed to get trending hashtags');
    }
  }

  @Get('topics')
  @ApiOperation({ summary: 'Get trending topics' })
  @ApiQuery({ name: 'platform', required: true, description: 'Social media platform' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trending topics retrieved successfully',
    type: TrendingTopicsResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid platform' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTrendingTopics(@Query('platform') platform: string) {
    if (!platform) {
      throw new BadRequestException('Platform parameter is required');
    }

    try {
      return await this.trendingService.getTrendingTopics(platform);
    } catch (error) {
      throw new BadRequestException('Failed to get trending topics');
    }
  }
}
