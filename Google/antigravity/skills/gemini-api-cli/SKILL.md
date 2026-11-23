---
name: gemini-api-cli
description: Call the Gemini API from the shell with gemini-api. Use for media generation (images, TTS, music, video), file and YouTube analysis, audio/video transcription, Deep Research, and sandboxed agents.
---

The `gemini-api` CLI exposes every Gemini API resource as a shell subcommand. Compared to `curl`: media and transcription commands decode output to disk and print only the file path, `-i` attaches local files or `files/<id>` URIs, `--jq` extracts fields in-process (raw strings by default, no external `jq`), `--dry-run` previews redacted HTTP requests offline, and list endpoints auto-paginate with `--all` (cap pages with `--max-pages N`; `--page-size` sets server page size).

## CLI vs SDK

**CLI for shell work, SDK for application code.** Use `gemini-api` from terminals, scripts, and CI jobs to generate media files, analyze local PDFs or recordings, run Deep Research, and manage agent sandboxes (`gemini-api` is a stateless Gemini API client, distinct from the interactive `@google/gemini-cli` coding agent). Use the Google GenAI SDKs (`gemini-api-dev`, `gemini-live-api-dev`) when calls live inside application source or need bidirectional Live API WebSockets.

## Install and auth

```sh
# macOS / Linux (set GEMINI_VERSION=<tag> to pin a release)
curl -fsSL https://raw.githubusercontent.com/google-gemini/gemini-api-cli/main/scripts/install.sh | bash
```

Credentials resolve in order (first match wins): `--api-key` / `--access-token` flags, `GEMINI_API_KEY` / `GEMINI_ACCESS_TOKEN` env vars, the OS keychain, then `~/.config/gemini-api/config.yaml`.

- Env var (agents and CI): `export GEMINI_API_KEY="..."`
- Workstation key: `gemini-api configure --api-key "..."` saves to the OS keychain. Pass `--no-keyring` or `GEMINI_NO_KEYRING=1` on headless Linux to use `config.yaml`; `gemini-api auth logout` clears stored keys.
- Active auth check: `gemini-api whoami` (add `-o json` for JSON) prints masked credentials and the winning source.

> **The #1 auth trap:** an exported `GEMINI_API_KEY` overrides credentials stored in the keychain or `config.yaml`, billing whichever project that env var belongs to. Check `gemini-api whoami` to see which source won, or run `env -u GEMINI_API_KEY gemini-api ...` to ignore the env var.

## Command structure

```text
gemini-api <intent> [prompt] [flags]          # task commands with model and modality presets
gemini-api <resource> <action> [flags]        # REST resource groups
```

Run `gemini-api --help` to list commands, or `<subcommand> --help` for flags and examples (`--usage` dumps a 45 KB KDL spec, so stick to `--help` to save context).

| Command | Key flags / actions | Default model & behavior |
|---|---|---|
| `generate [prompt]` | `-m`, `-i`, `--stdin`, `--system`, `--previous-interaction-id`, `--stream=false`, `--body` | `gemini-4-hydrogen`; streams text deltas to stdout |
| `image [prompt]` | `-m`, `-i`, `--aspect-ratio`, `--image-size` (512..4K), `--previous-interaction-id`, `--out`, `--body` | `gemini-nano-banana-2.1`; writes image, prints path |
| `tts [text]` | `-m`, `-f`, `--stdin`, `-v`/`--voice` (default Kore), `--multi-speaker`, `--language`, `--out` | `gemini-3.8-flash-tts`; writes 24 kHz WAV, prints path (unstored) |
| `music [prompt]` | `-m`, `-f`, `--stdin`, `--out`, `--body` | `lyria-3.5`; writes audio track, prints path |
| `video [prompt]` | `-m`, `-i`, `--aspect-ratio`, `--resolution` (360p..4k), `--previous-interaction-id`, `--async`, `--resume`, `--out`, `--body` | pass `-m gemini-omni-1.2-flash` (`≤ v0.4.5` preset defaults to `gemini-omni-1.1-flash`); polls until done, writes MP4, prints path (`upscale` via `--body`) |
| `analyze [question]` | `-i` (required, repeatable), `--stdin`, `--system`, `-m` | `gemini-4-hydrogen`; answers over PDFs, media, CSV/text, YouTube URLs (unstored) |
| `transcribe` | `-m`, `-i` (required, repeatable), `--format` (md, text, json, srt), `--no-speakers`, `--no-timestamps`, `--out` | `gemini-3.5-transcribe` (audio; 30m speaker/timestamp cap) or `gemini-4-hydrogen` (video); writes `--out` (or `./transcript-*`), prints path (unstored) |
| `agent` | `run`, `status`, `cancel`, `delete-interaction`; `create`, `list`, `get`, `delete` | Runs models or managed agents; manages custom agent definitions |
| `files` | `upload [--wait]`, `list`, `get`, `generated-files-list`, `register`, `delete` | Uploads reusable `files/<id>` URIs (48h TTL; up to 2 GB, 50 MB PDFs) |
| `models` | (bare), `list [--all]`, `get <id>` | Bare `models` prints an offline catalog; `list` and `get` query the live API |
| `environments` | `create`, `list`, `get`, `delete`, `files` (`list`, `upload`, `download`), `connect`, `poll`, `serve` | Remote sandboxes and workspace snapshots (`credentials`, `webhooks`, `triggers` for agent infra) |

