# Testing Strategy

## 1. Overview

A comprehensive testing strategy is critical for ensuring the AI-Powered Mock Interview System is reliable, maintainable, and regression-free. This document outlines the testing pyramid approach, covering unit tests, integration tests, and end-to-end tests across all system components. The goal is to achieve high confidence in system correctness while maintaining fast feedback loops for developers.

## 2. Testing Pyramid

The testing strategy follows the classic testing pyramid, allocating effort proportionally to the value and speed of each test layer:

```
           /\
          /  \  E2E Tests (10%)
         /____\
        /      \  Integration Tests (20%)
       /________\
      /          \  Unit Tests (70%)
     /____________\
```

### 2.1 Unit Tests (70%)

- **Scope**: Individual functions, methods, and classes in isolation
- **Speed**: Milliseconds per test
- **Dependencies**: Mocked or stubbed
- **Coverage Target**: 80% line coverage, 90% for critical business logic
- **Tools**: Jest (JavaScript/TypeScript), pytest (Python)

### 2.2 Integration Tests (20%)

- **Scope**: Multiple components working together, including database
- **Speed**: Seconds per test
- **Dependencies**: Real database (test instance), mocked external services
- **Coverage Target**: All critical user flows
- **Tools**: Jest + Supertest (NestJS), pytest + TestClient (FastAPI)

### 2.3 End-to-End Tests (10%)

- **Scope**: Complete user journeys through the UI
- **Speed**: Seconds to minutes per test
- **Dependencies**: Full system running (frontend + backend + AI service)
- **Coverage Target**: Critical happy paths and major error scenarios
- **Tools**: Playwright

## 3. Backend Unit Tests (NestJS)

### 3.1 Testing Setup

