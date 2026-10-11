# 🚀 AI Mock Interview - Quick Deployment (55 Minutes)

**Cost**: $0/month (100% Free Tier)  
**Trade-off**: Cold starts after 15min inactivity  
**Alternative**: $14/month for no cold starts

---

## ⚡ QUICK START

### Step 1: Create Accounts (15 min)
1. **Neon** (Database): https://neon.tech → Sign up with GitHub
2. **Render** (Backend+AI): https://render.com → Sign up with GitHub
3. **Vercel** (Frontend): https://vercel.com → Sign up with GitHub
4. **Cloudinary** (Files): https://cloudinary.com → Free account
5. **Anthropic** (AI): https://console.anthropic.com → Get API key

### Step 2: Get Credentials (5 min)
- **Neon**: Create project → Copy connection string
- **Cloudinary**: Dashboard → Copy Cloud Name, API Key, API Secret
- **Anthropic**: Console → Create API key (`sk-ant-...`)

### Step 3: Deploy Backend (15 min)
1. Render → New → Web Service → Connect GitHub
2. **Settings**:
   - Name: `mock-interview-backend`
   - Root Directory: `backend`
   - Docker detected ✅
   - **Instance Type**: FREE ⚠️ (spins down)
3. **Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=<neon_connection_string>
   JWT_SECRET=<generate_64_char_random>
   AI_SERVICE_URL=<will_set_next>
   UPLOAD_STORAGE_TYPE=cloudinary
   CLOUDINARY_CLOUD_NAME=<your_value>
   CLOUDINARY_API_KEY=<your_value>
   CLOUDINARY_API_SECRET=<your_value>
   CORS_ORIGIN=<will_set_later>
   ```
4. Deploy → Wait 10 min → Copy URL

### Step 4: Deploy AI Service (10 min)
1. Render → New → Web Service
2. **Settings**:
   - Root Directory: `ai-service`
   - **Instance Type**: FREE ⚠️
3. **Environment Variables**:
   ```
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   ```
4. Deploy → Copy URL → Update backend's `AI_SERVICE_URL`

### Step 5: Deploy Frontend (5 min)
1. Vercel → New → Import Git Repository
2. **Settings**:
   - Root Directory: `frontend`
   - Next.js auto-detected ✅
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=<backend_url>
   ```
4. Deploy → Copy URL → Update backend's `CORS_ORIGIN`

### Step 6: Test (5 min)
1. Open frontend URL
2. Register → Login → Upload Resume
3. Start Interview → Answer Question
4. View Report ✅

---

## 📋 DETAILED STEPS

See `DEPLOYMENT_GUIDE_FREE.md` for comprehensive instructions with troubleshooting.

---

## 💰 COSTS

### Free Tier (Current)
- **Total**: $0/month
- **Limitations**: 
  - Cold starts (15-30s after 15min idle)
  - 512MB database storage (~1000 interviews)
  - 100 resume uploads/month

### Recommended Production ($14/month)
- **Render Starter**: $7 backend + $7 AI service
- **Everything else**: Still free
- **No cold starts** ✅
- **Better performance** ✅

---

## ⚠️ IMPORTANT NOTES

### Free Tier Trade-offs
1. **Cold Starts**: First request after 15min takes 15-30s
2. **Database Limit**: 512MB (sufficient for ~1000 interviews)
3. **File Storage**: 100 uploads/month (25 Cloudinary credits)
4. **LLM Credits**: $5 free (~500 questions), then needs payment

### When to Upgrade
- **Immediate use**: Start free, test thoroughly
- **Multiple users**: Upgrade backend/AI ($14/mo total)
- **Production**: Full upgrade ($60-100/mo) when profitable

---

## 🛠️ GENERATE JWT SECRET

**PowerShell**:
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

**Bash/Linux**:
```bash
openssl rand -base64 48
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] All services deployed and healthy
- [ ] Frontend loads without errors
- [ ] Can register and login
- [ ] Resume upload works
- [ ] Questions generate (may take 15-30s on cold start)
- [ ] Answers receive scores
- [ ] Report displays with coaching
- [ ] Files persist after backend restart

---

## 🆘 QUICK TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Backend 503 | Wait 15-30s (cold start), then retry |
| Database connection error | Check DATABASE_URL includes `?sslmode=require` |
| File upload fails | Verify Cloudinary credentials |
| Questions don't generate | Check Anthropic API key valid |
| CORS error | Update CORS_ORIGIN in backend |

---

## 📚 MORE HELP

- **Full Guide**: `DEPLOYMENT_GUIDE_FREE.md`
- **Paid Options**: `render.yaml` (Starter plans)
- **Build Results**: See below

---

## DONE! 🎉

Your AI Mock Interview is now live at $0/month.

**Next**: Share your Vercel URL and start conducting interviews!
