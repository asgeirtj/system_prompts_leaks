# Upload, review, and publish

Proceed with online actions only within the user's request and existing
authorization. For ZIP-only requests, return the archive and missing materials
or online checks without creating a private plugin.

This is the final setup stage after listing/publication details, the demo recording and its accessible URL, other applicable review materials, and the ZIP have been prepared. If the user asks what to do next while those materials are missing, guide that preparation first. Do not start the checklist with an upload just to collect publisher, country, commerce, or demo information. An explicit request to upload an incomplete draft can still proceed within scope; report the missing materials without calling it ready to submit.

1. Validate the package with target tooling when available, then upload through
   the dashboard when requested, selecting the intended verified individual or
   business identity. Check the saved developer name against that identity,
   along with the skill/server inventory, listing, icons, and validation feedback.
   Automatic developer-name enforcement depends on deployment of the backend
   change described in the listing reference; do not assume it is already live.
   An upload creates a draft.
2. Complete connection setup for the actual MCP server. The dashboard's
   **Create app** conversion supports eligible remote HTTPS servers; repackaging
   a local stdio server does not host it. Preserve its endpoint and app bindings.
   Complete OAuth where required and run the prepared review cases against this
   exact saved version; record actual results and resolve failures. Development
   rehearsal or a demo does not replace this final connection and test check.
3. Check cases, demo, reviewer access, release notes, and targeting for the exact
   app/version. At most one owned non-template app may need new review per
   submission; other dependencies require an eligible reviewed version.
4. Have the authorized developer complete current legal/policy attestations,
   including not targeting children under 13 or sharing their personal
   information with OpenAI. A request to write code does not establish these
   facts or agreement. Resolve required scans and app-validation errors before
   an authorized submission.
5. Publishing is a separate action after approval. Before an authorized publish,
   verify the intended approved release and country targeting, then confirm the
   returned result.

Report the outcome actually completed: archive prepared, draft uploaded,
submitted for review, or approved release published. Include missing materials,
unverified checks, and the actual review state.

## Updating a submission draft

Reupload replaces the full bundle, unlike Plugin Creator's partial-file update
tool. Inspect the current draft first. Existing MCP connection, authentication,
and scan state are preserved; changing the ZIP does not migrate a connection
or perform a new scan.

When updating a published app from the older app submission flow, keep one remote
MCP declaration with its existing endpoint and omit authentication overrides.
The ZIP update can reuse the published app through a package binding; it does
not replace the app or its credentials. Changed endpoints and additional remote
servers require a new plugin. This reuse depends on backend rollout: verify the
saved draft shows the existing configured app once. If it still shows a separate
"Connection unknown" entry, report the blocked update instead of creating a
duplicate app or claiming the update succeeded. This does not migrate publication
ownership: a later app-only publication can restore the generated package over
ZIP additions. Call out this limitation when the developer needs durable skill
updates across future app publications.

ZIP-managed cases replace saved lists and become read-only in the dashboard;
edit them in source and reupload. A plugin-level `test_cases: {}` clears both
lists; omitted/null cases preserve them. A per-server `review: {}` also clears
its case lists. Include both positive and negative lists when replacing cases.
Omitting declarations later does not relinquish ZIP ownership. Omitted scalar
fields preserve saved values; empty strings can clear them.

Reupload resets attestations. Read back the updated draft and preserved
connection state before submission; reconcile concurrent changes rather than
blindly retrying. Changes after review starts may require cancelling review;
explain that effect and obtain authorization before doing so.

For a package metadata review, use **Cancel review** on the selected submitted
version when the dashboard offers it. Successful cancellation ends that
submission and clears its review lock while preserving its review record;
the original submission does not become editable. Published plugin and app
versions stay published. App review cancellation returns its app version to draft.

Package cancellation depends on the backend and dashboard rollout. Verify the
live action and saved outcome; a merged change or a cancellation error does not
establish that cleanup completed. If the action remains unavailable or a retry
still shows an active review, report the blocked state. Do not overwrite the
review lock, change app bindings, or resubmit the ended submission.
