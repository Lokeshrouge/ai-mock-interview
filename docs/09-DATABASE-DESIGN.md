# Database Design

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Project:** AI-Powered Mock Interview System

---

## 1. Introduction

This document specifies the database design for the AI-Powered Mock Interview System. The database uses PostgreSQL as the relational database management system, chosen for its robustness, ACID compliance, support for complex queries, and excellent JSON handling capabilities. The design follows normalization principles while maintaining performance through strategic denormalization where appropriate.

---

## 2. Database Technology

**RDBMS:** PostgreSQL 15+

**Key PostgreSQL Features Utilized:**
- **UUID Primary Keys:** Universally unique identifiers for distributed systems
- **JSONB Data Type:** Flexible storage for semi-structured data (metadata, AI responses)
- **Full-Text Search:** Built-in text search capabilities for resume content
- **Enum Types:** Custom enumerated types for interview_type, difficulty, session_status
- **Triggers:** Automated timestamp management, cascading soft deletes
- **Indexes:** B-tree, GiST for full-text search, partial indexes for soft deletes
- **Foreign Key Constraints:** Referential integrity enforcement

**Connection via TypeORM:**
- Object-Relational Mapping for Node.js/TypeScript
- Migration-based schema versioning
- Repository pattern for data access
- Query builder for complex queries

---

## 3. Database Schema Overview

The database consists of 8 primary tables organized around the core entities:

1. **users** - Authentication and user account data
2. **user_profiles** - Extended user profile information
3. **resumes** - Resume file metadata and extracted text
4. **interview_sessions** - Interview session configuration and state
5. **interview_questions** - AI-generated questions per session
6. **interview_answers** - User responses with evaluation scores
7. **session_reports** - AI-generated session summaries and recommendations
8. **admin_logs** - Audit trail for administrative actions

---

## 4. Detailed Table Specifications

### 4.1 Table: `users`

Stores user authentication credentials and basic account information.

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    full_name           VARCHAR(255) NOT NULL,
    role                VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at   TIMESTAMP WITH TIME ZONE,
    last_login_at       TIMESTAMP WITH TIME ZONE,
    refresh_token       VARCHAR(500),
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    account_status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    suspended_reason    TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT users_role_check CHECK (role IN ('STUDENT', 'ADMIN')),
    CONSTRAINT users_status_check CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'DELETED'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
