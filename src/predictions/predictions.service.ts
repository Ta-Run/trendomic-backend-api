import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiService } from '../integrations/ai/ai.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePredictionResponseDto,
  PredictionResultDto,
  HashtagScoreDto,
} from './dto/prediction-response.dto';

@Injectable()
export class PredictionsService {
  private predictions = new Map<string, PredictionResultDto>();

  constructor(
  private readonly aiService: AiService,
  private readonly prisma: PrismaService,
) {}


  async createPrediction(
  userId: string,
  dto: CreatePredictionDto,
): Promise<CreatePredictionResponseDto> {

  // 1️⃣ Check daily limit
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCount = await this.prisma.prediction.count({
    where: {
      userId,
      createdAt: { gte: todayStart },
    },
  });

  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new NotFoundException('User not found');

  if (todayCount >= user.dailyLimit) {
    throw new Error('Daily prediction limit exceeded');
  }

  // 2️⃣ Create DB record (PENDING)
  const prediction = await this.prisma.prediction.create({
    data: {
      userId,
      platform: dto.platform,
      contentType: dto.contentType,
      topic: dto.topic,
      region: dto.region,
      status: 'PENDING',
    },
  });

  // 3️⃣ Process async (later replace with BullMQ)
  this.processPrediction(prediction.id, userId, dto);

  return {
    predictionId: prediction.id,
    status: prediction.status,
  };
}


  private async processPrediction(
  predictionId: string,
  userId: string,
  dto: CreatePredictionDto,
) {
  try {
    // Mark as PROCESSING
    await this.prisma.prediction.update({
      where: { id: predictionId },
      data: { status: 'PROCESSING' },
    });

    const startTime = Date.now();

    const aiData = await this.aiService.generatePredictionInsights(dto);

    const processingTime = Date.now() - startTime;

    const scoredHashtags = aiData.hashtags.map((tag: string) => ({
      tag,
      score: this.calculateScore(tag),
      tier: 'MEDIUM',
      reason: 'AI + relevance based scoring',
    }));

    // Save AI result
    await this.prisma.predictionResult.create({
      data: {
        predictionId,
        hashtags: scoredHashtags,
        scripts: aiData.scripts,
        explanation: aiData.explanation,
      },
    });

    // Update prediction
    await this.prisma.prediction.update({
      where: { id: predictionId },
      data: {
        status: 'COMPLETED',
        tokensUsed: aiData.tokens ?? 0,
        processingTimeMs: processingTime,
        modelVersion: 'gemini-3-flash-preview',
        completedAt: new Date(),
      },
    });

    // Log usage
    await this.prisma.usageLog.create({
      data: {
        userId,
        predictionId,
        tokensUsed: aiData.tokens ?? 0,
      },
    });

  } catch (error) {
    await this.prisma.prediction.update({
      where: { id: predictionId },
      data: {
        status: 'FAILED',
        failureReason: error.message,
      },
    });
  }
}


  async getPrediction(id: string): Promise<PredictionResultDto|any>{
  const prediction = await this.prisma.prediction.findUnique({
    where: { id },
    include: { result: true },
  });

  if (!prediction) {
    throw new NotFoundException('Prediction not found');
  }

  return {
    id: prediction.id,
    status: prediction.status,
    scoredHashtags:  (prediction.result?.hashtags) ?? [],
    scriptSuggestions: prediction.result?.scripts ?? [],
    explanation: prediction.result?.explanation ?? null,
  };
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
