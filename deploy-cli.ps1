# AI Mock Interview - CLI Deployment Script
# Run this after manually creating services in Render dashboard

param(
    [Parameter(Mandatory=$false)]
    [string]$BackendUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$AiServiceUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$CloudinaryName,
    
    [Parameter(Mandatory=$false)]
    [string]$CloudinaryKey,
    
    [Parameter(Mandatory=$false)]
    [string]$CloudinarySecret,
    
    [Parameter(Mandatory=$false)]
    [string]$AnthropicKey
)

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   AI MOCK INTERVIEW - DEPLOYMENT AUTOMATION" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if services are already deployed
if (-not $BackendUrl) {
    Write-Host "⚠️  Backend URL not provided" -ForegroundColor Yellow
    Write-Host "   Deploy backend first at: https://render.com/new" -ForegroundColor Gray
    Write-Host "   Then run: .\deploy-cli.ps1 -BackendUrl <url>" -ForegroundColor Gray
    Write-Host ""
}

if (-not $AiServiceUrl) {
    Write-Host "⚠️  AI Service URL not provided" -ForegroundColor Yellow
    Write-Host "   Deploy AI service first at: https://render.com/new" -ForegroundColor Gray
    Write-Host ""
}

# Test services if URLs provided
if ($BackendUrl) {
    Write-Host "Testing Backend Health..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$BackendUrl/api/v1/health" -Method Get -TimeoutSec 10
        Write-Host "✅ Backend: $($response.status)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Backend: Not responding" -ForegroundColor Red
    }
    Write-Host ""
}

if ($AiServiceUrl) {
    Write-Host "Testing AI Service Health..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$AiServiceUrl/health" -Method Get -TimeoutSec 10
        Write-Host "✅ AI Service: $($response.status)" -ForegroundColor Green
    } catch {
        Write-Host "❌ AI Service: Not responding" -ForegroundColor Red
    }
    Write-Host ""
}

# Check for Vercel CLI
Write-Host "Checking for Vercel CLI..." -ForegroundColor Cyan
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
    
    if ($BackendUrl) {
        Write-Host ""
        Write-Host "Deploying Frontend to Vercel..." -ForegroundColor Cyan
        Write-Host "--------------------------------" -ForegroundColor Gray
        
        Set-Location frontend
        
        # Set environment variables
        $env:NEXT_PUBLIC_API_URL = $BackendUrl
        $env:NEXT_PUBLIC_ENV = "production"
        
        Write-Host "Setting environment variables:" -ForegroundColor Gray
        Write-Host "  NEXT_PUBLIC_API_URL=$BackendUrl" -ForegroundColor Gray
        Write-Host "  NEXT_PUBLIC_ENV=production" -ForegroundColor Gray
        Write-Host ""
        
        # Deploy to Vercel
        Write-Host "Running: vercel --prod" -ForegroundColor Gray
        vercel --prod --yes
        
        Set-Location ..
        
        Write-Host ""
        Write-Host "✅ Frontend deployed to Vercel!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Update backend CORS_ORIGIN with your Vercel URL" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "⚠️  Cannot deploy frontend without backend URL" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Vercel CLI not installed" -ForegroundColor Yellow
    Write-Host "   Install: npm i -g vercel" -ForegroundColor Gray
    Write-Host "   Or deploy manually: https://vercel.com/new" -ForegroundColor Gray
    Write-Host ""
}

# Generate JWT Secret if needed
Write-Host "Generating JWT Secret..." -ForegroundColor Cyan
$jwtSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
Write-Host "✅ JWT_SECRET (copy to Render):" -ForegroundColor Green
Write-Host "   $jwtSecret" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT CHECKLIST" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$checklist = @(
    @{ Task = "PostgreSQL Database"; Status = $(if ($DatabaseUrl) { "✅" } else { "❌" }) },
    @{ Task = "Backend Service"; Status = $(if ($BackendUrl) { "✅" } else { "❌" }) },
    @{ Task = "AI Service"; Status = $(if ($AiServiceUrl) { "✅" } else { "❌" }) },
    @{ Task = "Cloudinary Config"; Status = $(if ($CloudinaryName -and $CloudinaryKey -and $CloudinarySecret) { "✅" } else { "❌" }) },
    @{ Task = "Anthropic API Key"; Status = $(if ($AnthropicKey) { "✅" } else { "❌" }) }
)

foreach ($item in $checklist) {
    Write-Host "$($item.Status) $($item.Task)"
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Ensure all services above are deployed (Render dashboard)" -ForegroundColor Gray
Write-Host "2. Set environment variables in each service" -ForegroundColor Gray
Write-Host "3. Run this script with service URLs to test" -ForegroundColor Gray
Write-Host "4. Deploy frontend manually or with Vercel CLI" -ForegroundColor Gray
Write-Host "5. Test complete flow at your frontend URL" -ForegroundColor Gray
Write-Host ""

Write-Host "For detailed instructions, see: deploy.md" -ForegroundColor Cyan
Write-Host ""
