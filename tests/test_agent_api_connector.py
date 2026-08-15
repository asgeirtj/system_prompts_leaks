import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import importlib.util
import sys

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("agent_api_connector", ROOT / "scripts" / "agent_api_connector.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class AgentApiConnectorTests(unittest.TestCase):
    def test_main_accepts_absolute_output_path_outside_repo(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = Path(tmpdir) / "agent_status.md"
            with patch.object(sys, "argv", ["agent_api_connector.py", "--format", "md", "--output", str(output_path)]):
                exit_code = MODULE.main()

            self.assertEqual(exit_code, 0)
            self.assertTrue(output_path.exists())
            self.assertIn("# Agent API connection status", output_path.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
