# Interview State Machine

## Document Information
**Project:** AI-Powered Mock Interview System  
**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** B.Sc. Final Year Project Team

---

## 1. Introduction

This document defines the state machine governing interview session lifecycle in the AI-Powered Mock Interview System. The state machine enforces business rules, ensures data consistency, and provides clear boundaries for user interactions and system operations.

Understanding the state machine is critical for both frontend developers (who must render appropriate UI for each state) and backend developers (who must enforce state transition guards and side effects).

---

## 2. State Definitions

### 2.1 CREATED

**Definition:** Interview configuration saved but not yet started. Questions not generated.

**Characteristics:**
- Initial state after POST /api/v1/interviews
- Interview metadata (type, skills, difficulty) stored
- No questions generated yet (lazy generation on start)
- User can view configuration but not answer questions
- Expiration timer started (24 hours from creation)

**Allowed Operations:**
- View interview details
- Start interview (triggers question generation)
- Delete interview
- Edit configuration (optional future feature)

**Database State:**
```json
{
  "status": "CREATED",
  "createdAt": "2024-01-20T16:00:00.000Z",
  "startedAt": null,
  "pausedAt": null,
  "completedAt": null,
  "abandonedAt": null,
  "expiresAt": "2024-01-21T16:00:00.000Z"
}
```

---

### 2.2 IN_PROGRESS

**Definition:** Interview actively running. User answering questions.

**Characteristics:**
- Questions generated and available
- User can view and answer questions sequentially or in any order
- Timer running (if time-limited interview)
- Answers submitted for AI evaluation
- Transition to COMPLETED when all questions answered or user clicks End

**Allowed Operations:**
- View questions
- Submit answers
- Pause interview
- End interview early
- View already-submitted answers with evaluations

**Database State:**
```json
{
  "status": "IN_PROGRESS",
  "createdAt": "2024-01-20T16:00:00.000Z",
  "startedAt": "2024-01-20T16:05:00.000Z",
  "pausedAt": null,
  "completedAt": null,
  "abandonedAt": null,
  "expiresAt": "2024-01-21T16:00:00.000Z",
  "currentQuestionIndex": 2,
  "answeredCount": 2,
  "totalQuestions": 5
}
```

---

### 2.3 PAUSED

**Definition:** Interview temporarily suspended by user.

**Characteristics:**
- All progress preserved
- User can resume at any time before expiration
- Timer stopped (for time-limited interviews)
- No answers can be submitted while paused
- Prevents accidental submission during breaks

**Allowed Operations:**
- Resume interview
- View current progress (questions and submitted answers)
- Abandon interview
- End interview early

**Database State:**
```json
{
  "status": "PAUSED",
  "createdAt": "2024-01-20T16:00:00.000Z",
  "startedAt": "2024-01-20T16:05:00.000Z",
  "pausedAt": "2024-01-20T16:25:00.000Z",
  "completedAt": null,
  "abandonedAt": null,
  "expiresAt": "2024-01-21T16:00:00.000Z",
  "currentQuestionIndex": 2,
  "answeredCount": 2,
  "totalQuestions": 5
}
```

---

### 2.4 COMPLETED

**Definition:** Interview finished successfully. All questions answered or user ended early.

**Characteristics:**
- Terminal state (no further transitions)
- Read-only access to all questions and answers
- Report automatically generated
- Performance metrics calculated
- Can be viewed indefinitely by user

**Allowed Operations:**
- View complete interview transcript
- View performance report
- Download report (future feature)
- Delete interview (archives to cold storage)

**Database State:**
```json
{
  "status": "COMPLETED",
  "createdAt": "2024-01-20T16:00:00.000Z",
  "startedAt": "2024-01-20T16:05:00.000Z",
  "pausedAt": null,
  "completedAt": "2024-01-20T16:45:00.000Z",
  "abandonedAt": null,
  "expiresAt": "2024-01-21T16:00:00.000Z",
  "answeredCount": 5,
  "totalQuestions": 5,
  "durationSeconds": 2400,
  "reportGenerated": true
}
```

---

### 2.5 ABANDONED

**Definition:** User explicitly abandoned interview without completing it.

**Characteristics:**
- Terminal state (no further transitions)
- Partial progress preserved
- No report generated (insufficient data)
- Marked for cleanup after retention period

**Allowed Operations:**
- View partial progress (questions and submitted answers)
- Delete interview

