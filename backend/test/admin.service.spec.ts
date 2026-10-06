import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from '../src/admin/admin.service';
import { User, UserRole } from '../src/database/entities/user.entity';
import { Interview, InterviewStatus } from '../src/database/entities/interview.entity';
import { Resume } from '../src/database/entities/resume.entity';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let mockUserRepo: any;
  let mockInterviewRepo: any;
  let mockResumeRepo: any;

  beforeEach(async () => {
    mockUserRepo = {
      count: jest.fn().mockResolvedValue(10),
      findAndCount: jest.fn().mockResolvedValue([
        [
          {
            id: 'user-1',
            email: 'candidate@example.com',
            role: UserRole.STUDENT,
            isActive: true,
            createdAt: new Date(),
            profile: { firstName: 'John', lastName: 'Doe' },
          },
        ],
        1,
      ]),
      findOne: jest.fn(),
      save: jest.fn((entity) => entity),
    };

    mockInterviewRepo = {
      count: jest.fn().mockResolvedValue(5),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avgScore: 84.5 }),
      })),
      find: jest.fn().mockResolvedValue([]),
    };

    mockResumeRepo = {
      count: jest.fn().mockResolvedValue(8),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Interview),
          useValue: mockInterviewRepo,
        },
        {
          provide: getRepositoryToken(Resume),
          useValue: mockResumeRepo,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should return aggregated platform dashboard telemetry', async () => {
    const stats = await service.getDashboardStats();

    expect(stats.totalUsers).toBe(10);
    expect(stats.totalInterviews).toBe(5);
    expect(stats.totalResumes).toBe(8);
    expect(stats.averageScore).toBe(84.5);
    expect(Array.isArray(stats.recentActivity)).toBe(true);
  });

  it('should retrieve paginated user directory with profile details', async () => {
    const result = await service.getAllUsers(1, 10);

    expect(result.total).toBe(1);
    expect(result.users).toHaveLength(1);
    expect(result.users[0].email).toBe('candidate@example.com');
    expect(result.users[0].firstName).toBe('John');
    expect(result.users[0].lastName).toBe('Doe');
  });

  it('should toggle user active status', async () => {
    mockUserRepo.findOne.mockResolvedValue({
      id: 'user-1',
      isActive: true,
    });

    const result = await service.toggleUserStatus('user-1');

    expect(result.isActive).toBe(false);
    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
  });

  it('should throw NotFoundException when toggling non-existent user', async () => {
    mockUserRepo.findOne.mockResolvedValue(null);

    await expect(service.toggleUserStatus('unknown-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return system settings', async () => {
    const settings = await service.getSystemSettings();

    expect(settings.appName).toBeDefined();
    expect(settings.rubricWeights.technicalAccuracy).toBe(0.35);
    expect(settings.rubricWeights.completeness).toBe(0.30);
  });
});
