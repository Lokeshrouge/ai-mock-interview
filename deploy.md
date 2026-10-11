# 🚀 AI Mock Interview - One-Click Deployment Guide

## REQUIRED ACCOUNTS & API KEYS

Before starting, obtain:

1. **Render Account** (free): https://render.com
2. **Vercel Account** (free): https://vercel.com  
3. **Cloudinary Account** (free tier): https://cloudinary.com
4. **Anthropic API Key**: https://console.anthropic.com

**Estimated Cost**: $21/month ($7 backend + $7 AI service + $7 PostgreSQL)  
**Free Tier**: Vercel frontend + Cloudinary file storage

---

## DEPLOYMENT STEPS

### PHASE 1: Deploy to Render (Backend + AI Service + Database)

#### Option A: Blueprint Deployment (Recommended - Fastest)

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Production deployment ready"
   git push origin main
   ```

2. **Deploy via Render Blueprint**:
   - Go to https://render.com/dashboard
   - Click **"New" → "Blueprint"**
   - Connect your GitHub repository
   - Select the repository: `Ai Mock Interview`
   - Render will auto-detect `render.yaml`
   - Click **"Apply"**

3. **Set Required Environment Variables**:
   
   During blueprint setup, you'll be prompted for:
   
   **For Backend**:
   - `JWT_SECRET`: Will auto-generate (or use: `openssl rand -base64 48`)
   - `CLOUDINARY_CLOUD_NAME`: From Cloudinary dashboard
   - `CLOUDINARY_API_KEY`: From Cloudinary dashboard  
   - `CLOUDINARY_API_SECRET`: From Cloudinary dashboard
   
   **For AI Service**:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key

4. **Wait for Deployment** (~10-15 minutes):
   - ✅ PostgreSQL database provisions
   - ✅ Backend builds and deploys
   - ✅ AI service builds and deploys
   - ✅ Health checks pass

5. **Copy Service URLs**:
   - Backend: `https://mock-interview-backend-xxxx.onrender.com`
   - AI Service: `https://mock-interview-ai-service-xxxx.onrender.com`

#### Option B: Manual Service Creation

If blueprint fails, create services manually:

**1. Create PostgreSQL Database**:
- Dashboard → New → PostgreSQL
- Name: `mock-interview-db`
- Plan: Starter ($7/mo)
- Copy **Internal Database URL**

**2. Create AI Service**:
- Dashboard → New → Web Service
- Connect repository → `ai-service` directory
- Name: `mock-interview-ai-service`
- Runtime: Docker
- Dockerfile path: `./ai-service/Dockerfile`
- Plan: Starter ($7/mo)
- Environment variables:
  ```
  LLM_PROVIDER=anthropic
  ANTHROPIC_API_KEY=sk-ant-xxx
  ALLOWED_ORIGINS=*
  MAX_WORKERS=4
  LOG_LEVEL=INFO
  ```
- Deploy and copy URL

**3. Create Backend Service**:
- Dashboard → New → Web Service
- Connect repository → `backend` directory
- Name: `mock-interview-backend`
- Runtime: Docker
- Dockerfile path: `./backend/Dockerfile`
- Plan: Starter ($7/mo)
- Environment variables:
  ```
  NODE_ENV=production
  PORT=3001
  DATABASE_URL=<POSTGRESQL_URL_FROM_STEP_1>
  JWT_SECRET=<GENERATE_WITH_openssl_rand_-base64_48>
  JWT_EXPIRES_IN=15m
  REFRESH_TOKEN_EXPIRES_IN=7d
  AI_SERVICE_URL=<AI_SERVICE_URL_FROM_STEP_2>
  FILE_UPLOAD_MAX_SIZE=5242880
  UPLOAD_STORAGE_TYPE=cloudinary
  CLOUDINARY_CLOUD_NAME=<YOUR_CLOUD_NAME>
  CLOUDINARY_API_KEY=<YOUR_API_KEY>
  CLOUDINARY_API_SECRET=<YOUR_API_SECRET>
  CORS_ORIGIN=https://mock-interview.vercel.app
  ```
- Deploy and copy URL

---

### PHASE 2: Deploy Frontend to Vercel

#### Option A: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. **Import Git Repository**:
   - Select your GitHub repository
   - Root Directory: `frontend`
   - Framework Preset: **Next.js** (auto-detected)

3. **Configure Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=<BACKEND_URL_FROM_PHASE_1>
   NEXT_PUBLIC_ENV=production
   ```

4. **Deploy**: Click "Deploy"
   - Build time: ~2-3 minutes
   - Auto-generates URL: `https://your-app.vercel.app`

5. **Update Backend CORS**:
   - Go back to Render → Backend service → Environment
   - Update `CORS_ORIGIN` to your Vercel URL
   - Save and redeploy backend

#### Option B: Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod

# Set environment variables when prompted:
# NEXT_PUBLIC_API_URL: <backend-url>
# NEXT_PUBLIC_ENV: production
```

---

### PHASE 3: Get Cloudinary Credentials

1. Sign up at https://cloudinary.com (free tier)
2. Go to Dashboard
3. Copy:
   - **Cloud Name**: `dxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz123456`
4. Already set in backend environment (Phase 1)

---

### PHASE 4: Verification

#### Automated Health Checks

```bash
# Backend Health
curl https://mock-interview-backend-xxxx.onrender.com/api/v1/health

