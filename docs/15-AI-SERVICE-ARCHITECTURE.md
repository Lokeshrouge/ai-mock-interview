# AI Service Detailed Architecture

## 1. Overview

The AI Service is a Python-based FastAPI microservice responsible for all LLM interactions within the AI-Powered Mock Interview System. It provides three core capabilities: generating interview questions based on job descriptions and resumes, evaluating candidate answers, and summarizing interview sessions. The service is designed as an internal-only microservice, called exclusively by the NestJS backend API, with network-level isolation preventing direct public access.

## 2. Technology Stack

- **Framework**: FastAPI 0.104+ for high-performance async API
- **HTTP Client**: httpx for async requests to OpenAI-compatible LLM APIs
- **Validation**: Pydantic v2 for request/response models and settings
- **Templating**: Jinja2 for prompt template management
- **Logging**: Python logging with python-json-logger for structured logs
- **Testing**: pytest with pytest-asyncio for async test support
- **ASGI Server**: Uvicorn for production deployment

## 3. Project Structure

```
apps/ai-service/
├── main.py                 # FastAPI app initialization, lifespan events
├── config.py               # Configuration management via pydantic-settings
├── routers/
│   ├── __init__.py
│   ├── questions_router.py  # POST /generate-questions
│   ├── evaluation_router.py # POST /evaluate-answer
│   └── summary_router.py    # POST /summarise-session
├── services/
│   ├── __init__.py
│   ├── llm_service.py       # LLM API client wrapper
│   ├── prompt_service.py    # Prompt template loader and builder
│   └── parser_service.py    # LLM response validation and parsing
├── models/
│   ├── __init__.py
│   ├── requests.py          # Pydantic request models
│   ├── responses.py         # Pydantic response models
│   └── internal.py          # Internal data structures
├── prompts/
│   ├── generate_questions.j2
│   ├── evaluate_answer.j2
│   └── summarise_session.j2
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   ├── test_routers.py
│   ├── test_services.py
│   └── fixtures/            # Sample LLM responses
├── requirements.txt
└── Dockerfile
```

## 4. Router Layer

### 4.1 Questions Router

**Endpoint**: `POST /generate-questions`

Generates interview questions based on job description, candidate resume, difficulty level, and desired question count.

```python
# routers/questions_router.py
from fastapi import APIRouter, Depends, HTTPException
from models.requests import GenerateQuestionsRequest
from models.responses import GenerateQuestionsResponse
from services.llm_service import LLMService
from services.prompt_service import PromptService
from services.parser_service import ParserService

router = APIRouter(prefix="/generate-questions", tags=["questions"])

@router.post("", response_model=GenerateQuestionsResponse)
async def generate_questions(
    request: GenerateQuestionsRequest,
    llm_service: LLMService = Depends(),
    prompt_service: PromptService = Depends(),
    parser_service: ParserService = Depends()
):
    """Generate interview questions tailored to job description and resume."""
    # Build prompt from template
    prompt = prompt_service.build_questions_prompt(
        job_title=request.job_title,
        job_description=request.job_description,
        resume_content=request.resume_content,
        difficulty=request.difficulty,
        num_questions=request.num_questions
    )
    
    # Call LLM
    llm_response = await llm_service.generate_completion(prompt)
    
    # Parse and validate response
    questions = parser_service.parse_questions_response(llm_response)
    
    return GenerateQuestionsResponse(questions=questions)
```

### 4.2 Evaluation Router

**Endpoint**: `POST /evaluate-answer`

Evaluates a single candidate answer against the original question, providing a score and detailed feedback.

```python
# routers/evaluation_router.py
from fastapi import APIRouter, Depends
from models.requests import EvaluateAnswerRequest
from models.responses import EvaluateAnswerResponse
from services.llm_service import LLMService
from services.prompt_service import PromptService
from services.parser_service import ParserService

router = APIRouter(prefix="/evaluate-answer", tags=["evaluation"])

@router.post("", response_model=EvaluateAnswerResponse)
async def evaluate_answer(
    request: EvaluateAnswerRequest,
    llm_service: LLMService = Depends(),
    prompt_service: PromptService = Depends(),
    parser_service: ParserService = Depends()
):
    """Evaluate a candidate's answer to an interview question."""
    prompt = prompt_service.build_evaluation_prompt(
        question=request.question,
        answer=request.answer,
        job_context=request.job_context
    )
    
    llm_response = await llm_service.generate_completion(prompt)
    evaluation = parser_service.parse_evaluation_response(llm_response)
    
    return evaluation
```

