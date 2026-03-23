import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { 
  TrendingHashtagsResponseDto, 
  TrendingTopicsResponseDto 
} from './dto/trending-response.dto';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

@Injectable()
export class TrendingService {
  private readonly logger = new Logger(TrendingService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly cache = new Map<string, CacheItem<any>>();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private getCacheKey(type: string, platform: string, category?: string): string {
    return `${type}:${platform}${category ? `:${category}` : ''}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key) as CacheItem<T> | undefined;
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  async getTrendingHashtags(platform: string, category?: string) {
    this.logger.log(`Getting trending hashtags for platform: ${platform}, category: ${category}`);

    const cacheKey = this.getCacheKey('hashtags', platform, category);
    const cached = this.getFromCache<any>(cacheKey);
    
    if (cached) {
      this.logger.log(`Returning cached hashtags for ${platform}:${category || 'all'}`);
      return {
        success: true,
        data: {
          ...cached,
          cached: true,
        },
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `You are a social media trends expert for ${platform}${category ? ` in the ${category} niche` : ''}.
Generate 15 trending hashtags with engagement scores.
Return ONLY valid JSON (no markdown):
{
  "hashtags": [
    {"tag": "#example1", "score": 95, "trend": "up"},
    {"tag": "#example2", "score": 88, "trend": "stable"},
    {"tag": "#example3", "score": 76, "trend": "down"}
  ]
}

Score should be 1-100 based on current popularity and engagement potential.
Trend should be "up", "down", or "stable" based on recent performance.
Make hashtags specific to ${platform}${category ? ` and ${category}` : ''}.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      let parsedResponse;
      try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        parsedResponse = JSON.parse(cleanText);
      } catch (parseError) {
        this.logger.error(`Failed to parse Gemini response for hashtags: ${parseError.message}`);
        throw new Error('Failed to generate trending hashtags');
      }

      const responseData = {
        platform,
        category: category || null,
        hashtags: parsedResponse.hashtags,
        cached: false,
        lastUpdated: new Date().toISOString(),
      };

      this.setCache(cacheKey, responseData);

      this.logger.log(`Successfully generated trending hashtags for ${platform}:${category || 'all'}`);

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      this.logger.error(`Failed to get trending hashtags for ${platform}: ${error.message}`);
      throw error;
    }
  }

  async getTrendingTopics(platform: string) {
    this.logger.log(`Getting trending topics for platform: ${platform}`);

    const cacheKey = this.getCacheKey('topics', platform);
    const cached = this.getFromCache<any>(cacheKey);
    
    if (cached) {
      this.logger.log(`Returning cached topics for ${platform}`);
      return {
        success: true,
        data: {
          ...cached,
          cached: true,
        },
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `You are a social media content strategist for ${platform}.
Generate 10 trending topic ideas that are currently performing well.
Return ONLY valid JSON (no markdown):
{
  "topics": [
    {
      "topic": "Example Topic Title",
      "description": "Brief description of why this topic is trending",
      "engagement": "High/Medium/Low",
      "difficulty": "easy/medium/hard"
    }
  ]
}

Topics should be specific to ${platform} and reflect current trends.
Engagement indicates expected interaction levels.
Difficulty indicates how hard it is to create content for this topic.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      let parsedResponse;
      try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        parsedResponse = JSON.parse(cleanText);
      } catch (parseError) {
        this.logger.error(`Failed to parse Gemini response for topics: ${parseError.message}`);
        throw new Error('Failed to generate trending topics');
      }

      const responseData = {
        platform,
        topics: parsedResponse.topics,
        cached: false,
        lastUpdated: new Date().toISOString(),
      };

      this.setCache(cacheKey, responseData);

      this.logger.log(`Successfully generated trending topics for ${platform}`);

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      this.logger.error(`Failed to get trending topics for ${platform}: ${error.message}`);
      throw error;
    }
  }

  clearCache(): void {
    this.logger.log('Clearing trending cache');
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
