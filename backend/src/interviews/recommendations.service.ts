import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Recommendation } from '../database/entities/recommendation.entity';
import { Interview, InterviewStatus } from '../database/entities/interview.entity';
import { InterviewAnswer } from '../database/entities/interview-answer.entity';
import { Evaluation } from '../database/entities/evaluation.entity';
import { EvaluationsService } from './evaluations.service';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewAnswer)
    private answerRepository: Repository<InterviewAnswer>,
    private evaluationsService: EvaluationsService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
  }

  async generateRecommendations(interviewId: string): Promise<Recommendation> {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: ['jobRole', 'answers', 'answers.question'],
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Ensure all answers have evaluations
    const answers = interview.answers || [];
    const evaluationPromises = answers.map((ans) =>
      this.evaluationsService.evaluateAnswer(ans.id),
    );
    const evaluations = await Promise.all(evaluationPromises);

    // Calculate aggregated overall score in backend application code
    const validScores = evaluations.map((e) => Number(e.score)).filter((s) => !isNaN(s));
    const averageScore = validScores.length > 0
      ? Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2))
      : 70.0;

    // Collect QA transcript for AI recommendations
    const qaList = answers.map((a, idx) => ({
      question: a.question?.questionText || `Question ${idx + 1}`,
      answer: a.answerText,
      score: evaluations[idx]?.score || 70,
    }));

    let overallFeedback = 'Interview successfully completed. Keep practicing to enhance technical communication.';
    let strengths = ['Committed approach to interview questions', 'Consistent response structure'];
    let weaknesses = ['Deepen hands-on familiarity with system architecture'];
    let topicsToImprove = ['Core Competencies', 'System Design'];
    let recommendedResources: any = [
      { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
    ];

    try {
      const response = await fetch(`${this.aiServiceUrl}/evaluation/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_role: interview.jobRole?.title || 'Software Developer',
          interview_type: interview.interviewType,
          difficulty: interview.difficulty,
          overall_score: averageScore,
          questions_and_answers: qaList,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        overallFeedback = data.overall_feedback || overallFeedback;
        strengths = data.strengths || strengths;
        weaknesses = data.weaknesses || weaknesses;
        topicsToImprove = data.topics_to_improve || topicsToImprove;
        recommendedResources = data.recommended_resources || recommendedResources;
      }
    } catch (err) {
      this.logger.warn(`AI recommendations service offline (${err.message}), using fallback recommendations`);
    }

    // Check if recommendation record already exists
    let recommendation = await this.recommendationRepository.findOne({
      where: { interviewId },
    });

    if (!recommendation) {
      recommendation = this.recommendationRepository.create({
        interviewId,
        overallFeedback,
        strengths,
        weaknesses,
        topicsToImprove,
        recommendedResources,
      });
    } else {
      recommendation.overallFeedback = overallFeedback;
      recommendation.strengths = strengths;
      recommendation.weaknesses = weaknesses;
      recommendation.topicsToImprove = topicsToImprove;
      recommendation.recommendedResources = recommendedResources;
    }

    const savedRec = await this.recommendationRepository.save(recommendation);

    // Transition interview state to EVALUATED and persist overallScore
    interview.overallScore = averageScore;
    interview.status = InterviewStatus.EVALUATED;
    await this.interviewRepository.save(interview);

    return savedRec;
  }

  async getRecommendationByInterview(interviewId: string): Promise<Recommendation | null> {
    return this.recommendationRepository.findOne({ where: { interviewId } });
  }
}
