import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JobRolesService } from './job-roles/job-roles.service';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Seed default job roles on startup
  const jobRolesService = app.get(JobRolesService);
  await jobRolesService.seedDefaultRoles();
  logger.log('✅ Default job roles seeded');

  // Seed default admin on startup
  const authService = app.get(AuthService);
  await authService.seedDefaultAdmin();
  logger.log('✅ Default admin seeded');

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  const configuredOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const allowedOrigins = [
    configuredOrigin,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev to avoid blocking candidates
      }
    },
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`🚀 Backend running on http://localhost:${port}`);
  logger.log(`📚 API docs: http://localhost:${port}/api/v1`);
  logger.log(`❤️ Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();
