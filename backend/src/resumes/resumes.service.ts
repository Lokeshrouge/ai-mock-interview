import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  Resume,
  ResumeProcessingStatus,
  ResumeAnalysisStatus,
} from '../database/entities/resume.entity';
import { StudentProfile } from '../profiles/entities/profile.entity';

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);
  private readonly uploadDir: string;
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(StudentProfile)
    private profileRepository: Repository<StudentProfile>,
    private configService: ConfigService,
  ) {
    this.uploadDir = path.resolve(process.cwd(), 'uploads', 'resumes');
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadResume(
    userId: string,
    file: Express.Multer.File,
  ): Promise<Resume> {
    if (!file) {
      throw new BadRequestException('No resume file provided');
    }

    // Validate extension & mime
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (!['pdf', 'docx'].includes(ext)) {
      throw new BadRequestException(
        `Invalid file type (.${ext}). Only PDF and DOCX files are permitted.`,
      );
    }

    const validMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/octet-stream', // sometimes sent by specific clients
    ];
    if (!validMimes.includes(file.mimetype)) {
      throw new BadRequestException('MIME type does not match PDF or DOCX format');
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('File size exceeds the 5MB limit');
    }

    // Secure randomized filename
    const secureRandomName = `${crypto.randomUUID()}.${ext}`;
    const targetFilePath = path.join(this.uploadDir, secureRandomName);

    // Save to disk
    fs.writeFileSync(targetFilePath, file.buffer);

    // Deactivate previous active resumes for this student
    await this.resumeRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );

    const resume = this.resumeRepository.create({
      userId,
      fileName: path.basename(file.originalname),
      storedFileName: secureRandomName,
      filePath: targetFilePath,
      fileType: ext,
      mimeType: file.mimetype,
      fileSize: file.size,
      processingStatus: ResumeProcessingStatus.UPLOADED,
      analysisStatus: ResumeAnalysisStatus.PENDING,
      isActive: true,
    });

    const saved = await this.resumeRepository.save(resume);

    // Asynchronously trigger processing so upload response is lightning fast
    this.processResumeAsync(saved.id, userId, targetFilePath, ext);

    return saved;
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    return this.resumeRepository.find({
      where: { userId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async getResumeById(userId: string, resumeId: string): Promise<Resume> {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException('Access to this resume is unauthorized');
    }

    return resume;
  }

  async deleteResume(userId: string, resumeId: string): Promise<{ success: boolean; message: string }> {
    const resume = await this.getResumeById(userId, resumeId);

    // Remove file from disk
    if (fs.existsSync(resume.filePath)) {
      try {
        fs.unlinkSync(resume.filePath);
      } catch (err) {
        this.logger.warn(`Failed to unlink file ${resume.filePath}: ${err.message}`);
      }
    }

    await this.resumeRepository.remove(resume);
    return { success: true, message: 'Resume deleted successfully' };
  }

  async getResumeFileStream(userId: string, resumeId: string) {
    const resume = await this.getResumeById(userId, resumeId);
    if (!fs.existsSync(resume.filePath)) {
      throw new NotFoundException('Resume file not found on disk');
    }
    return {
      stream: fs.createReadStream(resume.filePath),
      fileName: resume.fileName,
      mimeType: resume.mimeType,
      fileSize: resume.fileSize,
    };
  }

  async retryProcessing(userId: string, resumeId: string): Promise<Resume> {
    const resume = await this.getResumeById(userId, resumeId);

    if (!fs.existsSync(resume.filePath)) {
      throw new BadRequestException('Source file is missing. Please re-upload your resume.');
    }

    resume.processingStatus = ResumeProcessingStatus.PROCESSING;
    resume.analysisStatus = ResumeAnalysisStatus.ANALYZING;
    resume.errorMessage = null;
    await this.resumeRepository.save(resume);

    this.processResumeAsync(resume.id, userId, resume.filePath, resume.fileType);
    return resume;
  }

  async applyToProfile(userId: string, resumeId: string) {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume.parsedData) {
      throw new BadRequestException('No parsed data available to apply');
    }

    const profile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const parsed = resume.parsedData;
    if (parsed.skills && Array.isArray(parsed.skills)) {
      profile.technical_skills = Array.from(
        new Set([...(profile.technical_skills || []), ...parsed.skills]),
      );
    }
    if (parsed.programming_languages && Array.isArray(parsed.programming_languages)) {
      profile.programming_languages = Array.from(
        new Set([...(profile.programming_languages || []), ...parsed.programming_languages]),
      );
    }
    if (parsed.tools_technologies && Array.isArray(parsed.tools_technologies)) {
      profile.tools_technologies = Array.from(
        new Set([...(profile.tools_technologies || []), ...parsed.tools_technologies]),
      );
    }
    if (!profile.target_role && parsed.target_role) {
      profile.target_role = parsed.target_role;
    }
    if (!profile.experience_level && parsed.experience_level) {
      profile.experience_level = parsed.experience_level;
    }

    await this.profileRepository.save(profile);
    return { success: true, message: 'Extracted skills and technologies merged into profile' };
  }

  private async processResumeAsync(
    resumeId: string,
    userId: string,
    filePath: string,
    fileType: string,
  ) {
    try {
      await this.resumeRepository.update(
        { id: resumeId },
        {
          processingStatus: ResumeProcessingStatus.PROCESSING,
          analysisStatus: ResumeAnalysisStatus.ANALYZING,
        },
      );

      const fileBuffer = fs.readFileSync(filePath);

      // Attempt AI Service extraction & parsing
      let extractedText = '';
      let parsedData: any = null;

      try {
        const formData = new FormData();
        const blob = new Blob([fileBuffer], {
          type: fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        formData.append('file', blob, `resume.${fileType}`);

        const response = await fetch(`${this.aiServiceUrl}/resume/extract-and-parse`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = (await response.json()) as any;
          if (result.success) {
            extractedText = result.extracted_text;
            parsedData = result.parsed_data;
          } else {
            throw new Error(result.error || 'Text extraction failed in AI Service');
          }
        } else {
          throw new Error(`AI Service HTTP status ${response.status}`);
        }
      } catch (aiErr) {
        this.logger.warn(`AI Service unavailable (${aiErr.message}), executing local extraction fallback`);
        // Fallback local text extraction
        extractedText = this.localFallbackExtraction(fileBuffer, fileType);
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('Unable to extract text from document. File may be empty or corrupted.');
        }
        parsedData = {
          skills: ['Problem Solving', 'Communication'],
          programming_languages: [],
          tools_technologies: [],
          experience_level: 'Student / Fresher',
        };
      }

      await this.resumeRepository.update(
        { id: resumeId },
        {
          extractedText,
          parsedData,
          processingStatus: ResumeProcessingStatus.PROCESSED,
          analysisStatus: ResumeAnalysisStatus.COMPLETED,
          errorMessage: null,
        },
      );
    } catch (err) {
      this.logger.error(`Resume processing failed for ID ${resumeId}: ${err.message}`);
      await this.resumeRepository.update(
        { id: resumeId },
        {
          processingStatus: ResumeProcessingStatus.FAILED,
          analysisStatus: ResumeAnalysisStatus.FAILED,
          errorMessage: err.message || 'Processing failed',
        },
      );
    }
  }

  private localFallbackExtraction(buffer: Buffer, fileType: string): string {
    // Strip binary formatting to recover basic UTF-8 printable ASCII strings
    const str = buffer.toString('latin1');
    const matches = str.match(/[\x20-\x7E\t\n\r]{4,}/g) || [];
    const text = matches
      .filter((line) => !line.includes('/Type') && !line.includes('FontDescriptor'))
      .join('\n')
      .trim();
    return text.substring(0, 5000);
  }
}