```

**Column Descriptions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier for user |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address (login) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hash of password (work factor 10) |
| full_name | VARCHAR(255) | NOT NULL | User's full display name |
| role | VARCHAR(20) | NOT NULL | User role: STUDENT or ADMIN |
| email_verified | BOOLEAN | NOT NULL | Whether email has been verified |
| email_verified_at | TIMESTAMP | NULL | Timestamp when email was verified |
| last_login_at | TIMESTAMP | NULL | Most recent successful login |
| refresh_token | VARCHAR(500) | NULL | Current refresh token (hashed) |
| refresh_token_expires_at | TIMESTAMP | NULL | Refresh token expiration time |
| account_status | VARCHAR(20) | NOT NULL | ACTIVE, SUSPENDED, DELETED |
| suspended_reason | TEXT | NULL | Admin-provided suspension reason |
| created_at | TIMESTAMP | NOT NULL | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

---

### 4.2 Table: `user_profiles`

Stores extended user profile information separate from authentication data.

```sql
CREATE TABLE user_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE,
    phone_number        VARCHAR(20),
    education_level     VARCHAR(50),
    education_institution VARCHAR(255),
    education_major     VARCHAR(100),
    graduation_year     INTEGER,
    employment_status   VARCHAR(50),
    current_company     VARCHAR(255),
    current_position    VARCHAR(100),
    skill_tags          TEXT[],
    profile_picture_url VARCHAR(500),
    bio                 TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT user_profiles_employment_check CHECK (
        employment_status IN ('STUDENT', 'EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED')
    )
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_skill_tags ON user_profiles USING GIN(skill_tags);
```

**Column Descriptions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK, UNIQUE | Reference to users table |
| phone_number | VARCHAR(20) | NULL | User's phone number |
| education_level | VARCHAR(50) | NULL | Degree level (Bachelor's, Master's, etc.) |
| education_institution | VARCHAR(255) | NULL | University/college name |
| education_major | VARCHAR(100) | NULL | Field of study |
| graduation_year | INTEGER | NULL | Expected or actual graduation year |
| employment_status | VARCHAR(50) | NULL | STUDENT, EMPLOYED, UNEMPLOYED, SELF_EMPLOYED |
| current_company | VARCHAR(255) | NULL | Current employer name |
| current_position | VARCHAR(100) | NULL | Current job title |
| skill_tags | TEXT[] | NULL | Array of skill keywords |
| profile_picture_url | VARCHAR(500) | NULL | URL to profile picture |
| bio | TEXT | NULL | User biography/summary |
| created_at | TIMESTAMP | NOT NULL | Profile creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

---

### 4.3 Table: `resumes`

Stores resume file metadata and extracted text content.

```sql
CREATE TABLE resumes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    file_name           VARCHAR(255) NOT NULL,
    file_path           VARCHAR(500) NOT NULL,
    file_size_bytes     INTEGER NOT NULL,
    file_type           VARCHAR(50) NOT NULL,
    extracted_text      TEXT,
    extraction_status   VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    extraction_error    TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT FALSE,
    metadata            JSONB,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT resumes_file_type_check CHECK (file_type IN ('PDF', 'DOCX')),
    CONSTRAINT resumes_extraction_status_check CHECK (
        extraction_status IN ('PENDING', 'COMPLETED', 'FAILED')
    )
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_is_active ON resumes(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_resumes_extracted_text_fts ON resumes USING GIN(to_tsvector('english', extracted_text));
```

**Column Descriptions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK | Reference to users table |
| file_name | VARCHAR(255) | NOT NULL | Original uploaded file name |
| file_path | VARCHAR(500) | NOT NULL | Storage path on server/S3 |
| file_size_bytes | INTEGER | NOT NULL | File size in bytes |
| file_type | VARCHAR(50) | NOT NULL | PDF or DOCX |
| extracted_text | TEXT | NULL | Extracted text content from resume |
| extraction_status | VARCHAR(20) | NOT NULL | PENDING, COMPLETED, FAILED |
| extraction_error | TEXT | NULL | Error message if extraction failed |
| is_active | BOOLEAN | NOT NULL | Whether this is the user's active resume |
| metadata | JSONB | NULL | Additional metadata (page count, etc.) |
| created_at | TIMESTAMP | NOT NULL | Upload timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Business Rule:** Only one resume per user can have `is_active = TRUE` at a time. Enforced at application level with transaction.

---

### 4.4 Table: `interview_sessions`

Stores interview session configuration, state, and lifecycle timestamps.

```sql
CREATE TYPE interview_type AS ENUM ('HR', 'TECHNICAL', 'PROJECT');
CREATE TYPE difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE session_status AS ENUM ('CREATED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABANDONED');

CREATE TABLE interview_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    resume_id           UUID,
    interview_type      interview_type NOT NULL,
    difficulty          difficulty NOT NULL,
    duration_minutes    INTEGER NOT NULL,
    focus_areas         TEXT[],
    status              session_status NOT NULL DEFAULT 'CREATED',
    started_at          TIMESTAMP WITH TIME ZONE,
    paused_at           TIMESTAMP WITH TIME ZONE,
    resumed_at          TIMESTAMP WITH TIME ZONE,
    completed_at        TIMESTAMP WITH TIME ZONE,
    time_elapsed_seconds INTEGER DEFAULT 0,
    questions_count     INTEGER DEFAULT 0,
    answers_count       INTEGER DEFAULT 0,
    metadata            JSONB,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_interview_sessions_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_sessions_resume FOREIGN KEY (resume_id) 
        REFERENCES resumes(id) ON DELETE SET NULL,
    CONSTRAINT interview_sessions_duration_check CHECK (duration_minutes IN (15, 30, 45, 60))
);

CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX idx_interview_sessions_created_at ON interview_sessions(created_at DESC);
CREATE INDEX idx_interview_sessions_deleted_at ON interview_sessions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_interview_sessions_user_status ON interview_sessions(user_id, status);
```

**Column Descriptions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK | Reference to users table |
| resume_id | UUID | FK | Reference to resumes table (optional) |
| interview_type | ENUM | NOT NULL | HR, TECHNICAL, PROJECT |
| difficulty | ENUM | NOT NULL | EASY, MEDIUM, HARD |
| duration_minutes | INTEGER | NOT NULL | Session duration: 15, 30, 45, or 60 |
| focus_areas | TEXT[] | NULL | Optional focus topics |
| status | ENUM | NOT NULL | Session lifecycle status |
| started_at | TIMESTAMP | NULL | When session started |
| paused_at | TIMESTAMP | NULL | When session was paused |
| resumed_at | TIMESTAMP | NULL | When paused session resumed |
| completed_at | TIMESTAMP | NULL | When session completed |
| time_elapsed_seconds | INTEGER | NULL | Total time spent (excludes paused time) |
| questions_count | INTEGER | NULL | Total questions asked |
| answers_count | INTEGER | NULL | Total answers submitted |
| metadata | JSONB | NULL | Additional session metadata |
| created_at | TIMESTAMP | NOT NULL | Session creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

---

### 4.5 Table: `interview_questions`

Stores AI-generated questions for each interview session.

```sql
CREATE TABLE interview_questions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID NOT NULL,
    question_number     INTEGER NOT NULL,
    question_text       TEXT NOT NULL,
    focus_area          VARCHAR(100),
    expected_answer_length VARCHAR(20),
    generated_by_ai     BOOLEAN NOT NULL DEFAULT TRUE,
    ai_generation_metadata JSONB,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_interview_questions_session FOREIGN KEY (session_id) 
        REFERENCES interview_sessions(id) ON DELETE CASCADE,
    CONSTRAINT interview_questions_unique_number UNIQUE (session_id, question_number)
);

CREATE INDEX idx_interview_questions_session_id ON interview_questions(session_id);
CREATE INDEX idx_interview_questions_session_number ON interview_questions(session_id, question_number);
```

**Column Descriptions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| session_id | UUID | FK | Reference to interview_sessions table |
| question_number | INTEGER | NOT NULL | Sequential question number (1, 2, 3...) |
| question_text | TEXT | NOT NULL | The actual question content |
| focus_area | VARCHAR(100) | NULL | Topic/category of question |
| expected_answer_length | VARCHAR(20) | NULL | SHORT, MEDIUM, LONG |
| generated_by_ai | BOOLEAN | NOT NULL | True if AI-generated, false if manual |
| ai_generation_metadata | JSONB | NULL | AI model, tokens used, generation time |
| created_at | TIMESTAMP | NOT NULL | Question creation timestamp |

---

### 4.6 Table: `interview_answers`

Stores user answers to interview questions along with AI evaluation results.

```sql
CREATE TABLE interview_answers (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id             UUID NOT NULL UNIQUE,
    session_id              UUID NOT NULL,
    answer_text             TEXT NOT NULL,
    answer_length_chars     INTEGER NOT NULL,
    time_taken_seconds      INTEGER,
    overall_score           INTEGER,
    completeness_score      INTEGER,
    accuracy_score          INTEGER,
    clarity_score           INTEGER,
    depth_score             INTEGER,
    feedback_text           TEXT,
    evaluated_by_ai         BOOLEAN DEFAULT TRUE,
    ai_evaluation_metadata  JSONB,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    evaluated_at            TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_interview_answers_question FOREIGN KEY (question_id) 
        REFERENCES interview_questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_answers_session FOREIGN KEY (session_id) 
        REFERENCES interview_sessions(id) ON DELETE CASCADE,
    CONSTRAINT interview_answers_score_range CHECK (
        overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100)
    ),
    CONSTRAINT interview_answers_dimension_score_range CHECK (
        (completeness_score IS NULL OR (completeness_score >= 0 AND completeness_score <= 25)) AND
        (accuracy_score IS NULL OR (accuracy_score >= 0 AND accuracy_score <= 25)) AND
        (clarity_score IS NULL OR (clarity_score >= 0 AND clarity_score <= 25)) AND
        (depth_score IS NULL OR (depth_score >= 0 AND depth_score <= 25))
    )
);

