import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Interview } from '../database/entities/interview.entity';
import { InterviewQuestion } from '../database/entities/interview-question.entity';
import { InterviewAnswer } from '../database/entities/interview-answer.entity';
import { Evaluation } from '../database/entities/evaluation.entity';
import { Recommendation } from '../database/entities/recommendation.entity';
import { Resume } from '../database/entities/resume.entity';
import { JobRole } from '../database/entities/job-role.entity';
import { StudentProfile } from '../database/entities/student-profile.entity';
import { RevisedAnswer } from '../database/entities/revised-answer.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { QuestionsService } from './questions.service';
import { AnswersService } from './answers.service';
import { EvaluationsService } from './evaluations.service';
import { RecommendationsService } from './recommendations.service';
import { RevisedAnswersService } from './revised-answers.service';

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
      RevisedAnswer,
    ]),
    ConfigModule,
  ],
  controllers: [InterviewsController],
  providers: [
    InterviewsService,
    QuestionsService,
    AnswersService,
    EvaluationsService,
    RecommendationsService,
    RevisedAnswersService,
  ],
  exports: [
    InterviewsService,
    QuestionsService,
    AnswersService,
    EvaluationsService,
    RecommendationsService,
    RevisedAnswersService,
  ],
})
export class InterviewsModule {}
