# College Documentation Structure

**Document ID:** SPEC-023  
**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Approved

---

## 1. Introduction

This document maps the 25 technical specification documents to the structure of a formal B.Sc. Computer Science final-year project report. It provides guidance on academic writing conventions, citation requirements, diagram integration, and submission checklist.

The final academic report transforms technical specifications into a narrative suitable for assessment by faculty and external examiners. While specifications focus on "what to build," the academic report answers "why, how, and what was learned."

---

## 2. Academic Report Structure

### 2.1 Standard Chapter Outline

| Chapter | Title | Estimated Pages | Source Specifications |
|---------|-------|----------------|----------------------|
| Chapter 1 | Introduction | 4-6 | SPEC-001, SPEC-002, SPEC-003 |
| Chapter 2 | Literature Review | 8-12 | External research + SPEC-020 (tech stack rationale) |
| Chapter 3 | Requirements Analysis | 8-10 | SPEC-004, SPEC-005, SPEC-006 |
| Chapter 4 | System Design | 12-16 | SPEC-007 through SPEC-016 |
| Chapter 5 | Implementation | 10-14 | SPEC-020, SPEC-021, code walkthroughs |
| Chapter 6 | Testing & Validation | 6-8 | SPEC-018, test results, screenshots |
| Chapter 7 | Results & Evaluation | 4-6 | Performance metrics, user feedback (if any) |
| Chapter 8 | Conclusion & Future Work | 3-5 | SPEC-025, reflections |
| Appendices | - | 10-15 | API docs, DB schema, prompts, code samples |
| **TOTAL** | | **60-90 pages** | |

---

## 3. Chapter-by-Chapter Mapping

### Chapter 1: Introduction

**Purpose:** Establish context, motivation, objectives, and report structure.

**Content from Specifications:**
- **SPEC-001 (Project Definition):** Sections 1-3 → Project name, objectives, scope.
- **SPEC-002 (Problem Statement):** Section 2 → Existing solutions and their limitations.
- **SPEC-003 (Target Users & Impact):** Section 3 → Who benefits and how.

**Additional Academic Content:**
- Background context: Importance of interview preparation in job market.
- Research question: "Can LLM-based mock interviews provide effective, personalized feedback?"
- Report structure overview (roadmap of chapters).

**Writing Guidelines:**
- Write in past tense for project activities ("The system was designed to...").
- Avoid first person ("I implemented") unless program guidelines permit.
- Hook reader with statistics: "70% of graduates report interview anxiety" (cite source).

**Word Count Target:** 1200-1500 words.

---

### Chapter 2: Literature Review

**Purpose:** Demonstrate understanding of field, position project within existing research.

**Content Sources:**
- **External Research:**
  - AI in education (adaptive learning systems, automated grading).
  - Mock interview tools (InterviewBuddy, Pramp, Big Interview — feature comparison).
  - LLM evaluation capabilities (research papers on GPT-4 as assessor).
  - Prompt engineering best practices (few-shot learning, chain-of-thought).
  
- **SPEC-020 (Technology Stack):** Section 3 → Justify technology choices against alternatives.

**Structure:**
1. AI in Education (2-3 pages): Benefits, challenges, ethical concerns.
2. Existing Mock Interview Platforms (2-3 pages): Feature comparison table, gaps identified.
3. LLM Capabilities and Limitations (2-3 pages): Evaluation accuracy, hallucination risks.
4. Technology Selection Rationale (1-2 pages): Why Next.js/NestJS/FastAPI chosen.
5. Summary and Positioning (1 page): How this project differs/improves on prior work.

**Writing Guidelines:**
- Use IEEE citation format: [1], [2], etc. (see Section 5).
- Synthesize, don't summarize: Compare and contrast sources.
- Identify research gap: "Existing tools lack personalized feedback based on uploaded resume."
- Critical analysis: "While [Source A] claims X, [Source B] shows limitations Y."