CREATE INDEX idx_interview_answers_question_id ON interview_answers(question_id);
CREATE INDEX idx_interview_answers_session_id ON interview_answers(session_id);
CREATE INDEX idx_interview_answers_created_at ON interview_answers(created_at);
```

**Column Descriptions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| question_id | UUID | FK, UNIQUE | Reference to interview_questions (one answer per question) |
| session_id | UUID | FK | Reference to interview_sessions |
| answer_text | TEXT | NOT NULL | User's submitted answer |
| answer_length_chars | INTEGER | NOT NULL | Character count of answer |
| time_taken_seconds | INTEGER | NULL | Time from question display to submission |
| overall_score | INTEGER | NULL | Overall score 0-100 |
| completeness_score | INTEGER | NULL | Completeness dimension 0-25 |
| accuracy_score | INTEGER | NULL | Accuracy dimension 0-25 |
| clarity_score | INTEGER | NULL | Clarity dimension 0-25 |
| depth_score | INTEGER | NULL | Depth dimension 0-25 |
| feedback_text | TEXT | NULL | AI-generated feedback on answer |
| evaluated_by_ai | BOOLEAN | NULL | True if AI evaluated |
| ai_evaluation_metadata | JSONB | NULL | AI model, tokens used, evaluation time |
| created_at | TIMESTAMP | NOT NULL | Answer submission timestamp |
| evaluated_at | TIMESTAMP | NULL | When evaluation completed |

---

### 4.7 Table: `session_reports`

Stores AI-generated comprehensive session reports with summaries and recommendations.

```sql
CREATE TABLE session_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID NOT NULL UNIQUE,
    user_id             UUID NOT NULL,
    overall_score       INTEGER NOT NULL,
    average_completeness INTEGER,
    average_accuracy    INTEGER,
    average_clarity     INTEGER,
    average_depth       INTEGER,
    strengths           TEXT[],
    weaknesses          TEXT[],
    recommendations     TEXT[],
    summary_text        TEXT,
    metadata            JSONB,
    generated_by_ai     BOOLEAN NOT NULL DEFAULT TRUE,
    ai_generation_metadata JSONB,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_session_reports_session FOREIGN KEY (session_id) 
        REFERENCES interview_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_reports_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT session_reports_score_range CHECK (
        overall_score >= 0 AND overall_score <= 100
    )
);

CREATE INDEX idx_session_reports_session_id ON session_reports(session_id);
CREATE INDEX idx_session_reports_user_id ON session_reports(user_id);
CREATE INDEX idx_session_reports_created_at ON session_reports(created_at DESC);
```

**Column Descriptions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| session_id | UUID | FK, UNIQUE | Reference to interview_sessions (one report per session) |
| user_id | UUID | FK | Reference to users table |
| overall_score | INTEGER | NOT NULL | Aggregate session score 0-100 |
| average_completeness | INTEGER | NULL | Average completeness across answers |
| average_accuracy | INTEGER | NULL | Average accuracy across answers |
| average_clarity | INTEGER | NULL | Average clarity across answers |
| average_depth | INTEGER | NULL | Average depth across answers |
| strengths | TEXT[] | NULL | Array of identified strengths |
| weaknesses | TEXT[] | NULL | Array of identified weaknesses |
| recommendations | TEXT[] | NULL | Array of improvement recommendations |
| summary_text | TEXT | NULL | Overall session summary narrative |
| metadata | JSONB | NULL | Additional metadata |
| generated_by_ai | BOOLEAN | NOT NULL | True if AI-generated |
| ai_generation_metadata | JSONB | NULL | AI model, tokens used, generation time |
| created_at | TIMESTAMP | NOT NULL | Report generation timestamp |

---

### 4.8 Table: `admin_logs`

Audit trail for administrative actions.

```sql
CREATE TABLE admin_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id       UUID NOT NULL,
    action_type         VARCHAR(50) NOT NULL,
    target_entity_type  VARCHAR(50),
    target_entity_id    UUID,
    action_description  TEXT NOT NULL,
    changes             JSONB,
    ip_address          VARCHAR(45),
    user_agent          VARCHAR(500),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_admin_logs_admin_user FOREIGN KEY (admin_user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT admin_logs_action_type_check CHECK (
        action_type IN (
            'USER_SUSPEND', 'USER_REACTIVATE', 'USER_DELETE',
            'SESSION_VIEW', 'SYSTEM_CONFIG_UPDATE', 'QUESTION_SEED_UPDATE'
        )
    )
);

