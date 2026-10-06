# Functional Requirements

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Project:** AI-Powered Mock Interview System

---

## 1. Introduction

This document provides a comprehensive, structured list of functional requirements for the AI-Powered Mock Interview System. Requirements are organized by functional domain and assigned unique identifiers for traceability throughout the development lifecycle. Each requirement includes a priority classification following the MoSCoW method (Must Have, Should Have, Could Have) to guide MVP scope decisions.

---

## 2. Requirement Categories

The functional requirements are organized into six primary categories:
- **FR-AUTH:** Authentication & Authorization
- **FR-PROFILE:** User Profile Management
- **FR-INTERVIEW:** Interview Session Management
- **FR-AI:** AI Interaction & Intelligence
- **FR-REPORT:** Reporting & Analytics
- **FR-ADMIN:** Administrative Functions

---

## 3. FR-AUTH: Authentication & Authorization

### FR-AUTH-01: User Registration
**Priority:** Must Have  
**Description:** The system shall allow new users to register by providing email address, password (minimum 8 characters with at least one uppercase, one lowercase, one number, and one special character), full name, and acceptance of terms of service.

### FR-AUTH-02: Email Verification
**Priority:** Must Have  
**Description:** The system shall send an email verification link to newly registered users, which must be clicked within 24 hours to activate the account.

### FR-AUTH-03: User Login
**Priority:** Must Have  
**Description:** The system shall authenticate users via email and password credentials, issuing a JWT access token (15-minute expiry) and refresh token (7-day expiry) upon successful authentication.

### FR-AUTH-04: Token Refresh
**Priority:** Must Have  
**Description:** The system shall provide an endpoint to exchange a valid refresh token for a new access token without requiring re-authentication.

### FR-AUTH-05: User Logout
**Priority:** Must Have  
**Description:** The system shall invalidate the user's refresh token upon logout request, clearing all client-side authentication state.

### FR-AUTH-06: Password Reset Request
**Priority:** Must Have  
**Description:** The system shall allow users to request a password reset by providing their registered email address, which triggers a time-limited (1 hour) reset link sent via email.

### FR-AUTH-07: Password Reset Confirmation
**Priority:** Must Have  
**Description:** The system shall allow users to set a new password using a valid reset token, applying the same password complexity requirements as registration.

### FR-AUTH-08: Protected Route Authorization
**Priority:** Must Have  
**Description:** The system shall verify JWT access tokens on all protected API endpoints, returning 401 Unauthorized for missing or invalid tokens.

### FR-AUTH-09: Role-Based Access Control
**Priority:** Must Have  
**Description:** The system shall enforce role-based permissions, preventing students from accessing admin endpoints and vice versa, returning 403 Forbidden for unauthorized role access attempts.

### FR-AUTH-10: Session Expiry Handling
**Priority:** Should Have  
**Description:** The system shall automatically redirect users to login when their access token expires and refresh token is invalid or expired.

### FR-AUTH-11: Account Lockout
**Priority:** Should Have  
**Description:** The system shall temporarily lock user accounts after 5 consecutive failed login attempts within 15 minutes, requiring a 30-minute waiting period or password reset.

### FR-AUTH-12: Login Activity Tracking
**Priority:** Could Have  
**Description:** The system shall log successful and failed login attempts with timestamp and IP address for security auditing purposes.

---

## 4. FR-PROFILE: User Profile Management

### FR-PROFILE-01: View Profile
**Priority:** Must Have  
**Description:** The system shall allow authenticated users to view their complete profile information including name, email, phone number, education details, current employment status, and skill tags.

### FR-PROFILE-02: Edit Profile Information
**Priority:** Must Have  
**Description:** The system shall allow users to update their name, phone number, education details, and employment status through a profile edit form.

### FR-PROFILE-03: Email Change Verification
**Priority:** Should Have  
**Description:** The system shall require email verification when a user updates their email address, sending a confirmation link to the new email before applying the change.

### FR-PROFILE-04: Skill Tags Management
**Priority:** Must Have  
**Description:** The system shall allow users to add skill tags from a predefined list (with autocomplete) or create custom tags, with a maximum of 20 skills per profile.

### FR-PROFILE-05: Resume Upload
**Priority:** Must Have  
**Description:** The system shall allow users to upload resume files in PDF or DOCX format with a maximum file size of 5 MB per document.

### FR-PROFILE-06: Resume Text Extraction
**Priority:** Must Have  
**Description:** The system shall automatically extract text content from uploaded resume files for use in AI question generation and profile analysis.

