# Development Roadmap

**Document ID:** SPEC-021  
**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Approved

---

## 1. Introduction

This document outlines the 15-stage development roadmap for the AI-Powered Mock Interview System. The total estimated duration is **17 weeks**, divided into four major milestones. Each stage includes defined goals, key tasks, dependencies, and deliverables to ensure systematic progress and measurable outcomes.

The roadmap follows a risk-mitigated approach: foundational infrastructure first, backend API development, AI service integration, and finally frontend implementation. This sequencing allows early testing of critical integrations and reduces late-stage surprises.

---

## 2. Roadmap Overview

| Stage | Name | Duration | Milestone |
|-------|------|----------|-----------|
| 1 | Monorepo Setup & Infrastructure | 1 week | - |
| 2 | Database Schema & Migrations | 1 week | - |
| 3 | Authentication Module | 1 week | M1: Auth + DB |
| 4 | User Profile & Resume Upload | 1 week | - |
| 5 | Interview Session Management | 1 week | - |
| 6 | AI Service Scaffold | 1 week | - |
| 7 | Question Generation | 1.5 weeks | - |
| 8 | Answer Evaluation | 1.5 weeks | - |
| 9 | Session Summarisation | 1 week | M2: AI Service Live |
| 10 | Frontend Auth & Dashboard | 1 week | - |
| 11 | Interview Setup & Session UI | 1.5 weeks | - |
| 12 | Report Viewer & Progress Charts | 1 week | - |
| 13 | Admin Panel | 1 week | M3: Full MVP |
| 14 | Integration & E2E Testing | 1 week | - |
| 15 | Performance, Security & Documentation | 1 week | M4: Submission-Ready |
| **TOTAL** | | **17 weeks** | |

---

## 3. Milestone Definitions

### M1: Auth + DB (End of Stage 3)
- **Goal:** Users can register, login, and receive JWT tokens. Database schema deployed.
- **Verification:** Postman collection successfully authenticates, refresh token rotation works.
- **Blockers resolved:** TypeORM setup, JWT strategy, password hashing.

### M2: AI Service Live (End of Stage 9)
- **Goal:** AI service generates questions, evaluates answers, produces session summaries.
- **Verification:** cURL commands to AI service return valid responses within SLA.
- **Blockers resolved:** LLM integration, prompt engineering, error handling.

### M3: Full MVP (End of Stage 13)
- **Goal:** Complete user journey: signup → upload resume → start interview → view report.
- **Verification:** Manual test completes full flow in browser without errors.
- **Blockers resolved:** All CRUD endpoints, frontend pages, state management.

### M4: Submission-Ready (End of Stage 15)
- **Goal:** Code passes automated tests, deployment documented, performance acceptable.
- **Verification:** CI green, E2E tests pass, setup guide works on clean machine.
- **Blockers resolved:** Test coverage, security audit, documentation completeness.

---

## 4. Stage Details

### Stage 1: Monorepo Setup & Infrastructure (1 week)

**Goal:** Establish project structure, tooling, and local development environment.

**Key Tasks:**
- Initialize pnpm workspace with `apps/web`, `apps/api`, `apps/ai-service`, `packages/shared-types`.
- Configure TypeScript (strict mode), ESLint, Prettier across workspace.
- Create `docker-compose.yml` with PostgreSQL service for local development.
- Set up GitHub repository with branch protection (require PR, CI green).
- Create CI skeleton (GitHub Actions) that runs linters and placeholder tests.

**Dependencies:** None (starting point).

**Deliverable:** `pnpm install` and `docker-compose up` succeed. CI pipeline runs (even if tests are empty).

---

### Stage 2: Database Schema & Migrations (1 week)

**Goal:** Define and deploy complete PostgreSQL schema via TypeORM migrations.

**Key Tasks:**
- Create TypeORM entities for User, InterviewSession, Question, Answer, Resume tables.
- Define relationships (one-to-many, foreign keys) and indexes for query optimization.
- Write initial migration script and verify idempotency (run twice without errors).
- Add pgcrypto extension for encryption functions.
- Document schema diagram (ERD) in `docs/database-schema.md`.

**Dependencies:** Stage 1 (database running in Docker).

**Deliverable:** Migrations run successfully against local PostgreSQL. All tables visible in pgAdmin/TablePlus.

---

### Stage 3: Authentication Module (1 week)

**Goal:** Implement registration, login, JWT access/refresh tokens, and logout.

