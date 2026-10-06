import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ResumesService } from './resumes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadResume(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.resumesService.uploadResume(userId, file);
  }

  @Get()
  async getUserResumes(@CurrentUser('userId') userId: string) {
    return this.resumesService.getUserResumes(userId);
  }

  @Get(':id')
  async getResume(
    @CurrentUser('userId') userId: string,
    @Param('id') resumeId: string,
  ) {
    return this.resumesService.getResumeById(userId, resumeId);
  }

  @Get(':id/download')
  async downloadResume(
    @CurrentUser('userId') userId: string,
    @Param('id') resumeId: string,
    @Res() res: Response,
  ) {
    const fileData = await this.resumesService.getResumeFileStream(userId, resumeId);

    res.set({
      'Content-Type': fileData.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileData.fileName)}"`,
      'Content-Length': fileData.fileSize,
    });

    fileData.stream.pipe(res);
  }

  @Get(':id/status')
  async getStatus(
    @CurrentUser('userId') userId: string,
    @Param('id') resumeId: string,
  ) {
    const resume = await this.resumesService.getResumeById(userId, resumeId);
    return {
      id: resume.id,
      fileName: resume.fileName,
      processingStatus: resume.processingStatus,
      analysisStatus: resume.analysisStatus,
      errorMessage: resume.errorMessage,
      uploadedAt: resume.uploadedAt,
      updatedAt: resume.updatedAt,
    };
  }

  @Get(':id/analysis')
  async getAnalysis(
    @CurrentUser('userId') userId: string,
    @Param('id') resumeId: string,
  ) {
    const resume = await this.resumesService.getResumeById(userId, resumeId);
    return {
      id: resume.id,
      fileName: resume.fileName,
      analysisStatus: resume.analysisStatus,
      parsedData: resume.parsedData,
      extractedTextLength: resume.extractedText?.length || 0,
      errorMessage: resume.errorMessage,
    };
  }

  @Post(':id/process')
  @HttpCode(HttpStatus.OK)
  async retryProcessing(
    @CurrentUser('userId') userId: string,
    @Param('id') resumeId: string,
  ) {
    return this.resumesService.retryProcessing(userId, resumeId);
  }

  @Post(':id/apply-profile')
  @HttpCode(HttpStatus.OK)
  async applyToProfile(
    @CurrentUser('userId') userId: string,
    @Param('id') resumeId: string,
  ) {
    return this.resumesService.applyToProfile(userId, resumeId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteResume(
    @CurrentUser('userId') userId: string,
    @Param('id') resumeId: string,
  ) {
    return this.resumesService.deleteResume(userId, resumeId);
  }
}
