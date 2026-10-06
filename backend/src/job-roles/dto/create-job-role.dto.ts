import { IsString, IsArray, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateJobRoleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredSkills?: string[];

  @IsOptional()
  topics?: any;
}
