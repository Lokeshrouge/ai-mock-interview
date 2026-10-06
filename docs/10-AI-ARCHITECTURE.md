# AI Architecture

## AI Service Overview

**Technology**: Python 3.11+ with FastAPI  
**Purpose**: Handle all AI/ML operations isolated from business logic  
**Port**: 8000  
**Communication**: REST API (called by NestJS backend only)

---

## AI Service Responsibilities

### 1. Resume Parsing
- Extract text from PDF/DOCX
- Parse structured information (education, experience, projects, skills)
- Return JSON format

### 2. Question Generation
- Generate interview questions based on:
  - Job role
  - Interview type
  - Difficulty level
  - Resume content
  - Student profile
- Ensure variety and relevance
- Return 5-10 questions per interview

### 3. Answer Evaluation
- Evaluate student answers against questions
- Score 0-100 with breakdown
- Generate detailed feedback
- Identify strengths and weaknesses

### 4. Recommendation Generation
- Analyze all interview answers
- Identify overall strengths/weaknesses
- Suggest topics to improve
- Provide actionable study plan

---

## AI Service Architecture

```
┌────────────────────────────────────────────────┐
│           FastAPI Application                  │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │         API Routes                       │ │
│  │  /parse-resume                           │ │
│  │  /generate-questions                     │ │
│  │  /evaluate-answer                        │ │
│  │  /generate-recommendations               │ │
│  └────────────┬─────────────────────────────┘ │
│               │                                │
│  ┌────────────┼─────────────────────────────┐ │
│  │      Service Layer                       │ │
│  │  ┌───────────┐  ┌──────────────────────┐│ │
│  │  │  Resume   │  │  Question Generator  ││ │
│  │  │  Parser   │  │                      ││ │
│  │  └───────────┘  └──────────────────────┘│ │
│  │  ┌───────────┐  ┌──────────────────────┐│ │
│  │  │  Answer   │  │ Recommendation       ││ │
│  │  │ Evaluator │  │    Generator         ││ │
│  │  └───────────┘  └──────────────────────┘│ │
│  └────────────┬─────────────────────────────┘ │
│               │                                │
│  ┌────────────┼─────────────────────────────┐ │
│  │      LLM Integration Layer               │ │
│  │  ┌────────────┐  ┌────────────────────┐ │ │
│  │  │  Prompt    │  │   LLM Client       │ │ │
│  │  │ Templates  │  │ (OpenAI/Anthropic) │ │ │
│  │  └────────────┘  └────────────────────┘ │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

---

## API Endpoints

### POST `/parse-resume`
**Purpose**: Extract and parse resume data  
**Request**:
```json
{
  "file_content": "base64_encoded_content",
  "file_type": "pdf"
}
```
**Response**:
```json
{
  "extracted_text": "Full resume text...",
  "parsed_data": {
    "personal": {"name": "John Doe", "email": "..."},
    "education": [...],
    "experience": [...],
    "projects": [...],
    "skills": {"technical": [...], "soft": [...]}
  }
}
```

---

### POST `/generate-questions`
**Purpose**: Generate interview questions  
**Request**:
```json
{
  "job_role": "Software Developer",
  "interview_type": "TECHNICAL",
  "difficulty": "MEDIUM",
  "num_questions": 7,
  "resume_data": {...},
  "student_profile": {...}
}
```
**Response**:
```json
{
  "questions": [
    {
      "question_text": "Explain the difference between async and defer in script tags.",
      "category": "JavaScript",
      "expected_points": ["async executes immediately", "defer waits for DOM"]
    }
  ]
}
```

---

### POST `/evaluate-answer`
**Purpose**: Evaluate student answer  
**Request**:
```json
{
  "question": "What is polymorphism?",
  "answer": "Polymorphism is the ability...",
  "context": {
    "job_role": "Software Developer",
    "interview_type": "TECHNICAL",
    "difficulty": "MEDIUM"
  }
}
```
**Response**:
```json
{
  "score": 85,
  "feedback": "Good explanation covering key concepts...",
  "strengths": ["Clear definition", "Good examples"],
  "weaknesses": ["Could mention runtime polymorphism"],
  "detailed_scores": {
    "relevance": 0.9,
    "accuracy": 0.85,
    "completeness": 0.8,
    "clarity": 0.9
  }
}
```

---

### POST `/generate-recommendations`
**Purpose**: Generate improvement recommendations  
**Request**:
```json
{
  "interview_id": "uuid",
  "evaluations": [
    {
      "question": "...",
      "answer": "...",
      "score": 85,
      "category": "OOP"
    }
  ]
}
```
**Response**:
```json
{
  "strengths": [
    {"area": "OOP Concepts", "details": "Strong understanding"},
    {"area": "Communication", "details": "Clear explanations"}
  ],
  "weaknesses": [
    {"area": "System Design", "details": "Limited scalability knowledge"}
  ],
  "topics_to_improve": [
    "System Design Patterns",
    "Scalability Concepts",
    "Microservices Architecture"
  ],
  "overall_feedback": "You demonstrated solid fundamentals..."
}
```

---

## LLM Prompt Engineering

### Question Generation Prompt

```python
QUESTION_GENERATION_PROMPT = """
You are an expert technical interviewer for {job_role} position.

Generate {num_questions} {interview_type} interview questions at {difficulty} difficulty level.

Candidate Background:
- Skills: {skills}
- Experience: {experience}
- Projects: {projects}

Requirements:
1. Questions must be relevant to {job_role}
2. Match {difficulty} level appropriately
3. For PROJECT type, ask about candidate's specific projects
4. Avoid yes/no questions
5. Ensure variety across different topics
6. No discriminatory or inappropriate questions

Return JSON format:
[
  {
    "question_text": "...",
    "category": "...",
    "expected_points": [...]
  }
]
"""
```

### Answer Evaluation Prompt

```python
EVALUATION_PROMPT = """
You are an expert interviewer evaluating a candidate's answer.

Question: {question}
Candidate's Answer: {answer}
Job Role: {job_role}
Difficulty: {difficulty}

Evaluate the answer on:
1. Relevance (0-1): Does it address the question?
2. Accuracy (0-1): Is the information correct?
3. Completeness (0-1): Does it cover key points?
4. Clarity (0-1): Is it well-explained?

Calculate overall score: (relevance + accuracy + completeness + clarity) / 4 * 100

Provide:
- Overall score (0-100)
- Constructive feedback (2-3 sentences)
- Strengths (what was done well)
- Weaknesses (what could be improved)

Return JSON format:
{
  "score": 85,
  "feedback": "...",
  "strengths": [...],
  "weaknesses": [...],
  "detailed_scores": {
    "relevance": 0.9,
    "accuracy": 0.85,
    "completeness": 0.8,
    "clarity": 0.9
  }
}
"""
```

### Recommendation Generation Prompt

```python
RECOMMENDATION_PROMPT = """
You are a career coach analyzing an interview performance.

Interview Details:
- Job Role: {job_role}
- Interview Type: {interview_type}

All Questions and Evaluations:
{evaluations_summary}

Task:
1. Identify 3-5 key strengths demonstrated
2. Identify 3-5 areas needing improvement
3. Suggest specific topics to study
4. Provide overall constructive feedback

Return JSON format:
{
  "strengths": [
    {"area": "...", "details": "..."}
  ],
  "weaknesses": [
    {"area": "...", "details": "..."}
  ],
  "topics_to_improve": ["Topic 1", "Topic 2"],
  "overall_feedback": "..."
}
"""
```

---

## LLM Provider Integration

### Supported Providers
1. **OpenAI** (GPT-4, GPT-4-turbo)
2. **Anthropic** (Claude 3.5 Sonnet)

### Configuration-Based Selection

```python
# config.py
class AIConfig:
    PROVIDER = os.getenv("AI_PROVIDER", "openai")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    MODEL = os.getenv("AI_MODEL", "gpt-4-turbo")
    TEMPERATURE = 0.7
    MAX_TOKENS = 2000
