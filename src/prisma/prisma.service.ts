import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    await this.$transaction([
      // 🔥 Delete children first
      this.usageLog.deleteMany(),
      this.predictionResult.deleteMany(),
      this.prediction.deleteMany(),
      this.physicsMathTask.deleteMany(),
      this.analyticsEvent.deleteMany(),
      this.schedule.deleteMany(),

      // 🔥 Parent last
      this.user.deleteMany(),
    ]);
  }
}