**Key Tasks:**
- Create NestJS `AuthModule` with `AuthService` and `AuthController`.
- Implement password hashing with bcrypt (10 salt rounds).
- Generate JWT access token (15min expiry) and refresh token (7 days, httpOnly cookie).
- Create Passport JWT strategy for route guards.
- Write unit tests for `AuthService` and integration tests for `/auth/register`, `/auth/login`, `/auth/refresh`.

**Dependencies:** Stage 2 (User table exists).

**Deliverable:** Postman collection successfully registers user, logs in, refreshes token, accesses protected endpoint.

**Milestone:** M1 achieved.

---

### Stage 4: User Profile & Resume Upload (1 week)

**Goal:** Users can update profiles and upload resumes with text extraction.

**Key Tasks:**
- Create `UserModule` with CRUD endpoints for profile (name, email, bio).
- Implement file upload with multer (accept PDF/DOCX, max 5MB).
- Integrate pdf-parse and mammoth for text extraction, store in Resume table.
- Handle file upload errors gracefully (invalid format, oversized file).
- Write integration tests for profile update and resume upload endpoints.

**Dependencies:** Stage 3 (authenticated users).

**Deliverable:** User can upload resume.pdf via Postman; extracted text stored in database.

---

### Stage 5: Interview Session Management (1 week)

**Goal:** CRUD operations for interview sessions with state machine enforcement.

**Key Tasks:**
- Create `InterviewModule` with `InterviewService` and `InterviewController`.
- Implement session creation (type: HR/Technical/Project, position, difficulty).
- Enforce state transitions: SETUP → IN_PROGRESS → COMPLETED → REVIEWED.
- Create endpoints: POST /sessions, GET /sessions/:id, PATCH /sessions/:id/state.
- Write unit tests for state machine logic and integration tests for endpoints.

**Dependencies:** Stage 4 (User and Resume data available).

**Deliverable:** User can create session, transition states, retrieve session by ID. Invalid transitions rejected with 400.

---

### Stage 6: AI Service Scaffold (1 week)

**Goal:** FastAPI service running with health check and LLM client stub.

**Key Tasks:**
- Initialize Python FastAPI project with Pydantic models, structured logging.
- Create health check endpoint `/health` returning service status.
- Implement OpenAI client wrapper with API key configuration (environment variable).
- Add retry logic (exponential backoff) using tenacity library for API calls.
- Write pytest unit tests for client wrapper (mocked responses).

**Dependencies:** Stage 1 (Docker Compose can add ai-service container).

**Deliverable:** `curl http://localhost:8000/health` returns `{"status": "healthy"}`. LLM client connects to OpenAI API (test with simple prompt).

---

### Stage 7: Question Generation (1.5 weeks)

**Goal:** AI service generates interview questions based on user context.

**Key Tasks:**
- Design Jinja2 prompt template for question generation (inputs: resume, position, interview type, difficulty).
- Create `/generate-questions` POST endpoint accepting context, returning array of questions.
- Implement response parsing and validation (Pydantic schema: question, expected_answer_type, difficulty).
- Handle LLM errors (timeout, rate limit, malformed JSON) with fallback messages.
- Write integration tests with mocked LLM responses and smoke test with real API.

**Dependencies:** Stage 6 (AI service running).

**Deliverable:** NestJS API calls AI service, receives 5 questions in <8s. Questions stored in Question table.

---

### Stage 8: Answer Evaluation (1.5 weeks)

**Goal:** AI service evaluates user answers and returns scores with feedback.

**Key Tasks:**
- Design Jinja2 prompt template for answer evaluation (inputs: question, user_answer, resume_context).
- Create `/evaluate-answer` POST endpoint accepting question+answer, returning score (0-100), feedback, improvement_suggestions.
- Implement response validation (Pydantic schema enforces field presence).
- Tune prompt to provide constructive feedback (not overly harsh or lenient).
- Write integration tests covering edge cases (empty answer, off-topic answer, excellent answer).

**Dependencies:** Stage 7 (questions exist to evaluate against).

**Deliverable:** User submits answer via NestJS API, receives score and feedback within 10s. Evaluation stored in Answer table.

---

### Stage 9: Session Summarisation (1 week)

**Goal:** AI service generates overall session report with strengths/weaknesses.

**Key Tasks:**
- Design Jinja2 prompt template for session summary (inputs: all questions+answers+scores).
- Create `/summarise-session` POST endpoint accepting session data, returning overall_score, strengths (array), weaknesses (array), recommendations.
- Update InterviewSession table to store summary JSON.
- Create NestJS endpoint PATCH /sessions/:id/complete that triggers summarisation.
- Write integration test for complete user flow (create session → add answers → complete → summary generated).