CREATE INDEX idx_admin_logs_admin_user_id ON admin_logs(admin_user_id);
CREATE INDEX idx_admin_logs_action_type ON admin_logs(action_type);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_target ON admin_logs(target_entity_type, target_entity_id);
```

**Column Descriptions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| admin_user_id | UUID | FK | Reference to users table (admin who performed action) |
| action_type | VARCHAR(50) | NOT NULL | Type of administrative action |
| target_entity_type | VARCHAR(50) | NULL | Type of entity affected (USER, SESSION, etc.) |
| target_entity_id | UUID | NULL | ID of affected entity |
| action_description | TEXT | NOT NULL | Human-readable description |
| changes | JSONB | NULL | Before/after values for updates |
| ip_address | VARCHAR(45) | NULL | IP address of admin user |
| user_agent | VARCHAR(500) | NULL | Browser/client user agent |
| created_at | TIMESTAMP | NOT NULL | Action timestamp |

---

## 5. Entity Relationship Diagram (ERD)

### 5.1 ERD in Text Format

```
users (1) ────< (1) user_profiles
  │
  │ (1)
  │
  ├────< (many) resumes
  │
  │ (1)
  │
  ├────< (many) interview_sessions
  │                 │
  │                 │ (1)
  │                 │
  │                 ├────< (many) interview_questions
  │                 │           │
  │                 │           │ (1)
  │                 │           │
  │                 │           └────< (1) interview_answers
  │                 │
  │                 │ (1)
  │                 │
  │                 └────< (1) session_reports
  │
  │ (1)
  │
  └────< (many) admin_logs [as admin_user]

resumes (1) ────< (many) interview_sessions [optional reference]
```

### 5.2 ERD in ASCII Box Diagram

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │
│ email        │
│ password_hash│
│ full_name    │
│ role         │
└──────┬───────┘
       │ 1
       │
       ├─────────────────────┐
       │                     │
       │                     │
   1   │                     │ 1
       │                     │
┌──────▼────────┐    ┌───────▼─────────────┐
│user_profiles  │    │      resumes        │
│───────────────│    │─────────────────────│
│id (PK)        │    │id (PK)              │
│user_id (FK)   │    │user_id (FK)         │
│phone_number   │    │file_name            │
│education      │    │extracted_text       │
│skill_tags[]   │    │is_active            │
└───────────────┘    └────────┬────────────┘
                              │
                          many│
       ┌──────────────────────┘
       │
       │
       │ 1
       │
┌──────▼──────────────────┐
│  interview_sessions     │
│─────────────────────────│
│id (PK)                  │
│user_id (FK)             │
│resume_id (FK, optional) │
│interview_type           │
│difficulty               │
│status                   │
└──────┬──────────────────┘
       │ 1
       │
       ├─────────────┬────────────────┐
       │             │                │
   many│         many│            1   │
       │             │                │
┌──────▼─────────┐  │   ┌────────────▼──────┐
│interview_      │  │   │session_reports    │
│questions       │  │   │───────────────────│
│────────────────│  │   │id (PK)            │
│id (PK)         │  │   │session_id (FK)    │
│session_id (FK) │  │   │overall_score      │
│question_text   │  │   │strengths[]        │
└──────┬─────────┘  │   │weaknesses[]       │
       │ 1          │   │recommendations[]  │
       │            │   └───────────────────┘
   1   │            │
       │            │
┌──────▼──────────┐ │
│interview_answers│ │
│─────────────────│ │
│id (PK)          │ │
│question_id (FK) │ │
│session_id (FK)  │◀┘
│answer_text      │
│overall_score    │
│feedback_text    │
└─────────────────┘
```

---

## 6. Relationships and Cardinality

### 6.1 Core Relationships

**users → user_profiles** (1:1)
- One user has exactly one profile
- CASCADE DELETE: Profile deleted when user is deleted

