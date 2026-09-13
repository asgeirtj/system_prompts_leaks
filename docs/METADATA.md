# Prompt Metadata

This document specifies an optional, machine-readable metadata layer for the
prompt files in this repository. It describes **provenance** (how a prompt was
obtained) and **confidence** (how strongly it has been verified), plus a small
amount of structural information (provider, product, model, capture date,
contents).

The goal is to make the repository queryable — "which prompts are officially
published?", "which are single-source extractions?", "which contain tool
definitions?" — without changing how prompts are read or contributed today.

## Design principle: prompt files are never modified

Every `.md` prompt file in this repository is meant to be pasted **as-is**,
verbatim (see `.github/CONTRIBUTING.md` and `.gitattributes`, which disables
whitespace normalization for `*.md` specifically to preserve raw formatting).
Some files (Claude Code's `SKILL.md`, agent, and output-style files) already
contain their *own* YAML front matter as part of the leaked content itself —
that front matter is data being archived, not repository metadata, and must
not be touched or conflated with what this document defines.

For that reason, metadata described here is **never** injected into prompt
files as front matter. It lives in separate **sidecar files**, one per
top-level provider directory, so a prompt file's byte content never changes
because of a metadata edit.

## Storage format

Metadata lives under `metadata/`, one YAML file per top-level directory in
the repository, named identically to that directory:

```text
metadata/
├── Anthropic.yaml
├── OpenAI.yaml
├── Google.yaml
├── xAI.yaml
├── Perplexity.yaml
├── Misc.yaml
├── ...
```

Each file is a YAML mapping from **repository-relative path** (forward
slashes, exactly as `git ls-files` prints it) to a metadata object:

```yaml
Anthropic/official/2026-09-01-claude-fable-5.1.md:
  provider: anthropic
  product: claude-fable-5.1
  model: claude-fable-5.1
  captured_at: 2026-09-01
  source_type: official
  confidence: high
  contains:
    - system_prompt

Anthropic/claude-code/claude-code-fable-5.1.md:
  provider: anthropic
  product: claude-code
  model: claude-fable-5.1
  captured_at: 2026-09-05
  source_type: extracted
  confidence: medium
  contains:
    - system_prompt
    - tool_definitions
```

A path with no entry in the matching sidecar file is a **legacy entry** —
valid, just not yet described (see [Migration policy](#migration-policy)).

### Why a sidecar per top-level directory (and not one big file)

- Keeps each file to a reviewable size and scoped to one provider, so a PR
  adding one prompt touches one small, obviously-related metadata file.
- Avoids merge conflicts between unrelated providers landing in the same PR
  window.
- Maps 1:1 onto the directory structure contributors already use, so "which
  file describes `Anthropic/...`" has one obvious answer.

## Fields

### `provider` (required)

The company or organization associated with the prompt, lowercase, matching
the top-level directory's subject (not necessarily its literal casing):

```yaml
provider: anthropic
```

### `product` (required)

The product, application, or agent the prompt belongs to:

```yaml
product: claude-code
```

### `model` (optional)

The specific model associated with the prompt, when known. Optional because
some prompts are product-level rather than tied to one model (e.g. a
`README.md` describing a folder, or a tool schema shared across models).

```yaml
model: claude-fable-5.1
```

### `captured_at` (optional)

The date the prompt was captured, extracted, published, or observed, as
`YYYY-MM-DD`. Optional because the exact date is sometimes unknown for older
entries; omit rather than guess.

```yaml
captured_at: 2026-09-01
```

### `source_type` (required)

How the material became available. One of:

| Value | Meaning |
|---|---|
| `official` | Intentionally published by the provider (e.g. a provider's own published system-prompt disclosure, release notes, or documentation). |
| `extracted` | Obtained from a running product or model through an extraction method (a prompt-leak technique against the live product). |
| `reverse_engineered` | Derived from client code, application bundles, network traffic, APIs, or related technical analysis rather than asking the model to reveal itself. |
| `community_submitted` | Supplied by a contributor without the stronger verification the categories above imply. |
| `reconstructed` | Assembled from partial evidence (fragments, paraphrases, multiple partial captures) rather than one direct capture. |
| `unknown` | The original acquisition method cannot be established. |

### `confidence` (required)

How strongly the entry has been verified — a statement about verification
quality, not a personal opinion about whether the prompt "looks real". One of:

| Value | Use when |
|---|---|
| `high` | At least one strong verification condition holds: provider-published material, independently reproduced extraction, multiple matching captures, or strong technical evidence tied to the real product. |
| `medium` | The source is plausible and internally consistent, but independent reproduction is limited. |
| `low` | The content depends mainly on a single unverified submission or an incomplete extraction. |
| `unknown` | Verification information is not available. |

Confidence is not computed automatically anywhere in this system — it is a
human judgment call the contributor records, and it is fine (expected, even)
for most existing entries to be `unknown` until someone reviews them.

### `contains` (optional)

A list describing what the document holds, from:

```text
system_prompt
tool_definitions
skills
subagents
mcp
safety_rules
permission_rules
verification_rules
runtime_instructions
```

Example:

```yaml
contains:
  - system_prompt
  - tool_definitions
  - skills
```

## Migration policy

Converting all 400+ existing prompt files at once would produce an
unreviewable diff and is explicitly **not** part of this change. Instead:

- **Existing files** are allowed to have no entry in the sidecar file
  ("legacy"). The validator treats a missing entry as a warning, not a
  failure.
- **New or modified prompt files touched by a PR** are expected to gain a
  metadata entry in the matching sidecar file as part of that PR. The
  validator can be run in a stricter mode (see
  [`scripts/validate_metadata.py`](../scripts/validate_metadata.py), added in
  a later task) that enforces this for changed paths only.
- Backfilling legacy entries is encouraged but happens gradually, file by
  file or provider by provider, in follow-up PRs — never as one bulk
  migration commit.

## Non-goals for this iteration

- No automatic confidence scoring. A human sets `confidence`; the system only
  checks that the value is one of the allowed enums.
- No enforcement that *every* file eventually gets metadata — legacy entries
  remain permanently valid unless someone chooses to describe them.
- No change to prompt file content, naming, or directory layout.

## Related files

- JSON Schema: [`schemas/prompt-metadata.schema.json`](../schemas/prompt-metadata.schema.json)
- Validator: [`scripts/validate_metadata.py`](../scripts/validate_metadata.py)
- CI workflow: [`.github/workflows/validate-metadata.yml`](../.github/workflows/validate-metadata.yml)
