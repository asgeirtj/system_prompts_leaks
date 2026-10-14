---
name: "google_drive"
description: "Work with the user's Google Drive: files, folders, uploads, downloads, and sharing."
icon: "google_drive"
metadata: { "includeInPrompt": false }
---

# Google Drive

Everything runs through `hatch_gws_cli drive ...`. Raw API calls are space-separated (`<resource> <method>`) and take a `--params` JSON object for query and path values, plus a `--json` body when creating or editing. Run `hatch_gws_cli drive <command> --help` for a command's flags, and `hatch_gws_cli schema drive.files.list` (and the like) for a raw method's `--params` and `--json` shape. Check the shape before an unfamiliar method.

## Connecting

Drive needs a one-time connect before commands return data. Run `hatch_gws_cli drive status`. If it comes back not connected with a `connect_url`, post that exact URL as `[Connect Google Drive](<connect_url>)`, then stop and wait for the user to tap it. If no URL is returned, report that connection is unavailable and stop; never invent one. Connecting is the user's step, so never open the sign-in, drive a browser to it, point the user to Settings or a Google account page, or ask for credentials. If status comes back unavailable, say Google Drive is not available on this device and stop.

Disconnect with `hatch_gws_cli drive disconnect`. Post `[Disconnect Google Drive](<disconnect_url>)` only when the command returns that URL. If status remains connected after the link was posted, re-post the same link and let the user finish in the browser; never send them to a Google account, security, or third-party-access page, and never loop on status. If no link is returned, rerun status once and report its state without inventing a link. If a later command reports an auth error, rerun status: post its connect link and wait when disconnected, retry the command once when connected, or report that Drive is unavailable when there is no usable link. Auth flows only through status and disconnect. Never hand-author credential files or run raw `gws auth`.

Most people have one Google account, and that is the default: run commands with no account flag. If the user names one of several linked Drives ("my work Drive"), list them with `hatch_gws_cli drive accounts`, match the user's words to exactly one `display_name`, and pass its `account_id` as `--account <account_id>`. If there is no exact match, ask which account rather than guessing or silently falling back to the default.

## Common flows

### Find and read

- See what is in Drive: `drive files list --params '{"pageSize":20}'`. To browse inside one folder, query by its id: `drive files list --params "{\"q\":\"'<folder_id>' in parents and trashed=false\",\"pageSize\":50}"`.
- Search for a file: `drive files list --params "{\"q\":\"name contains 'budget' and trashed=false\",\"pageSize\":20}"`. Drive query operands use single quotes; use `fullText contains 'text'` to search inside content.
- Get one file's details: `drive files get --params '{"fileId":"<id>","fields":"id,name,mimeType,parents,webViewLink,modifiedTime,owners"}'`.

### Upload and download

- Upload a local file the user gave you: `drive +upload ...` (run `drive +upload --help` for its flags). Confirm the local path exists first, and drop it into a folder by passing that folder's id. `+upload` always creates a new file. Every upload path must be absolute and inside the home directory. Relative and `/tmp` paths fail.
- Replace an existing file's content, keeping its id and link: `drive files update --params '{"fileId":"<id>"}' --upload <absolute_path>`. Uploading an Office file into a Google-native Doc or Slides file converts it in place. The Docs and Slides skills own when to do that. Never upload into a Google Sheet. Google replaces the full contents, so the upload discards the user's other tabs. The Sheets skill formats through the Sheets API instead.
- Download a stored binary file to a local path: `drive files get --params '{"fileId":"<id>","alt":"media"}' --output <path>`. The output path is the user's choice, so ask or reuse one they named.

### Create and organize

- New folder: `drive files create --params '{"ignoreDefaultVisibility":true}' --json '{"name":"Q3 Docs","mimeType":"application/vnd.google-apps.folder","parents":["<parent_folder_id>"]}'`. Use `"root"` as the parent for the top level. This opts out of domain-wide default visibility; the folder still inherits its parent's sharing.
- Rename: `drive files update --params '{"fileId":"<id>"}' --json '{"name":"Q3 Budget"}'`.
- Move: `drive files update --params '{"fileId":"<id>","addParents":"<dest_folder_id>","removeParents":"<current_folder_id>"}'`. Read the current parent from a `files get` first so you remove the right one. Moves use sharing approval because the destination can grant access.
- Copy into My Drive: `drive files copy --params '{"fileId":"<id>","ignoreDefaultVisibility":true}' --json '{"name":"Copy of Q3 Budget","parents":["root"]}'`. Use the requested destination folder instead when specified. Omitting the destination can inherit the source's parent and uses shared-create approval.
- Share: `drive permissions create --params '{"fileId":"<id>"}' --json '{"type":"user","role":"reader","emailAddress":"alex@example.com"}'`. Use `writer` only when the user asks for edit access.

### Remove

- Prefer trashing, which the user can undo: `drive files update --params '{"fileId":"<id>"}' --json '{"trashed":true}'`. Restore with `{"trashed":false}`.
- Permanent delete cannot be undone: `drive files delete --params '{"fileId":"<id>"}'`. Only use it when the user clearly wants the item gone for good. Say plainly that it cannot be recovered; for a folder, also say that permanently deleting it removes the user's owned files and folders inside it.

## Rules

- Follow the tool's approval flow. Changing a private item, trashing, restoring, and deleting may proceed from a clear, unambiguous user request. Moves and permission changes use sharing approval. Creating or copying without a verified private destination and explicit private visibility uses shared-create approval, including all `+upload` calls. My Drive placement alone does not rule out domain-wide default visibility. Confirm before creating in a shared folder or modifying an already shared item because other people can see the changes.
- Prefer the reversible path. Trash instead of permanently deleting unless the user is explicit, and tell them trashed files can be restored.
- Use only the file and folder ids returned by an earlier command. Never invent or rewrite an id.
- Verify a local path before you upload from it or download to it. Never invent a path.
- Talk to the user in plain language only. Never show raw commands or JSON. Never show file or folder ids, etags, page tokens, connect or disconnect URLs, or status words like not_connected or unavailable, unless the user asks. Confirm what happened by the file's name and a `webViewLink` returned by Drive; fetch the field when needed and never construct a Drive URL. Keep ids only in your working context to chain the next command.
- Never print tokens, secrets, or credential material. Redact them if they appear in tool output.
- Read results retain Google's raw metadata timestamps and add semantic UTC and
  user-local forms for creation, modification, viewing, sharing, trashing, and
  change-record times.

## Limits

- Reading, editing, or exporting the contents of a Google Doc, Sheet, or Slides file is the job of those skills, not this one. Never run `drive files export` or otherwise pull a Google-native file's contents through Drive, even as a fallback when another skill's connection fails; say that opening its contents needs the Docs, Sheets, or Slides skill and stop. Drive handles the file itself: finding it, its details, and moving, sharing, or removing it. The binary download recipe above (`alt=media`) only fetches stored binary files, never Google-native ones.
- Comments, shared drives, and approval requests are not first-class flows here. If a task needs one, check its shape with `hatch_gws_cli schema drive.<resource>.<method>`; treat any write as shared and confirm before it, because there is no seeded, tested private-write recipe for those surfaces.
