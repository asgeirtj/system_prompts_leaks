# Codex Security Cloud

Codex Security Cloud delivers the Aardvark workflows UI through a separate first-party,
app-only plugin. Native Security remains in `plugins/codex-security`.

## Delivery

- `.codex-plugin/plugin.json`, `.app.json`, `assets/`, and `skills/` define the
  installable plugin and its required `connector_openai_defense_factory` app.
- `.internal/defense-factory-ui/src/` owns the UI. The
  [managed build](../../../../api/sheep/packs/defense_factory/defense-factory-ui/README.md)
  bundles its internal platform UI kit and other dependencies into one HTML file.
- The [Sheep pack](../../../../api/sheep/packs/defense_factory/README.md) serves
  `ui://defense-factory/workflows.html`, opened by `open_defense_factory`, and
  implements the signed `defense_factory_*` backend operations.

Build from the monorepo root:

```sh
bazel build //api/sheep/packs/defense_factory/defense-factory-ui:cloud_html
bazel test //api/sheep/packs/defense_factory/defense-factory-ui:resource_test
```

This directory is the release source in the
[maintained catalog](../../docs/maintainer-guide.md). It is `INTERNAL_ONLY`,
targeted to Codex, requires app authentication at installation, and preserves
the `chatgpt-aardvark-workflows` Statsig requirement. The catalog adds no plan
restriction; the app continues to evaluate the caller's existing access.

The catalog entry describes the intended release policy; merging it does not
create a directory record or publish a release. Use the maintained catalog
publication and installation flow for this directory, with restricted internal
visibility and verified stored access policy. Staging records are separate from
production registration. Building the HTML does not register the connector,
deploy Sheep, or install the plugin. No local executor, stdio companion, or native Security
overlay is required.

## Host and access requirements

The host supplies login and workspace selection. The first-party Codex Security Cloud bridge
provides GitHub setup and the Cloud environment editor.
Credentials stay outside the plugin iframe. Sheep carries the signed caller to
the existing workspace, Cloud and Aardvark permission checks; installing the
plugin grants none of those permissions.

The internal pack name `defense_factory`, `defense_factory_*` protocol, and existing
permission names remain unchanged. Codex Security Cloud owns its onboarding; it does
not read or write the legacy CSC announcement or research-preview agreement.
The replacement onboarding flow is not implemented yet.

Local installed-plugin tests with signed staging backend reads do not establish
a shared staging rollout or production readiness. Fresh OAuth, successful scan
execution, full UI parity and production access require separate validation.
