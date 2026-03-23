import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { GenerateDto } from './dto/generate.dto';
import { UnifiedScoreService } from '../scientific-engine/unified-score.service';
import { User } from '@prisma/client';

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private science: UnifiedScoreService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generate(userId: string, dto: GenerateDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits <= 0) throw new BadRequestException('Insufficient credits');

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `You are a world-class social media growth expert for ${dto.platform}.
Topic: "${dto.topic}"
Return ONLY valid JSON, no markdown:
{
  "titles": ["5 scroll-stopping title options"],
  "caption": "Platform-optimized caption with strong hook + CTA",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"],
  "tips": ["3 actionable growth tips for this topic and platform"]
}`;

    const response = await model.generateContent(prompt);
    const rawText  = response.response.text().replace(/```json|```/g, '').trim();
    let geminiData: any;
    try { geminiData = JSON.parse(rawText); }
    catch { throw new BadRequestException('AI generation failed — retry'); }

    const scienceScore = await this.science.computeFullScore({
      platform: dto.platform, topic: dto.topic,
      caption:  geminiData.caption || '',
      hashtags: geminiData.hashtags || [],
      userHistory: [],
      nicheHistory: [],
      meanFollowers: 1000,
    });

    const scoredHashtags = (geminiData.hashtags || []).map((tag: string, i: number) => ({
      tag,
      score: Math.max(20, Math.min(99,
        scienceScore.overallScore - i * 3 + Math.round(Math.random() * 8))),
    }));

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { credits: { decrement: 1 } } }),
      this.prisma.creditTransaction.create({
        data: { userId, amount: -1, type: 'DEDUCT', description: `Generated: ${dto.topic}` },
      }),
      this.prisma.generationHistory.create({
        data: {
          userId, platform: dto.platform, topic: dto.topic,
          creditsUsed: 1,
          result: { ...geminiData, hashtags: scoredHashtags, science: scienceScore } as any,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        titles:   geminiData.titles,
        caption:  geminiData.caption,
        hashtags: scoredHashtags,
        tips:     geminiData.tips,
        science:  scienceScore,
        ode_trajectory: scienceScore.odeTrajectory,
        best_posting_time: scienceScore.optimalPostHours.map(h => `${h}:00`).join(', '),
        engagement_prediction: {
          views:             `${scienceScore.confidenceLow.toLocaleString()}–${scienceScore.confidenceHigh.toLocaleString()}`,
          likes:             `${Math.round(scienceScore.confidenceLow*0.05).toLocaleString()}–${Math.round(scienceScore.confidenceHigh*0.05).toLocaleString()}`,
          probability_viral: `${scienceScore.probViral}%`,
          r0_coefficient:    scienceScore.r0,
          will_go_viral:     scienceScore.willGoViral,
          credible_interval: scienceScore.credibleInterval,
        },
      },
    };
  }

  async getHistory(userId: string, page = 1, limit = 10) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.generationHistory.findMany({
        where: { userId }, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.generationHistory.count({ where: { userId } }),
    ]);
    return { success: true, data: items, total, page, limit };
  }
}
