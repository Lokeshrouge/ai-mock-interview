# AI Service Architecture

## Document Information
**Project:** AI-Powered Mock Interview System  
**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** B.Sc. Final Year Project Team

---

## 1. Introduction

This document specifies the architecture of the Python-based AI service that powers intelligent question generation, answer evaluation, and interview session summarization. The service exposes a REST API built with FastAPI and abstracts LLM provider interactions behind a common interface, enabling flexibility in model selection (OpenAI, Anthropic, local models, etc.).

The AI service is the intelligence core of the system, responsible for creating personalized interview experiences and providing actionable feedback to candidates.

---

## 2. Service Role and Responsibilities

### 2.1 Core Responsibilities

**Question Generation**
- Generate contextually relevant interview questions based on:
  - Interview type (HR, Technical, Project-based)
  - Job title and description
  - Required skills and technologies
  - Difficulty level (Beginner, Intermediate, Advanced)
  - Candidate's resume content (when available)

**Answer Evaluation**
- Analyze candidate responses for:
  - Technical accuracy and completeness
  - Communication clarity and structure
  - Depth of understanding
  - Relevance to the question
- Provide scored feedback (0-10 scale)
- Generate constructive improvement suggestions
- Create contextual follow-up questions

**Session Summarization**
- Aggregate performance across all questions
- Identify strengths and improvement areas
- Calculate skill-specific scores
- Generate overall assessment and grade
- Produce actionable recommendations

### 2.2 Non-Functional Requirements

- **Response Time:** < 5 seconds for question generation, < 8 seconds for evaluation
- **Availability:** 99.5% uptime during business hours
- **Scalability:** Handle 100 concurrent evaluation requests
- **Cost Efficiency:** Optimize token usage to minimize LLM API costs
- **Extensibility:** Support adding new LLM providers without code refactoring

---

## 3. API Endpoints

### 3.1 POST /generate-questions

**Purpose:** Generate interview questions based on provided context.

**Request Schema (Pydantic):**
```python
from pydantic import BaseModel, Field
from typing import List, Literal

class GenerateQuestionsRequest(BaseModel):
    interview_type: Literal["HR", "TECHNICAL", "PROJECT"] = Field(
        ..., 
        description="Type of interview"
    )
    job_title: str = Field(
        ..., 
        min_length=3, 
        max_length=100,
        description="Target job position"
    )
    skills: List[str] = Field(
        ..., 
        min_items=1, 
        max_items=10,
        description="Required skills/technologies"
    )
    difficulty: Literal["BEGINNER", "INTERMEDIATE", "ADVANCED"] = Field(
        ...,
        description="Question difficulty level"
    )
    question_count: int = Field(
        ..., 
        ge=3, 
        le=15,
        description="Number of questions to generate"
    )
    resume_text: str | None = Field(
        None,
        max_length=10000,
        description="Candidate's resume text for personalization"
    )
```

**Response Schema:**
```python
class Question(BaseModel):
    text: str = Field(..., description="The question text")
    topic: str = Field(..., description="Primary topic/skill area")
    difficulty: Literal["BEGINNER", "INTERMEDIATE", "ADVANCED"]
    expected_answer_length: int = Field(
        ..., 
        description="Expected word count for answer"
    )
    evaluation_criteria: List[str] = Field(
        ...,
        description="Key points to evaluate in answer"
    )

class GenerateQuestionsResponse(BaseModel):
    questions: List[Question]
    metadata: dict = Field(
        ...,
        description="Generation metadata (model used, token count, etc.)"
    )
```

**Example Request:**
```json
{
  "interview_type": "TECHNICAL",
  "job_title": "Frontend Developer",
  "skills": ["React", "TypeScript", "Next.js"],
  "difficulty": "INTERMEDIATE",
  "question_count": 5,
  "resume_text": null
}
```

**Example Response:**
```json
{
  "questions": [
    {
      "text": "Explain the concept of React Server Components and how they differ from Client Components in Next.js 14.",
      "topic": "Next.js",
      "difficulty": "INTERMEDIATE",
      "expected_answer_length": 150,
      "evaluation_criteria": [
        "Understands Server Components render on server",
        "Knows Client Components use 'use client' directive",
        "Explains performance benefits",
        "Mentions streaming and suspense"
      ]
    }
  ],
  "metadata": {
    "model": "gpt-4",
    "tokens_used": 850,
    "generation_time_ms": 3200
  }
}
```

---

### 3.2 POST /evaluate-answer

**Purpose:** Evaluate a candidate's answer to a specific question.

