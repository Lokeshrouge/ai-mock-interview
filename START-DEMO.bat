@echo off
chcp 65001 > nul
title AI Mock Interview - College Demo
color 0A

echo ═══════════════════════════════════════════════════════════════
echo    AI MOCK INTERVIEW - FINAL YEAR PROJECT DEMONSTRATION
echo ═══════════════════════════════════════════════════════════════
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [✓] Node.js found: 
node --version
echo [✓] Python found: 
python --version
echo.

echo ═══════════════════════════════════════════════════════════════
echo    STARTING SERVICES...
echo ═══════════════════════════════════════════════════════════════
echo.

REM Kill any existing processes on required ports
echo [→] Checking for processes on ports 3000, 3001, 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 >nul
echo [✓] Ports cleared
echo.

REM Start Backend
echo [1/3] Starting Backend (NestJS)...
cd backend
start "Backend - AI Mock Interview" cmd /k "npm run start:dev"
cd ..
timeout /t 3 >nul
echo [✓] Backend starting on http://localhost:3001
echo.

REM Start AI Service
echo [2/3] Starting AI Service (Python FastAPI)...
cd ai-service
start "AI Service - AI Mock Interview" cmd /k "..\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
cd ..
timeout /t 3 >nul
echo [✓] AI Service starting on http://localhost:8000
echo.

REM Start Frontend
echo [3/3] Starting Frontend (Next.js)...
cd frontend
start "Frontend - AI Mock Interview" cmd /k "npm run dev"
cd ..
echo [✓] Frontend starting on http://localhost:3000
echo.

echo ═══════════════════════════════════════════════════════════════
echo    WAITING FOR SERVICES TO BE READY...
echo ═══════════════════════════════════════════════════════════════
echo.
echo Please wait 10-15 seconds for all services to initialize...
timeout /t 15 >nul

REM Test Backend Health
echo [→] Testing Backend...
curl -s http://localhost:3001/api/v1/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Backend is READY
) else (
    echo [⚠] Backend may still be starting... Check the Backend window
)

REM Test AI Service Health
echo [→] Testing AI Service...
curl -s http://localhost:8000/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] AI Service is READY
) else (
    echo [⚠] AI Service may still be starting... Check the AI Service window
)

REM Test Frontend
echo [→] Testing Frontend...
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Frontend is READY
) else (
    echo [⚠] Frontend may still be starting... Check the Frontend window
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo    APPLICATION READY FOR DEMONSTRATION!
echo ═══════════════════════════════════════════════════════════════
echo.
echo Open in browser: http://localhost:3000
echo.
echo Three windows are running:
echo   - Backend (Port 3001)
echo   - AI Service (Port 8000)
echo   - Frontend (Port 3000)
echo.
echo To stop all services: Close all three windows
echo.
echo ═══════════════════════════════════════════════════════════════
echo    DEMONSTRATION GUIDE
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Register a new user or login
echo 2. Create your profile (skills, experience)
echo 3. Optional: Upload resume for AI parsing
echo 4. Start a mock interview
echo 5. Answer AI-generated questions
echo 6. Get instant AI evaluation and feedback
echo 7. View detailed performance report
echo 8. Check interview history
echo.
echo Database: Neon PostgreSQL (Internet required)
echo AI: OpenAI GPT-4-turbo (API key required)
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo Browser opened! Application is ready.
echo Keep this window open during your demonstration.
echo.
pause
