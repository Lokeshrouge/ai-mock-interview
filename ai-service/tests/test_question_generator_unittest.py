import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.question_generator import (
    AdaptiveQuestionRequest,
    get_heuristic_question,
    is_duplicate,
)


class TestAdaptiveQuestionGenerator(unittest.TestCase):
    def test_question_generation_respects_role_and_type(self):
        req = AdaptiveQuestionRequest(
            job_role="Frontend Developer",
            interview_type="TECHNICAL",
            difficulty="MEDIUM",
            question_number=1,
            total_questions=10,
            candidate_skills=["React", "TypeScript"],
        )

        resp = get_heuristic_question(req)
        self.assertIsNotNone(resp.question)
        self.assertGreater(len(resp.question), 20)
        self.assertEqual(resp.type, "technical")
        self.assertEqual(resp.difficulty, "medium")
        self.assertGreater(len(resp.expected_points), 0)

    def test_duplicate_prevention(self):
        q1 = "Can you explain the difference between an Array and a Linked List in memory?"
        previous = [q1]

        # Duplicate check detects identical / highly overlapping questions
        self.assertTrue(is_duplicate(q1, previous))
        self.assertTrue(
            is_duplicate(
                "Can you explain the difference between an array and linked list in memory?",
                previous,
            )
        )
        self.assertFalse(
            is_duplicate(
                "How do you configure a continuous integration pipeline?",
                previous,
            )
        )

    def test_progressive_questioning_advances(self):
        req1 = AdaptiveQuestionRequest(
            job_role="Software Developer",
            interview_type="TECHNICAL",
            difficulty="MEDIUM",
            question_number=1,
            total_questions=10,
        )
        resp1 = get_heuristic_question(req1)

        req2 = AdaptiveQuestionRequest(
            job_role="Software Developer",
            interview_type="TECHNICAL",
            difficulty="MEDIUM",
            question_number=2,
            total_questions=10,
            previous_questions=[resp1.question],
        )
        resp2 = get_heuristic_question(req2)

        # Question 2 must not duplicate Question 1
        self.assertNotEqual(resp1.question, resp2.question)


if __name__ == '__main__':
    unittest.main()