**Dependencies:** Stage 8 (evaluated answers available).

**Deliverable:** Completing a session generates a comprehensive report. Session state transitions to REVIEWED.

**Milestone:** M2 achieved.

---

### Stage 10: Frontend Auth & Dashboard (1 week)

**Goal:** Next.js pages for signup, login, and dashboard skeleton.

**Key Tasks:**
- Create `/signup`, `/login` pages with React Hook Form + Zod validation.
- Implement auth context using Zustand (store tokens, user data).
- Configure React Query for API calls with token injection in headers.
- Create protected route wrapper that redirects to /login if unauthenticated.
- Create `/dashboard` page showing user profile summary (name, resume status).

**Dependencies:** Stage 3 (auth endpoints available).

**Deliverable:** User can register, login, and view dashboard. Refresh persists login via refresh token.

---

### Stage 11: Interview Setup & Session UI (1.5 weeks)

**Goal:** Complete interview creation wizard and live interview interface.

**Key Tasks:**
- Create `/interview/new` wizard: Step 1 (resume selection), Step 2 (type/position/difficulty), Step 3 (review).
- Implement `/interview/:id` page displaying questions one at a time with answer textarea.
- Add "Submit Answer" button that calls API, shows loading spinner, displays feedback.
- Implement "Next Question" and "Finish Interview" navigation.
- Use React Query mutations for answer submission with optimistic updates.

**Dependencies:** Stage 10 (dashboard navigation), Stage 7-8 (questions and evaluation).

**Deliverable:** User completes full interview flow: create session → answer 5 questions → view feedback per question.

---

### Stage 12: Report Viewer & Progress Charts (1 week)

**Goal:** Display session report with visualizations.

**Key Tasks:**
- Create `/interview/:id/report` page showing overall score, strengths, weaknesses, recommendations.
- Implement score breakdown chart (using Recharts or similar) showing per-question scores.
- Add progress history page showing all past sessions in a table/card view.
- Implement filtering by interview type and sorting by date/score.
- Write E2E test (Playwright) for complete user journey through report.

**Dependencies:** Stage 11 (session completion), Stage 9 (summary data).

**Deliverable:** User views detailed report with charts. Past sessions displayed on `/history` page.

---

### Stage 13: Admin Panel (1 week)

**Goal:** Admin users can view all users, sessions, and system stats.

**Key Tasks:**
- Add `role` enum to User entity (USER, ADMIN).
- Create `/admin` pages: user list, session list, analytics dashboard (total users, sessions, avg scores).
- Implement role-based guards in NestJS (AdminGuard) and Next.js (check user.role).
- Create admin-only endpoints: GET /admin/users, GET /admin/sessions, GET /admin/stats.
- Write integration tests for admin endpoints (403 for non-admin, 200 for admin).

**Dependencies:** Stage 3 (auth), Stage 5 (sessions).

**Deliverable:** Admin user can log in, view all sessions, and see system analytics. Regular users cannot access /admin.

**Milestone:** M3 achieved.

---

### Stage 14: Integration & E2E Testing (1 week)

**Goal:** Comprehensive automated test coverage.

**Key Tasks:**
- Write E2E tests (Playwright) for critical flows: signup, login, create session, complete interview, view report.
- Increase backend test coverage to >80% (Jest coverage report).
- Write integration tests for all API endpoints (Supertest).
- Test error scenarios: network failures, API timeouts, invalid tokens, malformed inputs.
- Set up test database (separate from dev) that resets between test runs.

**Dependencies:** All previous stages (features complete).

**Deliverable:** `pnpm test` runs all tests, CI pipeline green. E2E tests pass in headless mode.

---

### Stage 15: Performance, Security & Documentation (1 week)

**Goal:** Production-ready application with hardening and documentation.

**Key Tasks:**
- Run performance audit: API response times <500ms (P95), Next.js Lighthouse score >90.
- Security audit: helmet enabled, CORS configured, rate limiting on auth endpoints, input sanitization.
- Run `npm audit` and fix critical vulnerabilities.
- Write deployment guide (Railway/Vercel setup steps).
- Write API reference documentation (OpenAPI/Swagger for NestJS).
- Create user guide with screenshots.

**Dependencies:** Stage 14 (tests passing).

**Deliverable:** Application deployed to staging environment. Documentation in `docs/` folder complete. No high/critical vulnerabilities.

**Milestone:** M4 achieved (submission-ready).

---

## 5. Gantt Chart (ASCII)

