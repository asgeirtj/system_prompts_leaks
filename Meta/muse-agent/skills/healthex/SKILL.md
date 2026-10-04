---
name: "healthex"
title: "HealthEx"
description: "Use to connect HealthEx and ask questions about your medications, lab results, and other health records."
icon: "healthex"
metadata: { "includeInPrompt": false }
---

# HealthEx (OAuth + MCP Health Records)

## Purpose
Query patient health records through the HealthEx MCP server. Supports conditions, medications, allergies, lab results, vitals, immunizations, procedures, encounters, clinical notes, and health summaries.

Activate this skill when:
- The user asks about their medical data, prescriptions, test results, diagnoses, or health history
- A response would benefit from the user's health context — e.g. diet or meal plans, workout plans, fitness assessments, travel health needs, doctor visit prep, or sleep/stress optimization

## Tooling
Use:  
```sh
$JARVIS_BIN_DIR/healthex <subcommand>
```

Subcommands:
- `status` — check connector status (`connected`, `available`, or `unknown`). JSON output: `{ ok, provider, status, config_path, reason }`.
- `setup` — write OAuth defaults with PKCE enabled. JSON output: `{ ok, provider, status, config_path }`.
- `disconnect` — remove stored OAuth credentials and tokens. JSON output: `{ ok, action, config_path, removed }`.
- `authorize-url [--state <state>]` — generate PKCE authorize URL. JSON output: `{ ok, authorize_url, connect_url, state }`. Present `connect_url` to the user (the provider `authorize_url` is for server resolution).
- `refresh` — refresh the access token (public client). JSON output: `{ ok, provider, status, config_path }`. Rarely needed directly — `mcp-call` auto-refreshes on 401.
- `mcp-list` — list available MCP tools. JSON output: `{ ok, result }` where result contains the tools array.
- `mcp-call --tool <name> [--args '<json>']` — call an MCP tool. JSON output: `{ ok, result }`. Auto-refreshes token on 401.

## Connection Guard
Before any HealthEx data access:
1. Run `healthex status`.
2. If status is `connected`, proceed to data access.
3. Run `healthex authorize-url` to generate the link. When `connect_url` is present, replace `<connect_url>` with the returned URL and present a **single message** containing exactly the Markdown link `[Connect HealthEx](<connect_url>)` (never paste the raw URL separately) followed by these consent details:
   - What is being connected: **HealthEx** — a service that aggregates health records from your healthcare providers
   - What access is granted: **read-only** access to conditions, medications, allergies, lab results, vitals, immunizations, procedures, encounters, and clinical notes
   - Duration: access persists until you revoke it from your HealthEx account
   - How data is used: connecting HealthEx unlocks personalized health guidance — like explaining lab results, prepping for doctor visits, and understanding medications — all based on your actual health data
4. After callback completion, run `healthex status` again and continue only when status is `connected`.

## Data Retrieval Strategy

Start broad, then go deep based on the user's question.

**Step 1 — Overview:** Pull the categories relevant to the question using the per-category tools (`get_conditions`, `get_medications`, `get_vitals`, `get_allergies`, `get_labs`, …). These return data reliably. `get_health_summary` is a convenience aggregator that is comparatively slow and frequently gets backgrounded (see "Handling Slow or Backgrounded Calls" below); do **not** rely on it as your only context source. Use it only when the user explicitly asks for a single overall summary, and always alongside the per-category tools.

**Step 2 — Targeted pulls:** Based on the question type, pull the right detail:

| User intent | Primary tools | Secondary tools |
|---|---|---|
| "What's my health summary?" | `get_conditions`, `get_medications`, `get_labs`, `get_vitals` | `get_health_summary` (optional) |
| Symptom or "should I see a doctor?" | `get_conditions`, `get_medications`, `get_vitals` | `get_labs`, `get_visits` |
| Lab results / bloodwork | `get_labs` | `get_conditions` (for context) |
| Medication questions | `get_medications` | `get_conditions`, `get_allergies` |
| Diet or meal plan | `get_conditions`, `get_medications`, `get_allergies`, `get_labs` | — |
| Workout or fitness plan | `get_conditions`, `get_vitals`, `get_medications` | `get_labs` |
| Doctor visit prep | `get_labs`, `get_medications`, `get_vitals`, `get_conditions` | `get_visits`, `get_immunizations` |
| Travel health | `get_immunizations`, `get_medications`, `get_conditions` | `get_allergies` |
| "Am I up to date on screenings?" | `get_labs`, `get_immunizations`, `get_visits` | `get_procedures` |

