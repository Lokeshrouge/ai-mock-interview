import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.evaluator import (
    RecommendationsRequest,
    generate_heuristic_recommendations,
)


class TestEvaluatorService(unittest.TestCase):
    def test_heuristic_recommendations_high_score(self):
        req = RecommendationsRequest(
            job_role="Fullstack Developer",
            interview_type="TECHNICAL",
            difficulty="HARD",
            overall_score=88.5,
            questions_and_answers=[
                {"question": "Explain event loop in Node.js", "answer": "The event loop has timers, I/O callbacks...", "score": 90},
            ],
        )
        res = generate_heuristic_recommendations(req)
        self.assertIn("Outstanding", res.overall_feedback)
        self.assertGreater(len(res.strengths), 0)
        self.assertGreater(len(res.weaknesses), 0)
        self.assertGreater(len(res.topics_to_improve), 0)
        self.assertGreater(len(res.recommended_resources), 0)

    def test_heuristic_recommendations_medium_score(self):
        req = RecommendationsRequest(
            job_role="Frontend Engineer",
            interview_type="TECHNICAL",
            difficulty="MEDIUM",
            overall_score=68.0,
            questions_and_answers=[],
        )
        res = generate_heuristic_recommendations(req)
        self.assertIn("Solid foundation", res.overall_feedback)
        self.assertGreater(len(res.topics_to_improve), 0)

    def test_heuristic_recommendations_low_score(self):
        req = RecommendationsRequest(
            job_role="Backend Engineer",
            interview_type="TECHNICAL",
            difficulty="EASY",
            overall_score=45.0,
            questions_and_answers=[],
        )
        res = generate_heuristic_recommendations(req)
        self.assertIn("Promising start", res.overall_feedback)
        self.assertGreater(len(res.topics_to_improve), 0)


if __name__ == "__main__":
    unittest.main()
