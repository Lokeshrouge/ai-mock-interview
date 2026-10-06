# Component Architecture

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Project:** AI-Powered Mock Interview System

---

## 1. Introduction

This document provides a detailed breakdown of the component architecture for the AI-Powered Mock Interview System. It describes the structure, responsibilities, and interfaces of components within each layer: Frontend (Next.js), Backend (NestJS), and AI Service (FastAPI). Understanding component-level architecture is essential for implementation planning, code organization, and ensuring separation of concerns.

---

## 2. Frontend Component Architecture

### 2.1 Frontend Technology Stack
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Fetch API or Axios
- **State Management:** React Context API or Zustand

### 2.2 Frontend Folder Structure

```
/frontend
├── /app                      # Next.js App Router pages
│   ├── /auth
│   │   ├── /login           # Login page
│   │   ├── /register        # Registration page
│   │   └── /reset-password  # Password reset page
│   ├── /dashboard           # Student dashboard
│   ├── /interview
│   │   ├── /new             # Interview setup wizard
│   │   ├── /[id]            # Interview session page
│   │   └── /[id]/report     # Session report page
│   ├── /profile             # Profile management
│   ├── /admin               # Admin dashboard and pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing/home page
├── /components              # Reusable UI components
│   ├── /auth
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── /interview
│   │   ├── InterviewSetupForm.tsx
│   │   ├── QuestionDisplay.tsx
│   │   ├── AnswerInput.tsx
│   │   ├── SessionTimer.tsx
│   │   └── SessionControls.tsx
│   ├── /profile
│   │   ├── ProfileForm.tsx
│   │   ├── ResumeUpload.tsx
│   │   └── SkillTagsManager.tsx
│   ├── /report
│   │   ├── ReportOverview.tsx
│   │   ├── ScoreCard.tsx
│   │   ├── StrengthsList.tsx
│   │   ├── WeaknessesList.tsx
│   │   └── RecommendationsPanel.tsx
│   ├── /common
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   └── /layout
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── /lib                     # Utilities and helpers
│   ├── api-client.ts        # API client configuration
│   ├── auth.ts              # Authentication utilities
│   ├── validation.ts        # Zod schemas
│   └── utils.ts             # General utilities
├── /hooks                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useInterview.ts
│   └── useProfile.ts
├── /contexts                # React Context providers
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── /types                   # TypeScript type definitions
│   ├── auth.types.ts
│   ├── interview.types.ts
│   ├── profile.types.ts
│   └── api.types.ts
└── /public                  # Static assets
    ├── /images
    └── /icons
```

### 2.3 Key Frontend Components

#### 2.3.1 Layout Components

**Header Component**
- **Responsibility:** Top navigation bar with logo, menu items, user profile dropdown
- **Props:** `user: User | null`, `onLogout: () => void`
- **Features:** Responsive mobile menu, profile dropdown with logout
- **Conditional Rendering:** Show different menu items for students vs admins

**Sidebar Component** (Admin only)
- **Responsibility:** Side navigation for admin dashboard
- **Props:** `currentPath: string`
- **Features:** Collapsible on mobile, highlights active menu item
- **Menu Items:** Dashboard, Users, Sessions, Analytics, Settings

**Footer Component**
- **Responsibility:** Footer with links and copyright
- **Props:** None
- **Content:** Privacy Policy, Terms of Service, Help, Social Links

#### 2.3.2 Authentication Components

**LoginForm Component**
```typescript
interface LoginFormProps {
  onSuccess: (tokens: AuthTokens) => void;
  onError: (error: string) => void;
}

// Features:
// - Email and password inputs
// - Client-side validation (Zod schema)
// - "Remember me" checkbox
// - "Forgot password?" link
// - Loading state during submission
// - Error message display
```

**RegisterForm Component**
```typescript
interface RegisterFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Features:
// - Email, password, confirm password, full name inputs
// - Password strength indicator
// - Terms of service checkbox
// - Real-time validation feedback
// - Loading state during submission
```

**ProtectedRoute Component**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'STUDENT' | 'ADMIN';
}

// Features:
// - Checks authentication status
// - Redirects to login if not authenticated
// - Checks role authorization
// - Shows 403 error if insufficient permissions
```

#### 2.3.3 Interview Components

**InterviewSetupForm Component**
```typescript
interface InterviewSetupFormProps {
  onSubmit: (config: InterviewConfig) => void;
  userProfile: UserProfile;
}

