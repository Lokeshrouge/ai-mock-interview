# Risks and Mitigation

**Document ID:** SPEC-022  
**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Approved

---

## 1. Introduction

This document identifies potential risks to the successful completion of the AI-Powered Mock Interview System project and defines mitigation strategies and contingency plans for each. Risks are categorized by type (Technical, Timeline, Integration, Academic, External) and assessed by probability and impact.

A proactive risk management approach increases the likelihood of on-time delivery and reduces the severity of issues when they occur. This document should be reviewed at each milestone and updated as new risks emerge.

---

## 2. Risk Assessment Framework

### 2.1 Probability Scale

| Level | Probability | Description |
|-------|-------------|-------------|
| 1 | Very Low | <10% chance of occurring |
| 2 | Low | 10-30% chance |
| 3 | Medium | 30-60% chance |
| 4 | High | 60-85% chance |
| 5 | Very High | >85% chance |

### 2.2 Impact Scale

| Level | Impact | Description |
|-------|--------|-------------|
| 1 | Negligible | <1 day delay, minor inconvenience |
| 2 | Low | 1-3 days delay, workaround available |
| 3 | Medium | 1 week delay, requires rework |
| 4 | High | 2-4 weeks delay, major feature cut |
| 5 | Critical | Project failure or inability to submit |

### 2.3 Risk Priority

**Priority = Probability × Impact**

| Priority Range | Action Required |
|----------------|-----------------|
| 15-25 (Critical) | Immediate action, daily monitoring |
| 10-14 (High) | Mitigation plan active, weekly review |
| 5-9 (Medium) | Mitigation defined, monitor at milestones |
| 1-4 (Low) | Accept risk, document contingency |

---

## 3. Risk Register

| ID | Category | Risk Description | Prob | Impact | Priority | Mitigation | Contingency |
|----|----------|------------------|------|--------|----------|------------|-------------|
| R01 | Technical | LLM API costs exceed budget ($100+/month) | 3 | 3 | 9 | Token limits per user, response caching, mock in tests | Switch to free GPT-3.5 or local Ollama |
| R02 | Technical | LLM response latency >10s, poor UX | 4 | 3 | 12 | Async polling UI, 8s timeout with retry, streaming responses | Show "generating..." animation, partial results |
| R03 | Technical | LLM hallucinated/nonsensical questions | 3 | 4 | 12 | Response schema validation (Pydantic), fallback to curated bank | Reject malformed responses, retry with refined prompt |
| R04 | Technical | OpenAI API key exposed in code/logs | 2 | 5 | 10 | Secrets in env vars, .gitignore enforcement, pre-commit hooks | Rotate key immediately, audit usage logs, revoke |
| R05 | Technical | PostgreSQL data loss (dev crash) | 2 | 4 | 8 | Daily pg_dump backup script, Docker volume persistence | Restore from latest backup, replay migrations |
| R06 | Technical | TypeORM migration failure in production | 3 | 4 | 12 | Test migrations in staging DB first, write rollback scripts | Manual rollback, fix migration, redeploy |
| R07 | Technical | JWT refresh token stolen (XSS/MITM) | 2 | 4 | 8 | httpOnly cookies, short expiry (7d), HTTPS only | Revoke refresh tokens, force re-login, add device fingerprint |
| R08 | Technical | Resume parsing fails (corrupt PDF/DOCX) | 4 | 2 | 8 | File validation (magic bytes), try-catch with error message | Graceful error: "Upload failed, try different format" |
| R09 | Integration | NestJS-FastAPI communication timeout | 3 | 3 | 9 | httpx timeout 8s, exponential backoff retry (3 attempts) | Return cached response or "Service unavailable, try again" |
| R10 | Integration | Next.js-NestJS CORS issues block API | 2 | 3 | 6 | Configure CORS in NestJS to allow frontend origin | Use Next.js API routes as proxy if CORS unfixable |
| R11 | Timeline | Scope creep (stakeholder requests voice) | 3 | 4 | 12 | Frozen scope document, change request form with impact estimate | Politely decline, document as Phase 2 feature |
| R12 | Timeline | Timeline slippage (stages take longer) | 4 | 4 | 16 | Buffer weeks in plan (17 vs 15 target), staged deliverables | Cut admin panel (Stage 13), reduce polish in Stage 15 |
| R13 | Technical | NestJS/Next.js version incompatibility | 2 | 3 | 6 | Pin exact versions in package.json, test upgrades in branch | Downgrade to last known-good versions |
| R14 | Technical | Python dependency conflicts (pip hell) | 3 | 2 | 6 | Docker isolates environment, requirements.txt pinned versions | Rebuild Docker image from scratch, use venv locally |
| R15 | Academic | Plagiarism concerns (code similarity) | 2 | 5 | 10 | Maintain detailed git history, document all AI tool use, cite libraries | Show commit history, explain architectural choices in report |
| R16 | Academic | Knowledge gap (FastAPI/LLM unfamiliar) | 4 | 3 | 12 | Dedicate Stage 6 as learning spike, tutorial walkthroughs | Extend Stage 6 by 2 days, pair with online mentor |
| R17 | External | Deployment cost exceeds budget | 3 | 3 | 9 | Use free tiers (Vercel, Railway $5 credit), optimize token usage | Deploy only API+DB, run frontend locally for demo |
| R18 | Technical | Docker Compose fails on Windows | 3 | 2 | 6 | Test on WSL2, document setup steps, use Docker Desktop | Use Railway/Render remote dev environment |
| R19 | Integration | TypeORM entities out of sync with DB | 3 | 3 | 9 | Synchronize: false (always use migrations), schema validation | Drop database, re-run all migrations from scratch |
| R20 | Timeline | Illness/personal emergency (1 week lost) | 2 | 4 | 8 | 2-week project buffer, clear stage documentation | Skip Stage 13 (admin), delegate testing to automated CI |

