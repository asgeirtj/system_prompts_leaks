---
name: "google_forms"
description: "Read, create, and update the user's Google Forms, and read responses."
icon: "google_forms"
metadata: { "includeInPrompt": false }
---

# Google Forms

## Purpose
Manage Google Forms through `hatch_gws_cli`; the vendored Google Workspace CLI is the only implementation path.

## Tooling
Use `exec` to run:

```sh
hatch_gws_cli forms <resource> <method> [flags]
```

### Connection management

```sh
hatch_gws_cli forms status
hatch_gws_cli forms disconnect
```

### Forms operations

Core patterns:
- `hatch_gws_cli forms status`
- `hatch_gws_cli forms disconnect`
- `hatch_gws_cli schema forms.forms.get`
- `hatch_gws_cli schema forms.forms.create`
- `hatch_gws_cli schema forms.forms.batchUpdate`
- `hatch_gws_cli schema forms.forms.responses.list`
- `hatch_gws_cli schema forms.forms.responses.get`

Common raw API calls:
- `hatch_gws_cli forms forms get --params '{"formId":"<form_id>"}'`
- `hatch_gws_cli forms forms create --json '{"info":{"title":"Feedback Survey","documentTitle":"Feedback Survey"}}'`
- `hatch_gws_cli forms forms batchUpdate --params '{"formId":"<form_id>"}' --json '{"requests":[{"updateFormInfo":{"info":{"description":"Quarterly survey"},"updateMask":"description"}}]}'`
- `hatch_gws_cli forms forms responses list --params '{"formId":"<form_id>","pageSize":20}'`
- `hatch_gws_cli forms forms responses get --params '{"formId":"<form_id>","responseId":"<response_id>"}'`

JSON output contract:
- `status`: parse `status`, `connect_url`, and `disconnect_url`
- `disconnect`: parse `ok`, `action`, `status`, and `disconnect_url`

## Auth
Authentication is handled by the wrapper's `status` and `disconnect` subcommands. Do not hand-write credential files or run raw `gws auth ...`.

## First-use setup flow
1. Run `hatch_gws_cli forms status`.
2. If `status` is `unavailable`, tell the user that Google Forms is not available on this device. Do not offer alternative integration approaches or ask the user for credentials.
3. If `status` is `not_connected` and `connect_url` is present, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Google Forms](<connect_url>)`; do not paste the raw URL separately. Wait for the user to reconnect.
4. Once `status` is `connected`, proceed with Forms operations.

## Operating Rules
1. Use `schema` before unfamiliar Forms methods so `--params` and `--json` match the current vendored CLI contract.
2. Creating a form and editing an unpublished form owned only by the user may proceed from a clear request. Confirm before editing a shared or published form, or publishing one, because its contents can reach other people.
3. Run `forms.get` before presenting response data so you can map question IDs to human-readable form structure.
4. Treat form IDs and response IDs as opaque strings and only use IDs returned by prior commands or explicit user input.
5. Run `hatch_gws_cli forms disconnect`. After running it, when `disconnect_url` is present, replace `<disconnect_url>` with the returned URL and share exactly this Markdown link: `[Disconnect Google Forms](<disconnect_url>)`; do not paste the raw URL separately.
6. Paginate through responses when the user asks for all responses; stop when `nextPageToken` is absent.
7. After a read or write action, confirm the user-visible result only. Do not surface raw API identifiers (form, response, and question IDs) or other internal response fields (page tokens/cursors, raw JSON) in text shown to the user unless the user asks for them or you need them to troubleshoot a failure; keep using them internally to chain follow-up commands.
8. Response reads retain Google's raw timestamps and add semantic UTC and
   user-local forms for response creation/submission times.
