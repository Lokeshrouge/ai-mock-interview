import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum ResumeProcessingStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export enum ResumeAnalysisStatus {
  PENDING = 'PENDING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_resumes_user_id')
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'stored_file_name', length: 255 })
  storedFileName: string;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'file_url', length: 500, nullable: true })
  fileUrl: string;

  @Column({ name: 'file_type', length: 20 })
  fileType: string; // 'pdf' | 'docx'

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({ name: 'file_size', type: 'integer' })
  fileSize: number;

  @Index('idx_resumes_processing_status')
  @Column({
    name: 'processing_status',
    type: 'enum',
    enum: ResumeProcessingStatus,
    default: ResumeProcessingStatus.UPLOADED,
  })
  processingStatus: ResumeProcessingStatus;

  @Index('idx_resumes_analysis_status')
  @Column({
    name: 'analysis_status',
    type: 'enum',
    enum: ResumeAnalysisStatus,
    default: ResumeAnalysisStatus.PENDING,
  })
  analysisStatus: ResumeAnalysisStatus;

  @Column({ name: 'extracted_text', type: 'text', nullable: true })
  extractedText: string | null;

  @Column({ name: 'parsed_data', type: 'jsonb', nullable: true })
  parsedData: Record<string, any> | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Index('idx_resumes_is_active')
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.resumes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
