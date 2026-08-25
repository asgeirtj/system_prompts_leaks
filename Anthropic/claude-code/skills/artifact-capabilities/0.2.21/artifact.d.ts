/**
 * The `artifact` capability — artifact publish: this page writes to ITSELF
 * by publishing a new version (`publish`). LIVE DOCS ONLY: on an artifact
 * the platform created as a live doc (neither the page nor its declaration
 * chooses that), edits are appended instead, by `edit` or by a viewer's
 * gestures on the markup (`sync`); see those members.
 *
 * The page hands the shell a complete replacement `index.html` — or, on a
 * multi-file artifact, just the files that changed — and the shell
 * publishes it as a new immutable version of the same artifact with the
 * viewer's own authority; every open view live-reloads to it (a files
 * publish leaves the publishing view running — see {@link publish}). Obtain
 * the namespace with `await claude.use("artifact")` — `null` means this view
 * cannot run the capability; a read-only view still resolves the
 * namespace, and its write verbs surface as rejection codes
 * (`not_granted` / `not_writer`), never as `null`.
 */

declare namespace Claude {
  /**
   * Failure design — read before writing any call site. A publish is a
   * write with real preconditions, and two of its failures are ROUTINE:
   *
   * - `conflict` — someone else (another viewer, or the author's own
   *   editing session) published between this page's load and this call.
   *   This is not an error state to apologize for: the shell is already
   *   reloading every open view to the winning version, so the correct
   *   handling is almost always to do nothing beyond aborting local
   *   optimistic UI — the reload delivers the new truth. If the page
   *   holds unsent viewer input worth preserving across that reload,
   *   stash it in `sessionStorage` before calling `publish` (state kept
   *   only in JS variables does not survive the reload).
   * - `not_writer` — this viewer can see the page but cannot write it.
   *   Member presence does NOT signal writability (see the member doc),
   *   so a shared page should treat its first `not_writer` or
   *   `not_granted` rejection as the read-only signal: disable or hide
   *   write affordances from then on, with copy that says the view is
   *   read-only rather than that something failed.
   *
   * The rest are exceptional: branch the UX on the error `code`, never
   * on message text; retry only `upstream_error`, at most once after a
   * short randomized delay; treat `rate_limited` as a signal to slow the
   * page's own cadence (batch several changes into one publish), never
   * to retry-loop.
   */
  namespace artifact {
    /**
     * Rejection shape for {@link publish}. Branch on `.code`;
     * `.message` is human-readable but not localized.
     */
    interface ArtifactError {
      code: ArtifactErrorCode;
      message: string;
      /** On `conflict`: the version identifier that is now live. */
      live?: string;
    }

    /**
     * Stable error codes. Treat unknown codes as `"upstream_error"` —
     * but note the lifecycle codes below are PERMANENT for the view:
     * never retry them.
     *
     * - `conflict` — a newer version was published first; the view is
     *   already being reloaded to it. See the failure-design note above.
     * - `not_writer` — the viewer lacks write access to this artifact.
     * - `not_declared` — the artifact no longer declares this capability
     *   (a republish dropped it). Hide write affordances.
     * - `too_large` — the submitted HTML, or the submitted files
     *   together, exceed the size limit.
     * - `invalid_content` — the submitted string is not an HTML page
     *   (it must begin with a doctype, like the page itself does), or a
     *   files argument is malformed (a path, content, or content type the
     *   artifact cannot store).
     * - `read_only_path` — on an artifact made from a TYPE (it keeps the
     *   type's page and files read-only; only its own files can change):
     *   a files publish named one of the type's paths — nothing was
     *   published; drop that path and publish the rest — or an `html`
     *   publish was attempted, which such an artifact never accepts; use
     *   the files form.
     * - `rate_limited` — publishing too often; slow down and batch.
     * - `consent_required` — legacy code from shells that gated
     *   artifact publish on a per-viewer consent prompt; current shells
     *   never send it (the grant is by construction). Treat
     *   like `not_granted`: render the read-only experience.
     * - `upstream_error` — anything else (transient service failure).
     *
     * Lifecycle codes (from the runtime itself, not the publish path) —
     * permanent for this view, never retryable:
     * - `not_granted` — the viewer's session did not grant `artifact` to
     *   this frame (undeclared artifact, or a read-only view); render
     *   the read-only experience.
     * - `capability_disabled` — granted but not usable in this view
     *   (the serving runtime predates it, or its module failed to
     *   load), or — for the files form of {@link publish} — the form is
     *   not available to this view or this artifact; treat like
     *   `not_granted`.
     * - `capability_removed` — the called method is not part of the
     *   runtime serving this view; treat like `capability_disabled`.
     * - `transform_error` — the call's arguments could not be prepared;
     *   treat like `invalid_content`.
     */
    type ArtifactErrorCode =
      | "conflict"
      | "not_writer"
      | "not_declared"
      | "too_large"
      | "invalid_content"
      | "read_only_path"
      | "rate_limited"
      | "consent_required"
      | "upstream_error"
      | "not_granted"
      | "capability_disabled"
      | "capability_removed"
      | "transform_error";

