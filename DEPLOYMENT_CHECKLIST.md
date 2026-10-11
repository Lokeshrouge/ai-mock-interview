# AI Mock Interview - Production Deployment Checklist

## Pre-Deployment (Complete)

- [x] All core features implemented
- [x] Answer validation with gibberish detection
- [x] Question deduplication
- [x] Try Again feature
- [x] Coaching UI with 5 sections
- [x] Database supports PostgreSQL
- [x] File storage abstraction (local/S3/Cloudinary)
- [x] Environment variables documented
- [x] Comprehensive testing completed

---

## Critical Decisions (Choose Now)

### 1. Deployment Platform
- [ ] **Render** (recommended - $7/service, PostgreSQL $7, total ~$21/mo)
- [ ] **Railway** (usage-based, ~$5-20/mo)
- [ ] **AWS** (scalable, ~$10-50/mo initially)

### 2. File Storage Backend
- [ ] **AWS S3** (best for scale, $0.02/GB)
- [ ] **Cloudinary** (free tier, then $0.14/GB)
- [ ] **Persistent Disk** (Render: $1/GB, Railway: similar)

### 3. LLM Provider
- [ ] **Anthropic Claude** (recommended, better reasoning)
- [ ] **OpenAI GPT** (alternative)

---

## Phase 1: Environment Setup

### Backend Environment Variables
```bash
# Copy template
cp backend/.env.example backend/.env.production

# CRITICAL: Generate secure values
NODE_ENV=production
JWT_SECRET=<GENERATE_64_CHAR_SECRET_HERE>

# Database (provision PostgreSQL first)
DATABASE_URL=postgresql://user:pass@host:port/dbname

# File Storage (choose one)
UPLOAD_STORAGE_TYPE=s3  # or 'local' or 'cloudinary'

# If using S3:
AWS_ACCESS_KEY_ID=<YOUR_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_SECRET>
AWS_REGION=us-east-1
AWS_S3_BUCKET=mock-interview-resumes

# If using Cloudinary:
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUD>
CLOUDINARY_API_KEY=<YOUR_KEY>
CLOUDINARY_API_SECRET=<YOUR_SECRET>

# AI Service URL (update after deploying AI service)
AI_SERVICE_URL=https://your-ai-service.onrender.com

# CORS (update with frontend URL)
CORS_ORIGIN=https://your-app.vercel.app
```

### AI Service Environment Variables
```bash
cp ai-service/.env.example ai-service/.env.production

# LLM Provider
LLM_PROVIDER=anthropic  # or 'openai'
ANTHROPIC_API_KEY=<YOUR_ANTHROPIC_KEY>
# OR
OPENAI_API_KEY=<YOUR_OPENAI_KEY>

# CORS
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-backend.onrender.com
```

### Frontend Environment Variables
```bash
# In Vercel dashboard or .env.production
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_ENV=production
```

---

## Phase 2: External Services Setup

### PostgreSQL Database
- [ ] Create database instance
  - **Render**: Dashboard → New PostgreSQL → Starter ($7/mo)
  - **Railway**: New → Database → PostgreSQL
  - **Supabase**: Free tier available
- [ ] Copy connection string
- [ ] Test connection locally:
  ```bash
  DATABASE_URL=<connection_string> npm run start:dev
  ```

### File Storage (Choose One)

#### Option A: AWS S3
- [ ] Create AWS account
- [ ] Create S3 bucket:
  ```bash
  aws s3 mb s3://mock-interview-resumes --region us-east-1
  ```
- [ ] Create IAM user with S3 permissions
- [ ] Get access key and secret
- [ ] Update backend environment variables

#### Option B: Cloudinary
- [ ] Sign up at cloudinary.com
- [ ] Get cloud name, API key, API secret
- [ ] Update backend environment variables

#### Option C: Persistent Disk
- [ ] Create disk in platform dashboard (10GB)
- [ ] Note mount path: `/app/uploads`
- [ ] Set `UPLOAD_STORAGE_TYPE=local`

### LLM API Key
- [ ] Get Anthropic API key: console.anthropic.com
  - OR Get OpenAI API key: platform.openai.com
- [ ] Update AI service environment variables
- [ ] Test API key locally:
  ```bash
  cd ai-service
  python test_server.py
  ```

---

## Phase 3: Deploy Backend

### Render Deployment
- [ ] Connect GitHub repository
- [ ] Create Web Service:
  - Name: `mock-interview-backend`
  - Root Directory: `backend`
  - Build Command: `npm install && npm run build`
  - Start Command: `npm run start:prod`
  - Plan: Starter ($7/mo)
