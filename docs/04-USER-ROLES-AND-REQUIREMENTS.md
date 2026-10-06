# User Roles and Requirements

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Project:** AI-Powered Mock Interview System

---

## 1. Introduction

This document defines the user roles, their responsibilities, permissions, and detailed functional requirements within the AI-Powered Mock Interview System. The MVP focuses on two primary user roles: Student and Admin. Each role has distinct capabilities designed to support the system's core objectives of providing effective interview preparation and system oversight.

---

## 2. User Role Definitions

### 2.1 Student Role

**Primary Purpose:** End-users who utilize the platform to practice and improve their interview skills through AI-powered mock interview sessions.

**Core Responsibilities:**
- Maintain personal profile and professional information
- Upload and manage resume documents
- Create and participate in mock interview sessions
- Review performance reports and track progress over time
- Manage account settings and preferences

**Target Audience:**
- University students preparing for campus placements
- Recent graduates seeking employment
- Early-career professionals looking to improve interview skills
- Anyone preparing for job interviews across HR, technical, and project discussion scenarios

### 2.2 Admin Role

**Primary Purpose:** System administrators who oversee platform operations, monitor system health, manage users, and ensure quality of the interview experience.

**Core Responsibilities:**
- Monitor and manage user accounts
- View and audit interview sessions across all users
- Access system analytics and usage metrics
- Manage question seed data and interview templates
- Monitor AI service health and system performance
- Handle user support escalations

**Target Audience:**
- System administrators
- Platform maintainers
- Educational institution coordinators
- Technical support staff

---

## 3. Detailed Functional Requirements by Role

### 3.1 Student Role Requirements

#### SR-01: User Registration
Students must be able to create new accounts by providing email, password, full name, and accepting terms of service. Email verification should be sent upon registration.

#### SR-02: User Login
Students must be able to authenticate using email and password credentials, receiving JWT access and refresh tokens upon successful authentication.

#### SR-03: Password Reset
Students must be able to request password reset via email when they forget their credentials, receiving a time-limited reset link.

#### SR-04: Profile Management
Students must be able to view and edit their profile information including name, email, phone number, education details, and current employment status.

#### SR-05: Resume Upload
Students must be able to upload resume documents in PDF or DOCX format, with a maximum file size of 5MB per document.

#### SR-06: Resume Management
Students must be able to view uploaded resumes, download them, delete old versions, and mark one as the active resume for interview question generation.

#### SR-07: Skill Tags
Students must be able to add, edit, and remove skill tags to their profile to better categorize their expertise areas (e.g., "JavaScript", "Data Structures", "Communication").

#### SR-08: Interview Session Creation
Students must be able to create new interview sessions by selecting interview type (HR, Technical, or Project-based), difficulty level (Easy, Medium, Hard), and estimated duration (15, 30, 45, or 60 minutes).

#### SR-09: Interview Configuration
Students must be able to specify focus areas or topics for technical and project-based interviews based on their resume content and skill tags.

#### SR-10: Start Interview Session
Students must be able to start a configured interview session, which initializes the AI question generation process and begins the timer.

#### SR-11: View Interview Questions
Students must be able to view AI-generated questions one at a time during an active interview session, with clear presentation and adequate time to read.

#### SR-12: Submit Answers
Students must be able to type and submit text answers to interview questions, with character count display and optional draft saving.

#### SR-13: Pause Interview
Students must be able to pause an in-progress interview session, which stops the timer and allows resumption later from the same point.

#### SR-14: Resume Interview
Students must be able to resume a paused interview session, continuing from where they left off with timer resumption.

#### SR-15: End Interview
Students must be able to manually end an interview session before all questions are completed, triggering the AI summarization process.

#### SR-16: Session Timer
Students must see a visible countdown timer during interview sessions that tracks remaining time based on the configured duration.

#### SR-17: View Session Report
Students must be able to view detailed performance reports for completed interview sessions, including scores, strengths, weaknesses, and improvement recommendations.

#### SR-18: Progress Dashboard
Students must be able to access a dashboard showing their overall progress, including total sessions completed, average scores by interview type, and trend analysis over time.

#### SR-19: Session History
Students must be able to view a list of all their past interview sessions with filters for date range, interview type, and status.

#### SR-20: Skill Gap Analysis
Students must be able to view analyzed skill gaps based on their interview performance, identifying areas needing improvement.

#### SR-21: Recommendations
Students must receive personalized recommendations for future practice areas based on their performance history and identified weaknesses.

#### SR-22: Account Settings
Students must be able to manage account settings including notification preferences, timezone, and language preferences.

#### SR-23: Session Deletion
Students must be able to delete their own interview sessions, which soft-deletes the session and associated data from their view.

#### SR-24: Logout
Students must be able to securely logout, which invalidates their current access token and clears client-side session data.

