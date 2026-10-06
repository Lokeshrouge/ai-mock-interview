# Error Handling Strategy

## 1. Overview

Robust error handling is essential for system reliability, debuggability, and user experience. The AI-Powered Mock Interview System implements a comprehensive error handling strategy spanning the full stack: backend API, AI service, and frontend. The core principles are **fail fast** (detect errors immediately), **surface clearly** (provide actionable information), and **recover gracefully** (degrade functionality rather than crashing).

## 2. Error Handling Principles

### 2.1 Fail Fast

Detect errors at the earliest possible point:
- Validate input immediately upon receipt (DTO validation)
- Check preconditions before expensive operations (database queries before LLM calls)
- Use TypeScript strict mode to catch type errors at compile time
- Throw specific exceptions rather than returning error codes

### 2.2 Surface Clearly

Provide context for debugging and user feedback:
- Include correlation IDs in all error responses
- Log error stack traces server-side, never expose to client
- Return structured error objects with consistent shape
- Differentiate client errors (4xx) from server errors (5xx)

### 2.3 Recover Gracefully

Handle errors without catastrophic failure:
- Retry transient failures (network timeouts, rate limits)
- Provide fallback responses when AI service is degraded
- Preserve user work (interview answers) even if submission fails
- Display error boundaries in React to catch render errors

## 3. Standard Error Response Format

All API errors return a consistent JSON structure:

```typescript
interface ErrorResponse {
  statusCode: number;      // HTTP status code
  message: string;         // User-friendly error message
  error: string;           // Error type/category
  timestamp: string;       // ISO 8601 timestamp
  path: string;            // Request path that triggered error
  requestId?: string;      // Correlation ID for tracing
  details?: any;           // Additional context (validation errors, etc.)
}
```

### 3.1 Example Error Responses

**Validation Error (400)**:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "path": "/api/interviews",
  "requestId": "abc-123-def",
  "details": [
    {
      "field": "jobTitle",
      "message": "jobTitle must be longer than or equal to 5 characters"
    }
  ]
}
```

**Unauthenticated (401)**:
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "path": "/api/interviews",
  "requestId": "abc-123-def"
}
```

**Not Found (404)**:
```json
{
  "statusCode": 404,
  "message": "Interview with ID xyz not found",
  "error": "Not Found",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "path": "/api/interviews/xyz",
  "requestId": "abc-123-def"
}
```

**Internal Server Error (500)**:
```json
{
  "statusCode": 500,
  "message": "An unexpected error occurred. Please try again later.",
  "error": "Internal Server Error",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "path": "/api/interviews",
  "requestId": "abc-123-def"
}
```

## 4. NestJS Backend Error Handling

### 4.1 Global Exception Filter

Catches all exceptions and transforms them into standardized responses:

```typescript
// apps/api/src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let error = 'Internal Server Error';

    // Handle known exception types
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      error = 'Not Found';
    }

    // Log error details server-side
    const errorLog = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'],
      error: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= 500) {
      this.logger.error('Server error', errorLog);
    } else if (status >= 400) {
      this.logger.warn('Client error', errorLog);
    }

    // Send sanitized response to client
    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: errorLog.timestamp,
      path: request.url,
      requestId: request.headers['x-request-id'],
    });
  }
}
```

**Registration**:
```typescript
// apps/api/src/main.ts
app.useGlobalFilters(new GlobalExceptionFilter());
```

### 4.2 Custom Exception Classes

```typescript
// apps/api/src/common/exceptions/ai-service.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class AIServiceUnavailableException extends HttpException {
  constructor(message = 'AI service is temporarily unavailable') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class AIServiceTimeoutException extends HttpException {
  constructor(message = 'AI service request timed out') {
    super(message, HttpStatus.GATEWAY_TIMEOUT);
  }
}

export class AIServiceBadResponseException extends HttpException {
  constructor(message = 'AI service returned invalid response') {
    super(message, HttpStatus.BAD_GATEWAY);
  }
}
```

## 5. Error Categories and HTTP Status Codes

| Status Code | Category | Use Cases | Example |
|-------------|----------|-----------|---------|
| 400 | Bad Request | Invalid input, validation failure | Missing required field, invalid email format |
| 401 | Unauthorized | Authentication failure | Invalid token, expired token, missing token |
| 403 | Forbidden | Authorization failure | User trying to access another user's interview |
| 404 | Not Found | Resource doesn't exist | Interview ID not in database |
| 409 | Conflict | Resource already exists | Email already registered |
| 422 | Unprocessable Entity | Semantic error, AI returned invalid data | LLM response doesn't match expected schema |
| 429 | Too Many Requests | Rate limit exceeded | More than 5 login attempts per minute |
| 500 | Internal Server Error | Unexpected backend error | Uncaught exception, database connection failure |
| 502 | Bad Gateway | Upstream service error | AI service returned malformed response |
| 503 | Service Unavailable | Temporary service degradation | AI service unreachable, database down |
| 504 | Gateway Timeout | Upstream timeout | LLM API took longer than 60 seconds |

