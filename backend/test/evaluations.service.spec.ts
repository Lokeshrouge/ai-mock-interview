import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { EvaluationsService } from '../src/interviews/evaluations.service';
import { Evaluation } from '../src/database/entities/evaluation.entity';
import { InterviewAnswer } from '../src/database/entities/interview-answer.entity';
import { InterviewQuestion } from '../src/database/entities/interview-question.entity';
import { Interview, InterviewType, InterviewDifficulty } from '../src/database/entities/interview.entity';

describe('EvaluationsService', () => {
  let service: EvaluationsService;
  let mockEvaluationRepo: any;
  let mockAnswerRepo: any;
  let mockQuestionRepo: any;
  let mockInterviewRepo: any;

  beforeEach(async () => {
    mockEvaluationRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => ({ id: 'eval-1', ...entity, createdAt: new Date() })),
    };
    mockAnswerRepo = {
      findOne: jest.fn(),
    };
    mockQuestionRepo = {
      findOne: jest.fn(),
    };
    mockInterviewRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationsService,
        {
          provide: getRepositoryToken(Evaluation),
          useValue: mockEvaluationRepo,
        },
        {
          provide: getRepositoryToken(InterviewAnswer),
          useValue: mockAnswerRepo,
        },
        {
          provide: getRepositoryToken(InterviewQuestion),
          useValue: mockQuestionRepo,
        },
        {
          provide: getRepositoryToken(Interview),
          useValue: mockInterviewRepo,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8000'),
          },
        },
      ],
    }).compile();

    service = module.get<EvaluationsService>(EvaluationsService);
  });

  it('should throw NotFoundException if answer does not exist', async () => {
    mockAnswerRepo.findOne.mockResolvedValue(null);

    await expect(service.evaluateAnswer('non-existent-ans')).rejects.toThrow(NotFoundException);
  });

  it('should return existing evaluation if already evaluated', async () => {
    mockAnswerRepo.findOne.mockResolvedValue({
      id: 'ans-1',
      question: {},
      interview: {},
    });
    mockEvaluationRepo.findOne.mockResolvedValue({
      id: 'existing-eval',
      score: 82,
    });

    const result = await service.evaluateAnswer('ans-1');
    expect(result.id).toBe('existing-eval');
    expect(mockEvaluationRepo.save).not.toHaveBeenCalled();
  });

  it('should calculate backend-controlled weighted score and save evaluation', async () => {
    mockAnswerRepo.findOne.mockResolvedValue({
      id: 'ans-1',
      answerText: 'React uses a virtual DOM to diff updates before painting to the browser.',
      question: {
        id: 'q-1',
        questionText: 'Explain React Virtual DOM',
        expectedPoints: ['Virtual DOM concept', 'Diffing algorithm'],
      },
      interview: {
        id: 'int-1',
        interviewType: InterviewType.TECHNICAL,
        difficulty: InterviewDifficulty.MEDIUM,
      },
    });
    mockEvaluationRepo.findOne.mockResolvedValue(null);

    // Mock global fetch
    const mockAiResponse = {
      overall_score: 90,
      breakdown: {
        technical_accuracy: 90,
        completeness: 80,
        clarity: 85,
        relevance: 95,
      },
      detailed_feedback: 'Clear, concise explanation of Virtual DOM.',
      strengths: ['Correct diffing description'],
      areas_for_improvement: ['Mention Fiber reconciliation'],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockAiResponse),
    }) as any;

    const result = await service.evaluateAnswer('ans-1');

    // Formula: 90*0.35 + 80*0.30 + 85*0.20 + 95*0.15 = 31.5 + 24 + 17 + 14.25 = 86.75
    expect(result.score).toBe(86.75);
    expect(result.accuracyScore).toBe(90);
    expect(result.completenessScore).toBe(80);
    expect(result.clarityScore).toBe(85);
    expect(result.relevanceScore).toBe(95);
    expect(mockEvaluationRepo.save).toHaveBeenCalled();
  });

  it('should fallback to safe rubric scoring if AI service call fails', async () => {
    mockAnswerRepo.findOne.mockResolvedValue({
      id: 'ans-1',
      answerText: 'React uses a virtual DOM to diff updates.',
      question: {
        id: 'q-1',
        questionText: 'Explain React Virtual DOM',
      },
      interview: {
        id: 'int-1',
        interviewType: InterviewType.TECHNICAL,
        difficulty: InterviewDifficulty.MEDIUM,
      },
    });
    mockEvaluationRepo.findOne.mockResolvedValue(null);

    // Mock network error
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused')) as any;

    const result = await service.evaluateAnswer('ans-1');

    // Default rubric: 75*0.35 + 70*0.30 + 80*0.20 + 75*0.15 = 26.25 + 21 + 16 + 11.25 = 74.5
    expect(result.score).toBe(74.5);
    expect(mockEvaluationRepo.save).toHaveBeenCalled();
  });
});
