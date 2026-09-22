/**
 * The `assets` capability — store binary assets (image, SVG, video, PDF,
 * or web font) and text files (CSV, Markdown, JSON, plain text, CSS,
 * JavaScript) for this artifact and get back durable asset ids.
 *
 * Methods: `upload(blob, options?)` resolves `{id, url, sizeBytes,
 * contentType}`; `list()` resolves every stored asset plus the
 * artifact's storage usage; `delete(ref)` removes one asset. Assets live
 * with the artifact: they survive reloads and republishes, are shared by
 * all of the artifact's viewers, and are deleted with the artifact. The
 * `db` document an id is stored in remains the asset's index — a listing
 * carries no names or meaning of its own, so `list()` is for
 * housekeeping (a storage meter, removing assets no row points at), not
 * a gallery source. On a runtime predating a method, calling it rejects
 * `capability_removed`, so handle rejection codes rather than probing
 * for members.
 *
 * The capability is a NAMESPACE of methods: obtain it with
 * `const assets = await claude.use("assets")`, then call
 * `assets.upload(...)`. Every method is WRITER-ONLY: the platform grants
 * the capability only to viewers holding this artifact's write bit, so
 * on a read-only view `use("assets")` resolves `null` — hide upload and
 * delete affordances on `null`, and still handle the rejection codes on
 * every call (`not_granted` remains the per-call backstop). Declare
 * `capabilities: {assets: {}}`
 * (declare `db` too — an asset id without a document to live in is lost
 * when the page reloads). A declaring artifact is organization-internal
 * and cannot be shared publicly.
 *
 * What to store where, the one invariant worth designing around: store
 * the returned `id` (an opaque 32-char string) in `db` documents as the
 * durable pointer — e.g. `{"ticket_id": 7, "screenshot": id}` — and
 * build the display URL per view from it. The returned `url` is that
 * display URL, already correct for the current view — use it verbatim
 * as an `<img>`/`<video>`/`<script>` `src`, a stylesheet `<link>`
 * `href`, an `@font-face` `src: url()`, or a download link's `href`.
 * To display an asset whose id you read back
 * from `db`, build `"/_blob/" + id`: that root-relative path resolves
 * from every page and version of the artifact (the one root-relative
 * path the platform serves).
 * An SVG asset displays through `<img>` or CSS `url()` only — it is
 * served as an image, never as a document to inline or navigate to.
 * SVG is sanitized on upload: scripts, event handlers, `<foreignObject>`,
 * `<style>`/`<link>`, animation elements, external `<use>` references
 * and `javascript:`/`data:` URLs are removed and the file is re-encoded
 * (`sizeBytes` is the stored size), so style SVG with attributes, not
 * `<style>` blocks, and upload rasters separately rather than inlining
 * them as `data:` (a design-tool export with embedded images uploads
 * fine, but those images render blank). SVG files are capped at 2 MiB,
 * CSS and JavaScript at 16 MiB, other types at 20 MiB.
 *
 * Text files (`text/csv`, `text/markdown`, `application/json`,
 * `text/plain`, `text/css`, `text/javascript`) are stored and served
 * byte-for-byte under their declared type, never rendered as a page: a
 * page that ingests a data file reads it back from its `url` and parses
 * the text itself; a stylesheet or script asset takes effect where one
 * of the artifact's own pages references it, same-origin, e.g.
 * `<link rel="stylesheet" href={url}>` or `<script src={url}>`. The
 * type must be the exact spelling — a `;charset=` parameter or a
 * platform alias (a `.csv` picked on Windows can report
 * `application/vnd.ms-excel`; `.js` often reports
 * `application/javascript`) rejects — so pass `options.type` chosen
 * from the file's extension whenever `blob.type` is not already one of
 * the six. The text must be valid UTF-8 (a byte-order mark is fine);
 * UTF-16, UTF-32 or a legacy single-byte encoding rejects
 * `invalid_request`, so re-encode such a file before uploading. The
 * four data types are otherwise never inspected: a Markdown or
 * plain-text file that opens with an HTML tag or comment is stored as
 * given. A stylesheet or script must also read as text: one that opens
 * with markup or carries binary content rejects `unsupported_type`.
 * Markup under any other type uploads only as `image/svg+xml`.
 */

