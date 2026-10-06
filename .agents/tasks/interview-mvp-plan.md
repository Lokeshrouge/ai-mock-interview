# Interview MVP Implementation Plan

**Generated:** 2025-01-XX  
**Task:** Complete Interview Engine MVP - Backend Services, AI Integration, Frontend Pages  
**Status:** Ready for Implementation

---

## Executive Summary

This plan implements the complete interview MVP flow: setup → question generation → answer submission → evaluation → final report. The codebase already has:
- Complete entity models (Interview, InterviewQuestion, InterviewAnswer, Evaluation, Recommendation)
- Interview controller with all endpoints defined
- InterviewsModule declaring all 5 service providers
- AI service with question generation and evaluation endpoints (stub implementations)
- Job roles module with seeding capability
- Complete authentication and authorization

**What's Missing:** The 5 core service implementations and all frontend pages/components.

---

## Current State Assessment

### ✅ Backend Infrastructure (Complete)
- **Entities:** All 9 entities with proper relationships and TypeORM decorators
  - Interview: status enum (CREATED, IN_PROGRESS, PAUSED, COMPLETED, EVALUATED), scores, timestamps
  - InterviewQuestion: linked to interview, has questionNumber, questionText, questionCategory, expectedPoints[]
  - InterviewAnswer: one-to-one with question, has timeTakenSeconds
  - Evaluation: one-to-one with answer, has score (0-100), feedback, strengths[], weaknesses[], breakdown scores (0-1 range)
  - Recommendation: linked to interview, has strengths/weaknesses (jsonb), topicsToImprove[], overallFeedback
  - JobRole: title, category, description, requiredSkills[], topics (jsonb)
  - Resume: extractedText, processingStatus, analysisStatus
  - StudentProfile: snake_case columns (user_id, first_name, technical_skills[], programming_languages[])
- **DTOs:** CreateInterviewDto (resumeId?, jobRoleId, interviewType, difficulty, questionCount=10), SubmitAnswerDto (questionId, answerText 50-5000 chars, timeTakenSeconds?)
- **Controller:** InterviewsController with 8 endpoints fully defined
- **Module:** InterviewsModule imports HttpModule, declares all 5 services, imports all entities including StudentProfile from profiles/entities/profile.entity
- **Auth:** JwtAuthGuard active, CurrentUser decorator extracts user.userId
- **Job Roles:** JobRolesService.seedDefaultRoles() creates 10 default roles if none exist

### ❌ Missing Backend Services (5 files)
- backend/src/interviews/interviews.service.ts - NOT FOUND
- backend/src/interviews/questions.service.ts - NOT FOUND
- backend/src/interviews/answers.service.ts - NOT FOUND
- backend/src/interviews/evaluations.service.ts - NOT FOUND
- backend/src/interviews/recommendations.service.ts - NOT FOUND

### ⚠️ AI Service (Partial)
- **Existing Endpoints:**
  - POST /questions/generate - Returns stub questions (3 base + expand to requested count)
  - POST /evaluation/evaluate - Returns stub evaluation based on word count heuristic
- **Missing Endpoint:**
  - POST /recommendations/generate - NOT IMPLEMENTED (need to add router and schemas)
- **Schemas:** GenerateQuestionsRequest/Response, EvaluateAnswerRequest/Response exist
- **Missing Schemas:** RecommendationsRequest, RecommendationsResponse

### ❌ Frontend Pages (All Missing)
- frontend/src/app/interview/setup/page.tsx - NOT FOUND
- frontend/src/app/interview/[id]/page.tsx - NOT FOUND
- frontend/src/app/interview/[id]/report/page.tsx - NOT FOUND
- frontend/src/app/history/page.tsx - NOT FOUND

### ❌ Frontend Components (All Missing)
- frontend/src/components/interview/ directory - NOT FOUND
- Need: QuestionCard, AnswerInput, EvaluationDisplay, ProgressBar, ScoreCard, RecommendationCard

### ⚠️ Configuration Issues
- **Missing Package:** @nestjs/axios not in backend/package.json (HttpModule imported in InterviewsModule but axios wrapper not installed)
- **Missing Package:** lucide-react not in frontend/package.json (used by dashboard but not declared)
- **ENV:** AI_SERVICE_URL correctly defined in .env.example as http://localhost:8000
- **Database:** synchronize: true in DatabaseModule for dev environment ✓

### 🔴 Critical Entity Issue: StudentProfile Column Naming
The StudentProfile entity uses **snake_case** column names (user_id, first_name, technical_skills, programming_languages) but TypeORM entities typically use camelCase in code. The entity explicitly defines `@Column({ type: 'uuid' }) user_id: string` - this means:
- Access in code via `profile.user_id` (not profile.userId)
- QuestionsService must use `profile.technical_skills` and `profile.programming_languages`
- This is the ONLY entity in the codebase with this pattern (all others use camelCase properties with snake_case @Column names)

