/**
 * The `files` capability — read the files of the Claude Code project the
 * artifact declares (`capabilities: {files: {project: "chan_..."}}`), with
 * the viewer's own access. Obtain the namespace with
 * `await claude.use("files")` — `null` means this view cannot use it (for
 * example a viewer outside the organization); hide the feature. A viewer who
 * cannot open the project's files gets `not_found` from every call and is
 * never asked. A viewer who can is asked once, on the first call, so make
 * that call from a click or after the page has loaded, never in a loop.
 */

declare namespace Claude {
  namespace files {
    /** Rejection shape for every method. Branch on `.code`. */
    interface FilesError {
      code: FilesErrorCode;
      message: string;
      /** With `rate_limited`: how long to wait before retrying, in ms. */
      retryAfterMs?: number;
    }

    /**
     * Stable error codes; treat unknown codes as `"unavailable"`.
     * - `not_found` — no file or folder at that path, or this viewer cannot
     *   open the project's files (the two are not told apart). A file
     *   written in the last few seconds may not be visible yet, so retry a
     *   `not_found` for a file you expect once, after a short wait.
     * - `not_granted` — the viewer chose not to allow access; hide the
     *   feature. Calling again does not ask them again.
     * - `changed` — the file changed (or, during a download, was removed)
     *   while it was being read; try again (a file that is still being
     *   written can change under a read).
     * - `rate_limited` — too many calls, or another permission or save
     *   prompt is open, or one just ended without a saved decision; wait
     *   `retryAfterMs` when present, then retry.
     * - `too_large` — {@link download} only: the file is over 512 MiB, the
     *   project's own download limit (about 210 MB in the Claude Android app).
     * - `declined` — {@link download} only: the viewer said no to the save
     *   (or let the prompt expire); never auto-retry.
     * - `bad_request` — a malformed path, cursor, offset or length, or a
     *   folder passed to {@link read} or {@link download} (a bug in the
     *   calling code); or, for {@link download}, a file type that can't be
     *   saved from an artifact (programs and scripts such as .exe, .js or
     *   .bat). Don't retry.
     * - `unavailable` — project files can't be used right now (a network or
     *   service problem, or this view can't use them); show a short error
     *   with a retry, and hide the feature only if it keeps happening.
     *
     * Lifecycle codes (from the runtime itself):
     * - `capability_disabled` — not usable in this view (the serving
     *   runtime predates it or its module failed to load); treat like
     *   `unavailable`.
     * - `capability_removed` — the called method is not part of the
     *   runtime serving this view; treat like `capability_disabled`.
     * - `transform_error` — the call's arguments could not be prepared;
     *   treat like `bad_request`.
     */
    type FilesErrorCode =
      | "not_found"
      | "not_granted"
      | "changed"
      | "rate_limited"
      | "too_large"
      | "declined"
      | "bad_request"
      | "unavailable"
      | "capability_disabled"
      | "capability_removed"
      | "transform_error";

    interface Entry {
      /** Path inside the project; pass it back verbatim to the other methods. */
      path: string;
      isDirectory: boolean;
      /** Size in bytes. */
      size: number;
      /** When the file was created (RFC 3339), when known. */
      createdAt?: string;
    }

    interface ListOptions {
      /** Folder to list, as an {@link Entry.path}; omit for the top level. */
      path?: string;
      /** Include everything below the folder, not just its direct children. */
      recursive?: boolean;
      /** The `cursor` from the previous page, to get the next one. */
      cursor?: string;
    }

    interface ListResult {
      /** At most 500 per page. */
      entries: Entry[];
      /** Present when there is another page; absent on the last one. */
      cursor?: string;
    }

    interface ReadOptions {
      /** First byte to read; default 0. */
      offset?: number;
      /** Bytes to read; default and maximum 26214400 (25 MiB). */
      length?: number;
    }

    interface ReadResult {
      /** The bytes read; fewer than asked at the end of the file. Decode
       * text yourself: `new TextDecoder().decode(bytes)`. */
      bytes: Uint8Array;
      /** Size of the whole file in bytes. */
      size: number;
      /** Opaque; differs once the file's contents change. When reading a
       * file in several steps, start over if it differs between steps. */
      revision: string;
    }

    interface DownloadResult {
      /** The viewer chose Save and the file was handed to their device (the
       * browser can still block the download, and the page is not told). */
      status: "saved";
    }

    /** One tool for `sample`'s `tools` option, in the shape `sample` accepts. */
    interface SampleTool {
      name: string;
      description: string;
      inputSchema?: {
        type: "object";
        properties?: { [name: string]: unknown };
        required?: string[];
        [keyword: string]: unknown;
      };
      execute(
        input: { [name: string]: unknown },
        context: { signal: AbortSignal },
      ): unknown;
    }

    /** One page of a folder's entries. */
    function list(options?: ListOptions): Promise<ListResult>;

    /** Read part or all of a file. A file over 25 MiB takes several reads:
     * advance `offset` until it reaches `size`. A file edited seconds ago
     * can briefly return its previous bytes. */
    function read(path: string, options?: ReadOptions): Promise<ReadResult>;

    /**
     * Offer the file to the viewer: they see its name and size and choose
     * whether to save it. The page never receives the bytes. Resolves once
     * the viewer has chosen Save and the file has been handed to their
     * device; rejects with {@link FilesError} otherwise, including when the
     * file changes or can't be fetched after they accept. While a save
     * prompt is open, another download rejects with `rate_limited`.
     */
    function download(path: string): Promise<DownloadResult>;

    /**
     * Two tools to pass to `sample` so Claude can browse the project:
     * `sample(input, {tools: await files.asSampleTools()})`. They are
     * `list_project_files` and `read_project_file` (text files, up to
     * about 12 KB per call). Needs `sample` declared too.
     */
    function asSampleTools(): Promise<SampleTool[]>;
  }
}

interface ClaudeCapabilityMap {
  files: typeof Claude.files;
}