**Request Schema:**
```python
class EvaluateAnswerRequest(BaseModel):
    question_text: str = Field(..., description="The original question")
    question_topic: str = Field(..., description="Question topic/skill area")
    difficulty: Literal["BEGINNER", "INTERMEDIATE", "ADVANCED"]
    evaluation_criteria: List[str] = Field(
        ...,
        description="Key points to check in answer"
    )
    answer_text: str = Field(
        ..., 
        min_length=10, 
        max_length=2000,
        description="Candidate's answer"
    )
    context: List[dict] | None = Field(
        None,
        max_items=3,
        description="Previous Q&A pairs for context (last 3)"
    )
```

**Response Schema:**
```python
class EvaluateAnswerResponse(BaseModel):
    score: int = Field(..., ge=0, le=10, description="Score out of 10")
    feedback: str = Field(
        ..., 
        min_length=50, 
        max_length=500,
        description="Detailed constructive feedback"
    )
    strengths: List[str] = Field(
        ...,
        description="Positive aspects of the answer"
    )
    improvements: List[str] = Field(
        ...,
        description="Areas for improvement"
    )
    follow_up_question: str = Field(
        ...,
        description="Contextual follow-up question"
    )
    metadata: dict = Field(
        ...,
        description="Evaluation metadata"
    )
```

**Example Request:**
```json
{
  "question_text": "What is the difference between useMemo and useCallback?",
  "question_topic": "React Hooks",
  "difficulty": "INTERMEDIATE",
  "evaluation_criteria": [
    "Explains useMemo memoizes values",
    "Explains useCallback memoizes functions",
    "Mentions dependency arrays",
    "Discusses use cases"
  ],
  "answer_text": "useMemo is used to memoize computed values, while useCallback memoizes function references. useMemo runs during render and returns a value, whereas useCallback returns a memoized function that can be passed to child components to prevent re-renders.",
  "context": [
    {
      "question": "What are React hooks?",
      "answer": "React hooks are functions that let you use state and lifecycle features in functional components."
    }
  ]
}
```

**Example Response:**
```json
{
  "score": 8,
  "feedback": "Good explanation of the core difference between useMemo and useCallback. You correctly identified that useMemo memoizes values while useCallback memoizes functions. Your mention of preventing re-renders is accurate. To improve, discuss dependency arrays and when to use each hook.",
  "strengths": [
    "Clear distinction between the two hooks",
    "Practical use case mentioned",
    "Understands memoization concept"
  ],
  "improvements": [
    "Add details about dependency arrays",
    "Discuss performance implications",
    "Provide concrete code examples"
  ],
  "follow_up_question": "Can you explain what happens if you omit the dependency array in useMemo?",
  "metadata": {
    "model": "gpt-4",
    "tokens_used": 720,
    "evaluation_time_ms": 4100
  }
}
```

---

### 3.3 POST /summarise-session

**Purpose:** Generate comprehensive performance summary for completed interview.

**Request Schema:**
```python
class SessionAnswer(BaseModel):
    question: str
    topic: str
    difficulty: Literal["BEGINNER", "INTERMEDIATE", "ADVANCED"]
    answer: str
    score: int = Field(..., ge=0, le=10)
    feedback: str

class SummariseSessionRequest(BaseModel):
    interview_type: Literal["HR", "TECHNICAL", "PROJECT"]
    job_title: str
    skills: List[str]
    answers: List[SessionAnswer] = Field(
        ...,
        min_items=1,
        description="All Q&A pairs with evaluations"
    )
```

**Response Schema:**
```python
class SkillScore(BaseModel):
    skill: str
    score: float = Field(..., ge=0, le=100)
    max_score: float = 100.0
    questions_count: int

class SummariseSessionResponse(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    max_score: float = 100.0
    percentage: float = Field(..., ge=0, le=100)
    grade: Literal["A+", "A", "B", "C", "D", "F"]
    skill_breakdown: List[SkillScore]
    strengths: List[str] = Field(
        ...,
        min_items=2,
        max_items=5,
        description="Top strengths demonstrated"
    )
    improvements: List[str] = Field(
        ...,
        min_items=2,
        max_items=5,
        description="Key areas for improvement"
    )
    overall_assessment: str = Field(
        ...,
        min_length=100,
        max_length=500,
        description="Narrative summary of performance"
    )
    metadata: dict
```