---

## 4. Risk Matrix

### 4.1 Probability vs Impact Matrix

```
IMPACT →
       1          2          3          4          5
     (Negl)     (Low)      (Med)     (High)    (Crit)
5 ┌─────────┬─────────┬─────────┬─────────┬─────────┐
  │         │         │         │         │         │
P │         │         │         │  R12    │         │
R 4├─────────┼─────────┼─────────┼─────────┼─────────┤
O │         │  R08    │  R02    │         │         │
B │         │         │         │         │         │
  3├─────────┼─────────┼─────────┼─────────┼─────────┤
A │         │  R14    │  R01    │  R03    │         │
B │         │  R18    │  R09    │  R06    │         │
I │         │         │  R10    │  R11    │         │
L 2├─────────┼─────────┼─────────┼─────────┼─────────┤
I │         │         │  R13    │  R05    │  R04    │
T │         │         │         │  R07    │  R15    │
Y │         │         │         │  R20    │         │
  1├─────────┼─────────┼─────────┼─────────┼─────────┤
  │         │         │         │         │         │
    └─────────┴─────────┴─────────┴─────────┴─────────┘

Legend:
R12 = HIGH PRIORITY (16)
R02, R03, R06, R11, R16 = HIGH PRIORITY (12)
R01, R04, R09, R17, R19 = MEDIUM PRIORITY (8-10)
Others = LOW PRIORITY (6 or below)
```

---

## 5. Detailed Risk Analysis

### 5.1 R01: LLM API Costs Exceed Budget

**Category:** Technical  
**Description:** OpenAI API charges per token (input + output). If questions/evaluations are verbose or user testing is extensive, costs could reach $100+/month, exceeding student budget.

**Probability:** Medium (3/5) — depends on usage patterns and prompt length.  
**Impact:** Medium (3/5) — project could continue with reduced functionality.

**Mitigation:**
- Set per-user token limits (e.g., max 10 sessions per month).
- Cache identical questions (same position + difficulty) to avoid re-generating.
- Use mock responses in all automated tests (no real API calls in CI).
- Monitor usage via OpenAI dashboard weekly.

**Contingency:**
- Downgrade to GPT-3.5-turbo (10x cheaper than GPT-4).
- Use Ollama with Llama 2 (free, local) for development.
- Reduce question count from 5 to 3 per session.

---

### 5.2 R02: LLM Response Latency >10s

**Category:** Technical  
**Description:** LLM API calls can take 5-15s depending on prompt complexity and server load. Users waiting >10s without feedback may think app is broken.

**Probability:** High (4/5) — OpenAI API latency is variable.  
**Impact:** Medium (3/5) — poor UX but functionality intact.

