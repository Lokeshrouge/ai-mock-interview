import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const isTest = process.env.NODE_ENV === 'test';
        const isSqlite = databaseUrl?.startsWith('sqlite:') || !databaseUrl;
        
        if (isTest || isSqlite) {
          // Use SQLite for testing or when SQLite is configured
          return {
            type: 'sqlite',
            database: isTest ? ':memory:' : './mock_interview.db',
            autoLoadEntities: true,
            synchronize: true,
            logging: ['error', 'warn'],
          };
        }
        
        return {
          type: 'postgres',
          url: config.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: config.get<string>('NODE_ENV') !== 'production',
          logging: config.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
          extra: {
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
