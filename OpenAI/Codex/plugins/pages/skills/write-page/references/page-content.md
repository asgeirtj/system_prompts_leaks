# Page content catalog

Ordinary document Pages use the formats below. Use active tool schemas and real returned references; renderer support does not guarantee tool availability.

## Storage

Only `markdown` and `agent_instructions` are stored block kinds. Other formats are Markdown extensions; titles, IDs, metadata, and comments are separate.

Use supported Markdown operations, never raw Yjs. In hosted edits, `block_units` is a nonempty ordered list of Markdown strings or `{kind, markdown, metadata?}` objects; each unit is parsed independently. Keep tables, callouts, and fences complete. Preserve `metadata.stream_kind`: omitted means `content`; `scratch` is a separate stream.

For ordinary `insert_markdown`/`replace_block_markdown` edits, use `markdown` alone. Use `block_units` when the edit needs explicit block boundaries, an Agent Instructions block (`kind:"agent_instructions"`, durable guidance saved in the Page), or per-block metadata:

- Prefer units-only input when the active tool schema and description explicitly support omitting operation-level `markdown`. When `markdown` is required, derive it from the exact unit strings joined with `\n\n`.
- If supplying both, `markdown` must equal that exact join. Do not independently compose, trim, reformat, or normalize either representation or discard unit annotations to hide a mismatch.
- Omit `block_kind` entirely (including null), and insert units only at `between_blocks` locations.
- Use `kind`, not `type`, for objects. An intentional blank block is `{kind:"markdown",markdown:""}`, not a blank string.
- Keep each unit's Markdown complete. Markdown units split into canonical blocks; Agent Instructions remain one block. Metadata stays on the first resulting block.
- Unit metadata can be null/omitted or a finite JSON object; `set_block_metadata` requires an object. The maximum metadata depth is 16. Do not strip metadata to bypass validation.

For insertion locations, use adjacent canonical neighbors rather than the edges of a filtered selection. `in_block` with `snapshot_offset` uses UTF-16 offsets and the observed block hash; `yjs_relative` needs a real live-editor anchor with its encoded `assoc`, not an invented offset.

## Text and native extensions

Standard Markdown supports paragraphs, H1-H6, nested/numbered lists, checklists (`- [ ]` / `- [x]`), quotes, dividers, bold, italic, `~~strike~~`, inline code, links (including reference-style), and Unicode emoji. Separate `---` with blank lines to avoid a heading underline. Preserve list starts and checkbox states. Headings drive the outline and disclosure; the slash menu offers H1-H4, while parsing/conversion supports H1-H6.

Fenced code supports language highlighting, copy, and wrapping; it never executes. `mermaid` renders a diagram preview; `diff` renders a file-diff preview when its contents are a valid unified diff. Keep source editable and check rendering; invalid previews can fall back to code. GFM tables support alignment and resizable columns, without formulas or database behavior.

Keep ordinary content editable. Use images for photographs/illustrations, Mermaid for simple static relationships, Visualize for interaction or custom graphical layouts, and plotting tools for scientific figures. Choose features to serve the content.

### Callouts

```markdown
> [!CALLOUT] ⚠️
>
> **Decision needed:** choose the escalation owner.
>
> - Maya prepares the options.
```

The marker and body must be separate quoted paragraphs. The optional suffix is one emoji; omit it for no icon. Use paragraphs/lists inside unnested callouts. `[!NOTE]`, `[!WARNING]`, titles after the marker, and arbitrary colors are unsupported.

### Prompts and tasks

````markdown
```codex-prompt
Help me compare the open decisions on this Page.
```
````

A reader chooses **Chat about this** to submit this literal prompt in a new Page chat. If its text contains backtick fences, make the outer fence longer than any inside it.

A top-level `codex-task` fence shows **Run task** only on existing `meeting_notes` Pages. Other namespaces and nested fences render as code; never change the namespace to unlock the control. After launch, `codex-task:<thread UUID>` shows **Open chat** on any Page. Preserve this returned reference. Editing it sends no turn; rewriting it must not relaunch work, and a finished turn does not prove the action item is complete.

Submitted `@ChatGPT` mentions are separate Markdown task links, normally in comments, with owner/mention/thread identities and optional `source=page`. Preserve them exactly. Saving, reading, or reopening these forms never launches work or grants access to a private task.

### Rich table cells

Keep each GFM row on one line. Structural tags support native paragraphs, lists, checklists, and code within cells:

```markdown
| Area        | Acceptance                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| Recovery    | <p>Preserve the draft.</p><ul><li data-checked="false">Reconnect</li><li data-checked="true">Reopen cached notes</li></ul> |
| Diagnostics | <pre><code class="language-text">status: ready</code></pre>                                                                |
```

