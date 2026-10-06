import { PartialType } from '@nestjs/mapped-types';
import { CreateJobRoleDto } from './create-job-role.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateJobRoleDto extends PartialType(CreateJobRoleDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