- [ ] Add all environment variables (from Phase 1)
- [ ] If using persistent disk: Attach disk at `/app/uploads`
- [ ] Deploy and wait for success
- [ ] Test health endpoint: `https://your-backend.onrender.com/health`

### Railway Deployment
- [ ] Import GitHub repository
- [ ] Create service from `backend` directory
- [ ] Add environment variables
- [ ] If using volume: Create and attach volume
- [ ] Deploy
- [ ] Test health endpoint

---

## Phase 4: Deploy AI Service

### Render Deployment
- [ ] Create Web Service:
  - Name: `mock-interview-ai-service`
  - Root Directory: `ai-service`
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
  - Plan: Starter ($7/mo)
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test health endpoint: `https://your-ai-service.onrender.com/health`
- [ ] Update backend `AI_SERVICE_URL` with this URL
- [ ] Redeploy backend

---

## Phase 5: Deploy Frontend

### Vercel Deployment
- [ ] Import GitHub repository
- [ ] Configure project:
  - Framework: Next.js
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `.next`
- [ ] Add environment variables:
  ```
  NEXT_PUBLIC_API_URL=<backend_url>
  NEXT_PUBLIC_ENV=production
  ```
- [ ] Deploy
- [ ] Get deployment URL
- [ ] Update backend `CORS_ORIGIN` with this URL
- [ ] Redeploy backend

---

## Phase 6: Post-Deployment Verification

### Health Checks
- [ ] Backend health: `curl https://backend-url/health`
- [ ] AI service health: `curl https://ai-service-url/health`
- [ ] Frontend loads: `curl -I https://frontend-url`

### End-to-End Test
- [ ] Open frontend in browser
- [ ] Register new account
  - Email should be valid format
  - Password should be strong
  - Account created successfully
- [ ] Log in
  - JWT token received
  - Redirected to dashboard
- [ ] Upload resume
  - PDF or DOCX accepted
  - Processing status visible
  - **CRITICAL**: Check file persists after backend restart
- [ ] Create/update profile
  - Skills saved
  - Experience level saved
- [ ] Start interview
  - Select job role
  - Select company
  - 5 unique questions generated
  - No duplicate questions
- [ ] Answer questions
  - Voice recording works (optional)
  - Text input works
  - Submit answers
- [ ] View evaluation report
  - Scores displayed (0-100)
  - Gibberish answers scored 0
  - Valid answers scored appropriately
  - Coaching displayed in 5 sections
  - Try Again button works
- [ ] Try revised answer
  - New answer submitted
  - New score calculated
  - Improvement tracked

### Container Restart Test (CRITICAL)
- [ ] Upload a test resume
- [ ] Note the resume ID
- [ ] Restart backend service in platform dashboard
- [ ] Try to download the same resume
- [ ] **Expected**: Download succeeds
- [ ] **If fails**: File storage not persistent → fix storage configuration

---

## Phase 7: Security Hardening

### Secrets Audit
- [ ] All secrets in environment variables (not in code)
- [ ] `.env` files NOT in git repository
- [ ] JWT_SECRET is strong (64+ characters)
- [ ] Database password is strong
- [ ] AWS credentials restricted to minimal permissions
- [ ] API keys rotated if ever exposed

### CORS Configuration
- [ ] Backend CORS restricted to frontend domain
- [ ] No wildcard `*` origins in production
- [ ] AI service CORS restricted to backend + frontend

### Database Security
- [ ] Database connection uses SSL
- [ ] Database password is strong
- [ ] No public database access
- [ ] TypeORM synchronize disabled in production (or migrations set up)

### File Upload Security
- [ ] File type validation active (PDF/DOCX only)
- [ ] File size limit enforced (5MB)
- [ ] S3 bucket not public (if using S3)
- [ ] UUID-based filenames (no user input in paths)

---

## Phase 8: Monitoring Setup (Recommended)

### Application Monitoring
- [ ] Check logs in platform dashboard
  - Render: Logs tab
  - Railway: Logs tab
  - Vercel: Functions → View Logs
- [ ] Set up error alerts
- [ ] Monitor response times

### Database Monitoring
- [ ] Check database metrics
- [ ] Set up connection pool monitoring
- [ ] Configure backup schedule

### Cost Monitoring
- [ ] Review monthly costs
- [ ] Set billing alerts
- [ ] Monitor S3 usage (if using S3)

---

## Phase 9: Optional Enhancements

### Custom Domain
- [ ] Purchase domain (optional)
- [ ] Configure DNS:
  - Frontend: Vercel → Add domain
  - Backend: Render → Add custom domain
- [ ] Update CORS_ORIGIN with new domain
- [ ] SSL certificates auto-generated

