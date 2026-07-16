/**
 * `window.claude.mcp` — call the viewer's connected MCP tools from inside a frame.
 *
 * One decision, two arms: displaying data that should stay current is
 * `watchTool`; performing an action once is `callTool`. Use `listTools()`
 * to see which connectors the viewer has available. Calls run with the
 * viewer's credentials; your code never sees tokens. Check
 * `window.claude.mcp` before first use — the member is per-view (see its
 * docs below).
 */

declare namespace Claude {
  /**
   * Failure design — read before writing any call site. Connector calls
   * fail routinely in normal operation (lapsed auth, a connector the
   * viewer has not added, a briefly unreachable upstream), and each code
   * on {@link Claude.mcp.McpError} has a different correct response.
   * Design the page's degraded states alongside its happy path:
   *
   * - Branch the UX on the error `code`, never on message text, and
   *   never collapse all failures into one generic banner. A single
   *   catch-all ("transient connector failure", "something went wrong")
   *   is the named anti-pattern for this capability: it hides the one
   *   action that would fix the page (reconnect, add the connector,
   *   choose one, or simply wait) and turns recoverable states into
   *   dead ends. A default branch with generic copy is fine for codes
   *   you do not handle individually — the anti-pattern is collapsing
   *   the codes that do have a distinct fix into that one banner.
   * - Retry only errors stamped `retryable: true` (today
   *   `server_unavailable`, and `rate_limited` if it ever fires) — at
   *   most once per user-visible refresh, after a short randomized
   *   delay, honoring `retryAfterMs` when present, and ONLY for reads.
   *   `server_unavailable` (the runtime's reply timeout and upstream
   *   5xx land here) and `upstream_error` are AMBIGUOUS outcomes for
   *   writes: a rejection is NOT proof the tool did not run. Re-issue a
   *   write only behind a fresh user gesture, and where the connector
   *   offers a read, re-read state first. Never retry `needs_reauth` or
   *   `server_not_connected` — repeating the call cannot succeed:
   *   `needs_reauth` means credential refresh was already exhausted
   *   upstream, and `server_not_connected` means no connector is
   *   configured at all. Render their documented reconnect/add fallback
   *   copy instead.
   * - Consent is readable and requestable per connector via the
   *   `permissions` capability's scoped names: `"mcp:<server>"`, with
   *   the server name exactly as declared in the manifest (the same
   *   string passed to {@link Claude.mcp.callTool}). A multi-connector
   *   page should gate each section on its own server's state
   *   (`state("mcp:<server>")`) and ask per section
   *   (`request(["mcp:<server>"])`) rather than asking for everything
   *   up front; bare `"mcp"` remains the whole-manifest aggregate —
   *   "granted" only when every declared server is covered, and asking
   *   it asks for all of them. `window.claude.mcp !== undefined`
   *   remains the canonical availability gate — the only check valid on
   *   every runtime generation, and it cannot throw. Any state other
   *   than `"unavailable"` from a permissions read means present, and
   *   `"prompt"` means proceed (the first call asks) — never gate
   *   rendering on `=== "granted"`, and tolerate rejection on any
   *   permissions read (`.catch(() => "unavailable")`). Handle the
   *   lifecycle rejection codes on every call — availability is
   *   per-view and can change across a re-boot.
   * - A tool-level failure REJECTS with `tool_error` (the connector was
   *   reachable and answered, but reported failure) — the full result
   *   envelope rides the rejection's `result` field for the rare
   *   inspector. An immediate retry with the same arguments rarely
   *   helps; surface the reported message in the affected section.
   * - Pages that make several calls per refresh (dashboards,
   *   multi-section reports) contain each failure in the section it
   *   affects: one failed call annotates or greys out its own section
   *   while the rest render normally. Keep the previous successful
   *   data visible with a stale/last-updated indicator (drive it from
   *   the result's `cache.storedAt`, never `Date.now()`), and prefer
   *   {@link Claude.mcp.watchTool} for such sections — it replays,
   *   refreshes, and coalesces for you. When every section fails at
   *   once with the same code, treat it as a page-level condition:
   *   show one message with a reload affordance instead of repeating
   *   the same error in every section.
   * - In a {@link Claude.mcp.watchTool} handler: transient errors keep
   *   last-good data; authz denials (`needs_reauth`,
   *   `server_not_connected`, `blocked_by_policy`, `approval_required`)
   *   RETRACT rendered data; registration failures mean no live updates
   *   will ever arrive — full doctrine on {@link Claude.mcp.watchTool}.
   */
  namespace mcp {
    /**
     * Rejection shape for {@link callTool} and {@link listTools}, and
     * the `error` payload of {@link watchTool} events. Branch on `.code`
     * for UX; `.message` is human-readable but not localized. `.server`
     * echoes the connector display name when the failure is scoped to
     * one connector.
     */
    interface McpError {
      code: McpErrorCode;
      /** Connector display name (e.g. `"Google Calendar"`), when applicable. */
      server?: string;
      message: string;
      /**
       * Stamped ONLY as `true`, by the layer that produced the error,
       * when repeating the call unattended (no viewer action) may
       * succeed — correct even for codes newer than this contract.
       * Absent = do not auto-retry. Licenses AT MOST one retry per
       * user-visible refresh, after a short randomized delay; honor
       * `retryAfterMs`. Never loop.
       */
      retryable?: boolean;
      /** Earliest sensible retry, ms from receipt (shell-clamped at 60 s max). */
      retryAfterMs?: number;
      /** Present on `tool_error`: the full result envelope the tool
       * returned, for the rare inspector that needs more than
       * `.message`. */
      result?: unknown;
    }

