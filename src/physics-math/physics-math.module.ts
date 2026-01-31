import { Module } from '@nestjs/common';
import { PhysicsMathService } from './physics-math.service';
import { PhysicsMathController } from './physics-math.controller';
import { VectorEngine } from './engines/vector.engine';
import { MatrixEngine } from './engines/matrix.engine';
import { OdeEngine } from './engines/ode.engine';
import { PdeEngine } from './engines/pde.engine';
import { NumericalEngine } from './engines/numerical.engine';

@Module({
  controllers: [PhysicsMathController],
  providers: [
    PhysicsMathService,
    VectorEngine,
    MatrixEngine,
    OdeEngine,
    PdeEngine,
    NumericalEngine,
  ],
  exports: [PhysicsMathService],
})
export class PhysicsMathModule {}
