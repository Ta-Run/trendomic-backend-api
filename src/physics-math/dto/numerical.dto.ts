import { IsString, IsOptional, IsObject, IsArray, IsNumber } from 'class-validator';

export class NumericalComputeDto {
  /** Formula or operation: e.g. "sum", "mean", "integrate", "differentiate" */
  @IsString()
  operation: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  data?: number[];

  @IsOptional()
  @IsObject()
  params?: Record<string, number | number[]>;
}
