# Windows publication

Use this route on Windows for an existing verified `separate-data-v1` build, including a preserved separate-data package. Resolve the selected artifact through the [publication skill](../SKILL.md#workflow-guidance) first. macOS and Linux retain its existing numbered workflow. Existing standalone and explicit `--source` builds also retain that workflow; this runner does not support them. If their required Sites archive capability is unavailable on Windows, report that limitation without converting the artifact or repeatedly trying a Bash fallback. A missing or mismatched separate-data manifest is an error, never a reason to substitute empty data or rebuild the client.

Load `$sites-hosting` for its audience, native lifecycle and handoff rules; read its registration reference only when a Site must be created or recovered. Discover the needed Sites tools by name. Data supplies a custom Worker and its own portable archive adapter, so publishing the compiled page does not require `$sites-building`, a starter, dependency installation, Worker compilation, or Sites' default build/archive helpers. Do not repeat analytical or presentation QA, credential scans, copied runtime-hash checks, or browser tours.

## Prepare and publish

Resolve script paths from the `publish-artifact-to-sites` skill directory. Start `scripts/publish-data-app.mjs` with the resolved Codex Node runtime and keep that process alive through upload. In Codex Desktop on Windows, use `exec_command` with `tty: true`: a piped launch can lose stdin when the launch tool returns. The runner disables TTY echo before accepting input.

For a PowerShell host, the launch call has this shape. Replace both example paths with the resolved absolute paths; escape any apostrophe inside a PowerShell single-quoted path by doubling it. The command contains only executable/script paths, never request data or credentials.

```json
{
  "cmd": "& 'C:\\resolved runtime\\node.exe' 'C:\\resolved plugin\\skills\\publish-artifact-to-sites\\scripts\\publish-data-app.mjs'",
  "tty": true,
  "yield_time_ms": 1000,
  "max_output_tokens": 1000
}
```

**Wait for a live `session_id` and `{ok: true, stage: "listening", protocol: "data-publication-v1", echo: false}` before sending any request or credential.** Use `write_stdin` with that `session_id` and `chars` containing the request serialized as JSON plus `\r\n`. Keep the same session across native Sites calls; use empty `chars` to poll and send an explicit `close` request when finished. Send one JSON object per line; LF, CRLF and CR are supported. Responses are bounded ASCII-only JSON; decode them before using returned paths.

Use piped stdin only on a host known to preserve it between calls. If the host cannot keep stdin open with echo disabled, use an available structured Node execution surface to import `createPublicationSession` and call `dispatch` with the same objects; do not invent a launcher. Keep inputs as data, out of shell interpolation or generated script source, and keep credentials out of files, arguments, Git, logs and URLs.

1. Send `preflight` with `allowNewProject: true` before requesting source credentials. It checks Git, the selected project, configured identity and an existing authoring HEAD. If it returns `needsInitialization: true`, pass `initialize: true` to `prepare`; that creates a repository and local source commit only at a new app's root. Existing history and parent repositories stay untouched. Address other errors before continuing; do not guess an identity, change repository trust globally, disable TLS verification, or rotate credentials for local configuration failures.
2. Reuse the selected Site, or register it once with native `create_site`, then read it with `get_site`. Preserve its Site ID, sharing and D1 database. Complete [owner authorization](../SKILL.md#owner-authorization) before deployment; Data requires this check even when Sites permits the owner-private shortcut.
3. Send `prepare` with the selected artifact and Site. Use a fresh publication directory outside the authoring project and a fresh private archive path outside both projects. Missing parent directories are created after validating the destinations and supported artifact layout; existing destinations are never overwritten. The runner checks input containment and common credentials across all application/data text, packages the existing client and pinned Worker, retains its deployment token in memory, and creates the exact source checkout with an immutable data reference. Pass supplied presentation overrides once, using an in-project `presentationFile`; omit it when none was supplied. Packaging neither accepts nor changes the owner setting. Retain the authoring checkout and its history. Never rebuild or edit the packaged outputs.
4. Reuse a valid source credential or call native `create_source_repository_write_credential` for that exact Site immediately before `push`. Pass the complete native credential object. The runner preserves remote ancestry, pushes the exact source and creates the archive without Bash. Use its `saveArguments` unchanged with the native Sites save/deploy tools.
5. Save and deploy in this Site-owning task, following Sites' audience rules. Prefer `save_version_and_deploy_private` when applicable; its response already starts deployment. Otherwise use `save_site_version` and the appropriate native deploy tool. Poll only pending deployments with `get_deployment_status`, retaining every returned version and deployment ID. Neither the runner nor a subagent calls Sites lifecycle tools.
6. After native deployment success, obtain the canonical HTTPS Site origin and temporary ingress bearer from `get_site`, then send `upload`. The runner verifies the Site/deployment identity and performs the complete [asset readback](#readiness-and-handoff). Keep the process alive until it returns `ready`, then send `close` and complete the browser handoff once.

The request fields below are JSON keys; populate them with the resolved values, not placeholder strings. `gitExecutable` is optional in `preflight` and `prepare` when Git resolves normally.

| Request | Fields | Result / next action |
| --- | --- | --- |
| `preflight` | `op: "preflight"`, `projectDir`, `allowNewProject: true` | Resolve local readiness errors before obtaining credentials. |
| `prepare` | `op: "prepare"`, `projectDir`, `projectId`, `publicationProjectDir`, `archivePath`; optional `siteUrl`, `htmlFile`, `presentationFile`, `initialize` | Retain the same live session for the remaining requests. `siteUrl` is the canonical origin or omitted before one exists. |
| `push` | `op: "push"`, `credential` | Use returned `saveArguments: {project_id, commit_sha, archive}` in the native Sites operation. |
| `upload` | `op: "upload"`, `deployment`, `siteUrl`, `sitesAuthorization` | Pass the returned deployment object (`project_id`, `id`, `version_id`, `status`, `url`) and the selected Site's origin/bearer. Success includes the verified `ready` receipt. |
| `status` / `close` | `op: "status"` or `op: "close"` | Inspect nonsecret stage receipts, or discard the in-memory token and end the session. |

## Resume a failed stage

Use `status` and the returned error code to resume the same session. Renew an expired or rejected source credential for the same Site and retry `push`; the runner reuses its prepared commit. Trust, TLS, URL-rewrite and network errors need their specific environmental fix. A changed source or rejected push requires investigation, not a force push.

Retain the nonsecret error receipt: `code`, `subtype`, `operation`, `gitStage`, `failedStage`, timing fields, and `stderrExcerpt`, `exitStatus` or `signal` when present. The excerpt is bounded and credential-redacted before it enters a receipt. Use it to understand the cause separately from the diagnostic category. The session's `push` operation includes local Git preparation and remote discovery; `operation` identifies the actual failed Git command, while `stage` and `sourceState` describe retained progress.

`milliseconds` measures request execution in the runner; `stageMilliseconds` and `operationMilliseconds` isolate the failed work. Time spent waiting for an external tool response is separate. A `TLS_FAILED` result alone does not establish a certificate problem: use its subtype and sanitized excerpt, and investigate an unknown transport failure before retrying. Never disable TLS verification or change trust settings based only on the word `schannel`.

For a save/deploy timeout or lost response, reconcile versions for the returned full commit SHA before retrying. Reuse `saved_version_id` after a deployment failure and continue an existing pending deployment; do not repeat a combined save/deploy call. Keep the unchanged archive available until save succeeds. Existing legacy snapshot tables require an explicitly reviewed migration; never drop them or reset reviewed data to bypass an error.

The session token is never persisted. If the process is lost before assets are ready, first resolve any unknown save/deployment outcome. Finishing an incomplete upload then requires fresh preparation in new publication/archive destinations and a deployment using its new token. Do not search files for credentials or claim a saved version is ready without complete asset readback.

## Readiness and handoff

The session runner calls `scripts/upload-data-app-assets.mjs` with the retained deployment token and assets from the **authoring project**. Supply the exact canonical HTTPS Site origin and temporary ingress bearer from `get_site`. Never put either bearer in command-line flags, files, Git, logs, or URLs.

The helper streams both files, rejects redirects, checks local and server SHA-256/byte counts, then streams back the complete HTML and snapshot to verify they match the packaged artifact. Retain its non-secret receipt and discard tokens. A deployed Worker without uploaded assets is not ready. A mismatched readback is not success; investigate preserved hosted edits or storage failure without resetting data. The upload gate expires automatically and authorizes only the two exact content-addressed payloads; normal owner editing remains separate.

Read back the requested access and keep external access disabled when requested. State that source data is a published snapshot unless the app has an explicitly supported refresh path. Claim hosted editing works only after `/api/presentation` returns `canEdit: true` in the owner's normally signed-in browser; this check is not a prerequisite for completing an authorized publication. Keep the canonical Site identity separate from view links. Return the verified Site URL retaining the requested supported view state, when present, and the reviewed snapshot timestamp; exclude credentials, unrelated parameters and task fragments. Reopen that same selected view once in the existing browser tab; use the stable in-app browser tab in Codex Desktop.