    /** Resolution shape for {@link publish}. */
    interface PublishResult {
      /** The new version's identifier — informational; the shell reloads
       * every open view to it (after an `html` publish this one too; after
       * a files publish this view keeps running and builds on it). */
      version: string;
    }

    /**
     * One file in a files publish: UTF-8 text as a string, binary bytes
     * as a `Blob`, or either wrapped as `{content, contentType}` to state
     * the media type explicitly (a bare type such as `text/plain`, no
     * `;charset` parameters; a string needs a text type, anything else
     * goes as a `Blob`). Without `contentType` the type is the
     * Blob's own `type`, else inferred from the path's extension for the
     * common web types (html, htm, css, js, mjs, json, webmanifest, txt,
     * md, xml, svg, png, jpg, jpeg, gif, webp, avif, ico, woff, woff2,
     * ttf, otf, mp3, wav, mp4, webm, pdf, wasm); any other name needs an
     * explicit `contentType`, and the artifact stores only servable web
     * media types.
     */
    type PublishFile =
      | string
      | Blob
      | { content: string | Blob; contentType?: string };

    /**
     * Publish `html` as the new live version of this artifact.
     *
     * `html` must be the COMPLETE replacement page — a full document
     * starting with `<!doctype html>`, exactly what a fresh viewer should
     * receive. Do not serialize the live DOM (`document.documentElement.
     * outerHTML` contains viewer-session state and injected runtime
     * scripts); instead, keep the page's canonical source in JS — for
     * example a template function of the page's state — and render the
     * replacement from that, the same way the page was authored.
     *
     * The write is compare-and-set against the version this view is
     * running: if anything published in between, the call rejects with
     * `conflict` and the view reloads to the winner. After a successful
     * publish this view reloads too — treat `publish` as the last act of
     * an interaction, and stash anything that must survive in
     * `sessionStorage` first.
     *
     * Publishing runs with the VIEWER's authority and identity: on a
     * shared artifact where other people can write, each viewer's click
     * publishes as them. Every version is attributed and the full page
     * is replaced atomically — there is no partial update.
     */
    function publish(html: string): Promise<PublishResult>;

    /**
     * FILES FORM — publish just the files that changed as the new live
     * version: `files` maps relative paths (`"data/doc.json"`,
     * `"notes.md"`) to their new content, or to `null` to delete the
     * path; every path not named is carried over unchanged from this
     * view's latest version (the one it loaded, or the one its last files
     * publish made). This is the save path for editor-style artifacts
     * whose page stays fixed while its data files change — including an
     * artifact made from a TYPE, whose page (`index.html`) and other type
     * files are read-only: naming one rejects `read_only_path` and
     * publishes nothing, and the `html` form is refused there outright
     * (the page cannot be replaced from the view at all).
     *
     * Same compare-and-set, same viewer authority, same `conflict` /
     * `not_writer` design as the `html` form — with one difference: on
     * success THIS view is not reloaded. It keeps running with its state
     * intact, its next publish builds on the version it just made, and
     * only the OTHER open views reload. Relative URLs in this view still
     * serve the version it loaded, so render saved content from the data
     * the page holds (not by re-fetching the file it just wrote). Every
     * call still mints a full version, so never publish per keystroke:
     * debounce edits into one call a few seconds after the user pauses
     * (or on an explicit Save), and send all changed files in that one
     * call. Where the form is not available — the view's host does not
     * enable it (a read-only view included), or the artifact is shared
     * publicly — the call rejects `capability_disabled`: keep the user's
     * work in the page and say saving is unavailable here.
     */
    function publish(
      files: Record<string, PublishFile | null>,
    ): Promise<PublishResult>;

