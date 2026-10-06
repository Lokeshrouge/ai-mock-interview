# Security Architecture

## 1. Overview

Security is a foundational concern for the AI-Powered Mock Interview System, which handles sensitive user data including personal information, resumes, and interview performance records. This document outlines the multi-layered security architecture spanning authentication, authorization, API security, input validation, data protection, and secrets management. The design follows defense-in-depth principles, ensuring that compromise of any single layer does not expose the entire system.

## 2. Authentication Architecture

### 2.1 User Registration Flow

1. **Client Submission**: User submits registration form (email, password, name) from Next.js frontend
2. **Frontend Validation**: Zod schema validates email format, password strength (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
3. **Backend Validation**: NestJS ValidationPipe re-validates via class-validator DTO
4. **Duplicate Check**: Query database for existing user with same email
5. **Password Hashing**: bcrypt with cost factor 12 (2^12 rounds ≈ 250ms on modern CPU)
6. **User Creation**: Store user record with hashed password in PostgreSQL
7. **Response**: Return 201 Created with sanitized user object (no password field)

```typescript
// apps/api/src/modules/auth/auth.service.ts (conceptual)
async register(dto: RegisterDto): Promise<UserResponse> {
  const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
  if (existing) {
    throw new ConflictException('Email already registered');
  }
  
  const hashedPassword = await bcrypt.hash(dto.password, 12);
  
  const user = this.usersRepository.create({
    email: dto.email,
    name: dto.name,
    password: hashedPassword,
    role: Role.STUDENT
  });
  
  await this.usersRepository.save(user);
  
  return this.sanitizeUser(user);
}
```

**Security Considerations**:
- Cost factor 12 balances security (resistant to brute force) with user experience (acceptable latency)
- Email uniqueness enforced at both application and database level (unique constraint)
- Password never logged or included in responses

### 2.2 Login Flow

1. **Credentials Submission**: User provides email and password
2. **User Lookup**: Retrieve user record by email
3. **Password Verification**: bcrypt.compare() checks password against stored hash
4. **Token Generation**: If valid, generate JWT access token and refresh token
5. **Cookie Setting**: Return access token in JSON body, refresh token in httpOnly cookie
6. **Frontend Storage**: Access token stored in memory (Zustand store), not localStorage

```typescript
async login(dto: LoginDto): Promise<AuthResponse> {
  const user = await this.usersRepository.findOne({ 
    where: { email: dto.email } 
  });
  
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  const isPasswordValid = await bcrypt.compare(dto.password, user.password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  const accessToken = this.generateAccessToken(user);
  const refreshToken = this.generateRefreshToken(user);
  
  // Store refresh token hash in database for rotation tracking
  await this.storeRefreshToken(user.id, refreshToken);
  
  return { accessToken, refreshToken };
}
```

**Security Considerations**:
- Generic error message ("Invalid credentials") prevents username enumeration
- Constant-time comparison via bcrypt prevents timing attacks
- Both tokens returned simultaneously to avoid extra round trip

### 2.3 JWT Design

**Access Token**:
```json
{
  "sub": "uuid-user-id",
  "email": "user@example.com",
  "role": "STUDENT",
  "iat": 1705320000,
  "exp": 1705320900
}
```
- Expiration: 15 minutes (900 seconds)
- Signed with HS256 using secret from environment
- Stateless: not stored in database, validated via signature
- Transmitted in Authorization header: `Bearer <token>`

**Refresh Token**:
```json
{
  "sub": "uuid-user-id",
  "tokenId": "uuid-token-id",
  "iat": 1705320000,
  "exp": 1705924800
}
```
- Expiration: 7 days (604800 seconds)
- Stored as httpOnly, Secure, SameSite=Strict cookie
- Hash stored in database for revocation capability
- Used exclusively for obtaining new access tokens

**Token Rotation**:
- When refresh token is used to get new access token, old refresh token is invalidated and new one issued
- Database tracks active refresh tokens per user
- Prevents replay attacks if refresh token is compromised

### 2.4 Token Refresh Flow

1. **Access Token Expiry**: Frontend detects 401 response or expired token
2. **Refresh Request**: POST /auth/refresh with refresh token in cookie
3. **Validation**: Verify refresh token signature and check database for revocation
4. **New Tokens**: Generate new access token and refresh token
5. **Rotation**: Invalidate old refresh token, store new one
6. **Response**: Return new access token in body, new refresh token in cookie

## 3. Authorization Architecture

### 3.1 Role-Based Access Control (RBAC)

Two roles defined:
- **STUDENT**: Can manage own profile, create interviews, view own results
- **ADMIN**: Can view all users, analytics dashboard, system configuration

### 3.2 Implementation

**Roles Decorator**:
```typescript
// apps/api/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

**Roles Guard**:
```typescript
// apps/api/src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // No role requirement, allow
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

**Usage**:
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(Role.ADMIN)
  async getAllUsers() {
    // Only admins can access
  }
}
```

### 3.3 Resource Ownership

Beyond roles, resource ownership is enforced:
- Students can only access their own interviews and results
- Guard checks `user.id === resource.userId`
- Implemented in service layer, not just guard layer (defense in depth)

```typescript
async getInterview(interviewId: string, userId: string): Promise<Interview> {
  const interview = await this.interviewsRepository.findOne({
    where: { id: interviewId }
  });
  
  if (!interview) {
    throw new NotFoundException('Interview not found');
  }
  
  if (interview.userId !== userId) {
    throw new ForbiddenException('Access denied');
  }
  
  return interview;
}
```

## 4. API Security

### 4.1 CORS Configuration

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Security Considerations**:
- Whitelist only the frontend origin, not wildcard (*)
- Credentials: true required for httpOnly cookies
- Prevents cross-origin attacks from malicious sites

### 4.2 Security Headers (Helmet)

```typescript
import helmet from '@fastify/helmet'; // or helmet for Express

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Next.js requires unsafe-inline
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

