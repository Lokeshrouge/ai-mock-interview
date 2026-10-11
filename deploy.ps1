#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Deploy AI Mock Interview System with single-URL configuration
.DESCRIPTION
    This script deploys the complete AI Mock Interview System using Docker Compose
    with nginx reverse proxy for single-URL access
#>

param(
    [Parameter(HelpMessage="Environment to deploy (dev|prod)")]
    [ValidateSet("dev", "prod")]
    [string]$Environment = "prod",
    
    [Parameter(HelpMessage="Skip build step")]
    [switch]$SkipBuild,
    
    [Parameter(HelpMessage="Clean existing containers and volumes")]
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 AI Mock Interview System Deployment" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Check Docker availability
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH"
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Compose is not installed or not in PATH"
    exit 1
}

# Set compose file based on environment
$ComposeFile = if ($Environment -eq "prod") { "docker-compose.prod.yml" } else { "docker-compose.yml" }
$EnvFile = if ($Environment -eq "prod") { ".env.production" } else { ".env" }

Write-Host "📋 Using configuration:" -ForegroundColor Green
Write-Host "  - Compose file: $ComposeFile"
Write-Host "  - Environment: $EnvFile"

# Check if files exist
if (-not (Test-Path $ComposeFile)) {
    Write-Error "Docker compose file not found: $ComposeFile"
    exit 1
}

if (-not (Test-Path $EnvFile)) {
    Write-Warning "Environment file not found: $EnvFile - using defaults"
}

# Clean existing deployment if requested
if ($Clean) {
    Write-Host "🧹 Cleaning existing deployment..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile down --volumes --remove-orphans
    docker system prune -f
}

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f $ComposeFile down

# Build images if not skipped
if (-not $SkipBuild) {
    Write-Host "🔨 Building application images..." -ForegroundColor Blue
    docker-compose -f $ComposeFile build --no-cache
}

# Start services
Write-Host "🚀 Starting services..." -ForegroundColor Green
if (Test-Path $EnvFile) {
    docker-compose -f $ComposeFile --env-file $EnvFile up -d
} else {
    docker-compose -f $ComposeFile up -d
}

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host "🏥 Checking service health..." -ForegroundColor Blue

$services = @("nginx", "backend", "frontend", "ai-service")
$healthyServices = @()

foreach ($service in $services) {
    $containerName = "mock_interview_$service"
    try {
        $status = docker inspect --format='{{.State.Health.Status}}' $containerName 2>$null
        if ($status -eq "healthy" -or $status -eq "") {
            $healthyServices += $service
            Write-Host "  ✅ $service" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $service ($status)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ⚠️  $service (no health check)" -ForegroundColor Yellow
        $healthyServices += $service
    }
}

# Show deployment information
Write-Host "`n🎯 Deployment Complete!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if ($Environment -eq "prod") {
    Write-Host "🌐 Application URL: http://localhost" -ForegroundColor Green
    Write-Host "📊 Health Check:   http://localhost/health" -ForegroundColor Green
    Write-Host "🔧 API Endpoint:   http://localhost/api/v1" -ForegroundColor Green
} else {
    Write-Host "🌐 Frontend:       http://localhost:3000" -ForegroundColor Green
    Write-Host "🔧 Backend API:    http://localhost:3001/api/v1" -ForegroundColor Green
    Write-Host "🤖 AI Service:     http://localhost:8000" -ForegroundColor Green
}

Write-Host "`n📋 Service Status:" -ForegroundColor Blue
docker-compose -f $ComposeFile ps

Write-Host "`n🔍 Useful Commands:" -ForegroundColor Yellow
Write-Host "  View logs:        docker-compose -f $ComposeFile logs -f"
Write-Host "  Stop services:    docker-compose -f $ComposeFile down"
Write-Host "  Restart service:  docker-compose -f $ComposeFile restart <service>"
Write-Host "  Shell access:     docker-compose -f $ComposeFile exec <service> sh"

# Test main endpoint
if ($Environment -eq "prod") {
    Write-Host "`n🧪 Testing main endpoint..." -ForegroundColor Blue
    try {
        $response = Invoke-RestMethod -Uri "http://localhost/health" -TimeoutSec 5
        if ($response -eq "healthy") {
            Write-Host "  ✅ Main endpoint responding" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️  Main endpoint not ready yet (this is normal)" -ForegroundColor Yellow
        Write-Host "     Try accessing http://localhost in a few moments"
    }
}

Write-Host "`n✨ Deployment completed successfully!" -ForegroundColor Green