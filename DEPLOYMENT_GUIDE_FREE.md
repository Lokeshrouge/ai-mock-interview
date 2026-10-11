# AI Mock Interview - Free Tier Deployment Guide

**Goal**: Deploy using 100% free hosting tiers  
**Total Monthly Cost**: $0  
**Trade-offs**: Cold starts (15-30 seconds), service sleeping

---

## FREE TIER SERVICES

| Service | Provider | Free Tier Limits |
|---------|----------|------------------|
| **Frontend** | Vercel | 100GB bandwidth, unlimited deploys |
| **Backend** | Render Free | Spins down after 15min inactivity, 512MB RAM, 0.1 CPU |
| **AI Service** | Render Free | Spins down after 15min inactivity, 512MB RAM, 0.1 CPU |
| **Database** | Neon | 512MB storage, 3GB data transfer |
| **File Storage** | Cloudinary | 25 credits/month (~1GB) |

---

## PREREQUISITES (15 minutes)

### 1. Create Accounts (All Free)
- [ ] **GitHub**: Push your code
- [ ] **Vercel**: https://vercel.com (Sign up with GitHub)
- [ ] **Render**: https://render.com (Sign up with GitHub)
- [ ] **Neon**: https://neon.tech (Sign up with GitHub)
- [ ] **Cloudinary**: https://cloudinary.com (Free account)
- [ ] **Anthropic**: https://console.anthropic.com (Get free API credits)

### 2. Get API Keys
- [ ] **Cloudinary**: Dashboard → Account Details
  - Cloud Name: `dxxxxxxx`
  - API Key: `123456789012345`
  - API Secret: `abcd...xyz`
- [ ] **Anthropic**: Console → API Keys → Create Key
  - Copy: `sk-ant-api03-...`

---

## DEPLOYMENT STEPS

### PHASE 1: Database Setup (Neon PostgreSQL - FREE)

#### 1.1 Create Neon Project
1. Go to https://console.neon.tech
2. Click **"Create Project"**
3. **Settings**:
   - Name: `mock-interview-db`
   - Region: **US East (Ohio)** (closest to Render Oregon)
   - PostgreSQL Version: 16
4. Click **"Create"**

#### 1.2 Get Connection String
1. Go to **Dashboard** → **Connection Details**
2. Copy **Connection String** (starts with `postgres://`)
   ```
   postgres://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb
   ```
3. **Save this securely** - you'll need it for backend deployment

#### 1.3 Initialize Database (Optional)
- Neon auto-creates the database
- Schema will be created automatically on first backend startup

---

### PHASE 2: Deploy Backend to Render (FREE)

#### 2.1 Create Web Service
1. Go to https://dashboard.render.com
2. Click **"New" → "Web Service"**
3. **Connect Repository**:
   - Choose **"Connect account"** (GitHub)
   - Select repository: `Ai Mock Interview`
4. **Configure Service**:
   - Name: `mock-interview-backend`
   - Region: **Oregon**
   - Root Directory: `backend`
   - Runtime: **Docker**
   - Dockerfile Path: `./Dockerfile`
   - **Instance Type**: **Free** ⚠️ (spins down after 15min)

#### 2.2 Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=<PASTE_NEON_CONNECTION_STRING>
JWT_SECRET=<GENERATE_BELOW>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
AI_SERVICE_URL=<WILL_SET_AFTER_AI_SERVICE>
FILE_UPLOAD_MAX_SIZE=5242880
UPLOAD_STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUDINARY_CLOUD_NAME>
CLOUDINARY_API_KEY=<YOUR_CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_CLOUDINARY_API_SECRET>
CORS_ORIGIN=<WILL_SET_AFTER_FRONTEND>
```

**Generate JWT_SECRET** (PowerShell):
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

#### 2.3 Deploy
1. Click **"Create Web Service"**
2. Wait ~5-10 minutes for build
3. Service URL will be: `https://mock-interview-backend-xxxx.onrender.com`
4. **Save this URL**

#### 2.4 Test Backend Health
```bash
curl https://mock-interview-backend-xxxx.onrender.com/api/v1/health
```
Expected: `{"status":"healthy","database":"connected"}`

---

### PHASE 3: Deploy AI Service to Render (FREE)

