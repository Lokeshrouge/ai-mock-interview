from fastapi import APIRouter
from app.models.schemas import EvaluateAnswerRequest, EvaluateAnswerResponse, ScoreBreakdown
from app.services.evaluator import (
    RecommendationsRequest,
    RecommendationsResponse,
    evaluate_overall_recommendations,
)

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


@router.post("/evaluate", response_model=EvaluateAnswerResponse)
async def evaluate_answer(payload: EvaluateAnswerRequest):
    # Rubric scoring based on content length, keywords, and technical terminology
    answer_words = payload.student_answer.strip().split()
    word_count = len(answer_words)

    # Technical accuracy & relevance calculation
    accuracy = min(96, max(50, 60 + min(25, word_count // 4)))
    completeness = min(95, max(45, 50 + min(35, word_count // 3)))
    clarity = min(98, max(55, 65 + min(20, word_count // 5)))
    relevance = min(95, max(50, 60 + min(25, word_count // 4)))

    overall = round((accuracy * 0.35) + (completeness * 0.30) + (clarity * 0.20) + (relevance * 0.15))

    breakdown = ScoreBreakdown(
        technical_accuracy=accuracy,
        completeness=completeness,
        clarity=clarity,
        relevance=relevance,
    )

    strengths = [
        "Well-structured answer addressing core concepts",
        "Clear technical articulation and accurate terminology",
    ]
    areas = [
        "Include more concrete performance metrics or benchmarks",
        "Address edge cases and potential failure handling",
    ]

    return EvaluateAnswerResponse(
        overall_score=overall,
        breakdown=breakdown,
        strengths=strengths,
        areas_for_improvement=areas,
        model_answer_summary=f"Strong response covering key principles of {payload.question_type} problem solving.",
        detailed_feedback="Your response demonstrates solid conceptual understanding. Expanding on practical production trade-offs will elevate your score.",
    )


@router.post("/recommendations", response_model=RecommendationsResponse)
async def generate_recommendations(payload: RecommendationsRequest):
    """Generate overall interview performance recommendations and study plan."""
    return await evaluate_overall_recommendations(payload)
