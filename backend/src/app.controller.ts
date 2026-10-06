import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'mock-interview-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  root() {
    return {
      message: 'AI Mock Interview Backend API is operational',
      version: '1.0.0',
    };
  }
}
