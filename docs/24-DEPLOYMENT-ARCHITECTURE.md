# Deployment Architecture

**Document ID:** SPEC-024  
**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Approved

---

## 1. Introduction

This document describes the deployment architecture for the AI-Powered Mock Interview System, covering local development, staging, and production environments. The architecture prioritizes cost-efficiency (free/low-cost hosting), ease of deployment, and scalability for future growth.

The MVP deployment uses a combination of free-tier Platform-as-a-Service (PaaS) providers, minimizing manual infrastructure management while providing production-grade features like automatic TLS, managed databases, and CI/CD integration.

---

## 2. Deployment Strategy Overview

### 2.1 Environment Tiers

| Environment | Purpose | Hosting | Cost |
|-------------|---------|---------|------|
| **Development** | Local coding and testing | Docker Compose on developer machine | $0 |
| **Staging** | Pre-production testing | Railway or Render | $0 (free tier) |
| **Production** | Live user-facing system | Vercel (frontend) + Railway (backend/AI/DB) | $0-15/month |

### 2.2 Service Distribution

| Service | Technology | Development | Production | Rationale |
|---------|-----------|-------------|------------|-----------|
| Frontend | Next.js 14 | localhost:3000 | Vercel | Vercel optimized for Next.js, free tier generous |
| API | NestJS | localhost:4000 | Railway | Railway free $5 credit, Docker support |
| AI Service | Python FastAPI | localhost:8000 | Railway | Same platform as API, internal networking |
| Database | PostgreSQL 16 | Docker container | Railway Managed DB | Automatic backups, connection pooling |
| File Storage | Filesystem | Docker volume | Railway volume (MVP) → S3 (future) | Simple for MVP, migrate to S3 later |

---

## 3. Local Development Architecture

### 3.1 Docker Compose Setup

**File:** `docker-compose.yml` (repository root)

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: mock-interview-db
    environment:
      POSTGRES_DB: mock_interview_dev
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: mock-interview-api
    environment:
      DATABASE_URL: postgresql://dev_user:dev_password@postgres:5432/mock_interview_dev
      JWT_ACCESS_SECRET: dev_access_secret_change_in_prod
      JWT_REFRESH_SECRET: dev_refresh_secret_change_in_prod
      AI_SERVICE_URL: http://ai-service:8000
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./apps/api:/app
      - /app/node_modules

  ai-service:
    build:
      context: ./apps/ai-service
      dockerfile: Dockerfile
    container_name: mock-interview-ai
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      LOG_LEVEL: info
    ports:
      - "8000:8000"
    volumes:
      - ./apps/ai-service:/app

volumes:
  postgres_data:
```

### 3.2 Development Workflow

1. **Start services:** `docker-compose up -d`
2. **Run frontend:** `cd apps/web && pnpm dev` (port 3000, not Dockerized for hot-reload speed)
3. **Run migrations:** `cd apps/api && pnpm migration:run`
4. **Access:**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - AI Service: http://localhost:8000
   - Database: localhost:5432 (via pgAdmin or TablePlus)

### 3.3 Environment Variables (.env files)

**apps/api/.env.development:**
```
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/mock_interview_dev
JWT_ACCESS_SECRET=dev_access_secret_32_chars_min
JWT_REFRESH_SECRET=dev_refresh_secret_32_chars_min
AI_SERVICE_URL=http://localhost:8000
PORT=4000
NODE_ENV=development
```

**apps/ai-service/.env.development:**
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
LOG_LEVEL=debug
PORT=8000
```

**apps/web/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Security Note:** All `.env*` files are in `.gitignore`. Example files (`.env.example`) are committed without secrets.

---

## 4. Production Deployment Architecture

### 4.1 High-Level Diagram

