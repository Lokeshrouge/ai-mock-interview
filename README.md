# AI-Powered Mock Interview System
## B.Sc. Computer Science Final Year Project

**Status**: Stages 1–7 Complete ✅ | Stage 8 (Answer Evaluation & Scoring) Next 🚀

## Quick Links
- [Phase 1 Summary](docs/22-PHASE1-SUMMARY.md)
- [System Architecture](docs/07-SYSTEM-ARCHITECTURE.md)
- [Development Roadmap](docs/19-DEVELOPMENT-ROADMAP.md)
- [Database Design](docs/08-DATABASE-DESIGN.md)
- [API Specification](docs/09-API-DESIGN.md)
- [Project Structure](docs/17-PROJECT-STRUCTURE.md)

## Repository Structure
```
ai-mock-interview/
├── frontend/                 # Next.js 14+ client application (Port 3000)
├── backend/                  # NestJS TypeScript API service (Port 3001)
├── ai-service/               # Python FastAPI AI microservice (Port 8000)
├── docs/                     # System design and project specifications
├── docker-compose.yml        # Multi-container orchestration (Postgres, NestJS, FastAPI, Next.js)
├── .env.example              # Consolidated environment variable template
├── .gitignore                # Global git ignore configuration
├── package.json              # Monorepo workspace configuration
└── README.md                 # Project overview
```

## Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: NestJS 10, TypeScript, TypeORM, PostgreSQL
- **AI Service**: Python 3.11+, FastAPI, OpenAI / Anthropic
- **DevOps**: Docker, Docker Compose

## Quick Start (Local Development)

### 1. Environment Setup
Copy the example environment file and configure your keys:
```bash
cp .env.example .env
```

### 2. Orchestration via Docker Compose
To run all services including PostgreSQL:
```bash
docker-compose up -d
```

### 3. Service Ports
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Microservice**: http://localhost:8000 (Docs at `/docs`)
- **PostgreSQL**: `localhost:5432`

