# Withings CLI Commands

Use the installed `withings` CLI from `PATH`. All commands return JSON.

---

## Recommended path — healthkit-shape surface

These three subcommands cover most agent needs with normalized snake_case fields, units in the name, and category-aware aggregation. Prefer these for new code.

### `withings status`

Returns connection state for the active auth backend.

```json
{
  "ok": true,
  "status": "connected",
  "connect_url": null,
  "disconnect_url": "https://..."
}
```

When not connected:

```json
{"ok": true, "status": "not_connected", "connect_url": "https://...", "reason": "withings is not connected"}
```

### `withings list-fields --category CATEGORY`

Returns the field list for a category. `CATEGORY` ∈ `daily-metrics`, `sleep`, `workout`.

### `withings query --category CATEGORY --start-date YYYY-MM-DD [...]`

Flags:

| Flag | Required | Description |
|---|---|---|
| `--category` | yes | `daily-metrics`, `sleep`, or `workout` |
| `--start-date` | yes | `YYYY-MM-DD`, inclusive |
| `--end-date` | no | `YYYY-MM-DD`, inclusive, defaults to today |
| `--interval` | no | `hourly`, `daily`, `weekly` — daily-metrics only |
| `--fields` | no | Comma-separated subset of fields |

`query` returns a JSON **array** of records (not wrapped in `{ok, status, body}`),
with one exception: while the user's "Read measurements and heart data"
permission is deny or ask, `query --category daily-metrics` returns
`{"withheld": {...}, "records": [...]}` (rows without body metrics). Sleep and
workout always return the plain array.

### Output contract (new surface)

- Field names are snake_case with units in the name (no `measuregrps`, no integer meas-type IDs).
- Datetimes are local `YYYY-MM-DD HH:MM:SS` strings — NOT Unix epochs.
- Sessions (`sleep`, `workout`) include `id` prefixed `withings_<id>`.
- Aggregated `daily-metrics` buckets include `date` / `hour` / `week_start` + `record_count` (no `id`).
- `--fields foo` returns records with only `foo` + always-kept fields (`start_datetime`, `end_datetime`, `timezone`, `date`, `hour`, `week_start`, `record_count`, `id`).

### Daily-metrics aggregation rules

| Aggregation | Fields |
|---|---|
| **Sum** | `step_count`, `active_energy_burned_kcal`, `total_calories_kcal`, `distance_walking_running_meters`, `elevation_climbed_meters`, `soft_activity_duration_sec`, `moderate_activity_duration_sec`, `intense_activity_duration_sec` |
| **Avg** | `hr_average_bpm` |
| **Max** | `hr_max_bpm` |
| **Last** (most recent reading in bucket wins) | `body_mass_kg`, `body_fat_percentage`, `fat_free_mass_kg`, `fat_mass_kg`, `muscle_mass_kg`, `bone_mass_kg`, `hydration_kg`, `blood_pressure_systolic_mmhg`, `blood_pressure_diastolic_mmhg`, `vo2_max`, `spo2_percentage`, `body_temperature_celsius`, `skin_temperature_celsius`, `pulse_wave_velocity_meters_per_sec`, `basal_metabolic_rate_kcal`, `metabolic_age_years`, `visceral_fat`, `height_meters` |

### Withings → Muse field name mapping (new surface)

Translation table used internally by `query`. Agents only need to know the right-hand column (snake_case names returned in `query` output). Unmapped Withings meas-type IDs are dropped from `query` output — use the legacy `measures` command for those (see escape hatch below).

| Withings meas-type ID | Muse field |
|---|---|
| 1 | `body_mass_kg` |
| 4 | `height_meters` |
| 5 | `fat_free_mass_kg` |
| 6 | `body_fat_percentage` |
| 8 | `fat_mass_kg` |
| 9 | `blood_pressure_diastolic_mmhg` |
| 10 | `blood_pressure_systolic_mmhg` |
| 11 | `hr_average_bpm` |
| 12 | `temperature_celsius` |
| 35 | `co2_ppm` |
| 54 | `spo2_percentage` |
| 71 | `body_temperature_celsius` |
| 73 | `skin_temperature_celsius` |
| 76 | `muscle_mass_kg` |
| 77 | `hydration_kg` |
| 88 | `bone_mass_kg` |
| 91 | `pulse_wave_velocity_meters_per_sec` |
| 123 | `vo2_max` |
| 135 | `qrs_interval_ms` |
| 136 | `pr_interval_ms` |
| 137 | `qt_interval_ms` |
| 138 | `corrected_qt_interval_ms` |
| 139 | `atrial_fibrillation_ppg` |
| 155 | `vascular_age_years` |
| 167 | `nerve_health_score_conductance_feet` |
| 168 | `extracellular_water_kg` |
| 169 | `intracellular_water_kg` |
| 170 | `visceral_fat` |
| 174 | `fat_free_mass_segmental_kg` |
| 175 | `muscle_mass_segmental_kg` |
| 196 | `electrodermal_activity_feet` |
| 226 | `basal_metabolic_rate_kcal` |
| 227 | `metabolic_age_years` |

