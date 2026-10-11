import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { StudentProfile } from './student-profile.entity';
import { Resume } from './resume.entity';
import { Interview } from './interview.entity';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({
    type: 'varchar',
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', nullable: true, type: 'datetime' })
  lockedUntil: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => StudentProfile, (profile) => profile.user, { cascade: true })
  profile: StudentProfile;

  @OneToMany(() => Resume, (resume) => resume.user)
  resumes: Resume[];

  @OneToMany(() => Interview, (interview) => interview.user)
  interviews: Interview[];

  // Compatibility getters and setters for snake_case callers
  get password_hash(): string { return this.passwordHash; }
  set password_hash(val: string) { this.passwordHash = val; }

  get is_active(): boolean { return this.isActive; }
  set is_active(val: boolean) { this.isActive = val; }

  get failed_login_attempts(): number { return this.failedLoginAttempts; }
  set failed_login_attempts(val: number) { this.failedLoginAttempts = val; }

  get locked_until(): Date { return this.lockedUntil; }
  set locked_until(val: Date) { this.lockedUntil = val; }

  get created_at(): Date { return this.createdAt; }
  set created_at(val: Date) { this.createdAt = val; }

  get updated_at(): Date { return this.updatedAt; }
  set updated_at(val: Date) { this.updatedAt = val; }
}
