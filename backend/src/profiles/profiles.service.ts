import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from '../database/entities/student-profile.entity';
import { User } from '../database/entities/user.entity';
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
      where: { userId: userId },
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
        userId: profile.userId,
        email: user?.email || '',
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        targetRole: profile.targetRole,
        experienceLevel: profile.experienceLevel,
        careerInterests: profile.careerInterests ? JSON.parse(profile.careerInterests) : [],
        education: profile.education ? JSON.parse(profile.education) : {},
        technicalSkills: profile.technicalSkills ? JSON.parse(profile.technicalSkills) : [],
        programmingLanguages: profile.programmingLanguages ? JSON.parse(profile.programmingLanguages) : [],
        toolsTechnologies: profile.toolsTechnologies ? JSON.parse(profile.toolsTechnologies) : [],
        bio: profile.bio,
        profilePictureUrl: profile.profilePictureUrl,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
      hasActiveResume: !!activeResume,
      activeResumeId: activeResume?.id || null,
      completion,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    let profile = await this.profileRepository.findOne({
      where: { userId: userId },
    });

    if (!profile) {
      // Lazy creation if profile was somehow missing
      profile = this.profileRepository.create({
        userId: userId,
        firstName: dto.firstName || '',
        lastName: dto.lastName || '',
      });
    }

    if (dto.firstName !== undefined) profile.firstName = dto.firstName;
    if (dto.lastName !== undefined) profile.lastName = dto.lastName;
    if (dto.phone !== undefined) profile.phone = dto.phone;
    if (dto.targetRole !== undefined) profile.targetRole = dto.targetRole;
    if (dto.experienceLevel !== undefined) profile.experienceLevel = dto.experienceLevel;
    if (dto.careerInterests !== undefined) profile.careerInterests = JSON.stringify(dto.careerInterests);
    if (dto.education !== undefined) {
      profile.education = JSON.stringify({
        ...(profile.education ? JSON.parse(profile.education) : {}),
        ...dto.education,
      });
    }
    if (dto.technicalSkills !== undefined) profile.technicalSkills = JSON.stringify(dto.technicalSkills);
    if (dto.programmingLanguages !== undefined) profile.programmingLanguages = JSON.stringify(dto.programmingLanguages);
    if (dto.toolsTechnologies !== undefined) profile.toolsTechnologies = JSON.stringify(dto.toolsTechnologies);
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.linkedinUrl !== undefined) profile.linkedinUrl = dto.linkedinUrl;
    if (dto.githubUrl !== undefined) profile.githubUrl = dto.githubUrl;

    const savedProfile = await this.profileRepository.save(profile);
    return this.getProfile(userId);
  }

  calculateCompletion(profile: StudentProfile, hasResume: boolean): ProfileCompletionDetails {
    const hasBasic = !!(
      profile.firstName?.trim() &&
      profile.lastName?.trim() &&
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
      profile.targetRole?.trim() &&
      profile.experienceLevel?.trim()
    );

    const hasSkills = !!(
      (profile.technicalSkills && JSON.parse(profile.technicalSkills).length > 0) ||
      (profile.programmingLanguages && JSON.parse(profile.programmingLanguages).length > 0)
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
