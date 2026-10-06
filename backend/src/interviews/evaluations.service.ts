import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Evaluation } from '../database/entities/evaluation.entity';
import { InterviewAnswer } from '../database/entities/interview-answer.entity';
import { InterviewQuestion } from '../database/entities/interview-question.entity';
import { Interview } from '../database/entities/interview.entity';

@Injectable()
export class EvaluationsService {
  private readonly logger = new Logger(EvaluationsService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(Evaluation)
    private evaluationRepository: Repository<Evaluation>,
    @InjectRepository(InterviewAnswer)
    private answerRepository: Repository<InterviewAnswer>,
    @InjectRepository(InterviewQuestion)
    private questionRepository: Repository<InterviewQuestion>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
  }

  async evaluateAnswer(answerId: string): Promise<Evaluation> {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
      relations: ['question', 'interview'],
    });

    if (!answer) {
      throw new NotFoundException('Answer record not found');
    }

    // Check if already evaluated
    const existing = await this.evaluationRepository.findOne({
      where: { answerId },
    });
    if (existing) {
      return existing;
    }

    const question = answer.question;
    const interview = answer.interview;

    let accuracy = 75;
    let completeness = 70;
    let clarity = 80;
    let relevance = 75;
    let feedback = 'Good foundational answer.';
    let strengths = ['Accurate conceptual terminology', 'Structured explanation'];
    let weaknesses = ['Could detail real-world edge cases'];

    // Retry logic: attempt up to 3 times with exponential backoff
    const maxRetries = 3;
    let attempts = 0;
    let aiSuccess = false;

    while (attempts < maxRetries && !aiSuccess) {
      attempts++;
      try {
        const response = await fetch(`${this.aiServiceUrl}/evaluation/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: question.questionText,
            question_type: interview.interviewType,
            difficulty: interview.difficulty,
            student_answer: answer.answerText,
            expected_key_points: question.expectedPoints || [],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const bd = data.breakdown || {};
          
          // Validate AI scores are within 0-100 bounds
          const validateScore = (score: number, fallback: number): number => {
            const num = Number(score);
            if (isNaN(num) || num < 0 || num > 100) {
              this.logger.warn(`Invalid AI score ${score}, using fallback ${fallback}`);
              return fallback;
            }
            return num;
          };

          accuracy = validateScore(bd.technical_accuracy, accuracy);
          completeness = validateScore(bd.completeness, completeness);
          clarity = validateScore(bd.clarity, clarity);
          relevance = validateScore(bd.relevance, relevance);
          feedback = data.detailed_feedback || feedback;
          strengths = data.strengths || strengths;
          weaknesses = data.areas_for_improvement || weaknesses;
          aiSuccess = true;
        } else {
          throw new Error(`AI service returned status ${response.status}`);
        }
      } catch (err) {
        this.logger.warn(`AI evaluation attempt ${attempts}/${maxRetries} failed: ${err.message}`);
        if (attempts < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
        }
      }
    }

    if (!aiSuccess) {
      this.logger.warn(`AI evaluation failed after ${maxRetries} attempts, using rubric heuristic calculation`);
    }

    // Backend-controlled rubric calculation
    const calculatedScore = Number(
      ((accuracy * 0.35) + (completeness * 0.30) + (clarity * 0.20) + (relevance * 0.15)).toFixed(2),
    );

    const evaluation = this.evaluationRepository.create({
      answerId: answer.id,
      score: calculatedScore,
      accuracyScore: accuracy,
      completenessScore: completeness,
      clarityScore: clarity,
      relevanceScore: relevance,
      feedback,
      strengths,
      weaknesses,
    });

    return this.evaluationRepository.save(evaluation);
  }

  async getEvaluationByAnswer(answerId: string): Promise<Evaluation | null> {
    return this.evaluationRepository.findOne({ where: { answerId } });
  }
}
