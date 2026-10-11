@echo off
title AI Mock Interview - Starting Services
echo ======================================================================
echo    Starting AI Mock Interview System (All 3 Services)
echo ======================================================================
echo.

set ROOT_DIR=%~dp0

echo Checking and freeing ports 3000, 3001, 8000 only if occupied by interview servers...
powershell -Command "3000,3001,8000 | ForEach-Object { $p = $_; $c = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue; if ($c) { $c | ForEach-Object { $pr = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; if ($pr -and ($pr.ProcessName -match 'node|python|py|cmd|powershell')) { Stop-Process -Id $pr.Id -Force -ErrorAction SilentlyContinue } } } }" 2>nul

echo [1/3] Starting AI Service on http://localhost:8000 ...
start "AI Service (Port 8000)" cmd /k "cd /d %ROOT_DIR%ai-service && (py test_server.py 2>nul || python test_server.py || pause)"

timeout /t 2 /nobreak >nul

echo [2/3] Starting NestJS Backend on http://localhost:3001 ...
start "NestJS Backend (Port 3001)" cmd /k "cd /d %ROOT_DIR%backend && (npm run start:dev || pause)"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Next.js Frontend on http://localhost:3000 ...
start "Next.js Frontend (Port 3000)" cmd /k "cd /d %ROOT_DIR%frontend && (npm run dev || pause)"

echo.
echo ======================================================================
echo    All services launched in dedicated windows!
echo    - Frontend:    http://localhost:3000
echo    - Backend API: http://localhost:3001/api/v1
echo    - AI Service:  http://localhost:8000
echo    - Health:      http://localhost:3001/api/v1/health
echo ======================================================================
pause
