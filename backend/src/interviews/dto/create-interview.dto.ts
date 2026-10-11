import { IsUUID, IsEnum, IsOptional, IsInt, Min, Max, ValidateIf, IsString, MaxLength } from 'class-validator';
import {
  InterviewType,
  InterviewDifficulty,
} from '../../database/entities/interview.entity';

export class CreateInterviewDto {
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !!o.resumeId)
  resumeId?: string;

  @IsUUID()
  jobRoleId: string;

  @IsEnum(InterviewType)
  interviewType: InterviewType;

  @IsEnum(InterviewDifficulty)
  difficulty: InterviewDifficulty;

  @IsInt()
  @Min(5)
  @Max(20)
  @IsOptional()
  questionCount?: number = 10;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  targetCompany?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  targetRole?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  experienceLevel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  interviewRound?: string;

  @IsString()
  @IsOptional()
  jobDescription?: string;
}
