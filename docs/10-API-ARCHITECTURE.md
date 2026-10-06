# API Architecture

## Document Information
**Project:** AI-Powered Mock Interview System  
**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** B.Sc. Final Year Project Team

---

## 1. Introduction

This document defines the REST API architecture for the AI-Powered Mock Interview System. The API serves as the central communication layer between the Next.js frontend, NestJS backend, and Python AI service. It follows RESTful principles with resource-oriented design, consistent error handling, and comprehensive documentation.

The API is designed to support three interview types (HR, Technical, Project-based) in a text-based MVP implementation, with extensibility for future enhancements such as voice or video interviews.

---

## 2. REST API Design Principles

### 2.1 Core Principles

**Resource-Oriented Design**  
All endpoints represent resources (users, interviews, answers, reports) or actions on resources. URIs are nouns, not verbs, with HTTP methods indicating operations:
- `GET` for retrieval
- `POST` for creation
- `PUT/PATCH` for updates
- `DELETE` for removal

**Versioning Strategy**  
All API endpoints are prefixed with `/api/v1/` to enable future backward-compatible changes. Version increments occur when breaking changes are introduced.

**Consistent Response Structure**  
Success responses return relevant data with appropriate HTTP status codes. Error responses follow a standard shape for predictable client-side handling.

**Stateless Communication**  
Each request contains all necessary authentication and context. Server does not maintain client session state (beyond database-persisted user sessions).

**Content Negotiation**  
API accepts and returns `application/json`. Future versions may support additional formats.

### 2.2 Standard Error Response Shape

