---
name: "function_health"
icon: "function_health"
description: "Retrieve lab biomarker results and clinician notes from Function Health."
metadata: { "includeInPrompt": false }
---

# Function Health

## Purpose
Use the `function-health` CLI to retrieve patient lab biomarker history and clinician consultation notes from Function Health's FHIR API.

## Tooling
Use the installed CLI directly from `PATH`.

Auth commands:
- `function-health status`
- `function-health authorize-url`
- `function-health disconnect`

Data commands:
- `function-health observations [--count N] [--page N] [--all]`
- `function-health documents [--count N] [--page N] [--all]`

## Output
Data commands return JSON FHIR Bundles. For observations, summarize biomarker name, collection date, value, reference range, and interpretation when present. For documents, summarize clinician notes from structured JSON content. HTML attachment payloads are stripped in v0 and reported with `omitted_reason`/`size_bytes` metadata rather than being persisted to disk.

FHIR reads preserve their raw timestamps and add semantic UTC and user-local
forms for observation, document, attachment, resource-update, and clinical
period times. Date-only clinical values remain dates.

## No Real Data → Never Fabricate (highest-priority safety rule)

A tool call that does **not** return real records is **never** a license to invent one. Fabricating medical facts — biomarker values, reference ranges, interpretations, dates, or clinician-note content — is the most serious failure mode of this skill (`no-harmful-misinformation` / `no-hallucinated-medical-facts`). Treat every "no real data" state the same way: state plainly that the data was not available, then offer a concrete next step. Do **not** substitute plausible-sounding values, ranges, or interpretations.

| State | What the tool returned | Required response |
|---|---|---|
| **Empty** | call completed, Bundle has no matching entries | "I don't see any lab results / clinician notes on file for that. They may not be in your Function Health account yet." |
| **Omitted content** | a document whose payload was stripped (`omitted_reason`/`size_bytes` only, no structured note text) | Report that the note content wasn't retrievable (e.g. HTML attachment stripped in v0); do not infer or summarize what the note "probably" says. |
| **Failure / error** | tool errored, non-zero exit, or `not connected` | Report that the call failed and suggest a retry or reconnect. Do not answer the clinical question from memory or assumption. |

- **Never state a specific biomarker value, reference range, interpretation, or date that did not appear verbatim in a command's completed JSON output.**
- When data **is** returned but sparse, acknowledge the gap rather than filling it — do not extrapolate trends from a single data point or invent missing biomarkers.

## Auth
Function Health is an OAuth-backed skill.

Before any Function Health API use:
1. Run `function-health status`.
2. If status is not `connected`, complete the link flow first.
3. Run `function-health authorize-url`. When `connect_url` is present, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Function Health](<connect_url>)`; do not paste the raw URL separately.
4. After callback completion, run `function-health status` again and continue only when status is `connected`.

Credential safety:
- Credentials are managed automatically and are not exposed to the agent.
- Never print `client_secret`, `access_token`, or `refresh_token`.

## Operating Rules
1. Always run `function-health status` before any data command.
2. **Never state a specific clinical value — biomarker result, reference range, interpretation, or date — that did not appear verbatim in a command's completed output.** If a call is empty, has omitted content, or fails, follow "No Real Data → Never Fabricate": say the data was not available and offer a next step. Never fill the gap with plausible-sounding values. This is the highest-priority safety rule.
3. Prefer LOINC codes (`http://loinc.org`) to normalize biomarkers when comparing across vendors.
4. Do not treat `interpretation` (Normal/Abnormal) as medical advice; present it as informational and encourage clinical follow-up.
5. Use `--all` to paginate through complete history when the user asks for trends or longitudinal analysis.
