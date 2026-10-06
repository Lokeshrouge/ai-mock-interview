import { IsUUID, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import {
  InterviewType,
  InterviewDifficulty,
} from '../../database/entities/interview.entity';

export class CreateInterviewDto {
  @IsUUID()
  @IsOptional()
  resumeId?: string;

  @IsUUID()
  jobRoleId: string;

  @IsEnum(InterviewType)
  interviewType: InterviewType;

  @IsEnum(InterviewDifficulty)
  difficulty: InterviewDifficulty;

  @IsInt()
  @Min(5)
  @Max(15)
  @IsOptional()
  questionCount?: number = 10;
}