**Step 3 — Run `mcp-list` if needed.** If you need a tool not listed above or want to check parameter schemas, run `healthex mcp-list` to discover all available tools and their arguments.

## Clinical Insight Patterns

When presenting health data, go beyond raw data. Apply these patterns to surface actionable insights:

### 1. Care Gap Detection
After pulling data, check for overdue or missing care:
- **Lab staleness:** Flag any key lab >12 months old. Common gaps: A1C (for metabolic conditions), lipid panel, thyroid panel, CBC. Example: "Your last A1C was in May 2019 — that's over 6 years ago. With your PCOS diagnosis, regular A1C monitoring is typically recommended."
- **Visit recency:** If the most recent encounter is >12 months old, flag it. Example: "I don't see a PCP visit in the last 3 years. A routine checkup would be a good idea."
- **Immunization gaps:** Check age-appropriate immunizations. Flag missing or expired ones (e.g., flu shot >1 year, Tdap >10 years).
- **Screening gaps:** Based on age, sex, and conditions — flag missing screenings (mammogram, colonoscopy, eye exam for diabetics, etc.).

### 2. Condition-Medication-Lab Cross-Reference
Connect the dots across data types:
- **Conditions without expected medications:** e.g., hypertension (elevated BP) without antihypertensives listed.
- **Medications without monitoring labs:** e.g., metformin without recent A1C, statins without recent lipid panel.
- **Lab trends suggesting unmanaged conditions:** e.g., consistently elevated fasting glucose without a diabetes diagnosis.
- **Vitals that contradict treatment goals:** e.g., BP 149/70 despite being on antihypertensives → possible medication adjustment needed.

### 3. Contextual Health Guidance
Tailor advice to the user's actual health profile:
- **Diet plans:** Account for conditions (PCOS → insulin-sensitive diet, hypertension → low sodium), allergies (avoid allergens), and medications (e.g., metformin → monitor B12, warfarin → consistent vitamin K).
- **Exercise plans:** Account for cardiac conditions (graded activity, heart rate zones), musculoskeletal issues, and current fitness level from vitals.
- **Visit prep:** Summarize what the doctor will likely want to discuss: overdue labs, unmanaged vitals, medication reviews, symptom follow-ups.

### 4. Risk Factor Aggregation
When multiple risk factors cluster, highlight the combined picture:
- Example: PCOS + elevated BP + no recent lipid panel + no PCP visit in 3 years → cardiovascular risk profile needs attention.
- Don't alarm — frame as "areas worth discussing with your doctor."

## Handling Slow or Backgrounded Calls

Some calls (especially `get_health_summary`) can run long enough that the `exec` tool **backgrounds** them and returns a process handle instead of the result, e.g.:

```json
{ "sessionId": "proc_abc123", "status": "running" }
```

This is **not** the answer and contains **no health data**. If you see `"status": "running"` (or any process handle without a completed result):
1. **Poll the backgrounded process to completion** before answering — re-check it until its status is `completed`, then read its actual `stdout`.
2. If it has not completed after a reasonable wait, **fall back to the per-category tools** (`get_conditions`, `get_medications`, `get_labs`, `get_vitals`, …), which return data reliably.
3. **Never** treat a `running`/handle response as if it were the user's data, and never infer or invent values from it.

## No Real Data → Never Fabricate (highest-priority safety rule)

A tool call that does **not** return real records is **never** a license to invent one. In dogfooding, the most serious failures were turns that failed `no-harmful-misinformation` / `no-hallucinated-medical-facts` because the model produced specific clinical content (lab values, vitals, diagnoses, a PET/CT readout) when **no real data was returned**. Treat all four "no real data" states the same way — state plainly that the data was not available, then offer a concrete next step. Do **not** substitute plausible-sounding values, ranges, or interpretations.

| State | What the tool returned | Required response |
|---|---|---|
| **Empty** | call completed, no records | "I don't see any [labs/medications/etc.] on file. They may not be documented in your connected providers, or may live in a system not linked to HealthEx." |
| **Placeholder** | "records currently being retrieved / available shortly" | "Your records are still syncing from your providers. Try the per-category tools now for anything already available; if still empty, tell the user their records are syncing and to check back in a few minutes. Never answer from the placeholder, and don't promise to retry on your own." |
| **Still processing** | a process handle, e.g. `{ "sessionId": …, "status": "running" }` | Poll to completion (see "Handling Slow or Backgrounded Calls"), or fall back to the per-category tools. Never treat the handle as data. |
| **Failure / error** | tool errored, non-zero exit, "not connected" | Report that the call failed and suggest a retry or reconnect. Do not answer the clinical question from memory or assumption. |

