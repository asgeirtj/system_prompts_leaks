# Canva

- `/opt/hatch/bin/canva` calls Canva's official MCP server at `https://mcp.canva.com/mcp` for designs, images, assets, exports, folders, comments, brand templates, brand kits, resizing and Enterprise autofill. It connects through OAuth.

## Connect

- Run `status`. It checks the OAuth state and, when connected, verifies the Canva catalog.

- If it returns `not_connected`, run `authorize-url` and share only the returned `connect_url`. Never ask for tokens in chat.

- If the CLI reports outdated OAuth settings, have the user disconnect Canva in Settings and reconnect. Credentials from the previous endpoint cannot be reused.

- Run `disconnect` only when the user asks to disconnect Canva, because it deletes the stored connection.

## Read the catalog and call tools

```text
/opt/hatch/bin/canva list-tools --names-only
/opt/hatch/bin/canva describe-tool --name <tool-name>
/opt/hatch/bin/canva call-tool --name <tool-name> --arguments-json '<JSON object>'
/opt/hatch/bin/canva search-designs [--query <keywords>] [--continuation <token>]
/opt/hatch/bin/canva get-design-pages --design-id <id>
```

- Run `list-tools --names-only` for the current reviewed tool index, then `describe-tool --name <tool-name>` for one tool's live schema. The bare `list-tools` catalog is large and rarely needed whole. Use only returned tools. Omission is authoritative for the current task, so never infer a tool from these docs, an earlier turn, a cached schema or a tool expected to launch later.

- Follow each tool's input schema exactly and include a concise `user_intent`.

- `hatch_permission_overrides` marks permissions that depend on the arguments, such as deleting pages.

- Some tools need Canva Pro, Canva Enterprise or available AI credits.

## Read every result safely

- Save each raw response before parsing it. A Canva tool error returns a nonzero CLI exit and a generic message on stderr. Its provider explanation remains in the `ok: false` JSON response on stdout; save that response even when the command fails. On success, read `result.structuredContent` when present or parse the JSON text block in `result.content`. Both forms are valid.

- A local parsing failure does not mean a write failed. Recover the response or inspect the saved state before continuing, and never repeat a copy, creation, upload or commit just to obtain its output.

## Find designs

- To list designs, omit `--query` and follow the continuation tokens. That request does not authorize background crawling or bulk indexing.

- Resolve Canva shortlinks before using a design.

## Create designs

- Use `create-design` for a new editable layout: a social post, infographic, poster, flyer, presentation, document or sheet.

- Put every source fact and all requested wording in `brief`, because the tool does not inherit the conversation or any connected-source context. Fetch the source the user selected first.

- For an exact size, state the dimensions and orientation in the brief. When you supply `format`, include the orientation too, since an ambiguous format may resolve to a square.

- Pass `outline` only for a presentation outline the user supplied or approved.

- `create-design` cannot apply brand kits or brand templates. For an explicitly on-brand request, use the legacy `generate-design`, `get-design-candidates` and `create-design-from-candidate` sequence and show the candidates for the user's choice.

- Those legacy tools are otherwise deprecated whenever `create-design` is listed, and a failed `create-design` is not permission to fall back to them. `generate-design` does not support presentations despite its enum.

- The legacy outline-review widget and the structured presentation generator are not exposed by this CLI. When a brand-specific presentation route is unavailable, keep the brand requirement and never substitute an unbranded generation.

- A selected brand template can still be copied with `create-design-from-brand-template` or autofilled.

- Treat an explicit creation count as a hard limit. After a design is created, do not create, copy or resize another one to fix its wording, layout or quality unless the user explicitly authorizes another design. Report the mismatch and share the Canva link so the user can correct it in the Canva editor.

## Follow asynchronous jobs

- Creation and layer separation return asynchronous jobs. When no Canva widget is shown, including all CLI use, poll the matching `get-create-design-async-job`, `get-generate-image-job` or `get-separate-image-layers-job`.

- Honor every returned wait interval and updated continuation token. Never start a replacement write because a job is still pending.

- Stop on a terminal failure, and respect quota and moderation failures.

