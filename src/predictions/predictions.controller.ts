import {
  Controller,
  Post,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import {
  CreatePredictionResponseDto,
  PredictionResultDto,
} from './dto/prediction-response.dto';

@Controller('predictions')
export class PredictionsController {
  constructor(
    private readonly predictionsService: PredictionsService,
  ) {}

  @Post()
  async createPrediction(
    @Body() dto: CreatePredictionDto,
  ): Promise<CreatePredictionResponseDto> {
    console.log('body====',Body)
    return this.predictionsService.createPrediction(dto);
  }

  @Get(':id')
  async getPrediction(
    @Param('id') id: string,
  ): Promise<PredictionResultDto> {
    return this.predictionsService.getPrediction(id);
  }
}
