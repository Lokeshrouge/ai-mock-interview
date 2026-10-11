import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InterviewAnswer } from './interview-answer.entity';
import { InterviewQuestion } from './interview-question.entity';

@Entity('revised_answers')
export class RevisedAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_answer_id' })
  originalAnswerId: string;

  @Column({ name: 'question_id' })
  questionId: string;

  @Column({ name: 'revised_text', type: 'text' })
  revisedText: string;

  @Column({ name: 'revision_number', type: 'integer', default: 1 })
  revisionNumber: number;

  // Evaluation scores for this revision
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ name: 'accuracy_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  accuracyScore: number;

  @Column({ name: 'completeness_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  completenessScore: number;

  @Column({ name: 'clarity_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  clarityScore: number;

  @Column({ name: 'relevance_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  relevanceScore: number;

  @Column({ type: 'text' })
  feedback: string;

  @Column({ type: 'simple-array', nullable: true })
  strengths: string[];

  @Column({ type: 'simple-array', nullable: true })
  weaknesses: string[];

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  // Relations
  @ManyToOne(() => InterviewAnswer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'original_answer_id' })
  originalAnswer: InterviewAnswer;

  @ManyToOne(() => InterviewQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: InterviewQuestion;
}
