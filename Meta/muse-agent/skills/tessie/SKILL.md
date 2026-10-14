---
name: "tessie"
description: "Monitor a Tesla vehicle, inspect live state, and run explicit Tessie command endpoints."
icon: "tessie"
metadata: { "includeInPrompt": false }
---

# Tessie (Tesla Vehicle Control)

## Purpose
Use `tessie-api` to list vehicles, inspect status/state, and run explicit Tessie vehicle commands.

## Tooling
Use:

```sh
tessie-api <subcommand> [options]
```

Core subcommands:
- `authorize-url`
- `set-token --token '<TOKEN>'`
- `disconnect`
- `verify`
- `vehicles`
- `status --vin '<VIN>'`
- `state --vin '<VIN>'`
- `command --vin '<VIN>' --command <command_name> [--wait-for-completion] [--extra-query k=v]`
- `request --method GET --path '/<VIN>/battery' [--query k=v] [--json-body '{"...":"..."}']`

JSON output contract:
- `authorize-url`: parse `ok`, `authorize_url`, and `connect_url`
- `set-token`: parse `ok` and `action`
- `disconnect`: parse `ok`, `action`, `path`, and `removed`
- `verify`: parse `ok`, `action`, and `error`
- all read/command calls: parse top-level `ok`, `status`, and `body`
- common `body` fields include `results[]`, `battery_level`, `battery_range`, `status`, and `result`

## Auth
Manage Tessie auth through the CLI helpers only.

Auth contract:
- Run `tessie-api verify` before Tessie API use when connection state is unknown.
- If no API key is configured, run `tessie-api authorize-url`. When `connect_url` is present, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Tessie](<connect_url>)`; do not paste the raw URL separately.
- The user can generate a token at `https://dash.tessie.com/settings/api`.
- If the user provides a key through the CLI flow, store it only through `tessie-api set-token --token '<TESSIE_API_TOKEN>'`; do not write auth files directly.
- Remove stored auth only through `tessie-api disconnect`.
- Never print token values.

## Operating Rules
1. If VIN is not given, call `vehicles` and ask user to pick one when multiple exist.
2. Use `status` or `state` before impactful commands when the current vehicle condition matters.
3. `honk`, `flash`, `remote_boombox`, software-update scheduling or cancellation, and fleet telemetry configuration may proceed from a clear, unambiguous request without an additional confirmation. Other vehicle commands and raw API writes use the connector approval gate; invoke the resolved command directly and do not add a duplicate chat confirmation. Never invent a command or infer a physical action the user did not request.
4. Use `command --command <name>` only for explicit Tessie command names. Do not invent a mandatory pre-wake flow or undocumented helper behavior.
5. On HTTP or API errors, report `status` and `body` clearly. Common cases are `401`, `408`, and `503`.
6. Never print token values.
7. Read results preserve Tessie's raw timestamps and add semantic UTC and
   user-local forms for state observations, last-seen values, and record
   creation/update times.
