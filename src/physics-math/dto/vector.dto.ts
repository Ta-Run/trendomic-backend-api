import { IsArray, ArrayMinSize, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class VectorDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  values: number[];
}

export class VectorComputeDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VectorDto)
  vectors: VectorDto[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  coefficients?: number[];
}
