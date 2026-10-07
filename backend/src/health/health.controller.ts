import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Get()
  async check() {
    const dbHealthy = this.dataSource.isInitialized;
    
    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'mock-interview-backend',
      database: dbHealthy ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    };
  }

  @Get('ping')
  ping() {
    return { message: 'pong', timestamp: new Date().toISOString() };
  }
}
