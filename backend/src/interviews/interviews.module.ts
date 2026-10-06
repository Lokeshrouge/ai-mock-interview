import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Interview } from '../database/entities/interview.entity';
import { InterviewQuestion } from '../database/entities/interview-question.entity';
import { InterviewAnswer } from '../database/entities/interview-answer.entity';
import { Resume } from '../database/entities/resume.entity';
import { JobRole } from '../database/entities/job-role.entity';
import { StudentProfile } from '../profiles/entities/profile.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { QuestionsService } from './questions.service';
import { AnswersService } from './answers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Interview,
      InterviewQuestion,
      InterviewAnswer,
      Resume,
      JobRole,
      StudentProfile,
    ]),
    ConfigModule,
  ],
  controllers: [InterviewsController],
  providers: [
    InterviewsService,
    QuestionsService,
    AnswersService,
  ],
  exports: [InterviewsService, QuestionsService, AnswersService],
})
export class InterviewsModule {}
