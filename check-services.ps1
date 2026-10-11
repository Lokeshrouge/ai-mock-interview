#!/usr/bin/env pwsh
# AI Mock Interview System - Service Health Check Script

Write-Host "🔍 AI Mock Interview System - Health Check" -ForegroundColor Green
Write-Host ""

function Test-Service {
    param(
        [string]$ServiceName,
        [string]$Url,
        [string]$ExpectedStatus = "200"
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ $ServiceName" -ForegroundColor Green -NoNewline
            Write-Host " - $Url" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  $ServiceName" -ForegroundColor Yellow -NoNewline  
            Write-Host " - Status: $($response.StatusCode)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ $ServiceName" -ForegroundColor Red -NoNewline
        Write-Host " - NOT RESPONDING" -ForegroundColor Gray
        return $false
    }
    return $true
}

# Test all services
$frontendOk = Test-Service "Frontend (Next.js)" "http://localhost:3000"
$backendOk = Test-Service "Backend API" "http://localhost:3001/api/v1/health"  
$aiServiceOk = Test-Service "AI Service" "http://localhost:8000"

Write-Host ""

if ($frontendOk -and $backendOk -and $aiServiceOk) {
    Write-Host "🎉 All services are running correctly!" -ForegroundColor Green
    Write-Host "🌐 Open http://localhost:3000 to use the application" -ForegroundColor Cyan
} else {
    Write-Host "❗ Some services are not responding." -ForegroundColor Yellow
    Write-Host "💡 Run '.\start-all-services.ps1' to start all services" -ForegroundColor Cyan
}

Write-Host ""