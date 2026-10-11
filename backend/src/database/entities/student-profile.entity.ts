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

  @Index('idx_student_profiles_user_id', { unique: true })
  @Column({ name: 'user_id', type: 'uuid', unique: true })
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
  careerInterests: string;

  @Column({ type: 'text', nullable: true })
  education: string;

  @Column({ name: 'technical_skills', type: 'text', nullable: true })
  technicalSkills: string;

  @Column({ name: 'programming_languages', type: 'text', nullable: true })
  programmingLanguages: string;

  @Column({ name: 'tools_technologies', type: 'text', nullable: true })
  toolsTechnologies: string;

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

  // Compatibility getters and setters for snake_case callers
  get user_id(): string { return this.userId; }
  set user_id(val: string) { this.userId = val; }

  get first_name(): string { return this.firstName; }
  set first_name(val: string) { this.firstName = val; }

  get last_name(): string { return this.lastName; }
  set last_name(val: string) { this.lastName = val; }

  get target_role(): string { return this.targetRole; }
  set target_role(val: string) { this.targetRole = val; }

  get experience_level(): string { return this.experienceLevel; }
  set experience_level(val: string) { this.experienceLevel = val; }

  get career_interests(): string { return this.careerInterests; }
  set career_interests(val: string) { this.careerInterests = val; }

  get technical_skills(): string { return this.technicalSkills; }
  set technical_skills(val: string) { this.technicalSkills = val; }

  get programming_languages(): string { return this.programmingLanguages; }
  set programming_languages(val: string) { this.programmingLanguages = val; }

  get tools_technologies(): string { return this.toolsTechnologies; }
  set tools_technologies(val: string) { this.toolsTechnologies = val; }

  get created_at(): Date { return this.createdAt; }
  set created_at(val: Date) { this.createdAt = val; }

  get updated_at(): Date { return this.updatedAt; }
  set updated_at(val: Date) { this.updatedAt = val; }
}
