import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from '../database/entities/resume.entity';
import { StudentProfile } from '../database/entities/student-profile.entity';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { TextExtractorService } from './text-extractor.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, StudentProfile]),
    StorageModule,
  ],
  controllers: [ResumesController],
  providers: [ResumesService, TextExtractorService],
  exports: [ResumesService, TextExtractorService, TypeOrmModule],
})
export class ResumesModule {}
