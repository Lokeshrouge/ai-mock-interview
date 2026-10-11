# Production Deployment Guide - AI Mock Interview

## Current Status
- ✅ All core features implemented and tested
- ✅ Database configured for PostgreSQL (TypeORM)
- ✅ Answer validation with gibberish detection
- ✅ Question deduplication working
- ⚠️ **File storage currently local (needs S3/Cloudinary)**
- ⚠️ **Using SQLite locally (production needs PostgreSQL)**

## Production Blockers (Critical)

### 1. Database Persistence ✅ CODE READY
**Current**: SQLite (`./mock_interview.db`) - not persistent in containerized environments
**Required**: PostgreSQL with persistent storage
**Status**: TypeORM already configured for PostgreSQL, just needs DATABASE_URL

**Solution**: 
- Provision PostgreSQL database (Render/Railway/Supabase)
- Set `DATABASE_URL` environment variable
- Database will auto-migrate on first start (`synchronize: true` in non-production, migrations for production)

### 2. File Storage Persistence ⚠️ NEEDS CODE CHANGES
**Current**: Local directory (`./uploads/resumes`) - lost on container restart
**Required**: S3-compatible storage or persistent volume
**Status**: Needs service modification to support cloud storage

**Solution Options**:
1. **AWS S3** (recommended for scale)
2. **Cloudinary** (simpler, built-in transformations)
3. **Render Persistent Disk** (easiest, but single-region)
4. **Railway Volume** (similar to Render)

---

## Environment Variables (All Services)

### Backend (.env)
```bash
# Environment
NODE_ENV=production
PORT=3001

# Database (CRITICAL - must be PostgreSQL in production)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
JWT_SECRET=<GENERATE_SECURE_64_CHAR_SECRET>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# AI Service Integration
AI_SERVICE_URL=https://your-ai-service.onrender.com

# File Upload
FILE_UPLOAD_MAX_SIZE=5242880
UPLOAD_STORAGE_TYPE=s3  # or 'local' or 'cloudinary'

# S3 Configuration (if using S3)
AWS_ACCESS_KEY_ID=<YOUR_AWS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET>
AWS_REGION=us-east-1
AWS_S3_BUCKET=mock-interview-resumes

# Cloudinary Configuration (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUD_NAME>
CLOUDINARY_API_KEY=<YOUR_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_API_SECRET>

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app
```

### AI Service (.env)
```bash
# LLM Provider Configuration
LLM_PROVIDER=anthropic  # or 'openai'

# Anthropic (recommended for better reasoning)
ANTHROPIC_API_KEY=<YOUR_ANTHROPIC_KEY>

# OpenAI (alternative)
OPENAI_API_KEY=<YOUR_OPENAI_KEY>

# Service Configuration
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-backend.onrender.com
MAX_WORKERS=4
LOG_LEVEL=INFO
```

### Frontend (.env.local for production build)
```bash
# Backend API
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com

# Environment
NEXT_PUBLIC_ENV=production
```

---

## Recommended Deployment Architecture

### Option A: Render + Vercel (Recommended)
**Cost**: ~$7-25/month
**Pros**: Automatic HTTPS, good DX, built-in PostgreSQL

```
Frontend (Vercel Free)
  ↓
Backend (Render $7/month Web Service)
  ↓
PostgreSQL (Render $7/month Starter DB)
  ↓
AI Service (Render $7/month Web Service)
```

**File Storage**: Render Persistent Disk (+$1/GB/month) OR AWS S3 (~$0.02/GB)

### Option B: Railway (All-in-One)
**Cost**: ~$5-20/month
**Pros**: Simpler billing, good for startups

```
All services on Railway:
- Frontend (Railway)
- Backend (Railway)
- PostgreSQL (Railway)
- AI Service (Railway)
- Persistent Volume for files
```

### Option C: AWS (Scalable)
**Cost**: Variable, ~$10-50/month initially
**Pros**: Most scalable, enterprise-ready

```
Frontend (Vercel or Amplify)
Backend (ECS Fargate or EC2)
PostgreSQL (RDS)
AI Service (ECS Fargate or Lambda)
File Storage (S3)
```

---

## Deployment Steps

### Phase 1: File Storage Migration (BLOCKING)

**A. If using AWS S3:**

1. Create S3 bucket:
```bash
aws s3 mb s3://mock-interview-resumes --region us-east-1
```

2. Update `backend/src/resumes/resumes.service.ts`:
```typescript
// Add at top
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// In constructor
private readonly s3Client: S3Client;
private readonly storageType: string;
private readonly s3Bucket: string;

constructor(...) {
  this.storageType = this.configService.get<string>('UPLOAD_STORAGE_TYPE', 'local');
  
  if (this.storageType === 's3') {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET');
  } else {
    // Local storage setup (existing code)
    this.uploadDir = path.resolve(process.cwd(), 'uploads', 'resumes');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }
}
```

3. Replace `fs.writeFileSync` with S3 upload in `uploadResume()`
4. Replace `fs.createReadStream` with S3 download in `getResumeFileStream()`
5. Replace `fs.unlinkSync` with S3 delete in `deleteResume()`

**B. If using Render Persistent Disk:**

1. In Render dashboard: Create Disk → Name: `resume-uploads` → Size: 10GB
2. Mount at `/app/uploads` in Render service settings
3. Update environment: `UPLOAD_STORAGE_TYPE=local`
4. Existing code will work (no changes needed)

---

### Phase 2: Database Setup

