# Data Source Events

A read-only log of events synced from connected devices: notifications, location, contacts, and more.

## Reading events

Read from the daemon sandbox API (no database access). List events filtered by `source`:

```bash
curl -sS --unix-socket "$JARVIS_SANDBOX_API_SOCK" \
  "http://localhost/device-syncs?source=notifications&limit=20"
```

- `source`: any stream, whether a common device one (`contacts | location | notifications`) or a client-defined source. Omit to see all streams; more can appear as clients register them.
- `producer_id`: scope to one device.
- Newest first by `global_seq`.

The list returns metadata and a short `summary_preview`, not the raw payload. Each event has:

- `global_seq`: canonical arrival order across all streams.
- `producer_id`: stable device id, e.g. `phone-1`.
- `source`: payload family (above).
- `received_at`: RFC3339 ingest time.
- `status`: processing/settlement state.
- `summary_preview`: worker message preview when notified.

## Fetching a payload

When `summary_preview` is not enough, fetch one event's stored payload by its `global_seq` (404 if unknown):

```bash
curl -sS --unix-socket "$JARVIS_SANDBOX_API_SOCK" \
  "http://localhost/device-syncs/<global_seq>"
```

The response adds `payload` and `payload_representation` (`raw`, `summary`, or
`redacted`). Newly inserted events for `notification`, `notifications`, `sms`,
and `imessage` contain redacted metadata, never raw message text.

## When to use it

Use this ledger for recent synced device activity, like "did my phone sync any notifications recently?" For canonical contacts, calendar, or health reads, use the `contacts.search`/`calendar.search` device commands or the `device-data` skill (cached) and the typed health store instead.