**Mitigation:**
- Implement async polling UI: show "Generating questions..." spinner.
- Set 8s timeout on httpx client; retry once if timeout.
- Stream responses using OpenAI streaming API to show partial results.
- Test latency during Stage 7 and tune prompt length to <1000 tokens.

**Contingency:**
- Show progress bar with estimated time (8-10s).
- Display placeholder questions while LLM generates real ones.
- Provide "Generate Later" option: user continues, questions arrive via background job.

---

### 5.3 R03: LLM Hallucinated/Nonsensical Questions

**Category:** Technical  
**Description:** LLMs can generate irrelevant, incoherent, or inappropriate questions despite prompt engineering.

**Probability:** Medium (3/5) — depends on prompt quality.  
**Impact:** High (4/5) — undermines project credibility.

**Mitigation:**
- Use Pydantic schema validation: reject responses missing required fields.
- Include few-shot examples in prompt (2-3 good questions).
- Add heuristic checks: question length 10-200 words, contains "?" character.
- Manual review of 20 sample questions during Stage 7 before scaling.

**Contingency:**
- Maintain curated question bank (50 HR, 50 Technical, 50 Project questions).
- If LLM response fails validation, randomly select from curated bank.
- Log all rejected responses for post-mortem analysis.

---

### 5.4 R04: OpenAI API Key Exposed

**Category:** Technical  
**Description:** API key accidentally committed to GitHub, logged, or visible in browser DevTools.

**Probability:** Low (2/5) — but impact is severe.  
**Impact:** Critical (5/5) — key misuse could incur $1000s of charges.

**Mitigation:**
- Store key in `.env` file, add `.env` to `.gitignore`.
- Use GitHub secret scanning alerts.
- Add pre-commit hook that blocks commits containing "sk-" pattern.
- Never log API key, even in error messages.

**Contingency:**
- **Immediate:** Rotate key in OpenAI dashboard (takes 1 minute).
- Audit usage logs to identify unauthorized requests.
- Revoke compromised key, create new one.
- Enable spending limits ($50/month) in OpenAI account.

---

### 5.5 R05: PostgreSQL Data Loss

**Category:** Technical  
**Description:** Docker container crash, accidental `DROP DATABASE`, or disk failure loses all data.

**Probability:** Low (2/5) — rare but possible.  
**Impact:** High (4/5) — loses test data, delays timeline.

**Mitigation:**
- Use Docker named volume (persists after container restart).
- Daily `pg_dump` backup script (cron job or GitHub Actions scheduled workflow).
- Store backups in separate directory outside repo.
- Test restore process once during Stage 2.

**Contingency:**
- Restore from latest backup (max 24h data loss).
- Re-run TypeORM migrations to recreate schema.
- Seed database with test data script for rapid recovery.

---

### 5.6 R06: TypeORM Migration Failure

**Category:** Technical  
**Description:** Migration alters schema in production, but fails halfway (e.g., constraint violation), leaving database in inconsistent state.

**Probability:** Medium (3/5) — migrations can be tricky.  
**Impact:** High (4/5) — downtime and manual intervention required.

**Mitigation:**
- Always test migrations in staging database before production.
- Use transactions where possible (TypeORM supports transactional migrations).
- Write explicit rollback migration for every forward migration.
- Review migration SQL manually before running.

**Contingency:**
- Run rollback migration to undo changes.
- Fix migration code and redeploy.
- If rollback impossible, restore database from backup (see R05).

---

### 5.7 R07: JWT Refresh Token Stolen

**Category:** Technical  
**Description:** Attacker steals refresh token via XSS or man-in-the-middle, gains long-term access.

**Probability:** Low (2/5) — requires exploit.  
**Impact:** High (4/5) — compromised user account.

**Mitigation:**
- Store refresh token in httpOnly cookie (not accessible to JavaScript).
- Enforce HTTPS only (HSTS header).
- Short expiry (7 days, not 30 days).
- Rotate refresh token on every use (invalidate old token).

**Contingency:**
- Implement refresh token revocation endpoint.
- Force user to re-login after suspicious activity.
- (Future) Add device fingerprinting to detect token reuse from different IP.

---

### 5.8 R08: Resume Parsing Failure

**Category:** Technical  
**Description:** User uploads corrupt PDF, scanned image PDF, or password-protected file; extraction fails.

**Probability:** High (4/5) — users often have unusual files.  
**Impact:** Low (2/5) — user can retry with different file.

