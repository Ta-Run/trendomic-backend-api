import { 
  Controller, 
  Post, 
  Get, 
  Query, 
  Body, 
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GenerationService } from './generation.service';
import { GenerateDto } from './dto/generate.dto';

@ApiTags('generation')
@Controller('generation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate social media content' })
  @ApiResponse({ status: 200, description: 'Content generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Insufficient credits or invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generate(
    @Request() req: any,
    @Body() generateDto: GenerateDto,
  ) {
    try {
      return await this.generationService.generate(req.user.id, generateDto);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to generate content');
    }
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user generation history' })
  @ApiResponse({ status: 200, description: 'Generation history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return await this.generationService.getHistory(req.user.id, pageNum, limitNum);
  }
}
