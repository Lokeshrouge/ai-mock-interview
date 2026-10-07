import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from './entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { Resume } from '../database/entities/resume.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface ProfileCompletionDetails {
  percentage: number;
  breakdown: {
    basicInfo: boolean;
    education: boolean;
    careerGoal: boolean;
    skills: boolean;
    resume: boolean;
  };
  missingSections: string[];
}

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(StudentProfile)
    private profileRepository: Repository<StudentProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const activeResume = await this.resumeRepository.findOne({
      where: { userId, isActive: true },
      order: { uploadedAt: 'DESC' },
    });

    const completion = this.calculateCompletion(profile, !!activeResume);

    return {
      profile: {
        id: profile.id,
        userId: profile.user_id,
        email: user?.email || '',
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        targetRole: profile.target_role,
        experienceLevel: profile.experience_level,
        careerInterests: profile.career_interests || [],
        education: profile.education || {},
        technicalSkills: profile.technical_skills || [],
        programmingLanguages: profile.programming_languages || [],
        toolsTechnologies: profile.tools_technologies || [],
        bio: profile.bio,
        profilePictureUrl: profile.profile_picture_url,
        linkedinUrl: profile.linkedin_url,
        githubUrl: profile.github_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      hasActiveResume: !!activeResume,
      activeResumeId: activeResume?.id || null,
      completion,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    let profile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });

    if (!profile) {
      // Lazy creation if profile was somehow missing
      profile = this.profileRepository.create({
        user_id: userId,
        first_name: dto.firstName || '',
        last_name: dto.lastName || '',
      });
    }

    if (dto.firstName !== undefined) profile.first_name = dto.firstName;
    if (dto.lastName !== undefined) profile.last_name = dto.lastName;
    if (dto.phone !== undefined) profile.phone = dto.phone;
    if (dto.targetRole !== undefined) profile.target_role = dto.targetRole;
    if (dto.experienceLevel !== undefined) profile.experience_level = dto.experienceLevel;
    if (dto.careerInterests !== undefined) profile.career_interests = JSON.stringify(dto.careerInterests);
    if (dto.education !== undefined) {
      profile.education = JSON.stringify({
        ...(profile.education ? JSON.parse(profile.education) : {}),
        ...dto.education,
      });
    }
    if (dto.technicalSkills !== undefined) profile.technical_skills = JSON.stringify(dto.technicalSkills);
    if (dto.programmingLanguages !== undefined) profile.programming_languages = JSON.stringify(dto.programmingLanguages);
    if (dto.toolsTechnologies !== undefined) profile.tools_technologies = JSON.stringify(dto.toolsTechnologies);
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.linkedinUrl !== undefined) profile.linkedin_url = dto.linkedinUrl;
    if (dto.githubUrl !== undefined) profile.github_url = dto.githubUrl;

    const savedProfile = await this.profileRepository.save(profile);
    return this.getProfile(userId);
  }

  calculateCompletion(profile: StudentProfile, hasResume: boolean): ProfileCompletionDetails {
    const hasBasic = !!(
      profile.first_name?.trim() &&
      profile.last_name?.trim() &&
      profile.phone?.trim()
    );

    const edu = profile.education ? JSON.parse(profile.education) : null;
    const hasEducation = !!(
      edu &&
      edu.college?.trim() &&
      edu.degree?.trim() &&
      edu.department?.trim() &&
      edu.graduationYear
    );

    const hasCareer = !!(
      profile.target_role?.trim() &&
      profile.experience_level?.trim()
    );

    const hasSkills = !!(
      (profile.technical_skills && profile.technical_skills.length > 0) ||
      (profile.programming_languages && profile.programming_languages.length > 0)
    );

    const breakdown = {
      basicInfo: hasBasic,
      education: hasEducation,
      careerGoal: hasCareer,
      skills: hasSkills,
      resume: hasResume,
    };

    const missingSections: string[] = [];
    if (!hasBasic) missingSections.push('Basic Information (Name & Phone)');
    if (!hasEducation) missingSections.push('Education (College, Degree, Department, Year)');
    if (!hasCareer) missingSections.push('Career Goal (Target Role & Level)');
    if (!hasSkills) missingSections.push('Skills (Technical Skills / Languages)');
    if (!hasResume) missingSections.push('Resume Upload');

    // Weighted completion percentage (total = 100%)
    let percentage = 0;
    if (hasBasic) percentage += 20;
    if (hasEducation) percentage += 25;
    if (hasCareer) percentage += 20;
    if (hasSkills) percentage += 20;
    if (hasResume) percentage += 15;

    return {
      percentage,
      breakdown,
      missingSections,
    };
  }
}
