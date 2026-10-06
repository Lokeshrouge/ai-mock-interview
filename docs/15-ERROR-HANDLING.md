# Error Handling Strategy

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## HTTP Status Codes
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request (validation)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 413: Payload Too Large
- 429: Too Many Requests
- 500: Internal Server Error
- 503: Service Unavailable

## Error Categories

### 1. Validation Errors (400)
- Invalid input format
- Missing required fields
- Field constraints violated
**Handling**: Return specific field errors

### 2. Authentication Errors (401)
- Invalid credentials
- Token expired
- Token missing
**Handling**: Clear auth state, redirect to login

### 3. Authorization Errors (403)
- Insufficient permissions
- Resource access denied
**Handling**: Show access denied message

### 4. Not Found Errors (404)
- Resource doesn't exist
- Invalid ID
**Handling**: Show not found page

### 5. AI Service Errors
- Service timeout
- Service unavailable
- Invalid response
**Handling**: Retry with exponential backoff, show user-friendly message

### 6. File Upload Errors
- File too large (413)
- Invalid file type (400)
- Upload failed (500)
**Handling**: Show specific error, allow retry

### 7. Database Errors (500)
- Connection failed
- Query failed
- Constraint violation
**Handling**: Log error, show generic message to user

## Frontend Error Handling

### Error Boundaries
- Catch React errors
- Show fallback UI
- Log to monitoring service

### API Error Handling
```typescript
try {
  const response = await api.submitAnswer(data);
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 400) {
    // Show validation errors
  } else {
    // Show generic error
  }
}
```

### Toast Notifications
- Success: Green toast
- Error: Red toast
- Warning: Yellow toast
- Info: Blue toast

## Backend Error Handling

### Global Exception Filter
```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;
    
    response.status(status).json({
      success: false,
      error: {
        code: this.getErrorCode(exception),
        message: this.getUserMessage(exception),
        details: this.getDetails(exception)
      }
    });
    
    // Log error
    this.logger.error(exception);
  }
}
```

### Service-Level Error Handling
```typescript
async submitAnswer(answerId: string, text: string) {
  try {
    const evaluation = await this.aiService.evaluate(text);
    return evaluation;
  } catch (error) {
    if (error.code === 'TIMEOUT') {
      throw new ServiceUnavailableException('AI service timeout');
    }
    throw new InternalServerErrorException('Evaluation failed');
  }
}
```

## AI Service Error Handling

### Retry Logic
```python
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def call_llm(prompt: str):
    return await llm_client.complete(prompt)
```

### Timeout Handling
```python
try:
    result = await asyncio.wait_for(call_llm(prompt), timeout=30)
except asyncio.TimeoutError:
    raise AIServiceException("LLM timeout")
```

### Fallback Responses
```python
def get_fallback_evaluation():
    return {
        "score": 50,
        "feedback": "Evaluation unavailable. Please try again.",
        "strengths": [],
        "weaknesses": []
    }
```

## Error Logging

### Backend Logging
```typescript
logger.error('Interview creation failed', {
  userId: user.id,
  error: error.message,
  stack: error.stack
});
```

### AI Service Logging
```python
logger.error(f"Question generation failed: {str(e)}", exc_info=True)
```

### Frontend Logging
```typescript
console.error('API call failed:', {
  endpoint: '/interviews',
  error: error.message,
  userId: user.id
});
```

## Monitoring & Alerts

### Metrics to Track
- Error rate by endpoint
- 5xx error count
- AI service failure rate
- Failed authentication attempts

### Alerts
- Alert if error rate > 5%
- Alert if AI service down
- Alert if database connection lost
- Alert on repeated authentication failures (potential attack)

## User-Friendly Messages

### Do
✅ "Please upload a PDF or DOCX file"  
✅ "Your session has expired. Please log in again"  
✅ "Interview saved. You can resume anytime"

### Don't
❌ "Error 500: Internal server error"  
❌ "Database connection failed"  
❌ "Uncaught exception in QuestionService"

## Error Recovery

### Interview State
- Save progress before errors
- Allow resume after error
- Don't lose student's work

### File Upload
- Allow immediate retry
- Keep form data on error
- Show upload progress

### API Calls
- Retry transient errors automatically
- Show retry button for user-initiated retry
- Cache successful responses