// Features:
// - Interview type selector (HR, Technical, Project)
// - Difficulty selector (Easy, Medium, Hard)
// - Duration selector (15, 30, 45, 60 minutes)
// - Optional focus areas multi-select
// - Resume requirement check and prompt
// - "Start Interview" button
```

**QuestionDisplay Component**
```typescript
interface QuestionDisplayProps {
  question: string;
  questionNumber: number;
  totalQuestions?: number;
  focusArea?: string;
}

// Features:
// - Large, readable question text
// - Question number indicator ("Question 5 of 10")
// - Focus area badge
// - Responsive typography
```

**AnswerInput Component**
```typescript
interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled: boolean;
  minLength: number;
}

// Features:
// - Multi-line textarea (auto-expanding)
// - Character count display (real-time)
// - Validation indicator (min 50 characters)
// - Submit button (disabled until valid)
// - Loading state during AI processing
// - Draft auto-save (every 30 seconds)
```

**SessionTimer Component**
```typescript
interface SessionTimerProps {
  initialSeconds: number;
  onExpire: () => void;
  isPaused: boolean;
}

// Features:
// - Large, visible countdown (MM:SS format)
// - Color change when < 5 minutes remaining (yellow)
// - Color change when < 1 minute remaining (red)
// - Pause/resume support
// - Sound alert when time expires (optional)
```

**SessionControls Component**
```typescript
interface SessionControlsProps {
  sessionId: string;
  status: SessionStatus;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

// Features:
// - Pause button (when in progress)
// - Resume button (when paused)
// - End Interview button (with confirmation modal)
// - Disabled states during transitions
```

#### 2.3.4 Report Components

**ReportOverview Component**
```typescript
interface ReportOverviewProps {
  report: SessionReport;
}

// Features:
// - Overall score display (large, prominent)
// - Score visualization (circular progress bar)
// - Session metadata (date, duration, type, difficulty)
// - Score dimensions breakdown (completeness, accuracy, clarity, depth)
```

**ScoreCard Component**
```typescript
interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  color: string;
}

// Features:
// - Card layout with title
// - Score as fraction (72/100)
// - Progress bar visualization
// - Color-coded by performance level
```

**StrengthsList Component**
```typescript
interface StrengthsListProps {
  strengths: string[];
}

// Features:
// - Bulleted or numbered list
// - Green checkmark icons
// - Each strength with supporting detail
```

**WeaknessesList Component**
```typescript
interface WeaknessesListProps {
  weaknesses: string[];
}

// Features:
// - Bulleted or numbered list
// - Yellow warning icons
// - Each weakness with constructive feedback
```

**RecommendationsPanel Component**
```typescript
interface RecommendationsPanelProps {
  recommendations: string[];
}

// Features:
// - Actionable recommendations list
// - Lightbulb icons
// - "Mark as done" checkboxes (future feature)
```

#### 2.3.5 Profile Components

**ProfileForm Component**
```typescript
interface ProfileFormProps {
  profile: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => void;
}

// Features:
// - Editable fields (name, phone, education, employment)
// - Save and Cancel buttons
// - Validation on submission
// - Success/error notifications
```

**ResumeUpload Component**
```typescript
interface ResumeUploadProps {
  currentResumes: Resume[];
  onUpload: (file: File) => void;
  onDelete: (resumeId: string) => void;
  onSetActive: (resumeId: string) => void;
  maxResumes: number;
}

// Features:
// - Drag-and-drop file upload
// - File type validation (PDF, DOCX)
// - File size validation (max 5MB)
// - Upload progress indicator
// - List of uploaded resumes with actions (download, delete, set active)
// - Active resume indicator badge
```

**SkillTagsManager Component**
```typescript
interface SkillTagsManagerProps {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
  maxSkills: number;
}

