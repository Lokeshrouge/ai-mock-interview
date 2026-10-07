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
import { User } from './user.entity';

export interface EducationDetails {
  college?: string;
  degree?: string;
  department?: string;
  graduationYear?: number;
}

@Entity('student_profiles')
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_student_profiles_user_id', { unique: true })
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'target_role', length: 100, nullable: true })
  targetRole: string;

  @Column({ name: 'experience_level', length: 50, nullable: true })
  experienceLevel: string;

  @Column({ name: 'career_interests', type: 'text', nullable: true })
  careerInterests: string[];

  @Column({ type: 'text', nullable: true })
  education: EducationDetails;

  @Column({ name: 'technical_skills', type: 'text', nullable: true })
  technicalSkills: string[];

  @Column({ name: 'programming_languages', type: 'text', nullable: true })
  programmingLanguages: string[];

  @Column({ name: 'tools_technologies', type: 'text', nullable: true })
  toolsTechnologies: string[];

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'profile_picture_url', length: 500, nullable: true })
  profilePictureUrl: string;

  @Column({ name: 'linkedin_url', length: 255, nullable: true })
  linkedinUrl: string;

  @Column({ name: 'github_url', length: 255, nullable: true })
  githubUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