```
                        ┌─────────────────────┐
                        │   User Browser      │
                        └──────────┬──────────┘
                                   │ HTTPS
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
        ┌────────────────┐ ┌─────────────┐ ┌──────────────┐
        │  Vercel CDN    │ │ Vercel Edge │ │   Vercel     │
        │  (Static)      │ │  (Routing)  │ │  (SSR)       │
        └────────────────┘ └─────────────┘ └──────┬───────┘
                                                   │ HTTPS
                                                   ▼
                                          ┌─────────────────┐
                                          │  Railway        │
                                          │  NestJS API     │
                                          │  (Container)    │
                                          └────┬─────┬──────┘
                                               │     │
                    ┌──────────────────────────┘     └──────────────────────┐
                    │ Internal Network (Railway)                            │
                    ▼                                                        ▼
          ┌──────────────────┐                                    ┌──────────────────┐
          │  Railway         │                                    │  Railway         │
          │  FastAPI AI      │                                    │  PostgreSQL 16   │
          │  (Container)     │                                    │  (Managed DB)    │
          └────────┬─────────┘                                    └──────────────────┘
                   │ HTTPS (external API)
                   ▼
          ┌──────────────────┐
          │  OpenAI API      │
          │  (GPT-4o)        │
          └──────────────────┘
```

### 4.2 Component Details

#### 4.2.1 Frontend (Vercel)

- **Repository:** GitHub repo connected to Vercel.
- **Build command:** `cd apps/web && pnpm build`
- **Output directory:** `apps/web/.next`
- **Environment variables:**
  - `NEXT_PUBLIC_API_URL=https://api.mock-interview.example.com`
- **Domain:** Custom domain (e.g., `mock-interview.example.com`) or Vercel subdomain (`.vercel.app`).
- **Deployment trigger:** Push to `main` branch auto-deploys.
- **TLS:** Automatic via Let's Encrypt (Vercel managed).
- **Features:**
  - Edge network (CDN for static assets).
  - Automatic image optimization.
  - Incremental Static Regeneration (ISR) for dashboard pages.

#### 4.2.2 Backend API (Railway)

- **Repository:** GitHub repo connected to Railway.
- **Build method:** Dockerfile in `apps/api/Dockerfile`.
- **Dockerfile (Multi-Stage):**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN cd apps/api && pnpm build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/main"]
```

- **Environment variables (Railway secrets):**
  - `DATABASE_URL` (auto-injected by Railway DB connection)
  - `JWT_ACCESS_SECRET` (generated secret)
  - `JWT_REFRESH_SECRET` (generated secret)
  - `AI_SERVICE_URL=http://ai-service.railway.internal:8000` (internal)
  - `FRONTEND_URL=https://mock-interview.example.com` (CORS origin)
  - `PORT=4000`
  - `NODE_ENV=production`

- **Health check:** Railway pings `GET /health` (NestJS endpoint).
- **Deployment trigger:** Push to `main` branch (via GitHub Actions or Railway direct).
- **Scaling:** Single instance for MVP (Railway free tier); can scale horizontally (multiple replicas) in future.

#### 4.2.3 AI Service (Railway)

- **Repository:** Same monorepo, `apps/ai-service` subfolder.
- **Build method:** Dockerfile in `apps/ai-service/Dockerfile`.
- **Dockerfile:**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- **Environment variables:**
  - `OPENAI_API_KEY` (Railway secret)
  - `LOG_LEVEL=info`
  - `PORT=8000`

- **Internal networking:** Railway provides internal DNS (`ai-service.railway.internal`) accessible only to other services in same project (NestJS API).
- **External access:** Disabled (no public URL) to prevent unauthorized LLM calls.
- **Health check:** FastAPI auto-generated `/health` endpoint.

#### 4.2.4 Database (Railway Managed PostgreSQL)

- **Provisioning:** Railway PostgreSQL plugin (one-click add).
- **Version:** PostgreSQL 16.
- **Connection string:** Auto-injected into `DATABASE_URL` env var.
- **Features:**
  - Automatic daily backups (7-day retention on free tier).
  - Connection pooling (PgBouncer).
  - Metrics dashboard (CPU, memory, disk usage).
- **Access:**
  - Internal: Services connect via `DATABASE_URL`.
  - External: Use Railway-provided public endpoint for migrations/admin (whitelist IP if possible).
- **Extensions:** `pgcrypto` installed via migration.

#### 4.2.5 File Storage (Resume Uploads)

**MVP Approach (Railway Volume):**
- Files uploaded to `/app/uploads` in NestJS container.
- Railway persistent volume ensures files survive container restarts.
- Limitation: Not shared across multiple API instances (blocks horizontal scaling).