// Features:
// - Autocomplete input for predefined skills
// - Custom skill creation
// - Tag display with remove buttons
// - Max skills limit indicator
```

#### 2.3.6 Common Components

**Button Component**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Modal Component**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

**Toast Component**
```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}
```

### 2.4 Frontend Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      App Layout                         │
│  ┌────────────────────────────────────────────────┐    │
│  │                 Header Component                │    │
│  │  [Logo] [Nav Items] [User Menu]                │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────┐  ┌────────────────────────────┐     │
│  │   Sidebar    │  │    Page Content Area       │     │
│  │  (Admin)     │  │                            │     │
│  │              │  │  ┌──────────────────────┐  │     │
│  │ - Dashboard  │  │  │  Page-Specific       │  │     │
│  │ - Users      │  │  │  Components          │  │     │
│  │ - Sessions   │  │  │                      │  │     │
│  │ - Analytics  │  │  │  e.g., LoginForm,    │  │     │
│  │              │  │  │  QuestionDisplay,    │  │     │
│  └──────────────┘  │  │  ReportOverview      │  │     │
│                    │  │                      │  │     │
│                    │  └──────────────────────┘  │     │
│                    └────────────────────────────┘     │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │                 Footer Component                │    │
│  │  [Links] [Copyright]                           │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

            ┌──────────────────────────┐
            │   Toast Notifications    │
            │  (Portal, Fixed Position)│
            └──────────────────────────┘
```

### 2.5 Frontend State Management

**AuthContext**
- **State:** `user: User | null`, `isAuthenticated: boolean`, `isLoading: boolean`
- **Actions:** `login()`, `logout()`, `refreshToken()`, `checkAuth()`
- **Persistence:** Refresh token in httpOnly cookie, access token in memory

**ToastContext**
- **State:** `toasts: Toast[]`
- **Actions:** `showToast(message, type)`, `hideToast(id)`
- **Usage:** Global notifications for success/error messages

---

## 3. Backend Component Architecture

### 3.1 Backend Technology Stack
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript (strict mode)
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken, @nestjs/jwt)
- **Validation:** class-validator, class-transformer
- **Documentation:** @nestjs/swagger (OpenAPI)

### 3.2 Backend Folder Structure

