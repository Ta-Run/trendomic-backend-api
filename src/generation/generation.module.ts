import { Module } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';
import { ScientificEngineModule } from '../scientific-engine/scientific-engine.module';

@Module({
  imports: [ScientificEngineModule],
  controllers: [GenerationController],
  providers: [GenerationService],
  exports: [GenerationService],
})
export class GenerationModule {}
