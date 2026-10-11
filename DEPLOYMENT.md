# 🚀 AI Mock Interview System - Deployment Guide

This guide covers both development and production deployment options for the AI Mock Interview System.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.0+ (LTS recommended)
- **Python**: 3.8+
- **Docker**: 24.0+ (for production deployment)
- **Docker Compose**: 2.0+
- **Git**: Latest version

### Development Tools (Optional)
- **PowerShell**: 7.0+ (Windows users)
- **VS Code**: Latest (recommended IDE)
- **Postman**: API testing (optional)

## 🛠️ Development Deployment

### Option 1: Automated PowerShell Script (Recommended)

The enhanced startup script handles all services and provides comprehensive monitoring:

```powershell
# Clone and setup
git clone <repository-url>
cd ai-mock-interview

# Start all services (installs dependencies automatically)
.\start-all.ps1

# Open http://localhost:3000 when ready
```

**What the script does:**
- ✅ Checks Node.js and Python prerequisites
- ✅ Installs dependencies for all services
- ✅ Starts each service in a separate PowerShell window
- ✅ Provides health checks and status monitoring
- ✅ Handles ENOWORKSPACES warnings gracefully
- ✅ Opens browser automatically

### Option 2: Manual Service Startup

If you prefer manual control or the script doesn't work:

```powershell
# Terminal 1: Backend (NestJS)
cd backend
npm ci
npm run start:dev
# Available at: http://localhost:3001

# Terminal 2: AI Service (FastAPI)  
cd ai-service
pip install -r requirements.txt
python test_server.py
# Available at: http://localhost:8000

# Terminal 3: Frontend (Next.js)
cd frontend
npm ci  
npm run dev
# Available at: http://localhost:3000
```

### Development URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Main App** | http://localhost:3000 | Frontend application |
| **API** | http://localhost:3001/api/v1 | Backend REST API |
| **Health Check** | http://localhost:3001/api/v1/health | System status |
| **AI Service** | http://localhost:8000 | AI endpoints |
| **AI Docs** | http://localhost:8000/docs | Interactive API docs |

## 🎯 Production Deployment (Single URL)

### Architecture Overview

The production deployment uses nginx as a reverse proxy to serve everything through a single URL:

```
Internet → nginx (Port 80) → {
    /       → Frontend Container
    /api/*  → Backend Container  
    AI Service → Internal only (backend calls it)
}
```

### Step 1: Environment Configuration

Create production environment file:

```bash
# Copy template
cp .env.production.example .env.production

# Edit with your values
# IMPORTANT: Change JWT_SECRET in production!
```

**Required Environment Variables:**

```bash
# Security (CHANGE IN PRODUCTION!)
JWT_SECRET=your_super_secure_jwt_secret_here_min_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Application URLs  
NEXT_PUBLIC_API_URL=http://your-domain.com
CORS_ORIGIN=http://your-domain.com

# AI Configuration (optional - uses mock by default)
AI_PROVIDER=mock
# OPENAI_API_KEY=your_openai_key_here
# ANTHROPIC_API_KEY=your_anthropic_key_here
```

### Step 2: Docker Production Deployment

#### Option A: Automated Deployment Script

```powershell
# Build and deploy everything
.\deploy.ps1 -Environment prod

# With custom options
.\deploy.ps1 -Environment prod -Clean -SkipBuild

# The system will be available at: http://localhost
```

#### Option B: Manual Docker Deployment

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Step 3: Production Verification

#### Health Checks

```bash
# Main application
curl http://localhost/health
# Should return: "healthy"

# Backend API
curl http://localhost/api/v1/health
# Should return: {"status":"ok","database":"connected"}

# Check all containers
docker-compose -f docker-compose.prod.yml ps
# All services should show "Up" and "healthy"
```

#### Service Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# Individual service logs
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f ai-service
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## 🌐 Custom Domain Deployment

### For Actual Production Domain

1. **Update Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

2. **SSL Configuration (nginx.conf):**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/your/certificate.pem;
    ssl_certificate_key /path/to/your/private.key;
    
    # Rest of configuration...
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

3. **Update Docker Compose:**
```yaml
nginx:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - /path/to/ssl:/etc/ssl/certs:ro
```

## 🔧 Configuration Options

### Database Configuration

**Development (SQLite - Default):**
```bash
DATABASE_URL=file:/app/data/mock_interview.db
```

**Production (PostgreSQL):**
```bash
DATABASE_URL=postgresql://user:password@postgres:5432/mock_interview
```

### AI Service Configuration

