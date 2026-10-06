# Testing Strategy

## Testing Pyramid

```
        /\
       /E2E\         (10%)
      /------\
     /Integration\   (30%)
    /------------\
   /  Unit Tests  \  (60%)
  /----------------\
```

## 1. Unit Tests

### Backend (Jest)
**Target**: 70% code coverage  
**Focus**: Services, utilities, helpers

```typescript
describe('InterviewService', () => {
  it('should create interview', async () => {
    const interview = await service.create(createDto);
    expect(interview.status).toBe('CREATED');
  });
  
  it('should throw error if resume not found', async () => {
    await expect(service.create(invalidDto))
      .rejects.toThrow(NotFoundException);
  });
});
```

**What to Test**:
- Business logic in services
- State machine transitions
- Validation logic
- Utility functions
- Error handling

### Frontend (Jest + React Testing Library)
**Target**: 60% code coverage  
**Focus**: Components, hooks, utilities

```typescript
describe('LoginForm', () => {
  it('should display validation errors', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText('Login'));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
  });
  
  it('should call onSubmit with form data', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    // Fill form and submit
    expect(onSubmit).toHaveBeenCalledWith({email, password});
  });
});
```

**What to Test**:
- Component rendering
- User interactions
- Form validation
- State management
- Error states

### AI Service (pytest)
**Target**: 60% code coverage  
**Focus**: Services, parsers, validators

```python
def test_resume_parsing():
    result = parse_resume(sample_pdf_content, "pdf")
    assert "personal" in result.parsed_data
    assert result.parsed_data["personal"]["name"]

def test_question_generation():
    questions = generate_questions(
        job_role="Software Developer",
        interview_type="TECHNICAL",
        difficulty="MEDIUM"
    )
    assert len(questions) == 7
    assert all(q["question_text"] for q in questions)
```

---

## 2. Integration Tests

### Backend API Tests (Supertest)
**Focus**: API endpoints, database operations

```typescript
describe('POST /interviews', () => {
  it('should create interview', async () => {
    const response = await request(app.getHttpServer())
      .post('/interviews')
      .set('Authorization', `Bearer ${token}`)
      .send(createInterviewDto)
      .expect(201);
    
    expect(response.body.data.status).toBe('CREATED');
  });
  
  it('should return 401 without auth', async () => {
    await request(app.getHttpServer())
      .post('/interviews')
      .send(createInterviewDto)
      .expect(401);
  });
});
```

**What to Test**:
- Complete API flows
- Authentication/authorization
- Database CRUD operations
- Error responses
- Validation

### AI Service Integration
**Focus**: LLM integration, external APIs

```python
@pytest.mark.integration
async def test_openai_question_generation():
    # Uses real OpenAI API (or mock)
    questions = await question_generator.generate(config)
    assert len(questions) > 0
    assert validate_questions(questions)
```

---

## 3. End-to-End Tests

### Playwright/Cypress
**Focus**: Critical user flows

```typescript
test('complete interview flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Start interview
  await page.goto('/interview/setup');
  await page.selectOption('select[name="jobRole"]', 'Software Developer');
  await page.click('button:has-text("Start Interview")');
  
  // Answer questions
  await page.fill('textarea[name="answer"]', 'My answer...');
  await page.click('button:has-text("Submit")');
  
  // Verify evaluation shown
  await expect(page.locator('.evaluation-score')).toBeVisible();
});
```

**Critical Flows to Test**:
1. Registration → Login → Dashboard
2. Resume Upload → Parsing → View
3. Interview Setup → Start → Answer → Complete → Report
4. Admin Login → User Management

---

## 4. Test Data Management

### Test Database
- Separate test database
- Reset before each test suite
- Seed with test data

### Test Fixtures
```typescript
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'STUDENT'
};

export const mockInterview = {
  id: 'test-interview-id',
  status: 'IN_PROGRESS',
  userId: mockUser.id
};
```

