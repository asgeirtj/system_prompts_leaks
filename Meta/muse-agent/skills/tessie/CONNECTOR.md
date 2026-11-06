# Tessie

- Tessie is a service for Tesla vehicles. Run `/opt/hatch/bin/tessie-api` to list the user's vehicles, read their state and send supported commands, using the user's Tessie API token.

## Connect

```text
/opt/hatch/bin/tessie-api verify
/opt/hatch/bin/tessie-api authorize-url
```

- Run `verify` when the connection is unknown. `"ok": true` means the stored token works or Tessie could not be reached to check it, while "No API key configured" or an invalid-key error means the user needs to connect.

- Run `authorize-url` and share its `connect_url` as a Connect Tessie link, where the user enters their token. They can create one in [Tessie's API settings](https://dash.tessie.com/settings/api).

- Never ask for the token in chat. If the user sends one anyway, store it only with `set-token --token 'TOKEN'` and never repeat it. Never write an auth file directly.

- `disconnect` removes the stored token. Never print the token.

## Choose the vehicle

```text
/opt/hatch/bin/tessie-api vehicles
/opt/hatch/bin/tessie-api status --vin VIN
/opt/hatch/bin/tessie-api state --vin VIN
```

- `vehicles` lists the accessible vehicles. Use the VIN of the vehicle the user identifies, and when several exist and they have not said which, ask which one.

- Read `status` or `state` before a command whenever the vehicle's current condition decides whether the action makes sense.

## Send a command

```text
/opt/hatch/bin/tessie-api command --vin VIN --command honk
/opt/hatch/bin/tessie-api command --vin VIN --command COMMAND --wait-for-completion --extra-query key=value
```

- Use only command names from [Tessie's API documentation](https://developer.tessie.com/). `--wait-for-completion` waits for the vehicle to finish, and repeated `--extra-query key=value` passes a command's parameters.

- Do not invent a wake-up sequence. Never infer a physical action the user did not request, and never turn a request for information into one.

- `honk`, `flash`, `remote_boombox`, `schedule_software_update`, `cancel_software_update` and raw writes to the `fleet_telemetry_config` path run without asking by default, so run each only on a clear request for that exact action. Other commands and raw writes ask for approval through the connector, so run the resolved command directly and do not add a second confirmation in chat.

## Make a raw request

```text
/opt/hatch/bin/tessie-api request --method GET --path '/VIN/battery'
/opt/hatch/bin/tessie-api request --method POST --path '/VIN/PATH' --query key=value --json-body '{"key":"value"}'
```

- `request` reaches any path on the Tessie API, with repeated `--query key=value` and an optional `--json-body`. GET requests follow the read permission and other methods follow write approval.

- While "View vehicle status and location" is set to Deny or Ask, raw GET requests are refused with `data_class_excluded`.

## Check the result

- Read `ok`, `status` and `body`. Common `body` fields include `results[]`, `battery_level`, `battery_range`, `status` and the provider's `result`.

- A 401 means the token is invalid. A 408 or 503 can leave a command's outcome uncertain, so read the vehicle's state before retrying.

- State reads keep raw timestamps and add UTC and user-local times for observations, last-seen values and record updates.

## Related skills

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
