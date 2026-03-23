import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Query, 
  Body, 
  UseGuards,
  Request,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateResponseDto, TemplatesListResponseDto } from './dto/template-response.dto';

@ApiTags('templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ 
    status: 201, 
    description: 'Template created successfully',
    type: TemplateResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTemplate(
    @Request() req: any,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    try {
      return await this.templatesService.createTemplate(req.user, createTemplateDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create template');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates (public + user\'s own)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Templates retrieved successfully',
    type: TemplatesListResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTemplates(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    return await this.templatesService.getTemplates(req.user, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Template retrieved successfully',
    type: TemplateResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTemplateById(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    try {
      return await this.templatesService.getTemplateById(req.user, id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve template');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ 
    status: 200, 
    description: 'Template updated successfully',
    type: TemplateResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 400, description: 'Invalid input or no permission' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateTemplate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    try {
      return await this.templatesService.updateTemplate(req.user, id, updateTemplateDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update template');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ 
    status: 200, 
    description: 'Template deleted successfully',
    type: TemplateResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteTemplate(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    try {
      return await this.templatesService.deleteTemplate(req.user, id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete template');
    }
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed initial templates (admin only)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Templates seeded successfully',
    type: TemplateResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async seedTemplates() {
    return await this.templatesService.seedTemplates();
  }
}
