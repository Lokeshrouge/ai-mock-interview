import os
from typing import Literal

class Settings:
    # AI Provider Configuration
    AI_PROVIDER: Literal["openai", "anthropic"] = os.getenv("AI_PROVIDER", "openai")
    
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Model Configuration
    MODEL_NAME: str = os.getenv("MODEL_NAME", "gpt-4-turbo")
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.7"))
    MAX_TOKENS: int = int(os.getenv("MAX_TOKENS", "2000"))
    
    # Request Configuration
    REQUEST_TIMEOUT: int = 30  # seconds
    MAX_RETRIES: int = 3
    
    # CORS Configuration
    cors_origins: list = ["http://localhost:3000", "http://localhost:3001", "*"]
    
    # Validation
    def validate(self):
        """Validate configuration"""
        if self.AI_PROVIDER == "openai" and not self.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required when AI_PROVIDER=openai")
        if self.AI_PROVIDER == "anthropic" and not self.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic")
        return True

settings = Settings()