#### 3.1 Create Web Service
1. Render Dashboard → **"New" → "Web Service"**
2. Same repository: `Ai Mock Interview`
3. **Configure**:
   - Name: `mock-interview-ai-service`
   - Region: **Oregon**
   - Root Directory: `ai-service`
   - Runtime: **Docker**
   - Dockerfile Path: `./Dockerfile`
   - **Instance Type**: **Free** ⚠️

#### 3.2 Set Environment Variables
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...
ALLOWED_ORIGINS=*
MAX_WORKERS=1
LOG_LEVEL=INFO
```

#### 3.3 Deploy
1. Click **"Create Web Service"**
2. Wait ~3-5 minutes
3. Service URL: `https://mock-interview-ai-service-xxxx.onrender.com`
4. **Save this URL**

#### 3.4 Update Backend AI_SERVICE_URL
1. Go to Backend service → **Environment**
2. Update `AI_SERVICE_URL` with AI service URL
3. Click **"Save Changes"** (triggers auto-redeploy)

---

### PHASE 4: Deploy Frontend to Vercel (FREE)

#### 4.1 Import Project
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select `Ai Mock Interview` repository
4. **Configure**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)

#### 4.2 Set Environment Variables
Click **"Environment Variables"**:
```bash
NEXT_PUBLIC_API_URL=https://mock-interview-backend-xxxx.onrender.com
NEXT_PUBLIC_ENV=production
```

#### 4.3 Deploy
1. Click **"Deploy"**
2. Wait ~2-3 minutes
3. Your app will be live at: `https://your-app-name.vercel.app`
4. **Copy this URL**

#### 4.4 Update Backend CORS
1. Go to Render → Backend service → **Environment**
2. Update `CORS_ORIGIN` to your Vercel URL
3. **Save Changes** (triggers redeploy)

---

## VERIFICATION CHECKLIST

### Automated Health Checks
```bash
# Backend
curl https://your-backend.onrender.com/api/v1/health

# AI Service
curl https://your-ai-service.onrender.com/health

# Frontend
curl -I https://your-app.vercel.app
```

### Manual E2E Test
1. [ ] Open frontend URL
2. [ ] Register new account
3. [ ] Login successfully
4. [ ] Upload resume (PDF/DOCX)
5. [ ] Resume appears in list
6. [ ] Start interview → Select role
7. [ ] Questions generate (wait ~5-10s on cold start)
8. [ ] Submit answer
9. [ ] View report with score
10. [ ] Check coaching sections
11. [ ] Test "Try Again" feature

### Cold Start Test
1. [ ] Wait 15 minutes without using app
2. [ ] Refresh page
3. [ ] First request takes 15-30 seconds ✅ (This is normal on free tier)
4. [ ] Subsequent requests are fast

### Persistence Test
1. [ ] Upload a resume
2. [ ] Note resume ID
3. [ ] Wait 1 hour
4. [ ] Download same resume
5. [ ] ✅ Download succeeds (Cloudinary persistence verified)

---

## FREE TIER LIMITATIONS

### ⚠️ Important Trade-offs

| Service | Limitation | Impact | Workaround |
|---------|------------|--------|------------|
| **Render Free** | Spins down after 15min | First request: 15-30s cold start | Use paid plan ($7/mo per service) |
| **Neon Free** | 512MB storage | ~1000 interviews | Upgrade to Pro ($19/mo) |
| **Cloudinary Free** | 25 credits/month | ~100 resume uploads | Upgrade to Plus ($89/mo) or compress |
| **Anthropic Free** | $5 free credits | ~500 questions | Add payment method |

### When to Upgrade

**Scenario 1: Personal Portfolio** → Stay Free ✅
- Low traffic
- Cold starts acceptable
- Demo purposes

**Scenario 2: Small User Base (10-50 users)** → Upgrade Backend Only ($14/mo)
- Render Starter: $7/mo backend + $7/mo AI service
- Keep Vercel, Neon, Cloudinary free
- No cold starts

**Scenario 3: Production (100+ users)** → Full Upgrade ($60-100/mo)
- Render Starter or Pro
- Neon Pro ($19/mo)
- Cloudinary Plus ($89/mo) or S3 (~$5/mo)
- Vercel Pro if needed ($20/mo)

---

## TROUBLESHOOTING

