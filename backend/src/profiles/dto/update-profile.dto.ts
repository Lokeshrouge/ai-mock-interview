import {
  IsString,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EducationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  college?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  degree?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @IsOptional()
  @IsNumber()
  @Min(1970)
  @Max(2035)
  graduationYear?: number;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[+]?[0-9\s\-()]{7,20}$/, {
    message: 'Phone number format is invalid',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  targetRole?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  experienceLevel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  careerInterests?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => EducationDto)
  education?: EducationDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technicalSkills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programmingLanguages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  toolsTechnologies?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  githubUrl?: string;
}
