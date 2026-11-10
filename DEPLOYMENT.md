# AI Mock Interview - Production Deployment Guide

## ✅ Build Status

- **Frontend:** ✅ Built successfully (`.next/` folder)
- **Backend:** ✅ Built successfully (`dist/src/` folder)
- **AI Service:** ✅ Python runtime (no build needed)
- **Database:** ✅ Neon PostgreSQL (181 records migrated)

---

## Environment Variables Required

### Backend (.env)
```bash
# Server
NODE_ENV=production
PORT=3001

# Database - Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:npg_Dui2qtOhn4Ib@ep-long-paper-b3fpsb0u-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# JWT Secrets (CHANGE FOR PRODUCTION)
JWT_SECRET=your_production_jwt_secret_here_min_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# AI Service
AI_SERVICE_URL=https://your-ai-service-url.com

# File Upload
FILE_UPLOAD_MAX_SIZE=5242880

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
```

### AI Service (.env)
```bash
# OpenAI
OPENAI_API_KEY=your_openai_key_here

# LLM Provider
LLM_PROVIDER=openai
LLM_MODEL=gpt-4-turbo
```

---

## Hosting Options

### Option 1: Vercel (Recommended for Next.js)

#### Frontend on Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
```

#### Backend on Railway/Render
```bash
# Railway
railway login
railway init
railway up

# Or Render
# Connect GitHub repo, select backend folder
# Set build command: npm run build
# Set start command: npm run start:prod
```

#### AI Service on Railway/Render
```bash
# Dockerfile already exists
# Railway will auto-detect Python
# Or use Render with Docker
```

### Option 2: AWS/DigitalOcean

#### All Services on Single VPS
```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js, Python, PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs python3 python3-pip
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd ai-mock-interview

# Backend
cd backend
npm install
npm run build
pm2 start dist/src/main.js --name backend

# AI Service
cd ../ai-service
pip3 install -r requirements.txt
pm2 start "python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000" --name ai-service

# Frontend
cd ../frontend
npm install
npm run build
pm2 start "npm run start" --name frontend

# Save PM2 config
pm2 save
pm2 startup
```

### Option 3: Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - ai-service

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - LLM_PROVIDER=openai

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001/api/v1
    depends_on:
      - backend
```

Deploy:
```bash
docker-compose up -d
```

---

## Quick Deploy Commands

### Production Build
```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd ../frontend
npm install
npm run build

# AI Service (no build needed)
cd ../ai-service
pip install -r requirements.txt
```

### Production Start
```bash
# Backend
cd backend
npm run start:prod

# AI Service
cd ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm run start
```

---

## Database Setup

### Neon PostgreSQL (Already Configured)
- Connection string in `backend/.env`
- 181 records already migrated
- No additional setup needed

### Run Migrations (if schema changes)
```bash
cd backend
npm run migration:run
```

---

## Security Checklist

- [ ] Change JWT_SECRET to strong random string (min 32 chars)
- [ ] Update CORS_ORIGIN to production frontend domain
- [ ] Secure OpenAI API key (use environment variables)
- [ ] Enable HTTPS (use Cloudflare, Let's Encrypt, or hosting SSL)
- [ ] Set NODE_ENV=production
- [ ] Review and secure all API endpoints
- [ ] Configure rate limiting (backend already has it)
- [ ] Set up monitoring (PM2, New Relic, Datadog)

---

## Testing Production Deployment

### 1. Health Checks
```bash
# Backend
curl https://your-backend-url.com/api/v1/health

# AI Service
curl https://your-ai-service-url.com/health

# Frontend
curl https://your-frontend-url.com
```

### 2. Complete Workflow
1. Register: POST /api/v1/auth/register
2. Login: POST /api/v1/auth/login
3. Create Interview: POST /api/v1/interviews
4. Start Interview: POST /api/v1/interviews/:id/start
5. Submit Answer: POST /api/v1/interviews/:id/answers
6. Complete Interview: POST /api/v1/interviews/:id/complete
7. Get Report: GET /api/v1/interviews/:id/report

---

## Monitoring

### PM2 (if using)
```bash
pm2 list
pm2 logs backend
pm2 logs ai-service
pm2 logs frontend
pm2 monit
```

### Logs Location
- Backend: stdout/stderr or `pm2 logs`
- AI Service: stdout/stderr or `pm2 logs`
- Frontend: stdout/stderr or `pm2 logs`

---

## Backup Strategy

- **Database:** Neon auto-backups (check Neon dashboard)
- **SQLite Backups:** 3 copies preserved locally
- **Code:** Git repository
- **Uploads:** Configure S3/Cloudinary for production

---

## Scaling Recommendations

1. **Database:** Neon handles scaling automatically
2. **Backend:** Scale horizontally with load balancer
3. **AI Service:** Consider caching for similar questions
4. **Frontend:** Use CDN (Vercel/Cloudflare)
5. **File Storage:** Move to S3/Cloudinary for production

---

## Support Contacts

- Neon Database: https://console.neon.tech
- Vercel Support: https://vercel.com/support
- OpenAI API: https://platform.openai.com/docs

---

**Deployment Status:** ✅ READY  
**Builds:** ✅ Complete  
**Tests:** ✅ Passed  
**Next:** Deploy to hosting platform
