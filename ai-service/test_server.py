"""
Standalone Zero-Dependency AI Microservice Mock Server
Runs on Python 3 standard library (http.server).
Provides realistic simulated responses for all AI interview endpoints:
- GET  /health
- POST /questions/generate-adaptive
- POST /questions/generate
- POST /evaluation/evaluate
- POST /evaluation/recommendations
- POST /resume/extract-and-parse
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import random

class MockAIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        if self.path in ('/health', '/'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                "status": "healthy",
                "service": "ai-service-mock",
                "provider": "simulated",
                "version": "1.0.0"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            payload = json.loads(post_data.decode('utf-8')) if post_data else {}
        except Exception:
            payload = {}

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

        path = self.path

        # 1. Adaptive Question Generation
        if '/questions/generate' in path:
            question_num = payload.get('question_number', payload.get('current_question_number', 1))
            role = payload.get('job_role', payload.get('role', 'Software Engineer'))
            diff = payload.get('difficulty', 'MEDIUM')

            questions_pool = [
                f"How would you design and optimize an API endpoint for high-throughput in a {role} environment?",
                f"Can you explain how you approach debugging memory leaks or asynchronous bottlenecks in your code?",
                f"Walk me through a project where you implemented architectural patterns to ensure scalability and maintainability.",
                f"How do you handle data consistency, database transactions, and isolation levels in distributed systems?",
                f"Describe a challenging technical disagreement you had with a team member and how you resolved it."
            ]
            selected_q = questions_pool[(question_num - 1) % len(questions_pool)]

            response = {
                "question": selected_q,
                "question_text": selected_q,
                "topic": "Core Engineering Principles",
                "difficulty": diff,
                "expected_key_points": [
                    "Sound conceptual understanding",
                    "Practical application examples",
                    "Trade-off evaluation"
                ],
                "expected_points": [
                    "Sound conceptual understanding",
                    "Practical application examples",
                    "Trade-off evaluation"
                ]
            }

        # 2. Answer Evaluation
        elif '/evaluation/evaluate' in path:
            answer = payload.get('answer_text', payload.get('answer', ''))
            length_bonus = min(20, len(answer) // 25)
            tech_acc = min(95, 70 + length_bonus)
            comp = min(92, 68 + length_bonus)
            clar = min(90, 75 + (length_bonus // 2))
            rel = min(95, 80 + (length_bonus // 3))

            overall = round((tech_acc * 0.35) + (comp * 0.30) + (clar * 0.20) + (rel * 0.15), 1)

            response = {
                "overall_score": overall,
                "detailed_feedback": "Strong structured explanation that directly answers the core question. Solid grasp of practical implications.",
                "strengths": [
                    "Clear logical organization of technical thoughts",
                    "Accurate terminology and concepts applied"
                ],
                "areas_for_improvement": [
                    "Could delve deeper into specific performance edge cases",
                    "Consider mentioning automated testing strategies"
                ],
                "breakdown": {
                    "technical_accuracy": tech_acc,
                    "completeness": comp,
                    "clarity": clar,
                    "relevance": rel
                }
            }

        # 3. Overall Recommendations & Synthesis
        elif '/evaluation/recommendations' in path:
            response = {
                "overall_score": 82.5,
                "summary": "Candidate demonstrated strong engineering fundamentals with clear communication and structured responses across all questions.",
                "strengths": [
                    "Robust foundational knowledge of system design concepts",
                    "Concise and articulate technical communication",
                    "Demonstrated ability to reason through architectural trade-offs"
                ],
                "areas_for_improvement": [
                    "Deepen understanding of distributed consensus protocols",
                    "Provide more quantitative performance metrics in project explanations"
                ],
                "recommended_topics": [
                    "Distributed Caching & Eviction Policies",
                    "Database Indexing Internals (B-Trees vs LSM-Trees)",
                    "Microservices Observability & OpenTelemetry"
                ],
                "learning_resources": [
                    {
                        "title": "Designing Data-Intensive Applications",
                        "url": "https://dataintensive.net/",
                        "type": "Book"
                    },
                    {
                        "title": "System Design Primer",
                        "url": "https://github.com/donnemartin/system-design-primer",
                        "type": "Repository"
                    }
                ]
            }

        # 4. Resume Extraction & Parsing
        elif '/resume/extract-and-parse' in path or '/resume/parse' in path:
            response = {
                "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "Docker", "Git"],
                "programming_languages": ["TypeScript", "JavaScript", "Python", "SQL"],
                "tools_technologies": ["Next.js", "NestJS", "PostgreSQL", "Docker", "Git", "Tailwind CSS"],
                "experience_level": "ENTRY",
                "target_role": "Fullstack Developer",
                "education": [
                    {
                        "degree": "B.Sc. Computer Science",
                        "institution": "University Institute of Technology",
                        "year": 2025
                    }
                ],
                "projects": [
                    {
                        "name": "AI Mock Interview Platform",
                        "description": "Adaptive mock interview system with real-time evaluation"
                    }
                ]
            }

        else:
            response = {"status": "ok", "message": "Simulated AI microservice response", "path": path}

        self.wfile.write(json.dumps(response).encode('utf-8'))

def run_server(port=8000):
    server = HTTPServer(('0.0.0.0', port), MockAIHandler)
    print(f"🚀 Zero-Dependency Mock AI Service running on http://localhost:{port}")
    print("Endpoints ready:")
    print("  GET  /health")
    print("  POST /questions/generate-adaptive")
    print("  POST /questions/generate")
    print("  POST /evaluation/evaluate")
    print("  POST /evaluation/recommendations")
    print("  POST /resume/extract-and-parse")
    server.serve_forever()

if __name__ == '__main__':
    run_server()