All error responses follow this consistent structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/interviews"
}
```

**Fields:**
- `statusCode`: HTTP status code (number)
- `message`: Human-readable error description (string or array of strings for validation errors)
- `error`: Error category (string)
- `timestamp`: ISO 8601 timestamp (string)
- `path`: Request path that triggered the error (string)

---

## 3. Authentication Endpoints

### 3.1 POST /api/v1/auth/register

**Purpose:** Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `email`: Valid email format, unique in database
- `password`: Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
- `firstName`, `lastName`: 1-50 chars, alphanumeric + spaces

**Success Response (201 Created):**
```json
{
  "user": {
    "id": "uuid-v4-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `400`: Validation failed (weak password, invalid email)
- `409`: Email already registered
- `500`: Internal server error

**Side Effects:**
- User record created in database with hashed password (bcrypt, cost factor 12)
- Refresh token stored in httpOnly cookie with 7-day expiration
- Access token returned in response body (15-minute expiration)

---

### 3.2 POST /api/v1/auth/login

**Purpose:** Authenticate existing user and issue tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-v4-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `401`: Invalid credentials
- `429`: Too many failed login attempts (rate limit)
- `500`: Internal server error

**Security Notes:**
- Password compared using bcrypt.compare()
- Failed login attempts logged for security monitoring
- Refresh token set as httpOnly cookie (not in response body)

---

### 3.3 POST /api/v1/auth/refresh

**Purpose:** Issue new access token using refresh token.

**Request Headers:**
```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...
```

**Request Body:** None (refresh token read from httpOnly cookie)

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `401`: Invalid or expired refresh token
- `403`: Token revoked or user disabled
- `500`: Internal server error

**Side Effects:**
- New access token issued with 15-minute expiration
- Refresh token rotated (old token invalidated, new token issued in cookie)

---

### 3.4 POST /api/v1/auth/logout

**Purpose:** Invalidate user session and clear tokens.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401`: Unauthorized (no valid access token)
- `500`: Internal server error

**Side Effects:**
- Refresh token removed from database (invalidated)
- httpOnly cookie cleared (set to expire immediately)
- Access token remains valid until expiration (stateless JWT)

---

## 4. User Endpoints

### 4.1 GET /api/v1/users/me

**Purpose:** Retrieve authenticated user's profile.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Success Response (200 OK):**
```json
{
  "id": "uuid-v4-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "resumeUrl": "https://storage.example.com/resumes/uuid.pdf",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:22:00.000Z"
}
```

**Error Responses:**
- `401`: Unauthorized (invalid or expired token)
- `500`: Internal server error

---

### 4.2 PUT /api/v1/users/me

**Purpose:** Update authenticated user's profile.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Success Response (200 OK):**
```json
{
  "id": "uuid-v4-string",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "USER",
  "updatedAt": "2024-01-20T15:00:00.000Z"
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Unauthorized
- `500`: Internal server error

**Business Rules:**
- Email cannot be changed via this endpoint (requires separate verification flow)
- Password changes require separate endpoint with current password verification

---

### 4.3 POST /api/v1/users/me/resume

**Purpose:** Upload user's resume for AI parsing and interview customization.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data
```

**Request Body (form-data):**
```
file: [binary PDF/DOCX file, max 5MB]
```

**Success Response (201 Created):**
```json
{
  "resumeUrl": "https://storage.example.com/resumes/uuid.pdf",
  "parsedSkills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
  "uploadedAt": "2024-01-20T15:30:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid file type (only PDF/DOCX allowed)
- `413`: File too large (max 5MB)
- `401`: Unauthorized
- `500`: Internal server error

**Processing Flow:**
1. Validate file type and size
2. Upload to cloud storage (S3-compatible)
3. Extract text using PDF parser library
4. Call AI service to extract skills/experience
5. Store parsed data in user profile
6. Return URL and parsed metadata

---

## 5. Interview Endpoints

### 5.1 POST /api/v1/interviews

**Purpose:** Create a new interview session.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request Body:**
```json
{
  "type": "TECHNICAL",
  "jobTitle": "Frontend Developer",
  "difficulty": "INTERMEDIATE",
  "skills": ["React", "TypeScript", "Next.js"],
  "questionCount": 5
}
```

**Validation Rules:**
- `type`: Enum ["HR", "TECHNICAL", "PROJECT"]
- `jobTitle`: 3-100 chars
- `difficulty`: Enum ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
- `skills`: Array of 1-10 strings
- `questionCount`: Integer 3-15

**Success Response (201 Created):**
```json
{
  "id": "interview-uuid",
  "userId": "user-uuid",
  "type": "TECHNICAL",
  "jobTitle": "Frontend Developer",
  "difficulty": "INTERMEDIATE",
  "skills": ["React", "TypeScript", "Next.js"],
  "questionCount": 5,
  "status": "CREATED",
  "createdAt": "2024-01-20T16:00:00.000Z",
  "expiresAt": "2024-01-21T16:00:00.000Z"
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Unauthorized
- `429`: Rate limit exceeded (max 10 interviews per hour)
- `500`: Internal server error

**Side Effects:**
- Interview record created with status CREATED
- Expiration timestamp set to 24 hours from creation
- Questions NOT generated yet (lazy generation on start)

---

### 5.2 GET /api/v1/interviews

**Purpose:** List authenticated user's interviews with filtering and pagination.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Query Parameters:**
- `page`: Integer (default 1)
- `limit`: Integer 10-100 (default 20)
- `status`: Enum ["CREATED", "IN_PROGRESS", "COMPLETED", "ABANDONED", "EXPIRED"]
- `type`: Enum ["HR", "TECHNICAL", "PROJECT"]
- `sortBy`: Enum ["createdAt", "updatedAt"] (default "createdAt")
- `sortOrder`: Enum ["ASC", "DESC"] (default "DESC")

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "interview-uuid-1",
      "type": "TECHNICAL",
      "jobTitle": "Frontend Developer",
      "status": "COMPLETED",
      "questionCount": 5,
      "answeredCount": 5,
      "createdAt": "2024-01-20T16:00:00.000Z",
      "completedAt": "2024-01-20T16:45:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

---

### 5.3 GET /api/v1/interviews/:id

**Purpose:** Retrieve detailed interview information.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Success Response (200 OK):**
```json
{
  "id": "interview-uuid",
  "userId": "user-uuid",
  "type": "TECHNICAL",
  "jobTitle": "Frontend Developer",
  "difficulty": "INTERMEDIATE",
  "skills": ["React", "TypeScript", "Next.js"],
  "questionCount": 5,
  "answeredCount": 3,
  "status": "IN_PROGRESS",
  "createdAt": "2024-01-20T16:00:00.000Z",
  "startedAt": "2024-01-20T16:05:00.000Z",
  "expiresAt": "2024-01-21T16:00:00.000Z"
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden (interview belongs to different user, unless admin)
- `404`: Interview not found
- `500`: Internal server error

---

### 5.4 PUT /api/v1/interviews/:id/start

**Purpose:** Transition interview from CREATED to IN_PROGRESS and generate questions.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "id": "interview-uuid",
  "status": "IN_PROGRESS",
  "startedAt": "2024-01-20T16:05:00.000Z",
  "questions": [
    {
      "id": "question-uuid-1",
      "orderIndex": 0,
      "text": "What is the difference between useMemo and useCallback in React?",
      "topic": "React Hooks",
      "difficulty": "INTERMEDIATE"
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid state transition (already started)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Interview not found
- `410`: Interview expired
- `503`: AI service unavailable (question generation failed)
- `500`: Internal server error

**Processing Flow:**
1. Validate interview status is CREATED
2. Check expiration timestamp
3. Call AI service to generate questions
4. Store questions in database with order
5. Update status to IN_PROGRESS with startedAt timestamp
6. Return questions (but not answers/evaluation criteria)

**Rate Limiting:** 10 requests per minute (AI-heavy operation)

---

### 5.5 PUT /api/v1/interviews/:id/end

**Purpose:** Manually end interview and trigger report generation.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "id": "interview-uuid",
  "status": "COMPLETED",
  "completedAt": "2024-01-20T16:45:00.000Z",
  "answeredCount": 5,
  "reportUrl": "/api/v1/interviews/interview-uuid/report"
}
```

**Error Responses:**
- `400`: Invalid state transition
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Interview not found
- `500`: Internal server error

**Side Effects:**
- Status updated to COMPLETED
- completedAt timestamp recorded
- Report generation triggered asynchronously
- User can no longer submit answers

---

### 5.6 GET /api/v1/interviews/:id/questions

**Purpose:** Retrieve all questions for an interview (without answers).

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Success Response (200 OK):**
```json
{
  "interviewId": "interview-uuid",
  "questions": [
    {
      "id": "question-uuid-1",
      "orderIndex": 0,
      "text": "What is the difference between useMemo and useCallback?",
      "topic": "React Hooks",
      "difficulty": "INTERMEDIATE"
    },
    {
      "id": "question-uuid-2",
      "orderIndex": 1,
      "text": "Explain the concept of closures in JavaScript.",
      "topic": "JavaScript Fundamentals",
      "difficulty": "INTERMEDIATE"
    }
  ]
}
```

**Error Responses:**
- `400`: Interview not started (questions not generated yet)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Interview not found
- `500`: Internal server error

---

## 6. Answer Endpoints

### 6.1 POST /api/v1/interviews/:id/answers

**Purpose:** Submit answer to a question and receive AI evaluation with follow-up.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request Body:**
```json
{
  "questionId": "question-uuid-1",
  "answerText": "useMemo is used to memoize computed values, while useCallback memoizes function references. useMemo runs during render and returns a value, whereas useCallback returns a memoized function that can be passed as a prop to child components to prevent unnecessary re-renders."
}
```

**Validation Rules:**
- `questionId`: Must exist and belong to this interview
- `answerText`: 10-2000 chars, non-empty after trim

**Success Response (201 Created):**
```json
{
  "id": "answer-uuid",
  "questionId": "question-uuid-1",
  "answerText": "useMemo is used to memoize...",
  "evaluation": {
    "score": 8,
    "maxScore": 10,
    "feedback": "Good explanation of the core difference. You correctly identified that useMemo memoizes values while useCallback memoizes functions. Your mention of preventing re-renders is accurate. To improve: could mention dependency arrays and when to use each hook.",
    "strengths": ["Clear distinction between hooks", "Practical use case mentioned"],
    "improvements": ["Add details about dependency arrays", "Discuss performance implications"],
    "followUpQuestion": "Can you explain what happens if you omit the dependency array in useMemo?"
  },
  "submittedAt": "2024-01-20T16:15:00.000Z"
}
```

**Error Responses:**
- `400`: Validation failed (answer too short, question already answered)
- `401`: Unauthorized
- `403`: Forbidden (interview not in IN_PROGRESS state)
- `404`: Interview or question not found
- `409`: Answer already submitted for this question
- `503`: AI service unavailable
- `500`: Internal server error

**Processing Flow:**
1. Validate interview status is IN_PROGRESS
2. Validate question belongs to interview
3. Check answer not already submitted
4. Call AI service to evaluate answer
5. Store answer and evaluation in database
6. Return evaluation with follow-up question
7. Check if all questions answered → auto-transition to COMPLETED

**Rate Limiting:** 10 requests per minute (AI-heavy operation)

---

## 7. Report Endpoints

### 7.1 GET /api/v1/interviews/:id/report

**Purpose:** Retrieve comprehensive interview performance report.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Success Response (200 OK):**
```json
{
  "interviewId": "interview-uuid",
  "generatedAt": "2024-01-20T16:50:00.000Z",
  "summary": {
    "overallScore": 75,
    "maxScore": 100,
    "percentage": 75.0,
    "grade": "B",
    "totalQuestions": 5,
    "answeredQuestions": 5,
    "duration": 2700
  },
  "skillBreakdown": [
    {
      "skill": "React Hooks",
      "score": 80,
      "maxScore": 100,
      "questionsCount": 2
    },
    {
      "skill": "JavaScript Fundamentals",
      "score": 70,
      "maxScore": 100,
      "questionsCount": 3
    }
  ],
  "strengths": [
    "Strong understanding of React hooks and lifecycle",
    "Clear communication and structured answers"
  ],
  "improvements": [
    "Deepen knowledge of advanced JavaScript concepts",
    "Practice explaining complex topics more concisely"
  ],
  "detailedAnswers": [
    {
      "question": "What is the difference between useMemo and useCallback?",
      "answer": "useMemo is used to memoize...",
      "score": 8,
      "maxScore": 10,
      "feedback": "Good explanation of the core difference..."
    }
  ]
}
```

**Error Responses:**
- `400`: Interview not completed (report not available)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Interview or report not found
- `500`: Internal server error

**Report Generation:**
- Automatically triggered when interview status becomes COMPLETED
- Generated asynchronously by background job
- Calls AI service to summarize session performance
- Cached after generation (regeneration requires explicit request)

---

## 8. Admin Endpoints

### 8.1 GET /api/v1/admin/users

**Purpose:** List all users with filtering (admin only).

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Authorization:** Requires ADMIN role in JWT payload.

**Query Parameters:**
- `page`: Integer (default 1)
- `limit`: Integer 10-100 (default 20)
- `role`: Enum ["USER", "ADMIN"]
- `search`: String (searches email, firstName, lastName)

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "interviewCount": 3,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden (non-admin user)
- `500`: Internal server error

---

### 8.2 GET /api/v1/admin/interviews

**Purpose:** List all interviews across all users (admin only).

**Authorization:** Requires ADMIN role.

**Query Parameters:** Same as GET /api/v1/interviews, plus:
- `userId`: Filter by specific user UUID

**Success Response:** Similar structure to GET /api/v1/interviews

---

### 8.3 GET /api/v1/admin/stats

**Purpose:** Retrieve platform statistics dashboard data (admin only).

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Authorization:** Requires ADMIN role.

**Success Response (200 OK):**
```json
{
  "users": {
    "total": 150,
    "newThisWeek": 12,
    "newThisMonth": 45
  },
  "interviews": {
    "total": 450,
    "completed": 320,
    "inProgress": 15,
    "abandoned": 80,
    "expired": 35
  },
  "averageScores": {
    "hr": 72.5,
    "technical": 68.3,
    "project": 75.8
  },
  "popularSkills": [
    { "skill": "React", "count": 120 },
    { "skill": "JavaScript", "count": 110 },
    { "skill": "Node.js", "count": 95 }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Internal server error

---

## 9. Rate Limiting

### 9.1 Global Rate Limits

**Default Limit:** 100 requests per 15 minutes per IP address  
**Implementation:** NestJS throttler module with Redis backend  
**Headers Returned:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1705756800
```

**Exceeded Response (429 Too Many Requests):**
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Try again in 5 minutes.",
  "error": "Too Many Requests",
  "timestamp": "2024-01-20T17:00:00.000Z",
  "path": "/api/v1/interviews"
}
```

### 9.2 AI-Heavy Endpoint Limits

Stricter limits applied to endpoints that call AI service:
- **POST /api/v1/interviews (creation):** 10 per hour
- **PUT /api/v1/interviews/:id/start:** 10 per hour
- **POST /api/v1/interviews/:id/answers:** 10 per minute

Prevents abuse of expensive AI operations.

---

## 10. OpenAPI Documentation

### 10.1 Swagger UI

**Endpoint:** `GET /api/docs`  
**Description:** Interactive API documentation with try-it-out functionality

**Features:**
- Auto-generated from NestJS decorators (@ApiProperty, @ApiResponse, @ApiTags)
- JWT authentication testable via "Authorize" button
- Request/response examples for all endpoints
- Schema definitions for all DTOs

### 10.2 OpenAPI JSON

**Endpoint:** `GET /api/docs-json`  
**Description:** Raw OpenAPI 3.0 specification in JSON format

**Usage:**
- Import into Postman/Insomnia for API testing
- Generate TypeScript client types for frontend
- API contract testing with Pact or similar tools

### 10.3 Maintenance

- Swagger decorators mandatory for all controllers
- CI pipeline validates OpenAPI spec generation succeeds
- Breaking changes require version increment and documentation update

---

## 11. ASCII Endpoint Map

```
/api/v1
│
├─ /auth
│  ├─ POST   /register      (public)
│  ├─ POST   /login         (public)
│  ├─ POST   /refresh       (public, requires refresh token cookie)
│  └─ POST   /logout        (authenticated)
│
├─ /users
│  └─ /me
│     ├─ GET              (authenticated)
│     ├─ PUT              (authenticated)
│     └─ /resume
│        └─ POST          (authenticated)
│
├─ /interviews
│  ├─ POST                (authenticated) - create interview
│  ├─ GET                 (authenticated) - list user's interviews
│  └─ /:id
│     ├─ GET              (authenticated) - interview details
│     ├─ /start
│     │  └─ PUT           (authenticated, AI-heavy)
│     ├─ /end
│     │  └─ PUT           (authenticated)
│     ├─ /questions
│     │  └─ GET           (authenticated)
│     ├─ /answers
│     │  └─ POST          (authenticated, AI-heavy)
│     └─ /report
│        └─ GET           (authenticated)
│
└─ /admin
   ├─ /users
   │  └─ GET              (admin only)
   ├─ /interviews
   │  └─ GET              (admin only)
   └─ /stats
      └─ GET              (admin only)
```

---

## 12. Conclusion

This API architecture provides a robust, scalable foundation for the AI-Powered Mock Interview System. The RESTful design ensures predictability for frontend developers, while rate limiting and comprehensive error handling protect backend resources. OpenAPI documentation auto-generation reduces documentation drift and enables rapid client development.

Future enhancements may include GraphQL endpoint for flexible querying, WebSocket support for real-time interview sessions, and webhook notifications for interview completion.

---

**End of Document**
