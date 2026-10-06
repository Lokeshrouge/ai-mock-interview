# System Architecture

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Project:** AI-Powered Mock Interview System

---

## 1. Introduction

This document describes the system architecture of the AI-Powered Mock Interview System, detailing the high-level structure, component interactions, deployment topology, and key architectural decisions. The architecture follows a modular, service-oriented approach that separates concerns and enables independent scaling of system components.

---

## 2. High-Level Architecture Overview

The AI-Powered Mock Interview System follows a **three-tier architecture with an isolated AI microservice**:

1. **Presentation Layer:** Next.js frontend application (React-based)
2. **Application Layer:** NestJS backend API (business logic, data access)
3. **Data Layer:** PostgreSQL relational database
4. **AI Service Layer:** Python FastAPI service (AI/LLM integration)

This separation ensures that business logic remains independent of AI implementation details, facilitating easier updates to AI models or providers without disrupting core functionality.

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │          Next.js 14 Frontend (App Router)             │    │
│  │  - React Components (TypeScript)                      │    │
│  │  - Tailwind CSS Styling                               │    │
│  │  - Client-side State Management                       │    │
│  │  - JWT Token Management                               │    │
│  └─────────────────────┬─────────────────────────────────┘    │
│                        │ HTTPS / REST                          │
└────────────────────────┼───────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVER                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │           NestJS Backend API (TypeScript)             │    │
│  │  ┌─────────────────────────────────────────────┐     │    │
│  │  │ Controller Layer                            │     │    │
│  │  │ - AuthController                            │     │    │
│  │  │ - UsersController                           │     │    │
│  │  │ - InterviewsController                      │     │    │
│  │  │ - ReportsController                         │     │    │
│  │  └──────────────────┬──────────────────────────┘     │    │
│  │                     │                                 │    │
│  │  ┌─────────────────▼──────────────────────────┐     │    │
│  │  │ Service Layer                              │     │    │
│  │  │ - AuthService (JWT, bcrypt)                │     │    │
│  │  │ - UsersService                             │     │    │
│  │  │ - InterviewsService                        │     │    │
│  │  │ - QuestionsService                         │     │    │
│  │  │ - ReportsService                           │     │    │
│  │  │ - FilesService (resume processing)         │     │    │
│  │  │ - AIProxyService ──────────┐               │     │    │
│  │  └──────────────────┬──────────┘               │     │    │
│  │                     │                          │     │    │
│  │  ┌─────────────────▼──────────────────────────┐     │    │
│  │  │ Repository Layer (TypeORM)                 │     │    │
│  │  │ - UserRepository                           │     │    │
│  │  │ - InterviewSessionRepository               │     │    │
│  │  │ - QuestionRepository                       │     │    │
│  │  │ - AnswerRepository                         │     │    │
│  │  └──────────────────┬──────────────────────────┘     │    │
│  └────────────────────┼────────────────────────────────┘    │
│                       │                        │              │
└───────────────────────┼────────────────────────┼──────────────┘
                        │                        │ HTTP/REST
                        │ PostgreSQL             │
                        │ Protocol               ▼
                        │              ┌──────────────────────┐
                        │              │  AI SERVICE SERVER   │
                        │              │                      │
                        │              │ ┌──────────────────┐ │
                        │              │ │ FastAPI Service  │ │
                        │              │ │   (Python)       │ │
                        │              │ │                  │ │
                        │              │ │ - Question Gen   │ │
                        │              │ │ - Answer Eval    │ │
                        │              │ │ - Summarization  │ │
                        │              │ │ - Prompt Builder │ │
                        │              │ │ - LLM Client     │ │
                        │              │ └────────┬─────────┘ │
                        │              │          │           │
                        │              └──────────┼───────────┘
                        │                         │ HTTPS/API
                        ▼                         ▼
              ┌──────────────────┐    ┌────────────────────┐
              │   PostgreSQL     │    │  External LLM API  │
              │    Database      │    │  (OpenAI-compat.)  │
              │                  │    │                    │
              │ - Users          │    │ - GPT-4 / Claude   │
              │ - Sessions       │    │ - Llama / Mistral  │
              │ - Questions      │    │                    │
              │ - Answers        │    └────────────────────┘
              │ - Reports        │
              └──────────────────┘
