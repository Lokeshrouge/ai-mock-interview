#!/usr/bin/env pwsh
# AI Mock Interview System - Startup Script
# Starts all three services: Backend (NestJS), Frontend (Next.js), AI Service (Python)

Write-Host "🚀 Starting AI Mock Interview System..." -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
if (!(Test-Path "frontend\package.json") -or !(Test-Path "backend\package.json") -or !(Test-Path "ai-service\test_server.py")) {
    Write-Host "❌ Error: Please run this script from the AI Mock Interview project root directory" -ForegroundColor Red
    Write-Host "Expected structure:" -ForegroundColor Yellow
    Write-Host "  frontend/" -ForegroundColor Yellow
    Write-Host "  backend/" -ForegroundColor Yellow
    Write-Host "  ai-service/" -ForegroundColor Yellow
    exit 1
}

# Start AI Service (Python)
Write-Host "🤖 Starting AI Service on port 8000..." -ForegroundColor Blue
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'ai-service'; python test_server.py"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start Backend (NestJS)
Write-Host "⚙️  Starting Backend API on port 3001..." -ForegroundColor Magenta
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'backend'; npm run start:dev"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend (Next.js)
Write-Host "🌐 Starting Frontend on port 3000..." -ForegroundColor Cyan
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev"

Write-Host ""
Write-Host "✅ All services are starting up..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Service URLs:" -ForegroundColor Yellow
Write-Host "  • Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend API: http://localhost:3001/api/v1" -ForegroundColor White  
Write-Host "  • AI Service:  http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "⏰ Please wait 10-15 seconds for all services to fully start" -ForegroundColor Yellow
Write-Host "🌐 Then open http://localhost:3000 in your browser" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 To check service health:" -ForegroundColor Cyan
Write-Host "  • Backend:  curl http://localhost:3001/api/v1/health" -ForegroundColor Gray
Write-Host "  • AI Service: curl http://localhost:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this script (services will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")