### FR-PROFILE-07: Multiple Resume Storage
**Priority:** Should Have  
**Description:** The system shall allow users to store up to 3 resume versions simultaneously, with the ability to designate one as "Active" for current use.

### FR-PROFILE-08: Resume Download
**Priority:** Should Have  
**Description:** The system shall allow users to download their previously uploaded resume files in their original format.

### FR-PROFILE-09: Resume Deletion
**Priority:** Must Have  
**Description:** The system shall allow users to delete uploaded resume files, with confirmation prompt if the resume is currently marked as active.

### FR-PROFILE-10: Profile Completion Status
**Priority:** Should Have  
**Description:** The system shall display a profile completion percentage indicator and prompt users to complete missing fields (resume, skills, education) before their first interview.

### FR-PROFILE-11: Profile Picture Upload
**Priority:** Could Have  
**Description:** The system shall allow users to upload a profile picture in JPEG or PNG format with a maximum file size of 2 MB.

### FR-PROFILE-12: Account Deletion Request
**Priority:** Could Have  
**Description:** The system shall allow users to request account deletion, which soft-deletes their account and all associated data after a 30-day grace period.

---

## 5. FR-INTERVIEW: Interview Session Management

### FR-INTERVIEW-01: Create Interview Session
**Priority:** Must Have  
**Description:** The system shall allow users to create a new interview session by selecting interview type (HR, Technical, or Project-based), difficulty level (Easy, Medium, Hard), and duration (15, 30, 45, or 60 minutes).

### FR-INTERVIEW-02: Interview Type Selection
**Priority:** Must Have  
**Description:** The system shall offer three interview types: HR (behavioral and soft skills), Technical (programming and problem-solving), and Project (discussion of past projects from resume).

### FR-INTERVIEW-03: Difficulty Configuration
**Priority:** Must Have  
**Description:** The system shall allow users to select difficulty level, which influences the complexity and depth of AI-generated questions.

### FR-INTERVIEW-04: Focus Area Specification
**Priority:** Should Have  
**Description:** The system shall allow users to optionally specify focus areas or topics for technical and project-based interviews based on their resume content and skill tags.

### FR-INTERVIEW-05: Session Validation
**Priority:** Must Have  
**Description:** The system shall validate that users have an active resume uploaded before allowing them to create technical or project-based interview sessions.

### FR-INTERVIEW-06: Start Interview Session
**Priority:** Must Have  
**Description:** The system shall transition a created session to "In Progress" status when the user clicks "Start Interview", triggering initial AI question generation and starting the countdown timer.

### FR-INTERVIEW-07: Question Display
**Priority:** Must Have  
**Description:** The system shall display one AI-generated question at a time to the user, with clear formatting and adequate reading space.

### FR-INTERVIEW-08: Answer Input
**Priority:** Must Have  
**Description:** The system shall provide a multi-line text area for users to type their answers, with real-time character count display and a minimum of 50 characters required per answer.

### FR-INTERVIEW-09: Answer Submission
**Priority:** Must Have  
**Description:** The system shall allow users to submit their typed answer, which triggers AI evaluation and generation of the next question or follow-up.

### FR-INTERVIEW-10: Loading State Display
**Priority:** Must Have  
**Description:** The system shall display loading indicators during AI processing with estimated wait time messages (e.g., "Analyzing your answer...") to manage user expectations.

### FR-INTERVIEW-11: Session Timer
**Priority:** Must Have  
**Description:** The system shall display a countdown timer showing remaining session time in MM:SS format, visible at all times during an active interview.

### FR-INTERVIEW-12: Timer Expiry Handling
**Priority:** Must Have  
**Description:** The system shall automatically end the interview session when the timer reaches 00:00, preventing further answer submissions and triggering session summarization.

### FR-INTERVIEW-13: Pause Interview Session
**Priority:** Should Have  
**Description:** The system shall allow users to pause an in-progress interview session, which stops the timer and saves the current state for later resumption within 24 hours.

### FR-INTERVIEW-14: Resume Interview Session
**Priority:** Should Have  
**Description:** The system shall allow users to resume a paused session from the exact question where they left off, resuming the countdown timer with remaining time.

### FR-INTERVIEW-15: Manual Session End
**Priority:** Must Have  
**Description:** The system shall allow users to manually end an interview session before all questions are answered or time expires, with a confirmation prompt.

### FR-INTERVIEW-16: Session State Persistence
**Priority:** Must Have  
**Description:** The system shall persist all session state including questions asked, answers submitted, and timer state to prevent data loss if the user navigates away or loses connection.

