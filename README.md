# AI-Powered Mock Interview System
## B.Sc. Computer Science Final Year Project

**Status**: Full Text-Based MVP Complete ✅ (Stages 1–8 Implemented & Verified) 🚀

---

## 🌟 Overview
The AI-Powered Mock Interview & Candidate Performance Evaluation System is an intelligent platform designed to help students and candidates practice job interviews tailored to specific roles, difficulty levels, and resume backgrounds. The system features adaptive AI questioning, multi-dimensional rubric answer evaluation, personalized feedback recommendations, detailed performance reports, interview history, and an administrative oversight dashboard.

---

## 🏗️ System Architecture
```
ai-mock-interview/
├── frontend/                 # Next.js 14 client application (React, Tailwind CSS, Lucide Icons)
├── backend/                  # NestJS TypeScript API service (TypeORM, PostgreSQL, JWT Auth)
├── ai-service/               # Python FastAPI microservice (LLM Provider, Rubric Scoring, Recommendations)
├── docs/                     # Comprehensive architectural & design specifications
├── docker-compose.yml        # Multi-container orchestration (PostgreSQL, NestJS, FastAPI, Next.js)
├── .env.example              # Consolidated environment variable template
├── .gitignore                # Global Git ignore rules
└── README.md                 # Project documentation
```

---

## 🚀 Completed MVP Capabilities

1. **Authentication & RBAC:**
   - JWT authentication with secure password hashing (bcrypt, 10 salt rounds).
   - Role-Based Access Control (`STUDENT` vs `ADMIN`).

2. **Candidate Profile & Resume Intelligence:**
   - Profile completion tracker with weighted scoring.
   - Secure multi-format resume upload (PDF & DOCX) with cryptographic storage.
   - Text extraction and AI entity parsing with prompt-injection defense.

3. **Interview Configuration & Engine:**
   - 10 seeded industry job roles (Fullstack, Frontend, Backend, AI/ML, DevOps, Data Analyst, etc.).
   - Configurable interview types (Technical, HR/Behavioral, Project-Based).
   - Adjustable difficulty levels (Easy, Medium, Hard) and question counts (5–20 questions).
   - Session continuity: interview progress persists across browser reloads.

4. **Adaptive AI Question Generation:**
   - Dynamically crafts questions based on candidate resume, job role, and previous responses.
   - Anti-duplication similarity engine ensures distinct questions.
   - Offline heuristic question catalog ensures 100% availability.

5. **Multi-Dimensional Answer Evaluation & Scoring:**
   - Rubric evaluation across 4 dimensions: Technical Accuracy (35%), Completeness (30%), Clarity (20%), Relevance (15%).
   - Backend-controlled score calculations prevent unvalidated AI score manipulation.
   - Resilient fallback scoring protects against provider downtime or rate limits.

6. **Personalized Recommendations & Performance Reports:**
   - Generates targeted strengths, areas for improvement, and curated learning resources.
   - Comprehensive performance report (`/interview/:id/report`) with expandable per-question rubric breakdowns.

7. **Student History & Admin Dashboard:**
   - Complete candidate interview history (`/history`) with status badges and performance tracking.
   - Administrative telemetry portal (`/admin/dashboard`) displaying total users, active interviews, average platform score, and user directory.

---

## 🧪 Verified Test Suites

- **AI Service Unit Tests (`ai-service/tests/`):**
  - `test_resume_parser_unittest.py`: 3/3 passed.
  - `test_question_generator_unittest.py`: 3/3 passed.
  - `test_evaluator_unittest.py`: 3/3 passed.
  - **Status: 9/9 passing (100% OK)**.
- **Backend Unit Tests (`backend/test/`):**
  - `profiles.service.spec.ts`: Profile loading, updates, completion percentage calculations.
  - `resumes.service.spec.ts`: File upload validation and ownership isolation.
  - `interviews.service.spec.ts`: Configuration validation and IDOR access control.
  - `answers.service.spec.ts`: Progression logic and interview completion transitions.
  - `evaluations.service.spec.ts`: Multi-dimensional rubric calculation and offline fallback.
  - `recommendations.service.spec.ts`: Aggregated scoring and recommendation synthesis.
  - `admin.service.spec.ts`: Telemetry stats, candidate pagination, status toggle, system settings.
  - **Status: 33/33 passing across 7 suites (100% OK)**.

---

## 🏃 Quick Start & Execution

### 1. Environment Configuration
```bash
cp .env.example .env
```

### 2. Service Orchestration via Docker Compose
```bash
docker compose up -d
```

### 3. Local Development Mode (Without Docker)
- **AI Microservice:**
  ```bash
  cd ai-service
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  ```
- **NestJS Backend:**
  ```bash
  cd backend
  npm run start:dev
  ```
- **Next.js Frontend:**
  ```bash
  cd frontend
  npm run dev
  ```

### 4. Verification & Testing Commands
- **AI Service Tests:** `py ai-service/tests/test_resume_parser_unittest.py; py ai-service/tests/test_question_generator_unittest.py; py ai-service/tests/test_evaluator_unittest.py`
- **Backend Tests:** `cd backend && npx jest --runInBand`
- **Backend Build:** `cd backend && npm run build`
- **Frontend Build:** `cd frontend && npm run build`

### 5. Service Endpoints
- **Frontend Portal**: http://localhost:3000
- **Backend REST API**: http://localhost:3001
- **AI Microservice**: http://localhost:8000 (Interactive docs at `/docs`)
- **PostgreSQL Database**: `localhost:5432`
