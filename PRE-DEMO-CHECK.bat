@echo off
chcp 65001 > nul
title Pre-Demo System Check
color 0B

echo ═══════════════════════════════════════════════════════════════
echo    AI MOCK INTERVIEW - PRE-DEMONSTRATION CHECK
echo ═══════════════════════════════════════════════════════════════
echo.
echo Running system checks before your college demonstration...
echo.

REM Check Node.js
echo [1/8] Checking Node.js...
where node >nul 2>nul
if ERRORLEVEL 1 (
    echo [X] Node.js NOT FOUND! Install from: https://nodejs.org/
) else (
    node --version
    echo [OK] Node.js installed
)
echo.

REM Check npm
echo [2/8] Checking npm...
where npm >nul 2>nul
if ERRORLEVEL 1 (
    echo [X] npm NOT FOUND!
) else (
    npm --version
    echo [OK] npm installed
)
echo.

REM Check Python
echo [3/8] Checking Python...
where python >nul 2>nul
if ERRORLEVEL 1 (
    echo [X] Python NOT FOUND! Install from: https://www.python.org/
) else (
    python --version
    echo [OK] Python installed
)
echo.

REM Check Backend dependencies
echo [4/8] Checking Backend dependencies...
if exist "backend\node_modules" (
    echo [OK] Backend node_modules exists
) else (
    echo [X] Backend dependencies missing! Run: cd backend and npm install
)
echo.

REM Check Frontend dependencies
echo [5/8] Checking Frontend dependencies...
if exist "frontend\node_modules" (
    echo [OK] Frontend node_modules exists
) else (
    echo [X] Frontend dependencies missing! Run: cd frontend and npm install
)
echo.

REM Check Python virtual environment
echo [6/8] Checking AI Service dependencies...
if exist ".venv\Scripts\python.exe" (
    echo [OK] Python virtual environment exists
) else (
    echo [X] Python venv missing! Run: python -m venv .venv
)
echo.

REM Check environment files
echo [7/8] Checking environment configuration...
if exist "backend\.env" (
    echo [OK] backend\.env found
) else (
    echo [X] backend\.env missing!
)
if exist "frontend\.env.local" (
    echo [OK] frontend\.env.local found
) else (
    echo [X] frontend\.env.local missing!
)
if exist "ai-service\.env" (
    echo [OK] ai-service\.env found
) else (
    echo [X] ai-service\.env missing!
)
echo.

REM Check internet connection
echo [8/8] Checking internet connection...
ping -n 1 8.8.8.8 >nul 2>nul
if ERRORLEVEL 1 (
    echo [!] Internet connection not detected (required for Neon DB and OpenAI)
) else (
    echo [OK] Internet connection active
)
echo.

echo ═══════════════════════════════════════════════════════════════
echo    CHECK COMPLETE - Review results above
echo ═══════════════════════════════════════════════════════════════
echo.
echo If all checks show [OK], you can run START-DEMO.bat
echo.
pause