---

## Type Mappings: AI Service ↔ Backend

### Question Generation Flow
```
QuestionsService Input → AI Service:
{
  job_role: jobRole.title,                    // JobRole.title
  interview_type: interview.interviewType.toLowerCase(),  // 'hr' | 'technical' | 'project'
  difficulty: interview.difficulty.toLowerCase(),         // 'easy' | 'medium' | 'hard'
  question_count: interview.totalQuestions,              // number
  resume_text: resume?.extractedText,                    // string | undefined
  skills: [...profile.technical_skills, ...profile.programming_languages]  // string[]
}

AI Response → InterviewQuestion Entity:
QuestionItem.question → questionText
QuestionItem.topic → questionCategory
QuestionItem.expected_key_points → expectedPoints
QuestionItem.id → IGNORE (use auto-generated UUID)
Set questionNumber = 1..N (loop index + 1)
```

### Answer Evaluation Flow
```
EvaluationsService Input → AI Service:
{
  question: question.questionText,
  question_type: interview.interviewType.toLowerCase(),
  difficulty: interview.difficulty.toLowerCase(),
  student_answer: answer.answerText,
  expected_key_points: question.expectedPoints
}

AI Response → Evaluation Entity:
overall_score → score (0-100, store as decimal)
detailed_feedback → feedback
strengths → strengths
areas_for_improvement → weaknesses
breakdown.technical_accuracy / 100 → relevanceScore (0-1)
breakdown.relevance / 100 → accuracyScore (0-1)
breakdown.completeness / 100 → completenessScore (0-1)
breakdown.clarity / 100 → clarityScore (0-1)
```

### Recommendations Flow
```
RecommendationsService Input → AI Service:
{
  evaluations: [
    {
      question: question.questionText,
      answer: answer.answerText,
      score: evaluation.score,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      category: question.questionCategory
    }
  ]
}

AI Response → Recommendation Entity:
overall_strengths → strengths (store as jsonb)
overall_weaknesses → weaknesses (store as jsonb)
topics_to_improve → topicsToImprove (text[])
overall_feedback → overallFeedback
recommendedResources → null (not in AI response)
```

---

## Implementation Plan

### FEATURE 1: Backend Core Services (5 files)

**Description:** Implement the 5 missing service files that power the interview engine. These services orchestrate the interview lifecycle: creation, question generation, answer submission, evaluation, completion, and reporting.

**Steps:**

1. **Create InterviewsService** (`backend/src/interviews/interviews.service.ts`)
   - Inject: Repository<Interview>, Repository<JobRole>, Repository<Resume>, Repository<StudentProfile>, QuestionsService, RecommendationsService
   - `create(userId, dto)`:
     a. Validate jobRoleId exists via jobRoleRepository.findOne (throw NotFoundException if not found)
     b. If dto.resumeId provided: validate resume exists and belongs to userId (throw ForbiddenException if userId mismatch)
     c. Create Interview entity: userId, resumeId, jobRoleId, interviewType, difficulty, status=CREATED, totalQuestions=dto.questionCount || 10, answeredQuestions=0
     d. Save and return interview
   - `startInterview(userId, id)`:
     a. Load interview with relations: ['jobRole', 'resume', 'user.profile']
     b. Ownership check: if interview.userId !== userId throw ForbiddenException
     c. Status check: if status !== CREATED throw BadRequestException('Interview already started')
     d. Update: status=IN_PROGRESS, startedAt=new Date()
     e. Load profile: await profileRepository.findOne({ where: { user_id: userId } })
     f. Call questionsService.generateQuestions(interview, interview.resume, profile, interview.jobRole)
     g. On success: save interview, return { interview, firstQuestion: questions[0] }
     h. On error: keep status=CREATED, throw descriptive error
   - `completeInterview(userId, id)`:
     a. Load interview with relations: ['answers', 'answers.evaluation']
     b. Ownership check
     c. Status check: if status !== IN_PROGRESS throw BadRequestException
     d. Calculate overallScore: average of all evaluation.score values
     e. Update: status=COMPLETED, completedAt=new Date(), overallScore
     f. Save interview
     g. Call recommendationsService.generateRecommendations(interview)
     h. Return interview with recommendations
   - `findOne(userId, id)`: Load with ['jobRole', 'questions', 'questions.answer', 'questions.answer.evaluation'], ownership check, return
   - `getInterviewQuestions(userId, id)`: Load with ['questions', 'questions.answer'], ownership check, map to { ...question, isAnswered: !!question.answer }
   - `getInterviewReport(userId, id)`: Load with ['jobRole', 'questions', 'questions.answer', 'questions.answer.evaluation', 'recommendations'], ownership check, verify status=COMPLETED, return full structure
   - `findAll(userId, page, limit, status?)`: Paginated query with optional status filter, order by createdAt DESC, include jobRole relation
   - Files: backend/src/interviews/interviews.service.ts

