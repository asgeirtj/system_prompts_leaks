# System Prompts Leaks

Extracted system prompts and developer instructions from production AI chatbots and coding assistants.

## Why This Exists

Understanding how AI models are instructed helps developers build better integrations, debug unexpected behavior, and learn prompt engineering patterns from production systems. This collection preserves raw system prompts from ChatGPT, Claude, Gemini, Grok, Perplexity, and other AI products as a reference archive.

> **Fork note:** iAiFy enterprise fork of [asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks). Local changes live on `main`; upstream sync managed via [Ai-road-4-You/fork-sync](https://github.com/Ai-road-4-You/fork-sync).

## Status

| Field | Value |
|-------|-------|
| Type | Content archive (markdown only — no application code) |
| Stability | Actively updated with new models and versions |
| License | TBD — see [backlog](https://github.com/AiFeatures/system_prompts_leaks/issues) |

## Quick Start

```sh
# Clone and browse
git clone https://github.com/AiFeatures/system_prompts_leaks.git
cd system_prompts_leaks

# Search across all prompts
grep -ri "function_call" Anthropic/ OpenAI/ Google/
```

Each `.md` file contains the raw, unedited system prompt for one model or tool.

## Directory Structure

```
Anthropic/       # Claude (Opus, Sonnet, Code, Desktop, etc.)
Google/          # Gemini (Pro, Flash, CLI, Workspace, etc.)
OpenAI/          # ChatGPT, GPT, o-series, Codex
Perplexity/      # Perplexity assistants
xAI/             # Grok models
Misc/            # Other products (Copilot, Notion AI, Kagi, etc.)
```

---

## Prompt Catalog

### Anthropic — Claude

| Model | Prompt |
|-------|--------|
| **Claude Opus 4.6** | [**System prompt**](Anthropic/claude-opus-4.6.md) |
| **Claude Sonnet 4.6** | [**System prompt**](Anthropic/claude-sonnet-4.6.md) |
| Claude.ai | [Human-readable](Anthropic/claude.ai-human-readable.md) · [Injections](Anthropic/claude.ai-injections.md) |
| Claude Code | [System prompt](Anthropic/claude-code.md) |
| Claude Cowork | [System prompt](Anthropic/claude-cowork.md) |
| Claude Desktop Code | [System prompt](Anthropic/claude-desktop-code.md) |
| Claude in Chrome | [System prompt](Anthropic/claude-in-chrome.md) |
| Claude for Excel | [System prompt](Anthropic/claude-for-excel.md) |
| Default Styles | [Styles](Anthropic/default-styles.md) |

<details><summary>Older & variant versions</summary>

| | |
|--|--|
| Without tools | [Opus 4.6](Anthropic/claude-opus-4.6-no-tools.md) · [Sonnet 4.6](Anthropic/claude-sonnet-4.6-no-tools.md) |
| Opus 4.5 | [System prompt](Anthropic/old/claude-opus-4.5.md) |
| Sonnet 4.5 | [System prompt](Anthropic/old/claude-4.5-sonnet.md) |
| Sonnet 4 | [System prompt](Anthropic/old/claude-sonnet-4.md) |
| Opus 4.1 Thinking | [System prompt](Anthropic/old/claude-4.1-opus-thinking.md) |
| Sonnet 3.7 | [System prompt](Anthropic/old/claude-3.7-sonnet.md) |

</details>

## OpenAI — ChatGPT

| Model | Prompt |
|-------|--------|
| **GPT-5.4** | [**API**](OpenAI/gpt-5.4-api.md) · [**Thinking**](OpenAI/gpt-5.4-thinking.md) |
| **GPT-5.3** | [**Codex**](OpenAI/gpt-5.3-codex.md) · [Codex API](OpenAI/gpt-5.3-codex-api.md) · [Chat API](OpenAI/gpt-5.3-chat-api.md) · [Instant](OpenAI/gpt-5.3-instant.md) |
| GPT-5.2 | [Mini (free)](OpenAI/gpt-5.2-mini-free-account.md) · [Thinking](OpenAI/gpt-5.2-thinking.md) |
| Codex CLI | [System prompt](OpenAI/codex-cli.md) |
| o4-mini | [System prompt](OpenAI/o4-mini.md) · [High](OpenAI/o4-mini-high.md) |
| o3 | [System prompt](OpenAI/o3.md) |
| ChatGPT Atlas | [System prompt](OpenAI/chatgpt-atlas.md) |
| **Tools** | [Web search](OpenAI/tool-web-search.md) · [Deep research](OpenAI/tool-deep-research.md) · [Python](OpenAI/tool-python.md) · [Canvas](OpenAI/tool-canvas-canmore.md) · [Image gen](OpenAI/tool-create-image-image_gen.md) · [Memory](OpenAI/tool-memory-bio.md) · [File search](OpenAI/tool-file_search.md) |
| **Policies** | [Image safety](OpenAI/prompt-image-safety-policies.md) · [Automation context](OpenAI/prompt-automation-context.md) |

<details><summary>Older models & variants</summary>

| | |
|--|--|
| GPT-5.1 personalities | [Default](OpenAI/gpt-5.1-default.md) · [Friendly](OpenAI/gpt-5.1-friendly.md) · [Professional](OpenAI/gpt-5.1-professional.md) · [Candid](OpenAI/gpt-5.1-candid.md) · [Cynical](OpenAI/gpt-5.1-cynical.md) · [Efficient](OpenAI/gpt-5.1-efficient.md) · [Nerdy](OpenAI/gpt-5.1-nerdy.md) · [Quirky](OpenAI/gpt-5.1-quirky.md) |
| GPT-5 | [Agent mode](OpenAI/ChatGPT-GPT-5-Agent-mode-System-Prompt.md) · [Thinking](OpenAI/gpt-5-thinking.md) · [Personalities](OpenAI/gpt-5-cynic-personality.md) |
| GPT-4.5 | [System prompt](OpenAI/GPT-4.5.md) |
| GPT-4.1 | [Full](OpenAI/GPT-4.1.md) · [Mini](OpenAI/GPT-4.1-mini.md) |
| GPT-4o | [System prompt](OpenAI/GPT-4o.md) · [WhatsApp](OpenAI/GPT-4o-WhatsApp.md) · [Advanced voice](OpenAI/GPT-4o-advanced-voice-mode.md) · [Legacy voice](OpenAI/GPT-4o-legacy-voice-mode.md) |
| Monday GPT | [System prompt](OpenAI/Monday-GPT-.md) |
| API variants | [GPT-5 reasoning (high)](OpenAI/API/gpt-5-reasoning-effort-high-API-NOT-CHATGPT.com.md) · [o3 high/med/low](OpenAI/API/o3-high-api.md) · [o4-mini high/med/low](OpenAI/API/o4-mini-high.md) |

</details>

## Google — Gemini

| Model | Prompt |
|-------|--------|
| **Gemini 3.1 Pro** | [**System prompt**](Google/gemini-3.1-pro.md) · [API](Google/gemini-3.1-pro-api.md) |
| **Gemini 3 Flash** | [**System prompt**](Google/gemini-3-flash.md) |
| Gemini 3 Pro | [System prompt](Google/gemini-3-pro.md) |
| Gemini Diffusion | [System prompt](Google/gemini-diffusion.md) |
| Gemini CLI | [System prompt](Google/Gemini%20CLI%20System.md) |
| Jules | [System prompt](Google/jules.md) |
| Gemini in Chrome | [System prompt](Google/gemini_in_chrome.md) |
| Gemini Workspace | [System prompt](Google/gemini-workspace.md) |

<details><summary>Older models</summary>

| | |
|--|--|
| Gemini 2.5 Pro | [API](Google/gemini-2.5-pro-api.md) · [Webapp](Google/gemini-2.5-pro-webapp.md) · [Guided learning](Google/gemini-2.5-pro-guided-learning.md) |
| Gemini 2.5 Flash | [Image preview](Google/gemini-2.5-flash-image-preview.md) |
| Gemini 2.0 Flash | [Webapp](Google/gemini-2.0-flash-webapp.md) |
| AI Studio Build | [System prompt](Google/ai-studio-build.md) |
| Nano / Bana 2 | [System prompt](Google/nano-bana-2.md) |
| NotebookLM | [Chat](Google/NotebookLM-chat.md) |

</details>

## xAI — Grok

| Model | Prompt |
|-------|--------|
| Grok 4.2 | [System prompt](xAI/grok-4.2.md) |
| Grok 4 | [System prompt](xAI/grok-4.md) · [API](xAI/grok-api.md) |
| Grok 4.1 Beta | [System prompt](xAI/grok-4.1-beta.md) |
| Grok 3 | [System prompt](xAI/grok-3.md) |
| Grok Account | [System prompt](xAI/grok-account.md) |
| Grok Personas | [Personas](xAI/grok-personas.md) |
| Safety Instructions | [Post-new](xAI/grok.com-post-new-safety-instructions.md) |

## Perplexity

| Model | Prompt |
|-------|--------|
| Comet Browser | [System prompt](Perplexity/comet-browser-assistant.md) |
| Voice Assistant | [System prompt](Perplexity/voice-assistant.md) |

## Misc

| Product | Prompt |
|---------|--------|
| GitHub Copilot (Word) | [System prompt](Misc/copilot-in-microsoft-word.md) |
| Notion AI | [System prompt](Misc/Notion%20AI.md) |
| Kagi Assistant | [System prompt](Misc/Kagi%20Assistant.md) |
| Le Chat (Mistral) | [System prompt](Misc/Le-Chat.md) |
| Raycast AI | [System prompt](Misc/Raycast-AI.md) |
| Warp 2.0 Agent | [System prompt](Misc/Warp-2.0-agent.md) |
| t3.chat | [System prompt](Misc/t3.chat.md) |
| Confer | [System prompt](Misc/Confer.md) |
| Fellou Browser | [System prompt](Misc/Fellou-browser.md) |
| Hermes | [System prompt](Misc/hermes.md) |
| MiniMax M2.5 | [System prompt](Misc/minimax-m2.5.md) |
| Proton Lumo AI | [System prompt](Misc/proton-lumo-ai.md) |
| Sesame AI Maya | [System prompt](Misc/Sesame-AI-Maya.md) |

---

## Development

This is a content-only repository — no application code, build system, or test suite.

- **Linting:** Markdown lint CI is planned but not yet configured
- **Link validation:** Internal link checks are planned for PR CI

To check for broken links locally:

```sh
# Requires: npm install -g markdown-link-check
markdown-link-check README.md
```

## Deployment

Content is served directly from GitHub. No build or deployment step is required.

When CI is added it will use enterprise reusable workflows:

- Lint: `Ai-road-4-You/enterprise-ci-cd/.github/workflows/ci-markdown.yml@v1`
- Release: `Ai-road-4-You/enterprise-ci-cd/.github/workflows/release.yml@v1`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add or update prompts.
For governance and review policies, see [Ai-road-4-You/governance](https://github.com/Ai-road-4-You/governance).

## License

TBD — a license file has not yet been added to this repository.
