import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req
} from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import {
  CreatePredictionResponseDto,
  PredictionResultDto,
} from './dto/prediction-response.dto';
import { Request } from 'express';

@Controller('predictions')
export class PredictionsController {
  constructor(
    private readonly predictionsService: PredictionsService,
  ) {}

  @Post()
  async createPrediction(
      @Req() req: Request,
    @Body() dto: CreatePredictionDto,
  ): Promise<CreatePredictionResponseDto> {
     const userId = (req.user as any).id;
    return this.predictionsService.createPrediction(userId ,dto);
  }

  @Get(':id')
  async getPrediction(
    @Param('id') id: string,
  ): Promise<PredictionResultDto> {
    console.log('get api===')
    return this.predictionsService.getPrediction(id);
  }
}
