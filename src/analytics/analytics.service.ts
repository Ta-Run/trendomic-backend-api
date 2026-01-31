import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAnalyticsDto) {
    return this.prisma.analyticsEvent.create({
      data: {
        userId,
        event: dto.event,
        metadata: (dto.metadata ?? {}) as object,
      },
    });
  }

  async findAll(userId: string, isAdmin: boolean) {
    const where = isAdmin ? {} : { userId };
    return this.prisma.analyticsEvent.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async findByUserId(requestedUserId: string, currentUserId: string, isAdmin: boolean) {
    if (!isAdmin && requestedUserId !== currentUserId) {
      throw new ForbiddenException('You can only view your own analytics');
    }
    return this.prisma.analyticsEvent.findMany({
      where: { userId: requestedUserId },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async getStats(userId: string, isAdmin: boolean) {
    const where = isAdmin ? {} : { userId };
    const events = await this.prisma.analyticsEvent.findMany({
      where,
      select: { event: true, createdAt: true },
    });
    const byEvent = events.reduce<Record<string, number>>((acc, e) => {
      acc[e.event] = (acc[e.event] || 0) + 1;
      return acc;
    }, {});
    return {
      total: events.length,
      byEvent,
    };
  }
}
