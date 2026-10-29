# Migration Reference

How to migrate existing Gemini API code to the Interactions API and/or upgrade between model generations. Covers the agent workflow for performing migrations safely.

For detailed before/after code examples across all feature areas (text generation, multi-turn, streaming, function calling, structured output, grounding, multimodal), fetch the full migration guide: https://ai.google.dev/gemini-api/docs/migrate-to-interactions.md.txt

## Confirm the Migration Scope

**Before any edits, confirm the scope.** If the user's request does not explicitly name a single file, a specific directory, or an explicit file list, ask first and do not start editing.

Even imperative requests like "migrate my code", "upgrade to gemini 3", "migrate my app to gemini", or "switch to the Interactions API" leave the scope ambiguous. Ask:

> Before I start editing, can you confirm the scope?  
> 1. Entire project  
> 2. Specific subdirectory (e.g. `src/`, `api/`)  
> 3. Specific file or list of files

**Sizing the scope (large repos).** Before asking, get a per-directory count:

```sh
rg -l "generate_content|generateContent|gemini-1\.5|gemini-2\.0|gemini-2\.5|gemini-3\.1-pro|gemini-3\.1-flash-lite|gemini-3\.1-flash-tts|gemini-3\.5|gemini-3\.6|gemini-3\.7|gemini-3-flash|thinking_budget|temperature" --type-not md | cut -d/ -f1 | sort | uniq -c | sort -rn
```

Present the breakdown in your question (e.g. *"Found 42 references across 3 directories: src/ (28), tests/ (10), scripts/ (4). Which to migrate?"*).

**Proceed without asking** only when the scope is already unambiguous, the user named an exact file ("migrate `app.py`"), pointed at a directory ("migrate everything under `src/`"), or already confirmed scope in an earlier turn.

## API Migration: `generateContent` → `Interactions`

The core changes when migrating from `generateContent` to the Interactions API:

| What | `generateContent` | Interactions API |
|------|----------------|-----------------|
| **SDK method** | `client.models.generate_content()` | `client.interactions.create()` |
| **Response text** | `response.text` | `interaction.steps[-1].content[0].text` |
| **Multi-turn** | Manual history array or `client.chats.create()` | `previous_interaction_id=interaction.id` |
| **Streaming** | `generate_content_stream()` / `:streamGenerateContent` | `stream=True` + `step.delta` events |
| **Structured output** | `config.response_format` inside `GenerateContentConfig` | Top-level `response_format` array |
| **Function calling** | `candidates[0].content.parts[0].function_call` | `function_call` step in `interaction.steps` |
| **Search grounding** | `groundingMetadata` on candidates | `google_search_call`/`google_search_result` steps + inline `annotations` |
| **Config/types** | `types.GenerateContentConfig(...)`, `types.Tool(...)`, `types.Content(...)`, `types.Part.*` | Not used. Interactions API uses plain Python dicts and direct params. Check the feature docs for exact format. |
| **REST endpoint** | `POST /v1beta/models/{model}:generateContent` | `POST /v1beta/interactions` |
| **SDK package** | `google-genai` ≥ 1.x or legacy `google-generativeai` | `google-genai` ≥ 2.30.1 (Python) / `@google/genai` ≥ 2.29.1 (JS) |