    /**
     * Stable error codes. Treat unknown codes as `"upstream_error"`.
     *
     * - `needs_reauth` — connector token expired/revoked. The shell
     *   usually pre-empts this at load with its own reconnect prompt, so
     *   don't build an always-on reconnect banner; keep a lightweight
     *   in-frame fallback ("Reconnect {server} in claude.ai Settings →
     *   Connectors") for mid-session lapses and dismissed/suppressed
     *   prompts.
     * - `server_not_connected` — no callable connector with this display
     *   name for the current viewer. Also usually pre-empted by the
     *   shell's load-time prompt; in-frame fallback: "Add {server} in
     *   claude.ai Settings → Connectors".
     * - `selection_required` — the viewer has more than one callable
     *   connector with this display name and has not yet chosen one. The
     *   shell prompts the viewer to choose at most once per loaded version
     *   of the artifact (a live version update can re-arm one prompt); if
     *   they dismiss the prompt the error can persist. Back off or fall
     *   back to a degraded view, as for `server_not_connected`.
     * - `server_not_found` — resolved server no longer exists upstream.
     * - `server_unavailable` — upstream MCP server unreachable/5xx/timeout;
     *   transient, stamped `retryable: true`.
     * - `not_in_manifest` — `(server, tool)` is outside the frame's
     *   published manifest or the scope the viewer consented to.
     * - `blocked_by_policy` — tool is in the manifest but org policy blocks
     *   it for this viewer.
     * - `approval_required` — org policy requires per-call approval for
     *   this tool and none was given; per-call approval is not yet
     *   supported in artifacts. Not retryable without viewer action;
     *   render a "needs approval" degraded state. (Older runtimes
     *   degrade this code to `upstream_error` per the unknown-code
     *   rule.)
     * - `tool_error` — the tool ran but reported failure. The call
     *   REJECTS with this code; the full envelope rides the rejection's
     *   `result`. (Tool failures no longer resolve with an `isError`
     *   flag.)
     * - `bad_request` — caller bug: `server`/`tool` not strings, `input`
     *   not JSON-serializable (or arguments not structured-cloneable),
     *   a duplicate watch registration, the per-view watch limit (64 —
     *   unsubscribe unused watches), or an unknown method on an older
     *   shell.
     * - `cancelled` — the call's `AbortSignal` fired. Only observable on
     *   calls that passed one. Upstream outcome UNKNOWN: the tool may
     *   still have run.
     * - `rate_limited` — RESERVED: never returned today, but handle it
     *   anyway. The shell refused the call locally (the page exceeded
     *   its connector budget). Wait `retryAfterMs` (else a few
     *   seconds), retry at most once, never tighten a polling loop.
     *   Upstream throttling stays `server_unavailable`.
     * - `upstream_error` — anything else. Also the unanswered-call
     *   shape when an established shell stops replying — after the
     *   shell-announced reply budget (~130 s by default). A top-level
     *   direct navigation never gets that far: `window.claude` is
     *   absent there (the member check works; a probing call
     *   TypeErrors synchronously), and an embedded-but-unserved frame
     *   settles `not_granted` within about 10 s. Feature-detect with
     *   the member check, never by probing with a call.
     *
     * Lifecycle codes (from the runtime itself, not the connector path):
     * - `not_granted` — the viewer's session did not grant MCP to this
     *   frame; render the no-MCP experience.
     * - `capability_disabled` — MCP was granted but is not usable in this
     *   view (the serving runtime predates it, its module failed to
     *   load, or this boot carries no connector bridge); render the
     *   no-MCP experience.
     * - `capability_removed` — the called method is not part of the
     *   runtime serving this view; treat like `capability_disabled`.
     * - `transform_error` — the call's arguments could not be prepared;
     *   treat like `bad_request`.
     */
    type McpErrorCode =
      | "needs_reauth"
      | "server_not_connected"
      | "selection_required"
      | "server_not_found"
      | "server_unavailable"
      | "not_in_manifest"
      | "blocked_by_policy"
      | "approval_required"
      | "tool_error"
      | "bad_request"
      | "cancelled"
      | "rate_limited"
      | "upstream_error"
      | "not_granted"
      | "capability_disabled"
      | "capability_removed"
      | "transform_error";

