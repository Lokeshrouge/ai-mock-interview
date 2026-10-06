from abc import ABC, abstractmethod
from typing import Dict, Any

class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    @abstractmethod
    async def generate_completion(
        self,
        prompt: str,
        system_message: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> str:
        """Generate text completion from prompt"""
        pass
    
    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        system_message: str = None,
        response_format: Dict[str, Any] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> Dict[str, Any]:
        """Generate structured JSON response"""
        pass
