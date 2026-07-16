# Slash-command prompts

The model-facing prompts behind Claude Code's built-in slash commands — the ones a user
invokes by typing `/name`. These are distinct from bundled skills (see `../bundled-skills/`):
they register as `type:"prompt"` or `type:"local"` commands, not as skills.

| File | Command | What it does |
|---|---|---|
| `btw.md` | `/btw` | spawns a lightweight side-question agent that answers without interrupting the main thread |
| `compact.md` | `/compact` | summarizes the conversation to free context |
| `compact-continuation-message.md` | — | the message injected into the continued session after a compaction |
| `compact-rewind-summarization.md` | — | the summarization prompt used for rewind/auto-compaction |
| `recap.md` | `/recap` | the one-line "you stepped away" recap (shared with the auto away-summary) |
| `insights.md` | `/insights` | generates a session-analysis report |
| `team-onboarding.md` | `/team-onboarding` | builds a teammate onboarding guide from usage data |
| `session-title.md` | `/rename` | auto-generates a session title (also used for automatic naming) |

Captured verbatim from the Claude Code 2.1.211 binary. Runtime data slots are shown with
their real semantic names (e.g. `${question}`, `${insightsJson}`).