### 3.2 Admin Role Requirements

#### AR-01: Admin Login
Admins must be able to authenticate using admin credentials with additional security measures such as mandatory 2FA (future enhancement noted).

#### AR-02: User Management Dashboard
Admins must be able to view a paginated list of all registered users with search and filter capabilities by registration date, status, and activity level.

#### AR-03: View User Details
Admins must be able to view detailed information for any user including profile data, registration date, last login, and activity summary.

#### AR-04: Suspend User Account
Admins must be able to suspend user accounts, preventing login and session access while retaining data for potential restoration.

#### AR-05: Reactivate User Account
Admins must be able to reactivate previously suspended accounts, restoring full access privileges.

#### AR-06: Delete User Account
Admins must be able to permanently delete user accounts (hard delete) after appropriate confirmation, removing all associated data per retention policy.

#### AR-07: View All Interview Sessions
Admins must be able to view a paginated list of all interview sessions across all users with filters for date, type, status, and user.

#### AR-08: View Session Details
Admins must be able to view full details of any interview session including questions asked, answers provided, and AI evaluations.

#### AR-09: System Analytics Dashboard
Admins must be able to access a comprehensive analytics dashboard showing key metrics: total users, active users (last 7/30 days), total sessions, sessions by type, average scores, and system usage trends.

#### AR-10: Interview Type Distribution
Admins must be able to view statistical breakdowns of interview sessions by type (HR vs Technical vs Project) over configurable time periods.

#### AR-11: Performance Metrics
Admins must be able to view aggregate performance metrics including average session duration, completion rates, and score distributions.

#### AR-12: Question Seed Management
Admins must be able to view, add, edit, and remove seed questions and prompts used by the AI service for generating interview questions.

#### AR-13: Question Template Categories
Admins must be able to organize question seeds into categories by interview type and difficulty level for better AI prompt engineering.

#### AR-14: AI Service Health Monitoring
Admins must be able to view real-time health status of the AI service including response times, error rates, and availability metrics.

#### AR-15: System Logs
Admins must be able to access and search system logs for debugging and audit purposes, with filters for log level, service, and time range.

#### AR-16: Audit Trail
Admins must be able to view an audit log of all administrative actions taken, including who performed the action, when, and what was changed.

#### AR-17: Export Data
Admins must be able to export system data (user lists, session reports, analytics) in CSV format for external analysis.

#### AR-18: System Configuration
Admins must be able to modify system configuration parameters such as session time limits, file upload size limits, and rate limiting thresholds.

#### AR-19: Bulk User Operations
Admins must be able to perform bulk operations on user accounts such as sending announcement emails or applying tags to user groups.

#### AR-20: Admin Logout
Admins must be able to securely logout, invalidating all active sessions and clearing authentication tokens.

---

## 4. User Journey Narratives

### 4.1 Student User Journey: First-Time Experience

**Scenario:** Sarah is a final-year computer science student preparing for campus placement interviews.

1. **Discovery & Registration:** Sarah discovers the platform through her university career portal. She clicks "Sign Up" and provides her email (sarah.student@university.edu), creates a strong password, enters her full name, and accepts the terms. She receives a verification email.

2. **Email Verification:** Sarah opens the verification email and clicks the confirmation link, which redirects her to the login page with a success message.

3. **First Login:** Sarah enters her credentials and is successfully authenticated, receiving her first view of the student dashboard.

4. **Profile Setup:** The system prompts Sarah to complete her profile. She adds her phone number, education details (University of Example, B.Sc. Computer Science, Expected graduation May 2025), and adds skill tags: "Python", "Data Structures", "Algorithms", "Communication".

5. **Resume Upload:** Sarah uploads her latest resume in PDF format (1.2 MB). The system processes the file, extracts text content, and confirms successful upload. The resume is marked as "Active" by default.

6. **Creating First Interview:** Sarah navigates to "New Interview" and configures her first session:
   - Type: Technical
   - Difficulty: Medium
   - Duration: 30 minutes
   - Focus areas: Data structures and algorithms (auto-suggested from resume)

7. **Starting Interview:** Sarah clicks "Start Interview" and sees a loading indicator while the AI generates the first question. Within 5 seconds, her first question appears: "Can you explain the difference between a stack and a queue, and provide use cases for each?"

8. **Answering Questions:** Sarah types her answer in the text area, watching the character count increase. She takes 3 minutes to formulate her response and clicks "Submit Answer". The AI evaluates her response (takes 6 seconds) and generates a follow-up question.

9. **Continuing Session:** Sarah answers 8 questions over 28 minutes. The timer display keeps her aware of remaining time. She notices the questions adapt to her resume content, asking about a project she mentioned.

10. **Completing Interview:** After the final question, the timer expires and the session automatically ends. A loading screen appears with the message "Analyzing your performance..."