declare namespace Claude {
  /**
   * Failure design: branch the UX on the error `code`, never on message
   * text. `store_unavailable` is the only retry-once code; everything
   * else is either a page bug, a per-view permanent condition, or needs
   * the viewer to change what they are uploading or deleting.
   */
  namespace assets {
    /** Options for {@link Claude.Assets.upload}. */
    interface UploadOptions {
      /** Content type to record and serve, overriding `blob.type`.
       * Required when `blob.type` is empty; must be in the accepted
       * set. Exact media types only — no parameters. Font files picked
       * from disk often carry an empty or legacy `blob.type`; pass the
       * `font/` form (`font/woff2`, `font/woff`, `font/ttf`,
       * `font/otf`) here. Text files often carry a charset
       * parameter, an empty type, or a platform alias such as
       * `application/vnd.ms-excel` for `.csv` or `application/javascript`
       * for `.js`; pass the bare `text/csv`, `text/markdown`,
       * `application/json`, `text/plain`, `text/css` or
       * `text/javascript`, picked by file extension. */
      type?: string;
    }

    /** Resolution shape for {@link Claude.Assets.upload}. */
    interface UploadResult {
      /** Opaque 32-char asset id — the DURABLE pointer. Store this in
       * `db` documents; it never changes and never embeds content. */
      id: string;
      /** Display URL for the current view; use it verbatim. Derivable
       * from `id` at any time as `"/_blob/" + id`; do not store it. */
      url: string;
      /** Stored byte count, as the platform recorded it. */
      sizeBytes: number;
      /** The content type the asset will be served with. */
      contentType: string;
    }

    /** One stored asset, as {@link Claude.Assets.list} reports it. */
    interface Asset {
      /** Opaque 32-char asset id — the same durable pointer
       * {@link Claude.Assets.upload} resolved. */
      id: string;
      /** Display URL for the current view; use it verbatim. */
      url: string;
      /** The content type the asset is served with. */
      contentType: string;
      /** Stored byte count. */
      sizeBytes: number;
      /** Upload time, an RFC 3339 UTC timestamp. */
      createdAt: string;
    }

    /** The artifact's asset budget and how much of it is used. */
    interface Usage {
      /** Stored asset count. */
      files: number;
      /** Stored bytes across every asset. */
      bytes: number;
      /** The per-artifact asset-count limit. */
      maxFiles: number;
      /** The per-artifact byte quota. */
      maxBytes: number;
    }

    /** Resolution shape for {@link Claude.Assets.list}. */
    interface ListResult {
      /** Every stored asset, oldest first. */
      assets: Asset[];
      usage: Usage;
    }

    /** Resolution shape for {@link Claude.Assets.delete}. */
    interface DeleteResult {
      /** `true` when this call removed the asset; `false` when nothing
       * was stored under that id (already deleted, or never uploaded to
       * this artifact). Both are success. */
      deleted: boolean;
    }

    /**
     * Rejection shape for every call. `message` is human-readable but
     * not localized.
     */
    interface UploadError {
      code: UploadErrorCode;
      message: string;
    }

