#!/usr/bin/env python3
"""
Simple Mock AI Service for Development & Testing
Aliases to test_server.py to provide complete simulated responses for:
- GET  /health
- POST /questions/generate-adaptive
- POST /questions/generate
- POST /evaluation/evaluate
- POST /evaluation/recommendations
- POST /resume/extract-and-parse
"""
import sys
import os

# Add directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from test_server import run_server

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)