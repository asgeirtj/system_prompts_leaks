# Verifying a CLI change

The handle is direct invocation. The evidence is stdout/stderr/exit code.

## Pattern

1. Build (if the CLI needs building)
2. Run with arguments that exercise the changed code
3. Capture output and exit code
4. Compare to expected

CLIs are usually the simplest to verify - no lifecycle, no ports.

## Worked example

**Diff:** adds a `--json` flag to the `status` subcommand. New flag
parsing in `cmd/status.go`, new output branch.

**Claim (commit msg):** "machine-readable status output."

**Inference:** `tool status --json` now exists, emits valid JSON with
the same fields the human output shows. `tool status` without the flag
is unchanged.

**Plan:**
1. Build
2. `tool status` -> human output, same as before (non-regression)
3. `tool status --json` -> valid JSON, parseable
4. JSON fields match human output fields

**Execute:**
```bash
go build -o /tmp/tool ./cmd/tool

/tmp/tool status
# -> Status: healthy
# -> Uptime: 3h12m
# -> Connections: 47

/tmp/tool status --json
# -> {"status":"healthy","uptime_seconds":11520,"connections":47}

/tmp/tool status --json | jq -e .status
# -> "healthy"
# (jq -e exits nonzero if the path is null/false - cheap validity check)

echo $?
# -> 0
```

**Verdict:** PASS - flag works, JSON is valid, fields line up.

## What FAIL looks like

- `unknown flag: --json` -> not wired up, or you're running a stale build
- Output isn't valid JSON (`jq` errors) -> serialization bug
- `tool status` (no flag) changed -> regression; the diff touched more
  than it should
- JSON has different field names than expected -> claim/code mismatch,
  might be fine, note it

## Reading from stdin, destructive commands

If the CLI reads stdin -> pipe in test data.
If it writes files / hits a network / deletes things -> point it at a
tmp dir / a mock / a dry-run flag. If there's no safe mode and the
diff touches the destructive path, say so and verify what you can
around it.
