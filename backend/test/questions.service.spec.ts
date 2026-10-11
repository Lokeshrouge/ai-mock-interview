import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuestionsService } from '../src/interviews/questions.service';
import { InterviewQuestion } from '../src/database/entities/interview-question.entity';
import { Interview, InterviewStatus, InterviewType, InterviewDifficulty } from '../src/database/entities/interview.entity';
import { StudentProfile } from '../src/database/entities/student-profile.entity';
import { Resume } from '../src/database/entities/resume.entity';
import { JobRole } from '../src/database/entities/job-role.entity';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let mockQuestionRepo: any;
  let mockInterviewRepo: any;
  let mockProfileRepo: any;
  let mockResumeRepo: any;
  let mockJobRoleRepo: any;

  beforeEach(async () => {
    mockQuestionRepo = {
      create: jest.fn((dto) => ({ id: `q-${Date.now()}`, ...dto })),
      save: jest.fn(async (q) => q),
    };

    mockInterviewRepo = {
      findOne: jest.fn(),
    };

    mockProfileRepo = {
      findOne: jest.fn(),
    };

    mockResumeRepo = {
      findOne: jest.fn(),
    };

    mockJobRoleRepo = {
      findOne: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'AI_SERVICE_URL') return 'http://localhost:8000';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: getRepositoryToken(InterviewQuestion),
          useValue: mockQuestionRepo,
        },
        {
          provide: getRepositoryToken(Interview),
          useValue: mockInterviewRepo,
        },
        {
          provide: getRepositoryToken(StudentProfile),
          useValue: mockProfileRepo,
        },
        {
          provide: getRepositoryToken(Resume),
          useValue: mockResumeRepo,
        },
        {
          provide: getRepositoryToken(JobRole),
          useValue: mockJobRoleRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
  });

  it('should throw NotFoundException if interview does not exist', async () => {
    mockInterviewRepo.findOne.mockResolvedValue(null);

    await expect(service.generateNextQuestion('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException if interview is already completed', async () => {
    mockInterviewRepo.findOne.mockResolvedValue({
      id: 'int-1',
      status: InterviewStatus.COMPLETED,
    });

    await expect(service.generateNextQuestion('int-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException if all questions have already been generated', async () => {
    mockInterviewRepo.findOne.mockResolvedValue({
      id: 'int-1',
      status: InterviewStatus.IN_PROGRESS,
      totalQuestions: 2,
      questions: [{ id: 'q-1' }, { id: 'q-2' }],
    });

    await expect(service.generateNextQuestion('int-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should correctly query StudentProfile using userId (not user_id)', async () => {
    mockInterviewRepo.findOne.mockResolvedValue({
      id: 'int-1',
      userId: 'usr-123',
      status: InterviewStatus.IN_PROGRESS,
      totalQuestions: 5,
      questions: [],
      jobRole: { title: 'Backend Developer' },
      interviewType: InterviewType.TECHNICAL,
      difficulty: InterviewDifficulty.MEDIUM,
    });

    mockProfileRepo.findOne.mockResolvedValue({
      id: 'prof-1',
      userId: 'usr-123',
      technicalSkills: JSON.stringify(['NodeJS', 'PostgreSQL']),
      experienceLevel: 'MID',
    });

    // Mock fetch to simulate AI service response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        question: 'Explain indexing strategies in PostgreSQL.',
        topic: 'Database Optimization',
        expected_points: ['B-Tree indexes', 'Composite index ordering'],
      }),
    } as any);

    const question = await service.generateNextQuestion('int-1');

    expect(mockProfileRepo.findOne).toHaveBeenCalledWith({
      where: { userId: 'usr-123' },
    });
    expect(question).toBeDefined();
    expect(question.questionNumber).toBe(1);
    expect(question.questionText).toBe('Explain indexing strategies in PostgreSQL.');
    expect(mockQuestionRepo.save).toHaveBeenCalled();
  });

  it('should fall back to local question generator when AI Service times out or fails', async () => {
    mockInterviewRepo.findOne.mockResolvedValue({
      id: 'int-1',
      userId: 'usr-123',
      status: InterviewStatus.IN_PROGRESS,
      totalQuestions: 5,
      questions: [],
      jobRole: { title: 'Software Developer' },
      interviewType: InterviewType.TECHNICAL,
      difficulty: InterviewDifficulty.MEDIUM,
    });

    mockProfileRepo.findOne.mockResolvedValue(null);

    // Mock fetch to reject (simulate AI service down)
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));

    const question = await service.generateNextQuestion('int-1');

    expect(question).toBeDefined();
    expect(question.questionNumber).toBe(1);
    expect(question.questionText).toContain('Software Developer');
    expect(mockQuestionRepo.save).toHaveBeenCalled();
  });

  it('should safely handle malformed technicalSkills and resume parsedData', async () => {
    mockInterviewRepo.findOne.mockResolvedValue({
      id: 'int-1',
      userId: 'usr-123',
      resumeId: 'res-1',
      status: InterviewStatus.IN_PROGRESS,
      totalQuestions: 5,
      questions: [],
      jobRole: { title: 'Frontend Developer' },
      interviewType: InterviewType.TECHNICAL,
      difficulty: InterviewDifficulty.EASY,
    });

    // Malformed JSON in profile technical skills
    mockProfileRepo.findOne.mockResolvedValue({
      id: 'prof-1',
      userId: 'usr-123',
      technicalSkills: '{bad json',
      experienceLevel: 'ENTRY',
    });

    // Stringified parsedData in resume
    mockResumeRepo.findOne.mockResolvedValue({
      id: 'res-1',
      userId: 'usr-123',
      parsedData: JSON.stringify({ skills: ['HTML', 'CSS'] }),
      extractedText: 'Frontend Developer with React experience',
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        question: 'What is the Virtual DOM and how does React use it?',
        topic: 'React Core',
        expected_points: ['Diffing algorithm', 'Reconciliation'],
      }),
    } as any);

    const question = await service.generateNextQuestion('int-1');

    expect(question).toBeDefined();
    expect(question.questionNumber).toBe(1);
    expect(question.questionText).toBe('What is the Virtual DOM and how does React use it?');
  });
});