**Future Production Approach (S3-Compatible Storage):**
- Migrate to AWS S3, Cloudflare R2, or DigitalOcean Spaces.
- Store file URL in database, serve via signed URLs.
- Allows multiple API instances and CDN delivery.

---

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflow

**File:** `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build

  deploy-production:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Frontend)
        run: |
          npm i -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Trigger Railway Deployment (API + AI)
        run: |
          curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}
```

### 5.2 Deployment Flow

1. **Developer pushes code to `main` branch.**
2. **GitHub Actions triggers CI:**
   - Runs ESLint and Prettier.
   - Runs Jest/Vitest unit tests.
   - Runs Supertest integration tests (against test database).
   - Builds all apps (Next.js, NestJS, FastAPI).
3. **If CI passes:**
   - Vercel auto-deploys frontend (via Vercel GitHub integration).
   - Railway auto-deploys API and AI service (via Railway GitHub integration or webhook).
4. **Railway runs migrations:** Add migration step in Railway settings or Dockerfile entrypoint.
5. **Health checks pass:** Railway marks deployment as successful.
6. **Users see new version within 2-5 minutes.**

### 5.3 Rollback Strategy

- **Vercel:** Instant rollback to previous deployment via Vercel dashboard (one-click).
- **Railway:** Redeploy previous commit via Railway dashboard or Git revert + push.
- **Database migrations:** Write rollback migration and execute manually if schema change causes issues.

---

## 6. Environment Configuration

### 6.1 Secrets Management

| Secret | Storage | Accessed By |
|--------|---------|-------------|
| `OPENAI_API_KEY` | Railway environment variables | AI Service |
| `JWT_ACCESS_SECRET` | Railway environment variables | NestJS API |
| `JWT_REFRESH_SECRET` | Railway environment variables | NestJS API |
| `DATABASE_URL` | Railway auto-injected | NestJS API |
| `VERCEL_TOKEN` | GitHub Secrets | CI/CD pipeline |
| `RAILWAY_WEBHOOK_URL` | GitHub Secrets | CI/CD pipeline |

**Security practices:**
- Never commit secrets to Git (use `.env.example` templates).
- Rotate secrets quarterly or immediately after suspected exposure.
- Use Railway's secrets UI (encrypted at rest).
- Limit secret access via role-based permissions (Railway teams feature).

### 6.2 Environment-Specific Configurations

| Config | Development | Production |
|--------|-------------|------------|
| Database host | localhost:5432 | Railway managed |
| API base URL | http://localhost:4000 | https://api.example.com |
| CORS origins | `*` (permissive) | `https://mock-interview.example.com` only |
| Log level | debug | info |
| Token expiry | 1 hour (access), 30 days (refresh) | 15 min (access), 7 days (refresh) |
| Rate limiting | Disabled | 100 req/15min per IP |

---

## 7. Networking and Security

### 7.1 HTTPS Enforcement

- **Vercel:** Automatic TLS via Let's Encrypt, HSTS enabled.
- **Railway:** Automatic TLS via Let's Encrypt for public endpoints.
- **API:** NestJS sets `secure: true` on cookies (httpOnly + secure flags).

### 7.2 CORS Configuration

**NestJS (apps/api/src/main.ts):**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL, // https://mock-interview.example.com
  credentials: true, // Allow cookies
});
```

### 7.3 Internal vs External Access

| Service | Public URL | Internal URL (Railway) | Notes |
|---------|-----------|------------------------|-------|
| Frontend | https://mock-interview.example.com | - | Public |
| API | https://api.example.com | http://api.railway.internal:4000 | Public (authenticated endpoints) |
| AI Service | None | http://ai-service.railway.internal:8000 | Internal only |
| Database | None (or admin IP-whitelisted) | postgresql://user:pass@db.railway.internal:5432 | Internal only |

**Benefit:** AI service cannot be called directly by external attackers (no public endpoint).

### 7.4 Rate Limiting

**NestJS Throttler (apps/api/src/main.ts):**
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 900, // 15 minutes
      limit: 100, // 100 requests per 15 min per IP
    }),
  ],
})
```