    /** One content block in a {@link CallToolResult}. */
    type ContentBlock =
      | { type: "text"; text: string }
      | { type: "image"; data: string; mimeType: string }
      | { type: string; [k: string]: unknown };

    /** Resolution of {@link callTool} and the `data` payload of
     * {@link watchTool} events — the tool's result. */
    interface CallToolResult {
      content: ContentBlock[];
      /** Present when the connector emits structured output. */
      structuredContent?: unknown;
      /**
       * Convenience: the JSON payload most connectors return —
       * `structuredContent` when present, else the first text block's
       * text parsed as JSON when it parses, else that text verbatim.
       * Read this instead of digging through `content`; the blocks
       * remain for images and multi-block results. (Text blocks no
       * longer carry a parsed `json` sibling — `payload` is its
       * documented home.)
       */
      payload?: unknown;
      /**
       * Present only when this resolution was served from the call
       * cache — shell-attested: the broker strips any inbound `cache`
       * field from upstream results before store and before delivery.
       * `storedAt` is when the served result was originally produced
       * (epoch ms) — drive "last updated" indicators for CACHED results
       * from it, never `Date.now()`; a result with no `cache` marker
       * executed fresh and may be stamped at receipt. `revalidating` is
       * `true` only on a
       * {@link watchTool} replay whose refresh is already in flight —
       * a newer delivery will follow. Absent = executed fresh (or an
       * older shell — treat as fresh). A result that is not a JSON
       * object (a bare string or array) cannot carry this marker and
       * always reads as fresh.
       */
      cache?: { storedAt: number; revalidating: boolean };
    }

    /** Advisory tool annotations — UNVERIFIED connector
     * self-description. Use to shape UX (labels, refresh affordances,
     * an in-page confirm before a destructive action), never as a
     * safety proof. A hint is present only when the connector
     * explicitly declared it; absent means the server did not say —
     * treat as unknown. */
    interface ToolAnnotations {
      /** The tool declares it does not modify state. Informs the
       * shell's caching policy for reads — see {@link CallToolOptions}. */
      readOnlyHint?: boolean;
      /** The tool may perform destructive (non-additive) updates. */
      destructiveHint?: boolean;
    }

