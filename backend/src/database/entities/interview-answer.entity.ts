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
import { InterviewQuestion } from './interview-question.entity';
import { Evaluation } from './evaluation.entity';

@Entity('interview_answers')
export class InterviewAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'interview_id' })
  interviewId: string;

  @Column({ name: 'question_id', unique: true })
  questionId: string;

  @Column({ name: 'answer_text', type: 'text' })
  answerText: string;

  @Column({ name: 'time_taken_seconds', type: 'integer', nullable: true })
  timeTakenSeconds: number;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  // Relations
  @ManyToOne(() => Interview, (interview) => interview.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @OneToOne(() => InterviewQuestion, (question) => question.answer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: InterviewQuestion;

  @OneToOne(() => Evaluation, (evaluation) => evaluation.answer, { cascade: true })
  evaluation: Evaluation;
}
