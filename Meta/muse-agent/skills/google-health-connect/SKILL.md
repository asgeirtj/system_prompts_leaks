---
name: "google_health_connect"
title: "Health Connect"
description: "The user's synced Google Health Connect data from their Android device: daily metrics (steps, distance, calories, heart rate, HRV, VO2max), sleep sessions (stages, quality, efficiency), and workouts."
metadata: { "includeInPrompt": true }
---

# Health Connect

Read the user's synced Google Health Connect data with the `health-cli`
binary. Every command below takes `--provider healthconnect`.

This skill serves Android devices only. If the user's paired device is not an
Android device, it has no data for them — check the `platform` field returned
by `device.list` when you are unsure.

## When to Use

When the user asks about their synced Health Connect data, sync status, or  
sources:
- All-day metrics/vitals: steps, distance, calories, heart rate, HRV, VO2max.
- Sleep sessions: stages, quality, efficiency, awakenings.
- Workouts: type, duration, calories, distance, HR.

## Tooling

Binary: `health-cli`. **`--provider healthconnect` is required on every command
below** — it is not optional and has no default; omitting it is a usage error.
Commands group by data *shape* under `query`:
- `query metrics --provider healthconnect` — all-day metric rollups
- `query samples --provider healthconnect` — raw, unbucketed data points (intraday HR/steps, GPS, sleep stages)
- `query sessions --provider healthconnect` — discrete sessions: sleep, workout
- `status --provider healthconnect` — data-sync status
- `auth connect --provider healthconnect`, `auth disconnect --provider healthconnect`
- `delete` — **erase stored records** (destructive; see below)

**Multi-device (rare):** when a window spans >1 device the envelope adds
`"multi_node": true` — `query metrics` returns per-device `node_groups`;
`query samples`/`sessions` add a `node_id` to each record (samples CSV gains a
leading `node_id` column). Single-device output is unchanged; never sum or
double-count across devices.

### query metrics — all-day metric rollups

```bash
health-cli query metrics --provider healthconnect \
  --start-date <YYYY-MM-DD> [--end-date <YYYY-MM-DD>] \
  [--interval hourly|daily|weekly] [--fields a,b,c] [--timeout-secs N]
```
`daily-metrics` is the only domain so there is **no `--category`**. One row per
`--interval` bucket (default `daily`). `--start-date` required; `--end-date`
defaults to today. Output is an envelope `{ "coverage": {...}, "records": [...] }`
(see Coverage below).

`--list-fields` reads the metric field names from the synced data →  
`{ ok, provider, category, observed_count, fields: [{ name, observed, count? }] }`.  
`observed: true` (with a row `count`) means the name is present in this user's
data — those are exactly the names `--fields` matches. `observed: false` means
the build knows the field but nothing has synced yet. If the field set can't be
read the response carries `degraded: true` and every `observed` is `null`.

### query sessions — discrete sessions

```bash
health-cli query sessions --provider healthconnect --category sleep|workout \
  --start-date <YYYY-MM-DD> [--end-date <YYYY-MM-DD>] [--fields a,b,c]
```
- `sleep` — one row per sleep session.
- `workout` — one row per workout/activity.

Sessions are never bucketed (no `--interval`). Discovery: `--list-categories` →
`{ ok, provider, categories }`; `--list-fields` (needs `--category`) →
`{ ok, provider, category, fields }` (e.g. workout has `is_indoor`).

**Output:** normalized snake_case records; the same concept uses the same field
name (e.g. workout `average_speed_mps`, `elevation_gain_meters`,
`hr_average_bpm`). Session records carry a provider-prefixed `id`
(`healthconnect_…`) + `start_datetime`/`end_datetime`/`timezone`; metric buckets
carry `date`/`hour`/`week_start` + `record_count`.

**Coverage:** queries return an envelope `{ "coverage": {...}, "records": [...] }`.
`coverage.complete` is `false` when days in the window aren't synced from the
device; `coverage.warning` then holds the exact `backfill_data_source` command
to run. **Surface that warning to the user / act on it** — results are partial
until the backfill completes.

### query samples — raw, unbucketed data points