2. **Create QuestionsService** (`backend/src/interviews/questions.service.ts`)
   - Inject: Repository<InterviewQuestion>, HttpService (from @nestjs/axios), ConfigService
   - `generateQuestions(interview, resume, profile, jobRole)`:
     a. Build payload: { job_role: jobRole.title, interview_type: interview.interviewType.toLowerCase(), difficulty: interview.difficulty.toLowerCase(), question_count: interview.totalQuestions, resume_text: resume?.extractedText || null, skills: [...(profile?.technical_skills || []), ...(profile?.programming_languages || [])] }
     b. POST to `${aiServiceUrl}/questions/generate` using httpService.post().pipe(map(res => res.data))
     c. Map response.questions to InterviewQuestion entities: questionNumber = index + 1, questionText = item.question, questionCategory = item.topic, expectedPoints = item.expected_key_points, interviewId = interview.id
     d. Bulk save: questionRepository.save(questions)
     e. Return saved questions array
     f. Error handling: wrap in try-catch, on failure throw BadRequestException('AI question generation failed: ' + error.message)
   - Files: backend/src/interviews/questions.service.ts

3. **Create AnswersService** (`backend/src/interviews/answers.service.ts`)
   - Inject: Repository<InterviewAnswer>, Repository<Interview>, Repository<InterviewQuestion>, EvaluationsService
   - `submitAnswer(userId, interviewId, dto)`:
     a. Load interview with ownership check
     b. Status check: if status !== IN_PROGRESS throw BadRequestException('Interview not active')
     c. Load question: questionRepository.findOne({ where: { id: dto.questionId, interviewId } }), throw NotFoundException if not found
     d. Check for duplicate: existingAnswer = await answerRepository.findOne({ where: { questionId: dto.questionId } }), throw ConflictException if exists
     e. Create and save InterviewAnswer: { interviewId, questionId: dto.questionId, answerText: dto.answerText, timeTakenSeconds: dto.timeTakenSeconds }
     f. Call evaluationsService.evaluateAnswer(answer, question, interview)
     g. Increment interview.answeredQuestions, save interview
     h. Find next question: questionRepository.createQueryBuilder('q').leftJoinAndSelect('q.answer', 'a').where('q.interviewId = :interviewId', { interviewId }).andWhere('a.id IS NULL').orderBy('q.questionNumber', 'ASC').getOne()
     i. Return: { answer, evaluation, nextQuestion: nextQuestion || null, isCompleted: interview.answeredQuestions >= interview.totalQuestions }
   - Files: backend/src/interviews/answers.service.ts

4. **Create EvaluationsService** (`backend/src/interviews/evaluations.service.ts`)
   - Inject: Repository<Evaluation>, HttpService, ConfigService
   - `evaluateAnswer(answer, question, interview)`:
     a. Build payload: { question: question.questionText, question_type: interview.interviewType.toLowerCase(), difficulty: interview.difficulty.toLowerCase(), student_answer: answer.answerText, expected_key_points: question.expectedPoints || [] }
     b. POST to `${aiServiceUrl}/evaluation/evaluate` with 3 retries (use rxjs retry operator)
     c. Map response: score = overall_score, feedback = detailed_feedback, strengths = strengths, weaknesses = areas_for_improvement, relevanceScore = breakdown.relevance / 100, accuracyScore = breakdown.technical_accuracy / 100, completenessScore = breakdown.completeness / 100, clarityScore = breakdown.clarity / 100
     d. Create and save Evaluation: { answerId: answer.id, score, feedback, strengths, weaknesses, relevanceScore, accuracyScore, completenessScore, clarityScore }
     e. Return saved evaluation
     f. Fallback on all retries failed: save { answerId: answer.id, score: 50, feedback: 'Evaluation temporarily unavailable. Please review manually.', strengths: [], weaknesses: [], relevanceScore: 0.5, accuracyScore: 0.5, completenessScore: 0.5, clarityScore: 0.5 }
   - Files: backend/src/interviews/evaluations.service.ts