**Mock AI (Development/Demo):**
```bash
AI_PROVIDER=mock
```

**OpenAI Integration:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key-here
MODEL_NAME=gpt-4-turbo
```

**Anthropic Integration:**
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
MODEL_NAME=claude-3-sonnet
```

### Performance Tuning

**Frontend Optimization:**
```dockerfile
# In frontend/Dockerfile
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV GENERATE_SOURCEMAP=false
```

**Backend Scaling:**
```yaml
# In docker-compose.prod.yml
backend:
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
```

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
netstat -tulpn | grep :8000

# Kill processes on ports  
npx kill-port 3000 3001 8000
```

#### Docker Issues
```bash
# Clean Docker system
docker system prune -a -f

# Rebuild without cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Check container logs
docker logs mock_interview_nginx
docker logs mock_interview_backend
```

#### Database Issues
```bash
# Reset SQLite database (CAUTION: Deletes all data)
rm backend/mock_interview.db

# View database contents (requires sqlite3)
sqlite3 backend/mock_interview.db ".tables"
sqlite3 backend/mock_interview.db "SELECT * FROM users LIMIT 5;"
```

#### ENOWORKSPACES Warnings
```
npm WARN config This command does not support workspaces
```
**Solution**: This is cosmetic only. Services work correctly. Run commands from individual service directories to avoid warnings.

### Performance Issues

#### Slow Build Times
```bash
# Use npm ci instead of npm install
npm ci --only=production

# Enable Docker BuildKit
export DOCKER_BUILDKIT=1
docker-compose build --parallel
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=4096"

# Monitor Docker memory usage
docker stats
```

## 📊 Monitoring & Maintenance

### Health Monitoring

Create a simple monitoring script:

```powershell
# monitor.ps1
while ($true) {
    try {
        $health = Invoke-RestMethod "http://localhost/health" -TimeoutSec 5
        Write-Host "$(Get-Date): System healthy" -ForegroundColor Green
    } catch {
        Write-Host "$(Get-Date): System unhealthy" -ForegroundColor Red
    }
    Start-Sleep -Seconds 30
}
```

### Backup Strategy

```bash
# Backup SQLite database
cp backend/mock_interview.db "backup_$(date +%Y%m%d_%H%M%S).db"

# Backup uploaded files (if any)
tar -czf uploads_backup.tar.gz uploads/

# Docker volume backup
docker run --rm -v mock_interview_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz /data
```

### Log Rotation

```bash
# Configure Docker log rotation in daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## 🔐 Security Checklist

### Pre-Production Security

- [ ] Change default JWT_SECRET to a strong, unique value
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure proper CORS origins (no wildcards in production)
- [ ] Set secure cookie flags
- [ ] Enable rate limiting on API endpoints
- [ ] Validate all environment variables are set
- [ ] Remove debug/development endpoints
- [ ] Update all dependencies to latest secure versions

### Network Security

```nginx
# In nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## 📈 Scaling Considerations

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
    
  ai-service:
    deploy:
      replicas: 2
      
  nginx:
    depends_on:
      - backend
    # Load balancing configuration
```

### Database Scaling

For high-traffic production:

1. **Switch to PostgreSQL with connection pooling**
2. **Implement Redis for session storage**
3. **Add read replicas for query optimization**
4. **Consider database sharding for very large scale**

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] Environment variables configured
- [ ] SSL certificates obtained (if using HTTPS)
- [ ] Backup strategy in place
- [ ] Monitoring configured

### Deployment
- [ ] Build all services successfully
- [ ] Deploy to production environment
- [ ] Run health checks
- [ ] Verify all endpoints working
- [ ] Test critical user workflows

### Post-Deployment  
- [ ] Monitor logs for errors
- [ ] Verify performance metrics
- [ ] Test from external networks
- [ ] Confirm SSL/TLS working (if applicable)
- [ ] Document any issues and resolutions

---

## 🆘 Support & Troubleshooting

For deployment issues:

1. **Check service logs**: `docker-compose logs -f [service-name]`
2. **Verify environment variables**: Ensure all required vars are set
3. **Test individual services**: Access each service URL directly
4. **Check Docker resources**: Ensure sufficient CPU/memory allocated
5. **Review nginx configuration**: Verify proxy rules are correct

**Need Help?**
- Check the main README.md for architecture details
- Review individual service documentation
- Check Docker and nginx logs for specific errors
- Verify all prerequisites are installed and up-to-date

---

*Deployment Guide - Last Updated: October 8, 2026*