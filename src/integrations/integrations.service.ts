import { Injectable } from '@nestjs/common';

@Injectable()
export class IntegrationsService {
  getYoutubeStatus(userId: string) {
    return {
      connected: false,
      message: 'Configure YOUTUBE_API_KEY and implement OAuth flow',
      userId,
    };
  }

  getLaterStatus(userId: string) {
    return {
      connected: false,
      message: 'Configure LATER_API_KEY and implement connection',
      userId,
    };
  }

  getBufferStatus(userId: string) {
    return {
      connected: false,
      message: 'Configure BUFFER_API_KEY and implement connection',
      userId,
    };
  }
}
