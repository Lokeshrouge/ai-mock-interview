# Project Structure

## 1. Overview

The AI-Powered Mock Interview System is organized as a monorepo containing three distinct applications (frontend, backend API, and AI service) along with shared packages and documentation. This structure promotes code reuse, simplifies dependency management, and enables atomic cross-application changes. The monorepo is managed using npm workspaces (or pnpm workspaces), allowing independent versioning while maintaining unified tooling and CI/CD pipelines.

## 2. Monorepo Management

### 2.1 Package Manager: npm Workspaces

**Root package.json**:
```json
{
  "name": "ai-mock-interview",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:web\" \"npm run dev:api\" \"npm run dev:ai\"",
    "dev:web": "npm run dev --workspace=apps/web",
    "dev:api": "npm run dev --workspace=apps/api",
    "dev:ai": "cd apps/ai-service && uvicorn main:app --reload --port 8002",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "tsc --noEmit"
  }
}
```

### 2.2 Alternative: pnpm Workspaces

For improved performance and disk space efficiency:

**pnpm-workspace.yaml**:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## 3. Root Directory Structure

```
ai-mock-interview/
├── apps/
│   ├── web/                    # Next.js frontend
│   ├── api/                    # NestJS backend
│   └── ai-service/             # Python FastAPI
├── packages/
│   └── shared-types/           # Shared TypeScript interfaces
├── docs/                       # All specification documents
├── scripts/                    # Utility scripts
├── .github/workflows/          # CI/CD pipelines
├── docker-compose.yml          # Local development
├── .env.example                # Example environment variables
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.base.json
├── package.json
└── README.md
```

## 4. Frontend Application Structure (apps/web)

```
apps/web/
├── app/                        # Next.js 14 App Router
│   ├── (auth)/                 # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/            # Dashboard layout group
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── interviews/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── session/
│   │   │       │   └── page.tsx
│   │   │       └── report/
│   │   │           └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── modal.tsx
│   ├── forms/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── create-interview-form.tsx
│   ├── interview/
│   │   ├── question-card.tsx
│   │   ├── answer-input.tsx
│   │   ├── progress-bar.tsx
│   │   └── interview-error-boundary.tsx
│   ├── dashboard/
│   │   ├── interview-list.tsx
│   │   ├── interview-card.tsx
│   │   └── stats-card.tsx
│   └── layout/
│       ├── header.tsx
│       ├── footer.tsx
│       └── sidebar.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-interview-session.ts
│   ├── use-create-interview.ts
│   └── use-media-query.ts
├── lib/
│   ├── api/
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── auth.ts
│   │   ├── interviews.ts
│   │   └── users.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   └── interview.schema.ts
│   └── utils.ts
├── store/
│   ├── auth-store.ts           # Zustand auth store
│   └── interview-store.ts      # Zustand interview session store
├── types/
│   └── index.ts
├── public/
│   ├── images/
│   └── icons/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 5. Backend API Structure (apps/api)

```
apps/api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── login.dto.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── refresh-jwt.guard.ts
│   │   │   └── strategies/
│   │   │       ├── jwt.strategy.ts
│   │   │       └── refresh-jwt.strategy.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       └── update-user.dto.ts
│   │   ├── interviews/
│   │   │   ├── interviews.module.ts
│   │   │   ├── interviews.controller.ts
│   │   │   ├── interviews.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── interview.entity.ts
│   │   │   │   ├── question.entity.ts
│   │   │   │   └── answer.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-interview.dto.ts
│   │   │       └── submit-answer.dto.ts
│   │   └── ai/
│   │       ├── ai.module.ts
│   │       ├── ai.service.ts
│   │       └── dto/
│   │           ├── generate-questions.dto.ts
│   │           └── evaluate-answer.dto.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── middleware/
│   │   │   └── request-id.middleware.ts
│   │   ├── exceptions/
│   │   │   └── ai-service.exception.ts
│   │   └── enums/
│   │       └── role.enum.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   └── migrations/
│   ├── main.ts
│   └── app.module.ts
├── test/
│   ├── setup.ts
│   ├── auth.e2e-spec.ts
│   └── interviews.e2e-spec.ts
├── .env
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