**Model selection:** use `gemini-4-hydrogen` (default), `gemini-4-neon` (frontier-level intelligence with fast end-to-end task completion), `gemini-4-carbon` or `gemini-4-argon` (hardest reasoning and coding), or `gemini-3.5-flash-lite` (high throughput); for images, `gemini-nano-banana-2.1`, `gemini-3.1-flash-lite-image`, or `gemini-3-pro-image`; for video, `gemini-omni-1.2-flash`. Avoid deprecated `gemini-2.5-*`, `gemini-2.0-*`, and `gemini-1.5-*` models.

## Global flags

| Flag | Purpose |
|---|---|
| `-o`, `--output-format` | `pretty` (default), `json`, `toon`, `yaml`, `table` |
| `-q`, `--jq` | Filter JSON output with a built-in jq expression (`--raw-output` is true by default) |
| `--agent-mode` | Compact TOON on stdout and structured JSON errors on stderr |
| `--no-interactive` | Disable prompts, TUI forms, and `explore` |
| `--dry-run` | Validate inputs and preview redacted HTTP requests offline (human preview on stderr; `-o json` or `--jq` writes JSON to stdout) |
| `-d`, `--debug` | Log HTTP request and response details to stderr |

Exit codes: 0 ok, 1 runtime or API error (`video` polling, `image`/`music`, `tts`, `transcribe`, and `analyze` also exit 1 on failed/incomplete runs; `generate`, `agent run`, and `agent status` exit 0 and report state in `.status`), 2 usage or validation error, 3 auth error. See `gemini-api --help-global` for `--server-url` and auth flags; pagination flags (`--all`/`-a`, `--max-pages`, `--page-size`, `--page-token`) live on `<resource> list --help`.

## Output

Media (`image`, `tts`, `music`, `video`) and `transcribe` write files locally and print only the file path on stdout (`--out` on media commands rewrites the file extension to match the returned MIME type, e.g. `.png` for default `image` unless `--body '{"response_format": {"mime_type": "image/jpeg"}}'` is passed). Adding `-o json` still writes the file and prints metadata: `{kind, path, size_bytes, mime_type, response_id, status}` on `image`/`music`/`video`, `{model, path, mime_type, size_bytes, sample_rate, channels}` on `tts`, and `{model, format, results: [{input, path, size_bytes, model, mime_type}]}` on `transcribe`.

**Streaming and JSON shape:** `generate` and `agent run` stream plain reply text by default, so `-o json` alone emits `{"data": ...}` NDJSON SSE events. Pass `--stream=false -o json` for one JSON object `{id, status, steps, usage}` (bare `--stream=false` prints aligned `key: value` metadata; `--background` on `agent run` disables streaming, and `--jq` disables streaming unless `-o` or `GEMINI_OUTPUT_FORMAT` is set, so omit `-o json` or add `--stream=false` when filtering a full response with `--jq`). Reply text lives under `.steps[]` `model_output` (see `agent status` below) rather than `.candidates[]`. On paginated `list` commands, `--jq` runs per page envelope (`.models[]?.name`, `.agents[]?.id`).

## Input

- `-i` / `--input` attaches media and documents on `generate`, `image`, `video`, `analyze`, `transcribe`, and `agent run` (repeatable). Accepts local paths up to ~14 MB (20 MB base64 cap), `files/<id>` URIs, or YouTube URLs (not supported on `transcribe`). Upload larger or reused files once with `gemini-api files upload <path> --wait`.
- `-f` / `--file` reads prompt text from a file on `tts` and `music`. **Piped text needs `--stdin`:** when piping plain text into `generate`, `image`, `music`, or `video`, pass `--stdin` or piped input gets parsed as a JSON `--body`; `analyze` and `tts` ignore piped stdin unless `--stdin` is set (`agent run` has no `--stdin`, so piped stdin is always JSON `--body`).
- `--body` passes raw Gemini API JSON inline, from `@file.json`, or via `@-` (merges with flags; exits 2 on duplicate keys). Use it for `response_format` schemas, `tools` (`google_search`, `code_execution`, `url_context`, function declarations), `generation_config`, `environment`, or `store`.
- **Don't dump `--schema` raw:** it prints ~92 KB of minified JSON and exits before `--jq` runs. Pipe it to `jq`:
  ```sh
  gemini-api generate --schema | jq '."$defs".ModelInteraction.properties | keys'
  ```

