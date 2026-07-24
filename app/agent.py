import os
from typing import Optional


def build_agent_reply(user_message: str, api_key: Optional[str] = None) -> str:
    key = api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY") or os.getenv("GROQ_API_KEY")
    if key:
        if os.getenv("GOOGLE_API_KEY") and not api_key:
            return f"Gemini-ready agent response for: {user_message}"
        return f"Connected agent mode ready for: {user_message}"
    return f"fallback-agent-response: I can help with '{user_message}' using the local prompt catalog and workflow engine."