```
/backend
├── /src
│   ├── /auth                     # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── /dto
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── tokens.dto.ts
│   │   ├── /guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── /strategies
│   │       ├── jwt.strategy.ts
│   │       └── jwt-refresh.strategy.ts
│   ├── /users                    # Users module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── /dto
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── /entities
│   │       └── user.entity.ts
│   ├── /profiles                 # User profiles module
│   │   ├── profiles.controller.ts
│   │   ├── profiles.service.ts
│   │   ├── profiles.module.ts
│   │   ├── /dto
│   │   │   └── update-profile.dto.ts
│   │   └── /entities
│   │       └── user-profile.entity.ts
│   ├── /resumes                  # Resume management module
│   │   ├── resumes.controller.ts
│   │   ├── resumes.service.ts
│   │   ├── resumes.module.ts
│   │   ├── /dto
│   │   │   └── upload-resume.dto.ts
│   │   └── /entities
│   │       └── resume.entity.ts
│   ├── /interviews               # Interview sessions module
│   │   ├── interviews.controller.ts
│   │   ├── interviews.service.ts
│   │   ├── interviews.module.ts
│   │   ├── /dto
│   │   │   ├── create-interview.dto.ts
│   │   │   ├── submit-answer.dto.ts
│   │   │   └── interview-response.dto.ts
│   │   └── /entities
│   │       └── interview-session.entity.ts
│   ├── /questions                # Questions module
│   │   ├── questions.service.ts
│   │   ├── questions.module.ts
│   │   └── /entities
│   │       └── interview-question.entity.ts
│   ├── /answers                  # Answers module
│   │   ├── answers.service.ts
│   │   ├── answers.module.ts
│   │   └── /entities
│   │       └── interview-answer.entity.ts
│   ├── /reports                  # Reports module
│   │   ├── reports.controller.ts
│   │   ├── reports.service.ts
│   │   ├── reports.module.ts
│   │   ├── /dto
│   │   │   └── report-response.dto.ts
│   │   └── /entities
│   │       └── session-report.entity.ts
│   ├── /ai                       # AI service proxy module
│   │   ├── ai.service.ts
│   │   ├── ai.module.ts
│   │   ├── /dto
│   │   │   ├── generate-question.dto.ts
│   │   │   ├── evaluate-answer.dto.ts
│   │   │   └── summarize-session.dto.ts
│   │   └── ai-http.client.ts
│   ├── /admin                    # Admin module
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   ├── admin.module.ts
│   │   └── /dto
│   │       └── system-stats.dto.ts
│   ├── /files                    # File handling module
│   │   ├── files.service.ts
│   │   ├── files.module.ts
│   │   └── /processors
│   │       ├── pdf-extractor.ts
│   │       └── docx-extractor.ts
│   ├── /common                   # Shared utilities
│   │   ├── /decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── /filters
│   │   │   └── http-exception.filter.ts
│   │   ├── /interceptors
│   │   │   └── logging.interceptor.ts
│   │   ├── /pipes
│   │   │   └── validation.pipe.ts
│   │   └── /enums
│   │       ├── interview-type.enum.ts
│   │       ├── difficulty.enum.ts
│   │       └── session-status.enum.ts
│   ├── /database                 # Database configuration
│   │   ├── database.module.ts
│   │   └── /migrations
│   │       └── [timestamp]-[description].ts
│   ├── /config                   # Configuration
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── app.module.ts             # Root module
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts                   # Application entry point
├── /test                         # Tests
│   ├── /unit
│   └── /e2e
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### 3.3 Backend Module Breakdown

#### 3.3.1 AuthModule

**Responsibilities:**
- User registration with email verification
- User login with JWT token generation
- Token refresh mechanism
- Password reset flow
- Logout (refresh token invalidation)

**Key Components:**

**AuthController**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Invalidate refresh token
- `POST /api/auth/password-reset-request` - Request password reset
- `POST /api/auth/password-reset-confirm` - Confirm password reset

**AuthService**
```typescript
class AuthService {
  async register(dto: RegisterDto): Promise<User>
  async login(dto: LoginDto): Promise<TokensDto>
  async refreshTokens(refreshToken: string): Promise<TokensDto>
  async logout(userId: string): Promise<void>
  async requestPasswordReset(email: string): Promise<void>
  async confirmPasswordReset(token: string, newPassword: string): Promise<void>
  async validateUser(email: string, password: string): Promise<User | null>
  async generateTokens(user: User): Promise<TokensDto>
}
```

**Guards:**
- `JwtAuthGuard`: Validates JWT access token on protected routes
- `RolesGuard`: Checks user role against required roles

#### 3.3.2 UsersModule

**Responsibilities:**
- User CRUD operations
- User search and filtering (admin)
- User suspension/reactivation (admin)
- User account deletion

**Key Components:**

**UsersController**
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update current user
- `GET /api/users` - List all users (admin)
- `GET /api/users/:id` - Get user by ID (admin)
- `PATCH /api/users/:id/suspend` - Suspend user (admin)
- `PATCH /api/users/:id/reactivate` - Reactivate user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

**UsersService**
```typescript
class UsersService {
  async create(dto: CreateUserDto): Promise<User>
  async findById(id: string): Promise<User>
  async findByEmail(email: string): Promise<User>
  async findAll(filters: UserFilters): Promise<PaginatedResult<User>>
  async update(id: string, dto: UpdateUserDto): Promise<User>
  async suspend(id: string, reason: string): Promise<User>
  async reactivate(id: string): Promise<User>
  async softDelete(id: string): Promise<void>
  async hardDelete(id: string): Promise<void>
}
```

#### 3.3.3 ProfilesModule

**Responsibilities:**
- User profile management (education, employment, skills)
- Skill tags management
- Profile completion status

**ProfilesService**
```typescript
class ProfilesService {
  async getProfile(userId: string): Promise<UserProfile>
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile>
  async addSkillTag(userId: string, skill: string): Promise<void>
  async removeSkillTag(userId: string, skill: string): Promise<void>
  async getCompletionPercentage(userId: string): Promise<number>
}
```

#### 3.3.4 ResumesModule

**Responsibilities:**
- Resume file upload and storage
- Text extraction from PDF and DOCX files
- Resume management (list, download, delete, set active)

**ResumesService**
```typescript
class ResumesService {
  async uploadResume(userId: string, file: Express.Multer.File): Promise<Resume>
  async extractText(resumeId: string): Promise<string>
  async listResumes(userId: string): Promise<Resume[]>
  async downloadResume(resumeId: string): Promise<Buffer>
  async deleteResume(resumeId: string): Promise<void>
  async setActiveResume(userId: string, resumeId: string): Promise<void>
  async getActiveResume(userId: string): Promise<Resume | null>
}
```

**Text Extraction:**
- `PDFExtractor`: Uses `pdf-parse` library to extract text from PDF
- `DOCXExtractor`: Uses `mammoth` library to extract text from DOCX

#### 3.3.5 InterviewsModule

**Responsibilities:**
- Interview session lifecycle (create, start, pause, resume, end)
- Answer submission and orchestration with AI service
- Session state management

**InterviewsController**
- `POST /api/interviews` - Create new interview session
- `GET /api/interviews` - List user's sessions
- `GET /api/interviews/:id` - Get session details
- `POST /api/interviews/:id/start` - Start session
- `POST /api/interviews/:id/pause` - Pause session
- `POST /api/interviews/:id/resume` - Resume session
- `POST /api/interviews/:id/end` - End session
- `POST /api/interviews/:id/answers` - Submit answer
- `DELETE /api/interviews/:id` - Soft delete session

**InterviewsService**
```typescript
class InterviewsService {
  async create(userId: string, dto: CreateInterviewDto): Promise<InterviewSession>
  async start(sessionId: string): Promise<{ question: InterviewQuestion }>
  async pause(sessionId: string): Promise<void>
  async resume(sessionId: string): Promise<{ question: InterviewQuestion }>
  async end(sessionId: string): Promise<SessionReport>
  async submitAnswer(sessionId: string, dto: SubmitAnswerDto): Promise<{
    evaluation: AnswerEvaluation;
    nextQuestion: InterviewQuestion;
  }>
  async findUserSessions(userId: string, filters: SessionFilters): Promise<PaginatedResult<InterviewSession>>
  async findById(sessionId: string): Promise<InterviewSession>
  async softDelete(sessionId: string): Promise<void>
}
```

**Workflow on Answer Submission:**
1. Validate session is IN_PROGRESS
2. Save answer to database
3. Call `AIService.evaluateAnswer()`
4. Save evaluation result
5. Call `AIService.generateQuestion()`
6. Save generated question
7. Return evaluation and next question to frontend

#### 3.3.6 QuestionsModule

**Responsibilities:**
- Store interview questions
- Associate questions with sessions
- Retrieve question history

**QuestionsService**
```typescript
class QuestionsService {
  async create(sessionId: string, dto: CreateQuestionDto): Promise<InterviewQuestion>
  async findBySession(sessionId: string): Promise<InterviewQuestion[]>
  async findById(questionId: string): Promise<InterviewQuestion>
}
```

#### 3.3.7 AnswersModule

**Responsibilities:**
- Store user answers
- Associate answers with questions and sessions
- Store evaluation results

**AnswersService**
```typescript
class AnswersService {
  async create(questionId: string, dto: CreateAnswerDto): Promise<InterviewAnswer>
  async findByQuestion(questionId: string): Promise<InterviewAnswer>
  async findBySession(sessionId: string): Promise<InterviewAnswer[]>
  async updateEvaluation(answerId: string, evaluation: AnswerEvaluation): Promise<void>
}
```

#### 3.3.8 ReportsModule

**Responsibilities:**
- Generate and store session reports
- Retrieve reports for display
- Calculate aggregate statistics

**ReportsController**
- `GET /api/reports/:sessionId` - Get session report
- `GET /api/reports/user/stats` - Get user statistics

**ReportsService**
```typescript
class ReportsService {
  async generate(sessionId: string): Promise<SessionReport>
  async findBySession(sessionId: string): Promise<SessionReport>
  async getUserStats(userId: string): Promise<UserStats>
  async getProgressTrend(userId: string): Promise<ScoreTrend[]>
}
```

**Report Generation Workflow:**
1. Fetch all questions and answers for session
2. Call `AIService.summarizeSession()`
3. Create `SessionReport` entity with AI-generated content
4. Calculate aggregate scores
5. Persist report to database
6. Return report to caller

#### 3.3.9 AIModule

**Responsibilities:**
- Proxy requests to Python AI service
- Handle AI service errors and timeouts
- Circuit breaker pattern for resilience
- Transform backend data structures to AI service requests

**AIService**
```typescript
class AIService {
  async generateQuestion(dto: GenerateQuestionDto): Promise<AIQuestionResponse>
  async evaluateAnswer(dto: EvaluateAnswerDto): Promise<AIEvaluationResponse>
  async summarizeSession(dto: SummarizeSessionDto): Promise<AISummaryResponse>
  
