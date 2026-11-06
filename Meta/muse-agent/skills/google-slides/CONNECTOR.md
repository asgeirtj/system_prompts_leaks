# Google Slides

- Run `/opt/hatch/bin/hatch_gws_cli slides <resource> <method>` through `muse.exec`. This wrapper around the vendored Google Workspace CLI is the only route to Google Slides.

- Pass query and path values in `--params '<JSON object>'` and request bodies in `--json`. Check `/opt/hatch/bin/hatch_gws_cli schema slides.<resource>.<method>` before an unfamiliar method so the inputs match the current CLI.

## Connect

- Run `/opt/hatch/bin/hatch_gws_cli slides status` and read `status`, `connect_url` and `disconnect_url`.

- If `slides status` fails, tell the user Google Slides is not available on this device. Do not offer another integration route or ask for credentials.

- If it is `not_connected` and `connect_url` is present, share exactly `[Connect Google Slides](<connect_url>)` with the returned URL, without also pasting the raw URL. Wait for the user to connect, then continue once `status` is `connected`.

- To disconnect, run `/opt/hatch/bin/hatch_gws_cli slides disconnect`, which returns `ok`, `action`, `status` and `disconnect_url`. Share exactly `[Disconnect Google Slides](<disconnect_url>)` with the returned URL.

- Authentication stays in these commands. Never write credential files or run raw `gws auth` commands.

## Read or edit a deck

```text
/opt/hatch/bin/hatch_gws_cli slides presentations get --params '{"presentationId":"<presentation_id>"}'
/opt/hatch/bin/hatch_gws_cli slides presentations batchUpdate --params '{"presentationId":"<presentation_id>"}' --json '{"requests":[{"createSlide":{"slideLayoutReference":{"predefinedLayout":"TITLE_AND_BODY"}}}]}'
```

- Read the deck with `presentations get` before changing it, so you understand its pages and objects.

- For a targeted change, read `schema slides.presentations.batchUpdate` and use the returned object IDs. Treat presentation, page and element IDs as opaque strings.

- Creating a presentation, or editing one only the user owns, may proceed from a clear request. Confirm before editing a shared presentation, because its contents can change for other people.

## Put a new deck into Google Slides

- Never compose a deck through `presentations create` plus `batchUpdate` element inserts, whether it is new or rebuilt. Build it as a presentation artifact first, which writes a `.pptx` in the artifact's project directory, then put that file into Google Slides.

- Create the empty destination presentation:

```text
/opt/hatch/bin/hatch_gws_cli slides presentations create --json '{"title":"<title>"}'
```

- Fill it from the built file. Drive converts the upload into the Google Slides deck in place:

```text
/opt/hatch/bin/hatch_gws_cli drive files update --params '{"fileId":"<presentation_id>"}' --upload "$JARVIS_HOME/workspace/your_files/<artifact-slug>/<name>.pptx"
```

- The upload path must be absolute and inside the home directory. Relative and `/tmp` paths fail.

- Read the deck back with `presentations get` and confirm its page count matches the artifact before calling it ready. Tell the user the slides are images, so their text cannot be edited in Google Slides.

- To revise, edit the artifact and upload it again to the same presentation ID, since the artifact is the working copy. The upload replaces every slide and discards any edits made in Google since, including the user's.

- Read the live deck back before re-uploading. If it changed, tell the user and wait for a yes. Use the Slides API instead for a targeted change that must keep the existing slide objects.

## Report the result

- Confirm the result the user can see. Keep presentation, page and element IDs, revision IDs and raw JSON out of replies unless the user asks or you need them to troubleshoot a failure.

## Related skills

- [Documents](/opt/muse/skills/documents/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