Supported tags: `<p>`, `<ul>`, `<ol start="3">`, `<li>` with optional `data-checked="true"`/`"false"`, and `<pre><code class="language-...">`. Preserve list `data-spread="true"`. Escape table pipes; encode literal code contents (`&`, `<`, `>`, quotes, line breaks) as entities. No arbitrary attributes, CSS, merged cells, or embeds. Outside cells, HTML remains text.

## References and embeds

- **Page/Space:** use `insert_page_link` or a canonical link. Titles resolve per viewer; deprecated `label` is ignored. Links grant neither access nor parentage. Create child Pages with the intended parent.
- **Files/images:** `[Name](project-file:<id>)` / `![Alt](project-file:<id>)`, or `library-file:` equivalents. Keep real IDs and storage prefixes. Image display can use `#display=minimal` or `#display=full`; regular links use link presentation. Web/local/data/signed-download URLs are not native image references.
- **Visualize:** `![Title](visualize:<file-id>)` embeds sandboxed HTML. For dashboards, metric panels, and charted trends, prefer Visualize over generated screenshots, even without an explicit request for interactivity. Follow the Page-specific workflow below.
- **Mentions:** preserve resolved person, file/path, chat/task, browser-tab, app, plugin, skill, agent, resource, or Site references. `person:` needs real account/mention identities; plain `@Name` is text. Chips and local paths do not upload files, run apps, grant access, or guarantee notifications.

### Visualize

Use Visualize when graphics or interaction clarify the content, especially for layouts native Page blocks cannot express or that need custom HTML. Examples include data explorers, adjustable simulations, maps, timelines, and interactive component previews. Use the bundled calendar for day schedules. Prefer native tables or Mermaid when sufficient; consider the sandbox's capabilities before rejecting an unsupported native format.

Follow the Visualize skill for HTML fragments, bundled widgets, design, and sandbox limits. For Page delivery, use this workflow instead of its inline-chat output contract:

1. Create or read the target Page and its guidance.
2. Call `create_page_visualization` with its `page_id`, a `title`, and `html` (at most 256 KiB UTF-8). The tool uploads **and inserts** the embed. Use `after_block_id` to position it or `replace_block` with the observed block/hash to replace one; pass `base_sequence` when available.
3. Inspect the edit receipt and read back the Page. If upload succeeded but insertion failed, check Page state and file access before reusing the returned reference; do not upload again. Inspect the rendered embed when a preview is available.

`visualize:` references must stand alone in a top-level paragraph. Nested placement, mixed text, ordinary links, and pasted HTML do not create viewers.

Keep Page headings, explanatory prose, takeaways, and sources in native Page blocks outside embeds. Use Visualize for graphical content; include only text needed to interpret or operate the visual, such as chart titles, labels, legends, brief annotations, tooltips, and controls.

Use separate blocks for independent visuals; combine panels in one responsive embed for side-by-side comparison. Single charts/components normally fit the reading column; dense tables, paired panels, and desktop mockups may need extra width. Avoid clipping and fixed viewport-height layouts; keep related prototypes consistent on plain backgrounds.

In Pages, widget state (`window.openai.widgetState`, updated with `window.openai.setWidgetState(...)`) is shared and synced between collaborators. Use it for choices, inputs, and other state that benefits from multiplayer sync. Treat state as externally mutable, including while the visualization is closed: read the latest state on initialization, apply incoming `openai:set_globals` updates, and tolerate missing or incompatible values. Do not overwrite saved state with defaults on load or write it back just because an update arrived.

### Charts

Use charts when seeing a trend, comparison, distribution, or relationship helps. Use prose for simple announcements and native tables for exact lookup. Choose lines for time, bars for categories, and scatterplots for numeric relationships.

Use Visualize and `create_page_visualization`, even without requested interactivity. Embed the result in the Page; keep takeaways and sources in native text. Use plotting tools for scientific figures intended for publication or export.

Derive marks, labels, tooltips, and summaries from the same data. State units and denominators, distinguish missing values from zero, and compute combined rates from combined counts. Do not treat overlapping categories as parts of a whole or infer causation from descriptive charts.

Follow Visualize accessibility guidance. Reflow plots and declutter labels for the available width; do not shrink wide SVGs or horizontally scroll short series.

When preview is available, wait for content to load and check the saved embed at wide and narrow widths: labels, clipping, complete series, values, filters, tooltips, and empty states. Fix and recheck. Uploads and source reads do not prove rendering; otherwise report what remains unverified.

### Images

Choose images to suit the Page's tone and purpose:

- For playful or informal Pages, consider using ImageGen when you have a fitting visual idea that adds humor, personality, or atmosphere, even without an explicit image request.
- For formal work documents, use images selectively when they help explain the content.

Use real supplied or searched photos when the subject's identity matters.

Public image URLs are useful sources, but `![Alt](https://...)` remains text in a Page.

