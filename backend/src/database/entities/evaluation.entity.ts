import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { InterviewAnswer } from './interview-answer.entity';

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'answer_id', unique: true })
  answerId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'text' })
  feedback: string;

  @Column({ type: 'text', array: true, nullable: true })
  strengths: string[];

  @Column({ type: 'text', array: true, nullable: true })
  weaknesses: string[];

  @Column({ name: 'relevance_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  relevanceScore: number;

  @Column({ name: 'accuracy_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  accuracyScore: number;

  @Column({ name: 'completeness_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  completenessScore: number;

  @Column({ name: 'clarity_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  clarityScore: number;

  @CreateDateColumn({ name: 'evaluated_at' })
  evaluatedAt: Date;

  // Relations
  @OneToOne(() => InterviewAnswer, (answer) => answer.evaluation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer: InterviewAnswer;
}