11. **Viewing Report:** After 10 seconds, Sarah's performance report appears showing:
    - Overall score: 72/100
    - Strengths: Strong understanding of fundamental concepts, good examples provided
    - Weaknesses: Could improve on time complexity analysis, lacked depth in explaining trade-offs
    - Recommendations: Practice more problems on algorithmic complexity, review space-time trade-offs

12. **Dashboard Review:** Sarah returns to her dashboard and sees her first session logged with the score and date. A progress chart shows one data point. She feels motivated to improve and schedules another session for next week.

### 4.2 Admin User Journey: Daily Workflow

**Scenario:** Michael is a system administrator responsible for monitoring the platform during business hours.

1. **Morning Login:** Michael arrives at his desk at 9:00 AM and navigates to the admin portal. He enters his admin credentials and completes 2FA authentication (future enhancement), accessing the admin dashboard.

2. **Health Check:** Michael's first task is checking the system health dashboard. He reviews:
   - Total active users: 247 (up from 230 yesterday)
   - Sessions in last 24 hours: 89 (typical daily volume)
   - AI service status: Healthy (avg response time 4.2s)
   - Database connections: 45/100 pool usage
   - Error rate: 0.3% (within acceptable range)

3. **User Management Review:** Michael navigates to the User Management section and filters for "Registered in last 7 days". He sees 23 new users, scans through them checking for suspicious registrations (duplicate names, fake emails). Everything appears legitimate.

4. **Support Ticket Resolution:** Michael receives an internal ticket that a student cannot start interviews. He searches for the user by email, views their profile, and examines their recent activity logs. He notices the user's account was soft-deleted due to a previous request. Michael reactivates the account and notifies support that the issue is resolved.

5. **Analytics Review:** At 11:00 AM, Michael generates the weekly analytics report:
   - Interview type distribution: 45% Technical, 35% HR, 20% Project
   - Average completion rate: 87%
   - Average session score: 68/100
   - Peak usage hours: 2-5 PM and 8-10 PM

6. **Question Seed Management:** Michael receives feedback from the academic team that HR interview questions need more focus on behavioral scenarios. He navigates to Question Seed Management, filters for "HR" category, and adds 5 new seed prompts focusing on STAR method questions and conflict resolution scenarios.

7. **Incident Investigation:** At 2:30 PM, Michael notices a spike in AI service response time (now 12s average). He checks the AI service logs and sees increased traffic from a legitimate spike in concurrent users. He notes this for capacity planning but determines no immediate action is needed as the service is still responding within acceptable SLA.

8. **Audit Log Review:** Before end of day, Michael reviews the admin audit log to ensure no unauthorized admin actions were taken. All entries show expected operations by himself and one other admin.

9. **Data Export:** Michael exports the weekly user growth and session completion data to CSV for the monthly steering committee report.

10. **End of Day Logout:** At 5:00 PM, Michael performs a final health check, sees all systems green, and securely logs out.

---

## 5. Permission Matrix

The following table maps features to user roles, indicating access levels:

```
┌────────────────────────────────────────┬─────────┬───────┐
│ Feature / Capability                   │ Student │ Admin │
├────────────────────────────────────────┼─────────┼───────┤
│ AUTHENTICATION                         │         │       │
│ - Register Account                     │    ✓    │   ✗   │
│ - Login                                │    ✓    │   ✓   │
│ - Password Reset                       │    ✓    │   ✓   │
│ - Logout                               │    ✓    │   ✓   │
├────────────────────────────────────────┼─────────┼───────┤
│ PROFILE MANAGEMENT                     │         │       │
│ - View Own Profile                     │    ✓    │   ✓   │
│ - Edit Own Profile                     │    ✓    │   ✓   │
│ - Upload Resume                        │    ✓    │   ✗   │
│ - Manage Skills                        │    ✓    │   ✗   │
│ - View Any User Profile                │    ✗    │   ✓   │
├────────────────────────────────────────┼─────────┼───────┤
│ INTERVIEW SESSIONS                     │         │       │
│ - Create Session                       │    ✓    │   ✗   │
│ - Start Session                        │    ✓    │   ✗   │
│ - Answer Questions                     │    ✓    │   ✗   │
│ - Pause/Resume Session                 │    ✓    │   ✗   │
│ - End Session                          │    ✓    │   ✗   │
│ - View Own Sessions                    │    ✓    │   ✓   │
│ - View All User Sessions               │    ✗    │   ✓   │
│ - Delete Own Session                   │    ✓    │   ✗   │
├────────────────────────────────────────┼─────────┼───────┤
│ REPORTS & ANALYTICS                    │         │       │
│ - View Own Session Reports             │    ✓    │   ✓   │
│ - View Own Progress Dashboard          │    ✓    │   ✓   │
│ - View System Analytics                │    ✗    │   ✓   │
│ - View All User Reports                │    ✗    │   ✓   │
│ - Export Analytics Data                │    ✗    │   ✓   │
├────────────────────────────────────────┼─────────┼───────┤
│ USER MANAGEMENT                        │         │       │
│ - View All Users                       │    ✗    │   ✓   │
│ - Suspend User                         │    ✗    │   ✓   │
│ - Reactivate User                      │    ✗    │   ✓   │
│ - Delete User                          │    ✗    │   ✓   │
│ - Bulk User Operations                 │    ✗    │   ✓   │
├────────────────────────────────────────┼─────────┼───────┤
│ SYSTEM ADMINISTRATION                  │         │       │
│ - Manage Question Seeds                │    ✗    │   ✓   │
│ - View System Health                   │    ✗    │   ✓   │
│ - View System Logs                     │    ✗    │   ✓   │
│ - View Audit Trail                     │    ✗    │   ✓   │
│ - Modify System Configuration          │    ✗    │   ✓   │
└────────────────────────────────────────┴─────────┴───────┘

Legend: ✓ = Full Access, ✗ = No Access
```

