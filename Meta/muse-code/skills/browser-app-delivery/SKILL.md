---
name: browser-app-delivery
description: Deliver a runnable local browser app so the user can operate it on the first handoff. This delivery skill does not choose whether a requested local system should be a browser app. On a current turn that explicitly says to implement a brand-new browser project now, load bundled:greenfield-project-scaffolding before project work only after no-peek or permitted top-level placement facts prove that no named or suitable current-folder target resolves the root; never hand off from planning or answer-only turns, existing work, a named or suitable target, or standalone or single-file delivery. Resolve user-blocking product or interface choices with an available interaction surface; resolving those choices alone never authorizes implementation. Always call read_skill for bundled:browser-app-delivery before creating or materially changing a local browser app that owns its start path or a playable browser game. Also load it when the user requests a paste-ready, single-file, offline, or immediately playable browser artifact, even if no local start path should remain, unless the user says they will open or check it themselves or explicitly declines verification. On completed local-server delivery, include exact start commands, a concrete local URL, and explicit browser-open wording. On completed standalone delivery, hand off the exact artifact path or paste URL and smoke result without inventing a server. Do not load it for a self-contained static file that has no owned start path if the user either says they will open or check it themselves or explicitly declines verification. Do not load it for component/style-only edits, deployed sites, backend/API-only work, browser QA, review, explanation, plan-only, or explicit stop/no-tool turns.
user-invocable: false
---

# Browser App Delivery

For a brand-new browser project, apply this hard boundary before project work.
Do NOT call `read_skill` for `bundled:greenfield-project-scaffolding` on a
requirements-guidance, planning, option-selection, multi-decision, or answer-only
turn; from prior-turn answers, authorization, or reminders without new
implementation-now words; for existing work, server start/restart, verification,
or handoff-only work; for a named path or a confirmed-suitable here/current-folder
target; or for a requested standalone, paste-ready, single-file, or snippet artifact.

Only when this same user turn explicitly says to start, implement, build,
scaffold, or go ahead with a new project now may unresolved placement trigger
the handoff. Do not load the greenfield skill merely to decide whether it is
eligible. If inspection is forbidden, do not list or read the workspace; use
only the request and `pwd`. Otherwise inspect only top-level placement facts
first. Call the greenfield skill before any project-content inspection or write
only when no named or suitable current-folder target resolves placement and
inspection is forbidden or those facts prove the current root home-like,
general-purpose, or falsely empty. Wait for its body, resolve the root, then
continue this workflow.

Use this workflow only for a local browser app whose build or start path is part
of the task, or for a requested paste-ready, single-file, offline, or immediately
playable browser artifact. Current user instructions always win.

Before using this workflow, resolve user-blocking product or interface choices
through request_user_input when available. This workflow does not choose a
browser architecture or authorize implementation.

Product correctness precedes delivery closure. Before Step 1, ensure the chosen
architecture and data source can satisfy the requested behavior at its stated
scale and coverage; runner availability, start success, a URL, or reachability
proves delivery mechanics only and must not narrow or stand in for those
requirements.

1. Derive the supported build and start commands, host, port, and path from the
   project, the chosen stack, or an observed run. For a greenfield multi-file
   app, first choose one appropriate project stack, then confirm its runner is
   supported by the available toolchain before creating its normal manifest and
   start declaration when applicable. If that runner is unavailable, choose an
   already-available equivalent stack instead. Successfully run that exact start
   command. Hand off only that verified runner; do not add or retain a second
   manifest or runner for convention. A generic static-file server never
   qualifies as the project runner and may be used only for smoke. An explicitly
   standalone artifact skips this requirement. Never guess a URL, and do not add
   a server or dependency solely to manufacture one for a standalone artifact.
2. Preserve live user processes and persistent data. Prefer the existing dev
   server and hot reload. Restart only when required, target only the process
   this task owns, and migrate persistent state instead of deleting or reseeding
   it unless the user explicitly requests a reset.