## 6. AI Service Error Handling

### 6.1 LLM API Errors

The AI service must handle various failure modes when calling the LLM API:

```python
# apps/ai-service/services/llm_service.py
import httpx
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class LLMService:
    async def generate_completion(self, prompt: str) -> str:
        try:
            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": self.temperature,
                    "max_tokens": self.max_tokens,
                },
                timeout=60.0
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
            
        except httpx.TimeoutException as e:
            logger.error(f"LLM request timeout: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="AI service request timed out. Please try again."
            )
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                logger.warning("LLM rate limit exceeded")
                raise HTTPException(
                    status_code=429,
                    detail="AI service is currently busy. Please try again in a moment.",
                    headers={"Retry-After": "60"}
                )
            elif e.response.status_code >= 500:
                logger.error(f"LLM API server error: {e.response.status_code}")
                raise HTTPException(
                    status_code=503,
                    detail="AI service is temporarily unavailable"
                )
            else:
                logger.error(f"LLM API client error: {e.response.status_code}")
                raise HTTPException(
                    status_code=502,
                    detail="AI service returned an error"
                )
                
        except Exception as e:
            logger.exception("Unexpected error calling LLM")
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred"
            )
```

### 6.2 Response Parsing Errors

When the LLM returns data that doesn't match the expected schema:

```python
# apps/ai-service/services/parser_service.py
import json
from pydantic import ValidationError
from fastapi import HTTPException

class ParserService:
    def parse_questions_response(self, llm_response: str, retry_count: int = 0):
        try:
            data = json.loads(llm_response)
            questions = [Question(**q) for q in data.get("questions", [])]
            
            if not questions:
                raise ValueError("No questions in response")
                
            return questions
            
        except (json.JSONDecodeError, ValidationError, ValueError) as e:
            logger.warning(f"Failed to parse LLM response: {str(e)}")
            
            # Retry once with more explicit prompt
            if retry_count == 0:
                logger.info("Retrying with clarified prompt")
                return self._retry_with_fallback()
            
            # After retry, return error
            raise HTTPException(
                status_code=422,
                detail="AI service returned invalid data. Please try again."
            )
```

### 6.3 NestJS Backend Handling AI Service Errors

```typescript
// apps/api/src/modules/ai/ai.service.ts
import { HttpService } from '@nestjs/axios';
import { 
  AIServiceUnavailableException,
  AIServiceTimeoutException,
  AIServiceBadResponseException 
} from '../../common/exceptions';

export class AIService {
  async generateQuestions(dto: GenerateQuestionsDto): Promise<Question[]> {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.aiServiceUrl}/generate-questions`,
        dto,
        { timeout: 65000 } // Slightly longer than AI service timeout
      );
      
      return response.data.questions;
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        this.logger.error('AI service connection refused');
        throw new AIServiceUnavailableException();
      }
      
      if (error.code === 'ETIMEDOUT') {
        this.logger.error('AI service timeout');
        throw new AIServiceTimeoutException();
      }
      
      if (error.response?.status === 503) {
        this.logger.warn('AI service unavailable');
        throw new AIServiceUnavailableException();
      }
      
      if (error.response?.status === 422) {
        this.logger.warn('AI service returned invalid data');
        throw new AIServiceBadResponseException();
      }
      
      this.logger.error('Unexpected AI service error', error);
      throw new InternalServerErrorException('Failed to generate questions');
    }
  }
}
```

## 7. Frontend Error Handling

### 7.1 React Query Error Handling

```typescript
// apps/web/hooks/use-create-interview.ts
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createInterview } from '@/lib/api/interviews';