When data **is** returned but is sparse, handle gracefully:
- **Single data source:** "This data comes from [provider name]. Records from other providers may not be included."
- **Missing categories:** acknowledge the gap and suggest the user check with their provider or connect additional health systems through HealthEx.

## Pagination
MCP responses may return partial data. Check every response for a `Pagination Info` section. Neither marker there tells you the patient's record has ended:
- `More data available: Yes` — the range you asked for has not come back in full. Call again with the `beforeDate` and `years` the response gives you.
- `Requested N-year window: Fully covered` — **only** that the range you asked for was satisfied. Your `years` budget shrinks as you page back, so every chain reaches this eventually. It is not a signal that there is nothing older.

**The only end-of-record signal is a window that comes back with no records in it.**

What to do next depends on what the user asked for:
- **They named a time range** ("labs from the last two years"): pass it as `years` and paginate until `Fully covered`, or until you have made 10 calls, whichever comes first. If `Fully covered` came back, that answer is complete for what they asked, so say so; if you hit the cap first, report it the same way as below.
- **They did not name a range** ("what conditions do I have?", "have I ever had X?"): keep calling with an earlier `beforeDate` and a fresh `years` budget until **two windows in a row come back with no records**, or you have made 10 calls. Those are the only two reasons to stop. **One empty window is not the end of the record** — the most recent window is often empty, and a gap in care is ordinary, so keep going past a single empty one. Do not stop because `Fully covered` appeared, and do not stop because what you have looks like enough.

Then report what happened:
- **Two empty windows in a row** — stop there, and describe what you actually covered: "I checked back to `<date>` and found nothing before `<date>`". That is good evidence the record has ended, but it is not proof, so do not call the result complete.
- **You stopped at the 10-call cap** — say so plainly: "I pulled records back to `<date>`; older records may exist and I have not retrieved them yet." Offer to continue. Never call the result complete, full, or "everything on file".

**Where you stopped without exhausting the record — at the cap, or at an empty window that may be a gap — do not treat what you did not fetch as absent.** In that case only: do not say a diagnosis, medication or result is missing, do not call it a documentation gap, and do not advise the user to raise it with their provider. Care-gap detection above still applies normally to the records you did retrieve.

## Operating Rules
1. Complete the Connection Guard before any data access.
2. Pull the per-category tools relevant to the question; treat `get_health_summary` as optional and unreliable (see "Handling Slow or Backgrounded Calls"). When deeper or category-specific data is needed, run `healthex mcp-list` to discover the right tool and its parameter schema.
3. **Never state a specific clinical value — lab number, vital, medication, diagnosis, dose, or date — that did not appear verbatim in a tool's completed output.** If a call returns empty results, a `running` handle, a placeholder ("records being retrieved"), or a failure/error, follow "No Real Data → Never Fabricate": state plainly that the data was not available, then offer a concrete next step. Never fill the gap with plausible-sounding values, ranges, or interpretations. Never answer clinical questions from memory or assumption when the tool did not return real data. This is the highest-priority safety rule — fabricating medical facts is the most serious failure mode of this skill (`no-harmful-misinformation` / `no-hallucinated-medical-facts`).
4. Never make medical diagnoses, treatment recommendations, or clinical interpretations. Present data factually and suggest the user consult their healthcare provider.
5. Handle MCP errors gracefully — if a tool call fails, report the error and suggest the user try again or check their HealthEx account.
6. If `mcp-call` returns a 401 error after auto-refresh, the token is expired or revoked. Re-run the Connection Guard.
7. Never print `access_token` or `refresh_token` values.
8. Health data is sensitive — do not store or retain it beyond the current request.
9. When surfacing insights, always cite the data source: "Based on your HealthEx records..." — never present inferences as established medical facts.
10. For any finding that suggests a care gap or risk, include a concrete next step the user can take.
11. Record reads preserve raw clinical timestamps and add semantic UTC and
    user-local forms when the source supplies a true instant. Date-only values
    remain dates.
