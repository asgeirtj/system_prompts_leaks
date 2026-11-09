# Claude Model Catalog

**Only use exact model IDs listed in this file.** Never guess or construct model IDs - incorrect IDs will cause API errors. Use aliases wherever available. For the latest information, fetch the Models Overview URL in `shared/live-sources.md`, or query the Models API directly (see Programmatic Model Discovery below).

## Programmatic Model Discovery

For **live** capability data - context window, max output tokens, feature support (thinking, vision, effort, structured outputs, etc.) - query the Models API instead of relying on the cached tables below. Use this when the user asks "what's the context window for X", "does model X support vision/thinking/effort", "which models support feature Y", or wants to select a model by capability at runtime.

```python
m = client.models.retrieve("claude-opus-4-8")
m.id                 # "claude-opus-4-8"
m.display_name       # "Claude Opus 4.8"
m.max_input_tokens   # context window (int)
m.max_tokens         # max output tokens (int)

# capabilities is an untyped nested dict - bracket access, check ["supported"] at the leaf
caps = m.capabilities
caps["image_input"]["supported"]                       # vision
caps["thinking"]["types"]["adaptive"]["supported"]     # adaptive thinking
caps["effort"]["max"]["supported"]                     # effort: max (also low/medium/high)
caps["structured_outputs"]["supported"]
caps["context_management"]["compact_20260112"]["supported"]

# filter across all models - iterate the page object directly (auto-paginates); do NOT use .data
[m for m in client.models.list()
 if m.capabilities["thinking"]["types"]["adaptive"]["supported"]
 and m.max_input_tokens >= 200_000]
```

Top-level fields (`id`, `display_name`, `max_input_tokens`, `max_tokens`) are typed attributes. `capabilities` is a dict - use bracket access, not attribute access. The API returns the full capability tree for every model with `supported: true/false` at each leaf, so bracket chains are safe without `.get()` guards. TypeScript SDK: same method names, also auto-paginates on iteration.

### Raw HTTP

```bash
curl https://api.anthropic.com/v1/models/claude-opus-4-8 \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2026-10-21"
```

```yaml
{
  "id": "claude-opus-4-8",
  "display_name": "Claude Opus 4.8",
  "max_input_tokens": 1000000,
  "max_tokens": 128000,
  "capabilities": {
    "image_input": {"supported": true},
    "structured_outputs": {"supported": true},
    "thinking": {"supported": true, "types": {"enabled": {"supported": false}, "adaptive": {"supported": true}}},
    "effort": {"supported": true, "low": {"supported": true}, ..., "max": {"supported": true}},
    ...
  }
}
```

## Current Models (recommended)

| Friendly Name     | Alias (use this)    | Full ID                       | Context        | Max Output | Status |
|-------------------|---------------------|-------------------------------|----------------|------------|--------|
| Claude Fable 5.2    | `claude-fable-5-2`      | -                             | 1M             | 128K       | Active |
| Claude Mythos 5.2   | `claude-mythos-5-2`     | -                             | 1M             | 128K       | Active (verified organizations only) |
| Claude Fable 5.1    | `claude-fable-5-1`      | -                             | 1M             | 128K       | Active |
| Claude Mythos 5.1   | `claude-mythos-5-1`     | -                             | 1M             | 128K       | Active (verified organizations only) |
| Claude Fable 5 | `claude-fable-5` | -                             | 1M             | 128K       | Active |
| Claude Mythos 5 | `claude-mythos-5` | -                          | 1M             | 128K       | Active (verified organizations only) |
| Claude Opus 5.5 | `claude-opus-5-5` | -                             | 1M             | 128K       | Active |
| Claude Opus 5     | `claude-opus-5`       | -                             | 1M             | 128K       | Active |
| Claude Opus 4.8   | `claude-opus-4-8`   | -                             | 1M             | 128K       | Active |
| Claude Opus 4.7   | `claude-opus-4-7`   | -                             | 1M             | 128K       | Active |
| Claude Opus 4.6   | `claude-opus-4-6`   | -                             | 1M             | 128K       | Active |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | -                     | 1M             | 128K       | Active |
| Claude Sonnet 5 | `claude-sonnet-5` | -                         | 1M             | 128K       | Active |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | -                             | 1M             | 128K       | Active |
| Claude Haiku 5.5 | `claude-haiku-5-5` | -                             | 1M             | 128K       | Active |
| Claude Haiku 4.5  | `claude-haiku-4-5`  | `claude-haiku-4-5-20251001`   | 200K           | 64K        | Active |