Headers applied:
- **X-Content-Type-Options**: nosniff (prevent MIME sniffing)
- **X-Frame-Options**: DENY (prevent clickjacking)
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: Force HTTPS
- **Content-Security-Policy**: Restrict resource loading

### 4.3 Rate Limiting

```typescript
// apps/api/src/main.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Module configuration
ThrottlerModule.forRoot({
  ttl: 60, // Time window in seconds
  limit: 100, // Max requests per ttl per IP
}),

// Global guard
app.useGlobalGuards(new ThrottlerGuard());

// Per-endpoint override
@Throttle(5, 60) // 5 requests per 60 seconds
@Post('auth/login')
async login() { }
```

**Rate Limits**:
- Global: 100 requests/minute/IP
- Login: 5 attempts/minute/IP (brute force protection)
- Register: 3 attempts/minute/IP
- AI endpoints: 10 requests/minute/user (prevent abuse)

### 4.4 Input Validation

**Backend DTOs**:
```typescript
// apps/api/src/modules/interviews/dto/create-interview.dto.ts
import { IsString, IsEnum, MaxLength, MinLength } from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  jobTitle: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  jobDescription: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;
}
```

**Global Validation Pipe**:
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip properties not in DTO
  forbidNonWhitelisted: true, // Throw error if extra properties
  transform: true,            // Auto-transform to DTO class
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
```

**Frontend Validation (Zod)**:
```typescript
// apps/web/lib/schemas/interview.schema.ts
import { z } from 'zod';

export const createInterviewSchema = z.object({
  jobTitle: z.string().min(5).max(200),
  jobDescription: z.string().min(20).max(5000),
  difficulty: z.enum(['junior', 'mid', 'senior']),
});
```

**Defense in Depth**: Validation at both layers prevents malicious client bypass and provides immediate UX feedback.

## 5. File Upload Security

Resume upload is the primary file upload surface:

### 5.1 Validation Chain

1. **Size Check**: Max 5MB enforced at Multer middleware
2. **MIME Type Check**: Validate Content-Type header (application/pdf, application/msword, etc.)
3. **Magic Number Verification**: Read first bytes to confirm file type matches extension
4. **Filename Sanitization**: Remove path traversal characters (../, ./), generate UUID filename
5. **Storage**: Save to dedicated upload directory outside webroot
6. **Virus Scan Placeholder**: Integration point for ClamAV scanning (future enhancement)

```typescript
// apps/api/src/common/utils/file-validator.ts
import { BadRequestException } from '@nestjs/common';
import * as fileType from 'file-type';

export async function validateUploadedFile(file: Express.Multer.File): Promise<void> {
  // Check size
  if (file.size > 5 * 1024 * 1024) {
    throw new BadRequestException('File size exceeds 5MB');
  }
  
  // Check MIME type
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestException('Invalid file type');
  }
  
  // Verify magic number
  const type = await fileType.fromBuffer(file.buffer);
  if (!type || !allowedMimeTypes.includes(type.mime)) {
    throw new BadRequestException('File content does not match extension');
  }
}
```

### 5.2 Serving Uploaded Files

- Files served via authenticated endpoint, not static directory
- Access control checks userId before serving
- Content-Disposition: attachment header forces download, not inline rendering

## 6. SQL Injection Prevention

### 6.1 TypeORM Parameterized Queries

**Safe**:
```typescript
// Parameterized query
const user = await this.usersRepository.findOne({
  where: { email: userEmail }
});

// Query builder with parameters
const interviews = await this.interviewsRepository
  .createQueryBuilder('interview')
  .where('interview.userId = :userId', { userId })
  .andWhere('interview.status = :status', { status: 'COMPLETED' })
  .getMany();