## Media, analysis, and transcription

```sh
HERO=$(gemini-api image "Isometric cloud database icon" --aspect-ratio 16:9 --image-size 2K \
  --body '{"response_format": {"mime_type": "image/jpeg"}}' --out ./hero.jpg)
gemini-api image "Add warm sunset lighting" -i "$HERO" \
  --body '{"response_format": {"mime_type": "image/jpeg"}}' --out ./hero-sunset.jpg

gemini-api tts "Alice: Ready to ship? Bob: Checks are green." \
  --multi-speaker "Alice=Kore,Bob=Puck" --out ./dialogue.wav

VID_ID=$(gemini-api video "Aerial coastal cliffs at sunrise" -m gemini-omni-1.2-flash --aspect-ratio 16:9 --resolution 1080p --async)
gemini-api video --resume "$VID_ID" --out ./cliffs.mp4

FILE_URI=$(gemini-api files upload ./call.mp4 --wait)   # prints files/<id>
gemini-api analyze -i "$FILE_URI" "List action items with owners and timestamps."
gemini-api transcribe -i "$FILE_URI" --format srt --out ./call.srt
```

## Managed agents and sandboxes

- `deep-research-preview-04-2026` and `deep-research-max-preview-04-2026`: run with `--background` and poll `agent status`.
- `antigravity-preview-09-2026` (Linux sandbox with Bash, Python, Node, file ops, and web search): pass `"environment": "remote"` (new sandbox), `"environment": "<env_id>"` (existing sandbox), or `"environment": {"type": "remote", ...}` in `--body` (top-level `environment_id` is output-only and exits 2).

**ID boundary:** `agent status`, `agent cancel`, and `agent delete-interaction` take a run ID (`v1_...`). `agent create`, `agent get`, `agent list`, and `agent delete` manage custom agents only (built-in agent IDs are listed in `gemini-api agent run --help` and live `gemini-api models list`, not the offline `gemini-api models` catalog; cap `agent list` and `environments list` with `--page-size 10`).

```sh
RUN_ID=$(gemini-api agent run "Compare WebRTC SFU architectures with primary sources." \
  --agent deep-research-preview-04-2026 --background --jq '.id')
gemini-api agent status "$RUN_ID" --jq '.status'   # queued | in_progress | requires_action | requires_continuation | completed | failed | cancelled | incomplete | budget_exceeded (exits 0)
gemini-api agent status "$RUN_ID" \
  --jq '[.steps[]? | select(.type=="model_output") | .content[]? | select(.type=="text") | .text] | join("")'

ENV_ID=$(gemini-api agent run "Benchmark radix sort vs timsort in Python and write results.csv." \
  --agent antigravity-preview-09-2026 --body '{"environment": "remote"}' --jq '.environment_id')
gemini-api environments files list -e "$ENV_ID" -r
gemini-api environments files download "$ENV_ID" results.csv --out ./results.csv

gemini-api agent create --id code-reviewer --base-agent antigravity-preview-09-2026 \
  --system-instruction "Review diffs for race conditions and auth bugs."
```

## Multi-turn and structured output

Calls store state server-side by default (`store` is true), so multi-turn chains only need `--previous-interaction-id` (`system_instruction`, `tools`, and `generation_config` apply per turn; setting `store` to false disables `previous_interaction_id` and `background`):

```sh
TURN1=$(gemini-api generate "Propose 2 indexing strategies for time-series logs." --jq '.id')
gemini-api generate "Compare them for write-heavy workloads." --previous-interaction-id "$TURN1"
```

Combine `--stdin` with `--body` for schema-constrained JSON output:

```sh
cat build.log | gemini-api generate "Extract unique compiler errors." --stdin --body '{
  "response_format": {
    "type": "text", "mime_type": "application/json",
    "schema": {"type": "object", "properties": {"errors": {"type": "array", "items": {"type": "string"}}}, "required": ["errors"]}
  },
  "store": false
}'
```

Full CLI reference: [aistudio.google.com/docs/cli.md](https://aistudio.google.com/docs/cli.md) (prefer `gemini_get_doc` / `gemini_search_docs` when the Gemini Docs MCP server is installed); docs index: [llms.txt](https://aistudio.google.com/llms.txt).
