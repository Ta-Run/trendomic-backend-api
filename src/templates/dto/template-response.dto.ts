import { ApiProperty } from '@nestjs/swagger';

export class TemplateResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: any;
}

export class TemplatesListResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    templates: any[];
    total: number;
    page: number;
    limit: number;
  };
}
