import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfilesService } from '../src/profiles/profiles.service';
import { StudentProfile } from '../src/profiles/entities/profile.entity';
import { User, UserRole } from '../src/users/entities/user.entity';
import { Resume } from '../src/database/entities/resume.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let mockProfileRepo: any;
  let mockUserRepo: any;
  let mockResumeRepo: any;

  beforeEach(async () => {
    mockProfileRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((dto) => dto),
    };
    mockUserRepo = {
      findOne: jest.fn(),
    };
    mockResumeRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(StudentProfile),
          useValue: mockProfileRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Resume),
          useValue: mockResumeRepo,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should throw NotFoundException if profile does not exist', async () => {
      mockProfileRepo.findOne.mockResolvedValue(null);
      await expect(service.getProfile('user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return profile and calculate completion correctly', async () => {
      const mockProfile: Partial<StudentProfile> = {
        id: 'prof-1',
        user_id: 'user-123',
        first_name: 'Alex',
        last_name: 'Johnson',
        phone: '+1 555-0199',
        education: {
          college: 'MIT',
          degree: 'B.Sc.',
          department: 'Computer Science',
          graduationYear: 2025,
        },
        target_role: 'Full Stack Engineer',
        experience_level: 'Entry Level (0-1 yr)',
        technical_skills: ['TypeScript', 'Node.js', 'React'],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockProfileRepo.findOne.mockResolvedValue(mockProfile);
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-123',
        email: 'alex@example.com',
      });
      mockResumeRepo.findOne.mockResolvedValue({ id: 'resume-1', isActive: true });

      const result = await service.getProfile('user-123');
      expect(result.profile.firstName).toBe('Alex');
      expect(result.profile.email).toBe('alex@example.com');
      expect(result.hasActiveResume).toBe(true);
      // All 5 sections complete = 100%
      expect(result.completion.percentage).toBe(100);
      expect(result.completion.missingSections.length).toBe(0);
    });
  });

  describe('calculateCompletion', () => {
    it('should calculate partial completion when sections are missing', () => {
      const partialProfile: Partial<StudentProfile> = {
        first_name: 'Alex',
        last_name: 'Johnson',
        phone: '', // missing
        education: null, // missing
        target_role: '', // missing
        technical_skills: [], // missing
      };

      const completion = service.calculateCompletion(
        partialProfile as StudentProfile,
        false, // no resume
      );

      expect(completion.percentage).toBe(0);
      expect(completion.breakdown.basicInfo).toBe(false);
      expect(completion.breakdown.education).toBe(false);
      expect(completion.breakdown.careerGoal).toBe(false);
      expect(completion.breakdown.skills).toBe(false);
      expect(completion.breakdown.resume).toBe(false);
      expect(completion.missingSections.length).toBe(5);
    });
  });
});
