import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../src/auth/auth.service';
import { ProfilesService } from '../src/profiles/profiles.service';
import { ResumesService } from '../src/resumes/resumes.service';
import { InterviewsService } from '../src/interviews/interviews.service';
import { AnswersService } from '../src/interviews/answers.service';
import { EvaluationsService } from '../src/interviews/evaluations.service';
import { RecommendationsService } from '../src/interviews/recommendations.service';
import { QuestionsService } from '../src/interviews/questions.service';
import { User, UserRole } from '../src/database/entities/user.entity';
import { StudentProfile } from '../src/profiles/entities/profile.entity';
import { Resume, ResumeProcessingStatus, ResumeAnalysisStatus } from '../src/database/entities/resume.entity';
import { Interview, InterviewStatus } from '../src/database/entities/interview.entity';
import { InterviewQuestion } from '../src/database/entities/interview-question.entity';
import { InterviewAnswer } from '../src/database/entities/interview-answer.entity';
import { Evaluation } from '../src/database/entities/evaluation.entity';
import { Recommendation } from '../src/database/entities/recommendation.entity';
import { JobRole } from '../src/database/entities/job-role.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('End-to-End Application Workflow Integration', () => {
  let authService: AuthService;
  let profilesService: ProfilesService;
  let resumesService: ResumesService;
  let interviewsService: InterviewsService;
  let answersService: AnswersService;
  let evaluationsService: EvaluationsService;
  let recommendationsService: RecommendationsService;

  // In-memory repositories mock
  const usersStore = new Map<string, any>();
  const profilesStore = new Map<string, any>();
  const resumesStore = new Map<string, any>();
  const interviewsStore = new Map<string, any>();
  const questionsStore = new Map<string, any>();
  const answersStore = new Map<string, any>();
  const recommendationsStore = new Map<string, any>();
  const jobRolesStore = new Map<string, any>();

  beforeAll(async () => {
    // Seed sample job role
    jobRolesStore.set('role-frontend', {
      id: 'role-frontend',
      title: 'Frontend Engineer',
      category: 'Software Engineering',
      description: 'Build modern user interfaces with React and Next.js',
      requiredSkills: ['React', 'TypeScript', 'CSS'],
      isActive: true,
    });

    const mockUserRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where?.id) return usersStore.get(where.id) || null;
        if (where?.email) {
          for (const u of usersStore.values()) {
            if (u.email === where.email) return u;
          }
        }
        return null;
      }),
      create: jest.fn((dto) => ({ id: 'usr-1', ...dto })),
      save: jest.fn(async (u) => {
        usersStore.set(u.id, u);
        return u;
      }),
    };

    const mockProfileRepo = {
      findOne: jest.fn(async ({ where }) => {
        const uid = where?.user_id || where?.userId;
        if (uid) return profilesStore.get(uid) || null;
        return null;
      }),
      create: jest.fn((dto) => {
        const uid = dto.user_id || dto.userId;
        return {
          id: 'prof-1',
          user_id: uid,
          userId: uid,
          first_name: dto.firstName || dto.first_name || '',
          last_name: dto.lastName || dto.last_name || '',
          ...dto,
        };
      }),
      save: jest.fn(async (p) => {
        const uid = p.user_id || p.userId;
        p.user_id = uid;
        p.userId = uid;
        profilesStore.set(uid, p);
        return p;
      }),
    };

    const mockResumeRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where?.id) return resumesStore.get(where.id) || null;
        if (where?.userId && where?.isActive) {
          for (const r of resumesStore.values()) {
            if (r.userId === where.userId && r.isActive) return r;
          }
        }
        return null;
      }),
      find: jest.fn(async () => Array.from(resumesStore.values())),
      create: jest.fn((dto) => ({ id: 'res-1', ...dto })),
      save: jest.fn(async (r) => {
        resumesStore.set(r.id, r);
        return r;
      }),
      update: jest.fn(async () => {}),
    };

    const mockInterviewRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where?.id) return interviewsStore.get(where.id) || null;
        return null;
      }),
      find: jest.fn(async () => Array.from(interviewsStore.values())),
      findAndCount: jest.fn(async () => [Array.from(interviewsStore.values()), interviewsStore.size]),
      create: jest.fn((dto) => ({
        id: 'intv-1',
        status: InterviewStatus.CREATED,
        answeredQuestions: 0,
        totalQuestions: dto.questionCount || 1,
        ...dto,
      })),
      save: jest.fn(async (i) => {
        interviewsStore.set(i.id, i);
        return i;
      }),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([Array.from(interviewsStore.values()), interviewsStore.size]),
      })),
    };

    const mockQuestionRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where?.id) return questionsStore.get(where.id) || null;
        return null;
      }),
      find: jest.fn(async () => Array.from(questionsStore.values())),
      create: jest.fn((dto) => ({ id: 'q-1', ...dto })),
      save: jest.fn(async (q) => {
        questionsStore.set(q.id, q);
        return q;
      }),
    };

    const mockAnswerRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where?.questionId) {
          for (const a of answersStore.values()) {
            if (a.questionId === where.questionId) return a;
          }
        }
        return null;
      }),
      create: jest.fn((dto) => ({ id: 'ans-1', ...dto })),
      save: jest.fn(async (a) => {
        answersStore.set(a.id, a);
        return a;
      }),
    };

    const mockEvaluationRepo = {
      findOne: jest.fn(async () => null),
      find: jest.fn(async () => []),
      create: jest.fn((dto) => ({ id: 'eval-1', ...dto })),
      save: jest.fn(async (e) => e),
    };

    const mockRecRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where?.interviewId) return recommendationsStore.get(where.interviewId) || null;
        return null;
      }),
      create: jest.fn((dto) => ({ id: 'rec-1', ...dto })),
      save: jest.fn(async (r) => {
        recommendationsStore.set(r.interviewId, r);
        return r;
      }),
    };

    const mockJobRoleRepo = {
      findOne: jest.fn(async ({ where }) => jobRolesStore.get(where?.id) || null),
      find: jest.fn(async () => Array.from(jobRolesStore.values())),
    };

    const mockQuestionsService = {
      generateFirstQuestion: jest.fn(async (interviewId) => {
        const q = {
          id: 'q-1',
          interviewId,
          questionNumber: 1,
          questionText: 'Can you explain the difference between state and props in React?',
          questionCategory: 'React Fundamentals',
          expectedPoints: ['State is mutable and local', 'Props are immutable and passed down'],
        };
        questionsStore.set(q.id, q);
        return q;
      }),
      generateNextQuestion: jest.fn(async (interviewId) => {
        const q = {
          id: 'q-1',
          interviewId,
          questionNumber: 1,
          questionText: 'Can you explain the difference between state and props in React?',
          questionCategory: 'React Fundamentals',
          expectedPoints: ['State is mutable and local', 'Props are immutable and passed down'],
        };
        questionsStore.set(q.id, q);
        return q;
      }),
    };

    const mockEvaluationsService = {
      evaluateAnswer: jest.fn(async () => ({
        overallScore: 85,
        strengths: ['Clear differentiation'],
        areasForImprovement: ['Mention hooks like useState'],
      })),
      calculateInterviewScore: jest.fn(async () => 85),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ProfilesService,
        ResumesService,
        InterviewsService,
        AnswersService,
        RecommendationsService,
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
        {
          provide: EvaluationsService,
          useValue: mockEvaluationsService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'jwt-test-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'AI_SERVICE_URL') return 'http://localhost:8000';
              if (key === 'JWT_SECRET') return 'test-jwt-secret';
              return null;
            }),
          },
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(StudentProfile), useValue: mockProfileRepo },
        { provide: getRepositoryToken(Resume), useValue: mockResumeRepo },
        { provide: getRepositoryToken(Interview), useValue: mockInterviewRepo },
        { provide: getRepositoryToken(InterviewQuestion), useValue: mockQuestionRepo },
        { provide: getRepositoryToken(InterviewAnswer), useValue: mockAnswerRepo },
        { provide: getRepositoryToken(Evaluation), useValue: mockEvaluationRepo },
        { provide: getRepositoryToken(Recommendation), useValue: mockRecRepo },
        { provide: getRepositoryToken(JobRole), useValue: mockJobRoleRepo },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    profilesService = module.get<ProfilesService>(ProfilesService);
    resumesService = module.get<ResumesService>(ResumesService);
    interviewsService = module.get<InterviewsService>(InterviewsService);
    answersService = module.get<AnswersService>(AnswersService);
    evaluationsService = module.get<EvaluationsService>(EvaluationsService);
    recommendationsService = module.get<RecommendationsService>(RecommendationsService);
  });

  it('Step 1 & 2: Student Registration & Authentication', async () => {
    const regResult = await authService.register({
      email: 'student@example.com',
      password: 'SecurePassword123!',
      firstName: 'Alex',
      lastName: 'Smith',
    });

    expect(regResult).toBeDefined();
    expect(regResult.userId).toBeDefined();
    expect(regResult.accessToken).toBe('jwt-test-token');
    expect(regResult.role).toBe(UserRole.STUDENT);

    // Login test
    const loginResult = await authService.login({
      email: 'student@example.com',
      password: 'SecurePassword123!',
    });

    expect(loginResult.accessToken).toBe('jwt-test-token');
  });

  it('Step 3: Student Profile Management & Readiness Scoring', async () => {
    const user = Array.from(usersStore.values())[0];

    const profileData = await profilesService.getProfile(user.id);
    expect(profileData.profile.firstName).toBe('Alex');

    // Update with complete competencies
    const updated = await profilesService.updateProfile(user.id, {
      phone: '9876543210',
      targetRole: 'Frontend Engineer',
      experienceLevel: 'ENTRY',
      education: {
        college: 'State University',
        degree: 'B.Sc.',
        department: 'Computer Science',
        graduationYear: 2025,
      },
      technicalSkills: ['React', 'Next.js', 'TypeScript'],
      programmingLanguages: ['TypeScript', 'JavaScript'],
    });

    expect(updated.profile.targetRole).toBe('Frontend Engineer');
    expect(updated.completion.percentage).toBeGreaterThan(50);
  });

  it('Step 4 & 5: Resume Ingestion & Validation', async () => {
    const user = Array.from(usersStore.values())[0];

    const resume = await resumesService.uploadResume(user.id, {
      originalname: 'Alex_Smith_Resume.pdf',
      mimetype: 'application/pdf',
      size: 1024 * 100, // 100 KB
      buffer: Buffer.from('%PDF-1.4 Mock PDF Content'),
    } as any);

    expect(resume.id).toBeDefined();
    expect(resume.processingStatus).toBe(ResumeProcessingStatus.UPLOADED);

    const userResumes = await resumesService.getUserResumes(user.id);
    expect(userResumes.length).toBeGreaterThan(0);
  });

  it('Step 6 & 7: Interview Configuration & Adaptive Question Generation', async () => {
    const user = Array.from(usersStore.values())[0];

    const interview = await interviewsService.create(user.id, {
      jobRoleId: 'role-frontend',
      interviewType: 'TECHNICAL' as any,
      difficulty: 'MEDIUM' as any,
      questionCount: 1,
    });

    expect(interview.id).toBeDefined();
    expect(interview.status).toBe(InterviewStatus.CREATED);

    // Start session
    const started = await interviewsService.startInterview(user.id, interview.id);
    expect(started.interview.status).toBe(InterviewStatus.IN_PROGRESS);
    expect(started.currentQuestion).toBeDefined();
    expect(started.currentQuestion.questionNumber).toBe(1);
  });

  it('Step 8 & 9: Answer Submission, Scoring & Synthesis', async () => {
    const user = Array.from(usersStore.values())[0];
    const interview = Array.from(interviewsStore.values())[0];
    const question = Array.from(questionsStore.values())[0];

    const submitResult = await answersService.submitAnswer(user.id, interview.id, {
      questionId: question.id,
      answerText: 'In React, props are read-only attributes passed down from a parent component, while state is local, mutable memory managed by the component itself.',
      timeTakenSeconds: 45,
    });

    expect(submitResult.success).toBe(true);
    expect(submitResult.isFinished).toBe(false); // Clamped to min 5 questions, so 1 answer doesn't auto-finish
    expect(interview.answeredQuestions).toBe(1);

    // Complete interview explicitly
    const completed = await interviewsService.completeInterview(user.id, interview.id);
    expect(completed.success).toBe(true);
    expect(completed.interviewId).toBe(interview.id);
  });

  it('Step 10 & 11: Final Performance Report & Session History Retrieval', async () => {
    const user = Array.from(usersStore.values())[0];
    const interview = Array.from(interviewsStore.values())[0];

    // Save recommendations and transition to EVALUATED
    interview.status = InterviewStatus.EVALUATED;
    interview.overallScore = 85;
    interview.questions = Array.from(questionsStore.values());
    interview.answers = Array.from(answersStore.values());
    interview.jobRole = jobRolesStore.get('role-frontend');
    interviewsStore.set(interview.id, interview);

    recommendationsStore.set(interview.id, {
      interviewId: interview.id,
      overallFeedback: 'Strong fundamental grasp of React concepts.',
      strengths: ['Crisp conceptual explanations'],
      weaknesses: ['Add code examples where appropriate'],
      topicsToImprove: ['React Hooks', 'Performance Optimization'],
      recommendedResources: [{ title: 'React Documentation', url: 'https://react.dev' }],
    });

    // 10. Fetch Report
    const report = await interviewsService.getInterviewReport(user.id, interview.id);
    expect(report).toBeDefined();
    expect(report.overallScore).toBe(85);
    expect(report.recommendations).toBeDefined();

    // 11. Retrieve History
    const history = await interviewsService.findAll(user.id, 1, 10);
    expect(history.items).toBeDefined();
    expect(history.items.length).toBeGreaterThan(0);
    expect(history.items[0].id).toBe(interview.id);
  });
});
