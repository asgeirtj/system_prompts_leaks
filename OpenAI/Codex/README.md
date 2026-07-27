# Codex — which file is which?

**The `gpt-<version>.md` files are the lean Codex system prompts** — the base instructions each model ships with in the Codex client's model cache. `codex-full.md` is a full runtime capture (everything the Codex harness sends around the lean prompt). Since GPT-5.6 the variants can differ: Sol has its own prompt while Terra and Luna share one.

| File | What it is |
|---|---|
| `gpt-5.6.md` | GPT-5.6 **Terra + Luna** system prompt (shared, byte-identical) |
| `gpt-5.6-sol.md` | GPT-5.6 **Sol** system prompt (forked from Terra/Luna, July 2026) |
| `gpt-5.5.md`, `gpt-5.4.md`, `gpt-5.4-mini.md`, `gpt-5.3-codex-spark.md` | Lean system prompt for that model |
| `codex-full.md` | Full runtime capture (lean prompt + harness additions) |
| `codex-auto-review.md` | Hidden automatic approval-review model |
| `personality_*.md` | `{{ personality }}` slot variants (friendly / pragmatic; slot removed in 5.6) |
| `plan_mode.md`, `computer-use.md`, `control-chrome.md`, `control-in-app-browser.md` | Mode-specific prompts |
| `codex-desktop-realtime-voice-agent.md` | Codex desktop realtime voice agent |
| `old/` | Superseded versions |
