# Security Architecture

## Authentication

### JWT-Based Authentication
- Access tokens: 15-minute expiration
- Refresh tokens: 7-day expiration
- HttpOnly cookies or Authorization header
- Token payload: userId, email, role

### Password Security
- bcrypt hashing (10 rounds minimum)
- Min 8 characters, complexity requirements
- No plaintext storage
- Password reset via email token

### Account Protection
- Failed login limit: 5 attempts
- Account lockout: 30 minutes
- Email verification (optional for MVP)

## Authorization

### Role-Based Access Control (RBAC)
- Roles: STUDENT, ADMIN
- Guards on all protected routes
- Backend enforcement (never trust frontend)

### Resource Ownership
- Students access only own data
- Interview ownership verification
- Resume ownership verification

## API Security

### Rate Limiting
- Authentication: 5 requests/min per IP
- General APIs: 100 requests/min per user
- File upload: 10 uploads/hour per user

### Input Validation
- class-validator on all DTOs
- File type whitelist (PDF, DOCX)
- File size limit: 5MB
- SQL injection prevention (parameterized queries)
- XSS protection (sanitization)

### CORS
- Allowed origin: Frontend URL only
- Credentials: true
- Methods: GET, POST, PUT, PATCH, DELETE

## Data Security

### Encryption
- At rest: Database encryption
- In transit: TLS/HTTPS only
- API keys in environment variables

### Sensitive Data
- PII handling per GDPR principles
- Resume data access logged
- No unnecessary data collection

### File Security
- Uploaded files not executable
- Virus scanning (recommended)
- Secure storage paths
- Access control on file URLs

## Secret Management
- All secrets in .env files
- Never commit secrets to Git
- Separate secrets per environment
- Secrets rotation capability

## Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security

## Logging & Monitoring
- Authentication events logged
- Admin actions logged
- Failed access attempts tracked
- Audit trail for sensitive operations
