# Health Connect

- Health Connect data reaches Muse from the user's Android phone. Run `/opt/hatch/bin/health-cli` with `--provider healthconnect` on every command, because the flag has no default.

- This connector serves Android phones only. When unsure, check that the phone's `platform` in `device.list` is `android`, and use [Apple Health](/opt/hatch/connectors/apple_healthkit/CONNECTOR.md) for an iPhone. Records can come from other apps and wearables that share data with Health Connect, not only from the phone.

- Reads run without asking by default. Each delete asks for fresh approval.

## Connect

```text
/opt/hatch/bin/health-cli auth connect --provider healthconnect
/opt/hatch/bin/health-cli status --provider healthconnect
```

- Before querying, check the phone with `device.describe`. Its `is_permission_granted` for health data shows whether the user allowed syncing, and `connection_state` shows whether the phone is online. Then run `status` to see which categories have synced records and their date range.

- There is no provider login and no link. When permission is missing and the phone is online, run `auth connect`. It describes the step, which is running the phone's `health.backfill` command through `device.invoke` for the last seven days.

- That backfill opens the Health Connect permission prompt on the phone. Once the user agrees, it syncs that week.

- When the phone is offline, new data cannot sync, so say that rather than asking for permission.

- `status` shows what has already synced: `daily-metrics`, `sleep` and `workout` with each category's `record_count`, `earliest_datetime` and `latest_datetime`.

- To disconnect, the user opens Settings, chooses Connectors, selects Health Connect and taps Manage, then revokes the app's Health Connect permissions in Android settings. Neither the CLI nor an in-chat widget can do it, and disconnecting does not delete synced records.

## Choose the query

- Every query needs `--start-date YYYY-MM-DD`, and `--end-date` defaults to today in the user's timezone. Resolve relative dates such as "last week" from the current date.

```text
/opt/hatch/bin/health-cli query metrics --provider healthconnect --start-date 2026-09-01 --end-date 2026-09-07 --interval daily --fields FIELD,FIELD
/opt/hatch/bin/health-cli query sessions --provider healthconnect --category sleep --start-date 2026-09-06
/opt/hatch/bin/health-cli query samples --provider healthconnect --start-date 2026-09-07 --start-time 06:00 --end-time 07:30 --fields heart_rate --output PATH
```

- `query metrics` returns all-day rollups in `hourly`, `daily` or `weekly` buckets through `--interval`, with `daily` as the default. It has no `--category`. Prefer it for trends.

- `query sessions --category sleep|workout` returns one record per session and takes no interval. A night's sleep starts the evening before, so include that date.

- `query samples` returns raw points such as intraday heart rate, GPS `location` and sleep-stage timelines. Use it only when individual readings matter. `--fields` selects sample types rather than columns, `--limit` defaults to 1000 rows, and `--start-time` and `--end-time` (HH:MM) narrow the day.

- Write dense samples to a file with `--output PATH`, which saves CSV and prints only a summary with the path, row count, columns and coverage. `--format csv` prints CSV instead of JSON.

## Discover fields

```text
/opt/hatch/bin/health-cli query metrics --provider healthconnect --list-fields
/opt/hatch/bin/health-cli query sessions --provider healthconnect --list-categories
/opt/hatch/bin/health-cli query sessions --provider healthconnect --category workout --list-fields
/opt/hatch/bin/health-cli query samples --provider healthconnect --list-fields
```

- Daily-metric names depend on what the phone synced and differ from Apple Health's, so discover them before filtering. An empty filtered result usually means a wrong field name.

- In metric discovery, `observed: true` with a `count` marks names present in this user's data, and `observed: false` marks known names with nothing synced yet. `degraded: true` means the synced names could not be read, so every `observed` is null.

## Read the results

- Metric and session reads return `{"coverage": {...}, "records": [...]}`. Session records carry an `id` such as `healthconnect_...` and local `start_datetime`, `end_datetime` and `timezone`. Metric buckets carry `date`, `hour` or `week_start` with `record_count`.

- Field names are normalized snake_case with units, such as `hr_average_bpm`, `average_speed_mps` and `sleep_deep_duration_sec`.

- When a window spans more than one device, the output sets `multi_node: true`. Metrics move into per-device `node_groups` and session and sample rows gain a `node_id`, so never add values across devices.

- `location` samples are raw coordinates. Do not infer place names from them.

## Fill sync gaps

- If `coverage.complete` is false, some days in the window have not synced and the results are partial, even when permission is granted. Tell the user, sync the range and query again before reading a gap as inactivity.

- To sync, confirm in `device.describe` that the phone is online and offers `health.backfill`, then run it with `device.invoke` using the `start_date` and `end_date` from `coverage.warning`. The sync runs in the background and its completion message resumes the conversation, so do not poll. An offline phone cannot sync new data.

- `status --check-missing-entries --start-date YYYY-MM-DD [--end-date YYYY-MM-DD]` gives a deeper report with `unsynced_dates` and the 30-minute `missing_intervals`.

- With complete coverage, an empty result means nothing was recorded for that range.

## Delete records

```text
/opt/hatch/bin/health-cli delete --provider healthconnect --all
/opt/hatch/bin/health-cli delete --provider healthconnect --device-id NODE_ID
/opt/hatch/bin/health-cli delete --provider healthconnect --start-date 2026-03-01 --end-date 2026-03-31
```

- Use `delete` for any request to delete, remove, erase or clear Health Connect data. Moving files, disconnecting or writing to the database neither removes records nor leaves an audit trail.

- Pass `--all` alone, or any mix of `--device-id` (one paired device, by the `node_id` that multi-device results show), `--start-date` and `--end-date`. Dates are `YYYY-MM-DD` in the user's timezone or epoch seconds. A record that overlaps the range is included, a start date alone means that day onward, and an end date alone means through that day.

- Every record kind for Health Connect goes at once, with no per-category or per-record option. A delete never touches Apple Health, so clearing both takes one run for each provider.

- A delete is irreversible, so settle the device and dates in conversation, then run the command once. A declined or expired approval exits with code 3 and deletes nothing, so report it and stop without trying other filters or the other provider.

- Zero matches is a success. Say nothing matched rather than widening the dates or switching to `--all`.

- Report the counts in `deleted.records`, not `deleted.total_rows`, which also counts child value rows. Records still in Health Connect on the phone can return with a later sync.

## Related skills

- [Fitness Tracking](/opt/muse/skills/fitness-tracking/SKILL.md)

- [Goals](/opt/muse/skills/goals/SKILL.md)

- [Health Review and Visit Preparation](/opt/muse/skills/health-review/SKILL.md)

- [Workout Planning](/opt/muse/skills/workout-planning/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.

### When available

- These skills depend on the user's channel or devices. `muse.skill_search` shows which ones this session has.

- [Health Research](/opt/muse/skills/health/SKILL.md)