### 4.3 Summary Router

**Endpoint**: `POST /summarise-session`

Generates a comprehensive summary of an entire interview session, including overall performance assessment and improvement recommendations.

```python
# routers/summary_router.py
from fastapi import APIRouter, Depends
from models.requests import SummariseSessionRequest
from models.responses import SummariseSessionResponse
from services.llm_service import LLMService
from services.prompt_service import PromptService
from services.parser_service import ParserService

router = APIRouter(prefix="/summarise-session", tags=["summary"])

@router.post("", response_model=SummariseSessionResponse)
async def summarise_session(
    request: SummariseSessionRequest,
    llm_service: LLMService = Depends(),
    prompt_service: PromptService = Depends(),
    parser_service: ParserService = Depends()
):
    """Generate a comprehensive summary of an interview session."""
    prompt = prompt_service.build_summary_prompt(
        job_title=request.job_title,
        questions_and_answers=request.questions_and_answers,
        evaluations=request.evaluations
    )
    
    llm_response = await llm_service.generate_completion(prompt)
    summary = parser_service.parse_summary_response(llm_response)
    
    return summary
```

## 5. Service Layer

### 5.1 LLMService

Manages async HTTP communication with OpenAI-compatible LLM APIs.

```python
# services/llm_service.py
import httpx
import logging
from typing import Optional
from config import Settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(60.0, connect=10.0),
            limits=httpx.Limits(max_connections=10)
        )
        self.api_key = settings.OPENAI_API_KEY
        self.model_name = settings.MODEL_NAME
        self.max_tokens = settings.MAX_TOKENS
        self.temperature = settings.TEMPERATURE
    
    async def generate_completion(
        self, 
        prompt: str, 
        temperature: Optional[float] = None
    ) -> str:
        """Generate LLM completion for given prompt."""
        try:
            response = await self.client.post(
                f"{self.settings.OPENAI_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": temperature or self.temperature,
                    "max_tokens": self.max_tokens,
                    "response_format": {"type": "json_object"}
                }
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            logger.info(
                "LLM completion generated",
                extra={"model": self.model_name, "tokens": data.get("usage")}
            )
            return content
        except httpx.TimeoutException as e:
            logger.error("LLM request timeout", extra={"error": str(e)})
            raise
        except httpx.HTTPStatusError as e:
            logger.error(
                "LLM API error", 
                extra={"status": e.response.status_code, "body": e.response.text}
            )
            raise
    
    async def close(self):
        """Close HTTP client connection pool."""
        await self.client.aclose()
```

### 5.2 PromptService

Loads Jinja2 templates and builds prompts with context injection.

```python
# services/prompt_service.py
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class PromptService:
    def __init__(self):
        template_dir = Path(__file__).parent.parent / "prompts"
        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(),
            trim_blocks=True,
            lstrip_blocks=True
        )
        logger.info(f"Loaded prompt templates from {template_dir}")
    
    def build_questions_prompt(
        self, 
        job_title: str, 
        job_description: str,
        resume_content: str,
        difficulty: str,
        num_questions: int
    ) -> str:
        """Build prompt for question generation."""
        template = self.env.get_template("generate_questions.j2")
        return template.render(
            job_title=job_title,
            job_description=job_description,
            resume_content=resume_content,
            difficulty=difficulty,
            num_questions=num_questions
        )
    
    def build_evaluation_prompt(
        self, 
        question: str, 
        answer: str,
        job_context: str
    ) -> str:
        """Build prompt for answer evaluation."""
        template = self.env.get_template("evaluate_answer.j2")
        return template.render(
            question=question,
            answer=answer,
            job_context=job_context
        )
    
    def build_summary_prompt(
        self,
        job_title: str,
        questions_and_answers: list,
        evaluations: list
    ) -> str:
        """Build prompt for session summary."""
        template = self.env.get_template("summarise_session.j2")
        return template.render(
            job_title=job_title,
            questions_and_answers=questions_and_answers,
            evaluations=evaluations
        )
```

