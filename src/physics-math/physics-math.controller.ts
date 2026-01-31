import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PhysicsMathService } from './physics-math.service';
import { VectorComputeDto } from './dto/vector.dto';
import { MatrixComputeDto } from './dto/matrix.dto';
import { OdeComputeDto } from './dto/ode.dto';
import { PdeComputeDto } from './dto/pde.dto';
import { NumericalComputeDto } from './dto/numerical.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('compute')
@UseGuards(JwtAuthGuard)
export class PhysicsMathController {
  constructor(private physicsMath: PhysicsMathService) {}

  @Post('vector')
  vector(@Body() dto: VectorComputeDto, @CurrentUser('id') userId: string) {
    return this.physicsMath.computeVector(userId, dto);
  }

  @Post('matrix')
  matrix(@Body() dto: MatrixComputeDto, @CurrentUser('id') userId: string) {
    return this.physicsMath.computeMatrix(userId, dto);
  }

  @Post('ode')
  ode(@Body() dto: OdeComputeDto, @CurrentUser('id') userId: string) {
    return this.physicsMath.computeOde(userId, dto);
  }

  @Post('pde')
  pde(@Body() dto: PdeComputeDto, @CurrentUser('id') userId: string) {
    return this.physicsMath.computePde(userId, dto);
  }

  @Post('numerical')
  numerical(@Body() dto: NumericalComputeDto, @CurrentUser('id') userId: string) {
    return this.physicsMath.computeNumerical(userId, dto);
  }
}
