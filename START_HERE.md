# 🚀 START HERE - Quick Test Guide

## Current Status
- ✅ Backend Running (http://localhost:3001)
- ✅ Frontend Running (http://localhost:3000)
- ❌ AI Service NOT Running (Python environment issue)

## Fix AI Service (5 minutes)

### Option 1: Use System Python (Fastest)
```powershell
# Install dependencies if needed
python -m pip install uvicorn fastapi openai anthropic PyPDF2 python-docx python-multipart aiohttp tenacity pydantic --user

# Start AI service
cd "c:\Users\ravil\OneDrive\Desktop\Ai Mock Interview\ai-service"
python -m uvicorn app.main:app --reload --port 8000
```

Wait for: `INFO:     Uvicorn running on http://127.0.0.1:8000`

### Option 2: Quick Test (if Option 1 fails)
Check if AI service is actually needed for your test:
- Resume extraction works WITHOUT AI service (uses local extraction)
- Evaluation NEEDS AI service for real LLM scoring

---

## Test 1: Resume Extraction ⏰ 2 minutes

1. Open browser: **http://localhost:3000**
2. Login: `test2@example.com` / `Test123456` (or register new user)
3. Click **Upload Resume**
4. Select any **text-based PDF** (not scanned image)
5. Wait for processing
6. **Check**: 
   - Status shows: EXTRACTING → PROCESSED ✅
   - Extracted text is **readable** (not `%PDF-1.5` garbage) ✅
   - Skills are detected ✅

**Result**: PASS / FAIL

---

## Test 2: Individual Scoring ⏰ 5 minutes

**Requires**: AI service running (Option 1 above)

1. Click **New Interview**
2. Settings:
   - Job Role: Software Engineer
   - Difficulty: Medium  
   - Number of Questions: 3
3. Start interview
4. **Answer Question 1**: Write 100+ word detailed answer
5. **Answer Question 2**: Write only 10-20 words
6. **Answer Question 3**: Leave empty or write nonsense
7. Complete interview
8. View **Report**
9. **Check**:
   - Question 1 score: **75-95/100** ✅
   - Question 2 score: **45-65/100** ✅
   - Question 3 score: **0-40/100** ✅
   - Each has **different, specific feedback** ✅
   - **NOT all ~71.9/100** ✅

**Actual Scores**: Q1:_____ Q2:_____ Q3:_____

**Result**: PASS / FAIL

---

## Test 3: Answer Coaching ⏰ 1 minute

1. In the same report
2. Look for **"How You Should Answer"** expandable sections
3. **Expected**: NOT YET VISIBLE (frontend UI pending)
4. **But**: Backend has coaching data stored

To verify backend data:
```powershell
cd "c:\Users\ravil\OneDrive\Desktop\Ai Mock Interview\backend"
sqlite3 mock_interview.db
SELECT modelAnswer, whyBetter FROM evaluations WHERE modelAnswer IS NOT NULL LIMIT 1;
.quit
```

**Result**: BACKEND DATA EXISTS / NO DATA

---

## Quick Fixes

### AI Service Won't Start?
```powershell
# Check what's missing
python -c "import uvicorn; import fastapi; import openai; print('All OK')"

# If error, install missing module
python -m pip install <module-name> --user
```

### Backend/Frontend Not Running?
```powershell
# Terminal 1 - Backend
cd "c:\Users\ravil\OneDrive\Desktop\Ai Mock Interview\backend"
npm run start:dev

# Terminal 2 - Frontend  
cd "c:\Users\ravil\OneDrive\Desktop\Ai Mock Interview\frontend"
npm run dev
```

### Database Issues?
```powershell
# Reset database (WARNING: deletes all data)
cd "c:\Users\ravil\OneDrive\Desktop\Ai Mock Interview\backend"
rm mock_interview.db
npm run start:dev  # Will recreate
```

---

## What Was Implemented

### ✅ Priority 1: Resume Extraction
- Fixed PDF raw character bug
- Added pdf-parse library
- Unit tested: PASS
- End-to-end: **TEST THIS**

### ✅ Priority 2: Individual Scoring  
- Replaced hardcoded evaluation
- Real LLM analysis (when available)
- Question-specific feedback
- Improved heuristic fallback
- Code complete: **TEST THIS**

### ⏸️ Priority 6: Coaching
- Backend stores coaching data ✅
- Frontend UI NOT implemented ❌
- Estimated time: 30 minutes

---

## Full Details

See: **IMPLEMENTATION_COMPLETE.md** for complete documentation

---

**Next Step**: Fix AI service, run Tests 1 & 2, report results ✅
