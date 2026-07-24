import os
import unittest

from app.agent import build_agent_reply


class GeminiIntegrationTests(unittest.TestCase):
    def test_gemini_reply_uses_fallback_when_no_key(self) -> None:
        os.environ.pop("GOOGLE_API_KEY", None)
        reply = build_agent_reply("Explain Gemini integration")
        self.assertIn("fallback", reply.lower())


if __name__ == "__main__":
    unittest.main()