For full before/after code examples, fetch the [Migration Guide](https://ai.google.dev/gemini-api/docs/migrate-to-interactions.md.txt) or read the Interactions API documentation pages for each feature.

## Model Migration

### Deprecated Models

| Model | Status | Drop-in Replacement |
|-------|--------|-------------------|
| `gemini-2.0-flash` | Deprecated | `gemini-3.8-flash` |
| `gemini-2.0-flash-lite` | Deprecated | `gemini-3.5-flash-lite` |
| `gemini-1.5-pro` | Deprecated | `gemini-3.8-flash` |
| `gemini-1.5-flash` | Deprecated | `gemini-3.8-flash` |
| `gemini-3.1-flash-image` | Deprecated (shutdown October 29, 2026) | `gemini-nano-banana-2.1` |

### Active Legacy Models (migration recommended)

| Current Model | Recommended Target | Why |
|--------------|-------------------|-----|
| `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, or `gemini-3-flash-preview` | `gemini-3.8-flash` | Latest Flash: stronger agentic/multimodal performance, reduced token usage/loop spiraling |
| `gemini-2.5-flash` | `gemini-3.8-flash` or `gemini-3.5-flash-lite` | Latest Flash with Interactions API support, or latest Flash-Lite for cheaper/simpler tasks. |
| `gemini-2.5-flash-lite` or `gemini-3.1-flash-lite` | `gemini-3.5-flash-lite` | Latest Flash-lite with Interactions API support |
| `gemini-3.1-pro-preview` or `gemini-2.5-pro` | `gemini-4-argon` | Most powerful model with 1M context, complex reasoning, coding, and research |
| `gemini-3.1-flash-tts-preview` or `gemini-2.5-*-tts` | `gemini-3.8-flash-tts` or `gemini-3.8-flash-lite-tts` | Latest TTS models with Voice Design, Voice Replication, structured `speech_metadata`, and default WAV (`audio/wav`) output |
| `gemini-3.1-flash-image` or older image generation models | `gemini-nano-banana-2.1` | Latest Nano Banana image generation model: 131k context, multi-image fusion (up to 14 reference images), enhanced visual quality, and text rendering |
| Legacy audio understanding / ASR | `gemini-3.5-transcribe` | Dedicated speech-to-text with auto language detection, diarization, word timestamps, and smart formatting |
| Legacy Live API (`gemini-3.1-flash-live-preview`, `gemini-2.5-flash-native-audio-*`, `gemini-2.0-flash-live-001`) | `gemini-3.8-live` or `gemini-3.8-live-extended-thinking` | Install `google-gemini/gemini-live-api-dev` skill and see its `references/migration.md` for Live API protocol changes |

### Managed Agents

| Agent | Status | Drop-in Replacement | Notes |
|-------|--------|---------------------|-------|
| `antigravity-preview-05-2026` | Deprecated (October 5, 2026) | `antigravity-preview-09-2026` | Requests redirect to `antigravity-preview-09-2026` after October 5, 2026. |
| `deep-research-pro-preview-12-2025` | Deprecated (shutdown October 23, 2026) | `deep-research-preview-04-2026` or `deep-research-max-preview-04-2026` | Update `agent` parameter in `interactions.create`. |

> **Note:** Within the Interactions API, model upgrades are generally drop-in — change the model string and verify. The breaking changes are at the **API level** (generateContent → Interactions) and parameter deprecations (`temperature`, `top_p`, `top_k`).

## Migration Checklist

Every item is tagged: **`[BLOCKS]`** items cause errors or broken behavior if missed. **`[TUNE]`** items are quality/performance adjustments.

### API Migration (generateContent → Interactions)

- [ ] Updated SDK: `google-genai` ≥ 2.30.1 (Python) / `@google/genai` ≥ 2.29.1 (JS)
- [ ] Replaced `client.models.generate_content()` → `client.interactions.create()`
- [ ] Replaced `response.text` → `interaction.output_text`
- [ ] Replaced `response.candidates[0].content.parts` → iterate `interaction.steps`
- [ ] Replaced `client.chats.create()` / manual history → `previous_interaction_id`
- [ ] Removed all `types.*` wrappers (`GenerateContentConfig`, `Tool`, `Content`, `Part`) — Interactions API uses plain dicts. Check feature docs for exact format.
- [ ] Moved `response_format` from `GenerateContentConfig` to top-level parameter
- [ ] Replaced `generate_content_stream()` → `stream=True` + step-based event handling
- [ ] Updated function calling: candidates-based → step-based tool lifecycle
- [ ] REST: Changed endpoint to `/v1beta/interactions`
- [ ] REST: Add `Api-Revision: 2026-05-20` header (SDK ≥ 2.0.0 sets it automatically)
- [ ] Replaced `google-generativeai` (Python) → `google-genai` ≥ 2.30.1
- [ ] Replaced `@google/generative-ai` (JS) → `@google/genai` ≥ 2.29.1
- [ ] Updated all import statements to match new package names

### Model String Updates

- [ ] Replaced `gemini-2.0-*` model strings with current equivalents
- [ ] Replaced `gemini-1.5-*` model strings with current equivalents
- [ ] Consider upgrading `gemini-3.7-flash` → `gemini-3.8-flash`
- [ ] Consider upgrading `gemini-3.6-flash` → `gemini-3.8-flash`
- [ ] Consider upgrading `gemini-3.5-flash` → `gemini-3.8-flash`
- [ ] Consider upgrading `gemini-3-flash-preview` → `gemini-3.8-flash`
- [ ] Consider upgrading `gemini-2.5-flash` → `gemini-3.8-flash`
- [ ] Consider upgrading `gemini-3.1-flash-lite` → `gemini-3.5-flash-lite`
- [ ] Consider upgrading `gemini-2.5-flash-lite` → `gemini-3.5-flash-lite` or `gemini-3.1-flash-lite`
- [ ] Consider upgrading `gemini-3.1-pro-preview` → `gemini-4-argon`
- [ ] Consider upgrading `gemini-2.5-pro` → `gemini-4-argon`
- [ ] Consider upgrading `gemini-3.1-flash-tts-preview` → `gemini-3.8-flash-tts` or `gemini-3.8-flash-lite-tts`
- [ ] Consider upgrading `gemini-3.1-flash-image` → `gemini-nano-banana-2.1`

### Agent Updates

- [ ] Upgrade `antigravity-preview-05-2026` → `antigravity-preview-09-2026` (deprecated October 5, 2026; redirected afterwards)
- [ ] Upgrade `deep-research-pro-preview-12-2025` → `deep-research-preview-04-2026` or `deep-research-max-preview-04-2026` (deprecated, shutdown October 23, 2026)

### Migrate to Gemini 4 Argon

Use this checklist when migrating to `gemini-4-argon`. For full details on supported APIs, context window sizes, parameter changes, and continuation patterns, fetch [What's new in Gemini 4 Argon](https://ai.google.dev/gemini-api/docs/latest-model.md.txt) and the [Long Decode guide](https://ai.google.dev/gemini-api/docs/long-decode.md.txt).

- [ ] **Check for unsupported APIs before migrating**: Look up unsupported APIs and features in [What's new in Gemini 4 Argon](https://ai.google.dev/gemini-api/docs/latest-model.md.txt) (e.g., explicit context caching), ensure they are not used, and flag any unsupported usage to the user before migrating
- [ ] Updated SDK: `google-genai` ≥ 2.30.1 (Python) / `@google/genai` ≥ 2.29.1 (JS)
- [ ] Updated model name to `gemini-4-argon`
- [ ] Removed `temperature`, `top_p`, `top_k` from config
- [ ] Replaced `thinking_budget` with `thinking_level` (`low`, `medium`, `high`)
- [ ] Reviewed `max_output_tokens`: raise any limit below `32,768` to at least `32,768` (default cap is `65,536` tokens without long decode)
- [ ] **Decide whether long decode is needed**: Refer to the [Long Decode guide](https://ai.google.dev/gemini-api/docs/long-decode.md.txt) (input, thinking, and output share a single 1M token window). Only if needed for the workload:
  - [ ] Set `max_output_tokens` explicitly above `65,536` (up to `1,048,576` minus input tokens)
  - [ ] Enable [long decode](https://ai.google.dev/gemini-api/docs/long-decode.md.txt) via [background execution](https://ai.google.dev/gemini-api/docs/background-execution.md.txt) (`background=True`), poll while `interaction.status in ("in_progress", "queued")`, and join text across all `model_output` steps in `interaction.steps`
  - [ ] Do not use `total_input_tokens` for context compaction, as it sums input tokens across all continuation hops
  - [ ] Increase HTTP client read timeouts to at least 15–20 minutes

### Migrate to Gemini 3.8 Flash or Gemini 3.5 Flash-Lite

Use this checklist if the user requests to migrate to Gemini 3.8 Flash or Gemini 3.5 Flash-Lite. For full documentation of the changes, fetch the [What's new in Gemini 3.8 Flash guide](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.8.md.txt) and look for the migration section.

- [ ] Updated model name to `gemini-3.8-flash` or `gemini-3.5-flash-lite` (depending on user request)
- [ ] Removed `temperature`, `top_p`, `top_k` from config
- [ ] Replaced `thinking_budget` with `thinking_level` (`minimal`, `low`, `medium`, `high`)

### Migrate to Gemini 3.8 TTS (`gemini-3.8-flash-tts` or `gemini-3.8-flash-lite-tts`)

For full migration details, output formats, and prompting guide, fetch the [Speech Generation guide](https://ai.google.dev/gemini-api/docs/speech-generation.md.txt) (see `#migration` and `#prompting-guide`), [Voice Design](https://ai.google.dev/gemini-api/docs/voice-design.md.txt), and [Voice Replication](https://ai.google.dev/gemini-api/docs/voice-replication.md.txt).

- [ ] Updated model to `gemini-3.8-flash-tts` (creative fidelity) or `gemini-3.8-flash-lite-tts` (fast/cost-efficient replacement for `gemini-3.1-flash-tts-preview`)
- [ ] Moved turn-level directions (`style`) and speaker labels (`speaker`) out of transcript `text` into `annotations: [{"type": "speech_metadata", "speaker": "...", "style": "..."}]` (`text` is treated strictly as a verbatim transcript)
- [ ] Specified `speaker` inside `speech_metadata` on **every** turn in multi-speaker requests
- [ ] Accounted for default WAV (`audio/wav` with RIFF header) output on unary requests: remove manual WAV header wrappers (`wave` / `ffmpeg`), or explicitly set `response_format={"type": "audio", "mime_type": "audio/l16"}` (or `"audio/mulaw"` / `"audio/alaw"`). Streaming (`stream=True`) still defaults to headerless `audio/l16`.
- [ ] Kept inline tags (`<laugh>`, `<sigh>`, `<cough>`, `<breath>`, `<short pause>`) and pipe backchannels (`|mhm|`) only for point-in-time vocal events; avoid sound-effect tags
- [ ] Replaced multi-paragraph `"Audio Profile"` / `"Director's Notes"` blocks with a custom voice created via [Voice Design](https://ai.google.dev/gemini-api/docs/voice-design.md.txt) (`client.voices.create()` → `voice_...`)

### Migrate to Gemini Nano Banana 2.1 (`gemini-nano-banana-2.1`)

For full image generation details, resolutions, aspect ratios, and multi-image referencing, fetch the [Image Generation guide](https://ai.google.dev/gemini-api/docs/image-generation.md.txt) and [Gemini Nano Banana 2.1 model page](https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1.md.txt).

- [ ] Updated model name to `gemini-nano-banana-2.1`
- [ ] Take advantage of expanded 131,072 input token limit (65k on previous generation) and 32,768 output token limit
- [ ] Multi-image reference support: up to 14 reference images (character consistency for up to 4 characters, object fidelity for up to 10 objects)
- [ ] Support for wide / panoramic aspect ratios (`1:4`, `4:1`, `1:8`, `8:1`) and output resolutions (`1K` default, `2K`, `4K`)
- [ ] Grounding with Google Web and Image Search supported natively
- [ ] Configurable thinking levels (`minimal`, `medium` default, `high`)

---

## Verify the Migration

After updating, run a spot-check to confirm the Interactions API is working:

1. Make a single `client.interactions.create()` call with a simple input
2. Assert `interaction.steps` is not empty
3. Assert at least one step has `type == "model_output"` with non-empty text
4. For multi-turn, verify `previous_interaction_id` preserves context across turns

For verification code snippets, fetch the [Migration Guide](https://ai.google.dev/gemini-api/docs/migrate-to-interactions.md.txt).