**Example Response:**
```json
{
  "overall_score": 75.0,
  "max_score": 100.0,
  "percentage": 75.0,
  "grade": "B",
  "skill_breakdown": [
    {
      "skill": "React Hooks",
      "score": 80.0,
      "max_score": 100.0,
      "questions_count": 2
    },
    {
      "skill": "JavaScript Fundamentals",
      "score": 70.0,
      "max_score": 100.0,
      "questions_count": 3
    }
  ],
  "strengths": [
    "Strong understanding of React hooks and lifecycle",
    "Clear communication and structured answers",
    "Good grasp of memoization concepts"
  ],
  "improvements": [
    "Deepen knowledge of advanced JavaScript concepts",
    "Practice explaining complex topics more concisely",
    "Include more code examples in answers"
  ],
  "overall_assessment": "The candidate demonstrated solid intermediate-level knowledge of React and JavaScript. Responses were well-structured and showed practical understanding. With more focus on advanced concepts and concise communication, the candidate would be well-prepared for frontend developer roles.",
  "metadata": {
    "model": "gpt-4",
    "tokens_used": 1200,
    "summarization_time_ms": 5500
  }
}
```

---

## 4. Prompt Engineering Strategy

### 4.1 Prompt Structure

All LLM interactions follow a consistent three-part structure:

1. **System Prompt:** Defines AI role, output format, and constraints
2. **Few-Shot Examples:** 2-3 exemplars demonstrating desired behavior
3. **User Prompt:** Actual request with context and parameters

### 4.2 Structured JSON Output Enforcement

**Technique:** Use JSON Schema in prompt + response validation

**Implementation:**
```python
system_prompt = """You are an expert technical interviewer. 
You MUST respond with valid JSON matching this schema:
{
  "questions": [
    {
      "text": "string",
      "topic": "string",
      "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
      "expected_answer_length": number,
      "evaluation_criteria": ["string"]
    }
  ]
}
Do not include markdown formatting or additional text."""
```

**Validation:**
```python
try:
    response_json = json.loads(llm_response)
    validated = GenerateQuestionsResponse(**response_json)
except (json.JSONDecodeError, ValidationError) as e:
    # Retry with clarification prompt or return fallback
    pass
```

---

## 5. Prompt Templates

### 5.1 HR Question Generation

```python
SYSTEM_PROMPT_HR = """You are an experienced HR interviewer specializing in behavioral and situational questions. Generate questions that assess:
- Communication skills
- Teamwork and collaboration
- Problem-solving approach
- Cultural fit and values
- Career motivation

Output MUST be valid JSON matching the schema provided."""

FEW_SHOT_EXAMPLES_HR = [
    {
        "input": {
            "job_title": "Software Engineer",
            "difficulty": "INTERMEDIATE",
            "question_count": 2
        },
        "output": {
            "questions": [
                {
                    "text": "Describe a time when you had to work with a difficult team member. How did you handle the situation?",
                    "topic": "Teamwork",
                    "difficulty": "INTERMEDIATE",
                    "expected_answer_length": 200,
                    "evaluation_criteria": [
                        "Describes specific situation with context",
                        "Explains actions taken",
                        "Discusses outcome and learning",
                        "Shows emotional intelligence"
                    ]
                }
            ]
        }
    }
]

USER_PROMPT_TEMPLATE_HR = """Generate {question_count} {difficulty} level HR interview questions for a {job_title} position.

Focus on these skills: {skills}

{resume_context}

Return JSON with the questions array."""
```

**Complete Prompt Example:**
```
SYSTEM: You are an experienced HR interviewer...

EXAMPLES:
Input: {"job_title": "Software Engineer", "difficulty": "INTERMEDIATE", "question_count": 2}
Output: {"questions": [{"text": "Describe a time when...", ...}]}

USER: Generate 5 INTERMEDIATE level HR interview questions for a Frontend Developer position.
Focus on these skills: React, TypeScript, Team Collaboration
No resume provided.
Return JSON with the questions array.
```

---

### 5.2 Technical Question Generation