  // Circuit breaker and retry logic
  private async callWithRetry<T>(fn: () => Promise<T>, retries: number): Promise<T>
  private async checkHealth(): Promise<boolean>
}
```

**AIHttpClient**
- Wrapper around `HttpService` (Axios)
- Configures timeout (8s default)
- Adds error handling and logging
- Implements retry with exponential backoff

#### 3.3.10 AdminModule

**Responsibilities:**
- System-wide statistics
- All-users session viewing
- Question seed management (future)
- System health monitoring

**AdminController**
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - List all users with filters
- `GET /api/admin/sessions` - List all sessions with filters
- `GET /api/admin/health` - Get system health status
- `GET /api/admin/audit-logs` - Get audit trail

**AdminService**
```typescript
class AdminService {
  async getSystemStats(): Promise<SystemStats>
  async getAllSessions(filters: SessionFilters): Promise<PaginatedResult<InterviewSession>>
  async getHealthStatus(): Promise<HealthStatus>
  async getAuditLogs(filters: AuditFilters): Promise<PaginatedResult<AuditLog>>
}
```

#### 3.3.11 FilesModule

**Responsibilities:**
- File storage abstraction
- Resume text extraction coordination
- File validation

**FilesService**
```typescript
class FilesService {
  async saveFile(file: Express.Multer.File, userId: string): Promise<string>
  async getFile(filePath: string): Promise<Buffer>
  async deleteFile(filePath: string): Promise<void>
  async extractText(filePath: string, fileType: string): Promise<string>
}
```

**Storage Strategy:**
- MVP: Local filesystem storage in `/uploads` directory
- Production: S3-compatible object storage (AWS S3, MinIO)

### 3.4 Backend Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      NestJS Backend API                       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   Controller Layer                     │  │
│  │                                                        │  │
│  │  [Auth] [Users] [Profiles] [Resumes] [Interviews]    │  │
│  │  [Reports] [Admin]                                    │  │
│  └──────────────────────┬─────────────────────────────────┘  │
│                         │                                     │
│  ┌──────────────────────▼─────────────────────────────────┐  │
│  │                   Service Layer                        │  │
│  │                                                        │  │
│  │  [AuthService] [UsersService] [ProfilesService]       │  │
│  │  [ResumesService] [InterviewsService]                 │  │
│  │  [QuestionsService] [AnswersService]                  │  │
│  │  [ReportsService] [FilesService]                      │  │
│  │  [AIService] ─────────────────────────────┐           │  │
│  └──────────────────────┬─────────────────────┼───────────┘  │
│                         │                     │ HTTP          │
│  ┌──────────────────────▼─────────────────┐   │              │
│  │       Repository Layer (TypeORM)       │   │              │
│  │                                        │   │              │
│  │  [UserRepo] [SessionRepo] [QuestionRepo]  │              │
│  │  [AnswerRepo] [ReportRepo]             │   │              │
│  └──────────────────────┬─────────────────┘   │              │
│                         │ SQL                 │              │
└─────────────────────────┼─────────────────────┼──────────────┘
                          │                     │
                          ▼                     ▼
                  ┌──────────────┐   ┌──────────────────┐
                  │  PostgreSQL  │   │   AI Service     │
                  │   Database   │   │   (FastAPI)      │
                  └──────────────┘   └──────────────────┘
```