### Model Descriptions
- **Claude Fable 5.2** - Anthropic's most capable model open to all customers, for demanding reasoning and long-horizon agentic work; the current Fable. Successor to Claude Fable 5.1 at a lower price ($8 / $40 per MTok; cache reads $0.20/MTok - 0.025x; 5-minute cache writes $10, 1-hour $16; batch $4 / $20). Same API surface as Claude Fable 5.1 (thinking always on, default effort `high`, no prefill, no sampling params, forced `tool_choice` 400s, `refusal` stop reason, 512-token cache minimum, same tokenizer, 1M context, 128K max output) with four breaking changes: the history-editing check is enforced for **every** account; no model released earlier reads its thinking blocks, Claude Fable 5.1 included (it reads theirs); the earlier `computer_20251124` computer use tool returns a 400 on every platform except Amazon Bedrock (use `computer_toolset_20260801`); and with the advisor tool a Claude Fable 5.2 executor accepts only `claude-fable-5-2` or `claude-mythos-5-2` as its advisor. Thinking blocks work only in the account that produced them or one linked to it. Structured outputs are not available in a CMEK organization. Covered Model: 30-day retention required - ZDR orgs get `400 invalid_request_error`. No Priority Tier; fast mode: SKILL.md -> Fast Mode; its own rate limit, separate from the one Claude Fable 5.1 and Claude Fable 5 share. For most workloads start with Claude Opus 5.5 and move here when evals at higher effort still fall short. See `shared/model-migration.md` -> Migrating to Claude Fable 5.2.
- **Claude Mythos 5.2** - The same model as Claude Fable 5.2 (same capabilities, limits, per-token pricing and API behavior, the every-account history-editing check included), available only to organizations verified through Anthropic's verification programs, such as the Cyber Verification Program. Available on the Claude API and Claude Models on Google Cloud (Anthropic managed); confirm other platforms on its docs page (the docs don't list it for Claude Platform on AWS). Shares one combined rate limit with Claude Mythos 5.1 and Claude Mythos 5. Use it only when the org has that access; otherwise use `claude-fable-5-2`.
- **Claude Fable 5.1** - The previous Fable, still served and selectable by id; prefer `claude-fable-5-2` for new work. Successor to Claude Fable 5 in the same tier at the same per-token price ($10/$50 per MTok; cache reads $0.25/MTok - 0.025x, a quarter of Claude Fable 5's; batch $5/$25); stronger long-running agentic coding, knowledge work with documents/spreadsheets/slides, multistep research, vision, long-context retrieval, and computer use. Same API surface as Claude Fable 5 (thinking always on, no prefill, no sampling params, `refusal` stop reason, 512-token cache minimum) with three breaking changes: forced tool use (`tool_choice` `any` / `tool`) returns a 400; thinking blocks are bound to the producing model (only Claude Mythos 5.1 (and the later Claude Fable 5.2 and Claude Mythos 5.2) can read them - other models drop them); and editing earlier turns invalidates thinking blocks ("preserved thinking"; new accounts created on/after 2026-08-31 get a 400 on edited history on every platform, and enforcement scope is decided per model; the opt-in controls beta is on the Claude API, Claude Platform on AWS, Bedrock, and Vertex - Foundry unconfirmed, `shared/platform-availability.md`). Adds per-message `effort`, turn-scoped `clear_at` system messages, `thinking.display: "updates"` progress updates, and content provenance. Same tokenizer as Claude Fable 5; 1M context (default), 128K max output. Covered Model: 30-day retention required (ZDR only if expressly authorized by Anthropic) - ZDR orgs get `400 invalid_request_error`, as on Claude Fable 5. No Priority Tier; shares a rate-limit pool with Claude Fable 5. See `shared/model-migration.md` -> Migrating to Claude Fable 5.1 from Claude Fable 5.
- **Claude Fable 5** / **Claude Mythos 5** (`claude-fable-5` / `claude-mythos-5`) - an earlier Fable / Mythos release: same tier, limits and per-token pricing as Claude Fable 5.1, except cache reads at $1/MTok rather than $0.25; Claude Fable 5.1 adds three breaking API changes over them (see above). Still served and selectable by id. Claude Mythos 5 ran no safety classifiers, so `stop_reason: "refusal"` does not occur on it. Prefer `claude-fable-5-2` for new work.
- **Claude Mythos 5.1** - The previous Mythos: the same model as Claude Fable 5.1 (same capabilities, limits, per-token pricing, API behavior - except that the API enforces its history-editing check by default whatever the account's age on the Claude API, Vertex and Foundry; on Amazon Bedrock, not by default), offered only to verified organizations; successor to Claude Mythos 5 (which itself succeeded the invitation-only `claude-mythos-preview`). Unlike Claude Mythos 5 it runs safeguards that depend on the access program, so handle `stop_reason: "refusal"`. Not offered on Claude Platform on AWS. Prefer `claude-mythos-5-2` for new work where the org has access; otherwise use `claude-fable-5-2`.
- **Claude Opus 5.5** - Successor to Claude Opus 5 in the Opus line for long-running agentic coding and knowledge work, at a lower price ($4 / $20 per MTok; cache reads $0.20). Same 1M context, 128K output, tokenizer, and feature set as Claude Opus 5, with four breaking changes: thinking can't be disabled (effort is the only control, default `medium`), forced `tool_choice` 400s, thinking blocks are tied to the model and the conversation, and computer use needs the `computer_toolset_20260801` toolset. Broader safety classifiers (`bio` joins `cyber` and `reasoning_extraction`). The current Opus and the default model; see `shared/model-migration.md` -> Migrating to Claude Opus 5.5.
- **Claude Opus 5** - For complex agentic coding and enterprise work; a step-change over Claude Opus 4.8, strongest on deep reasoning, agentic and long-horizon work, and test-time compute scaling, at half the cost of Claude Fable 5.1 (the Fable models remain the highest-capability tier). Safety classifiers can return `stop_reason: "refusal"` - handle it before reading `content`. A drop-in upgrade at Opus 4.8's pricing ($5/$25 per MTok) with the same feature set. Thinking is on by default (omitting `thinking` runs adaptive; `{type: "adaptive"}` is equivalent), and `thinking: {type: "disabled"}` is available only at effort `high` or lower - pairing it with `xhigh`/`max` returns a 400. Raw thinking tokens are never returned. Full effort ladder through `max`; 512-token prompt-cache minimum (down from 1024 on Opus 4.8); fast mode on the Claude API only. Elevated cybersecurity safeguards. Separate rate-limit bucket from the combined Opus 4.x pool. 1M context window (default and maximum), 128K max output. See `shared/model-migration.md` -> Migrating to Claude Opus 5.
- **Claude Opus 4.8** - The most capable model in the Opus 4 series - highly autonomous, state-of-the-art on long-horizon agentic work, knowledge work, and memory; clearer, warmer writing. Same API surface as Opus 4.7 (adaptive thinking only; sampling parameters and `budget_tokens` removed). 1M context window at standard API pricing (no long-context premium). See `shared/model-migration.md` -> Migrating to Opus 4.8 - a 4.7 -> 4.8 move is a model-ID swap plus prompt re-tuning, no new breaking changes.
- **Claude Opus 4.7** - Previous-generation Opus. Highly autonomous; strong on long-horizon agentic work, knowledge work, vision, and memory. Adaptive thinking only; sampling parameters and `budget_tokens` removed. 1M context window. See `shared/model-migration.md` -> Migrating to Opus 4.7.
- **Claude Opus 4.6** - Older Opus. Supports adaptive thinking (recommended), 128K max output tokens (requires streaming for large outputs). 1M context window.
- **Claude Sonnet 5** - The previous Sonnet; near-Opus quality on coding and agentic work. Adaptive thinking on by default (omitting `thinking` runs adaptive); manual `budget_tokens` removed; non-default sampling parameters rejected (on API version `2026-10-21`, any value is rejected). `effort` supports `low`/`medium`/`high`/`xhigh`/`max`. New tokenizer (~30% more tokens for the same text vs Sonnet 4.6). High-resolution vision (2576px). 1M context window, 128K max output. See `shared/model-migration.md` -> Migrating to Claude Sonnet 5.
- **Claude Sonnet 5.5** - Successor to Claude Sonnet 5 in the Sonnet line, at the same prices ($2 / $10 per MTok), except cache reads at $0.10. Same tokenizer as Claude Sonnet 5; 1M context, 128K max output. Adaptive thinking on by default; effort default `high`, with recalibrated levels. Five breaking changes: `thinking: {type: "disabled"}` returns a 400 (send `{type: "between_tools"}` at effort `high` or below to turn thinking off), forced `tool_choice` 400s, thinking blocks are tied to the model and the conversation, computer use on the Claude API and Google Cloud needs the `computer_toolset_20260801` toolset, and the advisor tool rejects Claude Opus 4.8, Claude Opus 4.7, and Claude Sonnet 5 advisors. See `shared/model-migration.md` -> Migrating to Claude Sonnet 5.5.
- **Claude Sonnet 4.6** - Previous-generation Sonnet. Supports adaptive thinking (recommended). 1M context window. 128K max output tokens.
- **Claude Haiku 5.5** - The current Haiku and the default when the user asks for Haiku: the fast, low-cost model for high-volume, latency-sensitive work such as classification, routing, extraction, and sub-agent tasks. Successor to Claude Haiku 4.5 with a 1M context window and 128K max output, at $0.10 / $0.50 per MTok when the prompt is 100K tokens or fewer and $0.50 / $2.50 above that. Adaptive thinking only, on by default (`{type: "disabled"}` is accepted at effort `high` or below); `effort` from `low` through `max`, default `medium`. Breaking for code written for Claude Haiku 4.5: `budget_tokens`, non-default sampling parameters (on API version `2026-10-21`, any value is rejected), and assistant prefill return a 400, on the Claude API and Google Cloud computer use needs the `computer_toolset_20260801` toolset, and editing earlier turns invalidates replayed thinking blocks (preserved thinking). Thinking text is omitted by default (`display: "summarized"` to see summaries). A newer tokenizer counts the same text as about 30% more tokens. Safety classifiers can return `stop_reason: "refusal"`, and there is no server-side fallback for this model. See `shared/model-migration.md` -> Migrating to Claude Haiku 5.5.
- **Claude Haiku 4.5** - Previous-generation Haiku, still served. 200K context window, 64K max output, manual extended thinking with `budget_tokens`, no `effort` parameter.

## Legacy Models (still active)

Statuses and dates in this table and the ones below are for the Claude API, Claude Platform on AWS, Claude Models on Google Cloud (Anthropic managed) and Microsoft Foundry; Amazon Bedrock and Claude Models on Google Cloud (Google managed) set their own schedules.

| Friendly Name     | Alias (use this)    | Full ID                       | Status |
|-------------------|---------------------|-------------------------------|--------|
| Claude Opus 4.5   | `claude-opus-4-5`   | `claude-opus-4-5-20251101`    | Active |

## Deprecated Models (retiring soon)

| Friendly Name     | Alias (use this)    | Full ID                       | Status     | Retires      |
|-------------------|---------------------|-------------------------------|------------|--------------|
| Claude Sonnet 4.5 | `claude-sonnet-4-5` | `claude-sonnet-4-5-20250929`  | Deprecated | Nov 30, 2026 |
| Claude Mythos Preview | -               | `claude-mythos-preview`       | Deprecated | TBA          |

## Retired Models (no longer available)

| Friendly Name     | Full ID                       | Retired     |
|-------------------|-------------------------------|-------------|
| Claude Opus 4.1   | `claude-opus-4-1-20250805`    | Aug 5, 2026 |
| Claude Sonnet 4   | `claude-sonnet-4-20250514`    | Jun 15, 2026 |
| Claude Opus 4     | `claude-opus-4-20250514`      | Jun 15, 2026 |
| Claude Haiku 3    | `claude-3-haiku-20240307`     | Apr 20, 2026 |
| Claude Sonnet 3.7 | `claude-3-7-sonnet-20250219`  | Feb 19, 2026 |
| Claude Haiku 3.5  | `claude-3-5-haiku-20241022`   | Feb 19, 2026 |
| Claude Opus 3     | `claude-3-opus-20240229`      | Jan 5, 2026 |
| Claude Sonnet 3.5 | `claude-3-5-sonnet-20241022`  | Oct 28, 2025 |
| Claude Sonnet 3.5 | `claude-3-5-sonnet-20240620`  | Oct 28, 2025 |
| Claude Sonnet 3   | `claude-3-sonnet-20240229`    | Jul 21, 2025 |
| Claude 2.1        | `claude-2.1`                  | Jul 21, 2025 |
| Claude 2.0        | `claude-2.0`                  | Jul 21, 2025 |

## Resolving User Requests

When a user asks for a model by name, use this table to find the correct model ID:

| User says...                              | Use this model ID              |
|-------------------------------------------|--------------------------------|
| "fable", "fable 5.2", "most capable model" | `claude-fable-5-2`                 |
| "most powerful"                           | `claude-fable-5-2`                 |
| "mythos", "mythos 5.2"                    | `claude-mythos-5-2` (verified organizations only; otherwise use `claude-fable-5-2`) |
| "fable 5.1", "mythos 5.1" (previous version) | `claude-fable-5-1` / `claude-mythos-5-1` (still served; prefer `claude-fable-5-2` / `claude-mythos-5-2` for new work) |
| "fable 5", "mythos 5" (older version) | `claude-fable-5` / `claude-mythos-5` (still served; prefer `claude-fable-5-2` for new work) |
| "mythos preview"                          | `claude-mythos-5-2` (successor to `claude-mythos-preview` - see migration guide) |
| "opus"                                    | `claude-opus-5-5`                   |
| "opus 5"                                  | `claude-opus-5`             |
| "opus 5.5"                                | `claude-opus-5-5` |
| "opus 4.8"                                | `claude-opus-4-8`              |
| "opus 4.7"                                | `claude-opus-4-7`              |
| "opus 4.6"                                | `claude-opus-4-6`              |
| "opus 4.5"                                | `claude-opus-4-5`              |
| "opus 4.1"                                | Retired - suggest `claude-opus-5-5` |
| "opus 4", "opus 4.0"                      | Retired - suggest `claude-opus-5-5` |
| "sonnet", "balanced"                      | `claude-sonnet-5-5`           |
| "sonnet 5"                                | `claude-sonnet-5`           |
| "sonnet 5.5"                              | `claude-sonnet-5-5` |
| "cheapest sonnet", "newest sonnet", "latest sonnet" (any attribute phrasing) | `claude-sonnet-5-5` |
| "sonnet 4.6"                              | `claude-sonnet-4-6`            |
| "sonnet 4.5"                              | `claude-sonnet-4-5` (deprecated, retires 2026-11-30 - suggest `claude-sonnet-5-5`) |
| "sonnet 4", "sonnet 4.0"                  | Retired - suggest `claude-sonnet-5-5` |
| "sonnet 3.7"                              | Retired - suggest `claude-sonnet-5-5` |
| "sonnet 3.5"                              | Retired - suggest `claude-sonnet-5-5` |
| "haiku", "fast", "cheap"                  | `claude-haiku-5-5`             |
| "haiku 5.5"                               | `claude-haiku-5-5` |
| "newest haiku", "latest haiku" (any attribute phrasing) | `claude-haiku-5-5` |
| "haiku 4.5"                               | `claude-haiku-4-5`             |
| "haiku 3.5"                               | Retired - suggest `claude-haiku-5-5` |
| "haiku 3"                                 | Retired - suggest `claude-haiku-5-5` |