### 5.3 ParserService

Validates and parses JSON responses from the LLM.

```python
# services/parser_service.py
import json
import logging
from typing import List
from pydantic import ValidationError
from models.responses import (
    Question, 
    EvaluateAnswerResponse, 
    SummariseSessionResponse
)

logger = logging.getLogger(__name__)

class ParserService:
    def parse_questions_response(self, llm_response: str) -> List[Question]:
        """Parse and validate questions from LLM response."""
        try:
            data = json.loads(llm_response)
            questions = [Question(**q) for q in data.get("questions", [])]
            if not questions:
                raise ValueError("No questions in LLM response")
            return questions
        except (json.JSONDecodeError, ValidationError, ValueError) as e:
            logger.error("Failed to parse questions response", extra={"error": str(e)})
            raise ValueError(f"Invalid LLM response format: {str(e)}")
    
    def parse_evaluation_response(self, llm_response: str) -> EvaluateAnswerResponse:
        """Parse and validate evaluation from LLM response."""
        try:
            data = json.loads(llm_response)
            return EvaluateAnswerResponse(**data)
        except (json.JSONDecodeError, ValidationError) as e:
            logger.error("Failed to parse evaluation response", extra={"error": str(e)})
            raise ValueError(f"Invalid LLM response format: {str(e)}")
    
    def parse_summary_response(self, llm_response: str) -> SummariseSessionResponse:
        """Parse and validate summary from LLM response."""
        try:
            data = json.loads(llm_response)
            return SummariseSessionResponse(**data)
        except (json.JSONDecodeError, ValidationError) as e:
            logger.error("Failed to parse summary response", extra={"error": str(e)})
            raise ValueError(f"Invalid LLM response format: {str(e)}")
```

## 6. Pydantic Models

### 6.1 Request Models

```python
# models/requests.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional

class GenerateQuestionsRequest(BaseModel):
    job_title: str = Field(..., min_length=1, max_length=200)
    job_description: str = Field(..., min_length=10, max_length=10000)
    resume_content: str = Field(..., min_length=10, max_length=20000)
    difficulty: str = Field(..., pattern="^(junior|mid|senior)$")
    num_questions: int = Field(default=5, ge=1, le=20)

class EvaluateAnswerRequest(BaseModel):
    question: str = Field(..., min_length=10, max_length=2000)
    answer: str = Field(..., min_length=1, max_length=10000)
    job_context: str = Field(..., min_length=10, max_length=5000)

class QuestionAnswerPair(BaseModel):
    question: str
    answer: str

class SummariseSessionRequest(BaseModel):
    job_title: str = Field(..., min_length=1, max_length=200)
    questions_and_answers: List[QuestionAnswerPair] = Field(..., min_items=1)
    evaluations: List[dict] = Field(..., min_items=1)
```

### 6.2 Response Models

```python
# models/responses.py
from pydantic import BaseModel, Field
from typing import List, Optional

class Question(BaseModel):
    text: str
    category: str
    difficulty: str
    expected_key_points: List[str]

class GenerateQuestionsResponse(BaseModel):
    questions: List[Question]

class EvaluateAnswerResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    feedback: str
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]

class StrengthArea(BaseModel):
    area: str
    description: str

class WeaknessArea(BaseModel):
    area: str
    description: str
    recommendation: str

class SummariseSessionResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    performance_summary: str
    strengths: List[StrengthArea]
    weaknesses: List[WeaknessArea]
    overall_recommendations: List[str]
```

## 7. Configuration Management

```python
# config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # LLM Configuration
    OPENAI_API_KEY: str
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    MODEL_NAME: str = "gpt-4"
    MAX_TOKENS: int = 2000
    TEMPERATURE: float = 0.7
    
    # Service Configuration
    SERVICE_NAME: str = "ai-service"
    LOG_LEVEL: str = "INFO"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8002
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()
```

## 8. Application Initialization

