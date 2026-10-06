from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    AI_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    MODEL_NAME: str = "gpt-4-turbo"
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 2000
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