5. **Create RecommendationsService** (`backend/src/interviews/recommendations.service.ts`)
   - Inject: Repository<Recommendation>, Repository<InterviewAnswer>, HttpService, ConfigService
   - `generateRecommendations(interview)`:
     a. Load all answers with evaluations and questions: answerRepository.find({ where: { interviewId: interview.id }, relations: ['evaluation', 'question'] })
     b. Build payload: { evaluations: answers.map(a => ({ question: a.question.questionText, answer: a.answerText, score: a.evaluation.score, strengths: a.evaluation.strengths, weaknesses: a.evaluation.weaknesses, category: a.question.questionCategory })) }
     c. POST to `${aiServiceUrl}/recommendations/generate`
     d. On success: map response to Recommendation entity: { interviewId: interview.id, strengths: response.overall_strengths, weaknesses: response.overall_weaknesses, topicsToImprove: response.topics_to_improve, overallFeedback: response.overall_feedback }
     e. On failure: generate basic recommendations from aggregated data: collect unique strengths/weaknesses, identify categories with avg score < 60 as topicsToImprove, generate simple overallFeedback string
     f. Save and return recommendation
   - Files: backend/src/interviews/recommendations.service.ts

**Verification:**
```bash
cd backend
npm run build
npm run test:watch -- interviews
```
Expected: All services compile, no TypeScript errors, unit tests pass (if added).

**Acceptance Criteria:**
- All 5 service files created with complete implementations
- Services follow NestJS patterns (constructor injection, repository pattern, async/await)
- Error handling covers all failure modes (not found, forbidden, AI service failures)
- Type mappings match the AI service schemas exactly
- StudentProfile accessed via snake_case properties (profile.technical_skills, profile.programming_languages)

---

### FEATURE 2: AI Service Recommendations Endpoint

**Description:** Add the missing recommendations endpoint to the AI service to complete the evaluation pipeline.

**Steps:**

1. **Add Recommendation Schemas** (`ai-service/app/models/schemas.py`)
   - Add `EvaluationSummary(BaseModel)`: question (str), answer (str), score (int), strengths (List[str]), weaknesses (List[str]), category (str)
   - Add `RecommendationsRequest(BaseModel)`: evaluations (List[EvaluationSummary])
   - Add `RecommendationsResponse(BaseModel)`: overall_strengths (List[str]), overall_weaknesses (List[str]), topics_to_improve (List[str]), overall_feedback (str)
   - Files: ai-service/app/models/schemas.py

2. **Create Recommendations Router** (`ai-service/app/routers/recommendations.py`)
   - Import FastAPI APIRouter, schemas
   - router = APIRouter(prefix="/recommendations", tags=["Recommendations"])
   - POST /generate endpoint:
     a. Accept RecommendationsRequest
     b. Aggregate data: collect all unique strengths (flatten and dedupe), all unique weaknesses
     c. Identify low-performing categories: group evaluations by category, compute avg score per category, filter categories with avg < 60
     d. Generate overall_feedback: "Based on {len(evaluations)} questions, your average performance was {avg_score}. Focus on improving {low_categories}."
     e. Return RecommendationsResponse
   - Files: ai-service/app/routers/recommendations.py

3. **Register Router in Main App** (`ai-service/app/main.py`)
   - Import recommendations router
   - Add app.include_router(recommendations.router)
   - Files: ai-service/app/main.py

**Verification:**
```bash
cd ai-service
uvicorn app.main:app --reload
curl -X POST http://localhost:8000/recommendations/generate -H "Content-Type: application/json" -d '{"evaluations":[{"question":"Test","answer":"Test","score":75,"strengths":["Good"],"weaknesses":["Bad"],"category":"Technical"}]}'
```
Expected: 200 OK with RecommendationsResponse JSON structure.

**Acceptance Criteria:**
- POST /recommendations/generate endpoint responds with correct schema
- Aggregation logic produces sensible recommendations
- topics_to_improve identifies categories with avg score < 60
- overall_feedback is a coherent summary string

---

### FEATURE 3: Backend Module Integration & Seeding

**Description:** Wire up the InterviewsModule and JobRolesModule in AppModule, ensure job roles are seeded on startup.

**Steps:**

1. **Install Missing Package** (`backend/package.json`)
   - Add "@nestjs/axios": "^3.0.1" to dependencies
   - Run: `npm install @nestjs/axios`
   - Files: backend/package.json

2. **Update AppModule** (`backend/src/app.module.ts`)
   - Import JobRolesModule and InterviewsModule
   - Add to imports array: [JobRolesModule, InterviewsModule]
   - Implement OnModuleInit lifecycle hook:
     ```typescript
     export class AppModule implements OnModuleInit {
       constructor(private jobRolesService: JobRolesService) {}
       async onModuleInit() {
         await this.jobRolesService.seedDefaultRoles();
       }
     }
     ```
   - Inject JobRolesService in constructor
   - Files: backend/src/app.module.ts

