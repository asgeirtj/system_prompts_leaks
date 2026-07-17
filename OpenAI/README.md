# OpenAI — which file is which product?

**The `gpt-<version>-thinking/instant.md` files are the ChatGPT app system prompts** — what chatgpt.com serves for that model. Files ending `-api.md` are the hidden system messages OpenAI injects on raw API calls (undocumented). `Codex/` is the Codex CLI/agent.

| File pattern | Product |
|---|---|
| `gpt-5.6-sol-extra-high.md`, `gpt-5.5-thinking.md`, `gpt-5.5-instant.md`, … | **ChatGPT** app system prompt for that model |
| `chatgpt-4.5.md`, `chatgpt-atlas.md`, `chatgpt-gpt-5-agent-mode.md` | ChatGPT app (older captures / Atlas browser / agent mode) |
| `gpt-*-api.md` | Hidden system message injected on **API** calls |
| `Codex/` | Codex CLI / coding agent |
| `gpt-4o.md` | ChatGPT 4o (includes the deprecation self-funeral protocol, L226+) |
| `gpt-5-*-personality.md`, `gpt-5.1-*.md` | ChatGPT personality variants |
| `tool-*.md` | ChatGPT tool-specific fragments |
| `Old/` | Superseded versions · `deprecated/` — killed features |
