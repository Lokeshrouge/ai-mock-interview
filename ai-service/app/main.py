from fastapi import FastAPI
from fastapi.middleware.cors import CORSMouter = None
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="AI Mock Interview - AI Service",
    description="Stateless microservice powering resume parsing, question generation, answer evaluation, and candidate recommendations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "ai-service",
        "provider": settings.AI_PROVIDER,
        "model": settings.MODEL_NAME,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "AI Mock Interview Service is active.",
        "docs_url": "/docs",
    }
