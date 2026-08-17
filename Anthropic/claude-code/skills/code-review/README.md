# Claude Code `/code-review` slash command

The prompt templates behind Claude Code's built-in `/code-review` skill. The text is
compiled into the Claude Code binary and injected into the conversation as a user-message
block when the command runs. Content here was extracted from the binary and byte-verified
against live API captures (MITM proxy); all five effort tiers re-verified byte-identical
against the 2.1.211 binary on 2026-07-16.

## Usage

`/code-review [level] [target]` — level is one of `low`, `medium`, `high` (default), `xhigh`, `max`; target is an optional PR number, branch, ref range, or path. `--comment` posts findings as inline PR comments; `--fix` applies them to the working tree. `ultra` runs a separate multi-agent cloud review.

When arguments are passed, the injected block is prefixed with `Review target: `<args>`` followed by a blank line; with no arguments it starts directly at the effort header.

## Files

| File | Pipeline |
|---|---|
| `low.md` | 1 diff pass, no subagents, no verify → ≤4 findings |
| `medium.md` | 8 finder angles × 6 candidates, 1-vote verify (precision-tuned) → ≤8 findings |
| `high.md` | 8 finder angles × 6 candidates, 1-vote verify (recall-biased) → ≤10 findings — the default |
| `xhigh.md` | 10 finder angles × 8 candidates, verify, gap-sweep → ≤15 findings |
| `max.md` | identical to xhigh except header wording; only the API reasoning effort differs |
| `report-findings-tool.md` | the `ReportFindings` tool (description + JSON schema) attached to sessions where the host UI renders typed findings — the alternative output channel to the JSON array |

The finder angles: A line-by-line diff scan, B removed-behavior auditor, C cross-file tracer, D language-pitfall specialist (xhigh/max only), E wrapper/proxy correctness (xhigh/max only), plus Reuse, Simplification, Efficiency, Altitude, and Conventions (CLAUDE.md violations).

The binary also contains sibling variants not reproduced here: an output mode that reports via a `ReportFindings` tool call instead of a JSON array, an artifact-publishing step (findings rendered to a shareable HTML page), and a workflow-backed orchestration used at high/xhigh/max when workflows are enabled (one finder per correctness angle, one merged cleanup finder, a verifier per distinct file:line, then synthesis).

`SKILL.md` is the skill's registration frontmatter plus the default (high) variant body;
`high.md` is that same body without the frontmatter.
