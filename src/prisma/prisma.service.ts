import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;
    await this.$transaction([
      this.physicsMathTask.deleteMany(),
      this.analyticsEvent.deleteMany(),
      this.schedule.deleteMany(),
      this.user.deleteMany(),
      this.role.deleteMany(),
    ]);
  }
}
