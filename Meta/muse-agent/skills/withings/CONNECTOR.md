# Withings

- Run `/opt/hatch/bin/withings` to read the user's Withings account. Every command returns JSON.

- Activity, sleep and workouts follow one read permission. The user's "Read measurements and heart data" permission separately governs weight, blood pressure, heart readings and other body measurements.

## Connect

```text
/opt/hatch/bin/withings status
/opt/hatch/bin/withings authorize-url
```

- Check `status` before the first read and when a read fails on authentication. If it is `not_connected`, run `authorize-url` and share its `connect_url` as a Connect Withings link, check `status` again after the user finishes and continue only when it is `connected`.

- `status` itself returns no link. Linking is one-time, so do not ask the user to reconnect a working account.

- To disconnect at the user's request, run `disconnect`, which removes the stored connection at once. Never print tokens or credentials.

## Query measurements

```text
/opt/hatch/bin/withings list-fields --category daily-metrics
/opt/hatch/bin/withings query --category daily-metrics --start-date 2026-09-01 --end-date 2026-09-07 --fields body_mass_kg,body_fat_percentage
/opt/hatch/bin/withings query --category daily-metrics --start-date 2026-08-01 --interval weekly --fields step_count
/opt/hatch/bin/withings query --category sleep --start-date 2026-09-06
```

- Categories are `daily-metrics`, `sleep` and `workout`. `--start-date` is required and `--end-date` defaults to today. Both dates are inclusive. When the user asks about recent trends without dates, query the last seven days.

- Field names are snake_case with units, such as `body_mass_kg`, `step_count`, `hr_average_bpm` and `sleep_total_duration_sec`. Withings names such as `weight` or `hr_average` are not valid. `--fields` takes a comma-separated list. Run `list-fields` before filtering when unsure, because an empty filtered result usually means a wrong field name, not missing data.

- `--interval hourly|daily|weekly` applies to daily metrics only, defaults to `daily` and already aggregates, so never sum or average the buckets again:
  - Counters such as steps, calories, distance, elevation and activity durations are summed.
  - `hr_average_bpm` is averaged and `hr_max_bpm` takes the maximum.
  - Body measurements, blood pressure, oxygen saturation and temperatures keep the last reading in each bucket, so a daily weight is that day's last weigh-in.

- Use weekly buckets for broad trends instead of pulling every reading.

- Sleep and workout rows carry a `withings_` ID with local `start_datetime`, `end_datetime` and `timezone`. Metric rows carry `date`, `hour` or `week_start` with `record_count`. Datetimes are local strings rather than Unix timestamps, and field filtering always keeps these time, grouping and ID fields.

- Workout types arrive as names. An unrecognized type is left out rather than guessed.

- An empty array means no matching records. Say so plainly and never fill in values.

## When body measurements are withheld

- While "Read measurements and heart data" is set to Deny or Ask, a daily-metrics query returns `{"withheld": {...}, "records": [...]}`. The records omit the body measurements named in `withheld.fields`, such as weight, blood pressure and oxygen saturation, and a query for only those fields fails with `data_class_excluded`.

- Report the restriction instead of saying the user has no readings.

- When the task needs a withheld measurement and `withheld.reason` is `requires_approval`, or a measurements-only query said approval is required, run `measures --category 1` for the needed dates. That command asks the user through the same permission. When the reason is `denied`, tell the user the permission is set to Deny.

- Sleep and workout results are never wrapped.

## Read raw data

- For readings the standard query does not expose, such as every reading within a day, ECG recordings, high-frequency sleep data or the device list, read the [raw command reference](references/commands.md). Raw commands return Withings' own fields inside `{ok, status, body}`.

- Never show the user Withings' numeric measurement type IDs.

## Limits

- The connector only reads. It cannot add or edit measurements or change device settings.

- A query reads at most 20 provider pages per category, so narrow the dates for a long history rather than claiming complete coverage.

- The connector allows 90 requests a minute, so prefer one wider query over many narrow ones.

## Related skills

- [Fitness Tracking](/opt/muse/skills/fitness-tracking/SKILL.md)

- [Health Review and Visit Preparation](/opt/muse/skills/health-review/SKILL.md)

- [Workout Planning](/opt/muse/skills/workout-planning/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.

### When available

- These skills depend on the user's channel or devices. `muse.skill_search` shows which ones this session has.

- [Health Research](/opt/muse/skills/health/SKILL.md)