3. Verify changed behavior once with the smallest suitable check. A successful
   HTTP response is enough to establish reachability. Do not run browser
   automation or screenshots solely to justify URL wording, and do not repeat
   visual checks for unchanged visuals.
   For a requested paste-ready, single-file, offline, or immediately playable
   artifact, modular sources may remain, but make the exact standalone artifact
   the primary handoff. Reject unresolved local imports and run one load/start
   smoke of that exact artifact with an already-available project or runtime
   check. If no appropriate check is available, report the exact artifact's
   start behavior unverified. HTTP success proves only reachability. Do not
   execute shims, download, install, work around, or repair dependencies for
   this smoke.
   For a standalone JavaScript artifact when no browser is available but Node
   is already present, exercise the exact embedded script through initialization
   and at least one update or render frame with a temporary dependency-free DOM
   and canvas harness. Syntax-only checks, extracted logic tests, HTTP success,
   and paste upload success do not count as this load smoke. Fix every runtime
   error and repeat the smoke once. This temporary test harness is not a package
   or runtime shim.
   Run the smoke against the final artifact bytes: after any artifact edit,
   rerun it. The fallback must invoke at least one queued
   `requestAnimationFrame` callback instead of suppressing it. After choosing
   this fallback, do not install or launch a browser or browser package.
4. Close browser delivery before handoff. For standalone delivery, do not create
   or start a server solely for handoff; report the exact smoke result and skip
   the remainder of this step. When the user did not explicitly ask
   to verify, prove, or confirm browser behavior or ask to be told when it works,
   do all of the following before the first completion answer: choose exactly
   one runner declared by the project; run one shell call whose only
   browser-runner probe is `command -v chromium`, substituting that runner's
   executable; allow only an exit-status echo to accompany it; after choosing
   from project declarations, perform no additional runner/path/module/tool
   discovery in this browser-closure step before, inside, or after that call;
   and if that chosen project runner is absent, explicitly and honestly report
   browser behavior unverified and stop browser verification without executing
   shims (`npx`, `uvx`), downloading, installing, working around, or repairing
   dependencies. With explicit intent, follow the relevant verification policy
   and report any remaining blocker honestly.
5. Keep every completion answer brief: a user handoff, not an engineering log.
   This changes only the report, never implementation or verification. Lead
   with the outcome and strongest verification. Unless the user explicitly asks
   for a detailed implementation report, omit exhaustive feature lists,
   file-by-file inventories, endpoint catalogs, internal architecture, and raw
   metrics.
6. In the first completion answer, open with an unambiguous completion signal
   such as `Done`, `Complete`, or `Ready`. For standalone delivery, give the
   exact artifact path or paste URL and the load/start smoke result; do not
   invent a server, start command, or local URL. Otherwise, give copy-paste
   start commands, a concrete URL, and a direct instruction to open that URL in
   a browser. A concrete URL must be one the user can open from their own
   machine. When the session host is headless, remote, or containerized, or the
   user says they cannot reach it, a loopback URL plus a local success response
   proves only that the server runs — deliver a user-reachable access path
   instead: bind and serve on a host-reachable interface using the host's real
   name or IP, establish a supported tunnel, or produce a self-contained
   openable artifact with open instructions; state which path you verified. If
   the server is not currently reachable, say why and label the URL as the
   address to use after starting it.
7. State current runtime status honestly. Never imply that a temporary local
   process is durable hosting or will survive cleanup or session end.
   Current-server claims: in that same turn, after the latest start, kill, or
   failed check, run a shell call containing only one reachability check; this
   includes answers that merely give curl examples or say done. For an
   agent-started server that is currently reachable, give its exact start
   command once only as current runtime provenance; never include a restart or
   recovery command, or any failure or session-cleanup condition in that
   message. After the user asks to keep it running, omit start and restart
   commands entirely; report only the fresh standalone reachability result,
   URL, and `Recovery remains mine.` If the server is not reachable, or the
   user explicitly asks how to start it, give the exact start command with an
   honest not-running label.

Do not turn a plan, clarification, stop request, or explicit no-start/no-verify
request into implementation or verification work.
