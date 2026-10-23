/**
 * The `permissions` capability — read and request this page's capability
 * permissions at runtime. Three verbs: `state` reads (never prompts),
 * `request` asks (at most one batched dialog per call), `manage` opens
 * the platform's Permissions panel. Obtain the namespace with
 * `await claude.use("permissions")` — `null` means this view cannot run
 * the capability; design for absence.
 *
 * By default every capability asks the viewer lazily, at its first use; a
 * page that prefers the single up-front dialog calls `request` with no
 * arguments (or with a subset of names) during startup.
 *
 * States are UX consent, not capability: a "granted" answer does not
 * bypass any server-side check, and a capability call can still fail for
 * server-side reasons (entitlement, policy, auth) after a grant.
 */

declare namespace Claude {
  namespace permissions {
    /**
     * - "granted": usable now — consented, or a capability class that
     *   needs no standing grant (its own surface confirms each use).
     * - "prompt": available; first use (or `request`) will ask the
     *   viewer.
     * - "denied": the viewer declined during THIS page load, or holds a
     *   standing refusal for this artifact (lifted from the artifact's
     *   Permissions menu, not by asking again). `request` will not
     *   re-ask this load.
     * - "unavailable": not usable and not askable here. Deliberately one
     *   bucket — an undeclared capability and a declared-but-unavailable
     *   one answer identically, so design for absence rather than
     *   probing why.
     */
    type PermissionState = "granted" | "prompt" | "denied" | "unavailable";

    /**
     * Read without prompting. With a capability name, resolves that one
     * state — unknown names answer "unavailable". With no arguments,
     * resolves the full map of this page's available capabilities;
     * unavailable capabilities are omitted entirely, so treat an absent
     * key as "unavailable" rather than expecting a key per declared
     * capability.
     *
     * Some capabilities additionally support SCOPED names —
     * `"<capability>:<resource>"`, parsed at the first colon — for
     * per-resource states; a capability's own documentation says whether
     * it does and what the resource part is. Scoped names work in every
     * `state`/`request` spelling, appear as their own keys in the
     * no-argument maps, and answer "unavailable" like any unknown name
     * where unsupported.
     */
    function state(): Promise<Record<string, PermissionState>>;
    function state(name: string): Promise<PermissionState>;

    /**
     * Ask the viewer with at most ONE batched dialog. With a list of
     * names, asks for those; with no arguments, asks for everything
     * askable. Already-granted and unavailable names are never re-asked;
     * names the viewer declined this load stay "denied" without a
     * dialog. Resolves with the post-ask state of every requested name
     * (the no-argument form resolves the full map, omitting unavailable
     * keys like `state()`) — it never rejects on a viewer's "no", so
     * always branch on the returned states.
     *
     * The promise can stay pending for as long as the viewer takes to
     * decide. Don't gate first paint on it — render, then adapt.
     */
    function request(
      names?: readonly string[],
    ): Promise<Record<string, PermissionState>>;

    /**
     * Open the platform's own Permissions panel, the way out of a
     * "denied" state: there the viewer switches a capability or connector
     * back on. Call it when the viewer asks for it (a button), never on
     * load: the platform limits how often a page may open the panel, and
     * how many times in one page load. Takes no arguments. Resolves with
     * nothing once the panel is closed, so re-read `state`. Rejects
     * `unavailable`, one code for every reason, when the panel did not
     * open: a platform dialog is open, the panel was opened too often, or
     * the view has no panel (an older platform rejects `upstream_error`).
     * On a rejection point the viewer to the artifact's Permissions menu.
     */
    function manage(): Promise<void>;
  }
}

interface ClaudeCapabilityMap {
  permissions: typeof Claude.permissions;
}