### FR-INTERVIEW-17: Question Numbering
**Priority:** Should Have  
**Description:** The system shall display the current question number and optionally the total planned questions (e.g., "Question 5 of 10") to provide progress context.

### FR-INTERVIEW-18: Answer Draft Saving
**Priority:** Could Have  
**Description:** The system shall automatically save answer drafts every 30 seconds while the user is typing, preventing loss of work if the browser crashes.

### FR-INTERVIEW-19: Interview Abandonment Detection
**Priority:** Should Have  
**Description:** The system shall automatically mark sessions as "Abandoned" if they remain paused for more than 24 hours without resumption.

### FR-INTERVIEW-20: Session History View
**Priority:** Must Have  
**Description:** The system shall provide a paginated list of all user interview sessions with columns for date, type, difficulty, status, and score (if completed).

### FR-INTERVIEW-21: Session History Filtering
**Priority:** Should Have  
**Description:** The system shall allow users to filter their session history by interview type, date range, and status (completed, abandoned, in-progress).

### FR-INTERVIEW-22: Session Deletion
**Priority:** Should Have  
**Description:** The system shall allow users to soft-delete their own interview sessions, which removes them from the user's view but retains data for admin audit purposes.

---

## 6. FR-AI: AI Interaction & Intelligence

### FR-AI-01: Initial Question Generation
**Priority:** Must Have  
**Description:** The system shall generate the first interview question within 8 seconds of session start based on interview type, difficulty level, and user's active resume content.

### FR-AI-02: Resume-Based Contextualization
**Priority:** Must Have  
**Description:** The system shall use extracted resume text to generate contextually relevant questions, particularly for technical and project-based interviews.

### FR-AI-03: Skill-Based Question Targeting
**Priority:** Should Have  
**Description:** The system shall incorporate user skill tags into question generation prompts to ensure questions align with the user's stated expertise areas.

### FR-AI-04: Answer Evaluation
**Priority:** Must Have  
**Description:** The system shall evaluate submitted answers within 8 seconds, analyzing completeness, accuracy, clarity, and relevance to generate a numerical score (0-100) and qualitative feedback.

### FR-AI-05: Follow-Up Question Generation
**Priority:** Must Have  
**Description:** The system shall generate follow-up questions based on the user's previous answer, creating a dynamic conversation flow rather than a static question list.

### FR-AI-06: Adaptive Difficulty
**Priority:** Should Have  
**Description:** The system shall adjust question difficulty within a session based on user performance, increasing complexity if answers are strong or simplifying if the user struggles.

### FR-AI-07: Question Diversity
**Priority:** Should Have  
**Description:** The system shall generate diverse questions within a session, covering multiple aspects of the selected interview type rather than focusing on a single narrow topic.

### FR-AI-08: Behavioral Question Structure
**Priority:** Must Have  
**Description:** For HR interviews, the system shall generate behavioral questions following structured formats like STAR (Situation, Task, Action, Result) method.

### FR-AI-09: Technical Question Categories
**Priority:** Must Have  
**Description:** For technical interviews, the system shall generate questions across categories including data structures, algorithms, system design, and domain-specific technologies from the resume.

### FR-AI-10: Project Deep-Dive Questions
**Priority:** Must Have  
**Description:** For project-based interviews, the system shall generate questions that probe specific projects mentioned in the resume, asking about challenges, decisions, and outcomes.

### FR-AI-11: Answer Scoring Breakdown
**Priority:** Should Have  
**Description:** The system shall provide scoring breakdown for evaluated answers across dimensions: completeness (0-25), accuracy (0-25), clarity (0-25), and depth (0-25).

### FR-AI-12: Real-Time Feedback Hints
**Priority:** Could Have  
**Description:** The system shall optionally provide subtle real-time hints during answering if the user is significantly off-track, without giving away the complete answer.

### FR-AI-13: Session Summarization
**Priority:** Must Have  
**Description:** Upon session completion, the system shall generate a comprehensive summary including overall performance, strengths, weaknesses, and improvement recommendations within 15 seconds.

### FR-AI-14: Strength Identification
**Priority:** Must Have  
**Description:** The system shall analyze all answers in a completed session to identify 3-5 key strengths demonstrated by the user with specific examples from their answers.

### FR-AI-15: Weakness Identification
**Priority:** Must Have  
**Description:** The system shall analyze all answers to identify 3-5 areas for improvement with specific feedback on what was missing or incorrect.

### FR-AI-16: Recommendation Generation
**Priority:** Should Have  
**Description:** The system shall generate 3-5 actionable recommendations for future practice based on identified weaknesses and overall performance patterns.