**Database State:**
```json
{
  "status": "ABANDONED",
  "createdAt": "2024-01-20T16:00:00.000Z",
  "startedAt": "2024-01-20T16:05:00.000Z",
  "pausedAt": null,
  "completedAt": null,
  "abandonedAt": "2024-01-20T16:20:00.000Z",
  "expiresAt": "2024-01-21T16:00:00.000Z",
  "answeredCount": 1,
  "totalQuestions": 5
}
```

---

### 2.6 EXPIRED

**Definition:** Interview exceeded 24-hour time limit without completion.

**Characteristics:**
- Terminal state (no further transitions)
- System-triggered transition (cron job)
- Partial progress preserved if started
- No report generated
- Marked for cleanup after retention period

**Allowed Operations:**
- View partial progress (if any)
- Delete interview

**Database State:**
```json
{
  "status": "EXPIRED",
  "createdAt": "2024-01-20T16:00:00.000Z",
  "startedAt": "2024-01-20T16:05:00.000Z",
  "pausedAt": "2024-01-20T16:25:00.000Z",
  "completedAt": null,
  "abandonedAt": null,
  "expiresAt": "2024-01-21T16:00:00.000Z",
  "expiredAt": "2024-01-21T16:00:00.000Z",
  "answeredCount": 2,
  "totalQuestions": 5
}
```

---

## 3. State Transitions

### 3.1 Transition Table

| From State    | Event           | To State      | Guard Condition                        |
|---------------|-----------------|---------------|----------------------------------------|
| CREATED       | Start           | IN_PROGRESS   | Not expired                            |
| IN_PROGRESS   | Pause           | PAUSED        | At least 1 question answered           |
| PAUSED        | Resume          | IN_PROGRESS   | Not expired                            |
| IN_PROGRESS   | End             | COMPLETED     | At least 1 question answered           |
| IN_PROGRESS   | Auto-complete   | COMPLETED     | All questions answered                 |
| IN_PROGRESS   | Abandon         | ABANDONED     | User confirms abandonment              |
| PAUSED        | Abandon         | ABANDONED     | User confirms abandonment              |
| PAUSED        | End             | COMPLETED     | At least 1 question answered           |
| CREATED       | Expire          | EXPIRED       | 24 hours elapsed                       |
| IN_PROGRESS   | Expire          | EXPIRED       | 24 hours elapsed                       |
| PAUSED        | Expire          | EXPIRED       | 24 hours elapsed                       |

### 3.2 Detailed Transition Specifications

#### 3.2.1 CREATED → IN_PROGRESS

**Trigger:** User clicks "Start Interview" button  
**API Endpoint:** PUT /api/v1/interviews/:id/start

**Guard Conditions:**
```typescript
function canStartInterview(interview: Interview): boolean {
  return (
    interview.status === 'CREATED' &&
    new Date(interview.expiresAt) > new Date() &&
    interview.userId === currentUser.id
  );
}
```

**Side Effects:**
1. Call AI service to generate questions
2. Store questions in database with order indices
3. Set `startedAt` timestamp
4. Update status to IN_PROGRESS
5. Log state transition event
6. Return questions to user

**Failure Handling:**
- AI service unavailable → Return 503, stay in CREATED state
- Timeout → Return 504, stay in CREATED state
- Questions malformed → Retry once, then return 502

**Business Rules:**
- Question count must match configuration (3-15)
- Questions must cover all specified skills
- Difficulty distribution should match specified level

---

#### 3.2.2 IN_PROGRESS → PAUSED

**Trigger:** User clicks "Pause" button  
**API Endpoint:** PUT /api/v1/interviews/:id/pause

**Guard Conditions:**
```typescript
function canPauseInterview(interview: Interview): boolean {
  return (
    interview.status === 'IN_PROGRESS' &&
    interview.answeredCount >= 1 &&
    new Date(interview.expiresAt) > new Date()
  );
}
```

**Side Effects:**
1. Set `pausedAt` timestamp
2. Update status to PAUSED
3. Stop timer (if applicable)
4. Save current question index
5. Log state transition event

**Business Rules:**
- Cannot pause before answering at least one question
- Pause preserves all progress (answered questions, evaluations)
- User can pause unlimited times

---

#### 3.2.3 PAUSED → IN_PROGRESS

**Trigger:** User clicks "Resume" button  
**API Endpoint:** PUT /api/v1/interviews/:id/resume

**Guard Conditions:**
```typescript
function canResumeInterview(interview: Interview): boolean {
  return (
    interview.status === 'PAUSED' &&
    new Date(interview.expiresAt) > new Date()
  );
}
```

