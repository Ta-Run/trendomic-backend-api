import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateScheduleDto) {
    return this.prisma.schedule.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
      },
    });
  }

  async findAll(userId: string, isAdmin: boolean) {
    const where = isAdmin ? {} : { userId };
    return this.prisma.schedule.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string, userId: string, isAdmin: boolean) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (!isAdmin && schedule.userId !== userId) throw new ForbiddenException('Access denied');
    return schedule;
  }

  async update(id: string, userId: string, isAdmin: boolean, dto: UpdateScheduleDto) {
    await this.findOne(id, userId, isAdmin);
    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
      },
    });
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    await this.findOne(id, userId, isAdmin);
    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Schedule deleted' };
  }
}