**users → resumes** (1:many)
- One user can have multiple resumes (up to 3 in MVP)
- CASCADE DELETE: Resumes deleted when user is deleted

**users → interview_sessions** (1:many)
- One user can have multiple interview sessions
- CASCADE DELETE: Sessions deleted when user is deleted

**resumes → interview_sessions** (1:many, optional)
- One resume can be referenced by multiple sessions
- SET NULL on delete: Session keeps data if resume deleted

**interview_sessions → interview_questions** (1:many)
- One session has multiple questions
- CASCADE DELETE: Questions deleted when session is deleted

**interview_sessions → session_reports** (1:1)
- One session has exactly one report (after completion)
- CASCADE DELETE: Report deleted when session is deleted

**interview_questions → interview_answers** (1:1)
- One question has exactly one answer
- CASCADE DELETE: Answer deleted when question is deleted

**interview_sessions → interview_answers** (1:many)
- One session has multiple answers
- CASCADE DELETE: Answers deleted when session is deleted (redundant with question cascade)

**users → admin_logs** (1:many)
- One admin user generates multiple audit log entries
- CASCADE DELETE: Logs deleted when admin user is deleted (debatable; could keep for historical record)

---

## 7. Indexes Strategy

### 7.1 Primary Key Indexes
- All tables have UUID primary key with automatic B-tree index
- Ensures uniqueness and efficient row lookup

### 7.2 Foreign Key Indexes
- Index on every foreign key column for JOIN performance
- Examples: `user_id`, `session_id`, `question_id`, `resume_id`

### 7.3 Query-Specific Indexes

**Frequently Filtered Columns:**
- `users.email` - Unique index for login lookups
- `users.role` - Index for role-based queries
- `interview_sessions.status` - Filter sessions by status
- `interview_sessions.user_id, status` - Composite for user's active sessions

**Timestamp Indexes:**
- `interview_sessions.created_at` (DESC) - Recent sessions first
- `session_reports.created_at` (DESC) - Recent reports first
- `admin_logs.created_at` (DESC) - Recent audit events

**Soft Delete Indexes:**
- Partial index `WHERE deleted_at IS NULL` on `users` and `interview_sessions`
- Excludes deleted records from index, improving performance for active record queries

**Full-Text Search:**
- GiST index on `resumes.extracted_text` using `to_tsvector('english', extracted_text)`
- Enables fast full-text search within resume content

**Array Indexes:**
- GIN index on `user_profiles.skill_tags` - Search users by skill
- GIN index on `interview_sessions.focus_areas` - Search sessions by focus

### 7.4 Index Maintenance
- Regular `ANALYZE` to update query planner statistics
- Monitor index usage with `pg_stat_user_indexes`
- Remove unused indexes to reduce write overhead

---

## 8. Enum Types

PostgreSQL custom enum types for type safety and storage efficiency.

### 8.1 interview_type

```sql
CREATE TYPE interview_type AS ENUM ('HR', 'TECHNICAL', 'PROJECT');
```

**Values:**
- `HR`: Behavioral and soft skills interviews
- `TECHNICAL`: Coding, algorithms, technical problem-solving
- `PROJECT`: Discussion of past projects and experiences

### 8.2 difficulty

```sql
CREATE TYPE difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');
```

**Values:**
- `EASY`: Entry-level questions, foundational concepts
- `MEDIUM`: Intermediate complexity, requires depth
- `HARD`: Advanced topics, complex problem-solving

### 8.3 session_status

```sql
CREATE TYPE session_status AS ENUM ('CREATED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABANDONED');
```

**Values:**
- `CREATED`: Session configured but not started
- `IN_PROGRESS`: Session active, user answering questions
- `PAUSED`: Session temporarily paused by user
- `COMPLETED`: Session finished normally
- `ABANDONED`: Session not resumed after pause timeout (24 hours)

---

## 9. Soft Delete Pattern

### 9.1 Implementation

Tables `users` and `interview_sessions` use soft delete pattern with `deleted_at` column.

**Soft Delete Behavior:**
- Record not physically deleted from database
- `deleted_at` timestamp set to current time
- Application-level query filters exclude soft-deleted records by default