**Mitigation:**
- Validate file type via magic bytes (not just extension).
- Set max file size (5MB) to prevent large files.
- Wrap pdf-parse in try-catch, return user-friendly error.
- Test with 10 sample resumes (including edge cases) during Stage 4.

**Contingency:**
- Display error: "Unable to parse resume. Please upload a text-based PDF or DOCX file."
- Allow user to manually enter resume text in textarea as fallback.

---

### 5.9 R09: NestJS-FastAPI Communication Timeout

**Category:** Integration  
**Description:** NestJS calls FastAPI endpoint, but Python service is slow/unresponsive, causing timeout.

**Probability:** Medium (3/5) — LLM calls are slow.  
**Impact:** Medium (3/5) — user sees error, must retry.

**Mitigation:**
- Set httpx timeout to 8s in NestJS.
- Implement exponential backoff retry (3 attempts: 1s, 2s, 4s).
- Log all timeouts for analysis.
- Monitor FastAPI response times via logging.

**Contingency:**
- Return cached response if available (e.g., previously generated questions).
- Display message: "Service temporarily unavailable, please try again in a moment."
- If persistent, increase timeout to 15s (trade-off: worse UX).

---

### 5.10 R10: Next.js-NestJS CORS Issues

**Category:** Integration  
**Description:** Browser blocks API requests due to CORS policy (different origins: localhost:3000 vs localhost:4000).

**Probability:** Low (2/5) — easily configured.  
**Impact:** Medium (3/5) — frontend cannot communicate with backend.

**Mitigation:**
- Configure NestJS CORS to allow frontend origin (`http://localhost:3000` in dev).
- In production, allow only deployed frontend domain (`https://app.example.com`).
- Test CORS in browser DevTools during Stage 3.

**Contingency:**
- Use Next.js API routes (`/app/api/*`) as proxy to NestJS (same-origin).
- Deploy both frontend and backend on same domain with path-based routing.

---

### 5.11 R11: Scope Creep (Voice Features Requested)

**Category:** Timeline  
**Description:** Advisor or user testing suggests adding voice recording, real-time transcription, etc., which balloons scope.

**Probability:** Medium (3/5) — common in projects.  
**Impact:** High (4/5) — adds 3-4 weeks of work.

**Mitigation:**
- Create frozen scope document (this spec!) signed by advisor.
- Change request form: estimate impact (time, complexity) before agreeing.
- Defer to "Phase 2 / Future Work" section in report.
- Politely decline with rationale: "Text MVP demonstrates core concept; voice is enhancement."

**Contingency:**
- If pressure is high, create prototype demo (not integrated) to show feasibility.
- Document as "planned feature" in report without implementing.

---

### 5.12 R12: Timeline Slippage (Stages Overrun)

**Category:** Timeline  
**Description:** Multiple stages take longer than estimated (e.g., NestJS learning curve, TypeORM debugging).

**Probability:** High (4/5) — estimates are optimistic.  
**Impact:** High (4/5) — risks missing submission deadline.

**Mitigation:**
- Build in 2-week buffer (17 weeks estimated, 15 weeks target).
- Deliver staged milestones (M1-M4) to show incremental progress.
- Weekly self-assessment: compare actual vs planned completion.
- Daily commits maintain momentum.

**Contingency:**
- Cut Stage 13 (admin panel) — not critical for user journey.
- Reduce Stage 15 from 1 week to 3 days (skip performance tuning).
- Simplify frontend UI (basic forms, no animations).
- Time saved: 1.5-2 weeks.

---

### 5.13 R13: NestJS/Next.js Version Incompatibility

**Category:** Technical  
**Description:** Upgrading dependencies introduces breaking changes (e.g., Next.js 14 → 15, NestJS 10 → 11).

**Probability:** Low (2/5) — versions are pinned.  
**Impact:** Medium (3/5) — requires code refactor.

**Mitigation:**
- Pin exact versions in package.json (no `^` or `~`).
- Test upgrades in separate branch before merging.
- Review changelogs and migration guides before upgrading.
- Dependabot alerts reviewed weekly, not auto-merged.

**Contingency:**
- Downgrade to last known-good version.
- If upgrade essential (security fix), allocate 1-2 days for migration.

---

### 5.14 R14: Python Dependency Conflicts

**Category:** Technical  
**Description:** pip installs conflicting versions (e.g., Pydantic v1 vs v2, FastAPI incompatibility).

