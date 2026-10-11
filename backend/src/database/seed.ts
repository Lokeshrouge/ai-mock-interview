import { DataSource } from 'typeorm';
import { JobRole } from './entities/job-role.entity';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(dataSource: DataSource) {
  const jobRoleRepository = dataSource.getRepository(JobRole);

  // Check if already seeded
  const existing = await jobRoleRepository.count();
  if (existing > 0) {
    console.log('✓ Database already seeded');
    return;
  }

  console.log('📊 Seeding database...');

  // Seed Job Roles
  const jobRoles = [
    {
      title: 'Software Engineer',
      category: 'Technology',
      description: 'Design, develop, and maintain software applications',
      requiredSkills: ['Programming', 'Data Structures', 'Algorithms', 'System Design'],
      topics: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Databases', 'APIs'],
      isActive: true,
    },
    {
      title: 'Full Stack Developer',
      category: 'Technology',
      description: 'Build complete web applications from frontend to backend',
      requiredSkills: ['Frontend', 'Backend', 'Databases', 'DevOps'],
      topics: ['React', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker'],
      isActive: true,
    },
    {
      title: 'Data Scientist',
      category: 'Data',
      description: 'Analyze data and build machine learning models',
      requiredSkills: ['Python', 'Statistics', 'Machine Learning', 'Data Analysis'],
      topics: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'SQL'],
      isActive: true,
    },
    {
      title: 'Business Analyst',
      category: 'Business',
      description: 'Analyze business processes and requirements',
      requiredSkills: ['Requirements Analysis', 'Process Modeling', 'Communication'],
      topics: ['Business Process', 'Requirements Gathering', 'Stakeholder Management'],
      isActive: true,
    },
    {
      title: 'DevOps Engineer',
      category: 'Technology',
      description: 'Manage infrastructure and deployment pipelines',
      requiredSkills: ['CI/CD', 'Cloud', 'Automation', 'Monitoring'],
      topics: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Jenkins', 'Terraform'],
      isActive: true,
    },
    {
      title: 'Product Manager',
      category: 'Product',
      description: 'Define product strategy and roadmap',
      requiredSkills: ['Product Strategy', 'User Research', 'Prioritization'],
      topics: ['Product Vision', 'Roadmap Planning', 'User Stories', 'Metrics'],
      isActive: true,
    },
  ];

  for (const roleData of jobRoles) {
    const role = jobRoleRepository.create(roleData);
    await jobRoleRepository.save(role);
    console.log(`  ✓ Created: ${roleData.title}`);
  }

  console.log('✅ Database seeding completed!');
}
