import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { RecommendationsService } from '../src/interviews/recommendations.service';
import { Recommendation } from '../src/database/entities/recommendation.entity';
import { Interview, InterviewStatus, InterviewType, InterviewDifficulty } from '../src/database/entities/interview.entity';
import { InterviewAnswer } from '../src/database/entities/interview-answer.entity';
import { EvaluationsService } from '../src/interviews/evaluations.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let mockRecommendationRepo: any;
  let mockInterviewRepo: any;
  let mockAnswerRepo: any;
  let mockEvaluationsService: any;

  beforeEach(async () => {
    mockRecommendationRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => ({ id: 'rec-1', ...entity })),
    };
    mockInterviewRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    mockAnswerRepo = {
      findOne: jest.fn(),
    };
    mockEvaluationsService = {
      evaluateAnswer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: getRepositoryToken(Recommendation),
          useValue: mockRecommendationRepo,
        },
        {
          provide: getRepositoryToken(Interview),
          useValue: mockInterviewRepo,
        },
        {
          provide: getRepositoryToken(InterviewAnswer),
          useValue: mockAnswerRepo,
        },
        {
          provide: EvaluationsService,
          useValue: mockEvaluationsService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8000'),
          },
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  it('should throw NotFoundException if interview does not exist', async () => {
    mockInterviewRepo.findOne.mockResolvedValue(null);

    await expect(service.generateRecommendations('non-existent-int')).rejects.toThrow(NotFoundException);
  });

  it('should aggregate answer scores, call AI recommendations, and update interview to EVALUATED', async () => {
    const mockInterview = {
      id: 'int-1',
      interviewType: InterviewType.TECHNICAL,
      difficulty: InterviewDifficulty.MEDIUM,
      status: InterviewStatus.COMPLETED,
      overallScore: null as number | null,
      jobRole: { title: 'Fullstack Engineer' },
      answers: [
        { id: 'ans-1', answerText: 'Answer 1 text...', question: { questionText: 'Q1 text' } },
        { id: 'ans-2', answerText: 'Answer 2 text...', question: { questionText: 'Q2 text' } },
      ],
    };

    mockInterviewRepo.findOne.mockResolvedValue(mockInterview);
    mockEvaluationsService.evaluateAnswer
      .mockResolvedValueOnce({ id: 'eval-1', score: 80 })
      .mockResolvedValueOnce({ id: 'eval-2', score: 90 });

    mockRecommendationRepo.findOne.mockResolvedValue(null);

    // Mock global fetch
    const mockAiResponse = {
      overall_feedback: 'Strong performance on web architecture.',
      strengths: ['Great communication', 'Clear design patterns'],
      weaknesses: ['Review async handling'],
      topics_to_improve: ['Concurrency', 'Caching'],
      recommended_resources: [
        { title: 'Concurrency Guide', url: 'https://example.com/guide' },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockAiResponse),
    }) as any;

    const result = await service.generateRecommendations('int-1');

    // Expected average score = (80 + 90) / 2 = 85
    expect(mockInterview.overallScore).toBe(85);
    expect(mockInterview.status).toBe(InterviewStatus.EVALUATED);
    expect(mockInterviewRepo.save).toHaveBeenCalledWith(mockInterview);
    expect(result.overallFeedback).toBe('Strong performance on web architecture.');
    expect(result.strengths).toEqual(['Great communication', 'Clear design patterns']);
  });

  it('should fallback gracefully when AI recommendations service is unreachable', async () => {
    const mockInterview = {
      id: 'int-1',
      interviewType: InterviewType.TECHNICAL,
      difficulty: InterviewDifficulty.MEDIUM,
      status: InterviewStatus.COMPLETED,
      overallScore: null as number | null,
      jobRole: { title: 'Backend Engineer' },
      answers: [
        { id: 'ans-1', answerText: 'Answer 1...', question: { questionText: 'Q1' } },
      ],
    };

    mockInterviewRepo.findOne.mockResolvedValue(mockInterview);
    mockEvaluationsService.evaluateAnswer.mockResolvedValue({ id: 'eval-1', score: 78 });
    mockRecommendationRepo.findOne.mockResolvedValue(null);

    // Network failure simulation
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as any;

    const result = await service.generateRecommendations('int-1');

    expect(mockInterview.overallScore).toBe(78);
    expect(mockInterview.status).toBe(InterviewStatus.EVALUATED);
    expect(mockRecommendationRepo.save).toHaveBeenCalled();
    expect(result.strengths).toBeDefined();
    expect(result.weaknesses).toBeDefined();
  });
});