**Probability:** Medium (3/5) — Python dependency management is messy.  
**Impact:** Low (2/5) — Docker isolates environment.

**Mitigation:**
- Use Docker for AI service (isolated from host Python).
- Pin exact versions in `requirements.txt` (`fastapi==0.110.0`).
- Use virtual environment (`venv`) for local development.
- Test `pip install` in fresh container during Stage 6.

**Contingency:**
- Rebuild Docker image from scratch (`docker build --no-cache`).
- Use `pip install --force-reinstall` for specific package.
- Consult package compatibility matrix (FastAPI docs).

---

### 5.15 R15: Plagiarism Concerns

**Category:** Academic  
**Description:** Assessor suspects code was copied from tutorials or AI-generated without attribution.

**Probability:** Low (2/5) — assuming good practices.  
**Impact:** Critical (5/5) — academic integrity violation, failing grade.

**Mitigation:**
- Maintain detailed git commit history (small, frequent commits).
- Document all libraries, tutorials, and AI tools used (ChatGPT, GitHub Copilot).
- Write unique architectural decisions in report (explain "why" not just "how").
- Include code comments explaining non-obvious logic.

**Contingency:**
- Provide git log showing development progression.
- Walkthrough code in viva, explaining design choices.
- Show original whiteboard sketches, planning documents.

---

### 5.16 R16: Knowledge Gap (FastAPI/LLM)

**Category:** Academic  
**Description:** Developer is unfamiliar with FastAPI, prompt engineering, and LLM APIs, slowing Stages 6-9.

**Probability:** High (4/5) — new technologies.  
**Impact:** Medium (3/5) — learning curve extends timeline.

**Mitigation:**
- Dedicate Stage 6 as explicit learning spike (tutorials, sample projects).
- Work through FastAPI official tutorial (3-4 hours).
- Experiment with OpenAI Playground before coding.
- Pair with online community (Discord, Reddit) for questions.

**Contingency:**
- Extend Stage 6 by 2 days if learning takes longer.
- Use simpler library (Flask + OpenAI SDK) if FastAPI too complex.
- Consult with advisor or senior student for mentorship.

---

### 5.17 R17: Deployment Cost Exceeds Budget

**Category:** External  
**Description:** Railway free tier insufficient, costs $20-50/month; student budget is limited.

**Probability:** Medium (3/5) — depends on usage.  
**Impact:** Medium (3/5) — limits testing and demos.

**Mitigation:**
- Optimize resource usage: reduce Docker image size, minimize DB queries.
- Use free tiers: Vercel (frontend), Railway $5 credit (API+DB), Supabase free Postgres.
- Limit token usage to control OpenAI costs (see R01).
- Deploy only during milestones, not continuously.

**Contingency:**
- Deploy only NestJS API and PostgreSQL; run Next.js frontend locally for demo.
- Use University's cloud credits if available (AWS Educate, Azure Student).
- Demonstrate project via localhost with Docker Compose instead of deployed URL.

---

### 5.18 R18: Docker Compose Fails on Windows

**Category:** Technical  
**Description:** Docker Desktop or WSL2 issues on Windows prevent running local dev environment.

**Probability:** Medium (3/5) — Windows + Docker can be finicky.  
**Impact:** Low (2/5) — alternatives available.

**Mitigation:**
- Document setup steps clearly (enable WSL2, allocate memory to Docker).
- Test on fresh Windows machine during Stage 1.
- Provide docker-compose.yml with resource limits to avoid crashes.
- Use Docker Desktop stable version (not edge).

**Contingency:**
- Use WSL2 terminal (Ubuntu) exclusively, avoid Windows Command Prompt.
- Deploy dev environment to Railway/Render and develop against remote DB.
- Use GitHub Codespaces for cloud-based development environment.

---

### 5.19 R19: TypeORM Entities Out of Sync with DB

**Category:** Integration  
**Description:** Developer modifies entity without creating migration; schema and code diverge.

**Probability:** Medium (3/5) — common mistake.  
**Impact:** Medium (3/5) — app crashes with "column not found" errors.

**Mitigation:**
- Set `synchronize: false` in TypeORM config (force manual migrations).
- Add validation step in CI that compares entities to DB schema.
- Document workflow: "Change entity → generate migration → run migration."
- Code review checklist includes "Migration created?"

