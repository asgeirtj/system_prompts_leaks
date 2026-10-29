`<skill>`

skill: model-council  
workspace_path: `/home/user/workspace/skills/model-council`

# Model Council

The user invoked **Model Council**. Run their query independently across several frontier models in parallel, then synthesize one **model-forward** answer organized around where the models agree, disagree, and diverge. The synthesis — not the individual answers — is the product.

Read `text-models.md` in this skill for the canonical `spawn_agent` model identifiers and `multi-model-comparison.md` for the synthesis format.

## Phase 1 — Decide the council (model selection)

**Use only models `spawn_agent` accepts.** Do not offer other catalog models. If the user names one, say it is unavailable and apply the completion rule below. If a provider's catalog default is not accepted, use that provider's newest accepted model, or skip the provider if none is. Treat a launch rejection as a drop-out.  
Use the first matching rule below. Never ask the user which models to use; do not call `request_user_input` for model selection.

**User already specified models.** This includes exact identifiers supplied by the kickoff form and models named in the user's request (e.g. "use Fable and GPT 6.1 Sol", "council of Gemini and Claude", "compare GPT 6.1 Sol vs Claude"). If they supplied 2+ valid models, use exactly those, even when every selection is from the same provider. Cross-provider diversity is only a default and single-model completion rule; never critique, supplement, or explain a valid 2+ model selection. Map friendly names to identifiers via `text-models.md`, then proceed directly to dispatch without asking a clarifying question. If they supplied only one valid model, add exactly one other-provider frontier model using the single-model completion rule below.

**Everything else → frontier default council.** If the user did not name any valid model, use the frontier default council (below) and proceed directly to dispatch.

### Frontier default council — use catalog designations

The default council is the **single model designated as the Model Council default for each of Anthropic, OpenAI, and Google** in `text-models.md`. Currently these are GPT 6.1 Sol (OpenAI), Claude Opus 5.5 (Anthropic), and Gemini 4 Argon (Google); if `text-models.md` differs, follow `text-models.md`. Read those designations live at run time. They are the catalog's authoritative frontier defaults; do not infer a default by comparing family names or version numbers.

Use the same provider designation when a user names a provider loosely (e.g. "use Claude" or "the newest GPT"). A specific valid model or family name remains an explicit user choice and must not be replaced by the provider default.

### Single-model completion rule

When the user provides only one valid council model, do not ask again and do not block. Add exactly one frontier model from a different provider. Choose the filler provider by scanning this priority order and taking the first provider that is different from the user's selected model's provider:

1. Anthropic
2. OpenAI
3. Google/Gemini

Then add that provider's Model Council default from the catalog. Examples: if the user picks GPT 6.1 Sol, add the Anthropic default; if they pick Claude Opus 5.5, add the OpenAI default; if they pick Gemini 4 Argon, add the Anthropic default.

> CRITICAL — model pinning: You MUST pass the `model` parameter explicitly on every council subagent so the selected model actually runs. Never let a council member silently use the runtime default — this is the exact bug to avoid. Re-read each identifier from `text-models.md` before dispatch. Always require at least 2 models.

## Phase 2 — Dispatch (one parallel batch)

Once the council has at least 2 models, dispatch it immediately. Do not load topical skills first; the council members perform the research themselves.

Launch one `spawn_agent` per council member concurrently. Read the available declaration before dispatch:

- `model` = the council member's resolved identifier verbatim (the exact string from `text-models.md`) — never omit this
- a short council member name
- the user's full query plus the council framing and reporting instruction below

Council framing and reporting instruction to append to every member's task:

> You are one of several frontier models on a council, each independently researching this same query. Bring your own analytical angle and explore non-obvious dimensions — depth on a specific facet is more valuable than surface coverage of everything. Use web search to ground claims, cite sources inline, and produce a well-evidenced, standalone answer. A synthesizer will compare your findings against the other models', so prioritize accuracy, specificity, and distinctive analysis over generic summary.  
>  
> Reporting (required): When you finish, send your complete final report — the full text, not a summary, file path, or status note — back to the parent agent that launched you, as your final message. Do not end your turn before you have sent it.

Save each received report to `/home/user/workspace/model-council-<model_id>.md` before synthesizing.

After dispatching, wait for the members' reports; you have no independent work until they arrive. If a member finishes or goes idle without sending its report, ask it once to send its complete final report; if it still does not, treat it as a drop-out rather than waiting further. If a member fails, proceed with the survivors as long as at least 2 succeed; note any drop-out in the final answer. If fewer than 2 reports remain, relaunch each missing member once with the same `model` and task. If you still have fewer than 2, do not ask the user what to do: deliver the surviving report labelled as a single-model answer (skip the agreement/disagreement tables), name the drop-out, and offer to rerun the council.