### 3.5 Shared Types and DTOs

**DTO Example: CreateInterviewDto**
```typescript
export class CreateInterviewDto {
  @ApiProperty({ enum: InterviewType })
  @IsEnum(InterviewType)
  type: InterviewType;

  @ApiProperty({ enum: Difficulty })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({ minimum: 15, maximum: 60 })
  @IsNumber()
  @Min(15)
  @Max(60)
  duration: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  focusAreas?: string[];
}
```

---

## 4. AI Service Component Architecture

### 4.1 AI Service Technology Stack
- **Framework:** FastAPI (Python)
- **Language:** Python 3.10+
- **LLM Client:** OpenAI SDK or LangChain
- **Validation:** Pydantic models
- **HTTP Client:** httpx or aiohttp

### 4.2 AI Service Folder Structure

```
/ai-service
├── /app
│   ├── /api
│   │   ├── /v1
│   │   │   ├── __init__.py
│   │   │   ├── generate_question.py    # Question generation endpoint
│   │   │   ├── evaluate_answer.py      # Answer evaluation endpoint
│   │   │   └── summarize_session.py    # Session summary endpoint
│   │   └── router.py
│   ├── /services
│   │   ├── llm_client.py               # LLM API client wrapper
│   │   ├── prompt_builder.py           # Prompt construction logic
│   │   ├── response_parser.py          # Parse and validate LLM responses
│   │   └── context_manager.py          # Manage conversation context
│   ├── /models
│   │   ├── requests.py                 # Pydantic request models
│   │   ├── responses.py                # Pydantic response models
│   │   └── prompts.py                  # Prompt templates
│   ├── /utils
│   │   ├── logger.py
│   │   └── config.py
│   ├── main.py                         # FastAPI app entry point
│   └── config.py                       # Configuration
├── /tests
│   ├── test_generate_question.py
│   ├── test_evaluate_answer.py
│   └── test_summarize_session.py
├── requirements.txt
└── Dockerfile
```