**Applied to:**
- Authentication endpoints (stricter: 10 req/15min).
- Interview session creation (20 req/15min).
- Global fallback (100 req/15min).

---

## 8. Monitoring and Logging

### 8.1 Application Logging

**NestJS (Pino):**
- Logs written to stdout in JSON format.
- Railway automatically captures and displays in logs UI.
- Optional: Stream logs to external service (Logtail, Papertrail) via Railway log drain.

**FastAPI (python-json-logger):**
- Structured JSON logs to stdout.
- Captured by Railway.

**Log levels:**
- Development: `debug` (verbose).
- Production: `info` (errors, warnings, important events).

### 8.2 Metrics and Monitoring

**Railway Built-in Metrics:**
- CPU usage (%).
- Memory usage (MB).
- Request count (per minute).
- Response time (P50, P95).
- Deployment history.

**Custom Metrics (Future):**
- Integrate Prometheus + Grafana.
- Metrics: LLM token usage, session completion rate, average evaluation latency.

### 8.3 Error Tracking

**Sentry Integration (Post-MVP):**
- Frontend: `@sentry/nextjs` for React errors.
- Backend: `@sentry/node` for NestJS exceptions.
- AI Service: `sentry-sdk` for Python errors.
- Provides stack traces, breadcrumbs, user context.

### 8.4 Uptime Monitoring

**UptimeRobot (Free Tier):**
- Ping `GET /health` endpoints every 5 minutes.
- Alert via email/SMS if downtime detected.
- Public status page for transparency.

---

## 9. Backup and Disaster Recovery

### 9.1 Database Backups

**Railway Automatic Backups:**
- Daily snapshots (free tier: 7-day retention).
- Restore via Railway dashboard (one-click).

**Manual Backups (via cron):**
```bash
# Scheduled via GitHub Actions (weekly)
pg_dump $DATABASE_URL > backup-$(date +%F).sql
# Upload to S3 or GitHub release artifacts
```

### 9.2 Code Backup

- **Git repository:** Primary source of truth, hosted on GitHub.
- **Redundancy:** Fork or mirror to GitLab/Bitbucket (optional).

### 9.3 Resume Files Backup

**MVP:** Files in Railway volume (backed up with container snapshots).

**Production:** Replicate S3 bucket to second region (cross-region replication).

### 9.4 Disaster Recovery Plan

| Scenario | Recovery Steps | RTO (Recovery Time Objective) |
|----------|----------------|-------------------------------|
| Database corruption | Restore from latest Railway snapshot | 15 minutes |
| Deployment bug (API down) | Rollback to previous Railway deployment | 5 minutes |
| Railway outage | Redeploy to Render or Fly.io (prepared Dockerfile) | 2 hours |
| GitHub account compromised | Deploy from local Git clone or GitLab mirror | 1 hour |
| OpenAI API key leaked | Rotate key, update Railway secret | 10 minutes |

---

## 10. Scaling Strategy

### 10.1 MVP Constraints (Free Tier)

- **Vercel:** Unlimited hobby tier bandwidth (sufficient for <1000 users/month).
- **Railway:** $5 free credit (~550 hours of uptime for single container).
- **OpenAI API:** Pay-per-use (no free tier); estimate $5-20/month for 200 sessions.

**Estimated capacity:**
- 500 concurrent users (Vercel CDN scales automatically).
- 10 concurrent API requests (single NestJS instance).
- 5 concurrent LLM calls (FastAPI single instance).

### 10.2 Horizontal Scaling (Future)

**When to scale:** User base grows to >1000 monthly active users or response times degrade.

**Scaling approach:**

1. **Frontend (Vercel):** Auto-scales (no action needed).
2. **API (Railway):**
   - Increase to 2-3 replicas (load balanced by Railway).
   - Ensure stateless design (JWT tokens, no in-memory sessions).
   - Total cost: $10-15/month for 2 replicas.
3. **AI Service (Railway):**
   - Increase to 2 replicas (LLM calls are I/O-bound, not CPU-bound).
   - Consider queue system (BullMQ + Redis) for background job processing.
4. **Database (Railway):**
   - Upgrade to paid tier (more storage, connection pooling).
   - Add read replicas for analytics queries (separate from transactional load).
