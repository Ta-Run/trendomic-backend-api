import { IsArray, ArrayMinSize, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum MatrixOperation {
  MULTIPLY = 'multiply',
  DETERMINANT = 'determinant',
  INVERSE = 'inverse',
  ADD = 'add',
  TRANSPOSE = 'transpose',
}

export class MatrixComputeDto {
  @IsArray()
  @ArrayMinSize(1)
  matrixA: number[][];

  @IsOptional()
  matrixB?: number[][];

  @IsEnum(MatrixOperation)
  operation: MatrixOperation;
}
