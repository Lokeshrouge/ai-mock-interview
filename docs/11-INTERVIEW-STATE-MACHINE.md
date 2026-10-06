# Interview State Machine

## States

```
    START
      │
      ▼
  ┌─────────┐
  │ CREATED │ ← Interview configured but not started
  └────┬────┘
       │ POST /interviews/:id/start
       │
       ▼
┌──────────────┐
│ IN_PROGRESS  │ ← Student answering questions
└──────┬───────┘
       │
       ├─────→ [Student closes browser] → State persists
       │
       ├─────→ [Student submits answer] → Stays IN_PROGRESS
       │
       ├─────→ POST /interviews/:id/pause (optional)
       │       │
       │       ▼
       │   ┌────────┐
       │   │ PAUSED │ ← Manually paused
       │   └────┬───┘
       │        │ POST /interviews/:id/resume
       │        │
       │◄───────┘
       │
       │ POST /interviews/:id/complete
       │ (or last answer submitted)
       │
       ▼
  ┌───────────┐
  │ COMPLETED │ ← All questions answered
  └─────┬─────┘
        │
        │ (Automatic AI processing)
        │
        ▼
  ┌──────────┐
  │ EVALUATED│ ← Final report ready
  └──────────┘
```

---

## State Descriptions

### CREATED
**Description**: Interview session created but not yet started.  
**Allowed Actions**:
- Start interview: `POST /interviews/:id/start`
- Delete interview: `DELETE /interviews/:id`
- View configuration: `GET /interviews/:id`

**Data State**:
- `status`: "CREATED"
- `started_at`: NULL
- `completed_at`: NULL
- `overall_score`: NULL
- No questions generated yet

---

### IN_PROGRESS
**Description**: Interview is active, student is answering questions.  
**Allowed Actions**:
- Submit answer: `POST /interviews/:id/answers`
- View current state: `GET /interviews/:id`
- View questions: `GET /interviews/:id/questions`
- Pause (optional): `POST /interviews/:id/pause`
- Complete: `POST /interviews/:id/complete`

**Data State**:
- `status`: "IN_PROGRESS"
- `started_at`: timestamp
- `completed_at`: NULL
- `overall_score`: NULL
- Questions generated and stored
- Answers being collected

**Automatic Transitions**:
- When last answer submitted → auto-transition to COMPLETED

---

### PAUSED (Optional for MVP)
**Description**: Interview temporarily paused by student.  
**Allowed Actions**:
- Resume: `POST /interviews/:id/resume`
- View state: `GET /interviews/:id`
- Delete: `DELETE /interviews/:id`

**Data State**:
- `status`: "PAUSED"
- `started_at`: timestamp
- `paused_at`: timestamp
- Progress saved (answered questions preserved)

---

### COMPLETED
**Description**: All questions answered, awaiting evaluation.  
**Allowed Actions**:
- View interview: `GET /interviews/:id`
- Wait for evaluation to complete

**Data State**:
- `status`: "COMPLETED"
- `started_at`: timestamp
- `completed_at`: timestamp
- `overall_score`: NULL (being calculated)
- All answers submitted

**Automatic Transitions**:
- Background job calculates score
- Generates recommendations
- Transitions to EVALUATED

---

### EVALUATED
**Description**: Interview fully processed with results.  
**Allowed Actions**:
- View report: `GET /interviews/:id/report`
- View results: `GET /interviews/:id`
- No further modifications

**Data State**:
- `status`: "EVALUATED"
- `started_at`: timestamp
- `completed_at`: timestamp
- `overall_score`: calculated value
- All evaluations and recommendations generated

---

## State Transition Rules

### Valid Transitions

| From | To | Trigger | Notes |
|------|-------|---------|-------|
| CREATED | IN_PROGRESS | Start interview | Generates questions |
| CREATED | (deleted) | Delete before start | Allowed |
| IN_PROGRESS | PAUSED | Manual pause | Optional |
| IN_PROGRESS | COMPLETED | All answers submitted | Auto or manual |
| PAUSED | IN_PROGRESS | Resume | Continues from saved state |
| PAUSED | (deleted) | Delete paused interview | Allowed |
| COMPLETED | EVALUATED | Background processing | Automatic |

### Invalid Transitions (Prevented)

| From | To | Why Invalid |
|------|-------|-------------|
| IN_PROGRESS | CREATED | Cannot un-start |
| COMPLETED | IN_PROGRESS | Cannot un-complete |
| EVALUATED | COMPLETED | Cannot re-evaluate |
| EVALUATED | IN_PROGRESS | Interview is final |
| Any | CREATED | Cannot reset to created |

---

## State Persistence

### Browser Refresh During Interview
**Scenario**: Student refreshes page while IN_PROGRESS  
**Behavior**:
1. Frontend calls `GET /interviews/:id`
2. Backend returns current state and progress
3. Frontend displays current question
4. Student continues from where they left off

**Implementation**:
```typescript
// Frontend: Check interview state on mount
useEffect(() => {
  const loadInterviewState = async () => {
    const interview = await api.getInterview(interviewId);
    if (interview.status === 'IN_PROGRESS') {
      setCurrentQuestion(interview.currentQuestionNumber);
      // Load unanswered questions
    }
  };
  loadInterviewState();
}, [interviewId]);
```

---

### Browser Close During Interview
**Scenario**: Student closes browser while IN_PROGRESS  
**Behavior**:
1. State remains IN_PROGRESS in database
2. On return, student can resume
3. No data loss

**Auto-Complete Logic** (Optional):
- If interview IN_PROGRESS for > 24 hours with no activity
- Auto-transition to PAUSED or mark as abandoned
- Send email reminder to student