## 6. AI Service Structure (apps/ai-service)

```
apps/ai-service/
├── routers/
│   ├── __init__.py
│   ├── questions_router.py     # POST /generate-questions
│   ├── evaluation_router.py    # POST /evaluate-answer
│   └── summary_router.py       # POST /summarise-session
├── services/
│   ├── __init__.py
│   ├── llm_service.py          # LLM API client wrapper
│   ├── prompt_service.py       # Prompt template loader
│   └── parser_service.py       # Response validation
├── models/
│   ├── __init__.py
│   ├── requests.py             # Pydantic request models
│   ├── responses.py            # Pydantic response models
│   └── internal.py
├── prompts/
│   ├── generate_questions.j2
│   ├── evaluate_answer.j2
│   └── summarise_session.j2
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_routers.py
│   ├── test_services.py
│   └── fixtures/
│       └── llm_responses.py
├── config.py
├── main.py
├── requirements.txt
├── pytest.ini
└── Dockerfile
```

## 7. Shared Packages (packages/shared-types)

```
packages/shared-types/
├── src/
│   ├── api/
│   │   ├── auth.types.ts
│   │   ├── interviews.types.ts
│   │   └── users.types.ts
│   └── index.ts
├── tsconfig.json
└── package.json
```

**Example shared type**:
```typescript
// packages/shared-types/src/api/interviews.types.ts
export interface Interview {
  id: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  difficulty: 'junior' | 'mid' | 'senior';
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewDto {
  jobTitle: string;
  jobDescription: string;
  difficulty: 'junior' | 'mid' | 'senior';
}
```

## 8. Configuration Files at Root

### 8.1 ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
```

### 8.2 Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### 8.3 Base TypeScript Configuration

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["ES2021"],
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 8.4 Docker Compose for Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ai_interview_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.dev
    ports:
      - '3001:3001'
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ai_interview_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/api:/app
      - /app/node_modules

  ai-service:
    build:
      context: ./apps/ai-service
      dockerfile: Dockerfile
    ports:
      - '8002:8002'
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    volumes:
      - ./apps/ai-service:/app

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.dev
    ports:
      - '3000:3000'
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - api
    volumes:
      - ./apps/web:/app
      - /app/node_modules

volumes:
  postgres_data:
```

## 9. Naming Conventions

### 9.1 Files and Directories

- **kebab-case**: All file and directory names (e.g., `create-interview-form.tsx`, `auth-service.ts`)
- **Exceptions**: 
  - React components can use PascalCase if preferred (e.g., `CreateInterviewForm.tsx`)
  - Next.js special files: `page.tsx`, `layout.tsx`, `loading.tsx`

### 9.2 Code

- **PascalCase**: 
  - React components: `CreateInterviewForm`, `InterviewCard`
  - TypeScript interfaces/types: `Interview`, `CreateInterviewDto`
  - Classes: `AuthService`, `LLMService`

- **camelCase**: 
  - Functions: `createInterview`, `validateToken`
  - Variables: `accessToken`, `userEmail`
  - Object properties: `jobTitle`, `createdAt`

- **SCREAMING_SNAKE_CASE**: 
  - Environment variables: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`
  - Constants: `MAX_FILE_SIZE`, `TOKEN_EXPIRY`

### 9.3 Database

- **snake_case**: All table and column names
  - Tables: `users`, `interviews`, `interview_questions`
  - Columns: `user_id`, `job_title`, `created_at`

## 10. Git Strategy

### 10.1 Branch Naming

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/[ticket-id]-description**: New features (e.g., `feature/INT-42-add-voice-recording`)
- **fix/[ticket-id]-description**: Bug fixes (e.g., `fix/INT-89-login-redirect`)
- **chore/description**: Maintenance tasks (e.g., `chore/update-dependencies`)

### 10.2 Conventional Commits

All commits follow the conventional commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(auth): add refresh token rotation

Implement automatic refresh token rotation on every use to improve security.
Tokens are invalidated after a single use and replaced with new ones.

Closes INT-42
```

