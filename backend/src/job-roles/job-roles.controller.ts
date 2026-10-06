import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { JobRolesService } from './job-roles.service';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@Controller('job-roles')
export class JobRolesController {
  constructor(private readonly jobRolesService: JobRolesService) {}

  @Get()
  @Public()
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.jobRolesService.findAll(category, search);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.jobRolesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createJobRoleDto: CreateJobRoleDto) {
    return this.jobRolesService.create(createJobRoleDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateJobRoleDto: UpdateJobRoleDto) {
    return this.jobRolesService.update(id, updateJobRoleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.jobRolesService.remove(id);
  }
}
