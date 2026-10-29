---
name: prepare-plugin-submission
description: Guide a user through preparing an existing plugin for public submission, including review and publication metadata, listing, examples, demo, and reviewer access. Use when the user wants to get ready to submit, create a submission-ready ZIP, submit, or publicly release a plugin.
---

# Prepare a plugin submission

Prepare an existing plugin for public review, including a ZIP prepared for later
submission. Ordinary private creation, updates, and source exports without
submission intent do not need this workflow. Use
[create-plugin](../create-plugin/SKILL.md) or [update-plugin](../update-plugin/SKILL.md)
first if implementation is unfinished.

Start from the actual source, listing, and supplied materials. Ask only for
missing publisher information, intended behavior, or access; do not invent
URLs, evidence, or attestations. When dashboard work is requested, use the intended
organization and publisher. Preserve the plugin's identity, original source,
and audience; prepare public uploads in a separate copy. Preserve private app
bindings in the original source and Portal-generated bindings in finalized
releases, not in the author-supplied public upload. A Sites-generated plugin
needs a submission path supporting its canonical App ownership, not a duplicate
private plugin.

## Guide the preparation

A request to get ready to submit starts this workflow; it does not require an
upload. Preparing the source and ZIP must not depend on dashboard or browser
access. Keep working within the user's chosen tools and delivery scope.

Guide the user in this order: collect listing and publication details, prepare the demo and other review materials, finalize the ZIP, then upload, connect, and test in the submission portal as the final setup step. Do not lead with portal upload or leave the user with an undifferentiated list of unresolved requirements. Ask the next concrete preparation question and help complete its answer before moving to the portal.

Read the relevant reference before each stage:

- [Package and listing](references/listing.md): public-upload restrictions,
  listing fields, all four required URLs, and icon creation and verification.
- [Review materials](references/review-materials.md): cases, demos, reviewer
  access, and review/publication metadata. Read the publication mappings for
  skills-only plugins too, including release notes, countries, and translations.

1. Inspect the source, tools, metadata, and previous answers. Draft the listing,
   applicable review cases, and release notes from supported behavior. Show
   drafts for correction while continuing preparation.
2. Collect missing listing and publication facts in small groups. Ask for the intended verified individual or business identity, supported countries (or an explicit choice of all available countries), and whether the plugin involves payments or purchases; if it does, ask what users buy and where payment occurs. Reuse prior answers, explain the required fields in plain language, and resolve missing listing URLs and policy coverage. Do not invent a publisher, infer country targeting from a domain, or infer commerce behavior from the publisher's other products.
3. Help create the icon and demo before directing the user to the submission portal. For the demo, provide specific prompts and the results to show, guide recording and reviewer-accessible hosting, then verify the actual recording link. Follow the recording reference for an existing development connection or an authentication dependency. Never present a script as a recorded demo, an unrun case as tested, or drafted policy text as a published policy.
4. Write supported values into the package as work progresses. Use the references' field mappings for `extensions.com.openai.interface`, `review`, and `publication`; keep multiple servers' cases on their respective servers. Separate review notes do not replace metadata. Leave unknown fields absent and track gaps; do not invent declarations or URLs, or insert empty objects or lists that clear saved values.
5. Rebuild and inspect the final ZIP and its metadata. Return it with what is complete and the specific preparation item still needing input, if any. An incomplete ZIP is not ready to submit. If the user switches to ZIP-only, retain metadata and continue helping with missing materials; only the online action leaves scope.
6. Once preparation is complete, guide the final portal setup: upload the ZIP as a draft when requested, connect the actual MCP server through OAuth where needed, and run the review cases against the saved version. Verify imported metadata and resolve portal requirements before an authorized submission. Keep submission for review and publication separate from this setup step.

Skills-only plugins need no MCP cases, demo, or reviewer credentials. For each
app needing initial public review, draft five positive and three negative cases
from its actual behavior; existing reviewed dependencies need an eligible version.
Supply reviewer credentials and login instructions only through secure dashboard
fields, never public listing fields or the ZIP.

## Check readiness before handoff

Inspect the contents of the final ZIP, not only the working files. Check the
listing fields and lengths, all four verified listing URLs, icon references and
files, and applicable review cases, recording URL, release notes, commerce
details, and country targeting. Check case counts and required fields as well
as test quality. Run target package/submission validation when available and
fix every issue that can be addressed in the ZIP before calling it ready.

Report package readiness separately from remaining dashboard requirements:
reviewer credentials, connection/authentication setup, domain and developer
verification, required scans, and attestations. A valid ZIP cannot complete
those steps or guarantee review approval. When an upload is requested, inspect
the exact saved version's metadata and review-information issues, verify the
imported values, and resolve any remaining errors within scope. Do not equate
upload success with submission readiness.

## Online actions and draft updates

Read [submission lifecycle](references/submission-lifecycle.md) before uploading,
submitting, publishing, or updating a saved draft. Proceed only within the user's
request and existing authorization, using the intended organization and publisher.
For ZIP-only requests, return the archive and gaps without creating a private plugin.

An upload creates a draft; submission for review and publishing an approved release
are separate actions. Have the authorized developer complete legal/policy
attestations. Reupload replaces the full bundle and resets attestations; inspect
the saved draft and the reference's field-preservation rules before replacing it.
Changes after review starts may require cancelling review; explain that effect
and obtain authorization before doing so.

Report the outcome actually completed: archive prepared, draft uploaded,
submitted for review, or approved release published. Include missing materials,
unverified checks, and the actual review state.