```
fix(interview): preserve answers on session crash

Add error boundary around interview session that saves answers to localStorage
before unmounting. Users can recover their work after page refresh.

Fixes INT-89
```

### 10.3 Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Related Issues
Closes #[issue-number]
```

## 11. Scripts Directory

### 11.1 Database Seeding

```typescript
// scripts/seed-database.ts
import { faker } from '@faker-js/faker';
import { dataSource } from '../apps/api/src/config/database.config';
import { User } from '../apps/api/src/modules/users/entities/user.entity';

async function seed() {
  await dataSource.initialize();
  
  // Create test users
  const users = Array.from({ length: 10 }, () => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: '$2b$12$hashedPassword',
    role: 'STUDENT',
  }));
  
  await dataSource.manager.save(User, users);
  
  console.log('Database seeded successfully');
  await dataSource.destroy();
}

seed();
```

### 11.2 Development Setup

```bash
#!/bin/bash
# scripts/dev-setup.sh

echo "Setting up AI Mock Interview development environment..."

# Install dependencies
npm install

# Copy environment files
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/ai-service/.env.example apps/ai-service/.env

# Start Docker services
docker-compose up -d postgres redis

# Wait for postgres
sleep 5

# Run migrations
npm run migrate --workspace=apps/api

# Seed database
npm run seed --workspace=apps/api

echo "Setup complete! Run 'npm run dev' to start all services."
```

## 12. CI/CD Pipeline Structure

```
.github/workflows/
├── test.yml                    # Run on PR: lint + test
├── build.yml                   # Run on merge: build + docker
├── deploy-staging.yml          # Deploy to staging environment
└── deploy-production.yml       # Deploy to production (manual trigger)
```

**Example test.yml**:
```yaml
name: Test

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:backend

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:frontend

  test-ai-service:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r apps/ai-service/requirements.txt
      - run: pytest apps/ai-service/tests
```

## 13. Environment Variables Structure

### 13.1 Root .env.example

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_interview_dev

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-256-bit-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
MODEL_NAME=gpt-4

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# API URL
API_URL=http://localhost:3001
AI_SERVICE_URL=http://localhost:8002
```

## 14. Documentation Structure

```
docs/
├── 01-REQUIREMENTS-SPEC.md
├── 02-SYSTEM-ARCHITECTURE.md
├── 03-DATABASE-SCHEMA.md
├── 04-API-ENDPOINTS.md
├── 05-AUTHENTICATION-FLOW.md
├── 06-INTERVIEW-SESSION-FLOW.md
├── 07-AI-INTEGRATION.md
├── 08-FRONTEND-ARCHITECTURE.md
├── 09-STATE-MANAGEMENT.md
├── 10-COMPONENT-LIBRARY.md
├── 11-ROUTING-STRUCTURE.md
├── 12-FRONTEND-PAGES.md
├── 13-BACKEND-MODULES.md
├── 14-DATA-MODELS.md
├── 15-AI-SERVICE-ARCHITECTURE.md
├── 16-SECURITY-ARCHITECTURE.md
├── 17-ERROR-HANDLING-STRATEGY.md
├── 18-TESTING-STRATEGY.md
└── 19-PROJECT-STRUCTURE.md
```

## 15. Conclusion

The monorepo structure provides a cohesive development experience while maintaining clear separation between frontend, backend, and AI services. The use of workspaces enables efficient dependency management and unified tooling. Consistent naming conventions, structured directories, and comprehensive documentation ensure that the codebase remains maintainable and accessible to all team members. The modular architecture allows for independent scaling and deployment of services while shared packages prevent code duplication and ensure type safety across the stack.