```

### Abstract Provider Interface

```python
class LLMProvider(ABC):
    @abstractmethod
    def generate_completion(self, prompt: str) -> str:
        pass

class OpenAIProvider(LLMProvider):
    def generate_completion(self, prompt: str) -> str:
        # OpenAI implementation
        pass

class AnthropicProvider(LLMProvider):
    def generate_completion(self, prompt: str) -> str:
        # Anthropic implementation
        pass
```

---

## Resume Parsing Implementation

### Text Extraction

```python
def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF using PyPDF2"""
    pdf_reader = PdfReader(BytesIO(file_content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX using python-docx"""
    doc = Document(BytesIO(file_content))
    text = "\n".join([para.text for para in doc.paragraphs])
    return text
```

### Structured Parsing (AI-Powered)

```python
RESUME_PARSING_PROMPT = """
Extract structured information from this resume:

{resume_text}

Return JSON with:
- personal: name, email, phone
- education: degree, institution, year, gpa
- experience: title, company, duration, description
- projects: title, description, technologies
- skills: categorized list
- certifications: list

Return valid JSON only, no additional text.
"""
```

---

## Error Handling

### Retry Logic
```python
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def call_llm_with_retry(prompt: str) -> str:
    return await llm_provider.generate_completion(prompt)
```

### Timeout Handling
```python
async def evaluate_answer_with_timeout(question, answer):
    try:
        return await asyncio.wait_for(
            call_llm_with_retry(prompt),
            timeout=30.0
        )
    except asyncio.TimeoutError:
        raise AIServiceException("Evaluation timeout")