**Side Effects:**
1. Set `resumedAt` timestamp (optional tracking)
2. Update status to IN_PROGRESS
3. Restart timer from saved position
4. Log state transition event

**Business Rules:**
- Resume returns user to last question they were viewing
- No data loss during pause period
- Cannot resume expired interviews

---

#### 3.2.4 IN_PROGRESS → COMPLETED (Manual)

**Trigger:** User clicks "End Interview" button  
**API Endpoint:** PUT /api/v1/interviews/:id/end

**Guard Conditions:**
```typescript
function canEndInterview(interview: Interview): boolean {
  return (
    (interview.status === 'IN_PROGRESS' || interview.status === 'PAUSED') &&
    interview.answeredCount >= 1
  );
}
```

**Side Effects:**
1. Set `completedAt` timestamp
2. Calculate total duration
3. Update status to COMPLETED
4. Trigger async report generation job
5. Log state transition event
6. Send completion notification

**Business Rules:**
- User can end interview early with partial answers
- Report generation triggered asynchronously
- Report includes only answered questions
- Cannot end without answering at least one question

---

#### 3.2.5 IN_PROGRESS → COMPLETED (Automatic)

**Trigger:** User submits answer to final question  
**Occurs In:** POST /api/v1/interviews/:id/answers endpoint

**Guard Conditions:**
```typescript
function shouldAutoComplete(interview: Interview, newAnswerCount: number): boolean {
  return (
    interview.status === 'IN_PROGRESS' &&
    newAnswerCount === interview.totalQuestions
  );
}
```

**Side Effects:**
1. Same as manual completion
2. No explicit user action required
3. Redirect user to report page

**Business Rules:**
- Automatic completion only when ALL questions answered
- User sees success message: "Interview completed! Generating your report..."
- Report typically available within 10 seconds

---

#### 3.2.6 IN_PROGRESS/PAUSED → ABANDONED

**Trigger:** User clicks "Abandon Interview" (requires confirmation)  
**API Endpoint:** PUT /api/v1/interviews/:id/abandon

**Guard Conditions:**
```typescript
function canAbandonInterview(interview: Interview): boolean {
  return (
    (interview.status === 'IN_PROGRESS' || interview.status === 'PAUSED') &&
    !interview.completedAt
  );
}
```

**Confirmation Required:**
```
"Are you sure you want to abandon this interview? 
Your progress will be saved but no report will be generated. 
This action cannot be undone."
```

**Side Effects:**
1. Set `abandonedAt` timestamp
2. Update status to ABANDONED
3. Preserve partial answers
4. Log state transition event with reason (if provided)
5. Mark for cleanup after 30 days

**Business Rules:**
- Abandoned interviews do not count toward user statistics
- Partial data retained for analysis/debugging
- User can view partial progress but cannot resume

---

#### 3.2.7 CREATED/IN_PROGRESS/PAUSED → EXPIRED

**Trigger:** Hourly cron job checks expiration timestamps  
**Background Job:** ExpirationService.checkExpiredInterviews()

**Guard Conditions:**
```typescript
function isExpired(interview: Interview): boolean {
  return (
    ['CREATED', 'IN_PROGRESS', 'PAUSED'].includes(interview.status) &&
    new Date(interview.expiresAt) <= new Date()
  );
}
```

**Cron Schedule:** Every hour at :00  
**Implementation:**
```typescript
@Cron('0 * * * *') // Every hour
async handleExpiredInterviews() {
  const expiredInterviews = await this.interviewsRepository.find({
    where: {
      status: In(['CREATED', 'IN_PROGRESS', 'PAUSED']),
      expiresAt: LessThanOrEqual(new Date()),
    },
  });

  for (const interview of expiredInterviews) {
    await this.transitionToExpired(interview);
  }
}
```

**Side Effects:**
1. Set `expiredAt` timestamp
2. Update status to EXPIRED
3. Log state transition event
4. Send notification email to user (optional)
5. Mark for cleanup after 30 days

**Business Rules:**
- Expiration period: 24 hours from creation
- Expired interviews cannot be resumed or completed
- Partial data preserved for user review
- System-initiated transition (no user action)

---

## 4. State Diagram (ASCII)

