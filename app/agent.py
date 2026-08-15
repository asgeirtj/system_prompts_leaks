import os
from typing import Optional


def _detect_provider(api_key: Optional[str] = None) -> str:
    if api_key:
        return "custom"
    if os.getenv("GOOGLE_API_KEY"):
        return "gemini"
    if os.getenv("OPENAI_API_KEY"):
        return "openai"
    if os.getenv("ANTHROPIC_API_KEY"):
        return "anthropic"
    if os.getenv("GROQ_API_KEY"):
        return "groq"
    if os.getenv("KIMI_API_KEY"):
        return "kimi"
    if os.getenv("QWEN_API_KEY"):
        return "qwen"
    if os.getenv("ZHIPU_API_KEY"):
        return "zai"
    return "fallback"


def build_agent_reply(user_message: str, api_key: Optional[str] = None) -> str:
    provider = _detect_provider(api_key)
    if provider == "gemini":
        return f"Gemini-ready agent response for: {user_message}"
    if provider == "openai":
        return f"OpenAI-ready agent response for: {user_message}"
    if provider == "anthropic":
        return f"Anthropic-ready agent response for: {user_message}"
    if provider == "groq":
        return f"Groq-ready agent response for: {user_message}"
    if provider == "kimi":
        return f"Kimi-ready agent response for: {user_message}"
    if provider == "qwen":
        return f"Qwen-ready agent response for: {user_message}"
    if provider == "zai":
        return f"Zhipu AI-ready agent response for: {user_message}"
    if provider == "custom":
        return f"Connected agent mode ready for: {user_message}"
    return f"fallback-agent-response: I can help with '{user_message}' using the local prompt catalog and workflow engine."