### FR-AI-17: Error Handling for AI Failures
**Priority:** Must Have  
**Description:** The system shall gracefully handle AI service failures or timeouts by displaying user-friendly error messages and allowing users to retry or end the session without data loss.

### FR-AI-18: Prompt Template Management
**Priority:** Should Have  
**Description:** The system shall use configurable prompt templates for different interview types and question generation scenarios, allowing admins to refine AI behavior without code changes.

### FR-AI-19: Response Validation
**Priority:** Must Have  
**Description:** The system shall validate AI-generated content for appropriate length, format, and absence of harmful or inappropriate content before displaying to users.

---

## 7. FR-REPORT: Reporting & Analytics

### FR-REPORT-01: Session Performance Report
**Priority:** Must Have  
**Description:** The system shall generate and display a detailed performance report for each completed session, including overall score, per-question scores, time taken, strengths, weaknesses, and recommendations.

### FR-REPORT-02: Question-Answer Review
**Priority:** Must Have  
**Description:** The system shall allow users to review all questions asked and answers provided in a completed session, with the AI's evaluation feedback displayed for each answer.

### FR-REPORT-03: Score Visualization
**Priority:** Should Have  
**Description:** The system shall visualize session scores using charts or progress bars, showing overall score and per-dimension breakdown (completeness, accuracy, clarity, depth).

### FR-REPORT-04: Progress Dashboard
**Priority:** Must Have  
**Description:** The system shall provide a dashboard showing user's overall progress including total sessions completed, average score by interview type, and recent activity.

### FR-REPORT-05: Score Trend Analysis
**Priority:** Should Have  
**Description:** The system shall display score trends over time using line charts, showing improvement or decline across multiple sessions.

### FR-REPORT-06: Interview Type Performance Comparison
**Priority:** Should Have  
**Description:** The system shall compare user performance across different interview types (HR, Technical, Project) to identify relative strengths.

### FR-REPORT-07: Skill Gap Analysis
**Priority:** Should Have  
**Description:** The system shall analyze performance across sessions to identify skill gaps, matching weaknesses to user's skill tags and resume content.

### FR-REPORT-08: Recommendation History
**Priority:** Could Have  
**Description:** The system shall track whether users have acted on previous recommendations by checking if subsequent sessions focused on suggested improvement areas.

### FR-REPORT-09: Session Duration Analytics
**Priority:** Should Have  
**Description:** The system shall display average session duration and time management insights, identifying if users consistently run out of time or finish early.

### FR-REPORT-10: Completion Rate Tracking
**Priority:** Should Have  
**Description:** The system shall track session completion rate (completed vs abandoned sessions) and display it on the user dashboard as a consistency metric.

### FR-REPORT-11: Report Export to PDF
**Priority:** Could Have  
**Description:** The system shall allow users to export individual session reports as PDF documents for personal records or sharing with mentors.

### FR-REPORT-12: Report Sharing Link
**Priority:** Could Have  
**Description:** The system shall generate a shareable, time-limited link for specific session reports that can be viewed by others without authentication.

---

## 8. FR-ADMIN: Administrative Functions

### FR-ADMIN-01: User Management Dashboard
**Priority:** Must Have  
**Description:** The system shall provide admins with a paginated, searchable list of all registered users showing email, name, registration date, last login, and account status.

### FR-ADMIN-02: User Search
**Priority:** Must Have  
**Description:** The system shall allow admins to search for users by email, name, or user ID with real-time filtering.

### FR-ADMIN-03: User Detail View
**Priority:** Must Have  
**Description:** The system shall allow admins to view complete details for any user including profile information, session history, and activity timeline.

### FR-ADMIN-04: Suspend User Account
**Priority:** Must Have  
**Description:** The system shall allow admins to suspend user accounts with a reason note, preventing login and session access while retaining all data.

### FR-ADMIN-05: Reactivate User Account
**Priority:** Must Have  
**Description:** The system shall allow admins to reactivate suspended accounts, immediately restoring full access privileges.

### FR-ADMIN-06: Delete User Account
**Priority:** Should Have  
**Description:** The system shall allow admins to permanently delete user accounts with a confirmation step, removing all associated data per retention policy.

### FR-ADMIN-07: View All Sessions
**Priority:** Must Have  
**Description:** The system shall provide admins with a paginated list of all interview sessions across all users with filters for date, type, status, and user.

### FR-ADMIN-08: Session Detail View
**Priority:** Must Have  
**Description:** The system shall allow admins to view full details of any interview session including all questions, answers, and AI evaluations for audit purposes.

