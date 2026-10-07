import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Interview } from './interview.entity';

@Entity('job_roles')
export class JobRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 200 })
  title: string;

  @Column({ length: 100 })
  category: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'required_skills', type: 'text', array: true, nullable: true })
  requiredSkills: string[];

  @Column({ type: 'text', nullable: true })
  topics: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Interview, (interview) => interview.jobRole)
  interviews: Interview[];
}
