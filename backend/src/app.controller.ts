import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  @Get()
  @Public()
  getRoot() {
    return {
      message: 'AI Mock Interview API',
      version: '1.0.0',
      docs: '/api/v1',
    };
  }
}
