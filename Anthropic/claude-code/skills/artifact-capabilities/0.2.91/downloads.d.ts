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
     *   (`gif png jpg jpeg webp mp4 webm mov txt json md` and
     *   `docx pptx epub csv ttf html svg pdf xlsx zip fig`). Offer the format the
     *   content wants (a plain table is a `csv`, a workbook an `xlsx`);
     *   do not pre-build fallbacks to other formats. For a `mov`: the app
     *   around the artifact is out of date; the viewer needs to reload or
     *   update it.
     * - `extension_not_enabled` — the platform has switched the second
     *   list off for this view. Not the normal state: if it arrives, tell
     *   the viewer that format is unavailable here and stop — no retry,
     *   no pre-built fallback chain.
     * - `too_large` — this file is over a ceiling: an export answer
     *   (`request` set) larger than the destination the viewer chose
     *   accepts (16 MiB today), or an ordinary save over 200 MiB in a
     *   host that writes files itself (the Claude Android app). Other
     *   ordinary saves have no size limit: never cap, trim, or re-encode
     *   a download up front; on `too_large`, offer a smaller rendition.
     * - `declined` — the viewer said no (or let the prompt expire);
     *   never auto-retry.
     * - `rate_limited` — a prompt is already open, too many recent prompts
     *   (each `mov` save that is checked counts as one, shown or not), or an
     *   earlier `mov` save still being checked; wait, then retry.
     * - `bad_request` — caller bug: bad filename (non-string or >512
     *   chars), bad/empty/detached data, a malformed `request`, or an
     *   answered export whose extension is not the requested format.
     * - `request_unknown` — `request` named no open export request
     *   (expired, already answered, or never issued to this page);
     *   nothing was saved. Drop the work; never retry with that token.
     * - `not_signed` — a `mov` is saved only with content credentials, and
     *   none were added; nothing was saved. A `mov` that your own code encodes
     *   is refused in claude.ai every time (it signs only the platform's
     *   built-in film export): do not retry it; offer `mp4` or `webm`. For that
     *   export, keep the file: the viewer can try again, or open the artifact in
     *   claude.ai if this view is outside it; reloading Claude may help.
     * - `unavailable` — saves unusable in this view; hide your save UI. For a
     *   `mov` it can also be a busy moment, and the code does not say which:
     *   keep the file and leave the viewer a way to retry.
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
      | "not_signed"
      | "unavailable"
      | "not_granted"
      | "capability_disabled"
      | "capability_removed"
      | "transform_error";

    interface SaveRequest {
      /**
       * Suggested filename with extension. It is sanitized (invisible
       * characters dropped, repeated whitespace made one space, at most 240
       * bytes of UTF-8) and allowlist-checked; the viewer confirms the
       * FINAL name, which may differ.
       */
      filename: string;
      /**
       * Non-empty contents; no size limit short of `too_large` above.
       * Strings encode UTF-8. An
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
       * save surface — the browser download, the native share sheet in
       * the Claude iOS app, or the Claude Android app's own file write,
       * which it confirmed (a browser host may still drop a download
       * downstream, unobservably). `"delivered"` = the save carried `request` and the
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
