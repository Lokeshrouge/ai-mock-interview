import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProfilesService } from '../src/profiles/profiles.service';
import { StudentProfile } from '../src/profiles/entities/profile.entity';
import { User } from '../src/users/entities/user.entity';
import { Resume } from '../src/database/entities/resume.entity';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let mockProfileRepo: any;
  let mockUserRepo: any;
  let mockResumeRepo: any;

  beforeEach(async () => {
    mockProfileRepo = {
      findOne: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
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

  it('should return profile with completion details when found', async () => {
    mockProfileRepo.findOne.mockResolvedValue({
      id: 'prof-1',
      user_id: 'user-1',
      first_name: 'John',
      last_name: 'Doe',
      phone: '1234567890',
      target_role: 'Fullstack Developer',
      experience_level: 'MID',
      education: JSON.stringify({
        college: 'Test University',
        degree: 'B.Sc.',
        department: 'CS',
        graduationYear: 2025,
      }),
      technical_skills: JSON.stringify(['Node.js', 'React']),
      programming_languages: JSON.stringify(['TypeScript']),
      tools_technologies: JSON.stringify(['Git', 'Docker']),
      career_interests: JSON.stringify(['Web Development']),
    });

    mockUserRepo.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    });

    mockResumeRepo.findOne.mockResolvedValue({
      id: 'resume-1',
      isActive: true,
    });

    const result = await service.getProfile('user-1');

    expect(result).toBeDefined();
    expect(result.profile.firstName).toBe('John');
    expect(result.hasActiveResume).toBe(true);
    expect(result.completion.percentage).toBe(100);
    expect(result.completion.missingSections.length).toBe(0);
  });

  it('should throw NotFoundException if profile does not exist', async () => {
    mockProfileRepo.findOne.mockResolvedValue(null);

    await expect(service.getProfile('unknown-user')).rejects.toThrow(NotFoundException);
  });

  it('should update profile fields and return updated profile', async () => {
    const existing = {
      id: 'prof-1',
      user_id: 'user-1',
      first_name: 'John',
      last_name: 'Doe',
    };
    mockProfileRepo.findOne.mockResolvedValue(existing);
    mockUserRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'john@example.com' });
    mockResumeRepo.findOne.mockResolvedValue(null);

    const updateDto = {
      firstName: 'Jane',
      targetRole: 'Backend Engineer',
      experienceLevel: 'ENTRY',
    };

    const result = await service.updateProfile('user-1', updateDto);

    expect(mockProfileRepo.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should calculate 100% completion when all 5 dimensions are satisfied', () => {
    const profile = {
      first_name: 'Alice',
      last_name: 'Smith',
      phone: '9876543210',
      education: JSON.stringify({
        college: 'MIT',
        degree: 'B.S.',
        department: 'CS',
        graduationYear: 2024,
      }),
      target_role: 'Data Scientist',
      experience_level: 'SENIOR',
      technical_skills: ['Python', 'PyTorch'],
      programming_languages: ['Python'],
    } as any;

    const completion = service.calculateCompletion(profile, true);

    expect(completion.percentage).toBe(100);
    expect(completion.breakdown.basicInfo).toBe(true);
    expect(completion.breakdown.education).toBe(true);
    expect(completion.breakdown.careerGoal).toBe(true);
    expect(completion.breakdown.skills).toBe(true);
    expect(completion.breakdown.resume).toBe(true);
    expect(completion.missingSections.length).toBe(0);
  });

  it('should calculate partial completion and list missing sections accurately', () => {
    const incompleteProfile = {
      first_name: 'Bob',
      last_name: 'Lee',
      phone: '1112223333',
      education: null,
      target_role: null,
      experience_level: null,
      technical_skills: null,
      programming_languages: null,
    } as any;

    const completion = service.calculateCompletion(incompleteProfile, false);

    expect(completion.percentage).toBe(20); // 20% for basic info only
    expect(completion.breakdown.basicInfo).toBe(true);
    expect(completion.breakdown.education).toBe(false);
    expect(completion.breakdown.careerGoal).toBe(false);
    expect(completion.breakdown.skills).toBe(false);
    expect(completion.breakdown.resume).toBe(false);
    expect(completion.missingSections.length).toBe(4);
  });
});
