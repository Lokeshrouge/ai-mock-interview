import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export interface EducationDetails {
  college?: string;
  degree?: string;
  department?: string;
  graduationYear?: number;
}

// Helper functions for JSON string fields
export function parseEducation(education: string | null): EducationDetails | null {
  if (!education) return null;
  try {
    return JSON.parse(education);
  } catch {
    return null;
  }
}

export function parseStringArray(field: string | null): string[] {
  if (!field) return [];
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

@Entity('student_profiles')
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_profiles_user_id', { unique: true })
  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  target_role: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  experience_level: string | null;

  @Column({ type: 'text', nullable: true })
  career_interests: string | null;

  @Column({ type: 'text', nullable: true })
  education: string | null;

  @Column({ type: 'text', nullable: true })
  technical_skills: string | null;

  @Column({ type: 'text', nullable: true })
  programming_languages: string | null;

  @Column({ type: 'text', nullable: true })
  tools_technologies: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profile_picture_url: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  linkedin_url: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  github_url: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
