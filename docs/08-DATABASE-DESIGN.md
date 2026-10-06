# Database Design

## Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    users    │────1:1──│student_      │────1:N──│  resumes    │
│             │         │  profiles    │         │             │
└──────┬──────┘         └──────────────┘         └──────┬──────┘
       │                                                 │
       │1                                                │
       │                                                 │
       │N                                                │1
       │                                                 │
┌──────┴──────┐         ┌──────────────┐               │
│ interviews  │────N:1──│  job_roles   │               │
│             │         │              │               │
└──────┬──────┘         └──────────────┘               │
       │                                                │
       │1                                               │N
       │                                                │
       │N                                        ┌──────┴──────┐
       │                                         │   resume_   │
┌──────┴──────┐         ┌──────────────┐        │  sections   │
│interview_   │────1:N──│  interview_  │        │             │
│ questions   │         │   answers    │        └─────────────┘
│             │         │              │
└──────┬──────┘         └──────┬───────┘
       │                       │
       │                       │1
       │                       │
       │                       │N
       │                ┌──────┴───────┐
       │                │ evaluations  │
       │                │              │
       │                └──────────────┘
       │
       │N
       │
┌──────┴──────┐
│recommend-   │
│  ations     │
└─────────────┘
```

---

## Tables

### 1. users
**Purpose**: Store authentication and basic user information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (login) |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| role | ENUM('STUDENT','ADMIN') | NOT NULL, DEFAULT 'STUDENT' | User role |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| failed_login_attempts | INTEGER | DEFAULT 0 | Login attempts counter |
| locked_until | TIMESTAMP | NULL | Account lock expiry |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_users_email` on (email)
- `idx_users_role` on (role)

---

### 2. student_profiles
**Purpose**: Store detailed student information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Profile identifier |
| user_id | UUID | FOREIGN KEY → users(id), UNIQUE, NOT NULL | Reference to user |
| first_name | VARCHAR(100) | NOT NULL | Student first name |
| last_name | VARCHAR(100) | NOT NULL | Student last name |
| phone | VARCHAR(20) | NULL | Contact number |
| education | JSONB | NULL | Education details |
| skills | TEXT[] | NULL | Array of skills |
| bio | TEXT | NULL | Student bio |
| profile_picture_url | VARCHAR(500) | NULL | S3/storage URL |
| linkedin_url | VARCHAR(255) | NULL | LinkedIn profile |
| github_url | VARCHAR(255) | NULL | GitHub profile |
| created_at | TIMESTAMP | DEFAULT NOW() | Profile creation |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_profiles_user_id` on (user_id)

**Relationships:**
- user_id → users.id (CASCADE DELETE)

---

### 3. resumes
**Purpose**: Store uploaded resume files and extracted data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Resume identifier |
| user_id | UUID | FOREIGN KEY → users(id), NOT NULL | Resume owner |
| file_name | VARCHAR(255) | NOT NULL | Original filename |
| file_url | VARCHAR(500) | NOT NULL | Storage URL |
| file_type | VARCHAR(10) | NOT NULL | pdf/docx |
| file_size | INTEGER | NOT NULL | Size in bytes |
| extracted_text | TEXT | NULL | Full resume text |
| parsed_data | JSONB | NULL | Structured data |
| is_active | BOOLEAN | DEFAULT TRUE | Active resume flag |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

**Indexes:**
- `idx_resumes_user_id` on (user_id)
- `idx_resumes_is_active` on (user_id, is_active)

**Relationships:**
- user_id → users.id (CASCADE DELETE)

**JSONB Structure (parsed_data):**
```json
{
  "personal": {"name": "", "email": "", "phone": ""},
  "education": [{"degree": "", "institution": "", "year": ""}],
  "experience": [{"title": "", "company": "", "duration": "", "description": ""}],
  "projects": [{"title": "", "description": "", "technologies": []}],
  "skills": {"technical": [], "soft": []},
  "certifications": []
}
```

---

### 4. job_roles
**Purpose**: Define available job positions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Role identifier |
| title | VARCHAR(200) | UNIQUE, NOT NULL | Role title |
| category | VARCHAR(100) | NOT NULL | Engineering/Marketing/etc |
| description | TEXT | NOT NULL | Role description |
| required_skills | TEXT[] | NULL | Expected skills |
| topics | JSONB | NULL | Interview topics |
| is_active | BOOLEAN | DEFAULT TRUE | Visible to students |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_job_roles_category` on (category)
- `idx_job_roles_active` on (is_active)