1. Obtain the selected image as a real file: use a materialized search result, or save the publicly accessible image with an available download/executor tool. A search-result URL or source webpage is not a file. Check that the file contains PNG, JPEG, GIF, or WebP image bytes, at most 10 MiB, and retain the source link and credit.
2. Create the destination Page if needed, then call `write_page_reference` with its `page_id` and the real host file reference in `file` (an absolute local path when the schema requires it). Never pass a web URL or invent a file ID.
3. After `file_access_confirmed: true`, read the Page's guidance and insert the returned `markdown` with fresh edit guards. Uploading does not insert the image. Preserve its returned `project-file:` or `library-file:` reference; keep attribution in a separate ordinary source link.
4. Inspect the rendered Page when a preview is available. A successful download, upload, or Markdown save alone does not prove the image loaded.

If upload is unavailable or fails, report the missing step and keep ordinary source links instead of broken image Markdown. Reuse existing authorized references where appropriate. For unconfirmed access or an unknown upload outcome, inspect Files/Library before uploading again. `read_page_reference` only reads existing attachments.

## Block metadata

`set_block_metadata` merges top-level keys but replaces each supplied nested value. Preserve unrelated nested fields. These keys belong to canonical blocks, not the whole Page:

| Key                            | Shape and behavior                                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout`                       | `"normal"` (reading column), `"flexible"` (extend/scroll into margins), or `"full-width"` (available Page width).                                                     |
| `tableWidths`                  | Array of arrays of positive CSS-pixel widths or `null`. Outer order follows tables within the block; inner order follows columns. `null` leaves a column unspecified. |
| `codeWrap`                     | Boolean array in code-block order, including nested code. `true` wraps; `false` scrolls horizontally.                                                                 |
| `heading`                      | `{collapsed: true}` / `{collapsed: false}` on a standalone heading: shared default, locally overridable by readers. Keep the main answer visible.                     |
| `image`                        | `{file_id, width, height, crop?, alignment?, blurhash?}`. Positive dimensions; preserve the actual file ID and generated blurhash.                                    |
| `image:<opaque native anchor>` | Same geometry, per image occurrence, including rich content. Preserve native anchors; never invent or move them through generic metadata writes.                      |
| `visualization`                | `{file_id, width, alignment}`. Positive width, matching embed file ID; no height field.                                                                               |
| `visualization_state`          | Runtime-owned, file-bound widget state. Reads expose only its `modelContent` projection; never write that back as the complete state.                                 |
| `page_automations`             | Service-owned instruction automation configuration/status. Preserve it; use the available reconciliation tool for authorized maintenance.                             |

Image/visualization alignment is `"left"`, `"center"`, or `"right"`. Image `crop` contains removed fractions: required `top`/`bottom`, optional `left`/`right`, each 0-0.9 and each axis sum at most 0.9. Cropping leaves the source unchanged. Never guess dimensions or derive occurrence anchors from file IDs.

Use the observed block's `b.id`/`b.hash`, for example:

```javascript
{op: "set_block_metadata", block_id: b.id, expected_hash: b.hash,
 metadata: {layout: "full-width", tableWidths: [[180, 360, 220]]}}
```

New content can carry metadata in a `block_units` object:

```javascript
{kind: "markdown", markdown: "## Reference details",
 metadata: {heading: {collapsed: true}}}
```

Markdown replacement retains the first block's metadata and merges supplied top-level keys. Supply only intentionally changed metadata keys rather than copying read metadata into the edit. Do not copy geometry/anchors onto unrelated replacement blocks. Prefer guarded text patches around existing images; verify structural rewrites. Preserve unknown metadata and never replace complete stored state with a model-visible projection.

## Instructions and context

- **Agent Instructions:** a dedicated `agent_instructions` block stores user-requested guidance for an agent working on the Page, such as how to maintain its content. This is Page content, not the connector's tool description; a heading named "Agent Instructions" is ordinary text. Writing the block alone does not schedule or activate maintenance; report reconciliation/approval status accurately.
- **Comments:** block or text-anchored discussions support replies, reactions, and resolution. Use observed IDs and comment tools; recreating blocks can lose anchors.
- **Meetings:** use `read_page_transcript` when available and meeting facts are needed, honoring source status and pagination. Page sharing does not grant transcript/private-task access.
- **Inline generation/slash commands:** authoring actions for text, Visualize, and mentions, not additional stored block kinds or automatic execution instructions.

## Other documents and unsupported forms

Native Sheets (`granola_workbook`) and Slides (`granola_presentation`) have separate models and native tool workflows. Ordinary Page edits cannot substitute for those. A returned artifact link is not editable content embedded in a Page.

Unsupported native forms: generic toggles, arbitrary text/background colors, underline/highlight, multi-column sections, math/footnote extensions, audio/video players, and arbitrary iframes. Use heading disclosure, callouts, readable notation, or links where appropriate. Preserve existing content with unverified rendering. A media link does not prove inline playback; Visualize has separate sandbox capabilities. Raw HTML remains text except for rich-cell serialization; it cannot create Page DOM, CSS, or scripts.