```

---

## 3. Layer Descriptions

### 3.1 Presentation Layer (Next.js Frontend)

**Technology:** Next.js 14 with App Router, React 18, TypeScript, Tailwind CSS

**Responsibilities:**
- Render user interfaces for students and admins
- Handle client-side routing and navigation
- Manage user authentication state (JWT tokens)
- Validate user inputs before submission
- Display loading states and error messages
- Implement responsive design for multiple devices

**Key Features:**
- Server-side rendering (SSR) for initial page loads
- Client-side navigation for subsequent route changes
- API route handlers for backend communication
- Form validation using React Hook Form and Zod
- State management using React Context or Zustand

**Security Considerations:**
- Stores access tokens in memory (React state)
- Stores refresh tokens in httpOnly cookies
- Implements CSRF protection for state-changing operations
- Sanitizes user inputs to prevent XSS

### 3.2 Application Layer (NestJS Backend)

**Technology:** NestJS (Node.js framework), TypeScript, TypeORM

**Responsibilities:**
- Expose REST API endpoints for frontend consumption
- Implement business logic and validation rules
- Manage user authentication and authorization (JWT)
- Process resume uploads and text extraction
- Orchestrate interview session workflows
- Proxy requests to AI service
- Persist data to PostgreSQL database
- Generate and serve session reports

**Architecture Pattern:** Modular monolith with clear module boundaries

**Modules:**
- **AuthModule:** Authentication, JWT generation/validation
- **UsersModule:** User profile management, CRUD operations
- **InterviewsModule:** Interview session lifecycle management
- **QuestionsModule:** Question storage and retrieval
- **AnswersModule:** Answer storage and evaluation results
- **ReportsModule:** Session report generation and retrieval
- **FilesModule:** Resume upload, storage, text extraction
- **AIModule:** Proxy to AI service with error handling
- **AdminModule:** Administrative functions

**Security Mechanisms:**
- JWT-based authentication guards
- Role-based authorization guards (Student, Admin)
- Input validation using class-validator DTOs
- Rate limiting middleware
- CORS configuration
- Helmet.js for security headers

### 3.3 Data Layer (PostgreSQL)

**Technology:** PostgreSQL 15+

**Responsibilities:**
- Persist all application data
- Enforce data integrity through constraints
- Provide transactional guarantees
- Support complex queries with joins and aggregations
- Index frequently accessed data for performance

**Key Entities:**
- Users (authentication credentials, roles)
- User Profiles (personal information, skills)
- Resumes (file metadata, extracted text)
- Interview Sessions (configuration, status, timestamps)
- Interview Questions (generated questions per session)
- Interview Answers (user responses, scores)
- Session Reports (AI-generated summaries, recommendations)
- Admin Logs (audit trail)

**Data Access:**
- TypeORM as ORM (Object-Relational Mapper)
- Repository pattern for data access abstraction
- Migrations for schema versioning
- Connection pooling for performance

### 3.4 AI Service Layer (Python FastAPI)

**Technology:** Python 3.10+, FastAPI, OpenAI SDK or LangChain

**Responsibilities:**
- Generate contextual interview questions
- Evaluate user answers with scoring and feedback
- Generate session summaries with recommendations
- Manage prompts and templates for different interview types
- Interface with external LLM APIs (OpenAI, Anthropic, etc.)
- Parse and structure AI responses

**Isolation Rationale:**
- AI logic independent of business rules
- Python ecosystem advantages for AI/ML libraries
- Enables separate scaling for compute-intensive operations
- Facilitates AI model/provider changes without backend refactoring
- No direct database access (follows single responsibility principle)

**API Endpoints:**
- `POST /api/generate-question`: Generate next interview question
- `POST /api/evaluate-answer`: Evaluate user answer
- `POST /api/summarize-session`: Generate session summary

**Error Handling:**
- Timeout protection (8-second timeout for most operations)
- Retry logic with exponential backoff
- Graceful fallback responses on LLM API failures
- Structured error responses for backend consumption

---

## 4. Communication Protocols

### 4.1 Frontend ↔ Backend API

**Protocol:** HTTPS REST (JSON over HTTP)

**Request Format:**
```json
{
  "headers": {
    "Authorization": "Bearer <access_token>",
    "Content-Type": "application/json"
  },
  "body": { /* request payload */ }
}
```

**Response Format:**
```json
{
  "statusCode": 200,
  "data": { /* response payload */ },
  "message": "Success"
}
```

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

**Authentication:**
- JWT access token in Authorization header
- Refresh token in httpOnly cookie
- Token refresh endpoint: `POST /api/auth/refresh`

### 4.2 Backend API ↔ AI Service

**Protocol:** HTTP REST (JSON over HTTP, internal network)

**Request Flow:**
1. Backend validates request and prepares context (resume text, session history)
2. Backend calls AI service endpoint with timeout
3. AI service processes request, calls external LLM
4. AI service structures and validates response
5. Backend receives structured response, persists to database
6. Backend sends response to frontend

**Example Request to AI Service:**
```json
POST /api/generate-question
{
  "interview_type": "TECHNICAL",
  "difficulty": "MEDIUM",
  "resume_text": "...",
  "skill_tags": ["Python", "Data Structures"],
  "previous_questions": ["What is..."],
  "previous_answers": ["..."]
}
```

**Example Response from AI Service:**
```json
{
  "question": "Can you explain the difference between a hash table and a binary search tree?",
  "focus_area": "Data Structures",
  "expected_answer_length": "medium",
  "metadata": {
    "generation_time_ms": 4200,
    "tokens_used": 450
  }
}
```

**Error Handling:**
- Backend implements circuit breaker pattern for AI service
- Timeout: 8 seconds for question generation/evaluation, 15 seconds for summarization
- Retry: Up to 2 retries with exponential backoff
- Fallback: Generic error message to user, session state preserved

### 4.3 Backend API ↔ Database

**Protocol:** PostgreSQL wire protocol (TCP)

**Connection Management:**
- Connection pool: min 10, max 100 connections
- Connection timeout: 30 seconds
- Idle connection timeout: 10 minutes
- TypeORM handles connection lifecycle

**Transaction Management:**
- Explicit transactions for multi-step operations
- Isolation level: Read Committed (PostgreSQL default)
- Rollback on errors to maintain consistency

### 4.4 AI Service ↔ External LLM API

**Protocol:** HTTPS REST (provider-specific, typically OpenAI-compatible)

**Configuration:**
- API key stored in environment variables
- Configurable endpoint URL for different providers
- Timeout: 30 seconds for LLM API calls
- Retry logic for transient failures

**Request Example (OpenAI-compatible):**
```json
POST https://api.openai.com/v1/chat/completions
{
  "model": "gpt-4",
  "messages": [
    { "role": "system", "content": "You are an interview question generator..." },
    { "role": "user", "content": "Generate a question about..." }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

---

## 5. Data Flow Narratives

### 5.1 User Submits Answer Flow

1. **User Action:** Student types answer in textarea and clicks "Submit Answer"
2. **Frontend Validation:** Client validates answer length (minimum 50 characters)
3. **API Request:** Frontend sends POST request to `/api/interviews/{sessionId}/answers` with answer text
4. **Backend Authentication:** NestJS AuthGuard verifies JWT token, extracts user ID
5. **Backend Authorization:** Verify user owns the session (user_id matches)
6. **Backend Validation:** Validate answer format and session status (must be IN_PROGRESS)
7. **Save Answer:** Backend persists answer to database with timestamp
8. **AI Evaluation Request:** Backend calls AI service `POST /api/evaluate-answer` with question, answer, and context
9. **AI Processing:** AI service constructs prompt, calls LLM API, parses response
10. **AI Response:** AI service returns structured evaluation (score, feedback dimensions, comments)
11. **Backend Persistence:** Backend saves evaluation results linked to answer record
12. **Next Question Generation:** Backend calls AI service `POST /api/generate-question` for follow-up
13. **AI Question Generation:** AI service generates next question based on answer quality
14. **Backend Persistence:** Backend saves generated question to database
15. **Response Assembly:** Backend assembles response with evaluation results and next question
16. **API Response:** Backend sends JSON response to frontend
17. **Frontend Update:** Frontend displays evaluation feedback and renders next question

**Total Time:** 15-20 seconds (8s for evaluation + 8s for next question + database/network overhead)

### 5.2 Session Completion and Report Generation Flow

1. **Trigger:** Timer expires or user clicks "End Interview"
2. **Frontend Request:** POST to `/api/interviews/{sessionId}/complete`
3. **Backend Status Update:** Update session status to COMPLETED, set end_time
4. **Data Retrieval:** Backend fetches all questions and answers for the session
5. **AI Summarization Request:** Backend calls AI service `POST /api/summarize-session` with complete session data
6. **AI Analysis:** AI service analyzes all Q&A pairs, identifies patterns, generates summary
7. **AI Response:** Structured summary with overall score, strengths (array), weaknesses (array), recommendations (array)
8. **Report Persistence:** Backend creates session_reports record with AI-generated content
9. **API Response:** Backend returns report data to frontend
10. **Frontend Rendering:** Frontend displays performance report with visualizations

**Total Time:** 15-20 seconds for summarization

---

## 6. Deployment Topology

### 6.1 MVP Single-Server Deployment

For the MVP phase, all services can be deployed on a single cloud server (e.g., AWS EC2, DigitalOcean Droplet, Azure VM):

```
┌─────────────────────────────────────────────────────────┐
│              Cloud Server (e.g., 4 vCPU, 16GB RAM)      │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   Next.js    │  │   NestJS     │  │   FastAPI   │  │
│  │   (Port 3000)│  │   (Port 4000)│  │  (Port 8000)│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │
│         │                 │                  │         │
│         └─────────────────┼──────────────────┘         │
│                           │                            │
│                  ┌────────▼────────┐                   │
│                  │   PostgreSQL    │                   │
│                  │   (Port 5432)   │                   │
│                  └─────────────────┘                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Nginx Reverse Proxy (Port 80/443)      │  │
│  │  - Routes /api/* → NestJS:4000                   │  │
│  │  - Routes /* → Next.js:3000                      │  │
│  │  - SSL/TLS termination                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Process Management:** PM2 or systemd for Node.js/Python processes

**Advantages:**
- Simple deployment and management
- Low infrastructure cost
- Sufficient for 100-500 concurrent users
- Easy debugging with co-located services

**Limitations:**
- Single point of failure
- Limited horizontal scaling
- Vertical scaling only (upgrade server specs)

### 6.2 Production Multi-Server Deployment (Future)

For production scale with higher availability and scalability:

```
                    ┌───────────────────┐
                    │   Load Balancer   │
                    │    (nginx/ALB)    │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  Next.js    │  │  Next.js    │  │  Next.js    │
    │  Frontend   │  │  Frontend   │  │  Frontend   │
    │  Instance 1 │  │  Instance 2 │  │  Instance 3 │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
                    ┌───────▼────────┐
                    │ API Gateway /  │
                    │ Load Balancer  │
                    └───────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   NestJS     │ │   NestJS     │ │   NestJS     │
    │   Backend    │ │   Backend    │ │   Backend    │
    │   Instance 1 │ │   Instance 2 │ │   Instance 3 │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                │                │
           │                │                │
           │         ┌──────┼────────┐       │
           │         │      │        │       │
           └─────────┤      │        ├───────┘
                     │      │        │
                     ▼      ▼        ▼
              ┌──────────────────────────┐
              │   PostgreSQL Cluster     │
              │  (Primary + Replicas)    │
              └──────────────────────────┘

                     │      │        │
           ┌─────────┘      │        └─────────┐
           │                │                  │
           ▼                ▼                  ▼
    ┌────────────┐   ┌────────────┐   ┌────────────┐
    │  FastAPI   │   │  FastAPI   │   │  FastAPI   │
    │ AI Service │   │ AI Service │   │ AI Service │
    │ Instance 1 │   │ Instance 2 │   │ Instance 3 │
    └────────────┘   └────────────┘   └────────────┘
           │                │                  │
           └────────────────┼──────────────────┘
                            │
                    ┌───────▼────────┐
                    │  External LLM  │
                    │      API       │
                    └────────────────┘
```

**Advantages:**
- High availability (no single point of failure)
- Horizontal scaling for each layer
- Better resource utilization
- Geographic distribution possible

**Components:**
- Load balancers with health checks
- Auto-scaling groups for each service tier
- Database replication for read scaling
- Centralized logging (ELK Stack or CloudWatch)
- Distributed caching (Redis)

---

## 7. Key Architectural Decisions

### 7.1 Why NestJS for Backend?

**Decision:** Use NestJS (Node.js framework) instead of Django, Spring Boot, or Express.js

**Rationale:**
- **TypeScript Throughout:** Shares language with frontend, enabling code reuse (DTOs, types)
- **Modular Architecture:** Built-in dependency injection and module system promotes SOLID principles
- **Decorator-Based:** Clean, declarative syntax for routes, validation, guards
- **OpenAPI Integration:** Excellent Swagger support for API documentation
- **Active Ecosystem:** Large community, extensive middleware, strong support
- **Performance:** Event-driven, non-blocking I/O suitable for I/O-bound operations
- **Learning Curve:** Team familiar with Node.js ecosystem

**Trade-offs:**
- Not ideal for CPU-intensive tasks (but we offload AI to Python service)
- Less mature than Spring Boot for enterprise features
- Requires discipline to avoid callback hell (mitigated by async/await)

### 7.2 Why Separate AI Service?

**Decision:** Isolate AI logic in a separate Python FastAPI service instead of embedding in NestJS backend

**Rationale:**
- **Language Fit:** Python is the de facto language for AI/ML with superior library ecosystem
- **Single Responsibility:** Backend handles business logic; AI service handles AI/ML concerns
- **Independent Scaling:** AI operations are compute-intensive and can scale independently
- **Technology Flexibility:** Easy to swap AI models or providers without touching business logic
- **Team Specialization:** AI engineers can work on AI service without understanding full backend
- **No Database Coupling:** AI service is stateless, receives context, returns structured response

**Trade-offs:**
- Additional network latency (mitigated by internal network, typically < 5ms)
- More complex deployment (two services instead of one)
- Distributed system complexity (handled with proper error handling and timeouts)

### 7.3 Why PostgreSQL?

**Decision:** Use PostgreSQL instead of MongoDB, MySQL, or other databases

**Rationale:**
- **Relational Model Fit:** Strong relationships between users, sessions, questions, answers
- **ACID Compliance:** Ensures data consistency for financial or critical data
- **Complex Queries:** Supports joins, aggregations, window functions needed for analytics
- **JSON Support:** JSONB type for semi-structured data (resume metadata, AI responses)
- **Full-Text Search:** Built-in text search for resume content
- **Mature and Reliable:** Battle-tested, extensive tooling, strong community
- **TypeORM Support:** Excellent integration with TypeORM for migrations and queries

**Trade-offs:**
- Less flexible schema than NoSQL (mitigated by JSONB for flexible fields)
- Vertical scaling limits (addressed with read replicas for high scale)

### 7.4 Why Monorepo Structure?

**Decision:** Use monorepo (single repository) for frontend, backend, AI service

**Rationale:**
- **Shared Types:** DTOs and interfaces shared between frontend and backend
- **Atomic Changes:** Cross-service changes committed together
- **Simplified Versioning:** One version number for the entire system
- **Easier Onboarding:** New developers clone one repo to see full system
- **Consistent Tooling:** Shared linting, formatting, CI/CD configuration

**Implementation:**
- Folder structure: `/frontend`, `/backend`, `/ai-service`, `/shared`
- Root-level package.json for shared scripts
- Turborepo or Nx for build orchestration (future enhancement)

**Trade-offs:**
- Larger repository size
- Requires discipline to maintain module boundaries
- Build times increase with project growth (mitigated by selective builds)

### 7.5 Why JWT Instead of Session Cookies?

**Decision:** Use JWT (JSON Web Tokens) for authentication instead of server-side sessions

**Rationale:**
- **Stateless Backend:** No session storage needed, enables horizontal scaling
- **Microservice Friendly:** Token contains authentication data, no shared session store required
- **Mobile Ready:** Easy to integrate with mobile apps in future
- **Decoupled Frontend:** SPA can authenticate independently without CORS session complexity

**Implementation:**
- Short-lived access tokens (15 minutes) for API requests
- Long-lived refresh tokens (7 days) in httpOnly cookies
- Token rotation on refresh (future security enhancement)

**Trade-offs:**
- Cannot revoke access tokens before expiry (mitigated by short expiry time)
- Slightly larger request size (token in every request)
- Requires secure token storage on client

---

## 8. Integration Points and Contracts

### 8.1 Frontend-Backend Contract

**Contract Definition:** OpenAPI 3.0 specification generated from NestJS decorators

**Code Generation:** Use OpenAPI Generator to create TypeScript fetch clients for frontend

**Versioning:** API version included in base path (`/api/v1/...`)

**Breaking Changes:** Handled through API versioning (v1, v2, etc.)

### 8.2 Backend-AI Service Contract

**Contract Definition:** Pydantic models in AI service exported as JSON Schema

**Error Contract:**
- 200: Success with structured response
- 400: Invalid request (missing fields, wrong format)
- 500: AI service internal error
- 503: External LLM API unavailable
- 504: Request timeout

**Timeout Handling:** Backend enforces timeout, treats timeout as service unavailable

### 8.3 Backend-Database Contract

**Contract Definition:** TypeORM entities define database schema

**Migration Strategy:** Version-controlled migration scripts in `/backend/src/migrations`

**Schema Changes:** Always backward-compatible during deployment (add columns as nullable, remove in subsequent release)

---

## 9. Cross-Cutting Concerns

### 9.1 Logging
- Structured JSON logs from all services
- Correlation IDs passed through request chain
- Log levels: DEBUG (dev only), INFO, WARN, ERROR
- Centralized log aggregation in production (future: ELK Stack)

### 9.2 Monitoring
- Health check endpoints on all services
- Metrics collection (Prometheus format)
- APM integration (future: New Relic, Datadog)
- Alert definitions for critical thresholds

### 9.3 Error Handling
- Global exception filters in NestJS
- Structured error responses with error codes
- User-friendly messages for frontend display
- Detailed error logging for debugging

### 9.4 Security
- HTTPS everywhere in production
- JWT authentication on all protected routes
- Role-based authorization guards
- Input validation on all endpoints
- Rate limiting to prevent abuse
- SQL injection prevention via parameterized queries

---

## 10. Scalability Considerations

### 10.1 Database Scaling
- **Vertical:** Increase PostgreSQL server resources (CPU, RAM, storage)
- **Read Replicas:** Offload read queries to replica databases
- **Connection Pooling:** Optimize connection usage (configured in TypeORM)
- **Query Optimization:** Proper indexing, query analysis

### 10.2 Application Scaling
- **Horizontal:** Add more NestJS backend instances behind load balancer
- **Stateless Design:** No server-side sessions, any instance can handle any request
- **Caching:** Introduce Redis for session data, frequently accessed data
- **CDN:** Serve static frontend assets from CDN

### 10.3 AI Service Scaling
- **Horizontal:** Multiple FastAPI instances with load balancing
- **Queue-Based:** Introduce message queue (RabbitMQ, SQS) for asynchronous AI processing (future)
- **Model Optimization:** Use faster/smaller models for simpler tasks
- **Response Caching:** Cache AI responses for identical inputs (careful with privacy)

---

## 11. Disaster Recovery and Business Continuity

### 11.1 Backup Strategy
- Automated daily database backups
- Backup retention: 30 days
- Backup verification: Weekly restore test
- Uploaded files backed up to object storage (S3-compatible)

### 11.2 Recovery Objectives
- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 24 hours (daily backups)

### 11.3 Failover Procedures
- Database: Promote replica to primary (manual in MVP, automated in production)
- Application: Auto-scaling group replaces failed instances
- AI Service: Load balancer routes around failed instances

---

## 12. Conclusion

The AI-Powered Mock Interview System architecture is designed with modularity, scalability, and maintainability as core principles. The separation of concerns across frontend, backend, AI service, and database enables independent development, testing, and scaling of each component. The architecture supports the MVP deployment on a single server while providing a clear path to distributed, highly available production deployment.

Key architectural decisions—NestJS for backend, separate Python AI service, PostgreSQL database, JWT authentication, and monorepo structure—are justified by technical requirements and team capabilities. The defined contracts between components ensure loose coupling and facilitate evolution of the system over time.