```
                    ┌──────────────┐
                    │   CREATED    │ (Initial state)
                    └──────┬───────┘
                           │
                           │ Start
                           │ (Generate questions)
                           ▼
                    ┌──────────────┐
            ┌──────▶│ IN_PROGRESS  │◀──────┐
            │       └──────┬───────┘       │
            │              │               │
            │ Resume       │               │ Pause
            │              │               │
            │       ┌──────▼───────┐       │
            └───────│   PAUSED     │───────┘
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        │ Abandon          │ End              │ Auto-complete
        │                  │                  │ (all questions answered)
        ▼                  ▼                  │
  ┌───────────┐      ┌───────────┐           │
  │ ABANDONED │      │ COMPLETED │◀──────────┘
  └───────────┘      └───────────┘
   (Terminal)         (Terminal, report generated)


  Expiration (24h timeout) can occur from:
  CREATED → EXPIRED
  IN_PROGRESS → EXPIRED
  PAUSED → EXPIRED

                    ┌──────────┐
                    │ EXPIRED  │ (Terminal)
                    └──────────┘
```

---

## 5. Business Rules Per State

### 5.1 CREATED State Rules

**Data Requirements:**
- Interview metadata (type, jobTitle, skills, difficulty, questionCount)
- User ID (owner)
- Creation timestamp
- Expiration timestamp (createdAt + 24 hours)

**User Permissions:**
- Owner can view, start, delete
- Admin can view, delete
- No one else can access

**System Behavior:**
- Questions NOT generated (lazy loading for cost efficiency)
- Included in "My Interviews" list with "Not Started" badge
- Expiration timer displayed: "Expires in 23 hours"

**Validation on Entry:**
- All required metadata present
- User authenticated and authorized
- Question count within limits (3-15)
- Skills array not empty (1-10 items)

---

### 5.2 IN_PROGRESS State Rules

**Data Requirements:**
- All CREATED state data
- Questions array (1-15 items)
- Started timestamp
- Current question index (tracking user position)
- Answers array (may be empty or partial)

**User Permissions:**
- Owner can view questions, submit answers, pause, end
- Admin can view (read-only)

**System Behavior:**
- Timer displayed (elapsed time)
- Progress bar: "3/5 questions answered"
- Autosave answer drafts (local storage)
- Submit button enabled for unanswered questions

**Validation on Entry:**
- Questions successfully generated
- Status was CREATED or PAUSED
- Not expired

**Answer Submission Rules:**
- One answer per question (no duplicates)
- Answer text 10-2000 characters
- AI evaluation must succeed (with retry logic)
- Evaluation stored with answer

---

### 5.3 PAUSED State Rules

**Data Requirements:**
- All IN_PROGRESS state data
- Paused timestamp
- Saved question index (resume position)

**User Permissions:**
- Owner can view progress, resume, abandon, end
- Admin can view (read-only)

**System Behavior:**
- "Resume Interview" button prominently displayed
- Timer stopped, showing elapsed time when paused
- Cannot submit new answers while paused
- Can view already-submitted answers with evaluations

**Validation on Entry:**
- Status was IN_PROGRESS
- At least one question answered
- Not expired

---

### 5.4 COMPLETED State Rules

**Data Requirements:**
- All interview data
- Completion timestamp
- Duration (seconds)
- Report data (or generation status)

**User Permissions:**
- Owner can view all data, download report
- Admin can view all data

**System Behavior:**
- Read-only mode (no editing)
- Report displayed immediately (or "Generating..." message)
- Success message: "Interview completed! Your overall score: 75/100"
- Social sharing options (future feature)

**Report Generation:**
- Triggered asynchronously on completion
- Calls AI service to summarize performance
- Retries up to 3 times on failure
- Falls back to basic stats if AI unavailable

**Validation on Entry:**
- Status was IN_PROGRESS or PAUSED
- At least one question answered
- Completion timestamp set

---

### 5.5 ABANDONED State Rules

**Data Requirements:**
- All available interview data
- Abandonment timestamp
- Optional reason (user-provided)

**User Permissions:**
- Owner can view partial data, delete
- Admin can view

**System Behavior:**
- Warning message: "This interview was abandoned"
- Partial data displayed (answered questions only)
- No report available
- "Start New Interview" call-to-action

**Validation on Entry:**
- Status was IN_PROGRESS or PAUSED
- User confirmed abandonment
- Not already completed or expired

---

### 5.6 EXPIRED State Rules

**Data Requirements:**
- All available interview data
- Expiration timestamp

**User Permissions:**
- Owner can view partial data, delete
- Admin can view

