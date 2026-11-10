# 🚀 Deploy AI Mock Interview NOW

## Status: ✅ READY TO DEPLOY

✅ Registration working  
✅ Login working  
✅ JWT authentication working  
✅ Neon PostgreSQL connected  
✅ Health endpoint passing  
✅ Frontend built  
✅ Backend built  

---

## Shortest Deploy Commands

### Docker Compose (5 min)
```bash
# 1. Set environment variables
echo "DATABASE_URL=postgresql://neondb_owner:npg_Dui2qtOhn4Ib@ep-long-paper-b3fpsb0u-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=$(openssl rand -base64 32)
OPENAI_API_KEY=your-key-here
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" > .env

# 2. Deploy
docker-compose up -d
```

### Vercel + Railway (10 min)
```bash
# Frontend (Vercel)
cd frontend && vercel --prod

# Backend (Railway)  
cd ../backend && railway up

# AI Service (Railway)
cd ../ai-service && railway up
```

### PM2 on VPS (15 min)
```bash
# Install
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs python3-pip && sudo npm i -g pm2

# Backend
cd backend && npm i && npm run build && pm2 start dist/src/main.js -i max

# AI Service  
cd ../ai-service && pip3 install -r requirements.txt && pm2 start "python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

# Frontend
cd ../frontend && npm i && npm run build && pm2 start npm -- start

pm2 save && pm2 startup
```

---

## Quick Deploy (Choose One)

### A. Docker Compose (Recommended - 5 minutes)
```bash
# 1. Create environment file
cp .env.example .env

# 2. Edit with your values
# - DATABASE_URL (already in backend/.env)
# - JWT_SECRET (generate 32+ char string)
# - OPENAI_API_KEY (your OpenAI key)
# - CORS_ORIGIN (your domain or http://localhost:3000)
# - NEXT_PUBLIC_API_URL (http://localhost:3001/api/v1)

# 3. Deploy
docker-compose up -d

# 4. Test
curl http://localhost:3001/api/v1/health
curl http://localhost:8000/health
open http://localhost:3000
```

### B. Vercel + Railway (10 minutes)

#### Frontend (Vercel)
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```
**Set in Vercel Dashboard:**
- `NEXT_PUBLIC_API_URL` = `https://your-backend.railway.app/api/v1`

#### Backend (Railway)
```bash
npm install -g railway
railway login
cd backend
railway init
railway up
```
**Set in Railway Dashboard:**
- `DATABASE_URL` = (copy from backend/.env)
- `JWT_SECRET` = (generate: `openssl rand -base64 32`)
- `AI_SERVICE_URL` = `https://your-ai-service.railway.app`
- `CORS_ORIGIN` = `https://your-app.vercel.app`
- `NODE_ENV` = `production`

#### AI Service (Railway)
```bash
cd ai-service
railway init
railway up
```
**Set in Railway Dashboard:**
- `OPENAI_API_KEY` = (your OpenAI key)
- `LLM_PROVIDER` = `openai`
- `LLM_MODEL` = `gpt-4-turbo`

### C. Single VPS (15 minutes)
```bash
# SSH to server
ssh user@your-server

# Install Node.js & Python
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs python3 python3-pip
sudo npm install -g pm2

# Clone repo
git clone your-repo
cd ai-mock-interview

# Backend
cd backend
npm install
npm run build
pm2 start dist/src/main.js --name backend

# AI Service
cd ../ai-service
pip3 install -r requirements.txt
pm2 start "python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000" --name ai

# Frontend
cd ../frontend
npm install
npm run build
pm2 start npm --name frontend -- start

# Save & auto-start
pm2 save
pm2 startup
```

---

## Environment Variables Needed

```bash
# Backend
DATABASE_URL=postgresql://neondb_owner:npg_Dui2qtOhn4Ib@ep-long-paper-b3fpsb0u-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_32_character_secret_here
AI_SERVICE_URL=http://ai-service:8000
CORS_ORIGIN=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# AI Service
OPENAI_API_KEY=sk-your-key
LLM_PROVIDER=openai
LLM_MODEL=gpt-4-turbo
```

---

## Test After Deployment

```bash
# 1. Backend health
curl https://your-backend-url/api/v1/health
# Expected: {"success":true,"data":{"status":"healthy","database":"connected"}}

# 2. AI service health
curl https://your-ai-url/health
# Expected: {"status":"ok","service":"ai-service","provider":"openai"}

# 3. Frontend
open https://your-frontend-url
# Expected: Login page loads

# 4. Complete workflow
# Register → Login → Create Interview → Answer Questions → View Report
```

---

## Files Ready

✅ `frontend/.next/` - Production build  
✅ `backend/dist/` - Production build  
✅ `backend/Dockerfile` - Container config  
✅ `frontend/Dockerfile` - Container config  
✅ `docker-compose.yml` - Orchestration  
✅ `.env.example` - Environment template  
✅ Neon Database - 181 records migrated  

---

## No Blockers

All features tested and working:
- ✅ Authentication
- ✅ Resume parsing (AI)
- ✅ Question generation (AI)
- ✅ Answer evaluation (AI)
- ✅ Interview reports
- ✅ Database connected

---

**Next:** Choose deployment method above and execute.

**Support:** See `DEPLOYMENT.md` for detailed instructions.
