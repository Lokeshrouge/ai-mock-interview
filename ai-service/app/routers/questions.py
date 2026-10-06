from fastapi import APIRouter
from app.models.schemas import GenerateQuestionsRequest, GenerateQuestionsResponse, QuestionItem

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.post("/generate", response_model=GenerateQuestionsResponse)
async def generate_questions(payload: GenerateQuestionsRequest):
    # Fallback template generator when LLM key is pending, enabling offline fast dev & testing
    sample_questions = [
        QuestionItem(
            id=1,
            question=f"Can you explain your experience and core concepts related to {payload.job_role}?",
            type=payload.interview_type,
            difficulty=payload.difficulty,
            topic="Core Competency",
            expected_key_points=["Practical experience", "Foundational concepts", "Recent projects"],
        ),
        QuestionItem(
            id=2,
            question="Describe an engineering challenge you encountered in a recent project and how you solved it.",
            type="project",
            difficulty=payload.difficulty,
            topic="Problem Solving",
            expected_key_points=["Problem identification", "Technical decisions", "Outcome & metrics"],
        ),
        QuestionItem(
            id=3,
            question="How do you ensure system scalability, performance, and code quality in production?",
            type=payload.interview_type,
            difficulty=payload.difficulty,
            topic="Architecture & Quality",
            expected_key_points=["Testing strategy", "Caching & indexing", "Monitoring"],
        ),
    ]

    # Ensure requested count is returned
    while len(sample_questions) < payload.question_count:
        idx = len(sample_questions) + 1
        sample_questions.append(
            QuestionItem(
                id=idx,
                question=f"Question #{idx}: What best practices do you follow regarding security and reliability in {payload.job_role}?",
                type=payload.interview_type,
                difficulty=payload.difficulty,
                topic="Best Practices",
                expected_key_points=["Authentication", "Error handling", "Documentation"],
            )
        )

    return GenerateQuestionsResponse(
        job_role=payload.job_role,
        interview_type=payload.interview_type,
        difficulty=payload.difficulty,
        questions=sample_questions[:payload.question_count],
    )
