# Withings raw commands

- Use these only when the standard `query` cannot answer, such as every reading within a day, a measurement type `query` does not map, ECG recordings or high-frequency sleep and heart data. They return `{ok, status, body}` with Withings' native fields.

- Dates use `YYYY-MM-DD`, and the CLI converts them where the API needs timestamps.

## Commands

```text
/opt/hatch/bin/withings measures [--category 1|2] [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--meas-types 1,4,11] [--offset N] [--last-update UNIX_TIME]
/opt/hatch/bin/withings activity [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--offset N] [--last-update UNIX_TIME]
/opt/hatch/bin/withings sleep-summary [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--offset N] [--last-update UNIX_TIME]
/opt/hatch/bin/withings sleep [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--meas-types CSV]
/opt/hatch/bin/withings workouts [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--offset N] [--last-update UNIX_TIME]
/opt/hatch/bin/withings intraday [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD]
/opt/hatch/bin/withings heart-list [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--offset N]
/opt/hatch/bin/withings heart-get --signal-id SIGNAL_ID
/opt/hatch/bin/withings devices
```

- `activity` returns raw daily activity rows and `sleep-summary` returns nightly summaries with Withings field names. `sleep` returns high-frequency sleep sensor data and `intraday` returns minute-level activity.

- `heart-list` lists ECG and atrial-fibrillation recordings, and `heart-get` returns one recording's signal. `devices` lists the paired Withings devices.

- `--last-update` returns only entries changed since that Unix time.

## Measurements

- `measures --category 1` returns recorded measurements and `--category 2` returns the user's objectives. The same command requests approval for withheld body measurements.

- Each value in `body.measuregrps[].measures[]` is `{value, unit, type}`, and the real value is `value * 10^unit`. Apply the scale once.

- Common `--meas-types` IDs:
  - 1 weight (kg), 4 height (m), 5 fat-free mass (kg), 6 body fat (%) and 8 fat mass (kg)
  - 9 diastolic and 10 systolic blood pressure (mmHg), and 11 heart rate (bpm)
  - 12 temperature, 71 body temperature and 73 skin temperature (°C)
  - 54 oxygen saturation (%), 91 pulse wave velocity (m/s) and 123 VO2 max
  - 76 muscle mass, 77 hydration and 88 bone mass (kg)
  - 130 atrial fibrillation result from ECG and 139 from PPG
  - 135 QRS, 136 PR, 137 QT and 138 corrected QT interval (ms)
  - 155 vascular age, 167 nerve health score and 170 visceral fat
  - 168 extracellular and 169 intracellular water (kg)
  - 173 segmental fat-free mass, 174 segmental fat mass and 175 segmental muscle mass
  - 196 electrodermal activity, 226 basal metabolic rate, 227 metabolic age and 229 electrochemical skin conductance

- For any other ID, check Withings' current schema before interpreting the value. Standard field names and raw IDs are different formats, so never substitute one for the other.

## Pagination

- Commands with `--offset` return `body.more` and `body.offset` when another page exists. Repeat the same command with `--offset` set to that value.