```

### Fallback Responses
```python
def get_fallback_evaluation():
    return {
        "score": 50,
        "feedback": "Unable to evaluate at this time. Please try again.",
        "strengths": [],
        "weaknesses": [],
        "detailed_scores": {
            "relevance": 0.5,
            "accuracy": 0.5,
            "completeness": 0.5,
            "clarity": 0.5
        }
    }
```

---

## Response Validation

### Question Validation
```python
def validate_generated_questions(questions: list) -> bool:
    """Ensure questions meet quality standards"""
    for q in questions:
        if len(q["question_text"]) < 10:
            return False
        if not q["category"]:
            return False
        if any(inappropriate_word in q["question_text"].lower() 
               for inappropriate_word in INAPPROPRIATE_WORDS):
            return False
    return True
```

### Evaluation Validation
```python
def validate_evaluation(evaluation: dict) -> bool:
    """Ensure evaluation is properly formatted"""
    required_fields = ["score", "feedback", "strengths", "weaknesses"]
    if not all(field in evaluation for field in required_fields):
        return False
    if not (0 <= evaluation["score"] <= 100):
        return False
    return True
```

---

## Caching Strategy

### Question Caching (Optional)
- Cache commonly generated questions by (job_role, type, difficulty)
- Redis for distributed caching
- TTL: 7 days

### Evaluation Caching
- DO NOT cache evaluations (each answer unique)
- Cache LLM responses only during same request for retry

---

## Performance Optimization

### Async Operations
```python
@app.post("/evaluate-batch")
async def evaluate_multiple_answers(answers: List[AnswerInput]):
    """Evaluate multiple answers in parallel"""
    tasks = [evaluate_answer(ans) for ans in answers]
    results = await asyncio.gather(*tasks)
    return results
```

### Streaming Responses (Future)
```python
@app.post("/evaluate-answer-stream")
async def evaluate_answer_stream(request: EvaluationRequest):
    """Stream evaluation as it's generated"""
    async for chunk in llm_provider.generate_stream(prompt):
        yield chunk
```

---

## Monitoring & Logging

### Metrics to Track
- LLM API call latency
- LLM API success/failure rate
- Token usage per request
- Cost per evaluation
- Question generation time
- Evaluation accuracy (if ground truth available)

### Logging
```python
logger.info(f"Question generation: job_role={job_role}, time={elapsed}s")
logger.info(f"Token usage: {tokens_used}, cost=${cost}")
logger.error(f"LLM API error: {error}", exc_info=True)
```

---

## Security Considerations

1. **API Key Protection**: Never expose in logs or responses
2. **Input Sanitization**: Clean all user inputs before LLM prompts
3. **Output Validation**: Validate LLM responses before returning
4. **Rate Limiting**: Prevent abuse of expensive LLM calls
5. **No Direct Access**: AI service called only by backend, not frontend
6. **Prompt Injection**: Sanitize resume text to prevent injection attacks

---

## Cost Management

### Token Optimization
- Use efficient prompts (clear, concise)
- Set max_tokens appropriately
- Use cheaper models where accuracy isn't critical

### Budget Controls
- Set daily API spending limits
- Alert when approaching budget
- Fallback to cached/default responses if over budget

---

## Testing AI Service

### Unit Tests
```python
def test_resume_parsing():
    result = parse_resume(sample_pdf_content, "pdf")
    assert "personal" in result.parsed_data
    assert result.parsed_data["personal"]["name"]

def test_question_generation():
    questions = generate_questions(
        job_role="Software Developer",
        interview_type="TECHNICAL",
        difficulty="MEDIUM",
        num_questions=5
    )
    assert len(questions) == 5
    assert validate_generated_questions(questions)
```

### Integration Tests
```python
@pytest.mark.integration
async def test_full_evaluation_flow():
    # Test complete flow with real LLM
    result = await evaluate_answer(
        question="What is polymorphism?",
        answer="Polymorphism allows objects..."
    )
    assert 0 <= result["score"] <= 100
    assert result["feedback"]
```

---

## Scalability

### Horizontal Scaling
- Multiple AI service instances behind load balancer
- Stateless service (no local state)
- Each instance has own LLM API connection

### Queue-Based Processing (Future)
- Use message queue (RabbitMQ/Redis) for long-running tasks
- Backend submits to queue
- AI workers process asynchronously
- Webhook/polling for results