**Verification:**
```bash
cd backend
npm install
npm run start:dev
```
Expected: Server starts, logs "Nest application successfully started", GET /job-roles returns 10 seeded roles.

**Acceptance Criteria:**
- @nestjs/axios installed and HttpModule works
- JobRolesModule and InterviewsModule imported in AppModule
- seedDefaultRoles() runs on app startup
- GET /api/v1/job-roles returns populated list (no auth required - marked @Public)

---

### FEATURE 4: Frontend Interview Setup Page

**Description:** Create the interview configuration page where students select job role, type, difficulty, resume, and question count.

**Steps:**

1. **Install Missing Package** (`frontend/package.json`)
   - Add "lucide-react": "^0.309.0" to dependencies
   - Run: `npm install lucide-react`
   - Files: frontend/package.json

2. **Create Interview Setup Page** (`frontend/src/app/interview/setup/page.tsx`)
   - Fetch job roles: GET /job-roles (useEffect)
   - Fetch resumes: GET /resumes?active=true (useEffect)
   - Form fields: jobRoleId (select), interviewType (radio: HR/TECHNICAL/PROJECT), difficulty (radio: EASY/MEDIUM/HARD), resumeId (select from active resumes), questionCount (number input 5-15, default 10)
   - On submit:
     a. POST /interviews with CreateInterviewDto
     b. On success: immediately POST /interviews/:id/start
     c. Show loading spinner with text "Generating AI questions..."
     d. On start success: redirect to /interview/[id]
     e. On error: show error toast, keep form editable
   - Loading states: disable form during API calls
   - Validation: jobRoleId required, resumeId optional but recommended (show warning if none selected)
   - Use Navbar layout, Tailwind styling matching dashboard aesthetic
   - Files: frontend/src/app/interview/setup/page.tsx

**Verification:**
```bash
cd frontend
npm run dev
# Navigate to http://localhost:3000/interview/setup
# Select job role, type, difficulty, resume
# Click "Start Interview"
# Verify redirect to /interview/[id] with questions generated
```
Expected: Form submits, questions generate, redirect occurs, no console errors.

**Acceptance Criteria:**
- Page renders with all form fields
- Job roles and resumes load from API
- Form validation prevents submission with missing required fields
- Loading state shows during AI generation
- Success redirects to interview room
- Error messages display clearly

---

### FEATURE 5: Frontend Interview Room Page

**Description:** The core interview experience - display question, capture answer, submit, show evaluation, navigate to next question.

**Steps:**

1. **Create Interview Room Page** (`frontend/src/app/interview/[id]/page.tsx`)
   - Extract id from useParams()
   - State: currentQuestionIndex, questions[], answers[], showEvaluation (boolean), evaluation (object), loading (boolean)
   - On mount: GET /interviews/:id/questions → set questions[]
   - Display: QuestionCard (question number, category, text), ProgressBar (answeredQuestions / totalQuestions)
   - AnswerInput: textarea with character count (50-5000), submit button
   - On submit answer:
     a. POST /interviews/:id/answers with { questionId, answerText, timeTakenSeconds }
     b. Response includes { answer, evaluation, nextQuestion, isCompleted }
     c. Set showEvaluation=true, evaluation=response.evaluation
     d. Store answer in answers[]
   - When showEvaluation=true: display EvaluationDisplay (score, feedback, strengths, weaknesses)
   - "Next Question" button:
     a. If isCompleted: POST /interviews/:id/complete, redirect to /interview/[id]/report
     b. Else: set currentQuestionIndex++, showEvaluation=false
   - Loading states: disable textarea during submission, show spinner
   - Use Navbar layout
   - Files: frontend/src/app/interview/[id]/page.tsx

2. **Create QuestionCard Component** (`frontend/src/components/interview/QuestionCard.tsx`)
   - Props: questionNumber, category, questionText
   - Display: badge with category, question number heading, question text (large, readable font)
   - Styling: card with border, padding, rounded corners
   - Files: frontend/src/components/interview/QuestionCard.tsx

3. **Create AnswerInput Component** (`frontend/src/components/interview/AnswerInput.tsx`)
   - Props: value, onChange, onSubmit, loading, disabled
   - Textarea with character counter (min 50, max 5000)
   - Submit button (disabled if < 50 or > 5000 chars or loading)
   - Show validation errors inline
   - Files: frontend/src/components/interview/AnswerInput.tsx

