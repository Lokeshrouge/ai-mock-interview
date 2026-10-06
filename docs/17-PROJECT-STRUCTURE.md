# Project Structure

## Repository Organization

**Recommended**: Monorepo with separate service directories

```
ai-mock-interview/
├── frontend/                 # Next.js application
├── backend/                  # NestJS application
├── ai-service/              # Python FastAPI application
├── docs/                    # All documentation
├── docker-compose.yml       # Local development orchestration
├── .gitignore              # Git ignore rules
├── README.md               # Project overview
└── package.json            # Root workspace config (optional)
```

---

## Frontend Structure (`/frontend`)

```
frontend/
├── public/                  # Static assets
│   ├── images/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── app/                 # Next.js 14+ app directory
│   │   ├── (auth)/         # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (student)/      # Student route group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── resumes/
│   │   │   │   └── page.tsx
│   │   │   ├── interview/
│   │   │   │   ├── setup/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Interview room
│   │   │   │       └── report/
│   │   │   │           └── page.tsx
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   ├── (admin)/        # Admin route group
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── job-roles/
│   │   │   └── settings/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Landing page
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable components
│   │   ├── ui/            # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── layout/        # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── auth/          # Auth-specific
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── interview/     # Interview-specific
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── AnswerInput.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── EvaluationDisplay.tsx
│   │   ├── profile/
│   │   │   ├── ProfileForm.tsx
│   │   │   └── ProfileCard.tsx
│   │   └── resume/
│   │       ├── ResumeUpload.tsx
│   │       └── ResumeCard.tsx
│   ├── lib/               # Utilities
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Auth utilities
│   │   ├── utils.ts      # General utilities
│   │   └── constants.ts  # Constants
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useInterview.ts
│   │   └── useApi.ts
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── types/            # TypeScript types
│   │   ├── user.ts
│   │   ├── interview.ts
│   │   ├── resume.ts
│   │   └── api.ts
│   └── styles/           # Additional styles
│       └── interview.css
├── .env.local           # Environment variables
├── .env.example         # Environment template
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies
└── README.md            # Frontend documentation
```

---

## Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── auth/                      # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       └── login.dto.ts
│   ├── users/                     # User management
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │       └── update-user.dto.ts
│   ├── profiles/                  # Student profiles
│   │   ├── profiles.module.ts
│   │   ├── profiles.controller.ts
│   │   ├── profiles.service.ts
│   │   ├── entities/
│   │   │   └── profile.entity.ts
│   │   └── dto/
│   │       └── update-profile.dto.ts
│   ├── resumes/                   # Resume management
│   │   ├── resumes.module.ts
│   │   ├── resumes.controller.ts
│   │   ├── resumes.service.ts
│   │   ├── entities/
│   │   │   └── resume.entity.ts
│   │   └── dto/
│   │       └── upload-resume.dto.ts
│   ├── job-roles/                 # Job roles
│   │   ├── job-roles.module.ts
│   │   ├── job-roles.controller.ts
│   │   ├── job-roles.service.ts
│   │   ├── entities/
│   │   │   └── job-role.entity.ts
│   │   └── dto/
│   │       └── create-job-role.dto.ts
│   ├── interviews/                # Interview management
│   │   ├── interviews.module.ts
│   │   ├── interviews.controller.ts
│   │   ├── interviews.service.ts
│   │   ├── entities/
│   │   │   ├── interview.entity.ts
│   │   │   ├── question.entity.ts
│   │   │   ├── answer.entity.ts
│   │   │   ├── evaluation.entity.ts
│   │   │   └── recommendation.entity.ts
│   │   ├── dto/
│   │   │   ├── create-interview.dto.ts
│   │   │   ├── start-interview.dto.ts
│   │   │   └── submit-answer.dto.ts
│   │   └── state-machine/
│   │       └── interview-state.machine.ts
│   ├── ai-service/                # AI service integration
│   │   ├── ai-service.module.ts
│   │   ├── ai-service.service.ts
│   │   └── dto/
│   │       ├── generate-questions.dto.ts
│   │       └── evaluate-answer.dto.ts
│   ├── admin/                     # Admin functionality
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   └── admin.service.ts
│   ├── common/                    # Shared code
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── decorators/
│   │       └── user.decorator.ts
│   ├── database/                  # Database configuration
│   │   ├── database.module.ts
│   │   ├── migrations/
│   │   │   ├── 001-create-users.ts
│   │   │   ├── 002-create-profiles.ts
│   │   │   └── ...
│   │   └── seeds/
│   │       └── job-roles.seed.ts
│   ├── config/                    # Configuration
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   └── utils/                     # Utilities
│       ├── logger.ts
│       └── file-upload.utils.ts
├── test/                          # E2E tests
│   └── app.e2e-spec.ts
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── nest-cli.json                 # NestJS CLI config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── README.md                     # Backend documentation
```

---

## AI Service Structure (`/ai-service`)

```
ai-service/
├── app/
│   ├── main.py                   # FastAPI entry point
│   ├── config.py                 # Configuration
│   ├── dependencies.py           # Dependencies
│   ├── routers/                  # API routes
│   │   ├── __init__.py
│   │   ├── resume.py            # Resume parsing endpoints
│   │   ├── questions.py         # Question generation
│   │   ├── evaluation.py        # Answer evaluation
│   │   └── recommendations.py   # Recommendations
│   ├── services/                 # Business logic
│   │   ├── __init__.py
│   │   ├── resume_parser.py
│   │   ├── question_generator.py
│   │   ├── answer_evaluator.py
│   │   └── recommendation_service.py
│   ├── llm/                      # LLM integration
│   │   ├── __init__.py
│   │   ├── base.py              # Abstract provider
│   │   ├── openai_provider.py
│   │   ├── anthropic_provider.py
│   │   └── factory.py           # Provider factory
│   ├── prompts/                  # Prompt templates
│   │   ├── __init__.py
│   │   ├── question_prompts.py
│   │   ├── evaluation_prompts.py
│   │   └── recommendation_prompts.py
│   ├── models/                   # Pydantic models
│   │   ├── __init__.py
│   │   ├── resume.py
│   │   ├── question.py
│   │   ├── evaluation.py
│   │   └── recommendation.py
│   ├── utils/                    # Utilities
│   │   ├── __init__.py
│   │   ├── pdf_extractor.py
│   │   ├── docx_extractor.py
│   │   ├── validators.py
│   │   └── logger.py
│   └── middleware/               # Middleware
│       └── error_handler.py
├── tests/                        # Unit tests
│   ├── __init__.py
│   ├── test_resume_parser.py
│   ├── test_question_generator.py
│   └── test_evaluator.py
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Docker configuration
└── README.md                    # AI service documentation
```

---

## Documentation Structure (`/docs`)

```
docs/
├── 01-PROJECT-DEFINITION.md
├── 02-PROBLEM-STATEMENT.md
├── 03-OBJECTIVES-AND-SCOPE.md
├── 04-USER-ROLES.md
├── 05-FUNCTIONAL-REQUIREMENTS.md
├── 06-NON-FUNCTIONAL-REQUIREMENTS.md
├── 07-SYSTEM-ARCHITECTURE.md
├── 08-DATABASE-DESIGN.md
├── 09-API-DESIGN.md
├── 10-AI-ARCHITECTURE.md
├── 11-INTERVIEW-STATE-MACHINE.md
├── 12-FRONTEND-ARCHITECTURE.md
├── 13-BACKEND-MODULES.md
├── 14-SECURITY-DESIGN.md
├── 15-ERROR-HANDLING.md
├── 16-TESTING-STRATEGY.md
├── 17-PROJECT-STRUCTURE.md       # This file
├── 18-TECH-STACK-JUSTIFICATION.md
├── 19-DEVELOPMENT-ROADMAP.md
├── 20-RISKS-MITIGATION.md
├── 21-COLLEGE-REPORT-STRUCTURE.md
├── 22-PHASE1-SUMMARY.md
├── diagrams/                     # Architecture diagrams
│   ├── system-architecture.png
│   ├── database-erd.png
│   └── interview-flow.png
└── api/                          # API documentation
    └── openapi.yaml             # OpenAPI specification
