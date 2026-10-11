import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Interview } from './interview.entity';
import { InterviewAnswer } from './interview-answer.entity';

@Entity('interview_questions')
export class InterviewQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'interview_id' })
  interviewId: string;

  @Column({ name: 'question_number', type: 'integer' })
  questionNumber: number;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  @Column({ name: 'question_category', length: 100, nullable: true })
  questionCategory: string;

  @Column({ name: 'expected_points', type: 'simple-array', nullable: true })
  expectedPoints: string[];

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt: Date;

  // Relations
  @ManyToOne(() => Interview, (interview) => interview.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @OneToOne(() => InterviewAnswer, (answer) => answer.question)
  answer: InterviewAnswer;
}
