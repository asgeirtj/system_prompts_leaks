# Separate publication source and complete-data recovery

Use this flow for a packaged `separate-data-v1` build. The original authoring project retains `src/data.json`, authored code, its Git history, and the preserved offline bundle. A separate publication checkout contains the same application source plus an immutable data reference. It uses the same Site, artifact identity, database, access policy and complete dataset.

## Prepare the exact source version

After normal final packaging, call the exported helper using in-memory arguments:

```js
import { createPublicationSource } from "<data-plugin-root>/skills/publish-artifact-to-sites/scripts/publication-source.mjs";
const result = await createPublicationSource({
  authoringProjectDir,
  publicationProjectDir,
  projectId,
  sourceRevision,
  siteUrl,
});
```

`sourceRevision` is the full verified original authoring Git HEAD; file hashes also bind the current reviewed working files. `siteUrl` is the canonical HTTPS origin returned by the selected Site, when available. Before first publication Sites can return no origin; pass null or omit it, keeping the exact Site ID pinned. Never derive a guessed origin from a slug. The destination must be fresh, outside the authoring project. The helper verifies package/build identities, complete raw data, counts, hosting bindings, source files and copied output. It refuses symlinks, changed inputs and existing destinations.

The candidate retains code and required built `dist` output. Its `.openai/data-app-publication-source.json` records source and runtime identities, complete immutable data hash/bytes, query/row counts, and file hashes. It contains no machine paths or bearer tokens. Its Git ignore rules exclude `src/data.json`, `dist`, dependencies and generated data/offline directories. There is deliberately no placeholder dataset.

Use the existing Sites source credential flow to commit and push this checkout. Before establishing its history, inspect the selected remote source branch. If empty, initialize the publication branch. If it exists, fetch and verify that exact ancestor, then append the candidate tree as a descendant. Retain the original authoring repository and refs. Never force-push, rewrite its history, or assume a failed HTTP request left the remote empty. A deletion commit in the original unpublished repository still uploads large ancestor blobs and does not solve the source-upload limit.

Commit the manifest and exact source, preserving any existing remote ancestry. Verify the pushed full HEAD and package this checkout's already-built `dist` using Sites hosting. Never rebuild or edit between source commit and archive/deployment. Upload the complete immutable HTML/snapshot assets from the **authoring project**, using the normal Data upload helper and same project ID. Retain the checkout and non-secret publication/readback receipts. The normal Sites private/access checks remain required.

## Recover complete data from a publication checkout

A Git clone contains code and the manifest, with no complete dataset. Restore the pinned data before building or producing an offline export:

```js
import { hydratePublicationSource } from "<data-plugin-root>/skills/publish-artifact-to-sites/scripts/publication-source.mjs";
await hydratePublicationSource({
  publicationProjectDir,
  projectId,
  siteUrl,
  sitesAuthorization,
});
```

Obtain `projectId`, `siteUrl` and the temporary Sites ingress bearer through the trusted selected Site context. The helper requires the Site ID and any recorded origin to match the source manifest before sending the bearer. When the manifest predates the first publication and has a null origin, remote hydration still requires the caller to resolve that exact Site's now-published canonical URL; it never falls back to a repository-controlled URL. Pass credentials through memory or child-process stdin, never shell flags, source, URLs or files. The request rejects redirects and uses the Data Worker's owner-only immutable snapshot read, then verifies every byte and the recorded SHA-256 before atomically installing `src/data.json`. Missing historical assets, changed source files, corrupt bytes and conflicting existing data fail explicitly. A locally retained complete immutable asset can instead be supplied as `snapshotFile`, without a network credential. Deployment output omitted by Git can be rebuilt; present output still has to match its recorded identity.

The ordinary `/api/snapshot` contains mutable hosted data and must not substitute for immutable source recovery. Historical immutable reads require the current owner; a temporary deployment token can read/upload only its current configured assets. Keep content-addressed assets for saved versions.

After hydration, build the source using the supported Data builder and export the complete standalone HTML with `export-offline`. A rebuilt client uses the selected installed runtime; its recorded runtime identity lets the caller detect a version change. Saved-version rollback uses the original packaged output, without recompilation. Offline export from a retained verified split bundle also requires no recompilation. Exported HTML stays under `.data-app-offline/exports/`; use a custom filename within that directory. Other output directories are rejected so exported full datasets do not reenter publication source or Git. Copy the completed file outside the authoring project for delivery when needed.

To revise a saved version, restore and verify its data first, then work in a copy of that project. Keep the saved version intact. Remove the publication-source manifest only from the working copy; never replace the saved data to make a failed verification pass.

## Find the deployed source

Read `GET /.well-known/sites-deployment-id` on the Site. Pass that deployment ID to Sites `get_deployment_status`, then pass its `version_id` to `get_site_version`. Retrieve the source at the returned `source.commit_sha`. If the deployed version cannot be identified, report the missing information rather than assuming the latest saved version is live.

## Start a refresh from current data

For a [refresh](../../../shared/data-app.md#refresh-a-published-dashboard-or-report), get the [source currently deployed](#find-the-deployed-source) and the current `/api/snapshot`. Check that the Site and app IDs match.

If the source contains a publication manifest, work in a copy and keep the original intact. In that copy, remove `.openai/data-app-publication-source.json` and save the current snapshot as `src/data.json`. Rerun the saved requests, rebuild, and publish normally. This creates a new version with refreshed data; restoring an older version still requires the verification above.

## Capability and performance boundaries

All reviewed data, SQL, provenance, chart controls and exports remain available. Source uploads avoid sending the complete snapshot through Git. Build/publication avoid constructing a full offline HTML intermediate and retaining prior large outputs as rollback Buffers. Raw source bytes and the canonical parsed seed fingerprint are distinct, so formatting alone does not reset hosted query edits.

Local preview adds a same-origin snapshot request before authored content starts. Single-file offline distribution requires the explicit export step. Full snapshot parsing, initial database seeding and browser loading still consume memory proportional to data; other large authored assets can still exceed an unknown source-upload limit. This is not a row cap or a promise that every size will fit.

Pinned code and seed-data recovery is not a point-in-time restore of mutable D1 edits or presentation. Existing database generation and presentation semantics remain unchanged.
