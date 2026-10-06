# Technology Stack

**Document ID:** SPEC-020  
**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Approved

---

## 1. Introduction

This document presents the complete technology stack for the AI-Powered Mock Interview System. Each technology selection is justified based on project requirements, team capabilities, ecosystem maturity, and long-term maintainability. The stack follows modern best practices for full-stack TypeScript development with a Python microservice for AI-specific workloads.

---

## 2. Technology Matrix

### 2.1 Core Stack Overview

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Frontend Framework** | Next.js | 14.x | Server-side rendering, App Router for streaming, built-in optimization, TypeScript native, excellent DX |
| **Frontend Language** | TypeScript | 5.x | Type safety across codebase, reduces runtime errors, improved IDE support, shared types with backend |
| **Styling** | Tailwind CSS | 3.x | Utility-first rapid development, consistent design system, tree-shaking for small bundles, dark mode built-in |
| **Backend Framework** | NestJS | 10.x | Modular architecture, decorator-driven, TypeScript-native, dependency injection, enterprise-grade patterns |
| **ORM** | TypeORM | 0.3.x | Migrations support, repository pattern, Active Record + Data Mapper, PostgreSQL-specific features |
| **Database** | PostgreSQL | 16.x | ACID compliance, JSON/JSONB support, full-text search, robust migration story, free hosting available |
| **AI Service Language** | Python | 3.11 | LLM ecosystem dominance, rapid prototyping, async support, extensive AI libraries |
| **AI Service Framework** | FastAPI | 0.110.x | Async native, automatic OpenAPI docs, Pydantic validation, high performance, minimal boilerplate |
| **Authentication** | JWT + Passport.js | - | Stateless auth, refresh token rotation, httpOnly cookies, industry standard |
| **Package Manager** | pnpm | 8.x | Monorepo workspaces, disk-efficient, fast installs, strict node_modules |
| **Containerization** | Docker + Compose | 24.x / 2.x | Consistent dev environment, production parity, service orchestration |

### 2.2 Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React Query (TanStack Query) | 5.x | Server state management, caching, background refetching, optimistic updates |
| Zustand | 4.x | Client-side state management, minimal boilerplate, TypeScript-first, no provider hell |
| React Hook Form | 7.x | Performant forms with minimal re-renders, built-in validation |
| Zod | 3.x | Runtime schema validation, type inference, error messages, shared with backend |
| Playwright | 1.40.x | E2E testing, multi-browser, auto-wait, screenshot/video capture |
| Vitest | 1.x | Unit testing, Vite-powered, compatible with Jest APIs, fast |
| Lucide React | 0.x | Icon library, tree-shakeable, consistent design, TypeScript types |

### 2.3 Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @nestjs/jwt | 10.x | JWT token generation and verification |
| @nestjs/passport | 10.x | Authentication strategies abstraction |
| class-validator | 0.14.x | DTO validation via decorators |
| class-transformer | 0.5.x | Plain-to-class transformation for DTOs |
| bcrypt | 5.x | Password hashing with salt rounds |
| pino | 8.x | Fast structured logging, production-ready |
| pino-http | 9.x | HTTP request logging middleware |
| multer | 1.4.x | Multipart/form-data file upload handling |
| pdf-parse | 1.1.x | PDF text extraction for resume parsing |
| mammoth | 1.6.x | DOCX to text/HTML conversion |
| Jest | 29.x | Unit and integration testing framework |
| Supertest | 6.x | HTTP assertion library for API testing |

### 2.4 AI Service Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Pydantic | 2.x | Data validation and settings management, type hints |
| httpx | 0.26.x | Async HTTP client for LLM API calls |
| Jinja2 | 3.1.x | Prompt template rendering with variables |
| python-json-logger | 2.0.x | Structured JSON logging for production |
| pytest | 7.x | Testing framework with fixtures and async support |
| pytest-asyncio | 0.23.x | Async test support |
| tenacity | 8.x | Retry logic with exponential backoff for API calls |

### 2.5 Database & Extensions

| Component | Version | Purpose |
|-----------|---------|---------|
| PostgreSQL | 16.x | Primary relational database |
| pgcrypto | - | Encryption functions for sensitive data |
| pg (node-postgres) | 8.x | PostgreSQL client for Node.js via TypeORM |
| psycopg2 | 2.9.x | PostgreSQL adapter for Python (if needed) |

### 2.6 DevOps & CI/CD

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 24.x | Service containerization |
| Docker Compose | 2.x | Multi-container local orchestration |
| GitHub Actions | - | CI/CD pipelines, automated testing, deployment |
| ESLint | 8.x | TypeScript/JavaScript linting |
| Prettier | 3.x | Code formatting consistency |
| Husky | 8.x | Git hooks for pre-commit checks |
| lint-staged | 15.x | Run linters on staged files only |

