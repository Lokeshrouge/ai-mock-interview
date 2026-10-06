import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewAnswer } from '../database/entities/interview-answer.entity';
import { Interview, InterviewStatus } from '../database/entities/interview.entity';
import { InterviewQuestion } from '../database/entities/interview-question.entity';
import { QuestionsService } from './questions.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(InterviewAnswer)
    private answerRepository: Repository<InterviewAnswer>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewQuestion)
    private questionRepository: Repository<InterviewQuestion>,
    private questionsService: QuestionsService,
  ) {}

  async submitAnswer(
    userId: string,
    interviewId: string,
    dto: SubmitAnswerDto,
  ) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundException('Interview session not found');
    }

    if (interview.userId !== userId) {
      throw new ForbiddenException('Unauthorized access to this interview');
    }

    if (interview.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot submit answers for interview in status ${interview.status}`,
      );
    }

    const question = await this.questionRepository.findOne({
      where: { id: dto.questionId, interviewId },
    });

    if (!question) {
      throw new NotFoundException('Question does not belong to this interview session');
    }

    const existingAnswer = await this.answerRepository.findOne({
      where: { questionId: dto.questionId },
    });

    if (existingAnswer) {
      throw new BadRequestException('This question has already been answered');
    }

    // Save answer
    const answer = this.answerRepository.create({
      interviewId,
      questionId: dto.questionId,
      answerText: dto.answerText,
      timeTakenSeconds: dto.timeTakenSeconds || 0,
    });
    const savedAnswer = await this.answerRepository.save(answer);

    // Increment answered count
    interview.answeredQuestions += 1;

    let nextQuestion: InterviewQuestion | null = null;
    let isFinished = false;

    if (interview.answeredQuestions < interview.totalQuestions) {
      // Generate next adaptive question
      nextQuestion = await this.questionsService.generateNextQuestion(interviewId);
      await this.interviewRepository.save(interview);
    } else {
      // Complete interview session
      interview.status = InterviewStatus.COMPLETED;
      interview.completedAt = new Date();
      await this.interviewRepository.save(interview);
      isFinished = true;
    }

    const progressPercentage = Math.round(
      (interview.answeredQuestions / interview.totalQuestions) * 100,
    );

    return {
      success: true,
      answer: {
        id: savedAnswer.id,
        questionId: savedAnswer.questionId,
        submittedAt: savedAnswer.submittedAt,
      },
      nextQuestion: nextQuestion
        ? {
            id: nextQuestion.id,
            questionNumber: nextQuestion.questionNumber,
            questionText: nextQuestion.questionText,
            questionCategory: nextQuestion.questionCategory,
            expectedPoints: nextQuestion.expectedPoints,
          }
        : null,
      isFinished,
      progress: {
        answered: interview.answeredQuestions,
        total: interview.totalQuestions,
        percentage: progressPercentage,
      },
      message: isFinished
        ? 'All interview questions completed successfully! Performance evaluation is ready.'
        : `Answer submitted. Moving to Question ${interview.answeredQuestions + 1}.`,
    };
  }
}
