# Common Memory Leaks

When analyzing retaining paths, dominator chains, or class diffs with Chrome DevTools MCP memory tools, look for these common patterns in the codebase:

## 1. Uncleared Event Listeners

Event listeners attached to global objects (like `window` or `document`) or long-living objects prevent garbage collection of the objects referenced in their callbacks.

**Fix:** Always call `removeEventListener` when a component unmounts or the listener is no longer needed.

## 2. Detached DOM Nodes

A DOM node is removed from the document tree but is still referenced by a JavaScript variable. While detachedness is a good signal for a memory leak, it's not always a bug. For example, websites sometimes intentionally cache detached navigation trees.

**Fix:** Signal the detached nodes to the user first. **Ask the user first** before nulling the references or changing the code, as the detached nodes might be part of an intentional cache. If confirmed as a leak, ensure variables holding DOM references are set to `null` when the node is removed, or limit their scope.

## 3. Unintentional Global Variables

Variables declared without `var`, `let`, or `const` (in non-strict mode) or explicitly attached to `window` remain in memory forever.

**Fix:** Use strict mode, properly declare variables, and avoid global state.

## 4. Closures

Closures can unintentionally keep references to large objects in their outer scope.

**Fix:** Nullify large objects when they are no longer needed, or refactor the closure to not capture unnecessary variables.

## 5. Unbounded Caches or Arrays

Data structures used for caching (like objects, Arrays, or Maps) that grow without limits.

**Fix:** Implement caching limits, use LRU caches, or use `WeakMap`/`WeakSet` for data associated with object lifecycles.
