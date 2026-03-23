import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(private prisma: PrismaService) {}

  async createTemplate(user: User, dto: CreateTemplateDto) {
    this.logger.log(`Creating template for user ${user.id}: ${dto.name}`);

    const template = await this.prisma.template.create({
      data: {
        userId: user.id,
        name: dto.name,
        platform: dto.platform,
        topic: dto.topic,
        description: dto.description,
        isPublic: dto.isPublic || false,
      },
    });

    this.logger.log(`Successfully created template ${template.id} for user ${user.id}`);

    return {
      success: true,
      data: {
        ...template,
        createdAt: template.createdAt.toISOString(),
      },
    };
  }

  async getTemplates(user: User, page: number = 1, limit: number = 10) {
    this.logger.log(`Getting templates for user ${user.id}, page: ${page}, limit: ${limit}`);

    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where: {
          OR: [
            { userId: user.id },
            { isPublic: true },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.template.count({
        where: {
          OR: [
            { userId: user.id },
            { isPublic: true },
          ],
        },
      }),
    ]);

    return {
      success: true,
      data: {
        templates: templates.map(template => ({
          ...template,
          createdAt: template.createdAt.toISOString(),
        })),
        total,
        page,
        limit,
      },
    };
  }

  async getTemplateById(user: User, id: string) {
    this.logger.log(`Getting template ${id} for user ${user.id}`);

    const template = await this.prisma.template.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          { isPublic: true },
        ],
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return {
      success: true,
      data: {
        ...template,
        createdAt: template.createdAt.toISOString(),
      },
    };
  }

  async updateTemplate(user: User, id: string, dto: UpdateTemplateDto) {
    this.logger.log(`Updating template ${id} for user ${user.id}`);

    // Check if template exists and belongs to user
    const existingTemplate = await this.prisma.template.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTemplate) {
      throw new NotFoundException('Template not found or you do not have permission to update it');
    }

    const updatedTemplate = await this.prisma.template.update({
      where: { id },
      data: dto,
    });

    this.logger.log(`Successfully updated template ${id} for user ${user.id}`);

    return {
      success: true,
      data: {
        ...updatedTemplate,
        createdAt: updatedTemplate.createdAt.toISOString(),
      },
    };
  }

  async deleteTemplate(user: User, id: string) {
    this.logger.log(`Deleting template ${id} for user ${user.id}`);

    // Check if template exists and belongs to user
    const existingTemplate = await this.prisma.template.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTemplate) {
      throw new NotFoundException('Template not found or you do not have permission to delete it');
    }

    await this.prisma.template.delete({
      where: { id },
    });

    this.logger.log(`Successfully deleted template ${id} for user ${user.id}`);

    return {
      success: true,
      data: {
        message: 'Template deleted successfully',
      },
    };
  }

  async seedTemplates() {
    this.logger.log('Seeding initial templates');

    const seedData = [
      {
        name: 'Fitness Motivation',
        platform: 'instagram',
        topic: 'fitness motivation',
        description: 'Perfect for fitness influencers and gym enthusiasts',
        isPublic: true,
        usageCount: 0,
      },
      {
        name: 'Tech Reviews',
        platform: 'youtube',
        topic: 'technology reviews',
        description: 'Ideal for tech reviewers and gadget enthusiasts',
        isPublic: true,
        usageCount: 0,
      },
      {
        name: 'Travel Vlog',
        platform: 'tiktok',
        topic: 'travel adventures',
        description: 'Great for travel vloggers and adventure seekers',
        isPublic: true,
        usageCount: 0,
      },
      {
        name: 'Food Content',
        platform: 'instagram',
        topic: 'food recipes',
        description: 'Perfect for food bloggers and chefs',
        isPublic: true,
        usageCount: 0,
      },
      {
        name: 'Business Tips',
        platform: 'linkedin',
        topic: 'business advice',
        description: 'Professional business and entrepreneurship content',
        isPublic: true,
        usageCount: 0,
      },
      {
        name: 'Fashion Style',
        platform: 'instagram',
        topic: 'fashion trends',
        description: 'Latest fashion trends and style tips',
        isPublic: true,
        usageCount: 0,
      },
      {
        name: 'Gaming Content',
        platform: 'youtube',
        topic: 'gaming videos',
        description: 'For gaming content creators and streamers',
        isPublic: true,
        usageCount: 0,
      },
      {
        name: 'Motivation Quotes',
        platform: 'instagram',
        topic: 'motivational quotes',
        description: 'Inspirational and motivational content',
        isPublic: true,
        usageCount: 0,
      },
      {
        name: 'Beauty Tips',
        platform: 'tiktok',
        topic: 'beauty tutorials',
        description: 'Makeup tutorials and beauty tips',
        isPublic: true,
        usageCount: 0,
      },
      {
        name: 'Finance Advice',
        platform: 'linkedin',
        topic: 'financial tips',
        description: 'Personal finance and investment advice',
        isPublic: true,
        usageCount: 0,
      },
    ];

    for (const template of seedData) {
      await this.prisma.template.upsert({
        where: {
          id: `seed_${template.name.replace(/\s+/g, '_').toLowerCase()}`,
        },
        update: {},
        create: {
          id: `seed_${template.name.replace(/\s+/g, '_').toLowerCase()}`,
          ...template,
        },
      });
    }

    this.logger.log('Successfully seeded initial templates');

    return {
      success: true,
      data: {
        message: 'Templates seeded successfully',
        count: seedData.length,
      },
    };
  }

  async incrementUsageCount(id: string) {
    this.logger.log(`Incrementing usage count for template ${id}`);

    await this.prisma.template.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  }
}
