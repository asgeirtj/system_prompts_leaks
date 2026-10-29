# Package and listing

Use [package format](../../create-plugin/references/plugin-packages.md) for manifests,
skills, server configuration, and assets. Prepare a ZIP with an explicit semantic
version and verify its inventory and review materials.

Inspect the complete upload, including hidden compatibility manifests. It must
contain no root `.app.json` and no non-null `apps` declaration at either the
manifest top level or `extensions.com.openai.apps`, even if another manifest
takes precedence. Configure required integrations with verified MCP endpoints
in portable `mcp.json`. If an endpoint is unavailable, stop packaging and report
the missing integration; do not invent an endpoint or silently remove behavior.
These restrictions apply to author-supplied uploads. Keep the app bindings the
Portal generates during MCP conversion in the saved submission and finalized
release. An eligible reviewed app does not exempt an upload from these checks.

Write listing fields under `extensions.com.openai.interface`:

| Field | What to provide |
| --- | --- |
| `displayName` | Clear name, at most 30 characters |
| `shortDescription` | Subtitle describing the purpose, at most 30 characters |
| `longDescription` | Supported behavior and intended users, at most 4000 characters |
| `developerName` | Selected verified individual or business name, at most 80 characters; see the rollout note below |
| `category` | A supported title from the target dashboard |
| `defaultPrompt` | Up to three nonblank, single-line prompts, unique after whitespace normalization, at most 128 characters each; no app `@mentions` |
| `websiteURL` | Public page identifying the plugin, its purpose, and publisher |
| `supportURL` | Public page with a working way to get help or contact support |
| `privacyPolicyURL` | Published privacy policy covering the plugin's actual data practices |
| `termsOfServiceURL` | Published terms applying to use of this plugin |
| `logo`, `composerIcon` | Contained paths to actual icon files |
| `logoDark`, `composerIconDark` | Optional dark-mode assets, if the creator wants them |
| `brandColor`, `brandColorDark` | Optional brand colors, if the creator wants them |

After the verified-developer-name backend change is deployed, ZIP submissions
use the selected verified identity for the public developer name. Package
`author.name` and `developerName` cannot override that name. This guidance does
not establish that the change is deployed: verify the target portal behavior
before relying on it. Until deployment is confirmed, keep any supplied package
name consistent with the intended verified identity and inspect the saved name.
Do not invent a publisher name when verification is unavailable.

Count the final subtitle's characters, including spaces and punctuation, before
packaging. Rewrite it if it exceeds 30 characters; do not truncate it mid-word.

### Complete and verify the URLs

For public submission, guide the creator through all four listing URLs above.
Their being optional in the portable package schema does not make them optional
for submission. Write each value under `extensions.com.openai.interface`; a
root `homepage` or links in a README do not populate these fields.

Start with existing publisher pages. If any are missing, help draft and prepare
the relevant pages from confirmed facts, then guide the creator through hosting
them on a site they control within the requested scope. Ask about actual data
collection, use, sharing, retention, deletion, and support arrangements before
drafting claims about them. Have the creator resolve unknown policy or terms
decisions; do not invent legal commitments or copy another service's policies.
An unpublished document is not a completed URL field.

Use real absolute HTTPS URLs, at most 1,024 characters each, without embedded
credentials. For `supportURL`, use a support page rather than an email address
or `mailto:` link. Fetch or open each destination with available permitted tools,
follow redirects, and inspect the content: it must be accessible without a
private login, identify the correct plugin or publisher, and serve the promised
purpose. A successful HTTP status alone is insufficient. Reject placeholder
domains, guessed paths, unrelated pages, and links that return errors. Report
inaccessible or unverified links as gaps instead of claiming they passed.

Apply the same content and access checks to the video walkthrough and any test
attachment or expected-output URLs. Verify that reviewers can view the actual
recording and fixtures, not just a sign-in screen or a page requesting access.
Keep reviewer login URLs and account details in the secure access instructions,
not in public listing fields or the ZIP.

### Create the app icon

Reuse suitable branding supplied by the creator. If an icon is missing, propose
a simple design based on the app's purpose and ask only for missing brand
preferences that would materially affect it. Use an available image-generation
tool to create the actual asset, then show it for feedback. Favor a distinctive
silhouette, clear contrast, and minimal detail that stays legible at small sizes;
avoid small text. If generation is unavailable, provide a concrete design brief
and guide the creator to supply an image. A prompt or placeholder is not a
completed icon.

Save the icon in `assets/` and set `extensions.com.openai.interface.logo` and
`composerIcon` to contained relative paths; reuse the same asset when suitable.
For submission, use square PNGs up to 5 MiB: listing logos at least
256 × 256 pixels and composer icons at least
48 × 48. Inspect the actual file type, dimensions, size, and legibility on light
and dark backgrounds, then verify that the referenced files are in the ZIP.

Offer dark-mode assets (`logoDark`, `composerIconDark`) and brand colors
(`brandColor`, `brandColorDark`) as optional choices. Ask once whether the creator
wants either, reusing preferences already given. If declined or unanswered,
continue without adding them; their absence is not a submission gap and must
not block packaging. Preserve existing values unless the user asks to change
them, and validate any values they choose to include.
