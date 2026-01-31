import { IsString, IsNumber, IsOptional } from 'class-validator';

export class OdeComputeDto {
  @IsString()
  equation: string;

  @IsNumber()
  x0: number;

  @IsNumber()
  y0: number;

  @IsNumber()
  xEnd: number;

  @IsNumber()
  stepSize: number;

  @IsOptional()
  @IsString()
  method?: 'euler' | 'rk4';
}
