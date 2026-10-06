import json
import logging
from typing import Dict, Any
from anthropic import AsyncAnthropic
from tenacity import retry, stop_after_attempt, wait_exponential
from .base import LLMProvider
from ..config import settings

logger = logging.getLogger(__name__)

class AnthropicProvider(LLMProvider):
    """Anthropic Claude provider implementation"""
    
    def __init__(self):
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY is required")
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.MODEL_NAME or "claude-3-5-sonnet-20241022"
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def generate_completion(
        self,
        prompt: str,
        system_message: str = None,
        temperature: float = None,
        max_tokens: int = None,
    ) -> str:
        """Generate text completion from prompt"""
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens or settings.MAX_TOKENS,
                temperature=temperature or settings.TEMPERATURE,
                system=system_message or "",
                messages=[{"role": "user", "content": prompt}],
            )
            
            return response.content[0].text
        
        except Exception as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def generate_structured(
        self,
        prompt: str,
        system_message: str = None,
        response_format: Dict[str, Any] = None,
        temperature: float = None,
        max_tokens: int = None,
    ) -> Dict[str, Any]:
        """Generate structured JSON response"""
        try:
            # Claude doesn't have native JSON mode, so we add instruction to prompt
            enhanced_prompt = f"{prompt}\n\nRespond with valid JSON only, no additional text."
            
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens or settings.MAX_TOKENS,
                temperature=temperature or settings.TEMPERATURE,
                system=system_message or "",
                messages=[{"role": "user", "content": enhanced_prompt}],
            )
            
            content = response.content[0].text
            return json.loads(content)
        
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            raise ValueError("Invalid JSON response from LLM")
        except Exception as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise
