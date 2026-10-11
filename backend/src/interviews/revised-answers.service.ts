import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RevisedAnswer } from '../database/entities/revised-answer.entity';
import { InterviewAnswer } from '../database/entities/interview-answer.entity';
import { InterviewQuestion } from '../database/entities/interview-question.entity';

export interface SubmitRevisedAnswerDto {
  answerId: string;
  revisedText: string;
}

@Injectable()
export class RevisedAnswersService {
  private readonly logger = new Logger(RevisedAnswersService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(RevisedAnswer)
    private revisedAnswerRepository: Repository<RevisedAnswer>,
    @InjectRepository(InterviewAnswer)
    private answerRepository: Repository<InterviewAnswer>,
    @InjectRepository(InterviewQuestion)
    private questionRepository: Repository<InterviewQuestion>,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
  }

  async submitRevisedAnswer(dto: SubmitRevisedAnswerDto): Promise<RevisedAnswer> {
    const { answerId, revisedText } = dto;

    // Validate revised text is not empty
    if (!revisedText || revisedText.trim().length === 0) {
      throw new BadRequestException('Revised answer cannot be empty');
    }

    // Get original answer
    const originalAnswer = await this.answerRepository.findOne({
      where: { id: answerId },
      relations: ['question', 'interview'],
    });

    if (!originalAnswer) {
      throw new NotFoundException('Original answer not found');
    }

    // Check if revised text is same as original
    if (revisedText.trim() === originalAnswer.answerText.trim()) {
      throw new BadRequestException('Revised answer must be different from original');
    }

    // Count existing revisions for this answer
    const existingRevisions = await this.revisedAnswerRepository.count({
      where: { originalAnswerId: answerId },
    });

    const revisionNumber = existingRevisions + 1;

    // Evaluate the revised answer
    const question = originalAnswer.question;
    const interview = originalAnswer.interview;

    let accuracy = 0;
    let completeness = 0;
    let clarity = 0;
    let relevance = 0;
    let feedback = 'Evaluation pending';
    let strengths = [];
    let weaknesses = [];
    let evaluationSuccess = false;

    try {
      const response = await fetch(`${this.aiServiceUrl}/evaluation/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.questionText,
          question_type: interview.interviewType,
          difficulty: interview.difficulty,
          student_answer: revisedText,
          expected_key_points: question.expectedPoints || [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const bd = data.breakdown || {};

        const validateScore = (score: number, fallback: number): number => {
          const num = Number(score);
          if (isNaN(num) || num < 0 || num > 100) {
            return fallback;
          }
          return num;
        };

        accuracy = validateScore(bd.technical_accuracy, 0);
        completeness = validateScore(bd.completeness, 0);
        clarity = validateScore(bd.clarity, 0);
        relevance = validateScore(bd.relevance, 0);
        feedback = data.detailed_feedback || 'Good revision';
        strengths = data.strengths || [];
        weaknesses = data.areas_for_improvement || [];
        evaluationSuccess = true;
      }
    } catch (err) {
      this.logger.error(`Failed to evaluate revised answer: ${err.message}`);
    }

    if (!evaluationSuccess) {
      this.logger.warn('Revised answer evaluation failed, using placeholder scores');
      feedback = 'Unable to evaluate revised answer at this time. Please try again later.';
    }

    const calculatedScore = Number(
      ((accuracy * 0.35) + (completeness * 0.30) + (clarity * 0.20) + (relevance * 0.15)).toFixed(2),
    );

    const revisedAnswer = this.revisedAnswerRepository.create({
      originalAnswerId: answerId,
      questionId: question.id,
      revisedText,
      revisionNumber,
      score: calculatedScore,
      accuracyScore: accuracy,
      completenessScore: completeness,
      clarityScore: clarity,
      relevanceScore: relevance,
      feedback,
      strengths,
      weaknesses,
    });

    return this.revisedAnswerRepository.save(revisedAnswer);
  }

  async getRevisionsByAnswer(answerId: string): Promise<RevisedAnswer[]> {
    return this.revisedAnswerRepository.find({
      where: { originalAnswerId: answerId },
      order: { revisionNumber: 'ASC' },
    });
  }

  async getRevisionById(revisionId: string): Promise<RevisedAnswer | null> {
    return this.revisedAnswerRepository.findOne({
      where: { id: revisionId },
      relations: ['originalAnswer', 'question'],
    });
  }
}