    /** One tool exposed by a connector. */
    interface ToolInfo {
      name: string;
      description: string;
      /** Absent as a whole on older shells, and for tools whose
       * connector declared nothing. */
      annotations?: ToolAnnotations;
    }

    /**
     * Connector auth posture — a CLOSED set, normalized by the runtime.
     * Treat any unrecognized value as `"unknown"` (an older shell can
     * forward a raw upstream string). A manifest server absent from
     * `servers` has no connector for this viewer — same fix copy as
     * `server_not_connected`.
     * - `"connected"` — no auth action needed (authenticated or
     *   no-auth); individual calls can still reject (e.g.
     *   `selection_required`, `blocked_by_policy`).
     * - `"needs_reauth"` — credentials lapsed; same fix copy as the
     *   `needs_reauth` error branch.
     * - `"unknown"` — status check degraded or newer state; do NOT
     *   render reconnect UI — branch on call-time codes.
     */
    type ServerAuthStatus = "connected" | "needs_reauth" | "unknown";

    /** One connector the viewer has connected, intersected with the
     * manifest.
     *
     * ADDRESSING (settled): `server` is the connector DISPLAY NAME and
     * will remain so — it will never accept a connector id (ids are
     * per-viewer-account facts; a published page runs for many
     * viewers). If machine-assisted disambiguation is ever added it
     * arrives additively as an options hint that narrows the single
     * per-view name binding (conflicting hints reject `bad_request`) —
     * never per-call resolution, never the `server` positional.
     * ServerInfo carries no viewer-account identifiers, no icon URLs,
     * and no provenance fields. Deliberate and stable. */
    interface ServerInfo {
      /** Connector display name — the `server` argument to {@link callTool}. */
      server: string;
      authStatus: ServerAuthStatus;
      tools: ToolInfo[];
    }

    /** Resolution of {@link listTools}. */
    interface ListToolsResult {
      servers: ServerInfo[];
    }

    /** Options for {@link callTool}. */
    interface CallToolOptions {
      /**
       * `false` — never cache this call, including where the read-only
       * default would apply.
       * Omitted — tools with a wire-explicit `readOnlyHint: true`
       * annotation default to `{staleTime: 0, gcTime: 5 min}`: the
       * result is stored (feeding {@link watchTool} replays and
       * coalescing with concurrent identical calls), and a repeat call
       * past `staleTime` executes fresh. Unannotated tools and
       * declared writes are never cached by default.
       * Object — opt in / tune. On tools with a wire-explicit
       * `readOnlyHint: false` annotation the object is ignored and the
       * call runs uncached (policy floor: a declared write can never
       * be cached or re-executed by cache machinery). Tools that do
       * not declare `readOnlyHint` behave as before: uncached unless
       * you opt in. Need confirmed-fresh data after an action?
       * `{cache: {refresh: true}}`.
       *
       * Freshness (fetchQuery semantics): a cached entry is served
       * only when younger than `staleTime` (your declared freshness);
       * older entries EXECUTE and resolve fresh. `callTool` never
       * serves anything past its declared freshness and never
       * revalidates in the background — a promise resolves once, so a
       * background result would have no delivery path. Keep data
       * current instead with {@link watchTool}, whose handler can hear
       * every refresh.
       *
       * Call identity is order-insensitive: `input` objects differing
       * only in property order are the same call, sharing one entry
       * and any in-flight execution. Cached per viewer + artifact;
       * successful results only; best-effort, size-bounded, cleared on
       * logout/account change/denial. Older shells ignore this option
       * (same call, uncached) — no feature detection needed.
       */
      cache?:
        | false
        | {
            /** Serve-without-execution window. Default 0; capped at
             * 300000 ms (5 min) — the cap bounds how long revoked
             * access keeps answering. */
            staleTime?: number;
            /** Entry lifetime. Default 300000 ms (5 min); capped at
             * 86400000 (24 h); zero/negative disables caching. */
            gcTime?: number;
            /** Skip the cache read: execute upstream, overwrite the
             * entry ("invalidate then call" in one flag). Failed
             * results still aren't stored — the previous entry remains
             * unless the failure was a denial. Ignored when not
             * caching. */
            refresh?: boolean;
          };
      /**
       * Abort this call. Held by the runtime — never crosses to the
       * shell; abort rejects promptly with `{code: "cancelled"}` and
       * best-effort-cancels the upstream execution. Best-effort: the
       * tool MAY still have run — treat `cancelled` as outcome-unknown
       * and never pass a signal on a one-shot action you cannot
       * double-fire. An AbortSignal such as `AbortSignal.timeout(ms)`,
       * where available, is the per-call deadline mechanism — there is
       * deliberately no `timeoutMs` option. Older shells ignore the
       * cancel: the promise still rejects promptly.
       */
      signal?: AbortSignal;
    }