- For `get-create-design-async-job`, keep the non-empty `job_id` and `continuation_token` returned by `create-design`. Send that `job_id` and the latest token on every poll, and replace the token only when a poll returns a new one.

- A retry resends both values unchanged. Never omit either value, send it blank or restart the chain with an older token.

## Generate and transform images

- Use `generate-image` for an explicitly requested standalone image, photo, illustration, artwork or image of an infographic. Pass one `MEDIA` reference per uploaded source image.

- It produces an image, not an editable page layout. Keep its returned `media_id` to edit the generated image again, and include its Canva upload link labeled **Open generated image**.

- Use `remove-background` with an uploaded `MEDIA` reference to produce a new image with a transparent background. It does not replace the scene or crop the subject.

- Use `separate-image-layers` with an uploaded image's `asset_id` to turn a flat graphic into a new editable design, leaving the original unchanged.

- A matching thumbnail does not prove the elements are editable. When no listed tool can inspect them, say that layer verification is unavailable rather than calling an absent tool.

## Upload source media

- For attachments, local files or generated files up to 256 MiB, use:

```text
/opt/hatch/bin/canva upload-file --file <path> --user-intent '<purpose>'
```

- The approval shows the selected file, with an image preview for workspace images. After approval the CLI sends the file's exact bytes to a single-use upload URL. Keep the returned resource IDs for later calls.

- Never repeat an upload whose outcome is unknown.

- For a larger file, `create-upload-url` accepts one raw-byte POST with `Content-Type: application/octet-stream`. Do not use multipart, JSON or base64, and never retry a consumed upload URL.

- `upload-asset-from-url` and `import-design-from-url` accept only HTTPS sources that are already public. Never publish a local or private file to use them.

- An upload does not place media into a design, and `create-design` has no asset input. When exact supplied media must appear and no listed tool can place it, explain the limitation and offer the Canva editor.

## Read, edit and organize

- Use `edit-design` to change a design's content, and only when `list-tools` returns it. Its `finalize` value `commit` saves the editing session, `cancel` discards it and `keep_open` leaves the changes unsaved. Never try remembered or future tool names for reading or editing design content.

- Use `get-design-pages` for saved page previews when it is listed. When the user needs a read or edit that no listed tool supports, share the Canva link and explain which step needs the Canva editor.

- `merge-designs` combines or reorders whole pages. Get explicit approval of the exact operations before each call, because deleting pages is permanent.

- `copy-design` and `resize-design` create new designs and keep the source.

- Before `autofill-design`, read `get-design-dataset` or `get-brand-template-dataset` and match its field names and types. Set `update_in_place` only when the user asked to overwrite that design.

- Updating a brand template means creating its draft, editing and saving the draft, then publishing it. When no listed tool can edit and save the draft, share the Canva link and ask the user to finish those steps in the Canva editor.

- Call `publish-brand-template` only after the user confirms the edited draft is ready and asks for organization-wide publication, because publishing changes a template others reuse.

- Check `get-export-formats` before `export-design`.

- Comments and replies are visible to collaborators, so post them only when the user asks.

- Use `help` for questions about Canva's own product, not to describe what this CLI can do.

## Show the result

- Deliver a visual preview with the returned Canva link. Save returned image content, or download a returned thumbnail URL with `curl`, to a file under `workspace/`, inspect it with `muse.read`, then attach it on its own line as `![Preview](sandbox://workspace/path/to/image.png)`.

- Preview each design in a small set. For a long deck, show representative pages labeled with their page numbers. Local attachments stay useful after signed preview and export URLs expire.

- Check that the image shows the expected content, because HTTP success does not rule out a blank or stale thumbnail. Request a fresh thumbnail or export the saved design to a supported image format when needed.

- Never commit unsaved edits just to get a preview, or present a saved export as an unsaved draft.

- When no usable preview is available, say so and keep the Canva link. Never repeat a creation or edit to repair a preview.

## Related skills

- [Documents](/opt/muse/skills/documents/SKILL.md)

- [Social Publishing](/opt/muse/skills/social-publishing/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