**System Behavior:**
- Warning message: "This interview expired after 24 hours"
- Partial data displayed if started
- No report available
- "Start New Interview" call-to-action

**Cleanup Policy:**
- Retained for 30 days after expiration
- Then moved to cold storage or deleted
- Aggregated stats preserved anonymously

---

## 6. Frontend UI State Mapping

### 6.1 Interview List View

| Status      | Badge Color | Badge Text    | Actions Available              |
|-------------|-------------|---------------|--------------------------------|
| CREATED     | Blue        | Not Started   | Start, Delete                  |
| IN_PROGRESS | Green       | In Progress   | Continue, View Details         |
| PAUSED      | Yellow      | Paused        | Resume, View Details           |
| COMPLETED   | Purple      | Completed     | View Report, View Details      |
| ABANDONED   | Orange      | Abandoned     | View Details, Delete           |
| EXPIRED     | Red         | Expired       | View Details, Delete           |

### 6.2 Interview Detail Page

**CREATED:**
```
┌────────────────────────────────────────┐
│  Frontend Developer - Technical        │
│  Intermediate • 5 Questions            │
│  Skills: React, TypeScript, Next.js    │
│                                        │
│  Expires in 23 hours                   │
│                                        │
│  [    Start Interview    ]             │
│  [       Delete          ]             │
└────────────────────────────────────────┘
```

**IN_PROGRESS:**
```
┌────────────────────────────────────────┐
│  Frontend Developer - Technical        │
│  Question 3 of 5 • 15:30 elapsed       │
│  [═══════════════════════░░░░░░] 60%   │
│                                        │
│  Q3: Explain React Server Components   │
│                                        │
│  [     Your answer here...     ]       │
│  [     Your answer here...     ]       │
│                                        │
│  [ Previous ]  [ Submit ]  [ Next ]    │
│  [  Pause   ]  [  End Interview  ]     │
└────────────────────────────────────────┘
```

**PAUSED:**
```
┌────────────────────────────────────────┐
│  Frontend Developer - Technical        │
│  Paused • 3 of 5 answered • 15:30      │
│                                        │
│  You paused this interview.            │
│  Your progress is saved.               │
│                                        │
│  [   Resume Interview   ]              │
│  [   End Interview      ]              │
│  [   Abandon            ]              │
└────────────────────────────────────────┘
```

**COMPLETED:**
```
┌────────────────────────────────────────┐
│  Frontend Developer - Technical        │
│  Completed • 40:22 duration            │
│                                        │
│  🎉 Interview Completed!               │
│  Overall Score: 75/100 (Grade B)       │
│                                        │
│  [   View Full Report   ]              │
│  [   Start New Interview ]             │
└────────────────────────────────────────┘
```

### 6.3 State-Specific Components

**Component Rendering Logic:**
```typescript
function InterviewPage({ interview }: Props) {
  switch (interview.status) {
    case 'CREATED':
      return <InterviewSetup interview={interview} />;
    case 'IN_PROGRESS':
      return <InterviewSession interview={interview} />;
    case 'PAUSED':
      return <InterviewPaused interview={interview} />;
    case 'COMPLETED':
      return <InterviewReport interview={interview} />;
    case 'ABANDONED':
      return <InterviewAbandoned interview={interview} />;
    case 'EXPIRED':
      return <InterviewExpired interview={interview} />;
  }
}
```

---

## 7. Backend Enforcement

### 7.1 NestJS Guard Implementation

```typescript
@Injectable()
export class InterviewStatusGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredStatuses = this.reflector.get<InterviewStatus[]>(
      'statuses',
      context.getHandler(),
    );

    if (!requiredStatuses) {
      return true; // No status requirement
    }

    const request = context.switchToHttp().getRequest();
    const interview = request.interview; // Populated by InterviewOwnershipGuard

    if (!requiredStatuses.includes(interview.status)) {
      throw new BadRequestException(
        `Cannot perform this action. Interview is ${interview.status}`,
      );
    }

    return true;
  }
}
```

