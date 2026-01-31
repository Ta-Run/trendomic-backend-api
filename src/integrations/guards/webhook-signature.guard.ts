import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-zapier-signature'] ?? request.headers['x-webhook-signature'];
    const secret = this.config.get<string>('ZAPIER_WEBHOOK_SECRET') ?? this.config.get<string>('WEBHOOK_SECRET');
    if (!secret) return true;
    if (!signature) throw new BadRequestException('Webhook signature required');
    const rawBody = (request as any).rawBody ?? JSON.stringify(request.body ?? {});
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (signature !== expected) throw new BadRequestException('Invalid webhook signature');
    return true;
  }
}
