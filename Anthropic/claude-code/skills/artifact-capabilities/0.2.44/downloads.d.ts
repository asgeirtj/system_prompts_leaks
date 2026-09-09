/**
 * The `downloads` capability — offer a file your frame generated to the
 * viewer. `save({filename, data})` shows the viewer a confirmation
 * (final filename + size); the file is saved only if they accept. Frame
 * code never downloads directly. Obtain the namespace with
 * `await claude.use("downloads")` — `null` means this view cannot run
 * the capability; design for absence.
 */

declare namespace Claude {
  namespace downloads {
    /** Rejection shape for {@link save}. Branch on `.code`. */
    interface DownloadsError {
      code: DownloadsErrorCode;
      message: string;
    }

    /**
     * Stable error codes; treat unknown codes as `"unavailable"`.
     * - `rejected_extension` — extension missing or outside the allowlist
     *   (`gif png jpg jpeg webp mp4 webm txt json md` and
     *   `docx pptx epub csv ttf html svg pdf xlsx zip`). Offer the format the
     *   content wants (a plain table is a `csv`, a workbook an `xlsx`);
     *   do not pre-build fallbacks to other formats.
     * - `extension_not_enabled` — the platform has switched the second
     *   list off for this view. Not the normal state: if it arrives, tell
     *   the viewer that format is unavailable here and stop — no retry,
     *   no pre-built fallback chain.
     * - `too_large` — only an export answer (`request` set) can draw
     *   it: the file is larger than the destination the viewer chose
     *   accepts (16 MiB today). An ordinary save has no size limit, so
     *   never cap, trim, or re-encode a download to fit one.
     * - `declined` — the viewer said no (or let the prompt expire);
     *   never auto-retry.
     * - `rate_limited` — a prompt is already open or too many recent
     *   prompts; wait, then retry.
     * - `bad_request` — caller bug: bad filename (non-string or >512
     *   chars), bad/empty/detached data, a malformed `request`, or an
     *   answered export whose extension is not the requested format.
     * - `request_unknown` — `request` named no open export request
     *   (expired, already answered, or never issued to this page);
     *   nothing was saved. Drop the work; never retry with that token.
     * - `unavailable` — saves unusable in this view; hide your save UI.
     * - `not_granted`, `capability_disabled`, `capability_removed`,
     *   `transform_error` — runtime lifecycle; treat like `unavailable`
     *   (`transform_error` like `bad_request`).
     */
    type DownloadsErrorCode =
      | "rejected_extension"
      | "extension_not_enabled"
      | "too_large"
      | "declined"
      | "rate_limited"
      | "bad_request"
      | "request_unknown"
      | "unavailable"
      | "not_granted"
      | "capability_disabled"
      | "capability_removed"
      | "transform_error";

    interface SaveRequest {
      /**
       * Suggested filename with extension. It is sanitized and
       * allowlist-checked; the viewer confirms the FINAL name, which may
       * differ.
       */
      filename: string;
      /**
       * Non-empty contents; no size limit. Strings encode UTF-8. An
       * ArrayBuffer is TRANSFERRED (detached after the call) — pass
       * `buf.slice(0)` if you still need it; views are copied; a Blob is
       * handed over as-is, neither read nor transferred (except when
       * `request` is set: then it is read into one buffer), so prefer
       * a Blob for large files. MIME comes from the extension; a Blob's
       * own type (and a File's name) is ignored.
       */
      data: string | Blob | ArrayBuffer | ArrayBufferView;
      /**
       * Only when answering an export the platform asked this page for:
       * the opaque token that arrived with the request, verbatim. The
       * viewer is then asked to let the file go where they chose instead
       * of saving it, and the call resolves `"delivered"`. Omit for an
       * ordinary save.
       */
      request?: string;
    }

    interface SaveResult {
      /**
       * `"saved"` = viewer accepted and the file was handed to the host's
       * save surface — the browser download, or the native share sheet in
       * the Claude iOS app (a host may still drop a download downstream,
       * unobservably). `"delivered"` = the save carried `request` and the
       * viewer accepted: the file was handed to the platform for the
       * destination they chose, not saved; show no "saved" notice.
       */
      status: "saved" | "delivered";
    }

    /**
     * Offer the file. Resolves when the viewer accepts; rejects with
     * {@link DownloadsError} for every other outcome. One undecided
     * prompt at a time (first-wins).
     */
    function save(request: SaveRequest): Promise<SaveResult>;
  }
}

interface ClaudeCapabilityMap {
  downloads: typeof Claude.downloads;
}
