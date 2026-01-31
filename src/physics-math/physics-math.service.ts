import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PhysicsMathTaskType, PhysicsMathTaskStatus } from '@prisma/client';
import { VectorEngine } from './engines/vector.engine';
import { MatrixEngine } from './engines/matrix.engine';
import { OdeEngine } from './engines/ode.engine';
import { PdeEngine } from './engines/pde.engine';
import { NumericalEngine } from './engines/numerical.engine';
import { VectorComputeDto } from './dto/vector.dto';
import { MatrixComputeDto, MatrixOperation } from './dto/matrix.dto';
import { OdeComputeDto } from './dto/ode.dto';
import { PdeComputeDto } from './dto/pde.dto';
import { NumericalComputeDto } from './dto/numerical.dto';

@Injectable()
export class PhysicsMathService {
  constructor(
    private prisma: PrismaService,
    private vectorEngine: VectorEngine,
    private matrixEngine: MatrixEngine,
    private odeEngine: OdeEngine,
    private pdeEngine: PdeEngine,
    private numericalEngine: NumericalEngine,
  ) {}

  async computeVector(userId: string, dto: VectorComputeDto, persist = true) {
    const vectors = dto.vectors.map((v) => v.values);
    let result: unknown;
    if (dto.coefficients && dto.coefficients.length === vectors.length) {
      result = this.vectorEngine.linearCombination(vectors, dto.coefficients);
    } else if (vectors.length === 2 && vectors[0].length === 3) {
      result = this.vectorEngine.cross(vectors[0], vectors[1]);
    } else if (vectors.length === 2) {
      result = this.vectorEngine.dot(vectors[0], vectors[1]);
    } else {
      result = this.vectorEngine.add(...vectors);
    }
    if (persist) {
      await this.prisma.physicsMathTask.create({
        data: {
          userId,
          taskType: PhysicsMathTaskType.VECTOR,
          inputData: dto as unknown as object,
          resultData: { result } as object,
          status: PhysicsMathTaskStatus.COMPLETED,
        },
      });
    }
    return { result };
  }

  async computeMatrix(userId: string, dto: MatrixComputeDto, persist = true) {
    let result: unknown;
    const A = dto.matrixA;
    const B = dto.matrixB;
    switch (dto.operation) {
      case MatrixOperation.MULTIPLY:
        if (!B) throw new BadRequestException('matrixB required for multiply');
        result = this.matrixEngine.multiply(A, B);
        break;
      case MatrixOperation.DETERMINANT:
        result = this.matrixEngine.determinant(A);
        break;
      case MatrixOperation.INVERSE:
        result = this.matrixEngine.inverse(A);
        break;
      case MatrixOperation.ADD:
        if (!B) throw new BadRequestException('matrixB required for add');
        result = this.matrixEngine.add(A, B);
        break;
      case MatrixOperation.TRANSPOSE:
        result = this.matrixEngine.transpose(A);
        break;
      default:
        throw new BadRequestException('Unknown matrix operation');
    }
    if (persist) {
      await this.prisma.physicsMathTask.create({
        data: {
          userId,
          taskType: PhysicsMathTaskType.MATRIX,
          inputData: dto as unknown as object,
          resultData: { result } as object,
          status: PhysicsMathTaskStatus.COMPLETED,
        },
      });
    }
    return { result };
  }

  async computeOde(userId: string, dto: OdeComputeDto, persist = true) {
    const method = dto.method ?? 'rk4';
    const result = this.odeEngine.solve(
      dto.equation,
      dto.x0,
      dto.y0,
      dto.xEnd,
      dto.stepSize,
      method,
    );
    if (persist) {
      await this.prisma.physicsMathTask.create({
        data: {
          userId,
          taskType: PhysicsMathTaskType.ODE,
          inputData: dto as unknown as object,
          resultData: result as object,
          status: PhysicsMathTaskStatus.COMPLETED,
        },
      });
    }
    return result;
  }

  async computePde(userId: string, dto: PdeComputeDto, persist = true) {
    const result = this.pdeEngine.solve(
      dto.type,
      dto.domainStart,
      dto.domainEnd,
      dto.tEnd,
      dto.stepX,
      dto.stepT,
      dto.initialCondition,
      dto.boundaryCondition,
    );
    if (persist) {
      await this.prisma.physicsMathTask.create({
        data: {
          userId,
          taskType: PhysicsMathTaskType.PDE,
          inputData: dto as unknown as object,
          resultData: result as object,
          status: PhysicsMathTaskStatus.COMPLETED,
        },
      });
    }
    return result;
  }

  async computeNumerical(userId: string, dto: NumericalComputeDto, persist = true) {
    const data = dto.data ?? [];
    const result = this.numericalEngine.compute(
      dto.operation,
      data,
      dto.params as Record<string, number | number[]>,
    );
    if (persist) {
      await this.prisma.physicsMathTask.create({
        data: {
          userId,
          taskType: PhysicsMathTaskType.NUMERICAL,
          inputData: dto as unknown as object,
          resultData: { result } as object,
          status: PhysicsMathTaskStatus.COMPLETED,
        },
      });
    }
    return { result };
  }
}