### 4.3 AI Service Component Breakdown

#### 4.3.1 API Routers

**Generate Question Router**
```python
@router.post("/api/generate-question", response_model=QuestionResponse)
async def generate_question(request: GenerateQuestionRequest):
    """
    Generate the next interview question based on context.
    
    - Analyzes resume text, previous Q&A, interview type/difficulty
    - Constructs appropriate prompt for LLM
    - Calls LLM API
    - Parses and validates response
    - Returns structured question
    """
    pass
```

**Evaluate Answer Router**
```python
@router.post("/api/evaluate-answer", response_model=EvaluationResponse)
async def evaluate_answer(request: EvaluateAnswerRequest):
    """
    Evaluate user's answer to an interview question.
    
    - Analyzes answer quality, completeness, accuracy
    - Scores across multiple dimensions
    - Provides constructive feedback
    - Returns structured evaluation
    """
    pass
```

**Summarize Session Router**
```python
@router.post("/api/summarize-session", response_model=SummaryResponse)
async def summarize_session(request: SummarizeSessionRequest):
    """
    Generate comprehensive session summary and recommendations.
    
    - Analyzes all Q&A pairs in session
    - Identifies patterns, strengths, weaknesses
    - Generates actionable recommendations
    - Returns structured summary
    """
    pass
```

#### 4.3.2 Services

**LLMClient Service**
```python
class LLMClient:
    def __init__(self, api_key: str, model: str):
        self.client = OpenAI(api_key=api_key)
        self.model = model
    
    async def complete(
        self, 
        messages: List[Dict],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """Call LLM API with retry and error handling"""
        pass
    
    async def complete_structured(
        self,
        messages: List[Dict],
        response_schema: Dict
    ) -> Dict:
        """Call LLM API with structured output (JSON mode)"""
        pass
```

**PromptBuilder Service**
```python
class PromptBuilder:
    def build_question_prompt(
        self,
        interview_type: str,
        difficulty: str,
        resume_text: str,
        skill_tags: List[str],
        previous_qa: List[Dict]
    ) -> List[Dict]:
        """Construct system and user messages for question generation"""
        pass
    
    def build_evaluation_prompt(
        self,
        question: str,
        answer: str,
        interview_type: str
    ) -> List[Dict]:
        """Construct prompt for answer evaluation"""
        pass
    
    def build_summary_prompt(
        self,
        qa_pairs: List[Dict],
        interview_type: str
    ) -> List[Dict]:
        """Construct prompt for session summarization"""
        pass
```

**ResponseParser Service**
```python
class ResponseParser:
    def parse_question_response(self, llm_output: str) -> QuestionResponse:
        """Extract and validate question from LLM output"""
        pass
    
    def parse_evaluation_response(self, llm_output: str) -> EvaluationResponse:
        """Extract scores and feedback from LLM output"""
        pass
    
    def parse_summary_response(self, llm_output: str) -> SummaryResponse:
        """Extract structured summary from LLM output"""
        pass
```

#### 4.3.3 Models (Pydantic Schemas)

**Request Models**
```python
class GenerateQuestionRequest(BaseModel):
    interview_type: InterviewType
    difficulty: Difficulty
    resume_text: str
    skill_tags: List[str]
    previous_questions: List[str] = []
    previous_answers: List[str] = []

class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    interview_type: InterviewType
    expected_answer_length: str

class SummarizeSessionRequest(BaseModel):
    interview_type: InterviewType
    qa_pairs: List[QAPair]
```