5. **File Storage:**
   - Migrate to S3/R2 (required for multi-instance API).
6. **Caching:**
   - Add Redis for session caching, rate limiting state, LLM response cache.

### 10.3 Cost Projection (1000 Users/Month)

| Service | Free Tier | Paid Tier | Estimated Cost |
|---------|-----------|-----------|----------------|
| Vercel | Sufficient | Not needed | $0 |
| Railway (API) | $5 credit | 2 replicas | $10/month |
| Railway (AI) | $5 credit | 1 replica | $5/month |
| Railway (DB) | 1GB storage | 5GB storage | $5/month |
| OpenAI API | N/A | ~2000 sessions × $0.02 | $40/month |
| Domain | Optional | .com domain | $12/year |
| **Total** | | | **~$65/month** |

---

## 11. Deployment Checklist

### 11.1 Pre-Deployment (Staging)

- [ ] All tests passing in CI (green GitHub Actions).
- [ ] Migrations tested in staging database.
- [ ] Environment variables configured in Railway.
- [ ] CORS origins set to staging frontend URL.
- [ ] Health check endpoints returning 200.
- [ ] Manual smoke test: signup → interview → report.
- [ ] Security scan: `npm audit` shows 0 critical vulnerabilities.
- [ ] Secrets rotated (use production-specific secrets).

### 11.2 Production Deployment

- [ ] Merge staging to `main` branch.
- [ ] CI/CD pipeline deploys automatically.
- [ ] Verify Vercel deployment (check preview URL).
- [ ] Verify Railway deployment (check logs, health checks).
- [ ] Run production migrations (if any).
- [ ] Smoke test production URL: register user, complete interview.
- [ ] Monitor logs for errors (first 30 minutes post-deploy).
- [ ] Update documentation with production URLs.
- [ ] Announce deployment to stakeholders (if applicable).

### 11.3 Post-Deployment

- [ ] Enable UptimeRobot monitoring.
- [ ] Set up error tracking (Sentry).
- [ ] Configure log retention (Logtail).
- [ ] Schedule weekly database backups (GitHub Actions cron).
- [ ] Document rollback procedure (runbook).
- [ ] Load test with k6 or Artillery (optional, post-MVP).

---

## 12. Local Testing of Production Build

To test production build locally before deploying:

**Frontend (Next.js):**
```bash
cd apps/web
pnpm build
pnpm start  # Runs production server on localhost:3000
```

**Backend (NestJS):**
```bash
cd apps/api
pnpm build
node dist/main.js  # Production build
```

**AI Service (FastAPI):**
```bash
cd apps/ai-service
docker build -t ai-service:prod .
docker run -p 8000:8000 --env-file .env.production ai-service:prod
```

---

## 13. Alternative Deployment Options

### 13.1 Railway Alternative: Render

**Pros:**
- Similar free tier ($0 for 750 hours/month).
- Docker support.
- Managed PostgreSQL.