**Contingency:**
- Drop database and re-run all migrations from scratch (data lost).
- Or manually alter table to match entity changes.
- Generate migration retroactively: `typeorm migration:generate -n FixSchema`.

---

### 5.20 R20: Illness/Personal Emergency

**Category:** Timeline  
**Description:** Developer sick for 1 week or personal crisis requires stepping away from project.

**Probability:** Low (2/5) — unpredictable.  
**Impact:** High (4/5) — loses 1 week of 17-week timeline.

**Mitigation:**
- 2-week buffer in timeline (17 weeks estimated vs 15 target).
- Clear documentation allows resuming work after absence.
- Automated tests and CI ensure code still works after hiatus.
- Daily commits mean no work is lost.

**Contingency:**
- Skip Stage 13 (admin panel) to recover time.
- Delegate repetitive tasks (E2E test writing) to AI tools (GitHub Copilot).
- Request deadline extension from academic department (last resort).

---

## 6. Risk Monitoring Plan

### 6.1 Weekly Risk Review

At the end of each week:
1. Review risk register: have any risks materialized?
2. Update probability/impact based on new information.
3. Check mitigation effectiveness: are controls working?
4. Identify new risks that emerged during the week.

### 6.2 Milestone Risk Gates

At each milestone (M1-M4):
1. **Pre-flight check:** Which risks are most likely in next stage?
2. **Post-mortem:** Which risks occurred, how were they handled?
3. **Update:** Adjust priorities based on experience.

### 6.3 Risk Escalation

| Severity | Action | Escalate To |
|----------|--------|-------------|
| Low (1-4) | Self-manage, document | Personal log |
| Medium (5-9) | Implement mitigation, monitor weekly | Advisor (FYI) |
| High (10-14) | Immediate action, advisor check-in | Advisor (discussion) |
| Critical (15-25) | Emergency meeting, contingency activated | Advisor + Department |

---

## 7. Risk Response Strategies

### 7.1 Avoidance

**Strategy:** Eliminate the risk by changing approach.

**Example:** R11 (Scope Creep)  
**Action:** Freeze scope document at project start, decline all additions.

### 7.2 Mitigation

**Strategy:** Reduce probability or impact.

**Example:** R02 (LLM Latency)  
**Action:** Implement async UI and timeouts to reduce UX impact.

### 7.3 Transfer

**Strategy:** Shift risk to third party.

**Example:** R05 (Data Loss)  
**Action:** Use Railway managed database with automatic backups (risk transferred to platform).

### 7.4 Acceptance

**Strategy:** Acknowledge risk, prepare contingency, but take no preemptive action.

**Example:** R20 (Illness)  
**Action:** Build buffer into timeline, accept that some delay is unavoidable.

---

## 8. Known Unknowns

The following risks are difficult to assess due to limited information:

1. **LLM output quality variability:** OpenAI models improve/change unpredictably. Prompts that work today may produce worse results after model update.
   - **Monitor:** Test prompts monthly against same inputs.

2. **Free tier availability:** Railway/Vercel may change free tier limits without notice.
   - **Monitor:** Follow platform announcements, have backup platform ready (Render).

3. **Academic assessment criteria:** Exact rubric for final project may differ from expectations.
   - **Monitor:** Early advisor feedback, review rubrics from previous years.

---

## 9. Lessons Learned (To Be Updated)

This section will be populated post-project with:
- Which risks materialized and how they were resolved.
- Which risks were over/under-estimated.
- New risks that emerged unexpectedly.
- Effectiveness of mitigation strategies.

---

## 10. Conclusion

The 20 identified risks span technical, timeline, integration, academic, and external categories. The highest-priority risks (R12: timeline slippage, R02/R03: LLM issues, R06/R11: migrations/scope creep) require active mitigation from project start.

The risk matrix shows most risks cluster in the medium-priority range (6-12), indicating a well-balanced project: challenging but achievable. Critical risks (R04: API key exposure, R15: plagiarism) have low probability due to mitigation controls.

Proactive monitoring via weekly reviews and milestone gates ensures risks are caught early. Contingency plans provide fallback options without panic-driven decisions. With disciplined risk management, the project can navigate challenges and deliver a successful MVP within the 17-week timeline.

---

**Approval Status:** Risk register active  
**Review Frequency:** Weekly  
**Next Review:** End of Stage 3 (M1)  
**Owner:** Project Developer
