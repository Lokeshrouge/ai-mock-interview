import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InterviewQuestion } from '../database/entities/interview-question.entity';
import { Interview, InterviewStatus } from '../database/entities/interview.entity';
import { StudentProfile } from '../database/entities/student-profile.entity';
import { Resume } from '../database/entities/resume.entity';
import { JobRole } from '../database/entities/job-role.entity';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(InterviewQuestion)
    private questionRepository: Repository<InterviewQuestion>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(StudentProfile)
    private profileRepository: Repository<StudentProfile>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(JobRole)
    private jobRoleRepository: Repository<JobRole>,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
  }

  async generateNextQuestion(interviewId: string): Promise<InterviewQuestion> {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: ['jobRole', 'questions'],
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (
      interview.status !== InterviewStatus.IN_PROGRESS &&
      interview.status !== InterviewStatus.CREATED
    ) {
      throw new BadRequestException(
        `Cannot generate questions for interview in ${interview.status} state`,
      );
    }

    const currentCount = interview.questions?.length || 0;
    const nextQuestionNumber = currentCount + 1;

    if (nextQuestionNumber > interview.totalQuestions) {
      throw new BadRequestException('All questions for this interview have already been generated');
    }

    // Retrieve previous questions text to prevent repetition
    const previousQuestionTexts = (interview.questions || []).map((q) => q.questionText);

    // Retrieve student profile context
    const profile = await this.profileRepository.findOne({
      where: { userId: interview.userId },
    });

    // Retrieve resume context if attached
    let resumeSummary: string | null = null;
    let candidateSkills: string[] = [];

    const skillsJson = profile?.technicalSkills;
    if (skillsJson) {
      try {
        const parsed = typeof skillsJson === 'string' ? JSON.parse(skillsJson) : skillsJson;
        if (Array.isArray(parsed)) {
          candidateSkills = parsed;
        }
      } catch {
        candidateSkills = [];
      }
    }

    if (interview.resumeId) {
      const resume = await this.resumeRepository.findOne({
        where: { id: interview.resumeId },
      });
      if (resume) {
        if (resume.parsedData) {
          let parsed: any = resume.parsedData;
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch {
              parsed = null;
            }
          }
          if (parsed?.skills && Array.isArray(parsed.skills)) {
            candidateSkills = Array.from(
              new Set([...candidateSkills, ...parsed.skills]),
            );
          }
        }
        if (resume.extractedText) {
          resumeSummary = resume.extractedText.substring(0, 1500);
        }
      }
    }

    // Call FastAPI AI Service
    let generatedData: {
      question: string;
      topic: string;
      expected_points: string[];
    };

    try {
      const payload = {
        job_role: interview.jobRole?.title || 'Software Developer',
        interview_type: interview.interviewType,
        difficulty: interview.difficulty,
        question_number: nextQuestionNumber,
        total_questions: interview.totalQuestions,
        candidate_skills: candidateSkills,
        experience_level: profile?.experienceLevel || 'Entry Level',
        resume_summary: resumeSummary,
        previous_questions: previousQuestionTexts,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${this.aiServiceUrl}/questions/generate-adaptive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI Service returned status ${response.status}`);
      }

      const resJson = await response.json();
      generatedData = {
        question: resJson.question || resJson.question_text,
        topic: resJson.topic || resJson.questionCategory || 'General Technical',
        expected_points: resJson.expected_points || resJson.expected_key_points || [],
      };

      if (!generatedData.question) {
        throw new Error('AI Service returned empty question');
      }
    } catch (err) {
      this.logger.warn(`AI Service unavailable (${err.message}), using fallback question generator`);
      generatedData = this.getFallbackQuestion(
        interview.jobRole?.title || 'Software Developer',
        interview.interviewType,
        nextQuestionNumber,
      );
    }

    // Save and return question
    const question = this.questionRepository.create({
      interviewId: interview.id,
      questionNumber: nextQuestionNumber,
      questionText: generatedData.question,
      questionCategory: generatedData.topic,
      expectedPoints: generatedData.expected_points,
    });

    return this.questionRepository.save(question);
  }

  private getFallbackQuestion(
    role: string,
    type: string,
    questionNumber: number,
  ) {
    if (type === 'HR') {
      return {
        question: `Tell us about a time you managed project pressure and deadlines as a ${role}. How did you prioritize?`,
        topic: 'Time Management',
        expected_points: ['Prioritization framework', 'Stakeholder communication', 'Result'],
      };
    }
    if (type === 'PROJECT') {
      return {
        question: `Walk through the architectural design of a core project you built. What would you re-architect today and why?`,
        topic: 'System Architecture',
        expected_points: ['Tech stack rationale', 'Trade-offs', 'Lessons learned'],
      };
    }
    return {
      question: `Question #${questionNumber}: For a ${role} position, explain how you approach modularity, error handling, and testing in production.`,
      topic: 'Core Engineering Practices',
      expected_points: ['Code reusability', 'Exception safety', 'Automated test suite'],
    };
  }
}
