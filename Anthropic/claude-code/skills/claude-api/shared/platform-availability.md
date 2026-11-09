# Platform Availability

Which features work on which provider platform. **This table is the single source of truth in this skill** - per-feature sections elsewhere point here instead of restating availability. When writing code for a third-party platform (Bedrock, Vertex, Foundry) or Claude Platform on AWS, check this table first; a feature not supported there means use the first-party Claude API surface or a different approach.

Columns: **1P** = first-party Claude API, **P-AWS** = Claude Platform on AWS (Anthropic-operated, same-day parity), **Bedrock** = Amazon Bedrock, **Vertex** = Google Cloud Vertex AI, **Foundry** = Microsoft Foundry. Yes = GA, beta = beta, No = not supported, unconfirmed = not verified either way when this was written.

**Claude Models on Google Cloud (Anthropic managed)** has no column: see the section after the table. The docs call Claude on Vertex AI "Claude Models on Google Cloud (Google managed)".

| Feature | 1P | P-AWS | Bedrock | Vertex | Foundry | Notes |
|---|---|---|---|---|---|---|
| Messages, streaming, tool use | Yes | Yes | Yes | Yes | Yes | Core API |
| PDF input | Yes | Yes | Yes | Yes | Yes | |
| Structured outputs / strict tool use | Yes | Yes | Yes | Yes | Yes | Not for Claude Fable or Claude Mythos models in a CMEK organization (`shared/tool-use-concepts.md`) |
| Adaptive thinking / effort | Yes | Yes | Yes | Yes | Yes | |
| Extended thinking | Yes | Yes | Yes | Yes | Yes | |
| Prompt caching (5m, 1h) | Yes | Yes | Yes | Yes | Yes | |
| Automatic prompt caching | Yes | Yes | Yes | Yes | Yes | The legacy Bedrock integration (Opus 4.6 and earlier) rejects top-level `cache_control` with a 400 - explicit breakpoints only there |
| Token counting | Yes | Yes | Yes | Yes | Yes | |
| Citations | Yes | Yes | Yes | Yes | Yes | |
| Search results content blocks | Yes | Yes | Yes | Yes | Yes | |
| Fine-grained tool streaming | Yes | Yes | Yes | Yes | Yes | Bedrock: the docs list `eager_input_streaming` for all models; older deployments (Opus 4.5/4.6, Sonnet 4.0/4.5, Haiku 4.5) have returned a 400 on the field |
| Compaction | beta | beta | beta | beta | beta | |
| Context editing | beta | beta | beta | beta | beta | |
| Message threads | beta | beta | No | No | beta | Beta `message-threads-2026-08-12`; server-side `fallbacks` with a thread are documented for the Claude API only |
| Context windows (1M) | Yes | Yes | Yes | Yes | Yes | |
| `inference_geo` (data residency) | Yes | Yes | No | No | No | |
| **Server-side tools** | | | | | | |
| &nbsp;&nbsp;Web search | Yes | Yes | No | Yes | Yes | Vertex: basic `web_search_20250305` only (no `_20260209` dynamic filtering). Foundry Hosted on Azure: basic `web_search_20250305` only |
| &nbsp;&nbsp;Web fetch | Yes | Yes | No | No | Yes | Foundry Hosted on Azure: basic `web_fetch_20250910` only |
| &nbsp;&nbsp;Code execution | Yes | Yes | No | No | Yes | Foundry: Hosted on Anthropic deployments only - Hosted on Azure returns a 400 |
| &nbsp;&nbsp;Tool search | Yes | Yes | Yes | Yes | Yes | Bedrock: InvokeModel API only, not Converse |
| &nbsp;&nbsp;Advisor tool | beta | beta | No | No | No | |
| **Client-implemented tools** | | | | | | |
| &nbsp;&nbsp;Bash, text editor, memory | Yes | Yes | Yes | Yes | Yes | |
| &nbsp;&nbsp;Computer use | beta | beta | beta | beta | beta | `computer_20251124` and older versions: beta on all five platforms. Claude Opus 5.5 accepts only `computer_toolset_20260801` (GA, no beta header) on the Claude API and Google Cloud, and still accepts `computer_20251124` on Amazon Bedrock (`shared/model-migration.md` -> Migrating to Claude Opus 5.5, breaking change 4). Claude Sonnet 5.5 accepts only the toolset on the Claude API and Google Cloud, but still accepts `computer_20251124` on Amazon Bedrock, and rejects `computer_20250124` everywhere (`shared/model-migration.md` -> Migrating to Claude Sonnet 5.5, breaking change 4). Claude Fable 5.2 and Claude Mythos 5.2 reject `computer_20251124` everywhere except Amazon Bedrock, and `computer_20250124` everywhere; they take the toolset wherever computer use is offered |
| **Agentic / orchestration** | | | | | | |
| &nbsp;&nbsp;Agent Skills (Messages API) | Yes | Yes | No | No | Yes | Foundry: Hosted on Anthropic deployments only - Hosted on Azure returns a 400 |
| &nbsp;&nbsp;Programmatic tool calling | Yes | Yes | No | No | Yes | Foundry: Hosted on Anthropic deployments only - Hosted on Azure returns a 400 |
| &nbsp;&nbsp;MCP connector | beta | beta | No | No | beta | |
| &nbsp;&nbsp;Managed Agents | beta | beta | No | No | No | Foundry: No (inferred; not in Foundry docs either way) |
| &nbsp;&nbsp;Self-hosted sandboxes | beta | beta | No | No | No | P-AWS: worker authenticates with IAM/SigV4 or an AWS-Console API key + `AnthropicSelfHostedEnvironmentAccess` (Console environment keys don't work there); sessions on self-hosted environments cannot attach memory stores; `GET /v1/environments/{id}/work` list endpoint not supported, other work endpoints OK |
| OpenTelemetry tracing - SDK spans | beta | beta | beta | beta | beta | Emitted in the application by the SDKs (`shared/opentelemetry.md`) |
| OpenTelemetry tracing - API spans (destinations) | beta | beta | No | No | No | Destinations are added through the Admin API or the Console (on P-AWS, through Amazon's gateway with SigV4 and IAM, or the Console); Messages API and Managed Agents (`shared/opentelemetry.md`) |
| **API endpoints** | | | | | | |
| &nbsp;&nbsp;Message Batches | Yes | Yes | No | No | No | |
| &nbsp;&nbsp;Files API | Yes | Yes | No | No | Yes | Foundry: Hosted on Anthropic deployments only - Hosted on Azure returns a 400 |
| &nbsp;&nbsp;Models API | Yes | Yes | No | No | No | |
| **Other** | | | | | | |
| &nbsp;&nbsp;Mid-conversation system messages | Yes | Yes | Yes | Yes | No | Claude Opus 5, Claude Opus 5.5, Claude Opus 4.8, Claude Fable 5, Claude Fable 5.1, Claude Fable 5.2, Claude Mythos 5, Claude Mythos 5.1, Claude Mythos 5.2, Claude Sonnet 5.5, Claude Haiku 5.5; not Claude Sonnet 5. Bedrock's InvokeModel API takes them on fewer models: no ARN-versioned models, no older Mythos models, and Claude Fable 5.2 and Claude Mythos 5.2 only where offered |
| &nbsp;&nbsp;Mid-conversation tool changes | beta | beta | beta | beta | No | Same models as mid-conversation system messages. By reference: beta `mid-conversation-tool-changes-2026-07-01`. By value or by reference, on the Claude API, Claude Platform on AWS and Claude Models on Google Cloud (Anthropic managed): beta `inline-tools-2026-09-15`. Bedrock: not through the InvokeModel API, per the docs |
| &nbsp;&nbsp;Turn-scoped (`clear_at`) system messages | beta | beta | beta | beta | No | Same models as mid-conversation system messages; beta `mid-conversation-system-clear-at-2026-08-21` (on Bedrock/Vertex pass the value as a beta) |
| &nbsp;&nbsp;Per-message `effort` (system message `output_config`) | beta | beta | beta | beta | unconfirmed | Claude Fable 5.2, Claude Mythos 5.2, Claude Fable 5.1, Claude Mythos 5.1, Claude Opus 5, Claude Opus 5.5, Claude Sonnet 5.5 and Claude Haiku 5.5 (thinking on only - a 400 with `between_tools` on the first, `disabled` on the second); beta `mid-conversation-output-config-2026-07-01`; on the Claude API and Google Cloud (Claude Fable 5.2 and Claude Mythos 5.2 where offered), open to any organization that sends the header. Claude Platform on AWS: not the Mythos models. Bedrock: Claude Fable 5.2 and Claude Mythos 5.2 (where offered), Claude Fable 5.1, Claude Mythos 5.1 and Claude Opus 5.5; through the InvokeModel API, only Claude Fable 5.2 and Claude Mythos 5.2 (where offered), Claude Fable 5.1 and Claude Opus 5.5, with the value in the request body's `anthropic_beta` array. Foundry unconfirmed |
| &nbsp;&nbsp;`thinking.display: "updates"` | beta | beta | beta | beta | beta | Claude Fable 5.2, Claude Mythos 5.2, Claude Fable 5.1, Claude Mythos 5.1, Claude Fable 5, Claude Opus 5.5, Claude Sonnet 5.5 (with adaptive thinking); beta `thinking-display-updates-2026-08-18` (pass the beta value per platform); without it `"updates"` is rejected as an unknown `display` value |
| &nbsp;&nbsp;Thinking block-binding controls | beta | beta | beta | beta | unconfirmed | `thinking.block_binding` + `input_transformations`; beta `thinking-binding-controls-2026-08-01` (the same beta name on the Claude API, Claude Platform on AWS, Bedrock, and Vertex - Bedrock: the `anthropic-beta` header on Claude in Amazon Bedrock, the `anthropic_beta` body field on InvokeModel; Vertex: the `anthropic-beta` HTTP header); Foundry unconfirmed; wherever the header is rejected, use strip-and-retry; the history-editing enforcement itself follows the rule in `shared/model-migration.md` -> Migrating to Claude Fable 5.1 from Claude Fable 5 (on Claude Fable 5.2 and Claude Mythos 5.2 it is enforced for every account) |
| &nbsp;&nbsp;Server-side `fallbacks` | beta | beta | No | No | No | `"default"` -> beta `server-side-fallback-2026-07-01`; array form -> either that or beta `server-side-fallback-2026-06-01` |
| &nbsp;&nbsp;Fast mode | Yes | No | No | unconfirmed | Yes | Claude Opus 5.5: $8 / $40, no beta flag; Foundry: hosted on Azure only, as a separate `claude-opus-5-5-fast` deployment. Claude Opus 5 / Opus 4.8: research preview on the first-party API, beta `fast-mode-2026-02-01`, $10 / $50; Opus 4.8 until 2026-11-30. Claude Fable 5.2 and Claude Mythos 5.2: SKILL.md -> Fast Mode. On Vertex and Foundry they are available only if the Fast Mode page in `shared/live-sources.md` names them, which is why the Vertex cell says unconfirmed. On Vertex, read that page before adding or removing `speed`. Fast mode on the Opus models isn't available on Vertex |
| &nbsp;&nbsp;Cache diagnostics | beta | No | No | No | No | First-party API only |
| &nbsp;&nbsp;Task budgets | beta | beta | No | beta | beta | Beta header `task-budgets-2026-03-13` |

## Claude Models on Google Cloud (Anthropic managed)

Anthropic operates this platform. The **Vertex** column and every "Google Cloud" in the Notes mean Google's Vertex AI, not this platform. Read availability from the **1P** column, except for the features below. Client setup: `shared/google-cloud-anthropic-managed.md`.

Before relying on a feature marked unconfirmed, check its page in `shared/live-sources.md`. If it has no page there, or the page doesn't name this platform, tell the user it's unconfirmed and test it before relying on it.

| Feature | Status here |
|---|---|
| OpenTelemetry tracing - API spans (destinations) | No |
| Fast mode | Yes on Claude Opus 5.5: set `speed: "fast"` on a plain Messages request, without the `fast-mode-2026-02-01` beta flag. Claude Opus 5 and Opus 4.8 are Claude API and Managed Agents only. Claude Fable 5.2 and Claude Mythos 5.2: read the Fast Mode page in `shared/live-sources.md` before adding or removing `speed`. Other models are unconfirmed; Claude Opus 4.6 with `speed: "fast"` returns a 400 here |
| Cache diagnostics | unconfirmed |
| Task budgets | unconfirmed: the docs don't name this platform |
| Thinking block-binding controls | unconfirmed |
| Per-message `effort` (system message `output_config`) | beta on Claude Fable 5.2, Claude Fable 5.1, Claude Opus 5.5, Claude Opus 5, Claude Sonnet 5.5 and Claude Haiku 5.5; unconfirmed for Claude Mythos 5.2, which the effort page doesn't list here |
| Managed Agents webhooks | unconfirmed |
| MCP tunnels | No |
| Computer use | beta; which tool versions it accepts is unconfirmed, except that Claude Fable 5.2 and Claude Mythos 5.2 reject `computer_20251124` here, as they do everywhere but Amazon Bedrock |
| Self-hosted sandboxes | beta; write your own worker against the Environments Work endpoints, because `ant beta:worker` and the SDK worker helpers aren't supported. It authenticates with Google Cloud credentials, not an environment key, and its sessions can't use memory stores |
| Server-side `fallbacks` | beta, including the `"default"` form on Claude Sonnet 5.5. If the API rejects the field, drop it and use the SDK's `BetaRefusalFallbackMiddleware` (`shared/model-migration.md`) |
| Fine-grained tool streaming | Yes - if `eager_input_streaming` returns a 400, leave it off |
| `inference_geo` (data residency) | Yes - `"global"` by default; for US-only inference, set `"us"` on each request (1.1x price). The workspace's geo settings are read-only |
| User profiles | unconfirmed. SDK clients released through 2026-10-21 send these calls to a workspace route that returns 404 for most organizations; Ruby raises `NotImplementedError`, and Go's Google Cloud client has no top-level `UserProfiles`, only `client.Beta.UserProfiles`. Upgrade to the latest SDK and test before relying on it |