    /**
     * One id-addressed edit to a LIVE DOC (an artifact created as a live
     * doc — its content is an edit journal, there are no versions).
     * `target` is an element's `data-id`: the server stamps one on every
     * element it serves, so read it off the DOM (`el.dataset.id`).
     *
     * - `set-text` replaces the element's text content.
     * - `set-attr` / `del-attr` set or remove one attribute (`data-*`,
     *   `class`, `hidden`, `aria-*` and so on — not `data-id` itself).
     * - `create-element` appends a child `<tag>` under `target` (optionally
     *   at `index` among the parent's child nodes, with initial `text` and
     *   `attrs`); the server assigns its id and returns it in `created`, in
     *   op order — target that id in a following call. (`newId` is retired
     *   and refused.)
     * - `remove` deletes the element and its subtree.
     */
    type EditOp =
      | { op: "set-text"; target: string; text: string }
      | { op: "set-attr"; target: string; key: string; val: string }
      | { op: "del-attr"; target: string; key: string }
      | {
          op: "create-element";
          target: string;
          tag: string;
          text?: string;
          /** initial attributes (set-attr's rules; at most 16) */
          attrs?: Record<string, string>;
          newId?: string;
          index?: number;
        }
      | { op: "remove"; target: string };

    /** Resolution shape for {@link edit}. */
    interface EditResult {
      /** The journal position this edit landed at — informational. */
      seq: number;
      /** Server-assigned data-ids for `create-element` ops that omitted
       * `newId`, in op order. */
      created: string[];
    }

    /**
     * LIVE DOCS ONLY — append `ops` to this document as the viewer. This is
     * how a page and a watching Claude session COLLABORATE in real time:
     * the moment the edit lands, Claude is told what changed (which
     * element, its text/attributes) and typically answers with an edit of
     * its own a second or two later, which this view then re-renders to.
     *
     * Apply your change to your own DOM as well (optimistically, before or
     * after the call): this view is NOT re-rendered for its own edits —
     * only for other writers' (Claude's, another viewer's). Keep the state
     * that matters IN THE DOCUMENT (text, `data-*` attributes), not in JS
     * variables. When someone else's SMALL edit lands (attributes / text on
     * existing elements — e.g. Claude answering you) it is applied to your
     * DOM in place and `document` receives a `claude:edit` CustomEvent
     * (`detail: {seq, targets: string[]}` — the data-ids touched): react to
     * it, e.g. `document.addEventListener('claude:edit', e => render())`.
     * A structural edit (elements created/removed) re-renders the view from
     * the document and your scripts run again — so state kept in the DOM
     * survives either way.
     *
     * Rejections: `not_writer` / `not_granted` (read-only viewer — hide the
     * control), `invalid_content` (a bad op, an id that no longer exists,
     * or this artifact is not a live doc), `conflict` (the document moved
     * under the edit — re-issuing the same call is safe), `rate_limited`
     * (slow down; batch several changes into one call), `upstream_error`
     * (the service failed OR the response was lost — the edit MAY have
     * landed: the runtime already retried once with the same idempotency
     * key, so retry yourself only with ops that are safe to apply twice —
     * `set-*`/`del-attr`/`remove`, or `create-element` WITH a `newId` —
     * never a bare `create-element`, which could duplicate). One call
     * carries at most 32 ops; prefer one call per user gesture.
     */
    function edit(ops: EditOp[]): Promise<EditResult>;

