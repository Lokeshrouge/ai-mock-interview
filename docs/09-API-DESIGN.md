# API Design

## API Base URL
- **Development**: `http://localhost:3001/api/v1`
- **Production**: `https://api.mockinterview.com/api/v1`

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

---

## API Endpoints

### 1. Authentication (`/auth`)

#### POST `/auth/register`
**Purpose**: Register new student account  
**Auth**: None  
**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```
**Response** (201):
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "student@example.com",
    "role": "STUDENT",
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```
**Errors**: 400 (validation), 409 (email exists)

---

#### POST `/auth/login`
**Auth**: None  
**Request**:
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```
**Response** (200):
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "student@example.com",
    "role": "STUDENT",
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```
**Errors**: 401 (invalid credentials), 423 (account locked)

---

#### POST `/auth/refresh`
**Auth**: Refresh Token  
**Request**:
```json
{
  "refreshToken": "refresh_token"
}
```
**Response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

---

### 2. Student Profile (`/profile`)

#### GET `/profile`
**Auth**: Student  
**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "student@example.com",
    "phone": "+1234567890",
    "education": {...},
    "skills": ["JavaScript", "Python"],
    "bio": "Computer Science student",
    "profilePictureUrl": "https://...",
    "linkedinUrl": "https://linkedin.com/in/...",
    "githubUrl": "https://github.com/..."
  }
}
```

---

#### PUT `/profile`
**Auth**: Student  
**Request**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "skills": ["JavaScript", "React", "Node.js"],
  "bio": "Full-stack developer",
  "linkedinUrl": "https://linkedin.com/in/johndoe"
}
```
**Response** (200): Updated profile object

---

### 3. Resumes (`/resumes`)

#### POST `/resumes`
**Auth**: Student  
**Content-Type**: `multipart/form-data`  
**Request**:
```
file: (PDF/DOCX file)
```
**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileName": "resume.pdf",
    "fileUrl": "https://storage.../resume.pdf",
    "fileType": "pdf",
    "fileSize": 245678,
    "parsedData": {
      "personal": {...},
      "education": [...],
      "experience": [...],
      "projects": [...],
      "skills": {...}
    },
    "uploadedAt": "2024-10-01T10:00:00Z"
  }
}
```
**Errors**: 400 (invalid file), 413 (file too large)

---

#### GET `/resumes`
**Auth**: Student  
**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fileName": "resume_v1.pdf",
      "fileUrl": "https://...",
      "isActive": true,
      "uploadedAt": "2024-10-01T10:00:00Z"
    }
  ]
}
```

---

#### GET `/resumes/:id`
**Auth**: Student (own resumes only)  
**Response** (200): Single resume with full parsed data

---

#### DELETE `/resumes/:id`
**Auth**: Student (own resumes only)  
**Response** (204): No content

---

#### PATCH `/resumes/:id/activate`
**Auth**: Student  
**Purpose**: Set resume as active for interviews  
**Response** (200): Updated resume

---

### 4. Job Roles (`/job-roles`)

#### GET `/job-roles`
**Auth**: Student  
**Query Params**: 
- `category` (optional): Filter by category
- `search` (optional): Search in title
**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Software Developer",
      "category": "Engineering",
      "description": "Develop web applications...",
      "requiredSkills": ["JavaScript", "React", "Node.js"]
    }
  ]
}
```

---

#### GET `/job-roles/:id`
**Auth**: Student  
**Response** (200): Single job role details

---

### 5. Interviews (`/interviews`)

#### POST `/interviews`
**Auth**: Student  
**Purpose**: Create new interview configuration  
**Request**:
```json
{
  "resumeId": "uuid",
  "jobRoleId": "uuid",
  "interviewType": "TECHNICAL",
  "difficulty": "MEDIUM"
}
```
**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CREATED",
    "jobRole": {...},
    "interviewType": "TECHNICAL",
    "difficulty": "MEDIUM",
    "createdAt": "2024-10-01T10:00:00Z"
  }
}
```

---

#### POST `/interviews/:id/start`
**Auth**: Student (own interviews)  
**Purpose**: Start interview and generate questions  
**Response** (200):
```json
{
  "success": true,
  "data": {
    "interviewId": "uuid",
    "status": "IN_PROGRESS",
    "totalQuestions": 7,
    "currentQuestion": {
      "id": "uuid",
      "questionNumber": 1,
      "questionText": "Tell me about yourself...",
      "category": "HR"
    }
  }
}
```
**Note**: This triggers AI question generation (may take 5-10s)

---

#### GET `/interviews/:id`
**Auth**: Student (own interviews)  
**Purpose**: Get interview details and current state  
**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "IN_PROGRESS",
    "jobRole": {...},
    "interviewType": "TECHNICAL",
    "difficulty": "MEDIUM",
    "totalQuestions": 7,
    "answeredQuestions": 3,
    "overallScore": null,
    "startedAt": "2024-10-01T10:05:00Z",
    "currentQuestionNumber": 4
  }
}
```

---

#### GET `/interviews/:id/questions`
**Auth**: Student (own interviews)  
**Purpose**: Get all questions for interview  
**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "questionNumber": 1,
      "questionText": "What is polymorphism?",
      "category": "OOP",
      "isAnswered": true
    },
    {
      "id": "uuid",
      "questionNumber": 2,
      "questionText": "Explain async/await...",
      "category": "JavaScript",
      "isAnswered": false
    }
  ]
}
```

---