    /**
     * Do it once, now — the arm for ACTIONS. Call a tool on one of the
     * viewer's connectors. Serves a cached result only when younger
     * than `staleTime` (your declared freshness); otherwise executes
     * and resolves fresh. Never serves stale and revalidates behind
     * your back — a promise cannot hear the refresh. Rendering data
     * that should stay current? That is {@link watchTool}.
     *
     * `server` is the connector's display name (e.g. `"Google
     * Calendar"`), not a UUID. `(server, tool)` must be inside the
     * scope the viewer consented to or the call rejects with
     * `not_in_manifest`.
     *
     * `input` must be plain JSON: objects, arrays, strings, numbers,
     * booleans, `null`. `Map`/`Set`/`Date`/typed arrays/`BigInt` reject
     * with `bad_request`. Omit for tools that take no arguments.
     *
     * Resolves with {@link CallToolResult} — read `result.payload` for
     * the JSON answer. A tool-level failure REJECTS with
     * `{code: "tool_error"}`. Rejects with {@link McpError}; never
     * throws synchronously.
     *
     * @param server  Connector display name.
     * @param tool    Tool name as listed by {@link listTools}.
     * @param input   JSON-serializable arguments object.
     * @param options Caching + cancellation — {@link CallToolOptions}.
     */
    function callTool(
      server: string,
      tool: string,
      input?: unknown,
      options?: CallToolOptions,
    ): Promise<CallToolResult>;

    /** One event delivered to a {@link watchTool} handler. */
    type WatchEvent =
      | { type: "data"; result: CallToolResult }
      | { type: "error"; error: McpError };

    /** Returned by {@link watchTool}. Synchronous and idempotent: after
     * it returns, the handler never fires. */
    type Unsubscribe = () => void;

    /**
     * Keep this data current — the arm for DISPLAY. Replays the cached
     * entry immediately (marked via `result.cache`; `revalidating:
     * true` when its refresh is already in flight — the one place a
     * past-freshness value is served, because this handler hears the
     * correction), executes when the entry is missing or stale, and
     * delivers every newer result for the identity — from its own
     * executions, from `refetchInterval` polls (clamped to a ~30 s
     * floor, paused while the page is hidden with a catch-up refetch
     * on return, coalesced per identity so N sections cost one
     * flight), from other cached callers of the same identity (calls
     * that opt OUT of caching do not feed watchers), and from
     * {@link invalidate}.
     *
     * Watch reads only — never one-shot actions; tools with a
     * wire-explicit `readOnlyHint: false` annotation reject.
     *
     * Returns a SYNCHRONOUS {@link Unsubscribe}. The first delivery
     * (replay included) arrives no earlier than a microtask after
     * registration — store the unsubscribe before anything can fire.
     * The one synchronous throw on this surface: a non-function
     * `handler` is a `TypeError` (with no handler there is no event
     * channel to route the failure to).
     *
     * ALL failures arrive on the handler as `{type: "error"}` events —
     * registration failures included (an older shell's `bad_request`
     * for the unknown method, `not_granted`, the 64-watch per-view
     * limit): no live updates will arrive, and the page simply keeps
     * the static experience it already renders. Transient errors keep
     * last-good data visible; authz denials retract it (see the
     * failure-design notes above).
     *
     * @param server  Connector display name.
     * @param tool    Tool name as listed by {@link listTools}.
     * @param input   JSON-serializable arguments (use `null` for
     *                input-less tools).
     * @param handler Receives {@link WatchEvent}s until unsubscribed.
     * @param options `cache` as on {@link callTool} (no `refresh`);
     *                `refetchInterval` declares polling, in ms.
     */
    function watchTool(
      server: string,
      tool: string,
      input: unknown,
      handler: (ev: WatchEvent) => void,
      options?: {
        cache?: { staleTime?: number; gcTime?: number };
        refetchInterval?: number;
      },
    ): Unsubscribe;

