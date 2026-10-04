---
name: "canva"
description: >-
  Create and edit Canva designs, generate images, remove backgrounds, recover
  editable layers, and work with Canva libraries. Use for branded presentations
  and slide decks, campaign artwork, flyers and banners, applying saved brand kits
  and templates, and resizing designs for social posts and stories through Canva's
  official MCP server.
icon: "canva"
metadata: { "includeInPrompt": false }
---

# Canva

Use the installed `canva` CLI. Start with `canva status`. If it reports
`not_connected`, run `canva authorize-url` and share only the returned
`connect_url`. If the CLI reports outdated OAuth settings, have the user
disconnect Canva in Settings and reconnect. Never request tokens in chat.

Run `canva list-tools` for live schemas and use only tools returned there.
Follow their input schemas exactly and include a concise `user_intent`.
`hatch_permission_overrides` identifies argument-dependent permissions;
opening an editing transaction is a write and deleting pages is a delete.
Some tools require Canva Pro, Enterprise, or available AI credits.

Save each raw response before parsing. Check `result.isError`, then read
`result.structuredContent` when present or parse the JSON text block in
`result.content`. Both response forms are valid. A local parsing failure does
not mean a mutation failed: recover its response or inspect saved state before
continuing. Never repeat a copy, creation, or commit just to obtain its output.

```text
canva search-designs [--query <keywords>] [--continuation <token>]
canva get-design-content --design-id <id>
canva get-design-pages --design-id <id>
canva list-tools
canva call-tool --name <tool-name> --arguments-json '<JSON object>'
```

## Create designs and images

Use `create-design` for a new editable layout: social post, infographic,
poster, flyer, presentation, document, or sheet. Put all necessary source
facts and requested wording in `brief`; the tool does not inherit chat or
connected-source context. Fetch the user-selected source first. For an exact
size, state dimensions and orientation in the brief. If supplying `format`,
include the orientation; an ambiguous format may resolve to a square.
Pass `outline` only for a presentation outline the user supplied or approved.

Use `generate-image` for an explicitly requested standalone image, photo,
illustration, artwork, or image of an infographic. Use one `MEDIA` reference
per uploaded source image. This generates an image rather than an editable
page layout. Use its returned `media_id` when editing a generated image again.

`create-design` cannot apply brand kits or brand templates. For an explicitly
on-brand request, use the available legacy `generate-design`,
`get-design-candidates`, and `create-design-from-candidate` flow, showing
candidates for the user's choice. These tools are otherwise deprecated when
`create-design` is listed; failure of `create-design` is not permission to
fall back. `generate-design` does not support presentations despite its enum.
The legacy outline-review widget and structured presentation generator are
not exposed by this CLI. Do not substitute a non-branded generation when a
brand-specific presentation workflow is unavailable. A selected brand template
can still be copied with `create-design-from-brand-template` or autofilled.

Creation and layer separation return asynchronous jobs. When no Canva widget
is shown (including CLI use), poll the corresponding `get-create-design-async-job`,
`get-generate-image-job`, or `get-separate-image-layers-job`. Honor every
returned wait interval and updated continuation token. Never start a replacement
write because a job is pending. Stop on terminal failure; respect quota and
moderation failures. Show completed results using the preview workflow below.
For generated images,
include the returned Canva upload link with the text **Open generated image**.

## Upload and transform images

For attachments, local files, or generated files up to 256 MiB, use
`canva upload-file --file <path> --user-intent '<purpose>'`. Its approval shows
the selected file and an image preview for workspace images. The CLI obtains
a single-use upload URL and sends the raw bytes after approval; use the returned
resource IDs in later calls. Do not repeat an upload whose outcome is unknown.
The low-level `create-upload-url` flow remains available for larger files: one
raw-byte POST with `Content-Type: application/octet-stream`, no multipart,
JSON, or base64. Never retry a consumed upload URL.

`upload-asset-from-url` and `import-design-from-url` accept already-public
HTTPS sources only. Do not publish local or private files to use those tools.
Uploading media does not place it into a design. `create-design` has no asset
input parameter: when exact supplied media must appear, use the editing flow
to insert or replace media with its verified Canva ID, then inspect the result.

Use `remove-background` with an already-uploaded `MEDIA` reference to produce
a new image with transparent alpha. It does not replace the scene or crop the
subject. Use `separate-image-layers` with an uploaded image's `asset_id` to turn
a flat graphic into a new editable design; the original stays unchanged.
Verify editable elements with `read-design`, not appearance alone.

## Read, edit, and organize

Use `read-design` for metadata, text, page metadata, thumbnails, and presenter
notes. The old MCP names `get-design`, `get-design-content`,
`get-presenter-notes`, and `get-design-thumbnail` are removed. The CLI
`get-design-content` convenience command now calls `read-design`.
`get-design-pages` remains available for saved page previews.

To edit, call `read-design` with `open_transaction: true` and include
`thumbnails` in `filter.fields` for a before preview. Use its transaction ID,
element locators, and page flags in `edit-design` with `finalize: keep_open`.
Read that transaction to inspect unsaved changes. Show the preview and obtain
explicit approval before `edit-design` with `finalize: commit` and no
operations. Use `finalize: cancel` to discard edits. These replace
`start-editing-transaction`, `perform-editing-operations`,
`commit-editing-transaction`, and `cancel-editing-transaction`, even when
older server descriptions still mention those names. Cancel stale
transactions and open a fresh one.

`merge-designs` combines or reorders whole pages. Obtain explicit approval of
the exact operations before each call; deleting pages is permanent.
`copy-design` and `resize-design` create new designs and preserve their source.
Before `autofill-design`, inspect `get-design-dataset` or
`get-brand-template-dataset` and match its field names/types. Set
`update_in_place` only when the user requested overwriting that design.

For brand-template updates, start with `create-brand-template-draft`, edit and
save its design through the current transaction flow, then use
`publish-brand-template` only when the user requested organization-wide
publication. Publishing affects a reusable shared template.

Resolve Canva shortlinks before using designs. Confirm `get-export-formats`
before `export-design`. Use `help` for current Canva product support questions,
not to describe this CLI's capabilities.

## Show results

Show a visual preview in chat alongside the returned Canva link when delivering
designs or images. Save returned image content, or download a returned thumbnail
URL with `curl`, to a file under `workspace/`. Inspect it with `read`, then attach
it on its own line as `![Preview](sandbox://workspace/path/to/image.png)`.
Preview each design in a small set; for a long deck, show representative pages
and label their page numbers. Local attachments remain useful after signed
preview URLs expire.

Check that the image shows the expected content; HTTP success alone does not
rule out a blank or stale thumbnail. If needed, request a fresh thumbnail or
export the saved design in a supported image format. Never commit unsaved
edits just to obtain a preview, or present a saved export as an unsaved draft.
If a usable preview is unavailable, explain that and keep the Canva link;
do not repeat creation or editing to repair a preview.

When asked to list designs, omit `--query` and follow continuation tokens.
This does not authorize background crawling or bulk indexing. Comments and
replies are visible to collaborators; post only when the user requested them.
