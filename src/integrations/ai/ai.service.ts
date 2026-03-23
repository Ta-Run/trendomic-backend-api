import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreatePredictionDto } from '../../predictions/dto/create-prediction.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private model;

  constructor(private configService: ConfigService) {
    const key:any = this.configService.get<string>('GEMINI_API_KEY');
      if (!key) {
      throw new Error('GEMINI_API_KEY is missing');
    }


    const genAI = new GoogleGenerativeAI(key);
    this.model = genAI.getGenerativeModel({  model: 'gemini-3-flash-preview' });
  }

  async generatePredictionInsights(input: CreatePredictionDto) {
    const prompt = `
You are a social media growth expert.

Platform: ${input.platform}
Content Type: ${input.contentType}
Topic: ${input.topic}
Region: ${input.region ?? 'Global'}

Return STRICT JSON in this format:

{
  "hashtags": ["tag1", "tag2"],
  "scripts": [
    {
      "title": "",
      "hook": "",
      "outline": ""
    }
  ],
  "explanation": {
    "hashtags": "",
    "postingTime": "",
    "confidence": "",
    "disclaimer": ""
  }
}
`;

  const maxRetries = 3;
  let attempt = 0;

  while(attempt<maxRetries){

    try {
      const result = await this.model.generateContent(prompt);
    const text = result.response.text();

    return this.parseJson(text);
      
    } catch (error) {
      if(error.status === 503){
        attempt++;

        const delay = Math.pow(2,attempt) *1000

         this.logger.warn(
          `Gemini 503 overload. Retrying attempt ${attempt} after ${delay}ms`,
         )
         await new Promise((resolve) => setTimeout(resolve, delay));
      }else{
         throw error; 
      }      
    }
  }
 throw new Error('Gemini service unavailable after retries');
    
  }

  private parseJson(text: string) {
    try {
      return JSON.parse(text);
    } catch (err) {
      this.logger.error('AI JSON parsing failed');
      throw new Error('AI returned invalid JSON');
    }
  }
}