```typescript
// apps/api/jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.module.ts',
    '!**/main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 3.2 Service Layer Tests

**Example: AuthService**

```typescript
// apps/api/src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      const dto = { email: 'test@example.com', password: 'Pass123!', name: 'Test' };
      const hashedPassword = 'hashed';
      
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: '1',
        email: dto.email,
        name: dto.name,
        role: 'STUDENT',
      } as any);

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));

      const result = await service.register(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(usersService.create).toHaveBeenCalledWith({
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: 'STUDENT',
      });
      expect(result.email).toBe(dto.email);
    });

    it('should throw ConflictException if email exists', async () => {
      const dto = { email: 'test@example.com', password: 'Pass123!', name: 'Test' };
      
      usersService.findByEmail.mockResolvedValue({ id: '1' } as any);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'Pass123!' };
      const user = {
        id: '1',
        email: dto.email,
        password: 'hashedPassword',
        role: 'STUDENT',
      };

      usersService.findByEmail.mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jwtService.sign.mockReturnValue('token');

      const result = await service.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const dto = { email: 'test@example.com', password: 'wrongpass' };
      const user = { id: '1', password: 'hashedPassword' };

      usersService.findByEmail.mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

**Example: InterviewsService State Transitions**

```typescript
// apps/api/src/modules/interviews/interviews.service.spec.ts
describe('InterviewsService', () => {
  describe('startInterview', () => {
    it('should transition from DRAFT to IN_PROGRESS', async () => {
      const interview = {
        id: '1',
        status: InterviewStatus.DRAFT,
        userId: 'user-1',
      };

      repository.findOne.mockResolvedValue(interview);
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.startInterview('1', 'user-1');

      expect(result.status).toBe(InterviewStatus.IN_PROGRESS);
      expect(result.startedAt).toBeDefined();
    });

    it('should throw BadRequestException if already started', async () => {
      const interview = {
        id: '1',
        status: InterviewStatus.IN_PROGRESS,
        userId: 'user-1',
      };

      repository.findOne.mockResolvedValue(interview);

      await expect(service.startInterview('1', 'user-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('completeInterview', () => {
    it('should transition from IN_PROGRESS to COMPLETED', async () => {
      const interview = {
        id: '1',
        status: InterviewStatus.IN_PROGRESS,
        userId: 'user-1',
        startedAt: new Date('2024-01-15T10:00:00Z'),
      };

      repository.findOne.mockResolvedValue(interview);
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.completeInterview('1', 'user-1');

      expect(result.status).toBe(InterviewStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });
  });
});
```

### 3.3 Controller Tests

```typescript
// apps/api/src/modules/interviews/interviews.controller.spec.ts
describe('InterviewsController', () => {
  let controller: InterviewsController;
  let service: jest.Mocked<InterviewsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewsController],
      providers: [
        {
          provide: InterviewsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InterviewsController>(InterviewsController);
    service = module.get(InterviewsService);
  });

  describe('create', () => {
    it('should create an interview', async () => {
      const dto = {
        jobTitle: 'Software Engineer',
        jobDescription: 'Develop awesome software',
        difficulty: 'mid',
      };
      const user = { id: 'user-1' };
      const expectedResult = { id: '1', ...dto, userId: user.id };

      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(dto, { user });

      expect(service.create).toHaveBeenCalledWith(user.id, dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
```

## 4. Backend Integration Tests

### 4.1 Test Database Setup

```typescript
// apps/api/test/setup.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export async function createTestingModule(imports: any[], providers: any[]) {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.TEST_DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT) || 5433,
        username: 'test',
        password: 'test',
        database: 'ai_interview_test',
        entities: [__dirname + '/../src/**/*.entity.ts'],
        synchronize: true, // Auto-create schema for tests
        dropSchema: true,  // Clean slate for each test run
      }),
      ...imports,
    ],
    providers,
  }).compile();

  return module;
}
```

### 4.2 Authentication Flow Test

```typescript
// apps/api/test/auth.e2e-spec.ts
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestingModule } from './setup';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await createTestingModule([AuthModule, UsersModule], []);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Pass123!',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Pass123!',
        name: 'Test',
      };

      await request(app.getHttpServer()).post('/auth/register').send(userData);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'login@example.com',
        password: 'Pass123!',
        name: 'Login Test',
      });
    });

    it('should login and return tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Pass123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.headers['set-cookie']).toBeDefined();
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });
});
```

## 5. AI Service Tests (Python)

### 5.1 Testing Configuration

```python
# apps/ai-service/pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto

# Coverage configuration
addopts = 
    --cov=.
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
```

### 5.2 Unit Tests with Mocked LLM

```python
# apps/ai-service/tests/test_services.py
import pytest
from unittest.mock import AsyncMock, Mock
from services.llm_service import LLMService
from services.prompt_service import PromptService
from services.parser_service import ParserService
from fastapi import HTTPException

@pytest.fixture
def llm_service(mocker):
    settings = Mock(
        OPENAI_API_KEY="test-key",
        OPENAI_BASE_URL="https://api.test.com",
        MODEL_NAME="gpt-4",
        MAX_TOKENS=2000,
        TEMPERATURE=0.7
    )
    service = LLMService(settings)
    service.client = AsyncMock()
    return service

@pytest.mark.asyncio
async def test_generate_completion_success(llm_service):
    """Test successful LLM completion generation."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [{"message": {"content": '{"questions": []}'}}],
        "usage": {"total_tokens": 100}
    }
    llm_service.client.post = AsyncMock(return_value=mock_response)
    
    result = await llm_service.generate_completion("Test prompt")
    
    assert result == '{"questions": []}'
    llm_service.client.post.assert_called_once()

@pytest.mark.asyncio
async def test_generate_completion_timeout(llm_service):
    """Test LLM service timeout handling."""
    import httpx
    llm_service.client.post = AsyncMock(side_effect=httpx.TimeoutException("Timeout"))
    
    with pytest.raises(httpx.TimeoutException):
        await llm_service.generate_completion("Test prompt")

def test_parse_questions_response_valid():
    """Test parsing valid questions response."""
    parser = ParserService()
    llm_response = '''
    {
      "questions": [
        {
          "text": "What is polymorphism?",
          "category": "technical",
          "difficulty": "mid",
          "expected_key_points": ["inheritance", "method overriding"]
        }
      ]
    }
    '''
    
    questions = parser.parse_questions_response(llm_response)
    
    assert len(questions) == 1
    assert questions[0].text == "What is polymorphism?"
    assert questions[0].category == "technical"

def test_parse_questions_response_invalid():
    """Test parsing invalid questions response."""
    parser = ParserService()
    llm_response = '{"invalid": "data"}'
    
    with pytest.raises(ValueError, match="Invalid LLM response format"):
        parser.parse_questions_response(llm_response)
```

### 5.3 Integration Tests with Test Client

```python
# apps/ai-service/tests/test_routers.py
import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import AsyncMock, patch

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_llm_service():
    with patch('routers.questions_router.LLMService') as mock:
        instance = mock.return_value
        instance.generate_completion = AsyncMock(return_value='''
        {
          "questions": [
            {
              "text": "Explain REST API",
              "category": "technical",
              "difficulty": "mid",
              "expected_key_points": ["HTTP methods", "stateless"]
            }
          ]
        }
        ''')
        yield instance

def test_generate_questions_success(client, mock_llm_service):
    """Test successful question generation."""
    response = client.post("/generate-questions", json={
        "job_title": "Backend Developer",
        "job_description": "Build scalable APIs",
        "resume_content": "5 years experience with Node.js",
        "difficulty": "mid",
        "num_questions": 5
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "questions" in data
    assert len(data["questions"]) > 0

def test_generate_questions_validation_error(client):
    """Test validation error for invalid input."""
    response = client.post("/generate-questions", json={
        "job_title": "",  # Too short
        "job_description": "Short",  # Too short
        "resume_content": "Test",
        "difficulty": "invalid",  # Invalid enum
        "num_questions": 100  # Too many
    })
    
    assert response.status_code == 422  # Unprocessable Entity
```

## 6. Frontend Unit Tests

### 6.1 Component Tests

```typescript
// apps/web/components/forms/create-interview-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateInterviewForm } from './create-interview-form';

describe('CreateInterviewForm', () => {
  it('should render all form fields', () => {
    render(<CreateInterviewForm />);
    
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<CreateInterviewForm />);
    
    const submitButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/job title.*required/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data', async () => {
    const onSubmit = jest.fn();
    render(<CreateInterviewForm onSubmit={onSubmit} />);
    
    await userEvent.type(
      screen.getByLabelText(/job title/i),
      'Software Engineer'
    );
    await userEvent.type(
      screen.getByLabelText(/job description/i),
      'Build amazing products with modern tech stack'
    );
    await userEvent.selectOptions(
      screen.getByLabelText(/difficulty/i),
      'mid'
    );
    
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        jobTitle: 'Software Engineer',
        jobDescription: expect.any(String),
        difficulty: 'mid',
      });
    });
  });
});
```

### 6.2 Hook Tests

```typescript
// apps/web/hooks/use-interview-session.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInterviewSession } from './use-interview-session';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useInterviewSession', () => {
  it('should load questions on mount', async () => {
    const { result } = renderHook(
      () => useInterviewSession('interview-1'),
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(result.current.questions).toBeDefined();
      expect(result.current.questions.length).toBeGreaterThan(0);
    });
  });

  it('should submit answer and move to next question', async () => {
    const { result } = renderHook(
      () => useInterviewSession('interview-1'),
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => expect(result.current.questions).toBeDefined());
    
    act(() => {
      result.current.submitAnswer('This is my answer');
    });
    
    await waitFor(() => {
      expect(result.current.currentQuestionIndex).toBe(1);
    });
  });
});
```

## 7. End-to-End Tests (Playwright)

### 7.1 Configuration

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 7.2 Critical Path Tests

```typescript
// apps/web/e2e/interview-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Interview Flow', () => {
  test('should complete full interview journey', async ({ page }) => {
    // Register
    await page.goto('/register');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Pass123!');
    await page.fill('[name="name"]', 'Test User');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    
    // Create interview
    await page.click('text=Create Interview');
    await page.fill('[name="jobTitle"]', 'Frontend Developer');
    await page.fill('[name="jobDescription"]', 'Build modern web applications using React');
    await page.selectOption('[name="difficulty"]', 'mid');
    await page.click('button:has-text("Create")');
    
    await expect(page).toHaveURL(/\/interviews\/.+/);
    
    // Start interview
    await page.click('text=Start Interview');
    
    // Answer questions
    for (let i = 0; i < 3; i++) {
      await page.fill('textarea[name="answer"]', `This is my answer to question ${i + 1}`);
      await page.click('button:has-text("Submit Answer")');
      await page.waitForTimeout(1000); // Wait for evaluation
    }
    
    // Complete interview
    await page.click('button:has-text("Finish Interview")');
    
    // View results
    await expect(page.locator('text=Interview Complete')).toBeVisible();
    await expect(page.locator('text=Overall Score')).toBeVisible();
    
    // Check for report sections
    await expect(page.locator('text=Performance Summary')).toBeVisible();
    await expect(page.locator('text=Strengths')).toBeVisible();
    await expect(page.locator('text=Areas for Improvement')).toBeVisible();
  });
});
```

## 8. Test Data Management

### 8.1 Factory Pattern (Backend)

```typescript
// apps/api/test/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import { User } from '../../src/modules/users/entities/user.entity';

export class UserFactory {
  static create(overrides?: Partial<User>): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: '$2b$12$hashedpassword',
      role: 'STUDENT',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as User;
  }
}
```

### 8.2 Fixtures (Python)

```python
# apps/ai-service/tests/fixtures/llm_responses.py
VALID_QUESTIONS_RESPONSE = '''
{
  "questions": [
    {
      "text": "Explain the concept of closures in JavaScript",
      "category": "technical",
      "difficulty": "mid",
      "expected_key_points": ["lexical scope", "function returns function", "private variables"]
    }
  ]
}
'''

VALID_EVALUATION_RESPONSE = '''
{
  "score": 85,
  "feedback": "Strong understanding demonstrated",
  "strengths": ["Clear explanation", "Good examples"],
  "weaknesses": ["Could elaborate more on edge cases"],
  "improvement_suggestions": ["Practice explaining with real-world scenarios"]
}
'''
```

## 9. CI/CD Pipeline Integration

### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: ai_interview_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:backend
      - run: npm run test:backend:e2e
      - name: Upload coverage
        uses: actions/upload-artifact@v3
        with:
          name: backend-coverage
          path: apps/api/coverage

  ai-service-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r apps/ai-service/requirements.txt
      - run: pytest apps/ai-service/tests
      - name: Upload coverage
        uses: actions/upload-artifact@v3
        with:
          name: ai-service-coverage
          path: apps/ai-service/htmlcov

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:frontend
      - name: Upload coverage
        uses: actions/upload-artifact@v3
        with:
          name: frontend-coverage
          path: apps/web/coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/web/playwright-report
```

## 10. Performance Testing

### 10.1 Load Test with k6

```javascript
// scripts/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },  // Ramp up to 20 users
    { duration: '3m', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.05'],    // Less than 5% failure rate
  },
};

export default function () {
  const loginRes = http.post('http://localhost:3001/api/auth/login', {
    email: 'test@example.com',
    password: 'Pass123!',
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });
  
  const token = loginRes.json('accessToken');
  
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };
  
  const interviewsRes = http.get('http://localhost:3001/api/interviews', params);
  
  check(interviewsRes, {
    'get interviews successful': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
}
```

Run with:
```bash
k6 run scripts/load-test.js
```

## 11. Conclusion

The testing strategy provides comprehensive coverage across all system layers, from isolated unit tests to full end-to-end user journeys. By following the testing pyramid, the system achieves high confidence in correctness while maintaining fast feedback loops for developers. The combination of Jest, pytest, and Playwright provides robust tooling for all testing needs, while factory patterns and fixtures enable maintainable test data management. Integration with CI/CD ensures that all tests run automatically on every pull request, preventing regressions from reaching production.
