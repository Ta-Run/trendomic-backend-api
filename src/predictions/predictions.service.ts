import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiService } from '../integrations/ai/ai.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import {
  CreatePredictionResponseDto,
  PredictionResultDto,
  HashtagScoreDto,
} from './dto/prediction-response.dto';

@Injectable()
export class PredictionsService {
  private predictions = new Map<string, PredictionResultDto>();

  constructor(private readonly aiService: AiService) {}

  async createPrediction(
    dto: CreatePredictionDto,
  ): Promise<CreatePredictionResponseDto> {
    const id = randomUUID();

    // Set initial state
    this.predictions.set(id, {
      id,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    } as PredictionResultDto);

    // Run async (simulate background job)
    this.processPrediction(id, dto);

    return {
      predictionId: id,
      status: 'PENDING',
    };
  }

  private async processPrediction(
    id: string,
    dto: CreatePredictionDto,
  ) {
    try {
      const aiData = await this.aiService.generatePredictionInsights(dto);
    console.log('first workd')
      const scoredHashtags: HashtagScoreDto[] =
        aiData.hashtags.map((tag: string) => ({
          tag,
          score: this.calculateScore(tag),
          tier: 'MEDIUM',
          reason: 'AI + relevance based scoring',
        }));

        console.log('Second workd')

      const result: PredictionResultDto = {
        id,
        status: 'COMPLETED',
        scoredHashtags,
        scriptSuggestions: aiData.scripts,
        bestPostingTime: this.calculateBestTime(),
        trafficForecast: this.calculateForecast(),
        explanation: aiData.explanation,
        modelVersion: 'gemini-1.5-flash',
        createdAt: new Date().toISOString(),
      };

      console.log('third workd')

      this.predictions.set(id, result);
      console.log('fifth workd')
    } catch (error) {
      this.predictions.set(id, {
        id,
        status: 'FAILED',
        createdAt: new Date().toISOString(),
        failureReason: 'AI processing failed',
      } as PredictionResultDto);
    }
  }

  async getPrediction(id: string): Promise<PredictionResultDto> {
    const prediction = this.predictions.get(id);

    if (!prediction) {
      throw new NotFoundException('Prediction not found');
    }

    return prediction;
  }

  // 🔥 Temporary math logic
  private calculateScore(tag: string): number {
    return parseFloat((Math.random() * 1).toFixed(2));
  }

  private calculateBestTime() {
    return {
      slot: '09:00-11:00',
      confidence: 0.82,
      reason: 'High engagement window',
    };
  }

  private calculateForecast() {
    return {
      min: 1500,
      max: 7000,
      confidence: 0.67,
      unit: 'views',
    };
  }
}
