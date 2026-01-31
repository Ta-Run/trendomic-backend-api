import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Post()
  create(
    @Body() dto: CreateAnalyticsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.analytics.create(userId, dto);
  }

  @Get('stats')
  getStats(@CurrentUser('id') userId: string, @CurrentUser('role') role: UserRole) {
    return this.analytics.getStats(userId, role === UserRole.ADMIN);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@CurrentUser('id') userId: string, @CurrentUser('role') role: UserRole) {
    return this.analytics.findAll(userId, role === UserRole.ADMIN);
  }

  @Get(':userId')
  findByUserId(
    @Param('userId') requestedUserId: string,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.analytics.findByUserId(requestedUserId, currentUserId, role === UserRole.ADMIN);
  }
}