    /**
     * Drop cached {@link callTool} results (this artifact + viewer only).
     * Each argument narrows the scope, and `undefined` is the same as
     * omitting it: `invalidate()` = all; `(server)` = one connector;
     * `(server, tool)` = one tool, any input; a non-`undefined` `input` =
     * one exact argument set, matched by the cache's order-insensitive
     * call identity (`null` and `{}` both mean the input-less call —
     * unlike callTool, where an `undefined` input is also that same
     * call). `input` requires `server` and `tool` (else `bad_request`).
     * Once resolved, a matching callTool re-executes, and matching
     * WATCHED identities re-execute and deliver — call after a write so
     * cached reads refetch.
     *
     * Old shells reject `bad_request` ("unknown method"); old runtimes
     * `capability_removed`. Treat any rejection as nothing-cached and
     * continue.
     */
    function invalidate(
      server?: string,
      tool?: string,
      input?: unknown,
    ): Promise<void>;

    /**
     * List the connectors callable from this frame: the frame's published
     * manifest intersected with the connectors the current viewer has
     * actually connected. Call at load to adapt the UI to what's available
     * before calling {@link callTool}.
     *
     * Duplicate-connector selection FIELDS never reach pages, but the
     * pending state is observable: a duplicated, not-yet-chosen connector
     * lists here with an empty tool set (as a not-connected connector
     * does) until the viewer chooses, and {@link callTool} rejects with
     * `selection_required`. Render the same degraded view you use for
     * `server_not_connected`.
     *
     * Rejects with {@link McpError}; never throws synchronously.
     */
    function listTools(): Promise<ListToolsResult>;
  }
}

/**
 * `window.claude` — capability namespaces, one optional member per
 * released capability. Always present: frames are shell-dependent by
 * design, and the kernel installs and locks this object ahead of author
 * code on every served view. (A top-level direct navigation to a frame
 * URL is not a supported context.)
 *
 * Each capability's contract file merges its own member into this named
 * interface (which also merges with the `Claude` declarations namespace
 * above) and repeats the identical one-line `Window` declaration below —
 * named-interface merging is what lets per-capability ambient files
 * coexist, where an inline `claude?: {...}` object type declared in two
 * files would collide on the `claude` property.
 */
interface Claude {
  /**
   * See {@link Claude.mcp}. Usually present, but capability presence is
   * a per-view fact the frame cannot control: a viewer's session may be
   * serving an older runtime generation than this contract (stale tab,
   * deploy ramp, rollback), in which case `mcp` is absent before the
   * frame is initialized and calls reject `capability_disabled` after.
   * The optionality to detect is the MEMBER, not the root: check
   * `window.claude.mcp === undefined` before first use, and handle
   * rejection codes (`not_granted`, `capability_disabled`) on every call.
   * (Chat artifacts use a different, flat `window.claude`; none of its
   * members exist here — feature-detect as documented.)
   */
  mcp?: typeof Claude.mcp;
}

// Capability authors: declare your member on `interface Claude` above and
// repeat this exact Window line — never an inline `claude?: { ... }` object
// literal, which collides across merged per-capability ambient files.
interface Window {
  claude: Claude;
}
