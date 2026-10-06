from fastapi import APIRouter
from app.models.schemas import GenerateQuestionsRequest, GenerateQuestionsResponse, QuestionItem
from app.services.question_generator import (
    AdaptiveQuestionRequest,
    AdaptiveQuestionResponse,
    generate_adaptive_question,
)

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.post("/generate-adaptive", response_model=AdaptiveQuestionResponse)
async def generate_single_adaptive_question(payload: AdaptiveQuestionRequest):
    """
    Generate an intelligent, personalized, adaptive interview question considering
    job role, interview type, difficulty, candidate resume context, and previously asked questions.
    """
    return await generate_adaptive_question(payload)


@router.post("/generate", response_model=GenerateQuestionsResponse)
async def generate_questions(payload: GenerateQuestionsRequest):
    """Batch question generation endpoint."""
    questions_list = []
    previous_texts = []

    for i in range(1, payload.question_count + 1):
        req = AdaptiveQuestionRequest(
            job_role=payload.job_role,
            interview_type=payload.interview_type,
            difficulty=payload.difficulty,
            question_number=i,
            total_questions=payload.question_count,
            candidate_skills=payload.skills,
            previous_questions=previous_texts,
        )
        res = await generate_adaptive_question(req)
        previous_texts.append(res.question)

        questions_list.append(
            QuestionItem(
                id=i,
                question=res.question,
                type=res.type,
                difficulty=res.difficulty,
                topic=res.topic,
                expected_key_points=res.expected_points,
            )
        )

    return GenerateQuestionsResponse(
        job_role=payload.job_role,
        interview_type=payload.interview_type,
        difficulty=payload.difficulty,
        questions=questions_list,
    )