Workout-type translation (`workout_type` field in `query --category workout` output):  
`1=Walk, 2=Run, 3=Hiking, 4=Skating, 5=BMX, 6=Cycling, 7=Swimming, 8=Surfing, 9=Kitesurfing, 10=Windsurfing, 12=Tennis, 13=Table tennis, 14=Squash, 15=Badminton, 16=Weightlifting, 17=Calisthenics, 18=Elliptical, 19=Pilates, 20=Basketball, 21=Soccer, 22=Football, 27=Golf, 28=Yoga, 30=Boxing, 34=Skiing, 35=Snowboarding, 36=Rowing, 42=Climbing, 45=Indoor walk, 46=Indoor running, 47=Indoor cycling, 187=Stretching, 188=Cross training, 191=Fitness, 195=Other`, etc. (full list in source: `withings/src/schema.rs::WITHINGS_WORKOUT_TYPE_TO_NAME`). Unknown integers are dropped from `workout_type`.

---

## Legacy / Advanced commands

These passthroughs return raw Withings response shapes (`{ok, status, body: <Withings native>}`). Use them when:
- You need a meas-type that isn't in the translation table above (escape hatch).
- You need every individual reading within a day instead of aggregated last-of-day.
- You need high-frequency sleep / heart-recording sensor data.

### Auth

- `withings status` — Returns connector status with `connect_url` / `disconnect_url` when available.
- `withings authorize-url` — Returns the authorization URL for the active backend. Parse `authorize_url`. Prefer `withings status` (returns the same URL as `connect_url`).
- `withings disconnect` — Disconnects from the active backend.

### Data reads (raw passthrough)

- `withings measures [--category 1] [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--meas-types 1,4,11] [--offset <n>] [--last-update <ts>]`
- `withings activity [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--offset <n>] [--last-update <ts>]`
- `withings sleep-summary [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--offset <n>] [--last-update <ts>]`
- `withings sleep [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--meas-types <csv>]`
- `withings workouts [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--offset <n>] [--last-update <ts>]`
- `withings intraday [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD]`
- `withings heart-list [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--offset <n>]`
- `withings heart-get --signal-id <id>`
- `withings devices`

### Measurement Type IDs (`--meas-types` for legacy `measures` command)

Full reference, including IDs not exposed by the new `query` surface (use this when the agent needs raw access):

| ID | Metric |
|----|--------|
| 1 | Weight (kg) |
| 4 | Height (m) |
| 5 | Fat Free Mass (kg) |
| 6 | Fat Ratio (%) |
| 8 | Fat Mass Weight (kg) |
| 9 | Diastolic BP (mmHg) |
| 10 | Systolic BP (mmHg) |
| 11 | Heart Pulse (bpm) |
| 12 | Temperature (C) |
| 54 | SpO2 (%) |
| 71 | Body Temperature (C) |
| 73 | Skin Temperature (C) |
| 76 | Muscle Mass (kg) |
| 77 | Hydration (kg) |
| 88 | Bone Mass (kg) |
| 91 | Pulse Wave Velocity (m/s) |
| 123 | VO2 Max |
| 130 | AFib result (ECG) |
| 135 | QRS interval (ms) |
| 136 | PR interval (ms) |
| 137 | QT interval (ms) |
| 138 | Corrected QT interval (ms) |
| 139 | AFib result (PPG) |
| 155 | Vascular Age |
| 167 | Nerve Health Score |
| 168 | Extracellular Water (kg) |
| 169 | Intracellular Water (kg) |
| 170 | Visceral Fat |
| 173 | Fat Free Mass (segments) |
| 174 | Fat Mass (segments) |
| 175 | Muscle Mass (segments) |
| 196 | Electrodermal Activity |
| 226 | Basal Metabolic Rate |
| 227 | Metabolic Age |
| 229 | Electrochemical Skin Conductance |

### Legacy output contract

- Read commands return top-level `ok`, `status`, and `body`.
- `measures` uses `--category 1` for real measures and `--category 2` for user objectives.
- Date parameters accept `YYYY-MM-DD` format. The CLI converts dates to Unix timestamps where the API requires it.
- Value scaling: each measure in `body.measuregrps[].measures[]` is encoded as `{value, unit, type}` where the real value = `value * 10^unit`.

### Pagination

- Commands that support `--offset` return `body.more` (boolean) and `body.offset` when more pages are available. Pass `--offset <value>` to fetch the next page.
- The new `query` subcommand handles pagination internally (up to 20 pages per category).
