# Contributing

Thanks for helping grow this collection! Here's how to contribute.

## Adding a system prompt

1. Fork this repo on GitHub.

2. Clone your fork locally.

3. Pick the right folder:
   - `Anthropic/` — Claude models
   - `OpenAI/` — ChatGPT, GPT, o-series, Codex
   - `Google/` — Gemini models
   - `xAI/` — Grok models
   - `Perplexity/` — Perplexity models
   - `Misc/` — everything else

4. Create a `.md` file with a descriptive name matching the model or product.

5. Paste the raw system prompt as-is. Don't summarize or paraphrase — the full, unedited text is the point.

6. (Optional but encouraged) Add metadata for your file — see below.

7. Commit, push to your fork, and open a PR back to this repo.

## Adding metadata (optional but encouraged)

New prompt files can be described with a small YAML metadata entry recording
provenance (how the prompt was obtained) and confidence (how strongly it's
been verified). This is **optional** — a prompt with no metadata is still a
perfectly good contribution — but adding it makes the repository easier to
search and helps readers judge how much to trust an entry.

Metadata lives in sidecar files under `metadata/`, **one small file per
prompt file**, mirroring the repository's directory tree 1:1 — never inside
the prompt file itself. To add an entry for `OpenAI/example.md`, create
`metadata/OpenAI/example.md.yaml` (same path, `.yaml` appended):

```yaml
# metadata/OpenAI/example.md.yaml
provider: openai
product: chatgpt
model: gpt-example        # optional
captured_at: 2026-09-01   # optional, YYYY-MM-DD
source_type: extracted    # official | extracted | reverse_engineered |
                            # community_submitted | reconstructed | unknown
confidence: medium        # high | medium | low | unknown
contains:                 # optional
  - system_prompt
```

The file's own path already says which prompt it describes, so there's no
path key inside it. This one-file-per-prompt layout is deliberate: an
earlier design grouped every provider's entries into a single
`metadata/<Provider>.yaml` map, but that meant any two PRs adding prompts
to the same provider — a common case for high-traffic providers like
Anthropic or OpenAI — would conflict on the same file even though they
described unrelated prompts. Mirroring the tree 1:1 means your PR only
ever touches the one new file it adds, so it can't collide with anyone
else's in-flight metadata PR.

Full field definitions, the meaning of each `source_type` and `confidence`
value, and the migration policy (existing files don't need this
retroactively) are in [`docs/METADATA.md`](../docs/METADATA.md).

Before opening a PR, validate your entry locally:

```bash
pip install -r scripts/requirements.txt
python scripts/validate_metadata.py
```

This reports pass/fail per `metadata/**/*.yaml` file and lists any prompt
files with no metadata as informational output — that's expected and not
a failure. CI runs the same check on every PR.

## Requesting a prompt

Don't have the prompt yourself? [Open an issue](https://github.com/asgeirtj/system_prompts_leaks/issues) with the model or product name and we'll try to track it down.
