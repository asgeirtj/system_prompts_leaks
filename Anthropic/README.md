# Anthropic — which file is which product?

**The bare `claude-<model>.md` files in this folder are the claude.ai system prompts** — the prompt served to that model in the Claude web/mobile app (claude.ai). They are not API prompts (the Claude API injects no system prompt) and not Claude Code prompts.

| File pattern | Product |
|---|---|
| `claude-fable-5.md`, `claude-opus-4.8.md`, `claude-sonnet-5.md`, … | **claude.ai** app system prompt for that model |
| `claude-*-no-tools.md` | claude.ai with tools disabled |
| `Claude Code/` | Claude Code (the CLI/agent harness) |
| `claude-design.md` | Claude Design |
| `claude-cowork.md`, `claude-cowork-dispatch.md` | Claude Cowork |
| `claude-for-excel.md`, `claude-for-word.md`, `claude-in-powerpoint.md` | Claude in Microsoft 365 |
| `claude-in-chrome.md` | Claude in Chrome extension |
| `claude-mobile-ios.md` | claude.ai iOS app |
| `anthropic_reminders.md`, `sonnet-4.6-reminders.md`, `research_instructions.md`, `visualize.md` | claude.ai injected fragments (reminders, research, artifacts) |
| `Official/` | Prompts Anthropic publishes themselves (release-notes versions — shorter than the real served prompts above) |