### Error Tracking
- [ ] Set up Sentry for error tracking
- [ ] Add Sentry DSN to environment variables
- [ ] Test error reporting

### Analytics
- [ ] Add Google Analytics to frontend
- [ ] Track key events:
  - User registration
  - Resume upload
  - Interview started
  - Interview completed

### Rate Limiting
- [ ] Add rate limiting to authentication endpoints
- [ ] Add rate limiting to AI service calls
- [ ] Configure limits in environment

---

## Rollback Plan

### Frontend Rollback
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "Promote to Production"
4. **Rollback time**: ~30 seconds

### Backend Rollback
1. Platform Dashboard → Deployments/Services
2. Find previous working deployment
3. Click "Rollback" or "Deploy"
4. **Rollback time**: ~2-5 minutes

### Database Rollback
1. Platform Dashboard → Database → Backups
2. Select backup timestamp
3. Click "Restore"
4. **Rollback time**: ~5-15 minutes
5. **Note**: This restores entire database, loses recent data

---

## Troubleshooting Common Issues

### Issue: Backend won't start
**Symptoms**: 500 errors, health check fails
**Debug**:
1. Check logs for error message
2. Verify all environment variables set
3. Test DATABASE_URL connection
4. Check JWT_SECRET is set
5. Verify AI_SERVICE_URL is correct

### Issue: File uploads fail
**Symptoms**: Upload returns 400/500 error
**Debug**:
1. Check UPLOAD_STORAGE_TYPE is set
2. If S3: verify AWS credentials and bucket exists
3. If Cloudinary: verify credentials
4. If local: check persistent disk mounted
5. Check backend logs for specific error

### Issue: Questions not generating
**Symptoms**: Stuck on loading, timeout
**Debug**:
1. Check AI_SERVICE_URL is correct
2. Test AI service health endpoint
3. Verify LLM_PROVIDER and API key set
4. Check AI service logs for errors
5. Test API key directly with curl

### Issue: CORS errors in browser
**Symptoms**: "Access-Control-Allow-Origin" error
**Debug**:
1. Check CORS_ORIGIN matches frontend URL exactly
2. Include protocol (https://)
3. No trailing slash
4. Redeploy backend after changing CORS_ORIGIN

### Issue: Authentication fails
**Symptoms**: "Unauthorized" errors, login fails
**Debug**:
1. Check JWT_SECRET is set and same across deploys
2. Verify JWT_EXPIRES_IN is reasonable (15m)
3. Check browser cookies enabled
4. Test with different browser
5. Check backend logs for JWT errors

---

## Success Criteria

### All Green Checkmarks:
- ✅ All 3 services deployed and healthy
- ✅ End-to-end test passes
- ✅ Files persist after restart
- ✅ No CORS errors
- ✅ Authentication works
- ✅ Questions generate uniquely
- ✅ Answers evaluated correctly
- ✅ Gibberish detected
- ✅ Coaching displayed properly
- ✅ Try Again feature works

---

## Timeline Estimate

| Phase | Estimated Time |
|-------|----------------|
| Pre-Deployment | ✅ Complete |
| Environment Setup | 15 minutes |
| External Services | 30 minutes |
| Deploy Backend | 10 minutes |
| Deploy AI Service | 10 minutes |
| Deploy Frontend | 5 minutes |
| Post-Deployment Verification | 20 minutes |
| Security Hardening | 15 minutes |
| **Total** | **~2 hours** |

---

## Cost Summary (Monthly)

### Minimal Setup
- Frontend (Vercel): $0
- Backend (Render): $7
- AI Service (Render): $7
- PostgreSQL (Render): $7
- File Storage (Cloudinary free tier): $0
- **Total: $21/month**

### Production Setup
- Frontend (Vercel): $0
- Backend (Render): $7
- AI Service (Render): $7
- PostgreSQL (Render): $7
- File Storage (S3): $1
- Monitoring (Sentry free tier): $0
- **Total: $22/month**

### Scale (1000 users)
- Frontend (Vercel): $20
- Backend (Render Pro): $25
- AI Service (Render Pro): $25
- PostgreSQL (Render Standard): $20
- File Storage (S3): $5
- Monitoring (Sentry Team): $26
- **Total: $121/month**

---

## Ready to Deploy?

Before proceeding, ensure:
- [x] Code is committed and pushed to GitHub
- [ ] All critical decisions made (platform, storage, LLM provider)
- [ ] External services accounts created
- [ ] Credit card ready for paid services (Render, Railway, etc.)
- [ ] 2 hours available for deployment and testing
- [ ] Backup plan ready (rollback strategy understood)

**Start with Phase 1 above** ⬆️
