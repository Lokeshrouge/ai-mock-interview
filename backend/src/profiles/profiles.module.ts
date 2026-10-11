import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from '../database/entities/student-profile.entity';
import { User } from '../database/entities/user.entity';
import { Resume } from '../database/entities/resume.entity';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProfile, User, Resume])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService, TypeOrmModule],
})
export class ProfilesModule {}