---

## Error Handling by State

### CREATED State Errors

**Error**: Failed to start (AI service down)  
**Action**: Show error, keep status CREATED, allow retry

```json
{
  "error": "Failed to generate questions. Please try again.",
  "status": "CREATED",
  "retryable": true
}
```

---

### IN_PROGRESS State Errors

**Error**: Failed to submit answer  
**Action**: Keep status IN_PROGRESS, answer not saved, allow retry

```json
{
  "error": "Failed to submit answer. Your answer was not saved.",
  "currentQuestion": 3,
  "status": "IN_PROGRESS"
}
```

**Error**: Failed to evaluate answer  
**Action**: 
- Save answer (don't lose student's work)
- Mark evaluation as "pending_retry"
- Show temporary score/feedback
- Retry evaluation in background

```json
{
  "answer_saved": true,
  "evaluation_status": "pending",
  "message": "Your answer is saved. Evaluation will complete shortly.",
  "temporary_score": null
}
```

---

### COMPLETED State Errors

**Error**: Failed to generate recommendations  
**Action**: 
- Stay in COMPLETED state
- Retry in background
- Show partial results (scores without recommendations)

---

## Concurrent Access Control

### Multiple Tabs/Devices
**Scenario**: Student opens same interview in two tabs  
**Solution**:
- Both tabs can view current state
- Only one can submit answers (last write wins)
- Consider WebSocket for real-time sync (future)

### Optimistic Locking (Optional)
```sql
UPDATE interviews 
SET status = 'COMPLETED', version = version + 1
WHERE id = $1 AND version = $2
```

---

## State Transition API Calls

### Start Interview
```typescript
POST /api/interviews/:id/start

Response:
{
  "status": "IN_PROGRESS",
  "started_at": "2024-10-01T10:00:00Z",
  "total_questions": 7,
  "current_question": {...}
}
```

### Submit Answer
```typescript
POST /api/interviews/:id/answers
{
  "question_id": "uuid",
  "answer_text": "..."
}

Response:
{
  "answer_saved": true,
  "evaluation": {...},
  "next_question": {...},
  "progress": {
    "answered": 3,
    "total": 7,
    "status": "IN_PROGRESS"
  }
}
```

### Complete Interview
```typescript
POST /api/interviews/:id/complete

Response:
{
  "status": "COMPLETED",
  "completed_at": "2024-10-01T10:45:00Z",
  "message": "Generating your report...",
  "estimated_wait": "30 seconds"
}
```

### Check Evaluation Status
```typescript
GET /api/interviews/:id

Response:
{
  "id": "uuid",
  "status": "EVALUATED", // or "COMPLETED" if still processing
  "overall_score": 78.5,
  "report_available": true
}
```

---

## State Machine Implementation

### Backend (NestJS)

```typescript
enum InterviewStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  EVALUATED = 'EVALUATED'
}

class InterviewStateMachine {
  static canTransition(from: InterviewStatus, to: InterviewStatus): boolean {
    const validTransitions = {
      [InterviewStatus.CREATED]: [InterviewStatus.IN_PROGRESS],
      [InterviewStatus.IN_PROGRESS]: [InterviewStatus.PAUSED, InterviewStatus.COMPLETED],
      [InterviewStatus.PAUSED]: [InterviewStatus.IN_PROGRESS],
      [InterviewStatus.COMPLETED]: [InterviewStatus.EVALUATED],
      [InterviewStatus.EVALUATED]: []
    };
    
    return validTransitions[from]?.includes(to) ?? false;
  }
  
  static transition(interview: Interview, newStatus: InterviewStatus) {
    if (!this.canTransition(interview.status, newStatus)) {
      throw new InvalidStateTransitionException(
        `Cannot transition from ${interview.status} to ${newStatus}`
      );
    }
    interview.status = newStatus;
    // Update timestamps based on new status
    if (newStatus === InterviewStatus.IN_PROGRESS && !interview.started_at) {
      interview.started_at = new Date();
    }
    if (newStatus === InterviewStatus.COMPLETED) {
      interview.completed_at = new Date();
    }
  }
}
```

---

## Timeout Policies

### Interview Expiration
- IN_PROGRESS for > 24 hours → Send reminder email
- IN_PROGRESS for > 7 days → Auto-PAUSE with notification
- PAUSED for > 30 days → Mark as abandoned (soft delete)

### Processing Timeout
- COMPLETED → EVALUATED should complete in < 60 seconds
- If > 5 minutes, mark as "evaluation_failed", allow retry

---

## Database Queries by State

### Get Active Interviews
```sql
SELECT * FROM interviews 
WHERE user_id = $1 
  AND status IN ('CREATED', 'IN_PROGRESS', 'PAUSED')
ORDER BY created_at DESC;
```

### Get Completed Interviews (History)
```sql
SELECT * FROM interviews 
WHERE user_id = $1 
  AND status = 'EVALUATED'
ORDER BY completed_at DESC;
```

### Get Stale Interviews (Cleanup Job)
```sql
SELECT * FROM interviews 
WHERE status = 'IN_PROGRESS' 
  AND started_at < NOW() - INTERVAL '24 hours'
  AND updated_at < NOW() - INTERVAL '1 hour';
```

---

## Monitoring & Alerts

### Metrics to Track
- Interviews by status (gauge)
- Average time in each state
- Interviews stuck in COMPLETED > 5 min
- Failed state transitions
- Abandoned interviews rate

### Alerts
- Alert if > 10 interviews stuck in COMPLETED
- Alert if any interview in COMPLETED > 10 minutes
- Alert if state transition failure rate > 1%