```python
SYSTEM_PROMPT_TECHNICAL = """You are a senior software engineer conducting technical interviews. Generate questions that test:
- Fundamental concepts and theory
- Practical problem-solving ability
- Best practices and design patterns
- Real-world application of knowledge

Questions should be clear, specific, and appropriate for the difficulty level.
Output MUST be valid JSON matching the schema provided."""

FEW_SHOT_EXAMPLES_TECHNICAL = [
    {
        "input": {
            "job_title": "Backend Developer",
            "skills": ["Node.js", "PostgreSQL"],
            "difficulty": "INTERMEDIATE",
            "question_count": 1
        },
        "output": {
            "questions": [
                {
                    "text": "Explain the difference between SQL INNER JOIN and LEFT JOIN. When would you use each?",
                    "topic": "PostgreSQL",
                    "difficulty": "INTERMEDIATE",
                    "expected_answer_length": 120,
                    "evaluation_criteria": [
                        "Correctly explains INNER JOIN returns matching rows only",
                        "Explains LEFT JOIN includes all rows from left table",
                        "Provides appropriate use cases",
                        "Mentions NULL values in LEFT JOIN"
                    ]
                }
            ]
        }
    }
]

USER_PROMPT_TEMPLATE_TECHNICAL = """Generate {question_count} {difficulty} level technical interview questions for a {job_title} position.

Required skills to cover: {skills}

Difficulty guidelines:
- BEGINNER: Basic syntax, definitions, simple concepts
- INTERMEDIATE: Practical application, comparisons, best practices
- ADVANCED: Complex scenarios, optimization, architecture

{resume_context}

Return JSON with the questions array."""
```

---

### 5.3 Answer Evaluation

```python
SYSTEM_PROMPT_EVALUATION = """You are an expert technical interviewer evaluating candidate answers. Provide:
- Objective score (0-10) based on evaluation criteria
- Constructive, encouraging feedback (50-500 characters)
- 2-4 specific strengths
- 2-4 specific improvements
- One contextual follow-up question

Be fair, encouraging, and educational. Focus on what was said, not what might be missing.
Output MUST be valid JSON matching the schema provided."""

FEW_SHOT_EXAMPLES_EVALUATION = [
    {
        "input": {
            "question": "What is the difference between let and const in JavaScript?",
            "topic": "JavaScript Fundamentals",
            "difficulty": "BEGINNER",
            "evaluation_criteria": [
                "Explains let is mutable",
                "Explains const is immutable",
                "Mentions block scoping",
                "Discusses when to use each"
            ],
            "answer": "let allows you to change the value later, while const doesn't allow reassignment. Both are block-scoped."
        },
        "output": {
            "score": 7,
            "feedback": "Good basic explanation of mutability difference and block scoping. To improve, clarify that const prevents reassignment but objects/arrays can still be modified, and discuss best practices for choosing between them.",
            "strengths": [
                "Correctly identifies mutability difference",
                "Mentions block scoping for both"
            ],
            "improvements": [
                "Clarify const behavior with objects/arrays",
                "Discuss best practices and conventions"
            ],
            "follow_up_question": "Can you explain what happens when you use const with an object or array?"
        }
    }
]

USER_PROMPT_TEMPLATE_EVALUATION = """Evaluate this interview answer:

QUESTION: {question_text}
TOPIC: {question_topic}
DIFFICULTY: {difficulty}

EVALUATION CRITERIA:
{criteria_list}

CANDIDATE'S ANSWER:
{answer_text}

{context_section}

Provide a fair evaluation as JSON."""
```

**Context Section (when available):**
```
PREVIOUS Q&A CONTEXT (for coherence):
Q1: {previous_question_1}
A1: {previous_answer_1}
Q2: {previous_question_2}
A2: {previous_answer_2}
```

---

## 6. LLM Provider Abstraction

### 6.1 LLMClient Interface

```python
from abc import ABC, abstractmethod
from typing import List, Dict

class LLMClient(ABC):
    """Abstract base class for LLM provider clients."""
    
    @abstractmethod
    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Dict | None = None
    ) -> str:
        """Generate completion from LLM."""
        pass
    
    @abstractmethod
    async def count_tokens(self, text: str) -> int:
        """Count tokens in text for cost estimation."""
        pass
    
    @abstractmethod
    def get_model_name(self) -> str:
        """Return model identifier."""
        pass
```

### 6.2 OpenAI Implementation

```python
from openai import AsyncOpenAI

class OpenAIClient(LLMClient):
    def __init__(self, api_key: str, model: str = "gpt-4"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
    
    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Dict | None = None
    ) -> str:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if response_format:
            kwargs["response_format"] = response_format
        
        response = await self.client.chat.completions.create(**kwargs)
        return response.choices[0].message.content
    
    async def count_tokens(self, text: str) -> int:
        # Use tiktoken for accurate token counting
        import tiktoken
        encoding = tiktoken.encoding_for_model(self.model)
        return len(encoding.encode(text))
    
    def get_model_name(self) -> str:
        return self.model
```

### 6.3 Anthropic Implementation (Example)

