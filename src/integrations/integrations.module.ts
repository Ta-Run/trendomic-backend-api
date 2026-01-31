import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, WebhookSignatureGuard],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
