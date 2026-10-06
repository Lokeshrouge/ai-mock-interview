# Frontend Pages Architecture

## Page List

### Public Pages
1. Landing Page (`/`)
2. Login (`/login`)
3. Register (`/register`)

### Student Pages
4. Dashboard (`/dashboard`)
5. Profile (`/profile`)
6. Resumes (`/resumes`)
7. Interview Setup (`/interview/setup`)
8. Interview Room (`/interview/[id]`)
9. Interview Report (`/interview/[id]/report`)
10. Interview History (`/history`)

### Admin Pages
11. Admin Dashboard (`/admin/dashboard`)
12. User Management (`/admin/users`)
13. Job Role Management (`/admin/job-roles`)
14. System Settings (`/admin/settings`)

---

## Page Details

### 1. Landing Page (`/`)
**Purpose**: Introduce platform, encourage sign-up  
**Components**: Hero, Features, CTA, Footer  
**Data**: None (static)  
**Actions**: Navigate to Login/Register

### 2. Login (`/login`)
**Purpose**: User authentication  
**Components**: LoginForm  
**API**: POST `/auth/login`  
**Actions**: Login → Redirect to dashboard

### 3. Register (`/register`)
**Purpose**: New user registration  
**Components**: RegisterForm  
**API**: POST `/auth/register`  
**Actions**: Register → Redirect to dashboard

### 4. Dashboard (`/dashboard`)
**Purpose**: Student home, quick actions  
**Components**: Stats, RecentInterviews, QuickActions  
**API**: GET `/profile`, GET `/interviews`  
**Actions**: Start interview, View history

### 5. Profile (`/profile`)
**Purpose**: Manage profile  
**Components**: ProfileForm, ProfilePicture  
**API**: GET `/profile`, PUT `/profile`  
**Actions**: Update profile

### 6. Resumes (`/resumes`)
**Purpose**: Manage resumes  
**Components**: ResumeUpload, ResumeList, ResumeCard  
**API**: GET `/resumes`, POST `/resumes`, DELETE `/resumes/:id`  
**Actions**: Upload, View, Delete

### 7. Interview Setup (`/interview/setup`)
**Purpose**: Configure new interview  
**Components**: JobRoleSelector, TypeSelector, DifficultySelector  
**API**: GET `/job-roles`, POST `/interviews`  
**Actions**: Create interview → Navigate to room

### 8. Interview Room (`/interview/[id]`)
**Purpose**: Conduct interview  
**Components**: QuestionCard, AnswerInput, Progress, Timer  
**API**: POST `/interviews/:id/start`, POST `/interviews/:id/answers`  
**Actions**: Answer questions, Complete

### 9. Interview Report (`/interview/[id]/report`)
**Purpose**: View results  
**Components**: ScoreCard, QuestionResults, Recommendations  
**API**: GET `/interviews/:id/report`  
**Actions**: View details, Retake

### 10. History (`/history`)
**Purpose**: Past interviews  
**Components**: InterviewList, FilterBar, ProgressChart  
**API**: GET `/interviews`  
**Actions**: Filter, View report

### 11. Admin Dashboard (`/admin/dashboard`)
**Purpose**: System overview  
**Components**: StatCards, Charts, RecentActivity  
**API**: GET `/admin/dashboard/stats`  
**Actions**: Navigate to management

### 12. User Management (`/admin/users`)
**Purpose**: Manage users  
**Components**: UserTable, SearchBar, ActionButtons  
**API**: GET `/admin/users`, PATCH `/admin/users/:id/deactivate`  
**Actions**: View, Deactivate

### 13. Job Roles (`/admin/job-roles`)
**Purpose**: Manage roles  
**Components**: RoleList, CreateRoleForm  
**API**: GET `/job-roles`, POST `/admin/job-roles`  
**Actions**: Create, Edit, Delete

### 14. Settings (`/admin/settings`)
**Purpose**: System config  
**Components**: SettingsForm  
**API**: Various config endpoints  
**Actions**: Update settings
