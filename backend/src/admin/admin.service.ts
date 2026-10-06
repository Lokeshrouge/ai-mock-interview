import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Interview, InterviewStatus } from '../database/entities/interview.entity';
import { Resume } from '../database/entities/resume.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const totalInterviews = await this.interviewRepository.count();
    const completedInterviews = await this.interviewRepository.count({
      where: [
        { status: InterviewStatus.COMPLETED },
        { status: InterviewStatus.EVALUATED },
      ],
    });
    const totalResumes = await this.resumeRepository.count();

    // Average score calculation
    const scoreResult = await this.interviewRepository
      .createQueryBuilder('interview')
      .select('AVG(interview.overallScore)', 'avgScore')
      .where('interview.overallScore IS NOT NULL')
      .getRawOne();

    const averageScore = scoreResult?.avgScore
      ? Number(Number(scoreResult.avgScore).toFixed(1))
      : 0;

    // Recent interview activity
    const recentInterviews = await this.interviewRepository.find({
      relations: ['jobRole', 'user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalUsers,
      totalInterviews,
      completedInterviews,
      totalResumes,
      averageScore,
      recentActivity: recentInterviews.map((item) => ({
        id: item.id,
        userEmail: item.user?.email || 'Unknown',
        jobRole: item.jobRole?.title || 'Unknown',
        type: item.interviewType,
        status: item.status,
        overallScore: item.overallScore,
        createdAt: item.createdAt,
      })),
    };
  }

  async getAllUsers(page = 1, limit = 20) {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['profile'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        firstName: u.profile?.firstName || '',
        lastName: u.profile?.lastName || '',
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async toggleUserStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = !user.isActive;
    await this.userRepository.save(user);
    return { id: user.id, isActive: user.isActive };
  }

  async getSystemSettings() {
    return {
      appName: 'AI Mock Interview & Evaluation System',
      version: '1.0.0-MVP',
      aiProvider: process.env.AI_PROVIDER || 'openai',
      aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
      maxResumeSizeBytes: 5 * 1024 * 1024,
      allowedResumeExtensions: ['.pdf', '.docx'],
      minAnswerLengthChars: 50,
      questionLimits: { min: 5, max: 20, default: 10 },
      rubricWeights: {
        technicalAccuracy: 0.35,
        completeness: 0.30,
        clarity: 0.20,
        relevance: 0.15,
      },
    };
  }
}
