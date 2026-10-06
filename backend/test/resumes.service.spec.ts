import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResumesService } from '../src/resumes/resumes.service';
import {
  Resume,
  ResumeProcessingStatus,
  ResumeAnalysisStatus,
} from '../src/database/entities/resume.entity';
import { StudentProfile } from '../src/profiles/entities/profile.entity';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('ResumesService Security & Operations', () => {
  let service: ResumesService;
  let mockResumeRepo: any;
  let mockProfileRepo: any;

  beforeEach(async () => {
    mockResumeRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn((dto) => dto),
      remove: jest.fn(),
      update: jest.fn(),
    };
    mockProfileRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumesService,
        {
          provide: getRepositoryToken(Resume),
          useValue: mockResumeRepo,
        },
        {
          provide: getRepositoryToken(StudentProfile),
          useValue: mockProfileRepo,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8000'),
          },
        },
      ],
    }).compile();

    service = module.get<ResumesService>(ResumesService);
  });

  describe('Ownership Security Isolation', () => {
    it('should throw ForbiddenException when User A attempts to view User B resume', async () => {
      const mockResume: Partial<Resume> = {
        id: 'res-999',
        userId: 'student-b',
        fileName: 'student_b_cv.pdf',
      };
      mockResumeRepo.findOne.mockResolvedValue(mockResume);

      // Student A tries to access Student B's resume
      await expect(
        service.getResumeById('student-a', 'res-999'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow User A to view their own resume', async () => {
      const mockResume: Partial<Resume> = {
        id: 'res-111',
        userId: 'student-a',
        fileName: 'student_a_cv.pdf',
      };
      mockResumeRepo.findOne.mockResolvedValue(mockResume);

      const result = await service.getResumeById('student-a', 'res-111');
      expect(result.id).toBe('res-111');
      expect(result.userId).toBe('student-a');
    });

    it('should throw NotFoundException if resume does not exist', async () => {
      mockResumeRepo.findOne.mockResolvedValue(null);
      await expect(
        service.getResumeById('student-a', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('File Upload Validation', () => {
    it('should reject file upload when no file is provided', async () => {
      await expect(
        service.uploadResume('student-a', null as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject executable or disallowed file types (e.g. .exe, .sh)', async () => {
      const invalidFile: any = {
        originalname: 'malicious_script.sh',
        mimetype: 'application/x-sh',
        size: 1024,
        buffer: Buffer.from('echo hello'),
      };

      await expect(
        service.uploadResume('student-a', invalidFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject files exceeding the 5MB size limit', async () => {
      const oversizedFile: any = {
        originalname: 'large_cv.pdf',
        mimetype: 'application/pdf',
        size: 6 * 1024 * 1024, // 6MB
        buffer: Buffer.alloc(100),
      };

      await expect(
        service.uploadResume('student-a', oversizedFile),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