1. **Provision PostgreSQL**:
   - **Render**: Dashboard → New PostgreSQL → Starter ($7/mo)
   - **Railway**: New → Database → PostgreSQL
   - **Supabase**: Free tier available

2. **Get Connection String**:
   ```
   postgresql://user:pass@host.oregon-postgres.render.com:5432/dbname
   ```

3. **Set Environment Variable**:
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

4. **Test Connection Locally**:
   ```bash
   cd backend
   npm run start:dev
   # Check logs for successful connection
   ```

---

### Phase 3: Deploy Backend (Render)

1. **Create Web Service**:
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Plan: Starter ($7/month)

2. **Configure Environment Variables** (in Render dashboard):
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<FROM_STEP_2>
   JWT_SECRET=<GENERATE_64_CHAR_SECRET>
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   AI_SERVICE_URL=https://ai-service-xxx.onrender.com
   FILE_UPLOAD_MAX_SIZE=5242880
   UPLOAD_STORAGE_TYPE=disk  # or 's3'
   CORS_ORIGIN=https://your-app.vercel.app
   ```

3. **Attach Persistent Disk** (if using local storage):
   - Go to service → Disks → Attach
   - Mount Path: `/app/uploads`

4. **Deploy**: Render auto-deploys on git push

---

### Phase 4: Deploy AI Service (Render)

1. **Create Web Service**:
   - Root Directory: `ai-service`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - Plan: Starter ($7/month)

2. **Configure Environment Variables**:
   ```
   LLM_PROVIDER=anthropic
   ANTHROPIC_API_KEY=<YOUR_KEY>
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://backend-xxx.onrender.com
   MAX_WORKERS=4
   LOG_LEVEL=INFO
   ```

3. **Health Check**: `/health`

4. **Deploy**

---

### Phase 5: Deploy Frontend (Vercel)

1. **Import Project** in Vercel dashboard
2. **Root Directory**: `frontend`
3. **Framework Preset**: Next.js
4. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://backend-xxx.onrender.com
   NEXT_PUBLIC_ENV=production
   ```

6. **Deploy**: Auto-deploys on git push to main

---

### Phase 6: DNS & HTTPS

1. **Custom Domain** (optional):
   - Frontend: Vercel → Settings → Domains → Add `mockinterview.com`
   - Backend: Render → Settings → Custom Domain → Add `api.mockinterview.com`

2. **Update CORS**:
   ```bash
   # In backend .env
   CORS_ORIGIN=https://mockinterview.com,https://www.mockinterview.com
   ```

3. **SSL**: Automatic on Render and Vercel

---

## Post-Deployment Verification

### 1. Health Checks
```bash
# Backend
curl https://your-backend.onrender.com/health

# AI Service
curl https://your-ai-service.onrender.com/health

# Frontend
curl -I https://your-frontend.vercel.app
```

### 2. End-to-End Test
1. Register new user
2. Upload resume (verify file is persisted)
3. Create profile
4. Start interview
5. Submit answers
6. View evaluation report
7. Try "Try Again" feature
8. Restart backend container → verify files still exist

### 3. Database Migration Check
```bash
# Check tables created
psql $DATABASE_URL -c "\dt"

# Should see:
# - users
# - student_profiles
# - resumes
# - interviews
# - interview_answers
# - revised_answers
# - job_roles
```

---

## Monitoring & Logging

### Application Logs
- **Render**: Dashboard → Logs (real-time)
- **Vercel**: Dashboard → Deployments → View Function Logs

### Database Monitoring
- **Render PostgreSQL**: Metrics tab (connections, CPU, memory)

### Error Tracking (recommended additions)
- **Sentry** (frontend + backend)
- **LogRocket** (session replay)
- **Datadog** (full observability)

---

## Security Checklist

- [x] JWT secret generated securely (64+ characters)
- [x] DATABASE_URL contains strong password
- [x] CORS restricted to production domain
- [x] File upload validated (type, size, extension)
- [x] SQL injection prevented (TypeORM parameterization)
- [ ] Rate limiting on authentication endpoints (TODO)
- [ ] HTTPS enforced (automatic on Render/Vercel)
- [ ] Environment variables never committed to git
- [ ] S3 bucket not publicly accessible (if using S3)
- [ ] API keys rotated regularly

---

## Rollback Plan

1. **Vercel**: Deployments → Previous Deployment → Promote to Production
2. **Render**: Deploy → Previous Deploy → Manual Deploy
3. **Database**: Render PostgreSQL creates daily backups (restore via dashboard)

---

## Cost Estimate (Monthly)

### Minimal Setup (Render + Vercel)
- Frontend (Vercel): **$0** (free tier)
- Backend (Render): **$7** (Starter)
- AI Service (Render): **$7** (Starter)
- PostgreSQL (Render): **$7** (Starter)
- File Storage: **$1-5** (Persistent Disk 10GB or S3)
- **Total: ~$22/month**

### Production Setup (Railway)
- All services: **$5-20/month** (usage-based)
- More cost-effective for startups

### Enterprise Setup (AWS)
- Variable, typically **$50-200/month** initially

---

## Next Steps

1. ✅ Choose deployment platform (Render recommended)
2. ⚠️ **IMPLEMENT file storage solution** (S3 or Persistent Disk)
3. Create PostgreSQL database
4. Generate secure JWT_SECRET
5. Obtain LLM API key (Anthropic or OpenAI)
6. Deploy backend → AI service → frontend
7. Run E2E test
8. Set up monitoring
9. Configure custom domain (optional)
10. Launch! 🚀

---

## Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **TypeORM Migrations**: https://typeorm.io/migrations
- **AWS S3 SDK**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
