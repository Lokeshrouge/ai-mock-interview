from .base import LLMProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from ..config import settings

def get_llm_provider() -> LLMProvider:
    """Factory function to get configured LLM provider"""
    provider = settings.AI_PROVIDER.lower()
    
    if provider == "openai":
        return OpenAIProvider()
    elif provider == "anthropic":
        return AnthropicProvider()
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")