### 2.7 External Services

| Service | Purpose | Rate Limits / Constraints |
|---------|---------|---------------------------|
| OpenAI API (GPT-4o) | Primary LLM for question generation, answer evaluation | ~10K tokens/min on free tier, paid tier for production |
| Alternative: Anthropic Claude | Backup LLM if OpenAI unavailable | Similar pricing model |
| Alternative: Ollama (local) | Development/testing without API costs | Requires local GPU, slower inference |

---

## 3. Technology Selection Rationale

### 3.1 Frontend: Next.js vs Alternatives

**Selected: Next.js 14 with App Router**

Next.js provides server-side rendering and streaming capabilities essential for optimal user experience. The App Router enables React Server Components, reducing client-side JavaScript. Built-in optimization (image, font, script) and routing make it production-ready out of the box.

**Alternatives Considered:**

- **Vite + React Router:** Simpler but requires manual SSR setup. Loses Next.js's built-in optimizations and API routes. Rejected because SSR improves perceived performance for authenticated pages.
  
- **Remix:** Strong SSR story but smaller ecosystem and less mature. Next.js has better documentation and community support for a student project timeline.

### 3.2 Backend: NestJS vs Alternatives

**Selected: NestJS 10**

NestJS enforces modular architecture through decorators and dependency injection, making large codebases maintainable. TypeScript-native design shares types with frontend. Decorator-driven approach reduces boilerplate for validation, authentication, and middleware.

**Alternatives Considered:**

- **Express.js:** Minimal and flexible but lacks structure. A solo developer project benefits from opinionated architecture to prevent technical debt. Rejected for insufficient guardrails.

- **Fastify:** Faster than Express but still unstructured. NestJS can use Fastify as its underlying HTTP adapter if performance becomes critical, giving best of both worlds.

### 3.3 ORM: TypeORM vs Alternatives

**Selected: TypeORM 0.3**

TypeORM supports both Active Record and Data Mapper patterns. Decorator-based entities integrate seamlessly with NestJS. Migration system is robust, and PostgreSQL-specific features (JSON columns, full-text search) are first-class citizens.

**Alternatives Considered:**

- **Prisma:** Excellent DX with Prisma Studio and type-safe client. However, schema language is separate from code, and migrations can be opaque. TypeORM's decorator approach keeps entity definitions in TypeScript, preferred for learning purposes.

- **Drizzle ORM:** Lightweight and type-safe but very new with limited community resources. Rejected for stability risk in an academic project with fixed deadline.

### 3.4 Database: PostgreSQL vs Alternatives

**Selected: PostgreSQL 16**

PostgreSQL offers ACID compliance critical for interview session state consistency. JSONB columns store flexible AI evaluation metadata without schema migrations. Free hosting on Railway/Render/Supabase makes deployment affordable.

**Alternatives Considered:**

- **MongoDB:** Flexible schema appealing for AI data, but lacks relational integrity. Interview sessions have clear relationships (user → sessions → questions → answers) better modeled relationally. Rejected for weak transaction support.

- **MySQL:** Solid relational database but JSON support lags PostgreSQL. Full-text search and advanced indexing are less mature. PostgreSQL's ecosystem and free hosting options are superior.

### 3.5 AI Service: Python FastAPI vs Alternatives

**Selected: Python 3.11 + FastAPI**

Python dominates the LLM ecosystem with first-class library support (OpenAI SDK, LangChain, transformers). FastAPI provides async endpoints matching the async nature of LLM calls, minimizing idle waiting. Automatic OpenAPI docs simplify frontend integration.

**Alternatives Considered:**

- **Node.js (NestJS) for AI endpoints:** Possible but Python libraries are more mature. Prompt engineering resources and examples are Python-centric. Rejected to leverage Python's AI ecosystem strengths.

- **Flask:** Simpler than FastAPI but lacks async native support and automatic validation. FastAPI's Pydantic integration prevents malformed LLM responses from crashing the service.

### 3.6 State Management: React Query + Zustand vs Alternatives

**Selected: React Query 5 + Zustand 4**

React Query handles server state (API data, caching, refetching) declaratively, eliminating manual useEffect patterns. Zustand manages client state (UI toggles, form drafts) with minimal boilerplate. This separation of concerns prevents state management confusion.

**Alternatives Considered:**

- **Redux Toolkit:** Powerful but heavyweight for this project's scale. Boilerplate still exceeds Zustand despite RTK improvements. React Query eliminates need for Redux Thunk/Saga for async data.

- **Zustand alone:** Could handle server state but would require manual cache invalidation and loading states. React Query specializes in this, making it the better choice.

### 3.7 Monorepo: pnpm Workspaces vs Alternatives

**Selected: pnpm 8 with workspaces**

pnpm saves disk space via content-addressable storage and prevents phantom dependencies via strict node_modules structure. Workspace protocol enables sharing `packages/shared-types` between frontend and backend with live updates during development.

**Alternatives Considered:**

- **npm workspaces:** Built-in but slower and disk-inefficient. pnpm's speed advantage compounds during development with frequent installs.

- **Yarn workspaces:** Comparable to pnpm but lacks pnpm's strict linking, which catches dependency bugs earlier.

- **Turborepo / Nx:** Advanced monorepo tools with task caching. Overkill for three apps; introduces learning curve without proportional benefit at this scale.

---

## 4. Version Pinning Strategy

### 4.1 Exact Versions

All dependencies use exact versions in package.json (no `^` or `~`) to ensure reproducible builds:

```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "18.2.0"
  }
}
```

### 4.2 Update Policy

- **Major version updates:** Manual review, tested in staging branch before merging.
- **Minor/patch updates:** Dependabot PRs reviewed weekly, automated tests must pass.
- **Security updates:** Applied immediately regardless of version.

### 4.3 Lock Files

- `pnpm-lock.yaml` committed to repository.
- `requirements.txt` for Python with exact versions (`fastapi==0.110.0`).
- Docker images pin base versions (`node:20.11-alpine`, `python:3.11.7-slim`).

---

## 5. Development Tools

### 5.1 Code Quality

- **ESLint:** Enforces TypeScript best practices, catches unused variables, imports.
- **Prettier:** Formats code consistently (2-space indent, single quotes, trailing commas).
- **TypeScript strict mode:** Enabled in `tsconfig.json` (noImplicitAny, strictNullChecks).

### 5.2 Git Hooks

- **pre-commit (Husky + lint-staged):** Runs ESLint and Prettier on staged files, prevents broken commits.
- **commit-msg:** Enforces conventional commit format (feat:, fix:, docs:, etc.).

### 5.3 IDE Configuration

- **VS Code recommended extensions:** ESLint, Prettier, Tailwind CSS IntelliSense, Prisma (for schema viewing).
- **Settings sync:** `.vscode/settings.json` in repository enforces format-on-save.

---

## 6. Testing Stack

### 6.1 Frontend Testing

| Type | Tool | Scope |
|------|------|-------|
| Unit tests | Vitest | Components, hooks, utilities |
| Integration tests | React Testing Library | Component interactions |
| E2E tests | Playwright | Critical user flows |

### 6.2 Backend Testing

| Type | Tool | Scope |
|------|------|-------|
| Unit tests | Jest | Services, utilities |
| Integration tests | Jest + Supertest | API endpoints, database |
| Contract tests | Pact (future) | API-frontend contract |

### 6.3 AI Service Testing

| Type | Tool | Scope |
|------|------|-------|
| Unit tests | pytest | Prompt generation, parsing |
| Integration tests | pytest + httpx | LLM client with mocks |
| Smoke tests | Manual | Actual LLM API calls (dev) |

---

## 7. Deployment Stack

### 7.1 MVP Deployment Targets

| Service | Platform | Reason |
|---------|----------|--------|
| Next.js Frontend | Vercel | Free tier, automatic deployments, edge network |
| NestJS API | Railway | Free $5/month credit, PostgreSQL included, Docker support |
| AI Service | Railway | Same account, internal networking with API |
| PostgreSQL | Railway Managed DB | Automatic backups, connection pooling |

### 7.2 Alternative Platforms

- **Render:** Similar to Railway, generous free tier, backup option if Railway quota exceeded.
- **Fly.io:** Good for Docker deployments, free tier available but more complex setup.
- **Self-hosted VPS (DigitalOcean, Linode):** $5-10/month, full control, requires manual setup.

---

## 8. Security Tooling

| Tool | Purpose |
|------|---------|
| `npm audit` / `pnpm audit` | Scan dependencies for known vulnerabilities |
| Dependabot | Automated security PRs for vulnerable packages |
| Snyk (optional) | More comprehensive vulnerability scanning |
| `helmet` (NestJS) | Sets security HTTP headers |
| `cors` | Configures CORS to allow only frontend origin |
| `express-rate-limit` | Rate limiting to prevent abuse |

---

## 9. Observability Stack (Future)

For post-MVP production monitoring:

