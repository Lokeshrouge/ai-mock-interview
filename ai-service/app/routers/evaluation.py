from fastapi import APIRouter
from app.models.schemas import EvaluateAnswerRequest, EvaluateAnswerResponse, ScoreBreakdown

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


@router.post("/evaluate", response_model=EvaluateAnswerResponse)
async def evaluate_answer(payload: EvaluateAnswerRequest):
    # Word count heuristic + evaluation response structure
    words = len(payload.student_answer.strip().split())
    base_score = min(92, max(45, 50 + words * 2))

    breakdown = ScoreBreakdown(
        technical_accuracy=min(95, base_score + 2),
        completeness=min(90, base_score - 3),
        clarity=min(95, base_score + 5),
        relevance=min(95, base_score),
    )

    return EvaluateAnswerResponse(
        overall_score=base_score,
        breakdown=breakdown,
        strengths=[
            "Clear technical terminology used",
            "Structured response covering the key question requirements",
        ],
        areas_for_improvement=[
            "Could provide more concrete production examples or metrics",
            "Deepen explanation of edge cases and error handling",
        ],
        model_answer_summary="A top response explicitly defines architectural decisions, trade-offs, and verification methodologies.",
        detailed_feedback="Your response demonstrates strong fundamental understanding. To achieve top percentile scoring, quantify your accomplishments and mention system trade-offs.",
    )