    /**
     * Stable error codes. Treat unknown codes as `"upstream_error"`.
     *
     * - `invalid_request` — the call is malformed: upload's first
     *   argument is not a `Blob`/`File`, the blob is empty, `options`
     *   breaks a rule above, a text file (csv, markdown, json, plain,
     *   css, javascript) is not valid UTF-8, or delete's argument is not
     *   an asset id or its `url`. A page bug, or a file to re-encode;
     *   fix the call.
     * - `too_large` — over the per-file limit (2 MiB for SVG, 16 MiB
     *   for CSS and JavaScript, 20 MiB for other types). Compress or
     *   split; the limit is not negotiable per call.
     * - `unsupported_type` — the content type is not in the accepted
     *   set (png, jpeg, gif, webp, svg+xml, mp4, webm, pdf, woff2,
     *   woff, ttf, otf, text/csv, text/markdown, application/json,
     *   text/plain, text/css, text/javascript), it carries a parameter,
     *   an SVG body is not an SVG document, a body declared as an
     *   image, video, PDF or font type starts with markup (a first
     *   non-blank `<` under a binary type is accepted only as
     *   `image/svg+xml`), or a stylesheet or script starts with markup
     *   or does not read as text (the four data types are never
     *   inspected). The set is closed; wrap other data in a
     *   supported container or store small data in `db`.
     * - `quota_or_state` — the artifact cannot accept the call right
     *   now: its storage quota or file count is exhausted (upload), or
     *   it is unpublished, being deleted, or retired. Surface the
     *   condition; uploading something smaller, or deleting assets no
     *   row points at, may work for the quota half only.
     * - `rate_limited` — calling too often; back off and let the
     *   viewer retry. Never loop.
     * - `upstream_auth` — the platform could not authenticate the
     *   call; ask the viewer to reload or sign in again.
     * - `capability_disabled` — granted but not usable in this view
     *   (the serving runtime predates it, its module failed to load,
     *   or the platform has it off here). Hide asset affordances.
     * - `store_unavailable` — transient platform trouble; retry once
     *   after a short delay.
     * - `upstream_error` — anything else, including every code this
     *   contract predates and an unanswered call.
     *
     * Lifecycle codes (from the runtime itself, not the store):
     * - `not_granted` — this view did not grant assets to the frame.
     * - `capability_removed` — the called method is not part of the
     *   runtime serving this view; treat like `capability_disabled`.
     * - `transform_error` — the runtime's instrumentation pipeline
     *   failed on this call; treat like `upstream_error`.
     */
    type UploadErrorCode =
      | "invalid_request"
      | "too_large"
      | "unsupported_type"
      | "quota_or_state"
      | "rate_limited"
      | "upstream_auth"
      | "capability_disabled"
      | "store_unavailable"
      | "upstream_error"
      | "not_granted"
      | "capability_removed"
      | "transform_error";
  }

  /**
   * The method namespace `await claude.use("assets")` resolves for a
   * writer (`null` for a reader).
   */
  interface Assets {
    /**
     * Store `blob` as an artifact asset and resolve with its id and
     * display URL. The id is the durable pointer: write it into the
     * document store right after the call resolves (for instance, a
     * ticket row keeping a screenshot field), and use the resolved
     * `url` for image or video sources in the current view. A later
     * view rebuilds the source from the stored id as `"/_blob/" + id` —
     * ids never expire, and that path resolves from every page and
     * version of the artifact.
     *
     * The upload is not transactional with any `db` write: write the id
     * into its document right after the call resolves, and treat a pointer
     * whose asset 404s as deleted (render a placeholder).
     *
     * @param blob The bytes: a `Blob` or `File`, 1 byte to 20 MiB (2 MiB
     *   for SVG, 16 MiB for CSS and JavaScript), whose type (or
     *   `options.type`) is in the accepted set.
     * @param options `{type?}` — see {@link assets.UploadOptions}.
     */
    upload(
      blob: Blob,
      options?: assets.UploadOptions,
    ): Promise<assets.UploadResult>;

    /**
     * List every asset stored for this artifact, oldest first, with the
     * artifact's storage usage. A housekeeping read: drive a storage
     * meter from `usage`, or reconcile against the ids your `db` rows
     * hold to find assets nothing points at. It is not a substitute for
     * those rows — entries carry no names, order keys, or ownership.
     */
    list(): Promise<assets.ListResult>;

    /**
     * Delete one asset by id (or its url exactly as `upload`/`list`
     * returned it) and resolve `{deleted}`.
     * IRREVERSIBLE and artifact-wide: every viewer's `<img>`/link to it
     * starts returning 404, so remove or rewrite the `db` rows holding
     * the id in the same deliberate user action, and otherwise call it
     * only on ids no row points at — never speculatively or in bulk on
     * load. Idempotent: an id with nothing stored resolves
     * `{deleted: false}`.
     */
    delete(ref: string): Promise<assets.DeleteResult>;
  }
}

interface ClaudeCapabilityMap {
  assets: Claude.Assets;
}