| Component | Tool | Purpose |
|-----------|------|---------|
| Logging | Pino + Logtail | Structured logs, searchable |
| Metrics | Railway metrics | Request count, latency, memory |
| Error tracking | Sentry | Frontend and backend error capture |
| Uptime | UptimeRobot | Ping health endpoints, alert on downtime |

---

## 10. Cost Analysis

### 10.1 MVP Costs (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (Frontend) | $0 | Free tier sufficient for low traffic |
| Railway (API + AI + DB) | $0-5 | Free $5 credit, may need $5/month after |
| OpenAI API | $5-20 | Token usage based, ~200 interviews/month |
| Domain name | $0-12/year | Optional, .com domain |
| **Total** | **~$10-25/month** | Affordable for student project |

### 10.2 Cost Optimization

- **Token caching:** Store LLM responses for identical questions.
- **Mock mode:** Use fake responses in development to avoid API costs.
- **Free tier LLMs:** Use Ollama locally or free GPT-3.5 for testing.

---

## 11. Technology Risks and Mitigations

### 11.1 LLM API Rate Limits

**Risk:** OpenAI API rate limits block production usage.

**Mitigation:** Implement exponential backoff retry logic (tenacity library), queue requests if hitting limits, show user-friendly "Please wait" message.

### 11.2 TypeORM Migration Conflicts

**Risk:** Schema migrations fail in production, causing downtime.

**Mitigation:** Always test migrations in staging database, write rollback migrations, use transactions where possible.

### 11.3 Next.js App Router Breaking Changes

**Risk:** Next.js 14 App Router is relatively new; bugs or breaking changes possible.

**Mitigation:** Pin exact Next.js version, monitor release notes, allocate buffer time for unexpected rework.

---

## 12. Future Technology Additions (Post-MVP)

| Technology | Purpose | Timeline |
|------------|---------|----------|
| Redis | Session caching, rate limiting | Phase 2 |
| S3 (MinIO/R2) | Resume file storage (replace filesystem) | Phase 2 |
| WebSockets | Real-time interview UI updates | Phase 3 |
| LangChain | Advanced prompt chaining, agent orchestration | Phase 3 |
| React Native | Mobile app (iOS/Android) | Phase 4 |

---

## 13. Learning Curve Assessment

| Technology | Familiarity Assumption | Learning Time |
|------------|------------------------|---------------|
| Next.js 14 App Router | Moderate (React known) | 1 week |
| NestJS | Low (Express known) | 1-2 weeks |
| TypeORM | Low (SQL known) | 1 week |
| FastAPI | Low (Python known) | 3-5 days |
| PostgreSQL | Moderate (SQL basics) | Ongoing |
| Docker | Low | 1 week |
| LLM prompt engineering | None | Ongoing (experimental) |

**Total onboarding estimate:** 4-6 weeks parallel to development.

---

## 14. Technology Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  Next.js 14 (App Router) + TypeScript + Tailwind CSS       │
│  React Query (server state) + Zustand (client state)       │
│  React Hook Form + Zod (validation)                         │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS (REST API)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│  NestJS 10 + TypeScript + TypeORM                           │
│  Passport.js (JWT) + class-validator                        │
│  Pino (logging) + multer (uploads)                          │
└────────────┬────────────────────────┬───────────────────────┘
             │ TypeORM                 │ HTTP (internal)
             ▼                         ▼
┌─────────────────────────┐  ┌────────────────────────────────┐
│     POSTGRESQL 16       │  │       AI SERVICE               │
│  JSONB + pgcrypto       │  │  Python 3.11 + FastAPI         │
│  Migrations             │  │  Pydantic + httpx + Jinja2     │
└─────────────────────────┘  └────────────┬───────────────────┘
                                           │ HTTPS API
                                           ▼
                             ┌──────────────────────────────┐
                             │      OpenAI API (GPT-4o)     │
                             │  or compatible LLM endpoint  │
                             └──────────────────────────────┘
```

---

## 15. Conclusion

The selected technology stack balances modern best practices, ecosystem maturity, team learning goals, and deployment cost constraints. TypeScript unifies frontend and backend development, while Python handles AI workloads where its ecosystem excels. The monorepo structure with pnpm workspaces enables code sharing and consistent tooling. All technologies have active communities, comprehensive documentation, and free hosting options suitable for an academic MVP.

The stack is production-capable with clear scaling paths: Next.js and NestJS are stateless and horizontally scalable, PostgreSQL supports read replicas, and the AI service can be replicated behind a load balancer. This architecture supports both immediate project completion and future enhancements without requiring a rewrite.

---

**Approval Status:** Ready for implementation  
**Review Date:** N/A  
**Next Review:** After Stage 6 (AI service scaffold complete)
