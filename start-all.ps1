# AI Mock Interview System - PowerShell Starter (Enhanced)
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   Starting AI Mock Interview System (All 3 Services)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

$pythonCmd = if (Get-Command python -ErrorAction SilentlyContinue) { "python" } elseif (Get-Command py -ErrorAction SilentlyContinue) { "py" } else { $null }
if (-not $pythonCmd) {
    Write-Host "❌ Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
$pythonVersion = & $pythonCmd --version
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green

# Free development ports only if occupied by previous interview instances
Write-Host "Checking development ports (3000, 3001, 8000)..." -ForegroundColor Yellow
3000, 3001, 8000 | ForEach-Object {
    $port = $_
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        $conns | ForEach-Object {
            try {
                $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
                if ($proc -and ($proc.ProcessName -match "node|python|py|cmd|powershell")) {
                    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                    Write-Host "  🔧 Freed port $port (process: $($proc.ProcessName))" -ForegroundColor Blue
                }
            } catch {
                # Port may already be free
            }
        }
    }
}

# 1. AI Service
Write-Host "[1/3] Starting AI Service on http://localhost:8000 ..." -ForegroundColor Green
$aiScript = "Set-Location '$rootDir\ai-service'; Write-Host '🤖 AI Mock Interview Service' -ForegroundColor Cyan; Write-Host 'Starting on http://localhost:8000' -ForegroundColor Green; if (Get-Command py -ErrorAction SilentlyContinue) { py test_server.py } else { python test_server.py }; if (`$LASTEXITCODE -ne 0) { Write-Host '❌ AI Service stopped with error' -ForegroundColor Red }"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $aiScript

Start-Sleep -Seconds 2

# 2. Backend Service
Write-Host "[2/3] Starting NestJS Backend on http://localhost:3001 ..." -ForegroundColor Green
$backendScript = "Set-Location '$rootDir\backend'; Write-Host '🔧 AI Mock Interview Backend (NestJS)' -ForegroundColor Cyan; Write-Host 'Starting on http://localhost:3001' -ForegroundColor Green; npm run start:dev; if (`$LASTEXITCODE -ne 0) { Write-Host '❌ Backend stopped with error' -ForegroundColor Red }"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

Start-Sleep -Seconds 3

# 3. Frontend Service
Write-Host "[3/3] Starting Next.js Frontend on http://localhost:3000 ..." -ForegroundColor Green
$frontendScript = "Set-Location '$rootDir\frontend'; Write-Host '🌐 AI Mock Interview Frontend (Next.js)' -ForegroundColor Cyan; Write-Host 'Starting on http://localhost:3000' -ForegroundColor Green; npm run dev; if (`$LASTEXITCODE -ne 0) { Write-Host '❌ Frontend stopped with error' -ForegroundColor Red }"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

# Wait and verify services
Write-Host ""
Write-Host "⏳ Waiting 15 seconds for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "🏥 Checking service health..." -ForegroundColor Blue

# Check AI Service
try {
    Invoke-RestMethod -Uri "http://localhost:8000/" -TimeoutSec 3 -ErrorAction Stop | Out-Null
    Write-Host "  ✅ AI Service (port 8000) - Ready" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  AI Service (port 8000) - Still starting..." -ForegroundColor Yellow
}

# Check Backend
try {
    Invoke-RestMethod -Uri "http://localhost:3001/api/v1/health" -TimeoutSec 3 -ErrorAction Stop | Out-Null
    Write-Host "  ✅ Backend (port 3001) - Ready" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Backend (port 3001) - Still starting..." -ForegroundColor Yellow
}

# Check Frontend  
try {
    Invoke-RestMethod -Uri "http://localhost:3000" -TimeoutSec 3 -ErrorAction Stop | Out-Null
    Write-Host "  ✅ Frontend (port 3000) - Ready" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Frontend (port 3000) - Still starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   🚀 AI Mock Interview System Started Successfully!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Service URLs:" -ForegroundColor Blue
Write-Host "   🌐 Main App:      http://localhost:3000" -ForegroundColor White
Write-Host "   🔧 Backend API:   http://localhost:3001/api/v1" -ForegroundColor White  
Write-Host "   📊 Health Check:  http://localhost:3001/api/v1/health" -ForegroundColor White
Write-Host "   🤖 AI Service:    http://localhost:8000" -ForegroundColor White
Write-Host "   📖 AI Docs:       http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "📝 Important Notes:" -ForegroundColor Yellow
Write-Host "   • Each service runs in its own PowerShell window" -ForegroundColor White
Write-Host "   • ENOWORKSPACES warnings are normal and don't affect functionality" -ForegroundColor White
Write-Host "   • Check individual windows for service logs and errors" -ForegroundColor White
Write-Host "   • Close service windows to stop individual services" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Quick Tests:" -ForegroundColor Blue
Write-Host '   Test Backend:  Invoke-RestMethod "http://localhost:3001/api/v1/health"' -ForegroundColor White
Write-Host '   Test AI:       Invoke-RestMethod "http://localhost:8000/"' -ForegroundColor White
Write-Host '   Test Frontend: Start-Process "http://localhost:3000"' -ForegroundColor White
Write-Host ""
Write-Host "✨ Ready to use! Open http://localhost:3000 to start testing." -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

# Open browser automatically
try {
    Start-Process "http://localhost:3000"
} catch {
    # Browser opening failed, that's OK
}