## Phase 3 — Synthesize (model-forward)

Read each member's report and write ONE synthesis. This output format mirrors Perplexity's production Model Council (the Ask-flow `agentic_research` synthesizer) and is the heart of the skill — follow it precisely. The organizing principle is **agreement and disagreement**, never a model-by-model recap.

### Model naming (headers, cells, and prose)

Use each council member's friendly **display name** from `text-models.md` everywhere it appears — table column headers, row cells, and prose alike. Use the actual model name (e.g. "Claude Opus 5.5", "GPT 6.1 Sol", "Gemini 4 Argon"), never a generic placeholder like "the newest GPT" or a raw technical identifier like `claude_opus_5_5`. The technical model_id is only for the `model` parameter when dispatching subagents in Phase 2 — it must never appear in the synthesis. Use only members whose reports you received as table columns.

### Required sections, in this exact order

These tables are MANDATORY on every run — never skip, merge, or replace them with prose, regardless of query type or how similar the results are.

**1. Where Models Agree** (always first)  
Lead with high-confidence findings. 3–6 rows. One ✓ column per council member (header in the model's friendly display name), ✓ where that model agrees, blank otherwise. Model columns contain ONLY ✓ or blank — no other text. Citations live in an `Evidence` column.

- **Every row MUST have at least two ✓.** A single-model finding is not "agreement" — it belongs in Unique Discoveries.

| Finding      | Claude Opus 5.5 | GPT 6.1 Sol | Gemini 4 Argon | Evidence                     |
| ------------ | --------------- | ----------- | -------------- | ---------------------------- |
| [Conclusion] | ✓               | ✓           | ✓              | [Key supporting point][1][4] |

**2. Where Models Disagree** (always present)  
Same friendly display-name headers. Show each model's position in its column, plus a final **Why They Differ** column that names the cause: different evidence cited, different weighting of factors, different assumptions, or different interpretation of the data.

| Topic      | Claude Opus 5.5 | GPT 6.1 Sol | Gemini 4 Argon | Why They Differ        |
| ---------- | --------------- | ----------- | -------------- | ---------------------- |
| [Question] | [Position]      | [Position]  | [Position]     | [Reasoning difference] |

**3. Unique Discoveries** (omit entirely if none)  
Only findings a single model surfaced. Use the model's friendly display name in the first cell.

| Model        | Unique Finding | Why It Matters |
| ------------ | -------------- | -------------- |
| [Model Name] | [Finding][N]   | [Relevance]    |

**4. Comprehensive Analysis** (always present)  
Flowing prose — NOT bullets or tables. Length scales with query complexity: focused 400–600 words, moderate 600–1000, comprehensive 1000–1500. Cover, in order: high-confidence findings (why convergence = reliability), areas of divergence (why models reached different conclusions and how to weigh them), unique insights worth noting, then a final recommendation paragraph.

### Attribution

- Always attribute to specific models using their friendly display names from `text-models.md`: "Claude Opus 5.5 and GPT 6.1 Sol both found that...[2][5], while Gemini 4 Argon noted...[9]"
- Never write generic "research shows" or "experts suggest" when you have model-specific findings.

### Low-divergence results

When models largely agree (factual lookups, personal/memory queries), still produce every table. Populate "Where Models Agree" fully, and for "Where Models Disagree" look harder for differences in **emphasis, detail, framing, and completeness**. Only if genuinely identical, note "All models produced highly consistent findings" but keep the table header. Collapsing to prose is a failure.

### Anti-patterns (do not do)

- A model-by-model table that lists each model's individual answers (one column per model filled with each model's pick). Organize by agreement/disagreement instead.
- Generic placeholders ("the newest GPT") or raw technical model ids (`claude_opus_5_5`) anywhere in the synthesis — use the actual friendly display name.
- A summary that walks through "Model A said… Model B said…" — that is the exact shape to avoid.

## Phase 4 — Deliver

1. Open with one short line naming which models were consulted (friendly names).
2. Deliver each individual member report using the available file-sharing tool or response attachments. Member-to-parent mail does not deliver files to the user.
3. Present the synthesis inline. Also save it to `/home/user/workspace/model-council-synthesis.md` and deliver that file through the same user-facing mechanism.
4. If the user asked for a specific format (e.g. PDF), load the matching `office/*` skill and produce it from the synthesis.

`</skill>`
