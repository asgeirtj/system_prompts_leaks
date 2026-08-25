/**
 * `claude.use(name)` — the one way to reach a capability.
 *
 *   const db = await claude.use("db");
 *   if (!db) return renderWithoutDb(); // design for absence
 *   db.collection("tasks").onSnapshot(render);
 *
 * Resolves the capability's namespace once this view can run the
 * capability's code, or `null` when it cannot: the capability is not
 * served on this view, was not granted at initialization, or its module
 * failed to load. The null cases are indistinguishable by design —
 * design for absence, exactly as `permissions.state()` documents. (Chat
 * artifacts use a different, flat `window.claude`; neither `use()` nor
 * these namespaces exist there.)
 *
 * Timing. `window.claude` exists before any of your script runs and
 * this contract promises nothing on it but `use`: treat
 * `window.claude.db`, `window.claude.room` and every other capability
 * member as `undefined` at every moment. The namespace arrives later,
 * through the promise, once the viewer has answered and the module has
 * loaded — never during your script's first synchronous run, and not
 * ordered against `DOMContentLoaded` either way, so don't assume the
 * DOM is complete when it resolves. Render the page without it and
 * light features up when it resolves. With no viewer answering (a
 * kernel-bearing page with no viewer shell around it) it resolves
 * `null` after 10 s.
 *
 * The resolved namespace is platform-owned and read-only: a frozen
 * object whose members are the capability's functions. Call them and
 * keep the reference; assigning to it, `Object.defineProperty` on it,
 * or replacing a member throws (or silently does nothing). For helpers
 * of your own, wrap it in your own object.
 *
 * `use()` answers one question: can this view run the capability's
 * code? Permission stays on the calls themselves — a consent prompt,
 * rate limit, or policy refusal arrives on the first call, never here.
 * For a capability this view serves the promise is memoized — every
 * `use("db")` yields the same promise object; a name not served
 * resolves `null` (with no stable promise identity).
 */
interface ClaudeCapabilityMap {}

interface Claude {
  /**
   * See {@link ClaudeCapabilityMap} for the names `use()` accepts on
   * this contract version; an unknown name is a compile error in typed
   * authoring and resolves `null` at runtime.
   */
  use<K extends keyof ClaudeCapabilityMap & string>(
    name: K,
  ): Promise<ClaudeCapabilityMap[K] | null>;
}

// Capability authors: register your namespace type on
// `interface ClaudeCapabilityMap` in your own contract.d.ts — one line,
// same declaration-merging pattern as `interface Claude`.
interface Window {
  claude: Claude;
}
