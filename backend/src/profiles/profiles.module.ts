import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from './entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProfile])],
  exports: [TypeOrmModule],
})
export class ProfilesModule {}
