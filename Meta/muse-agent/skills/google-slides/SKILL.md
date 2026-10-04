---
name: "google_slides"
description: "Read, create, and edit the user's Google Slides presentations."
icon: "google_slides"
metadata: { "includeInPrompt": false }
---

# Google Slides

## Purpose
Manage Google Slides through `hatch_gws_cli`; the vendored Google Workspace CLI is the only implementation path.

## Tooling
Use `exec` to run:

```sh
hatch_gws_cli slides <resource> <method> [flags]
```

### Connection management

```sh
hatch_gws_cli slides status
hatch_gws_cli slides disconnect
```

### Slides operations

Core patterns:
- `hatch_gws_cli slides status`
- `hatch_gws_cli slides disconnect`
- `hatch_gws_cli schema slides.presentations.get`
- `hatch_gws_cli schema slides.presentations.create`
- `hatch_gws_cli schema slides.presentations.batchUpdate`

Common raw API calls:
- `hatch_gws_cli slides presentations get --params '{"presentationId":"<presentation_id>"}'`
- `hatch_gws_cli slides presentations create --json '{"title":"Quarterly Review"}'`
- `hatch_gws_cli slides presentations batchUpdate --params '{"presentationId":"<presentation_id>"}' --json '{"requests":[{"createSlide":{"slideLayoutReference":{"predefinedLayout":"TITLE_AND_BODY"}}}]}'`

JSON output contract:
- `status`: parse `status`, `connect_url`, and `disconnect_url`
- `disconnect`: parse `ok`, `action`, `status`, and `disconnect_url`

## Composing presentation content

Never compose a deck through `presentations create` plus `batchUpdate` element inserts, whether new or rebuilt. Build it as a presentation artifact first. The artifacts tool writes a `.pptx` under `~/workspace/your_files/<artifact-slug>/`. Then put it in Google.

1. Mint the empty presentation with `hatch_gws_cli slides presentations create --json '{"title":"<title>"}'`.
2. Fill it from the built file: `hatch_gws_cli drive files update --params '{"fileId":"<presentation_id>"}' --upload "$JARVIS_HOME/workspace/your_files/<artifact-slug>/<name>.pptx"`. Drive converts the upload into the Google Slides deck in place. The path must be absolute and inside the home directory. Relative and `/tmp` paths fail.
3. Read it back with `presentations.get` before you call it ready, and confirm the page count matches the artifact. Say in your reply that the slides are pictures, so the text cannot be edited in Slides.
4. To revise, edit the artifact and re-upload to the same presentation ID. The artifact is the working copy. The upload replaces every slide, so it discards any edits made in Google since, including the user's. Read the published copy back first. If it changed, say so and wait for a yes.

## Auth
Authentication is handled by the wrapper's `status` and `disconnect` subcommands. Do not hand-write credential files or run raw `gws auth ...`.

## First-use setup flow
1. Run `hatch_gws_cli slides status`.
2. If `status` is `unavailable`, tell the user that Google Slides is not available on this device. Do not offer alternative integration approaches or ask the user for credentials.
3. If `status` is `not_connected` and `connect_url` is present, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Google Slides](<connect_url>)`; do not paste the raw URL separately. Wait for the user to reconnect.
4. Once `status` is `connected`, proceed with Slides operations.

## Operating Rules
1. Use `schema` before unfamiliar Slides methods so `--params` and `--json` match the current vendored CLI contract.
2. Creating a presentation and editing a presentation owned only by the user may proceed from a clear request. Confirm before editing a shared presentation because its contents can be exposed to or changed for other people.
3. Treat presentation IDs, page object IDs, and element IDs as opaque strings.
4. Run `hatch_gws_cli slides disconnect`. After running it, when `disconnect_url` is present, replace `<disconnect_url>` with the returned URL and share exactly this Markdown link: `[Disconnect Google Slides](<disconnect_url>)`; do not paste the raw URL separately.
5. Use `presentations.get` before modifying an existing deck so you understand the current page and object structure.
6. After a read or write action, confirm the user-visible result only. Do not surface raw API identifiers (presentation, page object, and element IDs) or other internal response fields (revision IDs, raw JSON) in text shown to the user unless the user asks for them or you need them to troubleshoot a failure; keep using them internally to chain follow-up commands.