**Citation Requirements:**
- Minimum 20-30 academic sources (journal papers, conference proceedings).
- Include 5-10 grey literature (industry reports, tool documentation).
- Cite every claim: "AI-based tutoring improves learning outcomes by 20% [5]."

**Word Count Target:** 2500-3500 words.

---

### Chapter 3: Requirements Analysis

**Purpose:** Define what the system must do (functional) and quality attributes (non-functional).

**Content from Specifications:**
- **SPEC-004 (User Roles):** Section 3 → User, Admin roles and permissions.
- **SPEC-005 (Functional Requirements):** All sections → FR001-FR025 detailed requirements.
- **SPEC-006 (Non-Functional Requirements):** All sections → NFR001-NFR015 quality attributes.

**Structure:**
1. Stakeholder Analysis (1 page): User personas (job seeker, fresh graduate, admin).
2. Functional Requirements (4-5 pages):
   - User management (authentication, profiles, resumes).
   - Interview session workflow (setup, questioning, evaluation, reporting).
   - Admin functions (user management, analytics).
   - Use case diagrams (3-4 diagrams, one per major feature).
3. Non-Functional Requirements (2-3 pages):
   - Performance (response times, concurrency).
   - Security (auth, data protection).
   - Usability (accessibility, responsiveness).
   - Reliability (uptime, error handling).
   - Maintainability (code quality, documentation).