#### POST `/interviews/:id/answers`
**Auth**: Student (own interviews)  
**Purpose**: Submit answer to current question  
**Request**:
```json
{
  "questionId": "uuid",
  "answerText": "Polymorphism is the ability of objects..."
}
```
**Response** (201):
```json
{
  "success": true,
  "data": {
    "answerId": "uuid",
    "questionId": "uuid",
    "evaluation": {
      "score": 85,
      "feedback": "Good explanation covering...",
      "strengths": ["Clear definition", "Good example"],
      "weaknesses": ["Could mention runtime polymorphism"]
    },
    "nextQuestion": {
      "id": "uuid",
      "questionNumber": 3,
      "questionText": "Next question..."
    }
  }
}
```
**Note**: Triggers AI evaluation (may take 5-10s)

---

#### POST `/interviews/:id/complete`
**Auth**: Student (own interviews)  
**Purpose**: Mark interview as complete  
**Response** (200):
```json
{
  "success": true,
  "data": {
    "interviewId": "uuid",
    "status": "COMPLETED",
    "overallScore": 78.5,
    "completedAt": "2024-10-01T11:00:00Z"
  }
}
```

---

#### GET `/interviews/:id/report`
**Auth**: Student (own interviews)  
**Purpose**: Get comprehensive interview report  
**Response** (200):
```json
{
  "success": true,
  "data": {
    "interview": {...},
    "overallScore": 78.5,
    "scoreDistribution": {
      "0-40": 0,
      "41-60": 1,
      "61-75": 2,
      "76-85": 3,
      "86-100": 1
    },
    "questionResults": [
      {
        "question": "What is polymorphism?",
        "answer": "Polymorphism is...",
        "score": 85,
        "feedback": "Good explanation...",
        "strengths": [...],
        "weaknesses": [...]
      }
    ],
    "recommendations": {
      "strengths": [
        "Strong OOP concepts",
        "Clear communication"
      ],
      "weaknesses": [
        "Limited system design knowledge",
        "Need more practice with algorithms"
      ],
      "topicsToImprove": [
        "System Design",
        "Data Structures",
        "Algorithm Complexity"
      ],
      "overallFeedback": "You demonstrated solid..."
    }
  }
}
```

---

#### GET `/interviews`
**Auth**: Student  
**Purpose**: Get all user's interviews (history)  
**Query Params**:
- `status` (optional): Filter by status
- `jobRoleId` (optional): Filter by role
- `page` (default: 1)
- `limit` (default: 10)
**Response** (200):
```json
{
  "success": true,
  "data": {
    "interviews": [
      {
        "id": "uuid",
        "jobRole": "Software Developer",
        "interviewType": "TECHNICAL",
        "difficulty": "MEDIUM",
        "status": "EVALUATED",
        "overallScore": 78.5,
        "createdAt": "2024-10-01T10:00:00Z",
        "completedAt": "2024-10-01T11:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

### 6. Admin - Users (`/admin/users`)

#### GET `/admin/users`
**Auth**: Admin  
**Query Params**: `search`, `page`, `limit`  
**Response** (200):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "student@example.com",
        "role": "STUDENT",
        "isActive": true,
        "createdAt": "2024-09-01T10:00:00Z",
        "interviewCount": 12,
        "avgScore": 75.5
      }
    ],
    "pagination": {...}
  }
}
```

---

#### GET `/admin/users/:id`
**Auth**: Admin  
**Response** (200): Full user details including profile

---

#### PATCH `/admin/users/:id/deactivate`
**Auth**: Admin  
**Response** (200): Updated user

---

### 7. Admin - Job Roles (`/admin/job-roles`)

#### POST `/admin/job-roles`
**Auth**: Admin  
**Request**:
```json
{
  "title": "Data Scientist",
  "category": "Data Science",
  "description": "Analyze and interpret data...",
  "requiredSkills": ["Python", "Machine Learning", "Statistics"],
  "topics": ["Statistics", "ML Algorithms", "Data Visualization"]
}
```
**Response** (201): Created job role

---

#### PUT `/admin/job-roles/:id`
**Auth**: Admin  
**Request**: Same as POST  
**Response** (200): Updated job role

---

#### DELETE `/admin/job-roles/:id`
**Auth**: Admin  
**Response** (204): No content

---

### 8. Admin - Dashboard (`/admin/dashboard`)

#### GET `/admin/dashboard/stats`
**Auth**: Admin  
**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeUsers": 1180,
    "totalInterviews": 5680,
    "avgScore": 72.3,
    "interviewsToday": 45,
    "popularJobRoles": [
      {"role": "Software Developer", "count": 450},
      {"role": "Data Analyst", "count": 320}
    ],
    "recentInterviews": [...]
  }
}
```

---

## Error Response Format

All errors follow consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request (validation)
- **401**: Unauthorized (auth required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **413**: Payload Too Large
- **422**: Unprocessable Entity
- **429**: Too Many Requests
- **500**: Internal Server Error
- **503**: Service Unavailable

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_RESOURCE`: Resource already exists
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: Unsupported file type
- `AI_SERVICE_ERROR`: AI service unavailable
- `DATABASE_ERROR`: Database operation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

## API Validation Rules

### Email
- Valid email format
- Max 255 characters
- Unique in database

### Password
- Min 8 characters
- Max 128 characters
- Must contain: uppercase, lowercase, number, special char

### Resume File
- Types: PDF, DOCX only
- Max size: 5MB
- Required for upload

### Answer Text
- Min 50 characters
- Max 5000 characters
- Required, non-empty

---

## Rate Limiting

- **Authentication**: 5 requests/minute per IP
- **Resume Upload**: 10 uploads/hour per user
- **Interview Start**: 20 interviews/day per user
- **General APIs**: 100 requests/minute per user

---

## API Versioning

- Current: `/api/v1/`
- Future versions will not break v1
- Deprecation notice: 6 months before removal

---

## Security Headers

All responses include:
```
Content-Type: application/json
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```
