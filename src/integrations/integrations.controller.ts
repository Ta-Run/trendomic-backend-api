import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';
import { Public } from '../common/decorators/public.decorator';
import * as crypto from 'crypto';

@Controller('integrations')
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(
    private integrations: IntegrationsService,
    private config: ConfigService,
  ) {}

  @Get('youtube/status')
  @UseGuards(JwtAuthGuard)
  youtubeStatus(@CurrentUser('id') userId: string) {
    return this.integrations.getYoutubeStatus(userId);
  }

  @Get('later/status')
  @UseGuards(JwtAuthGuard)
  laterStatus(@CurrentUser('id') userId: string) {
    return this.integrations.getLaterStatus(userId);
  }

  @Get('buffer/status')
  @UseGuards(JwtAuthGuard)
  bufferStatus(@CurrentUser('id') userId: string) {
    return this.integrations.getBufferStatus(userId);
  }

  @Post('webhook/zapier')
  @Public()
  @UseGuards(WebhookSignatureGuard)
  zapierWebhook(@Body() body: Record<string, unknown>) {
    this.logger.log('Zapier webhook received');
    return { received: true, timestamp: new Date().toISOString() };
  }

  @Post('webhook/generic')
  @Public()
  genericWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('x-webhook-signature') signature?: string,
  ) {
    const secret = this.config.get<string>('WEBHOOK_SECRET');
    if (secret && signature) {
      const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
      if (signature !== expected) throw new BadRequestException('Invalid webhook signature');
    }
    this.logger.log('Generic webhook received');
    return { received: true, timestamp: new Date().toISOString() };
  }
}