**Benefits:**
- Data recovery possible
- Audit trail maintained
- Foreign key relationships preserved
- Compliance with data retention policies

### 9.2 TypeORM Global Query Filter

```typescript
@Entity()
export class User {
  @DeleteDateColumn()
  deleted_at: Date;
}

// TypeORM automatically filters WHERE deleted_at IS NULL
```

### 9.3 Hard Delete After Retention Period

Scheduled job (e.g., cron) to permanently delete soft-deleted records after retention period:

```sql
-- Delete users soft-deleted more than 30 days ago
DELETE FROM users 
WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '30 days';
```

---

## 10. Migration Strategy

### 10.1 TypeORM Migrations

**Migration Workflow:**
1. Make entity changes in TypeScript code
2. Generate migration: `npm run migration:generate -- -n MigrationName`
3. Review generated SQL
4. Test migration on local database
5. Commit migration file to version control
6. Apply to staging: `npm run migration:run`
7. Verify staging functionality
8. Apply to production during maintenance window

### 10.2 Migration File Example

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1234567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            )
        `);
        
        await queryRunner.query(`
            CREATE INDEX idx_users_email ON users(email)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX idx_users_email`);
        await queryRunner.query(`DROP TABLE users`);
    }
}
```

### 10.3 Migration Naming Convention

`[timestamp]-[descriptive-name].ts`

Examples:
- `1704067200000-CreateUsersTable.ts`
- `1704153600000-AddSkillTagsToProfiles.ts`
- `1704240000000-AddIndexesToSessions.ts`

### 10.4 Backward Compatibility

**Adding Columns:**
- Always add as nullable or with default value
- Allows rolling deployment without downtime

**Removing Columns:**
- Two-phase approach:
  1. Deploy code that ignores column
  2. Drop column in subsequent migration after verification

**Renaming Columns:**
- Three-phase approach:
  1. Add new column, copy data
  2. Deploy code using new column
  3. Drop old column

---

## 11. Data Integrity Constraints

### 11.1 Primary Keys
- All tables use UUID primary keys
- `gen_random_uuid()` function generates UUIDs server-side

### 11.2 Foreign Keys
- All relationships enforced with foreign key constraints
- Cascade actions defined (CASCADE DELETE, SET NULL)
- Prevents orphaned records

### 11.3 Unique Constraints
- `users.email` - One email per user
- `user_profiles.user_id` - One profile per user
- `interview_questions(session_id, question_number)` - Sequential numbering
- `interview_answers.question_id` - One answer per question
- `session_reports.session_id` - One report per session

### 11.4 Check Constraints
- `users.role` - Must be 'STUDENT' or 'ADMIN'
- `interview_sessions.duration_minutes` - Must be 15, 30, 45, or 60
- Score ranges - Ensure scores within valid bounds (0-100, 0-25)

### 11.5 Not Null Constraints
- Applied to required fields preventing NULL insertion
- Examples: email, password_hash, question_text, answer_text

---

## 12. Sample Queries

### 12.1 Get User with Profile and Active Resume

```sql
SELECT 
    u.id, u.email, u.full_name, u.role,
    p.phone_number, p.skill_tags, p.education_level,
    r.id as resume_id, r.file_name, r.extracted_text
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id
LEFT JOIN resumes r ON u.id = r.user_id AND r.is_active = TRUE
WHERE u.id = $1 AND u.deleted_at IS NULL;
```

### 12.2 Get User's Recent Sessions with Reports

```sql
SELECT 
    s.id, s.interview_type, s.difficulty, s.status,
    s.created_at, s.completed_at,
    r.overall_score, r.strengths, r.recommendations
FROM interview_sessions s
LEFT JOIN session_reports r ON s.id = r.session_id
WHERE s.user_id = $1 AND s.deleted_at IS NULL
ORDER BY s.created_at DESC
LIMIT 10;
```

### 12.3 Get Session with All Questions and Answers

```sql
SELECT 
    s.id as session_id, s.interview_type, s.difficulty,
    q.id as question_id, q.question_number, q.question_text,
    a.answer_text, a.overall_score, a.feedback_text
FROM interview_sessions s
JOIN interview_questions q ON s.id = q.session_id
LEFT JOIN interview_answers a ON q.id = a.question_id
WHERE s.id = $1
ORDER BY q.question_number;
```

