import { Module } from '@nestjs/common';
import { AiModule } from '../integrations/ai/ai.module';
import { PredictionsService } from './predictions.service'
import { PredictionsController } from './predictions.controller';

@Module({
  imports: [AiModule],
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
