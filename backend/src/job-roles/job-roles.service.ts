import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JobRole } from '../database/entities/job-role.entity';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';

@Injectable()
export class JobRolesService implements OnModuleInit {
  constructor(
    @InjectRepository(JobRole)
    private jobRoleRepository: Repository<JobRole>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultRoles();
  }

  async findAll(category?: string, search?: string) {
    const query = this.jobRoleRepository.createQueryBuilder('jobRole')
      .where('jobRole.isActive = :isActive', { isActive: true });

    if (category) {
      query.andWhere('jobRole.category = :category', { category });
    }

    if (search) {
      query.andWhere('(jobRole.title ILIKE :search OR jobRole.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    return query.orderBy('jobRole.category', 'ASC').addOrderBy('jobRole.title', 'ASC').getMany();
  }

  async findOne(id: string) {
    const jobRole = await this.jobRoleRepository.findOne({ where: { id } });
    if (!jobRole) {
      throw new NotFoundException('Job role not found');
    }
    return jobRole;
  }

  async create(createJobRoleDto: CreateJobRoleDto) {
    // Check for duplicate title
    const existing = await this.jobRoleRepository.findOne({
      where: { title: createJobRoleDto.title },
    });

    if (existing) {
      throw new ConflictException('Job role with this title already exists');
    }

    const jobRole = this.jobRoleRepository.create(createJobRoleDto);
    return this.jobRoleRepository.save(jobRole);
  }

  async update(id: string, updateJobRoleDto: UpdateJobRoleDto) {
    const jobRole = await this.findOne(id);

    // Check for duplicate title if changed
    if (updateJobRoleDto.title && updateJobRoleDto.title !== jobRole.title) {
      const existing = await this.jobRoleRepository.findOne({
        where: { title: updateJobRoleDto.title },
      });
      if (existing) {
        throw new ConflictException('Job role with this title already exists');
      }
    }

    Object.assign(jobRole, updateJobRoleDto);
    return this.jobRoleRepository.save(jobRole);
  }

  async remove(id: string) {
    const jobRole = await this.findOne(id);
    await this.jobRoleRepository.remove(jobRole);
    return { message: 'Job role deleted successfully' };
  }

  async seedDefaultRoles() {
    const count = await this.jobRoleRepository.count();
    if (count > 0) return; // Already seeded

    const defaultRoles = [
      {
        title: 'Software Developer',
        category: 'Engineering',
        description: 'Design, develop, and maintain software applications',
        requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git'],
        topics: ['Programming', 'Data Structures', 'Algorithms', 'Web Development', 'OOP'],
      },
      {
        title: 'Data Analyst',
        category: 'Data Science',
        description: 'Analyze data to derive insights and support decision-making',
        requiredSkills: ['Python', 'SQL', 'Excel', 'Statistics', 'Data Visualization'],
        topics: ['Statistics', 'Data Analysis', 'SQL', 'Reporting', 'Business Intelligence'],
      },
      {
        title: 'Frontend Developer',
        category: 'Engineering',
        description: 'Build user interfaces and client-side applications',
        requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design'],
        topics: ['HTML/CSS', 'JavaScript', 'React', 'UI/UX', 'Web Performance'],
      },
      {
        title: 'Backend Developer',
        category: 'Engineering',
        description: 'Develop server-side logic and APIs',
        requiredSkills: ['Node.js', 'Python', 'Java', 'Databases', 'REST APIs'],
        topics: ['Server Architecture', 'APIs', 'Databases', 'Security', 'Scalability'],
      },
      {
        title: 'Full Stack Developer',
        category: 'Engineering',
        description: 'Work on both frontend and backend development',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'Databases', 'DevOps'],
        topics: ['Frontend', 'Backend', 'Databases', 'APIs', 'Deployment'],
      },
      {
        title: 'DevOps Engineer',
        category: 'Engineering',
        description: 'Manage infrastructure and deployment pipelines',
        requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud Platforms'],
        topics: ['Infrastructure', 'Automation', 'Monitoring', 'Cloud', 'Security'],
      },
      {
        title: 'QA Engineer',
        category: 'Engineering',
        description: 'Ensure software quality through testing',
        requiredSkills: ['Testing', 'Automation', 'Selenium', 'Test Planning', 'Bug Tracking'],
        topics: ['Testing Strategies', 'Automation', 'Quality Standards', 'Bug Tracking'],
      },
      {
        title: 'Product Manager',
        category: 'Product',
        description: 'Define product strategy and roadmap',
        requiredSkills: ['Product Strategy', 'User Research', 'Communication', 'Analytics'],
        topics: ['Product Vision', 'User Stories', 'Prioritization', 'Stakeholder Management'],
      },
      {
        title: 'Business Analyst',
        category: 'Business',
        description: 'Analyze business processes and requirements',
        requiredSkills: ['Requirements Gathering', 'Documentation', 'Communication', 'Analytical Skills'],
        topics: ['Business Analysis', 'Requirements', 'Process Improvement', 'Stakeholder Management'],
      },
      {
        title: 'UI/UX Designer',
        category: 'Design',
        description: 'Design user interfaces and experiences',
        requiredSkills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Visual Design'],
        topics: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Usability Testing'],
      },
    ];

    for (const roleData of defaultRoles) {
      const role = this.jobRoleRepository.create(roleData);
      await this.jobRoleRepository.save(role);
    }
  }
}
