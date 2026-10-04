---
name: "calendly"
description: "View Calendly events and event types, and manage scheduling data using the Calendly CLI."
icon: "calendly"
metadata: { "includeInPrompt": false }
---

# Calendly

## Purpose
Use the `calendly` CLI for Calendly connector status and scheduling-data reads.

## Tooling
Use the installed CLI directly from `PATH`.

Core commands:
- `calendly status`
- `calendly disconnect`
- `calendly authorize-url`
- `calendly me`
- `calendly list-events --user-uri <uri> [--status active] [--min-start-time <iso>] [--max-start-time <iso>] [--count 20] [--page-token <token>]`
- `calendly event-types --user-uri <uri> [--active true] [--count 20] [--page-token <token>]`
- `calendly request --method GET --path '/scheduled_events' --query 'user=<uri>' [--query 'status=active'] [--json-body '<json>']`

Output contract:
- Every command returns JSON with a top-level `ok`.
- For `disconnect`, parse `action` and `removed`.
- For `status`, parse the reported connection state and any returned auth URL or recovery details.
- For `me`, parse the current user URI and organization URI before listing user-scoped resources.
- For `list-events` and `event-types`, parse the returned collection plus any pagination token for follow-up pages. Timed scheduled events add `event_starts_at` / `event_ends_at` with UTC and user-local forms, and read outputs add runtime-generated `retrieved_at`.

## Auth
`calendly` owns the Calendly connection workflow.

Auth contract:
- Run `calendly status` first.
- If the user wants to disconnect, run `calendly disconnect`.
- If not connected, run `calendly authorize-url`. When `connect_url` is present, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Calendly](<connect_url>)`; do not paste the raw URL separately.
- After auth, run `calendly me` to verify.

Credential storage:
- Client application credentials and user token state are never read directly by this skill.
- The CLI accesses connection state exclusively through shared `hatch-tool-sdk` connector helpers; there is no agent-visible config file path.
- The CLI resolves and refreshes service tokens automatically; never print access or refresh tokens.

## Operating Rules
1. Before any Calendly API call, require `calendly status` to show a connected state.
2. Use `calendly me` first when you need the current user URI or organization URI.
3. Token refresh on expired-token errors is automatic. If API calls still fail after auto-refresh, re-check `calendly status` and re-link if needed.
4. Confirm before any destructive or user-visible mutation, including raw `request` calls that could cancel events or delete subscriptions.
5. Prefer `event_starts_at.user_local` and `event_ends_at.user_local` in summaries.