```

---

## Root Configuration Files

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mock_interview
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://dev:dev_password@postgres:5432/mock_interview
      AI_SERVICE_URL: http://ai-service:8000
    depends_on:
      - postgres
      - ai-service
    volumes:
      - ./backend:/app
      - /app/node_modules

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    volumes:
      - ./ai-service:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:
```

### Root `.gitignore`
```
# Dependencies
node_modules/
__pycache__/
*.pyc
.env
.env.local

# Build outputs
.next/
dist/
build/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# Uploads
uploads/
resumes/
```

---

## Naming Conventions

### Files & Folders
- **kebab-case** for folders: `job-roles/`, `interview-state/`
- **PascalCase** for components: `QuestionCard.tsx`
- **camelCase** for utilities: `apiClient.ts`
- **snake_case** for Python: `resume_parser.py`

### Code
- **PascalCase** for classes: `InterviewService`, `QuestionGenerator`
- **camelCase** for functions/variables: `generateQuestions()`, `userId`
- **UPPER_SNAKE_CASE** for constants: `MAX_FILE_SIZE`, `API_BASE_URL`
- **SCREAMING_SNAKE_CASE** for env vars: `DATABASE_URL`, `OPENAI_API_KEY`

### Database
- **snake_case** for tables: `users`, `interview_questions`
- **snake_case** for columns: `user_id`, `created_at`

---

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=AI Mock Interview
```

### Backend (`.env`)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://dev:dev_password@localhost:5432/mock_interview
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8000
FILE_UPLOAD_MAX_SIZE=5242880
CORS_ORIGIN=http://localhost:3000
```

### AI Service (`.env`)
```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MODEL_NAME=gpt-4-turbo
TEMPERATURE=0.7
MAX_TOKENS=2000
```

---

## Module Dependencies

```
Frontend → Backend API
Backend → Database (PostgreSQL)
Backend → AI Service
AI Service → LLM Provider (OpenAI/Anthropic)
```

**No circular dependencies**  
**Frontend never calls AI Service directly**

---

## Version Control Strategy

### Branch Structure
```
main                    # Production-ready code
├── develop            # Development branch
│   ├── feature/auth
│   ├── feature/interview
│   ├── feature/ai-integration
│   └── feature/admin-dashboard
└── hotfix/            # Urgent fixes
```

### Commit Convention
```
feat: Add resume upload functionality
fix: Resolve JWT expiration issue
docs: Update API documentation
test: Add interview service tests
refactor: Improve question generation logic
```

---

## Benefits of This Structure

✅ **Clear Separation**: Each service is self-contained  
✅ **Scalability**: Easy to add new modules  
✅ **Maintainability**: Organized and predictable  
✅ **Testability**: Each module can be tested independently  
✅ **Team-Friendly**: Multiple developers can work in parallel  
✅ **Academic-Friendly**: Clear structure for documentation
