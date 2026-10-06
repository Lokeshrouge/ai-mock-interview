import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Interview } from '../database/entities/interview.entity';
import { InterviewQuestion } from '../database/entities/interview-question.entity';
import { InterviewAnswer } from '../database/entities/interview-answer.entity';
import { Evaluation } from '../database/entities/evaluation.entity';
import { Recommendation } from '../database/entities/recommendation.entity';
import { Resume } from '../database/entities/resume.entity';
import { JobRole } from '../database/entities/job-role.entity';
import { StudentProfile } from '../profiles/entities/profile.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { QuestionsService } from './questions.service';
import { AnswersService } from './answers.service';
import { EvaluationsService } from './evaluations.service';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Interview,
      InterviewQuestion,
      InterviewAnswer,
      Evaluation,
      Recommendation,
      Resume,
      JobRole,
      StudentProfile,
    ]),
    HttpModule,
  ],
  controllers: [InterviewsController],
  providers: [
    InterviewsService,
    QuestionsService,
    AnswersService,
    EvaluationsService,
    RecommendationsService,
  ],
  exports: [InterviewsService],
})
export class InterviewsModule {}