**Usage in Controllers:**
```typescript
@Controller('interviews')
export class InterviewsController {
  @Put(':id/start')
  @UseGuards(JwtAuthGuard, InterviewOwnershipGuard, InterviewStatusGuard)
  @RequireStatuses(['CREATED'])
  async startInterview(@Param('id') id: string) {
    return this.interviewsService.startInterview(id);
  }

  @Post(':id/answers')
  @UseGuards(JwtAuthGuard, InterviewOwnershipGuard, InterviewStatusGuard)
  @RequireStatuses(['IN_PROGRESS'])
  async submitAnswer(
    @Param('id') id: string,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.answersService.create(id, dto);
  }

  @Put(':id/pause')
  @UseGuards(JwtAuthGuard, InterviewOwnershipGuard, InterviewStatusGuard)
  @RequireStatuses(['IN_PROGRESS'])
  async pauseInterview(@Param('id') id: string) {
    return this.interviewsService.pauseInterview(id);
  }
}
```

### 7.2 Service-Level Validation

```typescript
@Injectable()
export class InterviewsService {
  async startInterview(id: string): Promise<Interview> {
    const interview = await this.repository.findOne(id);

    // Guard check already validated status, but double-check expiration
    if (interview.expiresAt < new Date()) {
      throw new GoneException('Interview has expired');
    }

    // Generate questions via AI service
    const questions = await this.aiProxyService.generateQuestions({
      interviewType: interview.type,
      jobTitle: interview.jobTitle,
      skills: interview.skills,
      difficulty: interview.difficulty,
      questionCount: interview.questionCount,
    });

    // Atomic transition
    return this.repository.manager.transaction(async (manager) => {
      // Save questions
      await manager.save(Question, questions.map((q, idx) => ({
        ...q,
        interviewId: interview.id,
        orderIndex: idx,
      })));

      // Update status
      interview.status = InterviewStatus.IN_PROGRESS;
      interview.startedAt = new Date();
      await manager.save(Interview, interview);

      // Log event
      await manager.save(InterviewEvent, {
        interviewId: interview.id,
        event: 'STARTED',
        timestamp: new Date(),
      });

      return interview;
    });
  }
}
```

---

## 8. Persistence and Event Sourcing

### 8.1 Database Schema

**interviews table:**
```sql
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('HR', 'TECHNICAL', 'PROJECT')),
  job_title VARCHAR(100) NOT NULL,
  skills JSONB NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  question_count INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP,
  paused_at TIMESTAMP,
  completed_at TIMESTAMP,
  abandoned_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  current_question_index INTEGER DEFAULT 0,
  answered_count INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,
  duration_seconds INTEGER,
  report_generated BOOLEAN DEFAULT FALSE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_expires_at (expires_at),
  CONSTRAINT chk_status CHECK (
    status IN ('CREATED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABANDONED', 'EXPIRED')
  )
);
```

**interview_events table (audit log):**
```sql
CREATE TABLE interview_events (
  id SERIAL PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  from_status VARCHAR(20),
  to_status VARCHAR(20),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB,
  INDEX idx_interview_events (interview_id, timestamp)
);
```

### 8.2 Event Logging

**Events Tracked:**
- CREATED
- STARTED
- PAUSED
- RESUMED
- QUESTION_ANSWERED
- COMPLETED
- ABANDONED
- EXPIRED

**Example Event Records:**
```json
{
  "interview_id": "uuid",
  "event": "STARTED",
  "from_status": "CREATED",
  "to_status": "IN_PROGRESS",
  "timestamp": "2024-01-20T16:05:00.000Z",
  "metadata": {
    "questions_generated": 5,
    "ai_model": "gpt-4",
    "generation_time_ms": 3200
  }
}
```

```json
{
  "interview_id": "uuid",
  "event": "QUESTION_ANSWERED",
  "from_status": "IN_PROGRESS",
  "to_status": "IN_PROGRESS",
  "timestamp": "2024-01-20T16:15:00.000Z",
  "metadata": {
    "question_id": "uuid",
    "question_index": 0,
    "answer_length": 245,
    "evaluation_score": 8,
    "ai_evaluation_time_ms": 4100
  }
}
```

---

## 9. Conclusion

The interview state machine provides robust lifecycle management with clear state definitions, enforced transitions, and comprehensive audit logging. The six-state model balances simplicity with necessary flexibility, ensuring users have control over their interview experience while maintaining data integrity.

The state-based architecture enables:
- **Clear user experience:** UI reflects exact interview status
- **Data consistency:** Transitions enforce business rules
- **System reliability:** Guards prevent invalid operations
- **Auditability:** Event log tracks complete history
- **Scalability:** Stateless API with database-backed state

Future enhancements may include:
- Scheduled interviews (SCHEDULED state)
- Review mode (UNDER_REVIEW state for instructor feedback)
- Multi-session interviews (PARTIALLY_COMPLETED state)

---

**End of Document**