### Mocking External Services
```typescript
jest.mock('../ai-service/ai-service.service');

aiService.generateQuestions.mockResolvedValue([
  { question_text: 'Test question', category: 'Tech' }
]);
```

---

## 5. Testing Authentication

### JWT Testing
```typescript
describe('JWT Auth', () => {
  it('should reject expired token', async () => {
    const expiredToken = generateExpiredToken();
    await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });
});
```

### Role Testing
```typescript
describe('Admin endpoints', () => {
  it('should reject student access', async () => {
    await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);
  });
});
```

---

## 6. Testing File Uploads

```typescript
describe('Resume upload', () => {
  it('should accept PDF', async () => {
    const response = await request(app)
      .post('/resumes')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', 'test/fixtures/sample.pdf')
      .expect(201);
    
    expect(response.body.data.fileType).toBe('pdf');
  });
  
  it('should reject invalid file type', async () => {
    await request(app)
      .post('/resumes')
      .attach('file', 'test/fixtures/invalid.exe')
      .expect(400);
  });
});
```

---

## 7. Testing AI Service

### Mock AI Responses
```typescript
jest.mock('./llm/openai-provider');

openaiProvider.complete.mockResolvedValue({
  questions: [/* mock questions */]
});
```

### Test Prompt Quality
```python
def test_question_prompt_format():
    prompt = build_question_prompt(config)
    assert "job_role" in prompt
    assert "difficulty" in prompt
    assert len(prompt) > 100
```

---

## 8. Performance Testing

### Load Testing (Artillery/k6)
```yaml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - post:
          url: '/auth/login'
          json:
            email: 'test@example.com'
            password: 'password'
```

**Metrics**:
- Response time < 500ms (95th percentile)
- Error rate < 1%
- Throughput > 100 req/s

---

## 9. Security Testing

### Penetration Testing
- SQL injection attempts
- XSS attempts
- CSRF testing
- Authentication bypass attempts
- Rate limit testing

### Tools
- OWASP ZAP
- Burp Suite (manual testing)
- npm audit (dependency vulnerabilities)

---

## 10. Manual Testing

### Test Cases
1. **User Registration**
   - Valid registration
   - Duplicate email
   - Weak password
   
2. **Interview Flow**
   - Complete happy path
   - Browser refresh during interview
   - Network failure during submission
   - AI service failure
   
3. **File Upload**
   - Various PDF formats
   - Various DOCX formats
   - Corrupted files
   - Large files

### Device Testing
- Desktop (Chrome, Firefox, Safari, Edge)
- Mobile (iOS Safari, Android Chrome)
- Tablet

---

## 11. CI/CD Integration

### GitHub Actions
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run backend tests
        run: |
          cd backend
          npm test
      - name: Run frontend tests
        run: |
          cd frontend
          npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm run test:e2e"
    }
  }
}
```

---

## 12. Test Documentation

### Test Plan Document
- Scope
- Test cases
- Expected results
- Pass/fail criteria

### Test Reports
- Coverage reports
- Failed test details
- Performance metrics

---

## Test Execution Schedule

| Phase | Tests | When |
|-------|-------|------|
| Development | Unit tests | On every commit |
| PR | Unit + Integration | Before merge |
| Staging | All tests | Before deployment |
| Production | Smoke tests | After deployment |

---

## Coverage Goals

| Layer | Target |
|-------|--------|
| Backend Services | 80% |
| Backend Controllers | 70% |
| Frontend Components | 60% |
| AI Service | 60% |
| Overall | 70% |

---

## Testing Tools

### Backend
- Jest (unit/integration)
- Supertest (API testing)
- TypeORM (test database)

### Frontend
- Jest (unit)
- React Testing Library
- Playwright/Cypress (E2E)

### AI Service
- pytest (unit/integration)
- pytest-asyncio (async tests)
- pytest-mock (mocking)

### Performance
- Artillery
- k6
- Lighthouse (frontend)

### Security
- OWASP ZAP
- Snyk (dependencies)
- npm audit
