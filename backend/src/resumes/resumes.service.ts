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
import * as path from 'path';
import * as crypto from 'crypto';
import {
  Resume,
  ResumeProcessingStatus,
  ResumeAnalysisStatus,
} from '../database/entities/resume.entity';
import { StudentProfile } from '../database/entities/student-profile.entity';
import { TextExtractorService } from './text-extractor.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(StudentProfile)
    private profileRepository: Repository<StudentProfile>,
    private configService: ConfigService,
    private textExtractor: TextExtractorService,
    private storageService: StorageService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
    
    this.logger.log(`Resume service initialized with ${this.storageService.getStorageType()} storage`);
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

    // Upload to storage (local/S3/Cloudinary)
    const uploadResult = await this.storageService.uploadFile(
      file.buffer,
      secureRandomName,
      file.mimetype,
    );

    if (!uploadResult.success) {
      throw new BadRequestException(
        `Failed to upload file: ${uploadResult.error}`,
      );
    }

    // Deactivate previous active resumes for this student
    await this.resumeRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );

    const resume = this.resumeRepository.create({
      userId,
      fileName: path.basename(file.originalname),
      storedFileName: secureRandomName,
      filePath: uploadResult.filePath,
      fileType: ext,
      mimeType: file.mimetype,
      fileSize: file.size,
      processingStatus: ResumeProcessingStatus.UPLOADED,
      analysisStatus: ResumeAnalysisStatus.PENDING,
      isActive: true,
    });

    const saved = await this.resumeRepository.save(resume);

    // Asynchronously trigger processing so upload response is lightning fast
    this.processResumeAsync(saved.id, userId, file.buffer, ext);

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

    // Remove file from storage
    const deleted = await this.storageService.deleteFile(resume.filePath);
    if (!deleted) {
      this.logger.warn(`Failed to delete file ${resume.filePath} from storage`);
    }

    await this.resumeRepository.remove(resume);
    return { success: true, message: 'Resume deleted successfully' };
  }

  async getResumeFileStream(userId: string, resumeId: string) {
    const resume = await this.getResumeById(userId, resumeId);
    
    try {
      const fileBuffer = await this.storageService.getFile(resume.filePath);
      
      return {
        buffer: fileBuffer,
        fileName: resume.fileName,
        mimeType: resume.mimeType,
        fileSize: resume.fileSize,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve file: ${error.message}`);
      throw new NotFoundException('Resume file not found in storage');
    }
  }

  async retryProcessing(userId: string, resumeId: string): Promise<Resume> {
    const resume = await this.getResumeById(userId, resumeId);

    // Check if file exists in storage
    try {
      const fileBuffer = await this.storageService.getFile(resume.filePath);
      
      resume.processingStatus = ResumeProcessingStatus.PROCESSING;
      resume.analysisStatus = ResumeAnalysisStatus.ANALYZING;
      resume.errorMessage = null;
      await this.resumeRepository.save(resume);

      this.processResumeAsync(resume.id, userId, fileBuffer, resume.fileType);
      return resume;
    } catch (error) {
      throw new BadRequestException('Source file is missing. Please re-upload your resume.');
    }
  }

  async applyToProfile(userId: string, resumeId: string) {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume.parsedData) {
      throw new BadRequestException('No parsed data available to apply');
    }

    const profile = await this.profileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const parsed = resume.parsedData;
    if (parsed.skills && Array.isArray(parsed.skills)) {
      const currentSkills = profile.technicalSkills ? JSON.parse(profile.technicalSkills) : [];
      const newSkills = Array.from(new Set([...currentSkills, ...parsed.skills]));
      profile.technicalSkills = JSON.stringify(newSkills);
    }
    if (parsed.programming_languages && Array.isArray(parsed.programming_languages)) {
      const currentLangs = profile.programmingLanguages ? JSON.parse(profile.programmingLanguages) : [];
      const newLangs = Array.from(new Set([...currentLangs, ...parsed.programming_languages]));
      profile.programmingLanguages = JSON.stringify(newLangs);
    }
    if (parsed.tools_technologies && Array.isArray(parsed.tools_technologies)) {
      const currentTools = profile.toolsTechnologies ? JSON.parse(profile.toolsTechnologies) : [];
      const newTools = Array.from(new Set([...currentTools, ...parsed.tools_technologies]));
      profile.toolsTechnologies = JSON.stringify(newTools);
    }
    if (!profile.targetRole && parsed.target_role) {
      profile.targetRole = parsed.target_role;
    }
    if (!profile.experienceLevel && parsed.experience_level) {
      profile.experienceLevel = parsed.experience_level;
    }

    await this.profileRepository.save(profile);
    return { success: true, message: 'Extracted skills and technologies merged into profile' };
  }

  private async processResumeAsync(
    resumeId: string,
    userId: string,
    fileBuffer: Buffer,
    fileType: string,
  ) {
    try {
      // Step 1: Mark as EXTRACTING
      await this.resumeRepository.update(
        { id: resumeId },
        {
          processingStatus: ResumeProcessingStatus.EXTRACTING,
          analysisStatus: ResumeAnalysisStatus.PENDING,
        },
      );

      // Attempt AI Service extraction & parsing
      let extractedText = '';
      let parsedData: any = null;
      let usedAIService = false;

      try {
        const formData = new FormData();
        // Copy Buffer to Uint8Array to ensure it's backed by ArrayBuffer (not SharedArrayBuffer)
        const uint8Array = new Uint8Array(fileBuffer.length);
        uint8Array.set(fileBuffer);
        const fileBlob = new Blob([uint8Array], {
          type: fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        formData.append('file', fileBlob, `resume.${fileType}`);

        const response = await fetch(`${this.aiServiceUrl}/resume/extract-and-parse`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = (await response.json()) as any;
          if (result.success) {
            extractedText = result.extracted_text;
            parsedData = result.parsed_data;
            usedAIService = true;
          } else {
            throw new Error(result.error || 'Text extraction failed in AI Service');
          }
        } else {
          throw new Error(`AI Service HTTP status ${response.status}`);
        }
      } catch (aiErr) {
        this.logger.warn(`AI Service unavailable (${aiErr.message}), using local PDF/DOCX extraction`);
        
        // Use proper local extraction with pdf-parse and mammoth
        const extractionResult = await this.textExtractor.extractText(fileBuffer, fileType);
        
        if (!extractionResult.success) {
          throw new Error(extractionResult.error || 'Text extraction failed');
        }

        // Validate extracted text
        const validation = this.textExtractor.validateExtractedText(extractionResult.text);
        if (!validation.valid) {
          throw new Error(`Invalid extracted text: ${validation.reason}`);
        }

        extractedText = extractionResult.text;
        
        // Create basic parsed data when AI service unavailable
        parsedData = {
          extracted_successfully: true,
          extraction_method: 'local',
          skills: [],
          programming_languages: [],
          tools_technologies: [],
          experience_level: 'Not analyzed',
          word_count: extractionResult.metadata?.wordCount || 0,
          pages: extractionResult.metadata?.pages,
        };
      }

      // Determine final status
      const finalStatus = usedAIService 
        ? ResumeProcessingStatus.PROCESSED 
        : ResumeProcessingStatus.PARTIALLY_PROCESSED;
      
      const finalAnalysisStatus = usedAIService
        ? ResumeAnalysisStatus.COMPLETED
        : ResumeAnalysisStatus.PENDING;

      await this.resumeRepository.update(
        { id: resumeId },
        {
          extractedText,
          parsedData,
          processingStatus: finalStatus,
          analysisStatus: finalAnalysisStatus,
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
}