```bash
health-cli query samples --provider healthconnect --start-date <YYYY-MM-DD> \
  [--end-date <YYYY-MM-DD>] [--start-time <HH:MM[:SS]>] [--end-time <HH:MM[:SS]>] \
  [--fields <type1,...>] [--limit <n>] [--format stdout|csv] [--output <path>]
health-cli query samples --provider healthconnect --list-fields   # discover sample types
```
Individual samples — finer than the `query metrics` rollups (intraday HR/steps,
GPS, sleep-stage timelines; `query sessions` gives stage totals only). `--fields`
selects sample **types** (not output columns) — run `--list-fields` to see the
types this user has synced. GPS is `location` (raw lat/lon — don't infer place
names from it). For dense reads use `--output <path>`: it writes CSV into the
agent filesystem for a later script step and prints only a summary, keeping
thousands of rows out of context.

### status — data-sync status

```bash
health-cli status --provider healthconnect [--timeout-secs N] \
  [--start-date <YYYY-MM-DD>] [--end-date <YYYY-MM-DD>] [--check-missing-entries]
```
Returns `{ categories: [{ name, record_count, earliest_datetime,
latest_datetime }] }`. With `--check-missing-entries` (requires `--start-date`):
a deep per-30-min-interval gap report (`unsynced_dates`, `missing_intervals`, …).

### auth connect

```bash
health-cli auth connect --provider healthconnect [--timeout-secs N]
```

Run this and follow the instruction to connect to Health Connect data.

### auth disconnect

```bash
health-cli auth disconnect --provider healthconnect [--timeout-secs N]
```

Health Connect cannot be disconnected through this CLI or an in-chat widget.
Tell the user to open **Settings → Connectors → Health Connect → Manage**, then
revoke the app's Health Connect permissions in Android settings.

### delete — erase stored Health Connect records

```bash
health-cli delete --provider healthconnect --all             # every Health Connect record
health-cli delete --provider healthconnect --device NODE_ID  # one paired device
health-cli delete --provider healthconnect --start-date 2026-03-01 --end-date 2026-03-31
```
Use for any request to delete, remove, erase, wipe, or clear Health Connect
data. Never improvise it by moving files, disconnecting the connector, or
writing to the database — those neither remove records nor leave an audit
trail. A delete never spans providers; to clear both, run it once per provider.

`--all` takes no other filter; `--device`/`--start-date`/`--end-date` are used
instead of it. All record kinds go at once — no per-category or per-record-ID
delete. Dates are `YYYY-MM-DD` in `JARVIS_USER_TIMEZONE` or epoch seconds; a
record is in range when it starts before the end and ends after the start, so a
session straddling a bound is included. `--start-date` alone deletes from that
day onward, `--end-date` alone up to and including it.

**Destructive and irreversible**, behind a fresh one-time approval showing the
normalized filters. Run it **once per request** — settle provider, device and
dates in conversation first. Denial exits **code 3** with nothing deleted; that
is final, so report it rather than retrying other filters or the other provider.

**Zero is a success**, not a miss — nothing matched, so say so and stop rather
than widening dates or re-running with `--all`. Report `deleted.records`, not
`total_rows`, which also counts child value rows. If Health Connect on the
device still holds the records, a later sync can bring them back.

## Auth

Device-synced; no login. Data availability depends on the Health Connect
permission being approved on the user's Android device + sync. Use `status` to
see synced ranges and the `backfill_data_source` device action (surfaced in
query `coverage.warning`) to pull a range.

## Operating Rules

1. Pick the command by data shape: `query metrics` (all-day rollups),
   `query samples` (raw points — only when individual samples matter; prefer
   `metrics` for trends), or `query sessions --category sleep|workout` (discrete
   events).
2. Always pass `--provider healthconnect` and `--start-date`; `--end-date`
   defaults to today. Use current-date context for relative asks ("today",
   "last week"); use sample time bounds for narrow intraday windows.
3. **Coverage:** if a `query metrics`/`sessions` returns `coverage.complete:
   false`, tell the user the data is partial and relay/act on `coverage.warning`
   (run the `backfill_data_source` action, then re-query).
4. `query metrics` defaults to `--interval daily`; sleep spans midnight (include
   both evening start and morning end dates).
5. On empty results, the range likely has no data; widen it, or check `status` /
   coverage and backfill.
