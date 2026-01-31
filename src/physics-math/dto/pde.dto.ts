import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class PdeComputeDto {
  @IsString()
  type: string;

  @IsNumber()
  domainStart: number;

  @IsNumber()
  domainEnd: number;

  @IsNumber()
  tEnd: number;

  @IsNumber()
  stepX: number;

  @IsNumber()
  stepT: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  initialCondition?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  boundaryCondition?: number[];
}