4. **Create EvaluationDisplay Component** (`frontend/src/components/interview/EvaluationDisplay.tsx`)
   - Props: score, feedback, strengths[], weaknesses[]
   - ScoreCard component shows score with color coding (green ≥70, yellow ≥50, red <50)
   - Strengths section: list with checkmark icons
   - Weaknesses section: list with alert icons
   - Feedback text: expandable or scrollable if long
   - Files: frontend/src/components/interview/EvaluationDisplay.tsx

5. **Create ProgressBar Component** (`frontend/src/components/interview/ProgressBar.tsx`)
   - Props: current, total
   - Display: filled bar showing current/total, percentage text
   - Color: indigo gradient
   - Files: frontend/src/components/interview/ProgressBar.tsx

6. **Create ScoreCard Component** (`frontend/src/components/interview/ScoreCard.tsx`)
   - Props: score (0-100)
   - Display: large centered score with color-coded background
   - Color logic: score >= 70 ? 'bg-green-100 text-green-800' : score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
   - Files: frontend/src/components/interview/ScoreCard.tsx

**Verification:**
```bash
cd frontend
npm run dev
# Complete interview setup to reach interview room
# Answer question (type 50+ chars), submit
# Verify evaluation displays
# Click "Next Question"
# Repeat until interview completes
# Verify redirect to report page
```
Expected: Full interview flow works, evaluations display, progress tracks, completion redirects.

**Acceptance Criteria:**
- Interview room displays current question
- Answer input enforces character limits
- Submission shows loading state
- Evaluation displays after submission
- Progress bar updates after each answer
- "Next Question" advances to next unanswered question
- Completion triggers redirect to report

---

### FEATURE 6: Frontend Interview Report Page

**Description:** Display the complete interview report with overall score, per-question breakdown, and recommendations.

**Steps:**

1. **Create Interview Report Page** (`frontend/src/app/interview/[id]/report/page.tsx`)
   - Extract id from useParams()
   - On mount: GET /interviews/:id/report → load full report
   - Display sections:
     a. Overall score (large, centered, color-coded)
     b. Interview metadata (job role, type, difficulty, date, duration)
     c. Question-by-question breakdown: for each question, show questionText, answerText (truncated with "expand"), evaluation score/feedback/strengths/weaknesses
     d. Recommendations section: RecommendationCard (strengths, weaknesses, topics to improve, overall feedback)
   - Action buttons: "Start New Interview" → /interview/setup, "Interview History" → /history
   - Loading state while fetching report
   - Use Navbar layout
   - Files: frontend/src/app/interview/[id]/report/page.tsx

2. **Create RecommendationCard Component** (`frontend/src/components/interview/RecommendationCard.tsx`)
   - Props: strengths (array), weaknesses (array), topicsToImprove (array), overallFeedback (string)
   - Display: 4 sections in grid or stacked layout
   - Strengths: list with checkmark icons, green theme
   - Weaknesses: list with alert icons, amber theme
   - Topics to Improve: chips/badges with indigo theme
   - Overall Feedback: text block with border
   - Files: frontend/src/components/interview/RecommendationCard.tsx

**Verification:**
```bash
cd frontend
npm run dev
# Complete an interview
# Verify redirect to report page
# Verify all sections display correctly
# Verify buttons navigate correctly
```
Expected: Report displays all interview data, buttons navigate, no console errors.

**Acceptance Criteria:**
- Report page loads interview data
- Overall score displayed prominently with color coding
- Each question/answer/evaluation shown in breakdown
- Recommendations section displays all 4 data types
- Action buttons navigate correctly
- Loading state shown while fetching

---

### FEATURE 7: Frontend Interview History Page

**Description:** Paginated list of all interviews with filtering and navigation to reports.

**Steps:**

1. **Create Interview History Page** (`frontend/src/app/history/page.tsx`)
   - State: interviews[], page (default 1), limit (default 10), totalPages, statusFilter (default null)
   - On mount + statusFilter change: GET /interviews?page={page}&limit={limit}&status={statusFilter}
   - Display: table or card grid
   - Columns: date (createdAt formatted), job role title, interview type, difficulty, status badge, overall score (if COMPLETED)
   - Row click: if status=COMPLETED → /interview/[id]/report, else → /interview/[id]
   - Filter dropdown: ALL, CREATED, IN_PROGRESS, COMPLETED
   - Pagination controls: Previous/Next buttons, page indicator
   - Empty state: "No interviews yet. Start your first mock interview!"
   - Use Navbar layout
   - Files: frontend/src/app/history/page.tsx

**Verification:**
```bash
cd frontend
npm run dev
# Navigate to http://localhost:3000/history
# Verify interviews list displays
# Test filtering by status
# Test pagination
# Click on interview row, verify navigation
```
Expected: History page displays interviews, filtering and pagination work, clicks navigate correctly.