    /**
     * LIVE DOCS ONLY — the zero-API way to write. On a live doc THE PAGE'S
     * MARKUP IS THE DOCUMENT: whatever a writer's own click, keystroke or
     * drag does to the DOM — text, attributes, elements added, removed or
     * reordered, checkbox state, a text input's value, typing in
     * `contenteditable` — is appended to the document as that viewer (the
     * same journal `edit` writes to) and reaches every other view and the
     * watching Claude session. Nothing to mark: the runtime treats `<body>`
     * as the sync region (it sets `<body artifact-sync>` itself); its SERVED
     * children are the document, and an element your script appends straight
     * to `<body>` - a toast, a modal or tooltip portal - stays this view's.
     * Paste into editable markup lands as plain text.
     *
     * What stays this view's alone: CHANGES inside an `<artifact-local>`
     * element / `artifact-local` attribute (its markup is still shared as
     * authored — every view gets the same filter box or "saving..." chip;
     * only what a view does to it is local, and it comes back EMPTY for
     * others if its row is moved); any `data-local-*` attribute anywhere (a
     * viewer's own selection, hover, expanded state on a shared element);
     * `open` on `<details>`/`<dialog>`; and password / hidden /
     * payment-autocomplete inputs, whose values never enter the document.
     * So per-viewer UI — filter and search inputs, tabs, sort order, drafts,
     * expanded/collapsed chrome — goes inside `<artifact-local>` or is kept
     * on `data-local-*` attributes; everything else a viewer changes is
     * everyone's. Islands and regions nest both ways (an `<artifact-sync>`
     * element or `artifact-sync` attribute inside an island is shared again;
     * the innermost marker governs), the marker elements are layout-neutral
     * (`display: contents`), and a page that marks `<body>` or `<html>`
     * itself keeps what it chose — `<body artifact-local>` makes the whole
     * page local except the regions it marks explicitly (use the attribute
     * form inside tables and lists: `<tbody artifact-sync>`).
     *
     * Two rules make it work:
     * - SERVE the content as HTML in the page; change it in event handlers
     *   however you like - in place (`li.remove()`, `el.textContent = x`,
     *   `list.append(li)`, `el.classList.toggle(...)`) or by re-rendering a
     *   container (`list.innerHTML = render(items)`): a re-render is
     *   reconciled against what it replaced (rows paired by `data-key`/`id`
     *   if you give one, else by content, else by position) and only the
     *   rows and text that actually changed are saved. What is NOT the
     *   document is markup a script renders with no gesture behind it - on
     *   load, on a timer or animation frame, after `await fetch()`: nothing
     *   of it is saved, and an element found holding such script-built
     *   children is switched OFF for the view (saving continues everywhere
     *   else): the console says so, that element gets
     *   `artifact-sync-state="off"` (style `[artifact-sync-state=off]`) and
     *   a `claude:sync-off` event bubbles from it; moving or copying such an
     *   element by gesture is not saved either. So a chart or computed
     *   summary you render from script belongs in `<artifact-local>` (the
     *   element around it then moves freely), and if you keep JS state,
     *   update it from `claude:edit` so a re-render never rolls back
     *   another writer's change. Prefer `class`/`hidden`/`data-*`/`aria-*`
     *   for state you toggle: other attributes reload the other views
     *   instead of patching.
     * - Keep each editable text in its own element (`<span>`, `<p>`, `<td>`
     *   with no child elements): text mixed with child elements cannot be
     *   saved (the console warns when a gesture produces it).
     *   `<textarea>`/`<select>` values and canvas pixels are not captured;
     *   use `<input>` / `contenteditable`, or call `edit`.
     *
     * `sync(fn)` is the deliberate exception to the gesture rule: it runs
     * `fn` (which may be async) with capture on — inputs it sets included —
     * and resolves once what `fn` changed in shared markup has been
     * appended, or rejects with the `edit` error code if it was not. For the
     * rare write with no gesture behind it (applying a poll result you DO
     * want everyone to see). Read-only viewers' changes are never saved
     * (their first attempt turns capture off for the view: every region,
     * the adopted `<body>` included, gets `artifact-sync-state="off"`) — style them a read-only
     * page. A transient failure keeps the changes and sends them with the
     * next one (`claude:sync-lost` event, `{code, count}`).
     */
    function sync(fn: () => unknown): Promise<void>;
  }
}

interface ClaudeCapabilityMap {
  artifact: typeof Claude.artifact;
  /** Legacy spelling — `claude.use("self")` resolves the same namespace. */
  self: typeof Claude.artifact;
}