```
Week:  1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17
       ├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
S1     █████
S2          █████
S3               █████ [M1]
S4                    █████
S5                         █████
S6                              █████
S7                                   ███████
S8                                          ███████
S9                                                 █████ [M2]
S10                                                     █████
S11                                                          ███████
S12                                                                 █████
S13                                                                      █████ [M3]
S14                                                                           █████
S15                                                                                █████ [M4]
```

**Legend:**
- █████ = Stage active
- [MX] = Milestone completion

---

## 6. Critical Path Analysis

### 6.1 Blocking Chains

The following stages form the critical path (any delay cascades):

1. **Stage 1 → 2 → 3:** Infrastructure must be ready before development starts.
2. **Stage 3 → 4 → 5:** Auth required for profile, profile required for sessions.
3. **Stage 6 → 7 → 8 → 9:** AI service must be built sequentially (scaffold → questions → eval → summary).
4. **Stage 10 → 11 → 12:** Frontend pages depend on auth foundation.

**Non-critical paths:** Stages 13 (admin panel) and 14 (testing) can start earlier if Stage 11 finishes early.

### 6.2 Parallelization Opportunities

- **Stage 6-9 (AI service)** and **Stage 4-5 (backend CRUD)** can partially overlap if two developers available.
- **Stage 10 (frontend auth)** can start as soon as Stage 3 completes, even while Stage 4-5 continue.
- **Stage 14 (testing)** can begin writing test stubs during Stage 11-13.

---

## 7. Risk Buffers

### 7.1 Stage-Level Buffers

Each stage includes a 1-day buffer (not shown in estimates) for unexpected issues:
- Debugging cryptic TypeORM errors
- LLM prompt tuning taking longer than expected
- Next.js App Router gotchas

### 7.2 Project-Level Buffer

Total estimated time: 17 weeks. **Target completion: 15 weeks** to allow 2 weeks buffer for:
- Advisor feedback requiring rework
- Scope creep (small feature additions)
- Personal circumstances (illness, other coursework)

---

## 8. Stage Dependencies Diagram

```
        ┌───────┐
        │  S1   │  Monorepo Setup
        └───┬───┘
            │
        ┌───▼───┐
        │  S2   │  Database Schema
        └───┬───┘
            │
        ┌───▼───┐
        │  S3   │  Authentication [M1]
        └───┬───┘
            │
        ┌───▼───┐
        │  S4   │  User Profile & Resume
        └───┬───┘
            │
     ┌──────┴──────┐
     │             │
 ┌───▼───┐    ┌───▼───┐
 │  S5   │    │  S6   │  Session CRUD    AI Scaffold
 └───┬───┘    └───┬───┘
     │            │
     │        ┌───▼───┐
     │        │  S7   │  Question Gen
     │        └───┬───┘
     │            │
     │        ┌───▼───┐
     │        │  S8   │  Answer Eval
     │        └───┬───┘
     │            │
     │        ┌───▼───┐
     │        │  S9   │  Session Summary [M2]
     │        └───┬───┘
     │            │
     └──────┬─────┘
            │
        ┌───▼───┐
        │  S10  │  Frontend Auth
        └───┬───┘
            │
        ┌───▼───┐
        │  S11  │  Interview UI
        └───┬───┘
            │
        ┌───▼───┐
        │  S12  │  Report Viewer
        └───┬───┘
            │
        ┌───▼───┐
        │  S13  │  Admin Panel [M3]
        └───┬───┘
            │
        ┌───▼───┐
        │  S14  │  Integration Tests
        └───┬───┘
            │
        ┌───▼───┐
        │  S15  │  Production Hardening [M4]
        └───────┘
```

---

## 9. Weekly Check-in Protocol

### 9.1 Self-Assessment Questions

At the end of each week:
1. **Did I complete the planned stage?** If no, why not?
2. **Are there blockers for next stage?** (Missing knowledge, external dependency)
3. **Is the critical path at risk?** (Slippage accumulating)
4. **Do tests pass for completed work?**

### 9.2 Advisor Sync Points

Recommended check-ins:
- **Week 3 (after M1):** Demo authentication, review database schema.
- **Week 9 (after M2):** Demo AI service, discuss prompt quality.
- **Week 13 (after M3):** Full MVP demo, gather feedback.
- **Week 15 (after M4):** Final review before submission.

---

## 10. Stage Completion Criteria

