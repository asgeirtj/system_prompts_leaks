---
name: "withings"
description: "Use when linking Withings or reading Withings body measurements, activity, sleep, workout, heart, and intraday data."
icon: "withings"
metadata: { "includeInPrompt": false }
---

# Withings

Query Withings body measurements, activity, sleep, and workout data via the bundled `withings` CLI.

## When to Use

Activate when the user asks about their Withings data:
- Body metrics (weight, BMI, body fat, blood pressure, heart rate)
- Daily activity (steps, calories, distance, active duration)
- Sleep sessions (score, stages, duration, breathing rate)
- Workout sessions (run/walk/cycle/etc.)

## Tooling

Three subcommands cover most needs:

| Subcommand | Purpose |
|---|---|
| `withings status` | Connection state (`{ok, status, connect_url?, disconnect_url?, reason?}`). |
| `withings list-fields --category <CAT>` | Field list for a category (snake_case, units in the name). |
| `withings query --category <CAT> --start-date <YYYY-MM-DD> [--end-date --interval --fields]` | Typed snake_case records. Returns a JSON array. |

### Categories

- `daily-metrics` — Daily rollup of Activity (steps/calories/distance/HR) + Measures (weight/BP/body composition). Supports `--interval hourly|daily|weekly` (defaults to `daily`). Aggregation rules: **sum** for counters (`step_count`, `active_energy_burned_kcal`, `distance_walking_running_meters`), **avg** for `hr_average_bpm`, **max** for `hr_max_bpm`, **last-of-bucket** for body measurements (weight/BP/body fat etc.).
- `sleep` — One row per sleep session (score, stages, duration, HR, breathing).
- `workout` — One row per workout session (translated `workout_type` name, duration, distance, calories, HR).

Use `list-fields` to discover available fields per category.

### Output

JSON to stdout. Datetimes are local `YYYY-MM-DD HH:MM:SS` per record's timezone. Session rows include `id` (prefixed `withings_<id>`), `start_datetime`, `end_datetime`, `timezone`. `daily-metrics` buckets include `date` / `hour` / `week_start` + `record_count` instead of `id`.

### Examples

```bash
# Recent workouts
withings query --category workout --start-date 2026-05-01

# Weight trend (last reading per day)
withings query --category daily-metrics --start-date 2026-04-01 --fields body_mass_kg

# Weekly step totals
withings query --category daily-metrics --start-date 2026-04-01 --interval weekly --fields step_count
```

## Auth

Before any Withings API call:
1. Run `withings status`.
2. If `status` is `not_connected`, share `[Connect Withings](<connect_url>)` exactly — never paste the raw URL.
3. After the user completes the callback, re-run `withings status` and proceed only when `connected`.

For disconnect: run `withings disconnect` and share `[Disconnect Withings](<disconnect_url>)` if present.

Never print tokens or credentials.

## Operating Rules

1. Treat linking as one-time onboarding — don't re-prompt for auth unless calls keep failing.
2. Prefer `query --category <CAT>` over the legacy commands. Field names are snake_case with units in the name (`body_mass_kg`, `step_count`, `hr_average_bpm`, `sleep_total_duration_sec`) — never expose Withings's numeric meas-type IDs to the user.
3. **If unsure of a field name, run `withings list-fields --category <CAT>` BEFORE composing `query --fields`.** Withings-native names (`calories`, `distance`, `hr_average`, `weight`) are NOT valid — they're translated to snake_case with units (`energy_burned_kcal`, `distance_meters`, `hr_average_bpm`, `body_mass_kg`). An empty filter result usually means the field name was wrong, not that the data is missing.
4. Default to the last 7 days when the user asks for recent trends without specifying dates.
5. For broad trends, use `--category daily-metrics --interval weekly` instead of pulling every reading. The `--interval` flag already aggregates per the rules above — do NOT apply additional aggregation (sum/avg) to the bucketed output client-side.
6. If `query` returns `[]`, say so clearly — never invent values. If the user is asking for a metric not surfaced by `list-fields`, drop to the legacy escape hatch (`measures --meas-types <ID>` or a more specific subcommand like `heart-list`; see [references/commands.md](references/commands.md) for the meas-type ID table).

## Legacy / Advanced Commands

Pre-`query` per-endpoint passthroughs that return raw `{ok, status, body: <Withings native>}` envelopes. Use only as an **escape hatch** for data not exposed by `query` — e.g. a meas-type missing from the translation table (`withings measures --meas-types 130` for AFib ECG result), high-frequency sleep sensor data (`withings sleep`), or ECG signals (`withings heart-list` / `heart-get`).

Quick reference for the other passthroughs:
- `withings activity` — raw daily Activity rows.
- `withings sleep-summary` — raw nightly sleep summaries with Withings-native field names.
- `withings intraday` — minute-resolution activity sensor data.
- `withings devices` — list paired Withings devices.

Full command matrix, meas-type IDs, and Withings → Muse field mapping: [references/commands.md](references/commands.md).
- Permission-withheld data: while the user's "Read measurements and heart
  data" permission is deny or ask, `query --category daily-metrics` wraps its
  rows in `{"withheld": {...}, "records": [...]}` with body metrics (weight,
  blood pressure, SpO2, heart measurements) removed, and a request for only
  those fields fails with `data_class_excluded`. Key off the `withheld`
  marker: when present, the permission is restricting those fields — say so
  instead of "no readings". When the user actually needs a withheld metric
  and the permission requires approval (`withheld.reason` is
  `requires_approval`, or a body-metrics-only query failed with
  `data_class_excluded` saying it requires approval), run
  `withings measures --category 1 --start-date <d> --end-date <d>`, which is
  governed by that permission and shows the user the approval prompt. Sleep
  and workout results are never wrapped; a response without the marker is an
  ordinary result.