```python
from anthropic import AsyncAnthropic

class AnthropicClient(LLMClient):
    def __init__(self, api_key: str, model: str = "claude-3-sonnet-20240229"):
        self.client = AsyncAnthropic(api_key=api_key)
        self.model = model
    
    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Dict | None = None
    ) -> str:
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}]
        )
        return response.content[0].text
    
    async def count_tokens(self, text: str) -> int:
        # Anthropic token counting
        response = await self.client.count_tokens(text)
        return response.token_count
    
    def get_model_name(self) -> str:
        return self.model
```

### 6.4 Provider Selection

```python
# Dependency injection via FastAPI
from fastapi import Depends

def get_llm_client() -> LLMClient:
    provider = os.getenv("LLM_PROVIDER", "openai")
    
    if provider == "openai":
        return OpenAIClient(
            api_key=os.getenv("OPENAI_API_KEY"),
            model=os.getenv("OPENAI_MODEL", "gpt-4")
        )
    elif provider == "anthropic":
        return AnthropicClient(
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-sonnet-20240229")
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")

# Usage in endpoint
@app.post("/generate-questions")
async def generate_questions(
    request: GenerateQuestionsRequest,
    llm: LLMClient = Depends(get_llm_client)
):
    # Use llm.generate_completion()
    pass
```

---

## 7. Response Parsing and Validation

### 7.1 JSON Parsing with Fallback

```python
import json
from pydantic import ValidationError

async def parse_llm_response(
    raw_response: str,
    response_model: type[BaseModel],
    retry_on_failure: bool = True
) -> BaseModel:
    """Parse and validate LLM response with fallback."""
    
    # Try direct JSON parsing
    try:
        # Remove markdown code blocks if present
        cleaned = raw_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned.split("```json")[1].split("```")[0]
        elif cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1].split("```")[0]
        
        response_dict = json.loads(cleaned)
        validated = response_model(**response_dict)
        return validated
    
    except (json.JSONDecodeError, ValidationError) as e:
        if retry_on_failure:
            # Retry with clarification
            logger.warning(f"LLM response parse failed: {e}. Retrying...")
            # Retry logic here...
            pass
        else:
            raise HTTPException(
                status_code=502,
                detail="AI service returned malformed response"
            )
```

### 7.2 Schema Enforcement

**OpenAI JSON Mode:**
```python
response = await openai_client.generate_completion(
    system_prompt=system_prompt,
    user_prompt=user_prompt,
    response_format={"type": "json_object"}  # Enforces JSON
)
```

**Pydantic Validation:**
```python
# Automatic validation on model instantiation
try:
    questions_response = GenerateQuestionsResponse(**parsed_json)
except ValidationError as e:
    # Handle validation errors
    logger.error(f"Validation failed: {e.errors()}")
    raise HTTPException(status_code=502, detail="Invalid AI response format")
```

---

## 8. Error Handling

### 8.1 Error Categories and Responses

**LLM Timeout (> 30 seconds):**
```python
try:
    response = await asyncio.wait_for(
        llm.generate_completion(...),
        timeout=30.0
    )
except asyncio.TimeoutError:
    raise HTTPException(
        status_code=503,
        detail="AI service timeout. Please try again."
    )
```

**Malformed Response:**
```python
try:
    validated = await parse_llm_response(raw_response, ResponseModel)
except Exception as e:
    # Retry once with clarification prompt
    retry_response = await llm.generate_completion(
        system_prompt="You must return valid JSON...",
        user_prompt=f"Previous response was invalid. Try again: {original_prompt}"
    )
    
    try:
        validated = await parse_llm_response(retry_response, ResponseModel)
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI service returned invalid response after retry"
        )
```

**Rate Limit from Provider:**
```python
from openai import RateLimitError

try:
    response = await llm.generate_completion(...)
except RateLimitError:
    raise HTTPException(
        status_code=429,
        detail="AI service rate limit exceeded. Please try again in a minute."
    )
```

**API Key Invalid:**
```python
from openai import AuthenticationError

try:
    response = await llm.generate_completion(...)
except AuthenticationError:
    logger.critical("Invalid LLM API key!")
    raise HTTPException(
        status_code=500,
        detail="AI service configuration error"
    )
