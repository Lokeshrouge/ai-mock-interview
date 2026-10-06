import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from '../database/entities/resume.entity';
import { StudentProfile } from '../profiles/entities/profile.entity';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Resume, StudentProfile])],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService, TypeOrmModule],
})
export class ResumesModule {}