4. Requirements Prioritization (1 page): MoSCoW method (Must/Should/Could/Won't have).

**Diagrams to Include:**
- Use case diagram (user workflows).
- Actor-system interaction diagram.
- Requirements traceability matrix (optional).

**Writing Guidelines:**
- Number all requirements (FR001, NFR001) for traceability.
- Use "shall" for mandatory, "should" for desirable: "System shall hash passwords."
- Justify each requirement: "Resume upload required to provide context for AI personalization."

**Word Count Target:** 2500-3000 words.

---

### Chapter 4: System Design

**Purpose:** Describe architectural decisions, data models, and component interactions.

**Content from Specifications:**
- **SPEC-007 (System Architecture):** Section 3 → Three-tier + AI microservice architecture.
- **SPEC-008 (Database Schema):** Section 3 → ERD, tables, relationships.
- **SPEC-009 (API Endpoints):** All sections → REST API design.
- **SPEC-010 (Authentication Flow):** Section 3 → JWT access/refresh token flow.
- **SPEC-011 (Interview Session Flow):** Section 4 → State machine diagram.
- **SPEC-012 (Frontend Pages):** Section 3 → Page structure, navigation.
- **SPEC-013 (AI Service Design):** Section 4 → Prompt templates, LLM integration.
- **SPEC-014 (Error Handling):** Section 3 → Error codes, strategies.
- **SPEC-015 (Data Flow):** Section 4 → Sequence diagrams for key operations.
- **SPEC-016 (Security Architecture):** Section 3 → Threat model, mitigations.

**Structure:**
1. Architectural Overview (2 pages):
   - High-level architecture diagram (frontend, backend, AI service, database).
   - Component responsibilities.
   - Technology stack summary (from SPEC-020).
2. Database Design (3 pages):
   - Entity-Relationship Diagram (ERD).
   - Table schemas with data types, constraints.
   - Normalization level (3NF) and justification.
   - Indexing strategy for performance.
3. API Design (2 pages):
   - RESTful principles followed.
   - Endpoint summary table (from SPEC-009).
   - Example request/response payloads.
4. Authentication & Authorization (2 pages):
   - JWT flow diagram (from SPEC-010).
   - Token structure and claims.
   - Refresh token rotation mechanism.
5. Interview Session Workflow (2 pages):
   - State machine diagram (from SPEC-011).
   - State transition rules.
   - Sequence diagram for complete interview (from SPEC-015).
6. AI Service Architecture (2 pages):
   - Prompt engineering approach (few-shot, chain-of-thought).
   - LLM API integration (OpenAI).
   - Retry logic and error handling.
   - Example prompt templates (from SPEC-013).
7. Security Design (2 pages):
   - Threat model (OWASP Top 10 coverage).
   - Input validation, output encoding.
   - HTTPS enforcement, CORS configuration.
   - Password hashing (bcrypt, 10 rounds).

**Diagrams to Include (8-12 diagrams):**
- System architecture diagram.
- ERD (Entity-Relationship Diagram).
- Component diagram.
- Sequence diagram: User registration.
- Sequence diagram: Interview session lifecycle.
- State machine diagram: Session states.
- Deployment diagram (from SPEC-024).
- Security architecture diagram (from SPEC-016).

**Writing Guidelines:**
- Explain design rationale: "Microservice architecture chosen to isolate AI processing."
- Trade-offs discussed: "REST over GraphQL: simpler for MVP, GraphQL better for complex queries."
- Alternatives considered: "MongoDB rejected in favor of PostgreSQL due to relational data model."

**Word Count Target:** 4000-5000 words.

---

### Chapter 5: Implementation

**Purpose:** Describe how design was realized in code, highlight key algorithms, challenges overcome.

**Content from Specifications:**
- **SPEC-020 (Technology Stack):** All sections → Technologies used and why.
- **SPEC-021 (Development Roadmap):** Stages 1-15 → Development phases.
- **SPEC-024 (Deployment Architecture):** Docker setup, CI/CD pipeline.

**Additional Content:**
- Code repository structure (monorepo with pnpm workspaces).
- Key implementation decisions:
  - TypeORM migration strategy.
  - React Query for server state management.
  - Prompt engineering iterations.
- Code walkthrough of critical components:
  - NestJS `AuthService` (password hashing, JWT generation).
  - FastAPI `/evaluate-answer` endpoint (LLM call, response parsing).
  - Next.js interview page (real-time answer submission).
- Development environment setup (Docker Compose, local dev workflow).
- Version control practices (Git branching strategy, commit conventions).

**Code Samples (in appendix, referenced here):**
- Listing 1: TypeORM User entity.
- Listing 2: NestJS JWT strategy.
- Listing 3: FastAPI prompt template (Jinja2).
- Listing 4: React Hook Form with Zod validation.

**Writing Guidelines:**
- Avoid dumping large code blocks in chapter body (use appendix).
- Explain algorithms in pseudocode or high-level steps.
- Discuss challenges: "TypeORM migration conflicts resolved by X."
- Show iterative development: "Initial prompt produced generic questions; refined with few-shot examples."

**Word Count Target:** 3000-4000 words.

---

### Chapter 6: Testing & Validation

**Purpose:** Demonstrate system correctness, reliability, and adherence to requirements.

**Content from Specifications:**
- **SPEC-018 (Testing Strategy):** All sections → Test types, tools, coverage targets.

**Additional Content:**
- Unit test results (Jest/Vitest): coverage report (e.g., 85%).
- Integration test results (Supertest): all API endpoints tested.
- E2E test results (Playwright): critical user flows.
- Manual testing:
  - Functional testing checklist (FR001-FR025 verified).
  - Usability testing (if conducted with peers).
  - Browser compatibility (Chrome, Firefox, Safari).
- Performance testing:
  - API response times (P50, P95, P99 latency).
  - LLM evaluation latency (average 6s).
  - Lighthouse scores (Performance, Accessibility, SEO).
- Security testing:
  - `npm audit` results (0 critical vulnerabilities).
  - Manual penetration testing (SQL injection, XSS attempts blocked).

**Tables to Include:**
- Test coverage summary (unit, integration, E2E).
- Performance benchmark results.
- Functional requirements traceability (FR ID → Test Case ID → Status).

**Diagrams/Screenshots:**
- Jest coverage report screenshot.
- Playwright test execution video screenshot.
- Lighthouse report screenshot.

**Writing Guidelines:**
- Present test results objectively: "85% code coverage achieved; target was 80%."
- Discuss failed tests and resolutions: "Race condition in session state fixed in commit XYZ."
- Limitations: "Load testing not conducted due to free-tier constraints; planned for production."

**Word Count Target:** 2000-2500 words.

---

### Chapter 7: Results & Evaluation

**Purpose:** Assess whether project met objectives, performance against requirements.

**Content:**
- Functional completeness: All FR001-FR025 implemented (yes/no/partial).
- Non-functional metrics:
  - Performance: API <500ms (✓), LLM <10s (✓).
  - Security: OWASP checks passed (✓).
  - Usability: Subjective assessment or user feedback (if available).
- User feedback (if pilot testing conducted):
  - 5 peers tested system, rated 4.2/5 average.
  - Common feedback: "Helpful feedback," "Questions relevant to resume."
  - Suggestions: "Add more question types," "Voice input."
- Comparison with objectives (from SPEC-001):
  - Objective 1: Provide AI-generated questions → ✓ Achieved.
  - Objective 2: Real-time evaluation → ✓ Achieved (6s avg latency).
  - Objective 3: Comprehensive reports → ✓ Achieved.
- Limitations and known issues:
  - LLM occasionally generates off-topic questions (5% of time).
  - No mobile app (desktop web only).
  - Single-user concurrency (no load testing).

**Writing Guidelines:**
- Be honest about limitations: assessors value self-awareness.
- Tie results back to requirements: "NFR003 (response time <500ms) met in 95% of tests."
- Use data: "Average session completion time: 12 minutes."

**Word Count Target:** 1500-2000 words.

---

### Chapter 8: Conclusion & Future Work

**Purpose:** Summarize achievements, reflect on learning, propose enhancements.

**Content from Specifications:**
- **SPEC-025 (Phase 1 Summary):** Section 3 (frozen decisions), Section 6 (success metrics).

**Structure:**
1. Summary of Achievements (1 page):
   - Full-stack web application built with modern technologies.
   - AI integration functional and producing useful feedback.
   - All major functional requirements implemented.
2. Learning Outcomes (1 page):
   - Gained proficiency in NestJS, FastAPI, prompt engineering.
   - Understood trade-offs in architecture and tech selection.
   - Experienced full SDLC: requirements → design → implementation → testing.
3. Challenges Overcome (1 page):
   - TypeORM migration debugging.
   - LLM prompt tuning for quality questions.
   - Balancing scope vs timeline.
4. Future Enhancements (1-2 pages):
   - Voice recording and transcription (speech-to-text).
   - Video interview simulation (camera, body language analysis).
   - Adaptive difficulty (adjust questions based on performance).
   - Mobile app (React Native).
   - Multi-language support (i18n).
   - Behavioral interview training (STAR method guidance).
5. Final Reflection (0.5 page):
   - Personal growth, project significance, career relevance.

**Writing Guidelines:**
- Avoid introducing new information: this chapter summarizes.
- Reflect critically: "If restarting, I would prototype AI prompts earlier."
- Keep future work realistic: "Voice feature estimated at 3 additional weeks."

**Word Count Target:** 1200-1500 words.

---

## 4. Appendices

### Appendix A: API Reference

- Complete list of API endpoints with request/response schemas.
- Source: SPEC-009 (API Endpoints).
- Format: Table with Method, Path, Auth Required, Request Body, Response Body.

### Appendix B: Database Schema

- Full DDL (CREATE TABLE statements) or TypeORM entity code.
- Source: SPEC-008 (Database Schema).

### Appendix C: Prompt Templates

- Full Jinja2 templates for question generation, answer evaluation, session summary.
- Source: SPEC-013 (AI Service Design), Section 5.

### Appendix D: Code Samples

- Listing 1: TypeORM User entity.
- Listing 2: NestJS AuthController.
- Listing 3: FastAPI `/generate-questions` endpoint.
- Listing 4: Next.js interview session page component.
- Keep samples <50 lines each; refer to GitHub repository for full code.

### Appendix E: Setup Guide

- Step-by-step instructions to run project locally.
- Source: SPEC-024 (Deployment Architecture), Section 3.
- Includes: Prerequisites, installation, environment variables, running with Docker Compose.

### Appendix F: Test Results

- Full test coverage report (HTML export from Jest).
- E2E test execution screenshots (Playwright).

### Appendix G: User Guide

- Screenshots of key pages with captions.
- User workflows: How to create account → upload resume → start interview → view report.

---

## 5. Citation and Referencing

### 5.1 Citation Format

**Recommended:** IEEE format (numerical in-text citations).

**Example in-text:**
"GPT-4 has demonstrated strong performance in educational assessment tasks [12]."

**Example reference list:**
```
[12] J. Smith and A. Doe, "Large Language Models in Education: A Survey," 
     IEEE Transactions on Learning Technologies, vol. 16, no. 3, pp. 234-248, 
     March 2023.
```

**Alternative:** Harvard format (author-year in-text citations) if program requires.

### 5.2 Source Types to Cite

| Source Type | Quantity | Examples |
|-------------|----------|----------|
| Academic papers | 15-20 | IEEE Xplore, ACM Digital Library, Google Scholar |
| Conference proceedings | 5-10 | AAAI, NeurIPS, CHI |
| Books | 2-5 | "Designing Data-Intensive Applications" (Kleppmann) |
| Technical documentation | 5-10 | Next.js docs, NestJS docs, OpenAI API docs |
| Industry reports | 2-5 | Gartner, McKinsey (on AI adoption, job market) |
| Existing tools | 3-5 | InterviewBuddy, Pramp, LeetCode (comparison) |

**Total citations target:** 30-40 references.

### 5.3 Citation Management Tools

- **Zotero:** Free, open-source, browser plugin for saving papers.
- **Mendeley:** Free, integrates with Microsoft Word.
- **EndNote:** Paid, powerful, may be available via university license.

**Workflow:**
1. Save papers to citation manager as you read.
2. Export to .bib file (BibTeX format).
3. Use LaTeX or Word plugin to insert citations automatically.

### 5.4 Plagiarism Avoidance

- **Paraphrase:** Restate ideas in your own words, then cite.
- **Direct quotes:** Use sparingly (<5% of report), always in "quotes" with citation.
- **Common knowledge:** No citation needed (e.g., "JavaScript is a programming language").
- **Code snippets:** Cite Stack Overflow answers, library documentation if adapted from example.
- **AI tools:** Acknowledge use: "Code suggestions generated with GitHub Copilot were reviewed and adapted by the author."

---

## 6. Academic Writing Guidelines

### 6.1 Style and Tone

- **Formal:** Avoid contractions (don't → do not), slang, colloquialisms.
- **Objective:** "The system demonstrates..." not "I think the system is great."
- **Precise:** "Response time was 450ms" not "fast."
- **Past tense for actions:** "The database was designed...", "Tests were conducted..."
- **Present tense for facts:** "Next.js is a React framework..."

### 6.2 Section Numbering

Use hierarchical numbering:
- Chapter 1, 2, 3...
- Section 1.1, 1.2, 1.3...
- Subsection 1.1.1, 1.1.2...

### 6.3 Figures and Tables

- **Numbering:** Figure 1, Figure 2... (sequential across entire report, not per chapter).
- **Captions:** Below figures, above tables.
  - Figure 1: System architecture diagram.
  - Table 1: Functional requirements summary.
- **Referencing:** "As shown in Figure 3, the authentication flow..."
- **Quality:** Vector graphics (SVG, PDF) for diagrams (not pixelated PNG screenshots).

### 6.4 Acronyms

- Define on first use: "Large Language Model (LLM)".
- After first use, acronym only: "The LLM generates questions..."
- Include acronym list after table of contents (optional but helpful).

### 6.5 Page Formatting

- **Font:** Times New Roman 12pt or Arial 11pt (check university guidelines).
- **Line spacing:** 1.5 or double-spaced.
- **Margins:** 1 inch (2.54cm) all sides.
- **Page numbers:** Bottom center or top right.
- **Headers:** Chapter title in header (optional).

---

## 7. Diagram Checklist

### 7.1 Diagrams to Create (from Specifications)

| Diagram | Source Spec | Chapter | Tool |
|---------|-------------|---------|------|
| System architecture | SPEC-007 | Chapter 4 | Draw.io, Lucidchart |
| Entity-Relationship Diagram (ERD) | SPEC-008 | Chapter 4 | dbdiagram.io, DrawSQL |
| Use case diagram | SPEC-005 | Chapter 3 | PlantUML, Draw.io |
| Authentication flow | SPEC-010 | Chapter 4 | Draw.io, Excalidraw |
| Session state machine | SPEC-011 | Chapter 4 | Graphviz, Draw.io |
| Sequence diagram: Registration | SPEC-015 | Chapter 4 | PlantUML, Mermaid |
| Sequence diagram: Interview flow | SPEC-015 | Chapter 4 | PlantUML, Mermaid |
| Deployment diagram | SPEC-024 | Chapter 5 | Draw.io |
| Component diagram | SPEC-007 | Chapter 4 | Draw.io |
| Security architecture | SPEC-016 | Chapter 4 | Draw.io |

**Total diagrams:** 10-12 minimum.

### 7.2 Diagram Best Practices

- **Consistency:** Use same color scheme and icon style across all diagrams.
- **Readability:** Font size ≥10pt, avoid cluttered diagrams (split if needed).
- **Legend:** Include legend for symbols/colors if not obvious.
- **Vector format:** Export as PDF or SVG for LaTeX; EMF for Word.

### 7.3 Tools

| Tool | Pros | Cons |
|------|------|------|
| Draw.io (diagrams.net) | Free, web-based, export formats | Learning curve for complex diagrams |
| Lucidchart | Professional, templates | Freemium (limited free tier) |
| PlantUML | Text-to-diagram, version control | Syntax learning curve |
| dbdiagram.io | ERD specialized | ERD only |
| Excalidraw | Hand-drawn aesthetic | Less formal |

---

## 8. Submission Checklist

### 8.1 Pre-Submission Tasks

- [ ] Abstract (200-300 words summarizing project).
- [ ] Acknowledgements (thank advisor, family, peers).
- [ ] Table of Contents (auto-generated in Word/LaTeX).
- [ ] List of Figures (auto-generated).
- [ ] List of Tables (auto-generated).
- [ ] List of Acronyms (optional but recommended).
- [ ] Plagiarism Declaration (sign and date).
- [ ] All chapters complete (8 chapters + appendices).
- [ ] All citations formatted correctly (IEEE style).
- [ ] All figures/tables numbered and captioned.
- [ ] Page numbers on all pages.
- [ ] Spell-check and grammar-check passed.
- [ ] Consistent formatting (fonts, spacing, headings).
- [ ] PDF conversion tested (if submitting PDF).
- [ ] File size <50MB (if university portal has limit).
- [ ] Backup copies saved (USB, cloud, email to self).

### 8.2 Final Report Components

1. **Cover Page:** Title, author name, student ID, degree program, submission date, advisor name.
2. **Abstract:** Summary of problem, solution, results (200-300 words).
3. **Acknowledgements:** Thank those who helped.
4. **Table of Contents:** Auto-generated.
5. **List of Figures:** Auto-generated.
6. **List of Tables:** Auto-generated.
7. **List of Acronyms:** (Optional).
8. **Chapters 1-8:** Main body of report.
9. **References:** IEEE format, alphabetical or numerical order.
10. **Appendices A-G:** Supplementary material.

### 8.3 Submission Formats

- **Physical:** Printed and bound (check if required).
- **Digital:** PDF submitted via university portal.
- **Code Repository:** GitHub link in appendix or submitted as ZIP (check guidelines).

---

## 9. Word Count Targets

| Section | Words | Pages (1.5 spacing) |
|---------|-------|---------------------|
| Abstract | 250 | 0.5 |
| Chapter 1: Introduction | 1200 | 4 |
| Chapter 2: Literature Review | 3000 | 10 |
| Chapter 3: Requirements | 2750 | 9 |
| Chapter 4: System Design | 4500 | 15 |
| Chapter 5: Implementation | 3500 | 12 |
| Chapter 6: Testing | 2250 | 7 |
| Chapter 7: Results | 1750 | 6 |
| Chapter 8: Conclusion | 1250 | 4 |
| Appendices | 3000 | 10 |
| **TOTAL** | **~23,500 words** | **~77 pages** |

**Note:** Page count includes figures/tables which add extra pages.

**Typical university requirement:** 50-100 pages (this report fits comfortably in range).

---

## 10. Grading Rubric Considerations

### 10.1 Common Assessment Criteria

| Criterion | Weight | How to Excel |
|-----------|--------|--------------|
| Problem definition | 10% | Clear motivation, well-defined scope (Ch 1) |
| Literature review | 15% | Critical analysis, 30+ citations (Ch 2) |
| Requirements | 10% | Comprehensive, traceable (Ch 3) |
| Design quality | 20% | Well-justified, clear diagrams (Ch 4) |
| Implementation | 20% | Working system, clean code, deployment (Ch 5, demos) |
| Testing | 10% | Rigorous, coverage >80% (Ch 6) |
| Evaluation | 5% | Honest assessment, metrics (Ch 7) |
| Writing quality | 5% | Grammar, structure, citations (All) |
| Presentation/Viva | 5% | Confidence, knowledge depth (Defense) |

### 10.2 Excelling Beyond Baseline

- **Innovation:** Novel use of LLM for interview feedback (not just chatbot).
- **Rigor:** Comprehensive testing, security analysis.
- **Depth:** Detailed design rationale, alternatives considered.
- **Honesty:** Acknowledge limitations and future work.
- **Polish:** Professional diagrams, consistent formatting.

---

## 11. Timeline for Report Writing

### 11.1 Recommended Schedule

Assume 4 weeks for report writing (parallel to final stages of development):

| Week | Task | Output |
|------|------|--------|
| Week 1 | Chapters 3-4 (Requirements, Design) | Draft requirements and design chapters from specs |
| Week 2 | Chapters 5-6 (Implementation, Testing) | Document code and test results |
| Week 3 | Chapters 1-2 (Intro, Literature Review) | Research and write literature review |
| Week 4 | Chapters 7-8, Appendices, Final edits | Conclude, compile appendices, proofread |

**Total time:** ~80-100 hours (2-3 hours/day over 4 weeks).

### 11.2 Advisor Feedback Checkpoints

- **End Week 1:** Submit Chapters 3-4 for advisor review.
- **End Week 2:** Submit Chapter 5 and discuss any technical concerns.
- **End Week 3:** Submit full draft for advisor feedback.
- **End Week 4:** Incorporate feedback and finalize.

---

## 12. LaTeX vs Microsoft Word

### 12.1 Comparison

| Feature | LaTeX | Microsoft Word |
|---------|-------|----------------|
| Equation formatting | Excellent | Good (Equation Editor) |
| Citation management | Excellent (BibTeX) | Good (Zotero plugin) |
| Cross-references | Auto-update | Auto-update |
| Diagram integration | PDF/PNG | PNG/EMF |
| Learning curve | Steep | Gentle |
| Version control | Git-friendly (plain text) | Difficult (binary) |
| Professional look | Superior (academic standard) | Good with templates |

**Recommendation:**
- **LaTeX** if familiar or time to learn (Overleaf for cloud LaTeX).
- **Word** if deadline tight and Word proficient.

### 12.2 LaTeX Template

Use university-provided template if available. Otherwise:
- **Overleaf templates:** Search "thesis" or "project report."
- **Example:** `report` document class with `\chapter` commands.

### 12.3 Word Template

- Download university template from website.
- Use Styles (Heading 1, Heading 2) for consistent formatting.
- Use Table of Contents auto-generation.

---

## 13. Specification-to-Chapter Mapping Summary

| Specification | Primary Chapter | Secondary Chapters |
|---------------|----------------|-------------------|
| SPEC-001 Project Definition | Ch 1 | - |
| SPEC-002 Problem Statement | Ch 1, Ch 2 | - |
| SPEC-003 Target Users | Ch 1 | Ch 3 (personas) |
| SPEC-004 User Roles | Ch 3 | Ch 4 (auth design) |
| SPEC-005 Functional Requirements | Ch 3 | Ch 6 (testing traceability) |
| SPEC-006 Non-Functional Requirements | Ch 3 | Ch 6, Ch 7 (performance) |
| SPEC-007 System Architecture | Ch 4 | Ch 5 (implementation) |
| SPEC-008 Database Schema | Ch 4 | Appendix B |
| SPEC-009 API Endpoints | Ch 4 | Appendix A |
| SPEC-010 Authentication Flow | Ch 4 | - |
| SPEC-011 Interview Session Flow | Ch 4 | - |
| SPEC-012 Frontend Pages | Ch 4, Ch 5 | Appendix G (user guide) |
| SPEC-013 AI Service Design | Ch 4, Ch 5 | Appendix C (prompts) |
| SPEC-014 Error Handling | Ch 4, Ch 5 | - |
| SPEC-015 Data Flow | Ch 4 | - |
| SPEC-016 Security Architecture | Ch 4 | Ch 6 (security testing) |
| SPEC-017 Performance Requirements | Ch 3 (NFR) | Ch 7 (results) |
| SPEC-018 Testing Strategy | Ch 6 | Appendix F (test results) |
| SPEC-020 Technology Stack | Ch 2 (rationale) | Ch 5 (usage) |
| SPEC-021 Development Roadmap | Ch 5 | - |
| SPEC-022 Risks and Mitigation | Ch 5 (challenges) | - |
| SPEC-023 College Documentation | Meta (this doc) | - |
| SPEC-024 Deployment Architecture | Ch 5 | Appendix E (setup guide) |
| SPEC-025 Phase 1 Summary | Ch 8 | - |

---

## 14. Common Pitfalls to Avoid

1. **Insufficient citations:** Every claim needs a source in literature review.
2. **Code dumping:** Avoid pasting 500 lines of code in chapter body; use appendix.
3. **Missing diagrams:** Text-only report is hard to follow; diagrams clarify.
4. **Late start on writing:** 4 weeks needed; starting 1 week before deadline risks incomplete report.
5. **Ignoring formatting guidelines:** University may penalize incorrect formatting.
6. **No proofreading:** Typos and grammar errors signal lack of care.
7. **Overpromising results:** Be honest about limitations; assessors value self-awareness.
8. **Plagiarism (accidental):** Paraphrase and cite; use Turnitin check if available.

---

## 15. Viva/Defense Preparation

### 15.1 Common Questions

- "Why did you choose NestJS over Express?"
- "How do you handle LLM hallucinations?"
- "What was your biggest challenge?"
- "How would you scale this system to 10,000 users?"
- "Why didn't you implement voice recording?"

**Preparation:**
- Know your specifications inside-out (this is your script).
- Prepare 5-minute demo walkthrough.
- Anticipate "What if X fails?" questions (refer to SPEC-022 risks).

### 15.2 Demo Tips

- Test demo environment day before (Internet, Docker running).
- Prepare backup: video recording of demo in case live demo fails.
- Show end-to-end flow: signup → interview → report (5 minutes).
- Have code editor open to show key files if asked.

---

## 16. Conclusion

This document provides a roadmap for transforming 25 technical specifications into a cohesive academic report. By following the chapter structure, citation guidelines, and writing best practices outlined here, a high-quality B.Sc. final-year project report can be produced.

The key is to start early (4 weeks for writing), maintain consistent citation practices, and use diagrams liberally to complement text. The specifications already contain the substance; the academic report provides the narrative and justification that demonstrate learning and critical thinking.

---

**Approval Status:** Ready for reference during report writing  
**Review Date:** Before starting Chapter 1  
**Next Action:** Begin literature review research (external sources)