**Acceptance Criteria:**
- History page fetches and displays interviews
- Pagination controls navigate pages
- Status filter updates the list
- Clicking COMPLETED interview navigates to report
- Clicking IN_PROGRESS interview resumes interview room
- Empty state displays when no interviews exist

---

### FEATURE 8: Dashboard Navigation Update

**Description:** Update the dashboard "Configure Interview" button to navigate to the setup page.

**Steps:**

1. **Update Dashboard Page** (`frontend/src/app/dashboard/page.tsx`)
   - Find the "Configure Interview" button (currently disabled and showing "Stage 7")
   - Change to: `<Link href="/interview/setup" className="...">` (keep existing styling)
   - Change text from "Configure Interview (Stage 7)" to "Start Mock Interview"
   - Remove disabled state
   - Change condition from `disabled={!profileData?.hasActiveResume}` to render a different button when no resume: show warning icon + text "Upload resume first" + Link to /resumes
   - Files: frontend/src/app/dashboard/page.tsx

**Verification:**
```bash
cd frontend
npm run dev
# Navigate to dashboard
# Click "Start Mock Interview" button
# Verify navigation to /interview/setup
```
Expected: Button navigates to setup page, no console errors.

**Acceptance Criteria:**
- Button navigates to /interview/setup
- Button enabled when profile and resume complete
- Button shows warning when resume missing
- Styling matches existing dashboard aesthetic

---

## Verification Strategy

### Unit Tests (Optional but Recommended)
```bash
cd backend
npm run test:watch -- interviews
```
- InterviewsService: test create validation, ownership checks, status transitions
- QuestionsService: test AI payload construction, error handling
- AnswersService: test duplicate detection, next question logic
- EvaluationsService: test fallback on AI failure
- RecommendationsService: test aggregation logic

### Integration Tests
```bash
# Start all services
cd backend && npm run start:dev
cd ai-service && uvicorn app.main:app --reload
cd frontend && npm run dev

# Manual flow test:
1. Login as student
2. Complete profile
3. Upload resume
4. Navigate to /interview/setup
5. Select job role, type, difficulty, resume
6. Click "Start Interview"
7. Answer all questions (type 100+ words each)
8. Verify evaluations display after each answer
9. Complete interview
10. Verify report displays all data
11. Navigate to history
12. Verify interview appears in list
```

### API Tests (curl)
```bash
# Create interview
curl -X POST http://localhost:3001/api/v1/interviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobRoleId":"...","interviewType":"TECHNICAL","difficulty":"MEDIUM","questionCount":5}'

# Start interview
curl -X POST http://localhost:3001/api/v1/interviews/{id}/start \
  -H "Authorization: Bearer $TOKEN"

# Submit answer
curl -X POST http://localhost:3001/api/v1/interviews/{id}/answers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"questionId":"...","answerText":"..."}'

# Get report
curl http://localhost:3001/api/v1/interviews/{id}/report \
  -H "Authorization: Bearer $TOKEN"
```

---

## Dependencies & Package Installations

### Backend
```bash
cd backend
npm install @nestjs/axios
npm install  # Ensure all existing packages installed
```

### Frontend
```bash
cd frontend
npm install lucide-react
npm install  # Ensure all existing packages installed
```

### AI Service
No new dependencies required - all packages in requirements.txt already installed.

---

## Known Issues & Workarounds

### Issue 1: StudentProfile Entity Column Naming
**Problem:** StudentProfile uses snake_case properties (user_id, technical_skills) inconsistent with other entities.
**Impact:** QuestionsService must access via `profile.technical_skills` not `profile.technicalSkills`.
**Workaround:** Code explicitly uses snake_case when accessing StudentProfile properties. Document this in service comments.
**Long-term fix:** Migrate StudentProfile to camelCase properties with @Column name mapping (requires database migration).

### Issue 2: Recommendation Entity JSONB Storage
**Problem:** Recommendation.strengths and Recommendation.weaknesses are typed `any` with jsonb storage - flexible but untyped.
**Impact:** No type safety when storing/retrieving recommendation data.
**Workaround:** RecommendationsService explicitly structures the data as arrays before saving. Frontend handles as unknown type.
**Long-term fix:** Define proper TypeScript interfaces and store as structured JSON with validation.

### Issue 3: AI Service Stub Responses
**Problem:** AI service currently returns stub/mock responses (not real LLM calls).
**Impact:** Questions and evaluations are generic, not personalized.
**Workaround:** Current stubs sufficient for MVP testing. Replace with real LLM calls later.
**Long-term fix:** Implement OpenAI/Anthropic integration using existing config (AI_PROVIDER, MODEL_NAME in settings).