### Backend Returns 503 "Service Unavailable"
**Cause**: Free tier service asleep  
**Solution**: Wait 15-30 seconds for cold start, then retry

### Database Connection Failed
**Check**:
1. Neon project is active (not paused)
2. DATABASE_URL is correct (check for typos)
3. Database URL includes `?sslmode=require`

**Fix**:
```bash
# Add SSL mode to connection string
DATABASE_URL=postgres://...@neon.tech/neondb?sslmode=require
```

### File Upload Fails
**Check**:
1. Cloudinary credentials are correct
2. Monthly credit limit not exceeded (check dashboard)
3. File size under 5MB

### Questions Don't Generate
**Check**:
1. AI service is running (`curl <ai-url>/health`)
2. Anthropic API key is valid
3. Free credits not exhausted

**Fix**: Add payment method at console.anthropic.com

### Frontend Can't Connect to Backend
**Check**:
1. NEXT_PUBLIC_API_URL matches backend URL exactly
2. CORS_ORIGIN in backend matches frontend URL
3. Backend is deployed and healthy

---

## COST BREAKDOWN

### Monthly Costs (100% Free Tier)
| Service | Plan | Cost |
|---------|------|------|
| Frontend (Vercel) | Hobby | $0 |
| Backend (Render) | Free | $0 |
| AI Service (Render) | Free | $0 |
| Database (Neon) | Free | $0 |
| File Storage (Cloudinary) | Free | $0 |
| LLM (Anthropic) | Free Credits | $0* |
| **TOTAL** | | **$0/month** |

*Anthropic provides $5 free credits (~500 questions). Add payment for production.

### Usage Limits
- **Render Free**: 750 hours/month (unlimited if using 2 services)
- **Vercel Free**: 100GB bandwidth, unlimited builds
- **Neon Free**: 512MB storage, 3GB data transfer/month
- **Cloudinary Free**: 25 credits (~100 files or 1GB storage)
- **Anthropic Free**: $5 credits (~500 LLM requests)

---

## MIGRATION TO PAID (When Ready)

### Backend Sleep Prevention
**Problem**: 15-minute cold starts frustrate users  
**Solution**: Upgrade to Render Starter ($7/mo per service)

**Steps**:
1. Render Dashboard → Service → Settings
2. Change Instance Type: **Free** → **Starter**
3. Click **"Save Changes"**
4. No code changes needed ✅

### Database Scaling
**Problem**: Neon free tier fills up (512MB)  
**Solution**: Upgrade to Neon Pro ($19/mo - 10GB)

**Steps**:
1. Neon Console → Project → Settings → Billing
2. Select **Pro Plan**
3. Connection string stays the same ✅

---

## SECURITY CHECKLIST

- [ ] JWT_SECRET is 64+ random characters
- [ ] Database password is strong
- [ ] CORS restricted to frontend domain
- [ ] All .env files in .gitignore
- [ ] No secrets in git history
- [ ] HTTPS enforced (automatic on all platforms)
- [ ] API keys rotated regularly

---

## POST-DEPLOYMENT ACTIONS

### Monitoring (Free Options)
- **UptimeRobot**: https://uptimerobot.com (Free - 50 monitors)
  - Monitor backend health endpoint
  - Get email alerts on downtime
- **Vercel Analytics**: Built-in (free)
  - Track page views and performance

### Custom Domain (Optional)
1. **Buy domain**: Namecheap, Google Domains ($10-15/year)
2. **Vercel**: Settings → Domains → Add domain
3. **Update DNS**: Point to Vercel
4. **Update CORS**: Add custom domain to backend

---

## SUPPORT RESOURCES

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## ESTIMATED DEPLOYMENT TIME

| Phase | Time |
|-------|------|
| Prerequisites (accounts + API keys) | 15 min |
| Database setup (Neon) | 5 min |
| Backend deployment (Render) | 10 min |
| AI service deployment (Render) | 10 min |
| Frontend deployment (Vercel) | 5 min |
| Testing & verification | 10 min |
| **TOTAL** | **55 minutes** |

---

## READY TO DEPLOY

**You have everything needed**:
- ✅ Code is production-ready
- ✅ All configurations prepared
- ✅ Free tier services identified
- ✅ Migration paths documented

**Start with**: Phase 1 - Database Setup  
**End with**: Live production app at $0/month

🚀 **Begin deployment now!**