### FR-ADMIN-09: System Analytics Dashboard
**Priority:** Must Have  
**Description:** The system shall provide admins with a dashboard showing key metrics: total users, active users (7/30 days), total sessions, sessions by type, average scores, and usage trends.

### FR-ADMIN-10: User Growth Chart
**Priority:** Should Have  
**Description:** The system shall display user registration trends over time using a line or bar chart with configurable date ranges.

### FR-ADMIN-11: Session Volume Analytics
**Priority:** Should Have  
**Description:** The system shall display session creation and completion volumes over time, identifying usage patterns and peak hours.

### FR-ADMIN-12: Performance Metrics Aggregate
**Priority:** Should Have  
**Description:** The system shall calculate and display aggregate performance metrics including average session scores, completion rates, and score distribution histograms.

### FR-ADMIN-13: Question Seed Management
**Priority:** Should Have  
**Description:** The system shall allow admins to view, add, edit, and delete question seed prompts used by the AI service, organized by interview type and difficulty.

### FR-ADMIN-14: AI Service Health Monitoring
**Priority:** Must Have  
**Description:** The system shall display real-time AI service health status including availability, average response time, error rate, and last successful request timestamp.

### FR-ADMIN-15: System Log Access
**Priority:** Should Have  
**Description:** The system shall allow admins to view and search application logs with filters for log level (error, warn, info), service component, and time range.

### FR-ADMIN-16: Audit Trail
**Priority:** Must Have  
**Description:** The system shall maintain and display an audit log of all administrative actions including actor, action type, target resource, timestamp, and IP address.

### FR-ADMIN-17: Data Export
**Priority:** Should Have  
**Description:** The system shall allow admins to export user lists, session data, and analytics in CSV format for external analysis.

### FR-ADMIN-18: System Configuration Management
**Priority:** Should Have  
**Description:** The system shall allow admins to modify configurable system parameters (session time limits, file size limits, rate limiting thresholds) through an admin UI.

### FR-ADMIN-19: Bulk Email Communication
**Priority:** Could Have  
**Description:** The system shall allow admins to send announcement or notification emails to all users or filtered user segments.

### FR-ADMIN-20: Admin Activity Statistics
**Priority:** Could Have  
**Description:** The system shall track and display admin activity statistics including number of actions per admin user and most common operations.

---

## 9. Requirement Summary by Priority

### Must Have (MVP Critical)
Total: 42 requirements across all categories
- These requirements form the minimum viable product and must be implemented for initial release
- Without these, the core value proposition cannot be delivered

### Should Have (MVP Enhanced)
Total: 23 requirements across all categories
- These requirements significantly enhance the user experience and product quality
- They should be included in MVP if time permits, or in the immediate post-MVP release

### Could Have (Future Enhancement)
Total: 11 requirements across all categories
- These requirements provide additional value but are not critical for initial adoption
- They are candidates for subsequent releases based on user feedback and priorities

---

## 10. Requirement Traceability

Each functional requirement identified in this document will be traced through subsequent project phases:

1. **Design Phase:** Each FR will be mapped to specific UI mockups, API endpoints, and database schemas
2. **Development Phase:** Each FR will be linked to user stories, tasks, and code commits
3. **Testing Phase:** Each FR will have corresponding test cases ensuring acceptance criteria are met
4. **Deployment Phase:** Each FR will be verified in staging and production environments

The unique FR identifiers (e.g., FR-AUTH-01, FR-PROFILE-03) serve as the primary reference throughout this traceability chain.

---

## 11. Acceptance Criteria Summary

For a requirement to be considered complete, it must meet the following general criteria:
- **Functional Completeness:** The feature performs all described operations correctly
- **Error Handling:** Appropriate error messages are displayed for invalid inputs or system failures
- **Performance:** Operations complete within specified time constraints (where applicable)
- **Security:** Proper authentication, authorization, and input validation are implemented
- **Usability:** The feature is intuitive and follows the established UI/UX patterns
- **Testing:** Unit tests, integration tests, and manual test cases pass successfully

Specific acceptance criteria for individual requirements will be detailed in user stories and test plans.

---

## 12. Conclusion

This document defines 76 functional requirements across six categories that comprehensively specify the behavior of the AI-Powered Mock Interview System. The requirements are prioritized to guide MVP development focus while maintaining visibility of future enhancements. The structured, traceable format ensures all stakeholders have a clear understanding of system capabilities and development teams have actionable specifications for implementation.
