import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InterviewsService } from '../src/interviews/interviews.service';
import {
  Interview,
  InterviewStatus,
  InterviewType,
  InterviewDifficulty,
} from '../src/database/entities/interview.entity';
import { JobRole } from '../src/database/entities/job-role.entity';
import { Resume } from '../src/database/entities/resume.entity';
import { InterviewQuestion } from '../src/database/entities/interview-question.entity';
import { QuestionsService } from '../src/interviews/questions.service';
import { RecommendationsService } from '../src/interviews/recommendations.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let mockInterviewRepo: any;
  let mockJobRoleRepo: any;
  let mockResumeRepo: any;
  let mockQuestionRepo: any;
  let mockQuestionsService: any;
  let mockRecommendationsService: any;

  beforeEach(async () => {
    mockInterviewRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn((entity) => ({ id: 'int-123', ...entity })),
      create: jest.fn((dto) => dto),
    };
    mockJobRoleRepo = {
      findOne: jest.fn(),
    };
    mockResumeRepo = {
      findOne: jest.fn(),
    };
    mockQuestionRepo = {
      find: jest.fn(),
    };
    mockQuestionsService = {
      generateNextQuestion: jest.fn().mockResolvedValue({
        id: 'q-1',
        questionNumber: 1,
        questionText: 'Explain React Component Lifecycle',
        questionCategory: 'React Core',
      }),
    };

    mockRecommendationsService = {
      generateRecommendations: jest.fn(),
      getRecommendationByInterview: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        {
          provide: getRepositoryToken(Interview),
          useValue: mockInterviewRepo,
        },
        {
          provide: getRepositoryToken(JobRole),
          useValue: mockJobRoleRepo,
        },
        {
          provide: getRepositoryToken(Resume),
          useValue: mockResumeRepo,
        },
        {
          provide: getRepositoryToken(InterviewQuestion),
          useValue: mockQuestionRepo,
        },
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
        {
          provide: RecommendationsService,
          useValue: mockRecommendationsService,
        },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
  });

  describe('Interview Configuration & Creation', () => {
    it('should throw NotFoundException if job role does not exist', async () => {
      mockJobRoleRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create('user-1', {
          jobRoleId: 'non-existent-role',
          interviewType: InterviewType.TECHNICAL,
          difficulty: InterviewDifficulty.MEDIUM,
          questionCount: 10,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if specified resume is not owned by user', async () => {
      mockJobRoleRepo.findOne.mockResolvedValue({ id: 'role-1', title: 'Full Stack Dev' });
      mockResumeRepo.findOne.mockResolvedValue({ id: 'res-other', userId: 'user-2' });

      await expect(
        service.create('user-1', {
          jobRoleId: 'role-1',
          resumeId: 'res-other',
          interviewType: InterviewType.TECHNICAL,
          difficulty: InterviewDifficulty.MEDIUM,
          questionCount: 10,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully create interview in CREATED status', async () => {
      mockJobRoleRepo.findOne.mockResolvedValue({ id: 'role-1', title: 'Full Stack Dev' });
      mockResumeRepo.findOne.mockResolvedValue({ id: 'res-1', userId: 'user-1', isActive: true });
      mockInterviewRepo.findOne.mockResolvedValue({
        id: 'int-123',
        userId: 'user-1',
        status: InterviewStatus.CREATED,
        totalQuestions: 10,
      });

      const result = await service.create('user-1', {
        jobRoleId: 'role-1',
        interviewType: InterviewType.TECHNICAL,
        difficulty: InterviewDifficulty.MEDIUM,
        questionCount: 10,
      });

      expect(mockInterviewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          jobRoleId: 'role-1',
          status: InterviewStatus.CREATED,
          totalQuestions: 10,
        }),
      );
      expect(result.id).toBe('int-123');
    });
  });

  describe('Interview Ownership & State Machine', () => {
    it('should prevent User A from accessing User B interview', async () => {
      mockInterviewRepo.findOne.mockResolvedValue({
        id: 'int-b',
        userId: 'user-b',
        status: InterviewStatus.CREATED,
      });

      await expect(service.startInterview('user-a', 'int-b')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should reject starting an interview that is already COMPLETED', async () => {
      mockInterviewRepo.findOne.mockResolvedValue({
        id: 'int-1',
        userId: 'user-1',
        status: InterviewStatus.COMPLETED,
      });

      await expect(service.startInterview('user-1', 'int-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should transition CREATED -> IN_PROGRESS on start and generate Question 1', async () => {
      const interview = {
        id: 'int-1',
        userId: 'user-1',
        status: InterviewStatus.CREATED,
        totalQuestions: 10,
        answeredQuestions: 0,
        questions: [],
      };
      mockInterviewRepo.findOne.mockResolvedValue(interview);

      const result = await service.startInterview('user-1', 'int-1');
      expect(interview.status).toBe(InterviewStatus.IN_PROGRESS);
      expect(mockQuestionsService.generateNextQuestion).toHaveBeenCalledWith('int-1');
      expect(result.currentQuestion).toBeDefined();
      expect(result.currentQuestion?.questionNumber).toBe(1);
    });
  });
});
