# Troubleshooting

Read after a failed step, or for profile repair and static-to-Worker migration. Start with the returned error and logs when available; fix the identified cause and rerun the affected step. Reuse successful results whose inputs remain unchanged. For source or publishing failures, keep the same Site identity and follow the [workflow](../SKILL.md#workflow).

## Project configuration

For an unknown or invalid starter profile, run `node <plugin-root>/scripts/configure-execution-profile.mjs` in the checkout. Restart preview if the profile changes; keep valid dependencies. If `configured: false`, preserve the project's configuration.

For a static-to-Worker migration, prepare the starter separately and port existing content, assets, and behavior before removing obsolete output. Preserve the repository, `project_id`, audience, and bindings; remove `static` from the source manifest. Continue with the main [build and packaging step](../SKILL.md#4-validate-and-package).

## Preview

For a supervised preview failure, read the log tail from `sites-preview start`, then run `sites-preview status`. Follow the [managed preview](preview/managed.md) for the supported server and browser entry points. Portable previews follow [local preview](preview/local.md).

Repair identified source or configuration defects before publishing and retain proven compatibility repairs. Retry preview only after a concrete repair or evidence of infrastructure recovery. An unavailable supervisor, browser, or static-preview dependency is an environment limitation; do not replace managed infrastructure or change working application code to compensate. Report browser QA as unverified and continue with appropriate checks and publishing unless passing browser QA is a publication condition.

## Continue or Report

If deployment reports success without a URL, make one status call for that deployment; report incomplete verification if the URL is still missing.
