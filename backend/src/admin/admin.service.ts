import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
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
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        isActive: u.is_active,
        firstName: u.profile?.first_name || '',
        lastName: u.profile?.last_name || '',
        createdAt: u.created_at,
      })),
      total,
      page,
      limit,
    };
  }
}
