import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulingController {
  constructor(private scheduling: SchedulingService) {}

  @Post()
  create(
    @Body() dto: CreateScheduleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.scheduling.create(userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.scheduling.findAll(userId, role === UserRole.ADMIN);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.scheduling.findOne(id, userId, role === UserRole.ADMIN);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.scheduling.update(id, userId, role === UserRole.ADMIN, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.scheduling.remove(id, userId, role === UserRole.ADMIN);
  }
}
