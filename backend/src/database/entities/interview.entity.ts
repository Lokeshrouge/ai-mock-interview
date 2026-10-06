import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Resume } from './resume.entity';
import { JobRole } from './job-role.entity';
import { InterviewQuestion } from './interview-question.entity';
import { InterviewAnswer } from './interview-answer.entity';
import { Recommendation } from './recommendation.entity';

export enum InterviewType {
  HR = 'HR',
  TECHNICAL = 'TECHNICAL',
  PROJECT = 'PROJECT',
}

export enum InterviewDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum InterviewStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  EVALUATED = 'EVALUATED',
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'resume_id', nullable: true })
  resumeId: string;

  @Column({ name: 'job_role_id' })
  jobRoleId: string;

  @Column({
    name: 'interview_type',
    type: 'enum',
    enum: InterviewType,
  })
  interviewType: InterviewType;

  @Column({
    type: 'enum',
    enum: InterviewDifficulty,
  })
  difficulty: InterviewDifficulty;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
  })
  status: InterviewStatus;

  @Column({ name: 'overall_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore: number;

  @Column({ name: 'total_questions', default: 0 })
  totalQuestions: number;

  @Column({ name: 'answered_questions', default: 0 })
  answeredQuestions: number;

  @Column({ name: 'started_at', nullable: true, type: 'timestamp' })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true, type: 'timestamp' })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Resume, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'resume_id' })
  resume: Resume;

  @ManyToOne(() => JobRole, (jobRole) => jobRole.interviews)
  @JoinColumn({ name: 'job_role_id' })
  jobRole: JobRole;

  @OneToMany(() => InterviewQuestion, (question) => question.interview)
  questions: InterviewQuestion[];

  @OneToMany(() => InterviewAnswer, (answer) => answer.interview)
  answers: InterviewAnswer[];

  @OneToMany(() => Recommendation, (recommendation) => recommendation.interview)
  recommendations: Recommendation[];
}