Each stage is considered complete when:
1. **Code committed:** All code pushed to feature branch, PR created.
2. **Tests pass:** Unit/integration tests green in CI.
3. **Manual verification:** Deliverable tested manually (screenshots/logs captured).
4. **Documentation updated:** API docs, setup guide, or architecture diagrams reflect changes.
5. **Review approved:** Self-review or peer review completed (if available).

---

## 11. Tools and Tracking

### 11.1 Task Management

- **GitHub Projects:** Create project board with columns: Backlog, In Progress, Review, Done.
- **Issues per stage:** One issue per stage with checklist of key tasks.
- **Labels:** `stage-1` through `stage-15`, `milestone-m1`, `bug`, `documentation`.

### 11.2 Time Tracking (Optional)

- **Toggl or Clockify:** Track hours per stage to improve future estimates.
- **Daily log:** Short commit messages document daily progress.

---

## 12. Contingency Plans

### 12.1 If Critical Path Slips by 1 Week

**Action:**
- Cut Stage 13 (admin panel) from MVP; document as future work.
- Reduce Stage 15 to 3 days (skip performance tuning, focus security only).
- **Time saved:** 1.5 weeks, brings back on schedule.

### 12.2 If AI Service Integration Fails (Stage 7-9)

**Action:**
- Replace LLM with rule-based question generation (hardcoded question bank).
- Document LLM integration as "planned architecture" in report.
- **Trade-off:** Loses core innovation but demonstrates full-stack competency.

### 12.3 If Frontend Complexity Exceeds Estimate (Stage 11)

**Action:**
- Simplify UI: remove animations, use basic HTML forms instead of complex wizard.
- Focus on functionality over polish.
- **Time saved:** 2-3 days.

---

## 13. Learning Milestones

### 13.1 New Technology Familiarity Targets

| Technology | Comfortable By | Measured By |
|------------|----------------|-------------|
| NestJS | End Stage 3 | Can create new modules without docs |
| TypeORM | End Stage 2 | Understands migrations, relations |
| FastAPI | End Stage 6 | Can add endpoints, validation easily |
| Next.js App Router | End Stage 10 | Understands SSR, client components |
| LLM Prompting | End Stage 8 | Can tune prompts for better outputs |

---

## 14. Post-MVP Roadmap (Optional Future Work)

| Feature | Effort | Dependency |
|---------|--------|------------|
| Voice recording + transcription | 3 weeks | Speech-to-text API integration |
| Mock video interview (camera) | 4 weeks | WebRTC, video storage |
| Resume scoring | 1 week | AI service extension |
| Question difficulty auto-adjust | 2 weeks | Adaptive algorithm |
| Mobile app (React Native) | 6 weeks | API already supports it |
| Multi-language support | 2 weeks | i18n library, translations |

---

## 15. Success Metrics

### 15.1 Technical Metrics

| Metric | Target | Measured By |
|--------|--------|-------------|
| Test coverage | >80% | Jest/Vitest coverage report |
| API response time (P95) | <500ms | k6 load testing |
| Frontend Lighthouse score | >90 | Chrome DevTools audit |
| LLM response time (P95) | <10s | Application logs |
| Zero critical vulnerabilities | 0 | npm audit, Snyk scan |

### 15.2 Functional Metrics

| Metric | Target | Measured By |
|--------|--------|-------------|
| Complete user flows | 3 (HR, Technical, Project) | Manual testing checklist |
| Admin features | User management, analytics | Admin panel walkthrough |
| E2E test coverage | 5 critical flows | Playwright test suite |

### 15.3 Academic Metrics

| Metric | Target | Measured By |
|--------|--------|-------------|
| Specification completeness | 25 docs | This roadmap! |
| Git commit frequency | Daily commits | GitHub insights |
| Code documentation | All modules documented | JSDoc coverage |
| Final report | 50-80 pages | Page count |

---

## 16. Conclusion

This 17-week roadmap provides a structured path from empty repository to submission-ready application. The staged approach minimizes risk by validating critical integrations (auth, database, AI service) early, leaving frontend polish for later stages when backend stability is confirmed.

Four milestones provide natural checkpoints for progress assessment and advisor demos. The 2-week buffer accommodates unexpected challenges without compromising the submission deadline. Contingency plans ensure that even if certain stages fail, a demonstrable MVP can still be delivered.

Success requires discipline: completing each stage's deliverable before moving forward, maintaining test coverage, and resisting scope creep. The roadmap is ambitious but achievable with consistent daily effort and proactive blocker resolution.

---

**Approval Status:** Ready for execution  
**Start Date:** TBD  
**Target Completion:** 17 weeks from start  
**Next Action:** Stage 1 kickoff (monorepo setup)