**Cons:**
- Slower cold start times (free tier spins down after inactivity).
- Less generous free database (1GB vs Railway's 1GB).

**When to use:** Railway quota exceeded or Railway outage.

### 13.2 Self-Hosted VPS (DigitalOcean, Linode)

**Pros:**
- Full control.
- Predictable cost ($5-10/month).
- No platform lock-in.

**Cons:**
- Manual setup (Nginx, SSL certificates, systemd services).
- No automatic backups (must configure).
- More maintenance burden.

**When to use:** Learning goal includes DevOps, or long-term production post-graduation.

**Setup outline:**
1. Provision VPS (Ubuntu 22.04).
2. Install Docker and Docker Compose.
3. Clone repository, run `docker-compose -f docker-compose.prod.yml up -d`.
4. Configure Nginx reverse proxy (frontend → 3000, API → 4000).
5. Install Certbot for Let's Encrypt SSL.
6. Set up UFW firewall (allow 80, 443, SSH only).

---

## 14. Security Hardening Checklist

- [ ] HTTPS enforced (HSTS header, redirect HTTP → HTTPS).
- [ ] Secrets in environment variables (never in code).
- [ ] CORS restricted to frontend domain only.
- [ ] Rate limiting enabled (Throttler).
- [ ] Input validation (DTOs with class-validator).
- [ ] SQL injection prevented (TypeORM parameterized queries).
- [ ] XSS prevented (React auto-escapes, CSP header set).
- [ ] CSRF prevented (SameSite cookie attribute).
- [ ] Password hashing (bcrypt, 10 rounds).
- [ ] JWT short expiry (15 min access, 7 day refresh).
- [ ] Refresh token rotation (new token on every refresh).
- [ ] File upload size limit (5MB max).
- [ ] File type validation (PDF/DOCX magic bytes).
- [ ] Security headers (helmet middleware).
- [ ] Dependency vulnerability scan (`npm audit`).
- [ ] Database access (internal only, no public endpoint).
- [ ] AI service access (internal only, no public endpoint).

---

## 15. Deployment Architecture Summary Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                            PRODUCTION ARCHITECTURE                     │
└───────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CLIENT TIER (Vercel)                                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Next.js App (SSR + Static)                                  │   │
│  │  - App Router                                                 │   │
│  │  - React Query (API client)                                  │   │
│  │  - Zustand (client state)                                    │   │
│  │  Domain: mock-interview.example.com                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  - Auto HTTPS (Let's Encrypt)                                       │
│  - CDN (Edge Network)                                               │
│  - Auto-scaling                                                     │
└─────────────┬───────────────────────────────────────────────────────┘
              │ HTTPS REST API
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  APPLICATION TIER (Railway)                                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  NestJS API (Docker Container)                               │   │
│  │  - RESTful endpoints                                         │   │
│  │  - JWT authentication                                        │   │
│  │  - TypeORM (ORM)                                             │   │
│  │  - Passport.js (auth strategies)                             │   │
│  │  Domain: api.mock-interview.example.com                      │   │
│  └───────────────┬──────────────────────────────────────────────┘   │
│                  │                                                   │
│                  │ Internal HTTP (Railway private network)          │
│                  ▼                                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  FastAPI AI Service (Docker Container)                       │   │
│  │  - LLM integration (OpenAI)                                  │   │
│  │  - Prompt templates (Jinja2)                                 │   │
│  │  - Response validation (Pydantic)                            │   │
│  │  Internal only: ai-service.railway.internal:8000            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────┬────────────────────────────────────────────────────────┘
              │
              │ TypeORM Connection (Internal)
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DATA TIER (Railway)                                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 16 (Managed Database)                            │   │
│  │  - JSONB columns (AI metadata)                               │   │
│  │  - pgcrypto extension                                        │   │
│  │  - Automatic backups (daily, 7-day retention)                │   │
│  │  - Connection pooling (PgBouncer)                            │   │
│  │  Internal: db.railway.internal:5432                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  EXTERNAL SERVICES                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│  │  OpenAI API      │  │  GitHub (CI/CD)  │  │  UptimeRobot    │   │
│  │  (GPT-4o)        │  │  (Actions)       │  │  (Monitoring)   │   │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 16. Conclusion

The deployment architecture balances cost-efficiency (free tiers), developer experience (one-click deployments), and production readiness (automatic TLS, managed databases, CI/CD). The MVP uses Vercel for frontend and Railway for backend, leveraging platform-managed features to minimize manual infrastructure work.

As the system scales beyond MVP, the architecture supports horizontal scaling (multiple API replicas), caching (Redis), and advanced storage (S3). The Dockerfile-based deployment ensures portability: if Railway becomes insufficient, migration to Render, Fly.io, or self-hosted VPS requires minimal code changes.

Security is built-in: HTTPS everywhere, secrets in environment variables, internal-only AI service, rate limiting, and input validation. Monitoring via Railway metrics and UptimeRobot ensures issues are detected quickly. Automatic backups and documented rollback procedures provide disaster recovery confidence.

This architecture delivers a production-grade MVP at minimal cost (~$10-15/month with OpenAI usage), suitable for academic demonstration and real-world user testing.

---

**Approval Status:** Ready for deployment  
**Review Date:** Before Stage 15 (production launch)  
**Next Action:** Set up Railway and Vercel accounts, configure environment variables