---

### 5. interviews
**Purpose**: Store interview sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Interview identifier |
| user_id | UUID | FOREIGN KEY → users(id), NOT NULL | Student |
| resume_id | UUID | FOREIGN KEY → resumes(id), NULL | Resume used |
| job_role_id | UUID | FOREIGN KEY → job_roles(id), NOT NULL | Target role |
| interview_type | ENUM('HR','TECHNICAL','PROJECT') | NOT NULL | Interview type |
| difficulty | ENUM('EASY','MEDIUM','HARD') | NOT NULL | Difficulty level |
| status | ENUM('CREATED','IN_PROGRESS','PAUSED','COMPLETED','EVALUATED') | NOT NULL | Current state |
| overall_score | DECIMAL(5,2) | NULL | Average score |
| total_questions | INTEGER | DEFAULT 0 | Question count |
| answered_questions | INTEGER | DEFAULT 0 | Answered count |
| started_at | TIMESTAMP | NULL | Start time |
| completed_at | TIMESTAMP | NULL | Completion time |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation date |

**Indexes:**
- `idx_interviews_user_id` on (user_id)
- `idx_interviews_status` on (status)
- `idx_interviews_created_at` on (created_at DESC)

**Relationships:**
- user_id → users.id (CASCADE DELETE)
- resume_id → resumes.id (SET NULL)
- job_role_id → job_roles.id (RESTRICT)

---

### 6. interview_questions
**Purpose**: Store generated questions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Question identifier |
| interview_id | UUID | FOREIGN KEY → interviews(id), NOT NULL | Parent interview |
| question_number | INTEGER | NOT NULL | Sequence (1,2,3...) |
| question_text | TEXT | NOT NULL | Question content |
| question_category | VARCHAR(100) | NULL | Category/topic |
| expected_points | TEXT[] | NULL | Key points to cover |
| generated_at | TIMESTAMP | DEFAULT NOW() | Generation time |

**Indexes:**
- `idx_questions_interview_id` on (interview_id)
- UNIQUE(interview_id, question_number)

**Relationships:**
- interview_id → interviews.id (CASCADE DELETE)

---

### 7. interview_answers
**Purpose**: Store student answers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Answer identifier |
| interview_id | UUID | FOREIGN KEY → interviews(id), NOT NULL | Interview |
| question_id | UUID | FOREIGN KEY → interview_questions(id), NOT NULL | Question answered |
| answer_text | TEXT | NOT NULL | Student's answer |
| time_taken_seconds | INTEGER | NULL | Time to answer |
| submitted_at | TIMESTAMP | DEFAULT NOW() | Submission time |

**Indexes:**
- `idx_answers_interview_id` on (interview_id)
- `idx_answers_question_id` on (question_id)
- UNIQUE(question_id) -- One answer per question

**Relationships:**
- interview_id → interviews.id (CASCADE DELETE)
- question_id → interview_questions.id (CASCADE DELETE)

---

### 8. evaluations
**Purpose**: Store AI evaluations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Evaluation identifier |
| answer_id | UUID | FOREIGN KEY → interview_answers(id), UNIQUE, NOT NULL | Answer evaluated |
| score | DECIMAL(5,2) | NOT NULL, CHECK (score >= 0 AND score <= 100) | Score 0-100 |
| feedback | TEXT | NOT NULL | Detailed feedback |
| strengths | TEXT[] | NULL | Identified strengths |
| weaknesses | TEXT[] | NULL | Identified gaps |
| relevance_score | DECIMAL(3,2) | NULL | Relevance 0-1 |
| accuracy_score | DECIMAL(3,2) | NULL | Accuracy 0-1 |
| completeness_score | DECIMAL(3,2) | NULL | Completeness 0-1 |
| clarity_score | DECIMAL(3,2) | NULL | Clarity 0-1 |
| evaluated_at | TIMESTAMP | DEFAULT NOW() | Evaluation time |

**Indexes:**
- `idx_evaluations_answer_id` on (answer_id)
- `idx_evaluations_score` on (score)

**Relationships:**
- answer_id → interview_answers.id (CASCADE DELETE)

---

