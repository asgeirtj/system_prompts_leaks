/**
 * `window.claude.downloads` — offer a file your frame generated to the
 * viewer. `save({filename, data})` shows the viewer a confirmation
 * (final filename + size); the file is saved only if they accept. Frame
 * code never downloads directly. Check `window.claude.downloads` before
 * first use (per-view member).
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
     *   (`gif png jpg jpeg webp mp4 webm txt json md`).
     * - `too_large` — over 16 MiB.
     * - `declined` — the viewer said no (or let the prompt expire);
     *   never auto-retry.
     * - `rate_limited` — a prompt is already open or too many recent
     *   prompts; wait, then retry.
     * - `bad_request` — caller bug: bad filename (non-string or >512
     *   chars), bad/empty/detached data.
     * - `unavailable` — saves unusable in this view; hide your save UI.
     * - `not_granted`, `capability_disabled`, `capability_removed`,
     *   `transform_error` — runtime lifecycle; treat like `unavailable`
     *   (`transform_error` like `bad_request`).
     */
    type DownloadsErrorCode =
      | "rejected_extension"
      | "too_large"
      | "declined"
      | "rate_limited"
      | "bad_request"
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
       * Non-empty contents. Strings encode UTF-8. An ArrayBuffer is
       * TRANSFERRED (detached after the call) — pass `buf.slice(0)` if
       * you still need it; views and Blobs are copied. MIME comes from
       * the extension; a Blob's own type is ignored.
       */
      data: string | Blob | ArrayBuffer | ArrayBufferView;
    }

    interface SaveResult {
      /**
       * `"saved"` = viewer accepted and the browser download started
       * (a host embedder may still block it downstream, unobservably).
       */
      status: "saved";
    }

    /**
     * Offer the file. Resolves when the viewer accepts; rejects with
     * {@link DownloadsError} for every other outcome. One undecided
     * prompt at a time (first-wins).
     */
    function save(request: SaveRequest): Promise<SaveResult>;
  }
}

/**
 * `window.claude` — one optional member per released capability; always
 * present (the kernel installs it ahead of author code). Capability
 * presence is per-view: check `window.claude.downloads === undefined`
 * before first use.
 */
interface Claude {
  /** See {@link Claude.downloads}. */
  downloads?: typeof Claude.downloads;
}

// Capability authors: declare your member on `interface Claude` and repeat
// this exact Window line (inline `claude?: {...}` literals collide across
// merged per-capability ambient files).
interface Window {
  claude: Claude;
}