---

## Post-Implementation Tasks

1. **Testing:**
   - Write unit tests for all 5 services
   - Write integration tests for complete interview flow
   - Test error scenarios (AI service down, invalid data)
   - Test concurrent interviews (same user, multiple interviews)
   - Test IDOR protection (user A cannot access user B's interview)

2. **Security Audit:**
   - Verify ownership checks in all interview endpoints
   - Test JWT expiration and refresh flow during long interviews
   - Validate input sanitization (especially answerText - 5000 char limit)
   - Check for SQL injection in status filter query

3. **Performance:**
   - Add database indexes: interviews(userId, status, createdAt), interview_answers(interviewId), evaluations(answerId)
   - Test with 50+ question interview (current limit is 15)
   - Measure AI service response time, add timeout handling
   - Consider caching job roles (rarely change)

4. **Documentation:**
   - Update API documentation with interview endpoints
   - Document interview state machine diagram
   - Create video demo of complete interview flow
   - Write troubleshooting guide for common errors

5. **Future Enhancements:**
   - Real-time question generation (generate next question while student answers current)
   - Interview pause/resume functionality
   - Time limits per question
   - Code editor for technical questions
   - Voice recording for HR questions
   - Peer comparison analytics (percentile scoring)

---

## File Checklist

### Backend (5 new + 2 modified)
- [ ] backend/src/interviews/interviews.service.ts (NEW)
- [ ] backend/src/interviews/questions.service.ts (NEW)
- [ ] backend/src/interviews/answers.service.ts (NEW)
- [ ] backend/src/interviews/evaluations.service.ts (NEW)
- [ ] backend/src/interviews/recommendations.service.ts (NEW)
- [ ] backend/src/app.module.ts (MODIFY - add imports + seeding)
- [ ] backend/package.json (MODIFY - add @nestjs/axios)

### AI Service (3 new/modified)
- [ ] ai-service/app/models/schemas.py (MODIFY - add recommendation schemas)
- [ ] ai-service/app/routers/recommendations.py (NEW)
- [ ] ai-service/app/main.py (MODIFY - register recommendations router)

### Frontend (13 new + 1 modified)
- [ ] frontend/src/app/interview/setup/page.tsx (NEW)
- [ ] frontend/src/app/interview/[id]/page.tsx (NEW)
- [ ] frontend/src/app/interview/[id]/report/page.tsx (NEW)
- [ ] frontend/src/app/history/page.tsx (NEW)
- [ ] frontend/src/components/interview/QuestionCard.tsx (NEW)
- [ ] frontend/src/components/interview/AnswerInput.tsx (NEW)
- [ ] frontend/src/components/interview/EvaluationDisplay.tsx (NEW)
- [ ] frontend/src/components/interview/ProgressBar.tsx (NEW)
- [ ] frontend/src/components/interview/ScoreCard.tsx (NEW)
- [ ] frontend/src/components/interview/RecommendationCard.tsx (NEW)
- [ ] frontend/src/app/dashboard/page.tsx (MODIFY - update button)
- [ ] frontend/package.json (MODIFY - add lucide-react)

**Total:** 24 files (15 new, 9 modified)

---

## Success Criteria

The interview MVP is complete when:

1. ✅ Student can create interview from setup page
2. ✅ AI generates N questions based on job role, type, difficulty, resume, profile
3. ✅ Student can answer questions one by one
4. ✅ Each answer receives immediate AI evaluation with score, feedback, strengths, weaknesses
5. ✅ Interview tracks progress (X of N questions answered)
6. ✅ Completing all questions triggers final score calculation and recommendations
7. ✅ Report page displays full interview summary
8. ✅ History page shows all past interviews
9. ✅ All ownership checks prevent unauthorized access
10. ✅ Error handling gracefully handles AI service failures

---

## Timeline Estimate

**Assuming 1 developer, accelerated mode:**

- **FEATURE 1** (Backend Services): 6-8 hours
- **FEATURE 2** (AI Recommendations): 1-2 hours
- **FEATURE 3** (Module Integration): 0.5-1 hour
- **FEATURE 4** (Setup Page): 2-3 hours
- **FEATURE 5** (Interview Room + Components): 4-6 hours
- **FEATURE 6** (Report Page + Component): 2-3 hours
- **FEATURE 7** (History Page): 2-3 hours
- **FEATURE 8** (Dashboard Update): 0.5 hour
- **Testing & Bug Fixes**: 4-6 hours

**Total:** 22-33 hours → **3-4 working days**

---

## End of Plan

**Next Step:** Begin implementation following FEATURE 1 → FEATURE 8 order. Each feature is independently verifiable and builds on the previous one.
