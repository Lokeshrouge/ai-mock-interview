"""
Minimal AI service test server without external dependencies
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse as urlparse

class MockAIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                "status": "ok",
                "service": "ai-service-mock",
                "provider": "mock"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        # Mock responses for different endpoints
        if '/questions/generate' in self.path:
            response = {
                "questions": [
                    {
                        "question": "Tell me about yourself and your background.",
                        "topic": "Personal Background",
                        "expected_key_points": ["experience", "skills", "motivation"]
                    }
                ]
            }
        elif '/evaluation/evaluate' in self.path:
            response = {
                "overall_score": 75,
                "detailed_feedback": "Good response with clear structure.",
                "strengths": ["Clear communication", "Relevant examples"],
                "areas_for_improvement": ["More specific details"],
                "breakdown": {
                    "technical_accuracy": 70,
                    "relevance": 80,
                    "completeness": 75,
                    "clarity": 75
                }
            }
        else:
            response = {"status": "ok", "message": "Mock AI service response"}
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8000), MockAIHandler)
    print(f"Mock AI Service running on http://localhost:8000")
    print("Endpoints available:")
    print("  GET  /health")
    print("  POST /questions/generate")
    print("  POST /evaluation/evaluate")
    server.serve_forever()