### 9. recommendations
**Purpose**: Store improvement recommendations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Recommendation identifier |
| interview_id | UUID | FOREIGN KEY → interviews(id), NOT NULL | Interview |
| strengths | JSONB | NOT NULL | Key strengths |
| weaknesses | JSONB | NOT NULL | Key weaknesses |
| topics_to_improve | TEXT[] | NOT NULL | Study topics |
| recommended_resources | JSONB | NULL | Learning resources |
| overall_feedback | TEXT | NOT NULL | Summary feedback |
| created_at | TIMESTAMP | DEFAULT NOW() | Generation time |

**Indexes:**
- `idx_recommendations_interview_id` on (interview_id)

**Relationships:**
- interview_id → interviews.id (CASCADE DELETE)

**JSONB Structure:**
```json
{
  "strengths": [
    {"area": "Technical Knowledge", "details": "Strong OOP concepts"},
    {"area": "Communication", "details": "Clear explanations"}
  ],
  "weaknesses": [
    {"area": "System Design", "details": "Limited scalability awareness"}
  ],
  "resources": [
    {"topic": "System Design", "url": "...", "type": "article"}
  ]
}
```

---

## Database Relationships

### One-to-One
- users ↔ student_profiles (One user has one profile)

### One-to-Many
- users → resumes (One user, many resumes)
- users → interviews (One user, many interviews)
- job_roles → interviews (One role, many interviews)
- resumes → interviews (One resume used in many interviews)
- interviews → interview_questions (One interview, many questions)
- interviews → interview_answers (One interview, many answers)
- interviews → recommendations (One interview, one recommendation set)
- interview_questions → interview_answers (One question, one answer)
- interview_answers → evaluations (One answer, one evaluation)

---

## Constraints & Business Rules

1. **Email Uniqueness**: No duplicate emails in users table
2. **Active Resume**: Only one resume marked is_active per user
3. **Answer Uniqueness**: One answer per question per interview
4. **Evaluation Uniqueness**: One evaluation per answer
5. **Score Range**: All scores between 0-100
6. **Status Progression**: Interview status follows state machine
7. **Cascade Deletes**: Deleting user deletes all related data
8. **Soft Deletes**: Use is_active flags where applicable

---

## Indexing Strategy

**Purpose**: Optimize query performance

### Primary Indexes (Performance Critical)
- All foreign keys indexed
- `users.email` (login queries)
- `interviews.user_id + created_at` (dashboard queries)
- `interviews.status` (active interview filtering)

### Composite Indexes
- `(user_id, is_active)` on resumes (fetch active resume)
- `(interview_id, question_number)` on questions (ordered questions)

### JSONB Indexes (if needed)
- GIN index on `parsed_data` for resume search
- GIN index on `recommendations` for topic filtering

---

## Data Types Rationale

- **UUID**: Better for distributed systems, no auto-increment gaps
- **ENUM**: Type-safe for fixed value sets
- **JSONB**: Flexible for varying resume structures
- **TEXT[]**: PostgreSQL native array for lists
- **DECIMAL**: Precise scoring (no floating-point errors)
- **TIMESTAMP**: Consistent timezone handling

---

## Sample Queries

### Fetch Student Dashboard
```sql
SELECT 
  u.email,
  p.first_name, p.last_name,
  COUNT(i.id) as total_interviews,
  AVG(i.overall_score) as avg_score
FROM users u
JOIN student_profiles p ON u.id = p.user_id
LEFT JOIN interviews i ON u.id = i.user_id
WHERE u.id = $1 AND i.status = 'EVALUATED'
GROUP BY u.id, p.id;
```

### Fetch Interview Details
```sql
SELECT 
  i.*,
  jr.title as job_role_title,
  COUNT(q.id) as total_questions,
  COUNT(a.id) as answered_questions
FROM interviews i
JOIN job_roles jr ON i.job_role_id = jr.id
LEFT JOIN interview_questions q ON i.id = q.interview_id
LEFT JOIN interview_answers a ON q.id = a.question_id
WHERE i.id = $1
GROUP BY i.id, jr.id;
```

---

## Migration Strategy

1. Create base tables (users, student_profiles)
2. Create domain tables (job_roles, resumes)
3. Create interview tables (interviews, questions, answers)
4. Create evaluation tables (evaluations, recommendations)
5. Add indexes
6. Add seed data (admin user, sample job roles)

---

## Backup & Maintenance

- **Daily backups** of entire database
- **Point-in-time recovery** enabled
- **Vacuum** weekly for performance
- **Analyze** after bulk imports
- **Archive old interviews** after 2 years
