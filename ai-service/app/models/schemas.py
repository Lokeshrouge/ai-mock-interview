from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ParseResumeRequest(BaseModel):
    file_content: str = Field(..., description="Base64 encoded file content or raw text")
    file_type: str = Field("pdf", description="File extension: pdf or docx or text")


class ParsedResumeData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)


class ParseResumeResponse(BaseModel):
    extracted_text: str
    parsed_data: ParsedResumeData


class QuestionItem(BaseModel):
    id: int
    question: str
    type: str  # technical, behavioral, project
    difficulty: str  # easy, medium, hard
    topic: str
    expected_key_points: List[str] = Field(default_factory=list)


class GenerateQuestionsRequest(BaseModel):
    job_role: str
    difficulty: str = "medium"
    interview_type: str = "technical"
    question_count: int = 7
    resume_text: Optional[str] = None
    skills: List[str] = Field(default_factory=list)


class GenerateQuestionsResponse(BaseModel):
    job_role: str
    interview_type: str
    difficulty: str
    questions: List[QuestionItem]


class EvaluateAnswerRequest(BaseModel):
    question: str
    question_type: str
    difficulty: str
    student_answer: str
    expected_key_points: Optional[List[str]] = Field(default_factory=list)


class ScoreBreakdown(BaseModel):
    technical_accuracy: int = Field(ge=0, le=100)
    completeness: int = Field(ge=0, le=100)
    clarity: int = Field(ge=0, le=100)
    relevance: int = Field(ge=0, le=100)


class EvaluateAnswerResponse(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    breakdown: ScoreBreakdown
    strengths: List[str]
    areas_for_improvement: List[str]
    model_answer_summary: str
    detailed_feedback: str
