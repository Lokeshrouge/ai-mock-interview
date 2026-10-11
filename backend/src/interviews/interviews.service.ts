import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Interview,
  InterviewStatus,
} from '../database/entities/interview.entity';
import { JobRole } from '../database/entities/job-role.entity';
import { Resume } from '../database/entities/resume.entity';
import { InterviewQuestion } from '../database/entities/interview-question.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { QuestionsService } from './questions.service';
import { RecommendationsService } from './recommendations.service';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(JobRole)
    private jobRoleRepository: Repository<JobRole>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(InterviewQuestion)
    private questionRepository: Repository<InterviewQuestion>,
    private questionsService: QuestionsService,
    private recommendationsService: RecommendationsService,
  ) {}

  async create(userId: string, dto: CreateInterviewDto) {
    // 1. Verify Job Role exists
    const jobRole = await this.jobRoleRepository.findOne({
      where: { id: dto.jobRoleId },
    });
    if (!jobRole) {
      throw new NotFoundException('Selected job role not found');
    }

    // 2. Resolve Resume
    let resumeId = dto.resumeId;
    if (resumeId) {
      const resume = await this.resumeRepository.findOne({
        where: { id: resumeId },
      });
      if (!resume || resume.userId !== userId) {
        throw new ForbiddenException('Selected resume is invalid or not owned by you');
      }
    } else {
      const activeResume = await this.resumeRepository.findOne({
        where: { userId, isActive: true },
        order: { uploadedAt: 'DESC' },
      });
      if (activeResume) {
        resumeId = activeResume.id;
      }
    }

    // 3. Question Count bounds (5 to 20)
    const questionCount = Math.min(20, Math.max(5, dto.questionCount || 10));

    // 4. Create interview record in CREATED state
    const interview = this.interviewRepository.create({
      userId,
      jobRoleId: dto.jobRoleId,
      resumeId,
      interviewType: dto.interviewType,
      difficulty: dto.difficulty,
      status: InterviewStatus.CREATED,
      totalQuestions: questionCount,
      answeredQuestions: 0,
      targetCompany: dto.targetCompany,
      targetRole: dto.targetRole,
      experienceLevel: dto.experienceLevel,
      interviewRound: dto.interviewRound,
      jobDescription: dto.jobDescription,
    });

    const saved = await this.interviewRepository.save(interview);
    return this.findOne(userId, saved.id);
  }

  async startInterview(userId: string, interviewId: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: ['jobRole', 'questions', 'answers'],
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.userId !== userId) {
      throw new ForbiddenException('Unauthorized access to interview');
    }

    // Handle State Machine
    if (interview.status === InterviewStatus.COMPLETED || interview.status === InterviewStatus.EVALUATED) {
      throw new BadRequestException('This interview has already been completed');
    }

    if (interview.status === InterviewStatus.CREATED) {
      interview.status = InterviewStatus.IN_PROGRESS;
      interview.startedAt = new Date();
      await this.interviewRepository.save(interview);

      // Try to generate first question, revert state if it fails
      try {
        const firstQuestion = await this.questionsService.generateNextQuestion(interviewId);
        return {
          interview: {
            id: interview.id,
            status: interview.status,
            jobRole: interview.jobRole?.title,
            interviewType: interview.interviewType,
            difficulty: interview.difficulty,
            totalQuestions: interview.totalQuestions,
            answeredQuestions: interview.answeredQuestions,
            startedAt: interview.startedAt,
          },
          currentQuestion: firstQuestion
            ? {
                id: firstQuestion.id,
                questionNumber: firstQuestion.questionNumber,
                questionText: firstQuestion.questionText,
                questionCategory: firstQuestion.questionCategory,
                expectedPoints: firstQuestion.expectedPoints,
              }
            : null,
          progress: {
            current: 1,
            total: interview.totalQuestions,
            percentage: 0,
          },
        };
      } catch (error) {
        // Revert status to CREATED so user can retry
        interview.status = InterviewStatus.CREATED;
        interview.startedAt = null;
        await this.interviewRepository.save(interview);
        throw new BadRequestException(`Failed to start interview: ${error.message}`);
      }
    }

    // Ensure first question is generated if no questions exist
    let currentQuestion: InterviewQuestion | null = null;
    if (!interview.questions || interview.questions.length === 0) {
      currentQuestion = await this.questionsService.generateNextQuestion(interviewId);
    } else {
      // Pick the currently active unanswered question (ordered by question number)
      const sortedQuestions = [...(interview.questions || [])].sort(
        (a, b) => a.questionNumber - b.questionNumber,
      );
      const answeredQIds = new Set((interview.answers || []).map((a) => a.questionId));
      currentQuestion = sortedQuestions.find((q) => !answeredQIds.has(q.id)) || null;

      // If all generated questions answered but totalQuestions not reached, generate next
      if (!currentQuestion && interview.answeredQuestions < interview.totalQuestions) {
        currentQuestion = await this.questionsService.generateNextQuestion(interviewId);
      }
    }

    return {
      interview: {
        id: interview.id,
        status: interview.status,
        jobRole: interview.jobRole?.title,
        interviewType: interview.interviewType,
        difficulty: interview.difficulty,
        totalQuestions: interview.totalQuestions,
        answeredQuestions: interview.answeredQuestions,
        startedAt: interview.startedAt,
      },
      currentQuestion: currentQuestion
        ? {
            id: currentQuestion.id,
            questionNumber: currentQuestion.questionNumber,
            questionText: currentQuestion.questionText,
            questionCategory: currentQuestion.questionCategory,
            expectedPoints: currentQuestion.expectedPoints,
          }
        : null,
      progress: {
        current: interview.answeredQuestions + 1,
        total: interview.totalQuestions,
        percentage: Math.round(
          (interview.answeredQuestions / interview.totalQuestions) * 100,
        ),
      },
    };
  }

  async findOne(userId: string, interviewId: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: ['jobRole', 'resume', 'questions', 'answers'],
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.userId !== userId) {
      throw new ForbiddenException('Unauthorized access to interview');
    }

    // Sort questions by number
    const sortedQuestions = (interview.questions || []).sort(
      (a, b) => a.questionNumber - b.questionNumber,
    );

    // Identify active question
    const answeredMap = new Map((interview.answers || []).map((a) => [a.questionId, a]));
    const activeQuestion = sortedQuestions.find((q) => !answeredMap.has(q.id)) || null;

    return {
      id: interview.id,
      status: interview.status,
      jobRole: interview.jobRole,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
      totalQuestions: interview.totalQuestions,
      answeredQuestions: interview.answeredQuestions,
      overallScore: interview.overallScore,
      startedAt: interview.startedAt,
      completedAt: interview.completedAt,
      createdAt: interview.createdAt,
      activeQuestion: activeQuestion
        ? {
            id: activeQuestion.id,
            questionNumber: activeQuestion.questionNumber,
            questionText: activeQuestion.questionText,
            questionCategory: activeQuestion.questionCategory,
            expectedPoints: activeQuestion.expectedPoints,
          }
        : null,
      questions: sortedQuestions.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        questionCategory: q.questionCategory,
        isAnswered: answeredMap.has(q.id),
      })),
    };
  }

  async findAll(userId: string, page = 1, limit = 10, status?: string) {
    const query = this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.jobRole', 'jobRole')
      .where('interview.userId = :userId', { userId });

    if (status) {
      query.andWhere('interview.status = :status', { status });
    }

    query
      .orderBy('interview.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async completeInterview(userId: string, interviewId: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.userId !== userId) {
      throw new ForbiddenException('Unauthorized access to interview');
    }

    interview.status = InterviewStatus.COMPLETED;
    interview.completedAt = new Date();
    await this.interviewRepository.save(interview);

    return {
      success: true,
      message: 'Interview marked as COMPLETED. Ready for comprehensive evaluation.',
      interviewId: interview.id,
      completedAt: interview.completedAt,
    };
  }

  async getInterviewQuestions(userId: string, interviewId: string) {
    const interview = await this.findOne(userId, interviewId);
    return interview.questions;
  }

  async getInterviewReport(userId: string, interviewId: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: [
        'jobRole',
        'questions',
        'answers',
        'answers.question',
        'answers.evaluation',
        'recommendations',
      ],
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.userId !== userId) {
      throw new ForbiddenException('Unauthorized access to interview report');
    }

    // If completed but not yet evaluated, generate recommendations
    let recommendation = interview.recommendations?.[0] || null;
    if (!recommendation && interview.status === InterviewStatus.COMPLETED) {
      recommendation = await this.recommendationsService.generateRecommendations(interviewId);
    }

    // Sort Q&As by question number
    const qaBreakdown = (interview.answers || []).map((ans) => ({
      answerId: ans.id,  // ADDED: For Try Again feature
      questionNumber: ans.question?.questionNumber || 1,
      questionText: ans.question?.questionText || '',
      questionCategory: ans.question?.questionCategory || 'General',
      expectedPoints: ans.question?.expectedPoints || [],
      studentAnswer: ans.answerText,
      timeTakenSeconds: ans.timeTakenSeconds || 0,
      evaluation: ans.evaluation
        ? {
            score: Number(ans.evaluation.score),
            accuracyScore: Number(ans.evaluation.accuracyScore),
            completenessScore: Number(ans.evaluation.completenessScore),
            clarityScore: Number(ans.evaluation.clarityScore),
            relevanceScore: Number(ans.evaluation.relevanceScore),
            feedback: ans.evaluation.feedback,
            strengths: ans.evaluation.strengths || [],
            weaknesses: ans.evaluation.weaknesses || [],
            // Coaching fields
            modelAnswer: ans.evaluation.modelAnswer || null,
            whyBetter: ans.evaluation.whyBetter || null,
            answerFramework: ans.evaluation.answerFramework || null,
            keyConcepts: ans.evaluation.keyConcepts || [],
            studyRecommendations: ans.evaluation.studyRecommendations || [],
          }
        : null,
    })).sort((a, b) => a.questionNumber - b.questionNumber);

    return {
      id: interview.id,
      status: interview.status,
      jobRole: interview.jobRole?.title || 'Software Developer',
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
      overallScore: Number(interview.overallScore || 0),
      totalQuestions: interview.totalQuestions,
      answeredQuestions: interview.answeredQuestions,
      startedAt: interview.startedAt,
      completedAt: interview.completedAt,
      targetCompany: interview.targetCompany,
      targetRole: interview.targetRole,
      experienceLevel: interview.experienceLevel,
      interviewRound: interview.interviewRound,
      recommendations: recommendation
        ? {
            overallFeedback: recommendation.overallFeedback,
            strengths: recommendation.strengths || [],
            weaknesses: recommendation.weaknesses || [],
            topicsToImprove: recommendation.topicsToImprove || [],
            recommendedResources: recommendation.recommendedResources || [],
          }
        : null,
      qaBreakdown,
    };
  }
}