```

### 8.2 Graceful Degradation

**Fallback Strategies:**
1. **Retry with simplified prompt:** Remove examples, reduce complexity
2. **Use cached similar questions:** For question generation, return modified variants of previous questions
3. **Default evaluation:** If evaluation fails, return generic feedback with score based on answer length and keyword matching
4. **Circuit breaker:** After 5 consecutive failures, disable AI service for 5 minutes and return error immediately

---

## 9. Context Management

### 9.1 Conversation Context for Follow-ups

**Strategy:** Pass last 3 Q&A pairs to evaluation endpoint to maintain coherence.

**Context Format:**
```python
context = [
    {
        "question": "What are React hooks?",
        "answer": "Functions that let you use state in functional components.",
        "score": 7
    },
    {
        "question": "Name three commonly used hooks.",
        "answer": "useState, useEffect, and useContext.",
        "score": 9
    },
    {
        "question": "Explain useState in detail.",
        "answer": "useState is a hook that lets you add state to functional components..."
    }
]
```

**Prompt Integration:**
```python
context_text = "\n\n".join([
    f"Previous Q: {item['question']}\nA: {item['answer']}\nScore: {item.get('score', 'N/A')}"
    for item in context[-3:]
])

user_prompt = f"""...
PREVIOUS CONTEXT (for coherence):
{context_text}

CURRENT QUESTION: {current_question}
CURRENT ANSWER: {current_answer}
..."""
```

### 9.2 Token Budget Management

**Budget Limits:**
- System prompt: ~500 tokens
- Few-shot examples: ~400 tokens
- User prompt: ~300 tokens
- Context: ~400 tokens (last 3 Q&A)
- Expected response: ~800 tokens
- **Total:** ~2400 tokens per request

**Cost Optimization:**
```python
async def estimate_cost(prompt: str, expected_response_tokens: int) -> float:
    """Estimate cost before making LLM call."""
    input_tokens = await llm.count_tokens(prompt)
    
    # OpenAI GPT-4 pricing (example)
    input_cost = input_tokens * 0.03 / 1000  # $0.03 per 1K tokens
    output_cost = expected_response_tokens * 0.06 / 1000  # $0.06 per 1K tokens
    
    return input_cost + output_cost

# Log costs for monitoring
logger.info(f"Estimated cost: ${estimated_cost:.4f}")
```

---

## 10. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐ │
│  │ /generate-      │  │ /evaluate-      │  │ /summarise-│ │
│  │  questions      │  │  answer         │  │  session   │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬─────┘ │
│           │                    │                   │        │
│           └────────────────────┼───────────────────┘        │
│                                │                            │
│                    ┌───────────▼──────────┐                 │
│                    │  Prompt Builder      │                 │
│                    │  - System prompts    │                 │
│                    │  - Few-shot examples │                 │
│                    │  - Context injection │                 │
│                    └───────────┬──────────┘                 │
│                                │                            │
│                    ┌───────────▼──────────┐                 │
│                    │   LLMClient (ABC)    │                 │
│                    │   - generate()       │                 │
│                    │   - count_tokens()   │                 │
│                    └───────────┬──────────┘                 │
│                                │                            │
│            ┌───────────────────┼───────────────────┐        │
│            │                   │                   │        │
│   ┌────────▼────────┐ ┌───────▼────────┐ ┌───────▼──────┐ │
│   │ OpenAIClient    │ │AnthropicClient │ │ LocalClient  │ │
│   │ - GPT-4         │ │ - Claude 3     │ │ - Llama 3    │ │
│   └────────┬────────┘ └───────┬────────┘ └───────┬──────┘ │
│            │                   │                   │        │
└────────────┼───────────────────┼───────────────────┼────────┘
             │                   │                   │
             ▼                   ▼                   ▼
    ┌────────────────┐  ┌────────────────┐  ┌─────────────┐
    │ OpenAI API     │  │ Anthropic API  │  │ Local Model │
    │ (External)     │  │ (External)     │  │ (On-premise)│
    └────────────────┘  └────────────────┘  └─────────────┘

                Response Validation & Parsing
                              │
                  ┌───────────▼───────────┐
                  │  Pydantic Models      │
                  │  - Schema validation  │
                  │  - Type checking      │
                  │  - Error handling     │
                  └───────────────────────┘
```

---

## 11. Conclusion

The AI service architecture provides a flexible, robust foundation for intelligent interview functionality. The LLM provider abstraction enables easy migration between models, while comprehensive prompt engineering ensures high-quality, consistent outputs. Error handling and fallback strategies ensure reliability even when external AI services experience issues.

Future enhancements may include:
- Fine-tuned models for domain-specific interviews
- Multi-modal support (code evaluation, diagram analysis)
- Real-time streaming responses for better UX
- Reinforcement learning from human feedback (RLHF) on evaluations

---

**End of Document**
