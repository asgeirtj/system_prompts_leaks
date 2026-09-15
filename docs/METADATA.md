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
*prompt file*, mirroring the repository's directory structure 1:1 under
`metadata/`, so a prompt file's byte content never changes because of a
metadata edit.

## Storage format

Metadata lives under `metadata/`, mirroring the repository's directory tree.
Every prompt file's sidecar sits at the same relative path under `metadata/`,
with `.yaml` appended to the original filename:

```text
Anthropic/official/2026-09-01-claude-fable-5.1.md
    -> metadata/Anthropic/official/2026-09-01-claude-fable-5.1.md.yaml

Anthropic/claude-code/claude-code-fable-5.1.md
    -> metadata/Anthropic/claude-code/claude-code-fable-5.1.md.yaml
```

The mapping is purely mechanical — append `.yaml` to the prompt file's own
repository-relative path — so it never needs to be looked up or inferred.

Each sidecar file's content **is** the metadata object itself (no
path key; the file's own location already identifies which prompt it
describes):

```yaml
# metadata/Anthropic/official/2026-09-01-claude-fable-5.1.md.yaml
provider: anthropic
product: claude-fable-5.1
model: claude-fable-5.1
captured_at: 2026-09-01
source_type: official
confidence: high
contains:
  - system_prompt
```

```yaml
# metadata/Anthropic/claude-code/claude-code-fable-5.1.md.yaml
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

A prompt file with no `metadata/<same path>.yaml` counterpart is a
**legacy entry** — valid, just not yet described (see
[Migration policy](#migration-policy)).

### Why 1:1 mirrored sidecar files (and not one file per provider)

An earlier revision of this design grouped every provider's entries into a
single `metadata/<Provider>.yaml` map (e.g. `metadata/Anthropic.yaml`). PR
review on the upstream contribution pointed out a real scaling problem with
that layout, which this revision fixes:

- **Merge conflicts on high-velocity providers.** With one file per
  provider, every PR adding an Anthropic or OpenAI prompt edited the same
  top-level YAML dictionary. Two PRs open at the same time against a
  popular provider would conflict even when they described entirely
  unrelated prompt files. Mirroring the tree 1:1 means two PRs only
  conflict when they genuinely describe the *same* prompt file — a real
  conflict either way, not an artifact of the storage layout.
- **Small, obviously-scoped diffs.** A PR adding one prompt now touches
  exactly one new metadata file, not a growing shared file.
- **No lookup required.** The prompt-path -> metadata-path mapping is
  mechanical (append `.yaml`), so both contributors and the validator can
  derive one from the other directly, without scanning a map for the
  matching key.
- Still satisfies the original design principle above: the prompt file
  itself is never touched, and all generated metadata lives in a clearly
  separate `metadata/` tree that mirrors — but never merges into — the
  prompt directories.

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

> **Note:** YAML parsers (including PyYAML's `safe_load`, used by the
> validator) parse an unquoted `YYYY-MM-DD` value as a native date object,
> not a string. The validator normalizes this automatically before checking
> it against the schema, so writing the date unquoted as shown above is
> fine and preferred.

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

- **Existing files** are allowed to have no matching sidecar file under
  `metadata/` ("legacy"). The validator treats a missing sidecar as a
  warning, not a failure.
- **New or modified prompt files touched by a PR** are expected to gain a
  `metadata/<same path>.yaml` sidecar as part of that PR. The
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