---

## 6. Future Role Considerations (Post-MVP)

While the MVP focuses on Student and Admin roles, the architecture should accommodate future role expansion:

### 6.1 Recruiter Role (Future)
**Purpose:** Corporate recruiters who want to evaluate candidates through the platform.

**Potential Capabilities:**
- Create custom interview templates for their organization
- Invite candidates to complete specific interview sessions
- View candidate performance reports
- Compare multiple candidates
- Export candidate evaluation data

**Why Excluded from MVP:** Adds complexity around multi-tenancy, custom branding, and B2B billing that are not core to the educational use case.

### 6.2 Instructor Role (Future)
**Purpose:** Faculty members or career counselors who monitor student progress and provide guidance.

**Potential Capabilities:**
- View assigned student cohorts
- Monitor student progress and engagement
- Provide manual feedback on sessions
- Create curated interview practice assignments
- Access aggregated cohort analytics

**Why Excluded from MVP:** Requires implementing group management, assignment workflows, and instructor-student relationships that increase scope significantly.

### 6.3 Mentor Role (Future)
**Purpose:** Industry professionals who volunteer to provide personalized feedback and guidance.

**Potential Capabilities:**
- Review assigned student sessions
- Provide detailed written feedback
- Schedule live mentoring sessions
- Track mentorship impact

**Why Excluded from MVP:** Introduces human-in-the-loop workflows and scheduling complexity beyond the AI-automated focus of the MVP.

---

## 7. Role Assignment and Management

### 7.1 Initial Role Assignment
- All new registrations via the public signup form automatically receive the **Student** role
- **Admin** role must be assigned manually through database operations or a super-admin interface (future)
- The initial system deployment includes seeding one admin account through migration scripts

### 7.2 Role Verification
- JWT tokens include a `role` claim that is verified on protected API endpoints
- Frontend routes conditionally render based on user role
- Backend guards check role permissions before executing business logic

### 7.3 Role Transition
- MVP does not support role changes through the UI
- Role changes require database updates and token refresh
- User must log out and log back in for role changes to take effect

---

## 8. Cross-Role Considerations

### 8.1 Data Privacy
- Admins can view student data for support and monitoring purposes
- Student answers and performance data are considered sensitive; admin access is logged in audit trail
- Future GDPR-inspired features may allow students to request data export or deletion

### 8.2 Notification Preferences
- Both roles can configure email notification preferences
- Students receive notifications for completed session reports
- Admins receive notifications for system alerts and critical errors

### 8.3 Account Security
- Both roles are subject to the same password complexity requirements
- Both roles support password reset via email
- Admin role will require 2FA in post-MVP phase

---

## 9. Acceptance Criteria

### 9.1 Student Role Acceptance Criteria
- A student can complete the full journey from registration to viewing their first interview report without admin intervention
- Students cannot access admin-only features (attempts result in 403 Forbidden)
- Students can only view and manage their own data (sessions, reports, profile)

### 9.2 Admin Role Acceptance Criteria
- An admin can view system health metrics within 2 seconds of dashboard load
- An admin can search for and view any user's profile within 3 clicks
- An admin can perform user management operations with appropriate confirmation dialogs
- All admin actions are logged in the audit trail with timestamp and actor identification

---

## 10. Conclusion

This document establishes the foundational user roles for the AI-Powered Mock Interview System MVP. The Student role provides comprehensive self-service capabilities for interview practice, while the Admin role ensures platform health, user support, and data oversight. The permission matrix clearly delineates capabilities, and the user journey narratives illustrate realistic usage patterns. Future role expansion is acknowledged but deliberately excluded to maintain MVP scope focus.

The detailed functional requirements provide a numbered, traceable foundation for subsequent design, development, and testing phases.
