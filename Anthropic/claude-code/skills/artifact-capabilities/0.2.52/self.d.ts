/**
 * `self` is the FORMER NAME of the `artifact` capability — renamed at
 * 0.2.0; this roster entry remains so the name published pages and
 * shipped clients know keeps resolving. Both spellings resolve
 * permanently: `claude.use("self")` and `claude.use("artifact")`
 * answer the same capability on every page that serves it (older pages
 * may also carry a `window.claude.self` member; this contract promises
 * none). New pages declare `capabilities: {artifact: {}}` and call
 * `claude.use("artifact")`; see artifact's type definitions for the
 * full surface.
 */

interface ClaudeCapabilityMap {
  self: typeof Claude.artifact;
}
