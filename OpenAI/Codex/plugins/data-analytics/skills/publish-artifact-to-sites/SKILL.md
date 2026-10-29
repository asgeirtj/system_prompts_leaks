---
name: publish-artifact-to-sites
description: "Publish an existing Data report or dashboard to Sites, automatically for web/cloud tasks or when the user requests publication."
---

# Publish the existing Data page

Publish an existing Data report or dashboard to Sites, automatically for web/cloud tasks or when the user requests publication.

## Overall Instructions

- Follow the [shared Data instructions](../../shared/shared-skill-instructions.md) throughout this workflow.
- Follow the [Data App Contract](../../shared/data-app.md) for publication of the existing report or dashboard.

## Dependencies

Apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to the categories below.

- Developer Tools: The Sites capability for publishing the reviewed artifact to its intended project.
- Knowledge & Files: The selected source artifact and any supporting publication references.

## Workflow guidance

Package the selected compiled HTML as it exists, following the [Data App Contract](../../shared/data-app.md). For a refreshed dashboard or report, reuse the rebuilt HTML and current presentation from the [refresh workflow](../../shared/data-app.md#refresh-a-published-dashboard-or-report). For other requests linking a dashboard view, read its current context using the shared [linked-page workflow](../../shared/data-app.md#reading-a-linked-dashboard-or-report). Resolve its original compiled HTML before packaging and use supplied or successfully retrieved presentation. For local publication, unavailable or failing page tools do not block publishing the verified compiled artifact; continue without recovering browser-only edits and omit `--presentation-file` when none is available. A short link does not authorize rebuilding from screenshots. If the request includes a context text attachment, read it fully first: it contains the remaining publication instructions, artifact identity, and current presentation. The short visible request and attachment are one request. Reuse the exact project, HTML path, Site, sharing settings, and supplied presentation overrides. Do not ask which artifact when the handoff already identifies it. Normal authoring and build rules apply to requested content changes; missing compiled HTML requires a separate build.

## Routing

Follow the shared [delivery policy](../../shared/data-app.md#publication-and-final-delivery) for publication defaults, user overrides, and failure handling. Local preview can proceed before publication setup; it is not a prerequisite for publishing.

## Workflow

On Windows, use [Windows publication](references/windows-publication.md) for an existing `separate-data-v1` build or preserved separate-data package instead of the numbered workflow below. macOS and Linux continue with the existing workflow below. Standalone and explicit `--source` builds also retain that workflow; if their Sites archive capability is unavailable on Windows, report the limitation without converting the artifact or repeatedly trying a Bash fallback.

1. Confirm that `$sites-building` and `$sites-hosting` can complete project creation or reopening, version saving, deployment, and status polling. Create or reuse one Site per logical app under its authorized access and read it with `get_site`. Complete [owner authorization setup](#owner-authorization) before deploying; every republish preserves the owner-managed environment setting. Preserve existing sharing and the D1 database.
2. Use the existing compiled page. Direct publication attaches the shared Worker, D1 backend and R2 assets to that HTML, using its complete embedded snapshot or verified `separate-data-v1` build manifest and sidecar. The helper checks canonical input containment and common credentials once across all application and data text; legacy HTML without embedded data must have one head fingerprint matching its source snapshot. A missing or mismatched separate-data manifest is an error, never an empty-data fallback. Do not repeat those safeguards, analytical or presentation QA, verify copied protected-runtime hashes, rebuild or upgrade the client, install dependencies, initialize a replacement starter, or require a browser QA tour. Keep source-write credentials in the Sites tool flow, out of source files and published output.
3. Package the app, pinned prebuilt Worker factory, initial presentation, project identity, and logical `DB`/`BUCKET` bindings with the publication helper as the last client/Worker-producing step. Normal packaging requires no package install or Worker compilation. Generate a fresh random deployment token in memory and pass only its SHA-256 and a canonical ISO expiry within 12 hours to the packager:

   Invoke the helper through a non-shell argument-array API, with the resolved paths and Site ID held as data variables. Never interpolate `get_site` values into shell commands or generated script source. If those values must cross a process boundary, write only the argument values as JSON with a structured file tool in private temporary storage outside the app/Git tree, read them as JSON in the launcher, and delete that file in `finally`, including on failure. For example, in a Node execution context:

   ```js
   import { spawnSync } from "node:child_process";
   import { createHash, randomBytes } from "node:crypto";
   const deploymentToken = randomBytes(32).toString("hex");
   const tokenSha256 = createHash("sha256").update(deploymentToken).digest("hex");
   const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
   const result = spawnSync(codexNode, [
     `${dataPluginRoot}/skills/publish-artifact-to-sites/scripts/package-data-app-for-sites.mjs`,
     "--project-dir", appProject,
     "--project-id", projectId,
     "--html-file", compiledHtml,
     "--deployment-token-sha256", tokenSha256,
     "--deployment-token-expires-at", expiresAt,
   ], { shell: false, stdio: "inherit" });
   if (result.error || result.status !== 0) throw new Error("Data app packaging failed.");
   ```

   Packaging accepts no owner email or owner hash and does not create or update owner settings. Append `--presentation-file <app-project>/presentation.json` only when an initial-presentation file is provided, and keep it inside the app project. Pass the handoff's supplied overrides once; do not invent replacements. The helper removes the handoff-only `filterDefinitions` field, leaves definitions in the snapshot, and passes saved presentation to the existing runtime. It emits a small `dist/server/index.js` containing asset descriptors, plus hosting metadata with the same project ID and bindings. Complete assets and their integrity manifest live in `.data-app-assets/`; the exact original offline HTML is retained in `.data-app-offline/index.html`. These generated directories stay outside the Sites deployment archive. Do not print their data or place transient tokens in them.
4. Never rebuild after packaging. For a separate-data app, follow [publication source and recovery](references/publication-source.md) to prepare its exact code and immutable data-reference checkout; commit that source and archive its packaged `dist`. Retain the original complete authoring checkout and history. For existing standalone/source builds, commit the existing source as before. Save and deploy the packaged outputs without intervening edits through `$sites-hosting` under the Site's authorized access, and poll to a successful terminal state. Sites retains its archive/build requirements, authentication, access policy, and deployment approvals; existing explicit authorization remains sufficient. Preserve the same Site and database. Existing legacy snapshot tables require an explicitly reviewed migration; never drop them or reset reviewed data to bypass this error.
5. Before handing off the URL, upload the two assets and verify readiness with `scripts/upload-data-app-assets.mjs` in this skill directory. Obtain the temporary Sites ingress bearer from `get_site`. Pass `{projectDir, projectId, siteUrl, deploymentToken, sitesAuthorization}` as JSON through child-process stdin with `shell: false`, or call the exported `uploadDataAppAssets` function with in-memory arguments. `siteUrl` must be the exact canonical HTTPS Site origin. Never put either bearer in command-line flags, files, Git, logs, or URLs. The helper streams both files, rejects redirects, checks local and server SHA-256/byte counts, then streams back the complete HTML and snapshot to verify they match the packaged artifact. Retain its non-secret receipt and discard tokens. A deployed Worker without uploaded assets is not ready. A mismatched readback is not success; investigate preserved hosted edits or storage failure without resetting data. The upload gate expires automatically and authorizes only the two exact content-addressed payloads; normal owner editing remains separate.
6. Read back the requested access and keep external access disabled when requested. State that source data is a published snapshot unless the app has an explicitly supported refresh path. Claim hosted editing works only after `/api/presentation` returns `canEdit: true` in the owner's normally signed-in browser; this check is not a prerequisite for completing an authorized publication. Keep the canonical Site identity separate from view links. Return the verified Site URL retaining the requested supported view state, when present, and the reviewed snapshot timestamp; exclude credentials, unrelated parameters and task fragments. Reopen that same selected view once in the existing browser tab; use the stable in-app browser tab in Codex Desktop.

For separate-data builds, packaging preserves the verified HTML, build manifest and complete raw snapshot under `.data-app-offline/separate-v1/`; it removes the data sidecar and build manifest from deployment `dist` after preservation succeeds. `export-offline` streams a complete portable HTML from the preserved bundle into `.data-app-offline/exports/`, which stays outside publication source and Git. Custom filenames are supported within that directory; other output directories are rejected. Packaging retains raw source bytes for immutable recovery and a distinct canonical seed fingerprint so whitespace-only source changes do not reset hosted query edits. No reviewed rows, fields or controls are removed.

Historical `.data-app-publish/<capture-id>/manifest.json` requests are unsupported; report the limitation without substituting the current page. Keep any existing `.data-app-publish` files out of commits and Site upload archives.

## Owner authorization

The Worker reads `DATA_APP_OWNER_EMAIL_SHA256` from the Sites runtime environment on each edit request and compares it with the SHA-256 of the normalized Sites-authenticated `oai-authenticated-user-email`. Missing or malformed configuration denies editing. Source files, Worker factory arguments and D1 values cannot supply a fallback owner. `/api/presentation` reports `ownerEnvironmentConfigured` for deployment preflight separately from the current visitor's `canEdit` permission.

The owner is fixed for this workflow. Initialize the setting before the first environment-based deployment of a new or existing Site:

1. For owner publication, require `get_site.current_user_role: "owner"` and resolve exactly one `access_policy.allowed_users` entry with `role: "owner"`. Validate its email with `templates/data-app/base/src/owner-email.js`'s `normalizeOwnerEmail` and compute the lowercase SHA-256 hex digest of the normalized email in memory. Never substitute the publishing user or an identity from app source.
2. Read `get_environment_variables` for that exact Site ID. If `DATA_APP_OWNER_EMAIL_SHA256` exists, require one readable, valid 64-character lowercase hex value matching the owner's hash and preserve it without an update. A duplicate, malformed, unreadable or mismatched value stops deployment for the owner to resolve.
3. Only when the key is absent, call native `update_environment_variables` with `project_id` and `set_values: [{key: "DATA_APP_OWNER_EMAIL_SHA256", value: ownerHash, is_secret: false}]`; omit `remove` to preserve other settings. Read back and verify the same key before deploying. Pass tool values as structured data, never interpolated shell commands or script source. Keep the full Site response and raw email out of files and logs, and keep the hash out of source, hosting metadata, publication manifests and D1. Sites applies environment changes on the next deployment and retains settings separately from app code.
4. Editors cannot read or change environment settings. Before an editor republishes, read the current deployed `/api/presentation` through the authenticated Site context and require `ownerEnvironmentConfigured: true`. False or missing means the owner must initialize and deploy the migration first; stop the editor deployment. Neither `canEdit: false`, local owner seeds, packaging receipts nor environment-tool permission errors prove readiness. Once ready, editors publish with environment settings untouched.

## Explicit source builds

For an explicitly selected `--source` client build, also pass `--source` to the packaging command. This uses the source Worker wrapper and already-installed local Vite, preserving its source integrity, presentation, and packaging checks. It never activates after a default-packaging failure or silently replaces an authorized custom Worker. An older source Worker that embeds an owner ID or email hash needs the existing scoped runtime-upgrade workflow to read ownership from the environment; packaging-manifest repair does not authorize that upgrade.

## Scoped packaging-manifest repair

Direct publication does not read or repair copied runtime hashes. The following repair applies only to explicitly selected `--source` builds. Older publication helpers could leave the protected hash for `.openai/hosting.json` stale. This also applies to a newly bound, unpublished Site where project creation already wrote the exact project ID and `d1: "DB"`, leaving only the hosting hash stale before first packaging; no prior deployment or Worker bundle is required. For a source build with **only** this mismatch, append `--source --migrate-packaging-manifest` to one packaging command. This source-only repair requires already-installed project Vite; it never downloads dependencies or makes a legacy monolithic Worker compatible with the prebuilt path. The helper requires an existing reviewed `dist/index.html`, the exact existing `project_id`, `d1: "DB"`, and every unrelated protected hash to verify. It preserves the Site, DB binding, reviewed content, and all unrelated integrity entries. It rejects a migration with no applicable hosting mismatch or with any unrelated mismatch, including an owner-module mismatch. Changes to owner authorization require the scoped runtime upgrade described above.

When the reviewed client is unchanged, package the existing verified `dist/index.html` with the scoped migration, then run `"<codex-node>" scripts/verify-protected-runtime.mjs` from the app directory. Do not rebuild the client merely to synchronize hosting metadata; that packaging invocation can be the final package. If source changes genuinely require a new client build and stale packaging-owned entries block it, run the one-time migration **before** the Data App Contract's [build command](../../shared/data-app.md#build-and-verification), then rebuild with `--source` and run ordinary final packaging again without the migration flag, retaining `--source`. Never rebuild after final packaging. Requested custom runtime changes use the existing scoped source-authorization workflow; this flag never approves them. Never run generic manifest regeneration, manually rewrite integrity hashes, or use the maintainer-only integrity updater inside a generated app to work around a failed check.

## Consequences of direct publication

All reviewed rows, source metadata and SQL remain in the uploaded snapshot; hiding content in the UI does not remove it. The hosted HTML removes local task/reference tags. New prebuilt pages marked `deferred-content-v1` replace their embedded rows with a metadata bootstrap, and instantiate authored modules only after the complete hosted data arrives. Unmarked and source-built pages retain their full HTML content; no minified JavaScript is rewritten. The original offline page stays complete in either case. Credential detection is bounded and non-exhaustive; unsupported encodings or other archived files, including stale server assets and source maps, may still contain sensitive content. Direct packaging does not certify analytical correctness, capture unsupplied browser-local edits, or clean unrelated output files. Initial presentation seeds a new record and does not overwrite later hosted edits. Runtime request validation and owner-only write authorization remain active.

Newly initialized indexed publications stream the existing complete R2 snapshot without loading it into Worker memory or copying source rows into D1. Owner query replacements use immutable R2 objects with small D1 revision pointers; presentation stays in D1. Existing populated snapshot databases retain their storage path and edits. Readback accepts the two exact source-derived encodings, indexed raw and legacy D1, without accepting changed hosted data. The browser still loads the complete snapshot, and owner query-update requests still buffer their submitted rows. Record package bytes, per-query rows and readback timing rather than treating upload size alone as a guarantee of memory safety.

The default packager returns sanitized `scanStats` after complete credential inspection. Record these with package and upload receipts when diagnosing large publications. Text and inline assets are inspected incrementally, and row traversal avoids queuing every cell. Ordinary artifact size and cumulative cell count do not end the scan; limits on active nesting and complex URL candidates still fail closed. A completed scan does not establish that the subsequent deployment, data readback, or browser rendering will succeed.

## Refresh follow-up

After successful Site publication, you may briefly offer the [optional analysis review](../../shared/data-app.md#optional-final-consistency-review) once for that handoff. Skip it when recently completed or declined; do not load the review skill, delay delivery, or require a reply unless the user requests the review.

After successful publication, follow [Offer automatic refresh](../../shared/data-app.md#offer-automatic-refresh).