export function useCreateInterview() {
  return useMutation({
    mutationFn: createInterview,
    onSuccess: (data) => {
      toast.success('Interview created successfully');
      router.push(`/interviews/${data.id}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create interview';
      const statusCode = error.response?.status;
      
      if (statusCode === 401) {
        toast.error('Your session has expired. Please log in again.');
        router.push('/login');
      } else if (statusCode === 503) {
        toast.error('AI service is temporarily unavailable. Please try again later.');
      } else if (statusCode >= 500) {
        toast.error('A server error occurred. Please try again.');
      } else {
        toast.error(message);
      }
      
      // Log error with correlation ID for support
      console.error('Interview creation failed', {
        requestId: error.response?.data?.requestId,
        statusCode,
        message,
      });
    },
  });
}
```

### 7.2 Error Boundary for Interview Session

Preserves user's answers even if React component crashes:

```typescript
// apps/web/components/interview/interview-error-boundary.tsx
import React, { Component, ReactNode } from 'react';
import { useInterviewStore } from '@/store/interview-store';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class InterviewErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Interview session error:', error, errorInfo);
    
    // Persist answers to localStorage as backup
    const store = useInterviewStore.getState();
    localStorage.setItem('interview-backup', JSON.stringify({
      interviewId: store.currentInterviewId,
      answers: store.answers,
      timestamp: new Date().toISOString(),
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4">
            Don't worry, your answers have been saved. Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 7.3 Form Validation Errors

Display field-level validation errors:

```typescript
// apps/web/components/forms/create-interview-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInterviewSchema } from '@/lib/schemas/interview.schema';

export function CreateInterviewForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createInterviewSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Job Title</label>
        <input {...register('jobTitle')} />
        {errors.jobTitle && (
          <p className="text-red-500 text-sm mt-1">
            {errors.jobTitle.message}
          </p>
        )}
      </div>
      {/* ... */}
    </form>
  );
}
```

## 8. Logging Strategy

### 8.1 Log Levels

- **ERROR**: 5xx errors, uncaught exceptions, critical failures
- **WARN**: 4xx errors on sensitive endpoints (auth), retries, degraded state
- **INFO**: State transitions (interview created, session completed), successful auth
- **DEBUG**: Detailed request/response data, internal state changes (dev only)

### 8.2 Structured Logging (NestJS)

```typescript
// apps/api/src/main.ts
import { Logger } from 'nestjs-pino';

app.useLogger(app.get(Logger));

// apps/api/src/modules/interviews/interviews.service.ts
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  async createInterview(userId: string, dto: CreateInterviewDto) {
    this.logger.log({
      msg: 'Creating interview',
      userId,
      jobTitle: dto.jobTitle,
      difficulty: dto.difficulty,
    });

    try {
      const interview = await this.repository.save({...});
      
      this.logger.log({
        msg: 'Interview created',
        interviewId: interview.id,
        userId,
      });
      
      return interview;
      
    } catch (error) {
      this.logger.error({
        msg: 'Failed to create interview',
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
```

### 8.3 Python Structured Logging

```python
# apps/ai-service/main.py
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger()
handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter(
    '%(asctime)s %(name)s %(levelname)s %(message)s'
)
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

## 9. Correlation IDs

### 9.1 Request ID Generation

```typescript
// apps/api/src/common/middleware/request-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  }
}
```

### 9.2 Propagation to AI Service

```typescript
async generateQuestions(dto: GenerateQuestionsDto, requestId: string) {
  const response = await this.httpService.axiosRef.post(
    `${this.aiServiceUrl}/generate-questions`,
    dto,
    {
      headers: {
        'X-Request-ID': requestId,
      },
    }
  );
}
```

### 9.3 Logging with Correlation

All log entries include the request ID, enabling trace of a single request across services:

```
{"time":"2024-01-15T14:30:00.000Z","level":"INFO","msg":"Interview created","requestId":"abc-123-def","userId":"user-456"}
{"time":"2024-01-15T14:30:01.000Z","level":"INFO","msg":"Calling AI service","requestId":"abc-123-def","endpoint":"/generate-questions"}
{"time":"2024-01-15T14:30:05.000Z","level":"INFO","msg":"LLM completion generated","requestId":"abc-123-def","model":"gpt-4","tokens":550}
```

## 10. User-Facing Error Messages

**Guidelines**:
- Never expose stack traces, database errors, or internal implementation details
- Provide actionable guidance ("Please try again" vs. "Database connection pool exhausted")
- Include correlation ID for support requests
- Use friendly language, avoid technical jargon

**Examples**:

| Internal Error | User-Facing Message |
|----------------|---------------------|
| `EntityNotFoundError: Interview not found` | "The interview you're looking for doesn't exist or has been deleted." |
| `TypeError: Cannot read property 'id' of undefined` | "An unexpected error occurred. Please try again. (Request ID: abc-123)" |
| `ECONNREFUSED to AI service` | "AI service is temporarily unavailable. Please try again in a few minutes." |
| `bcrypt compare failed` | "Invalid email or password." |
| `JWT expired` | "Your session has expired. Please log in again." |

## 11. Conclusion

The error handling strategy ensures that failures are caught early, logged comprehensively for debugging, and communicated clearly to users. By standardizing error responses, implementing retry logic, and preserving user data even during crashes, the system maintains a high-quality user experience even when things go wrong. Correlation IDs enable efficient troubleshooting across the distributed architecture, while structured logging provides the observability needed for production operations.
