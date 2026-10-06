import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnswersService } from '../src/interviews/answers.service';
import { QuestionsService } from '../src/interviews/questions.service';
import { InterviewAnswer } from '../src/database/entities/interview-answer.entity';
import { Interview, InterviewStatus } from '../src/database/entities/interview.entity';
import { InterviewQuestion } from '../src/database/entities/interview-question.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('AnswersService', () => {
  let service: AnswersService;
  let mockAnswerRepo: any;
  let mockInterviewRepo: any;
  let mockQuestionRepo: any;
  let mockQuestionsService: any;

  beforeEach(async () => {
    mockAnswerRepo = {
      findOne: jest.fn(),
      save: jest.fn((entity) => ({ id: 'ans-1', ...entity, submittedAt: new Date() })),
      create: jest.fn((dto) => dto),
    };
    mockInterviewRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    mockQuestionRepo = {
      findOne: jest.fn(),
    };
    mockQuestionsService = {
      generateNextQuestion: jest.fn().mockResolvedValue({
        id: 'q-2',
        questionNumber: 2,
        questionText: 'How do you optimize React re-renders?',
        questionCategory: 'Performance',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswersService,
        {
          provide: getRepositoryToken(InterviewAnswer),
          useValue: mockAnswerRepo,
        },
        {
          provide: getRepositoryToken(Interview),
          useValue: mockInterviewRepo,
        },
        {
          provide: getRepositoryToken(InterviewQuestion),
          useValue: mockQuestionRepo,
        },
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
      ],
    }).compile();

    service = module.get<AnswersService>(AnswersService);
  });

  describe('Answer Submission & Progression', () => {
    it('should reject answer if interview belongs to different user', async () => {
      mockInterviewRepo.findOne.mockResolvedValue({
        id: 'int-1',
        userId: 'other-user',
        status: InterviewStatus.IN_PROGRESS,
      });

      await expect(
        service.submitAnswer('user-1', 'int-1', {
          questionId: 'q-1',
          answerText: 'A detailed answer to the technical question here...',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject answer if question does not belong to the interview', async () => {
      mockInterviewRepo.findOne.mockResolvedValue({
        id: 'int-1',
        userId: 'user-1',
        status: InterviewStatus.IN_PROGRESS,
      });
      mockQuestionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.submitAnswer('user-1', 'int-1', {
          questionId: 'q-alien',
          answerText: 'A detailed answer to the question...',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject duplicate answer submission for same question', async () => {
      mockInterviewRepo.findOne.mockResolvedValue({
        id: 'int-1',
        userId: 'user-1',
        status: InterviewStatus.IN_PROGRESS,
      });
      mockQuestionRepo.findOne.mockResolvedValue({ id: 'q-1', interviewId: 'int-1' });
      mockAnswerRepo.findOne.mockResolvedValue({ id: 'existing-ans' });

      await expect(
        service.submitAnswer('user-1', 'int-1', {
          questionId: 'q-1',
          answerText: 'Submitting a duplicate answer...',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should advance to Question 2 when Question 1 is answered', async () => {
      const interview = {
        id: 'int-1',
        userId: 'user-1',
        status: InterviewStatus.IN_PROGRESS,
        totalQuestions: 10,
        answeredQuestions: 0,
      };
      mockInterviewRepo.findOne.mockResolvedValue(interview);
      mockQuestionRepo.findOne.mockResolvedValue({ id: 'q-1', interviewId: 'int-1' });
      mockAnswerRepo.findOne.mockResolvedValue(null);

      const result = await service.submitAnswer('user-1', 'int-1', {
        questionId: 'q-1',
        answerText: 'In React, state and props drive rendering. Reconciliation diffs virtual DOM.',
        timeTakenSeconds: 45,
      });

      expect(interview.answeredQuestions).toBe(1);
      expect(mockQuestionsService.generateNextQuestion).toHaveBeenCalledWith('int-1');
      expect(result.isFinished).toBe(false);
      expect(result.nextQuestion?.questionNumber).toBe(2);
      expect(result.progress.percentage).toBe(10);
    });

    it('should transition to COMPLETED when final question is answered', async () => {
      const interview = {
        id: 'int-1',
        userId: 'user-1',
        status: InterviewStatus.IN_PROGRESS,
        totalQuestions: 5,
        answeredQuestions: 4, // 4 already answered, this is the 5th
      };
      mockInterviewRepo.findOne.mockResolvedValue(interview);
      mockQuestionRepo.findOne.mockResolvedValue({ id: 'q-5', interviewId: 'int-1' });
      mockAnswerRepo.findOne.mockResolvedValue(null);

      const result = await service.submitAnswer('user-1', 'int-1', {
        questionId: 'q-5',
        answerText: 'This is the final answer covering the system design architecture in detail.',
        timeTakenSeconds: 60,
      });

      expect(interview.answeredQuestions).toBe(5);
      expect(interview.status).toBe(InterviewStatus.COMPLETED);
      expect(result.isFinished).toBe(true);
      expect(result.nextQuestion).toBeNull();
      expect(result.progress.percentage).toBe(100);
    });
  });
});