```python
# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
from pythonjsonlogger import jsonlogger

from config import settings
from routers import questions_router, evaluation_router, summary_router
from services.llm_service import LLMService

# Configure structured logging
logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter(
    "%(asctime)s %(name)s %(levelname)s %(message)s"
)
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(settings.LOG_LEVEL)

# Global LLM service instance
llm_service: LLMService = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan: startup and shutdown."""
    global llm_service
    # Startup
    logger.info("Starting AI Service", extra={"model": settings.MODEL_NAME})
    llm_service = LLMService(settings)
    yield
    # Shutdown
    logger.info("Shutting down AI Service")
    if llm_service:
        await llm_service.close()

app = FastAPI(
    title="AI Mock Interview Service",
    version="1.0.0",
    lifespan=lifespan
)

# Register routers
app.include_router(questions_router.router)
app.include_router(evaluation_router.router)
app.include_router(summary_router.router)

@app.get("/health")
async def health_check():
    """Health check endpoint with LLM connectivity test."""
    try:
        # Simple ping to LLM API
        test_response = await llm_service.generate_completion(
            "Respond with OK", 
            temperature=0
        )
        return {
            "status": "healthy",
            "service": settings.SERVICE_NAME,
            "model": settings.MODEL_NAME,
            "llm_connectivity": "ok"
        }
    except Exception as e:
        logger.error("Health check failed", extra={"error": str(e)})
        return {
            "status": "degraded",
            "service": settings.SERVICE_NAME,
            "llm_connectivity": "failed",
            "error": str(e)
        }
```

## 9. Async Architecture

The entire service is built on Python's asyncio event loop:

- **FastAPI async endpoints**: All route handlers are async functions, allowing concurrent request processing without blocking
- **httpx AsyncClient**: Non-blocking HTTP calls to LLM API with connection pooling
- **Async context managers**: Proper resource cleanup via lifespan events
- **Concurrency**: Multiple LLM requests can be in-flight simultaneously, limited by connection pool (max 10 concurrent)

This architecture allows the service to handle multiple interview sessions concurrently without thread overhead, critical for maintaining low latency under load.

## 10. Security Model

The AI Service operates under a **zero-trust internal network** model:

- **No authentication**: Endpoints have no auth middleware; the service trusts that only the NestJS backend can reach it
- **Network isolation**: Deployed in a private subnet or Docker network, no public IP exposure
- **Input validation**: All requests validated via Pydantic models before processing
- **Output sanitization**: Parser service ensures LLM responses conform to expected schemas before returning to backend

The NestJS backend acts as the authentication and authorization gateway, ensuring only legitimate, authenticated user requests reach the AI service.

## 11. Logging Strategy

Structured JSON logging enables effective observability:

```json
{
  "asctime": "2024-01-15T10:30:45.123Z",
  "name": "llm_service",
  "levelname": "INFO",
  "message": "LLM completion generated",
  "model": "gpt-4",
  "tokens": {"prompt": 150, "completion": 400, "total": 550},
  "request_id": "abc-123-def"
}
```

All logs include:
- Timestamp in ISO8601 format
- Logger name (module)
- Log level (DEBUG, INFO, WARNING, ERROR)
- Structured extra fields (model, tokens, errors, duration)
- X-Request-ID header propagated from NestJS backend for correlation

## 12. Prompt Template System

Templates stored in `prompts/` directory are loaded at startup. Example structure:

```jinja2
{# prompts/generate_questions.j2 #}
You are an expert technical interviewer. Generate {{ num_questions }} interview questions for a {{ job_title }} position.

Job Description:
{{ job_description }}

Candidate Resume:
{{ resume_content }}

Difficulty Level: {{ difficulty }}

Requirements:
- Questions should assess relevant technical skills
- Mix of theoretical and practical questions
- Include expected key points for each question

Respond with valid JSON in this format:
{
  "questions": [
    {
      "text": "question text",
      "category": "technical|behavioral|situational",
      "difficulty": "junior|mid|senior",
      "expected_key_points": ["point1", "point2"]
    }
  ]
}
```

This separation of prompts from code enables rapid iteration on prompt engineering without service redeployment.

## 13. Conclusion

The AI Service is architected for reliability, maintainability, and performance. Its async-first design maximizes throughput, structured validation ensures data integrity, and the template-based prompt system enables agile refinement of AI behavior. By operating as a focused internal microservice, it provides a clean separation of concerns within the overall system architecture.
