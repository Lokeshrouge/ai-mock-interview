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
        
        const isProduction = config.get<string>('NODE_ENV') === 'production';
        
        // Determine SSL settings based on database URL
        // Neon requires SSL, but we can detect this from the URL or sslmode parameter
        const needsSSL = databaseUrl?.includes('neon.tech') || 
                        databaseUrl?.includes('sslmode=require') ||
                        isProduction;
        
        return {
          type: 'postgres',
          url: config.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: false, // NEVER use synchronize with PostgreSQL in any environment
          logging: config.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
          ssl: needsSSL ? { rejectUnauthorized: false } : false,
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