```

**Unsafe (FORBIDDEN)**:
```typescript
// Raw query with string concatenation - NEVER DO THIS
const user = await this.connection.query(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

### 6.2 Code Review Checklist

- All database queries use repository methods or query builder with parameters
- No raw SQL strings with template literals or concatenation
- ESLint rule to flag query() method usage

## 7. Secrets Management

### 7.1 Environment Variables

All secrets stored in `.env` file (not committed):

```env
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_interview
JWT_SECRET=<256-bit-random-string>
JWT_REFRESH_SECRET=<256-bit-random-string>
OPENAI_API_KEY=sk-...
```

`.env.example` provided with placeholders:

```env
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/ai_interview
JWT_SECRET=generate-random-string-here
JWT_REFRESH_SECRET=generate-random-string-here
OPENAI_API_KEY=your-openai-api-key
```

### 7.2 Secret Generation

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 7.3 Access Control

- `.env` in `.gitignore`
- Production secrets stored in secure vault (AWS Secrets Manager, HashiCorp Vault)
- Environment variables injected at runtime, never hardcoded
- Secret rotation procedure documented for production

## 8. Data Protection

### 8.1 Data Classification

- **Public**: Job titles, question categories
- **Internal**: Interview scores, session metadata
- **Confidential**: User emails, names, resumes
- **Restricted**: Passwords (hashed), authentication tokens

### 8.2 Encryption at Rest

**Resume Content**: Encrypted using PostgreSQL pgcrypto extension:

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted column
CREATE TABLE resumes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content BYTEA NOT NULL, -- Encrypted content
  created_at TIMESTAMP DEFAULT NOW()
);

-- Encrypt on insert
INSERT INTO resumes (id, user_id, content) 
VALUES (
  uuid_generate_v4(),
  'user-uuid',
  pgp_sym_encrypt('resume text content', 'encryption-key-from-env')
);

-- Decrypt on select
SELECT 
  id, 
  user_id, 
  pgp_sym_decrypt(content, 'encryption-key-from-env') AS decrypted_content
FROM resumes;
```

**Alternative**: Application-level encryption using Node.js crypto module before saving to database.

### 8.3 Encryption in Transit

- All HTTP traffic over TLS 1.3
- HSTS header forces HTTPS
- Database connections use SSL (`?sslmode=require` in connection string)
- Internal service communication (NestJS ↔ AI Service) over encrypted Docker network or VPN

### 8.4 PII Fields

Fields containing personally identifiable information:
- `users.email`
- `users.name`
- `resumes.content`
- `interviews.job_description` (may contain company info)

These fields subject to GDPR/data protection regulations; user deletion must cascade to all PII fields.

## 9. AI Service Isolation

### 9.1 Network Architecture

```
Internet
  │
  └─> Next.js Frontend (Public)
       │
       └─> NestJS API (Public, with auth)
            │
            └─> AI Service (Private, no public access)
                 │
                 └─> OpenAI API (External)
```

### 9.2 Isolation Mechanisms

- **Docker Compose**: AI service on internal network, not exposed via ports
- **Production**: AI service in private subnet, security group rules block external traffic
- **Service Mesh (future)**: Istio/Linkerd for mTLS between services

### 9.3 Trust Model

- AI service trusts all requests from NestJS backend
- No authentication on AI service endpoints
- Input validation via Pydantic models
- NestJS responsible for authentication and authorization before calling AI service

## 10. Security Checklist

| Control | Implementation | Status in MVP |
|---------|----------------|---------------|
| Password hashing | bcrypt cost 12 | ✅ Complete |
| JWT access token | 15min expiry, HS256 | ✅ Complete |
| JWT refresh token | httpOnly cookie, 7d, rotation | ✅ Complete |
| RBAC | Student/Admin roles | ✅ Complete |
| Resource ownership | UserId checks | ✅ Complete |
| CORS | Whitelist frontend origin | ✅ Complete |
| Security headers | Helmet middleware | ✅ Complete |
| Rate limiting | Global + per-endpoint | ✅ Complete |
| Input validation | DTO + Zod dual-layer | ✅ Complete |
| File upload validation | Size, MIME, magic number | ✅ Complete |
| SQL injection prevention | TypeORM parameterized | ✅ Complete |
| Secrets management | .env + vault for prod | ✅ Complete |
| Encryption at rest | Resume content via pgcrypto | 🟨 Optional MVP |
| Encryption in transit | TLS 1.3, SSL DB connections | ✅ Complete |
| Virus scanning | ClamAV integration point | 🟦 Post-MVP |
| API audit logging | Log all auth events | 🟦 Post-MVP |
| 2FA | TOTP second factor | 🟦 Post-MVP |
| Session management | Active sessions view + revocation | 🟦 Post-MVP |

**Legend**:
- ✅ Complete in MVP
- 🟨 Optional for MVP, recommended
- 🟦 Post-MVP enhancement

## 11. Conclusion

The security architecture implements industry-standard practices for authentication, authorization, and data protection. The layered approach ensures that no single point of failure compromises the system. Regular security audits, dependency updates, and penetration testing should be conducted post-launch to maintain security posture as the system evolves.
