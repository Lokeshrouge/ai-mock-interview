export interface User {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  education?: any;
  skills?: string[];
  bio?: string;
  profilePictureUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  completion?: {
    percentage: number;
    breakdown: {
      basicInfo: boolean;
      education: boolean;
      careerGoal: boolean;
      skills: boolean;
      resume: boolean;
    };
    missingSections: string[];
  };
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  extractedText?: string;
  parsedData?: any;
  isActive: boolean;
  uploadedAt: string;
}

export interface JobRole {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredSkills: string[];
  topics?: any;
  isActive: boolean;
}

export interface Interview {
  id: string;
  userId: string;
  resumeId?: string;
  jobRoleId: string;
  interviewType: 'HR' | 'TECHNICAL' | 'PROJECT';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'CREATED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'EVALUATED';
  overallScore?: number;
  totalQuestions: number;
  answeredQuestions: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  jobRole?: JobRole;
}

export interface InterviewQuestion {
  id: string;
  interviewId: string;
  questionNumber: number;
  questionText: string;
  questionCategory?: string;
  expectedPoints?: string[];
  isAnswered?: boolean;
}

export interface InterviewAnswer {
  id: string;
  interviewId: string;
  questionId: string;
  answerText: string;
  timeTakenSeconds?: number;
  submittedAt: string;
}

export interface Evaluation {
  id: string;
  answerId: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  relevanceScore?: number;
  accuracyScore?: number;
  completenessScore?: number;
  clarityScore?: number;
  evaluatedAt: string;
}

export interface Recommendation {
  id: string;
  interviewId: string;
  strengths: any;
  weaknesses: any;
  topicsToImprove: string[];
  recommendedResources?: any;
  overallFeedback: string;
  createdAt: string;
}

export interface InterviewReport {
  interview: Interview;
  overallScore: number;
  scoreDistribution: {
    '0-40': number;
    '41-60': number;
    '61-75': number;
    '76-85': number;
    '86-100': number;
  };
  questionResults: Array<{
    question: string;
    answer: string;
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  recommendations?: Recommendation;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
  timestamp: string;
  path: string;
}
