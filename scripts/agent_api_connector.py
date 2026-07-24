#!/usr/bin/env python3
import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parents[1]

PROVIDERS = [
    {
        "name": "OpenAI",
        "env_var": "OPENAI_API_KEY",
        "docs_url": "https://platform.openai.com/api-keys",
    },
    {
        "name": "Anthropic",
        "env_var": "ANTHROPIC_API_KEY",
        "docs_url": "https://console.anthropic.com/settings/keys",
    },
    {
        "name": "Google Gemini",
        "env_var": "GOOGLE_API_KEY",
        "docs_url": "https://aistudio.google.com/app/apikey",
    },
    {
        "name": "Groq",
        "env_var": "GROQ_API_KEY",
        "docs_url": "https://console.groq.com/keys",
    },
]


def build_connection_status(env: Dict[str, str] | None = None) -> Dict[str, object]:
    source = os.environ if env is None else env
    providers: List[Dict[str, object]] = []
    ready = True

    for provider in PROVIDERS:
        value = (source.get(provider["env_var"], "") or "").strip()
        connected = bool(value)
        if not connected:
            ready = False
        providers.append(
            {
                "name": provider["name"],
                "env_var": provider["env_var"],
                "connected": connected,
                "status": "connected" if connected else "not_configured",
                "docs_url": provider["docs_url"],
            }
        )

    return {
        "ready": ready,
        "providers": providers,
    }


def render_markdown(status: Dict[str, object]) -> str:
    lines = [
        "# Agent API connection status",
        "",
        "This view shows which provider API keys are currently available for agent-based workflows.",
        "",
        "| Provider | Status | Environment variable |",
        "| --- | --- | --- |",
    ]

    for provider in status["providers"]:
        lines.append(
            f"| {provider['name']} | {'connected' if provider['connected'] else 'not_configured'} | {provider['env_var']} |"
        )

    lines.append("")
    if status["ready"]:
        lines.append("All configured providers are ready to be used.")
    else:
        lines.append("Add the missing API keys to your local environment or .env file to enable the connections.")

    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Check API key availability for AI agent integrations")
    parser.add_argument("--format", choices=["json", "md"], default="json", help="Output format")
    parser.add_argument("--output", help="Optional file path to write the generated result")
    parser.add_argument("--require-all", action="store_true", help="Exit with a non-zero status if any provider is missing")
    args = parser.parse_args()

    status = build_connection_status()
    if args.format == "md":
        payload = render_markdown(status)
    else:
        payload = json.dumps(status, indent=2) + "\n"

    if args.output:
        output_path = Path(args.output)
        if not output_path.is_absolute():
            output_path = ROOT / output_path
        output_path.write_text(payload, encoding="utf-8")
        print(f"Wrote {output_path.relative_to(ROOT).as_posix()}")
    else:
        print(payload, end="")

    if args.require_all and not status["ready"]:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