# AI Service Health  
curl https://mock-interview-ai-service-xxxx.onrender.com/health

# Frontend
curl -I https://your-app.vercel.app
```

Expected responses:
- Backend: `{"status":"healthy","database":"connected"}`
- AI Service: `{"status":"ok"}`
- Frontend: `200 OK`

#### Manual E2E Test

1. **Open Frontend**: `https://your-app.vercel.app`
2. **Register**: Create account with email/password
3. **Login**: Use same credentials
4. **Upload Resume**: Test PDF or DOCX upload
5. **Start Interview**: Select job role → Start
6. **Answer Question**: Type meaningful answer (not gibberish)
7. **View Report**: Check score and coaching
8. **Test Try Again**: Submit revised answer

#### Critical Persistence Test

1. Upload a resume
2. Go to Render → Backend → Manual Deploy → **Restart**
3. Wait 2 minutes
4. Try to download the same resume
5. ✅ **Expected**: Download succeeds (Cloudinary persistence)
6. ❌ **If fails**: Check Cloudinary credentials

---

## TROUBLESHOOTING

### Backend Won't Start
**Check**:
- Logs in Render dashboard
- DATABASE_URL is set correctly
- JWT_SECRET is set (64+ chars)
- AI_SERVICE_URL points to AI service

**Fix**:
```bash
# Test database connection
psql $DATABASE_URL -c "\dt"
```

### File Uploads Fail
**Check**:
- UPLOAD_STORAGE_TYPE=cloudinary
- Cloudinary credentials are correct
- Backend logs show "Cloudinary initialized"

**Fix**:
- Verify credentials at cloudinary.com/console
- Test upload manually via Cloudinary API

### Questions Not Generating
**Check**:
- AI_SERVICE_URL in backend points to AI service
- ANTHROPIC_API_KEY is valid
- AI service logs show no errors

**Fix**:
```bash
# Test AI service directly
curl https://ai-service-url/health
```

### CORS Errors
**Check**:
- CORS_ORIGIN in backend matches frontend URL exactly
- No trailing slash in URL
- Protocol is https://

**Fix**:
- Update CORS_ORIGIN in Render → Backend → Environment
- Redeploy backend

---

## COST BREAKDOWN

### Monthly Costs
- **Render Backend**: $7 (Starter plan)
- **Render AI Service**: $7 (Starter plan)
- **Render PostgreSQL**: $7 (Starter plan)
- **Vercel Frontend**: $0 (Free tier)
- **Cloudinary Storage**: $0 (Free tier, 25 credits/month)

**Total: $21/month**

### Free Tier Limits
- Vercel: 100GB bandwidth, unlimited deployments
- Cloudinary: 25 credits = ~1GB storage + transformations

---

## ROLLBACK PLAN

### Frontend (Vercel)
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click **"Promote to Production"**
4. Rollback time: ~30 seconds

### Backend/AI (Render)
1. Render Dashboard → Service → Deploy
2. Find previous deployment
3. Click **"Redeploy"**
4. Rollback time: ~3-5 minutes

### Database
1. Render Dashboard → Database → Backups
2. Select backup point
3. Click **"Restore"**
4. ⚠️ **Warning**: Loses data after backup

---

## PRODUCTION CHECKLIST

Before going live:

- [ ] All 3 services deployed and healthy
- [ ] Frontend loads without errors
- [ ] Registration and login work
- [ ] Resume upload persists after restart
- [ ] Questions generate correctly
- [ ] Answers evaluate with proper scores
- [ ] Report shows coaching
- [ ] No console errors in browser
- [ ] No 500 errors in backend logs
- [ ] Database connection stable
- [ ] File storage working (Cloudinary)

---

## SECURITY CHECKLIST

- [ ] JWT_SECRET is 64+ random characters
- [ ] Database password is strong
- [ ] CORS restricted to frontend domain
- [ ] No API keys in git history
- [ ] HTTPS enforced (automatic on Render/Vercel)
- [ ] Environment variables never logged
- [ ] Admin account created with strong password

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Custom Domain** (Optional):
   - Vercel: Settings → Domains → Add custom domain
   - Render: Settings → Custom Domain

2. **Monitoring**:
   - Set up error tracking (Sentry)
   - Configure uptime monitoring (UptimeRobot)
   - Enable log aggregation

3. **Performance**:
   - Enable Vercel Analytics
   - Configure CDN caching
   - Optimize database queries

4. **Backups**:
   - Render PostgreSQL: Daily automatic backups
   - Consider additional backup strategy

---

## SUPPORT

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Deployment Issues**: Check service logs first
- **Application Bugs**: See FINAL_VERIFICATION_REPORT.md

---

**Deployment Time**: ~30 minutes (automated) to 2 hours (manual)  
**Difficulty**: Beginner (Blueprint) to Intermediate (Manual)  
**Status**: Ready to deploy
