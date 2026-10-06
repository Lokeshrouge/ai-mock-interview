import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Interview } from './interview.entity';

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'interview_id' })
  interviewId: string;

  @Column({ type: 'jsonb' })
  strengths: any;

  @Column({ type: 'jsonb' })
  weaknesses: any;

  @Column({ name: 'topics_to_improve', type: 'text', array: true })
  topicsToImprove: string[];

  @Column({ name: 'recommended_resources', type: 'jsonb', nullable: true })
  recommendedResources: any;

  @Column({ name: 'overall_feedback', type: 'text' })
  overallFeedback: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Interview, (interview) => interview.recommendations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;
}