**Response Models**
```python
class QuestionResponse(BaseModel):
    question: str
    focus_area: str
    expected_answer_length: str
    metadata: Dict

class EvaluationResponse(BaseModel):
    overall_score: int  # 0-100
    completeness_score: int  # 0-25
    accuracy_score: int  # 0-25
    clarity_score: int  # 0-25
    depth_score: int  # 0-25
    feedback: str
    metadata: Dict

class SummaryResponse(BaseModel):
    overall_score: int
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    metadata: Dict
```

### 4.4 AI Service Component Diagram

```
┌───────────────────────────────────────────────────────┐
│              FastAPI AI Service                      │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │            API Router Layer                    │  │
│  │  /api/generate-question                        │  │
│  │  /api/evaluate-answer                          │  │
│  │  /api/summarize-session                        │  │
│  └──────────────────┬─────────────────────────────┘  │
│                     │                                 │
│  ┌──────────────────▼─────────────────────────────┐  │
│  │            Service Layer                       │  │
│  │  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │PromptBuilder │  │ ResponseParser│          │  │
│  │  └──────┬───────┘  └──────▲───────┘           │  │
│  │         │                  │                   │  │
│  │         ▼                  │                   │  │
│  │  ┌─────────────────────────┴────┐             │  │
│  │  │       LLMClient              │             │  │
│  │  │  - API call with retry       │             │  │
│  │  │  - Error handling            │             │  │
│  │  └─────────────┬────────────────┘             │  │
│  └────────────────┼──────────────────────────────┘  │
│                   │ HTTPS                            │
└───────────────────┼──────────────────────────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │   External LLM API     │
        │  (OpenAI / Anthropic)  │
        └────────────────────────┘
```

---

## 5. Shared Types Between Frontend and Backend

To ensure type safety and consistency, shared types can be generated from OpenAPI specification:

**Approach:**
1. Backend generates OpenAPI spec using `@nestjs/swagger`
2. Use `openapi-typescript-codegen` or similar tool to generate TypeScript types
3. Frontend imports generated types from `/shared/api-types`

**Example Shared Types:**
- `User`
- `UserProfile`
- `Resume`
- `InterviewSession`
- `InterviewQuestion`
- `InterviewAnswer`
- `SessionReport`
- `InterviewType`, `Difficulty`, `SessionStatus` enums

---

## 6. Component Interaction Sequence

**Example: Submit Answer Flow**

```
Frontend (AnswerInput)
    │
    │ onClick Submit
    │
    ▼
Frontend (useInterview hook)
    │
    │ POST /api/interviews/{id}/answers
    │
    ▼
Backend (InterviewsController)
    │
    │ @Post(':id/answers')
    │
    ▼
Backend (InterviewsService)
    │
    ├──> AnswersService.create() ──> Database (save answer)
    │
    ├──> AIService.evaluateAnswer()
    │         │
    │         ▼
    │    AI Service (evaluate_answer endpoint)
    │         │
    │         ├──> PromptBuilder.build_evaluation_prompt()
    │         ├──> LLMClient.complete()
    │         │         │
    │         │         ▼
    │         │    External LLM API (OpenAI)
    │         │         │
    │         │         ▼
    │         │    LLM Response (JSON)
    │         │
    │         └──> ResponseParser.parse_evaluation_response()
    │         │
    │         ▼
    │    EvaluationResponse
    │
    ├──> AnswersService.updateEvaluation() ──> Database
    │
    ├──> AIService.generateQuestion()
    │         │
    │         └──> (similar flow as evaluation)
    │
    ├──> QuestionsService.create() ──> Database
    │
    ▼
Response to Frontend
    │
    ▼
Frontend renders evaluation + next question
```

---

## 7. Conclusion

This document provides a comprehensive component-level view of the AI-Powered Mock Interview System across all three layers: Frontend (Next.js), Backend (NestJS), and AI Service (FastAPI). Each component has clearly defined responsibilities, interfaces, and interactions with other components.

The modular architecture ensures:
- **Separation of Concerns:** Each component handles a specific domain
- **Testability:** Components can be unit tested in isolation
- **Maintainability:** Clear boundaries make code changes predictable
- **Scalability:** Components can be optimized or scaled independently
- **Type Safety:** Shared types and validation ensure consistency

Implementation teams can use this document as a blueprint for development, ensuring consistent structure and adherence to architectural principles.