### 12.4 Admin: Get System Statistics

```sql
SELECT 
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND last_login_at > NOW() - INTERVAL '7 days') as active_users_7d,
    (SELECT COUNT(*) FROM interview_sessions WHERE deleted_at IS NULL) as total_sessions,
    (SELECT COUNT(*) FROM interview_sessions WHERE status = 'COMPLETED') as completed_sessions,
    (SELECT AVG(overall_score) FROM session_reports) as average_score;
```

### 12.5 Get User Score Trend

```sql
SELECT 
    DATE(s.completed_at) as date,
    AVG(r.overall_score) as avg_score
FROM interview_sessions s
JOIN session_reports r ON s.id = r.session_id
WHERE s.user_id = $1 AND s.status = 'COMPLETED'
GROUP BY DATE(s.completed_at)
ORDER BY date DESC
LIMIT 30;
```

---

## 13. Database Seeding

### 13.1 Initial Admin User Seed

Migration to create initial admin account:

```sql
INSERT INTO users (id, email, password_hash, full_name, role, email_verified, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@mockinterview.com',
    '$2b$10$hashedPasswordHere', -- bcrypt hash of default password
    'System Administrator',
    'ADMIN',
    TRUE,
    NOW(),
    NOW()
);
```

### 13.2 Sample Student User Seed (Development Only)

```sql
INSERT INTO users (email, password_hash, full_name, role, email_verified)
VALUES 
    ('student1@test.com', '$2b$10$hash1', 'John Doe', 'STUDENT', TRUE),
    ('student2@test.com', '$2b$10$hash2', 'Jane Smith', 'STUDENT', TRUE);

INSERT INTO user_profiles (user_id, education_level, skill_tags)
SELECT id, 'Bachelor''s', ARRAY['JavaScript', 'Python', 'React']
FROM users WHERE email = 'student1@test.com';
```

---

## 14. Backup and Recovery

### 14.1 Backup Strategy

**Daily Automated Backups:**
```bash
pg_dump -h localhost -U postgres -d ai_mock_interview \
  --format=custom --file=backup_$(date +%Y%m%d).dump
```

**Continuous Archiving (WAL):**
- Enable PostgreSQL Write-Ahead Logging
- Archive to S3 or equivalent object storage
- Enables point-in-time recovery

### 14.2 Restore Procedure

```bash
# Restore from dump
pg_restore -h localhost -U postgres -d ai_mock_interview \
  --clean --if-exists backup_20250115.dump

# Point-in-time recovery (requires WAL archives)
# Restore from base backup, replay WAL up to specific timestamp
```

### 14.3 Testing Backups

- Weekly automated restore test to staging environment
- Verify data integrity and completeness
- Document restore time (RTO metric)

---

## 15. Security Considerations

### 15.1 Password Storage
- Never store plaintext passwords
- Use bcrypt with work factor ≥ 10
- Hash computed in application layer before insertion

### 15.2 Sensitive Data
- Resume extracted text may contain PII
- Consider column-level encryption using pgcrypto extension
- Encrypt file storage at rest (filesystem or S3 encryption)

### 15.3 Database Access Control
- Application uses dedicated database user with limited privileges
- No superuser access for application
- Admin database access requires VPN and MFA

### 15.4 SQL Injection Prevention
- Use parameterized queries exclusively (TypeORM enforces this)
- Never concatenate user input into SQL strings
- Validate and sanitize inputs at application layer

---

## 16. Conclusion

This database design provides a robust, normalized schema for the AI-Powered Mock Interview System. The use of PostgreSQL's advanced features (UUID, JSONB, enums, full-text search, array types) enables flexible yet performant data storage. The schema supports all functional requirements while maintaining data integrity through constraints and relationships.

The soft delete pattern, migration strategy, and comprehensive indexing ensure the database is production-ready with appropriate safety measures and performance optimizations. The design anticipates future scalability needs through proper normalization and efficient query patterns.

All tables, columns, relationships, and constraints are documented to serve as the authoritative reference for implementation teams.
