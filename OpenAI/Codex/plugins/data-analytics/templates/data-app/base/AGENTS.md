# Data App Authoring Guide

Read before editing this app. The installed build-dashboard or build-report skill owns analytical composition and copy; this guide owns local file boundaries, styling, protected-runtime changes, and builds. It stays with the copied app. Resolve the component reference through the build workflow below and read only the topics needed for the task.

## Editable content

- Put app-specific React, scoped CSS, helpers, and approved assets in `src/content/`. Dashboard and report entry points are `dashboard/DashboardContent.jsx` and `report/ReportContent.jsx` beneath that directory; shared helpers and assets may use `shared/` and `assets/`.
- Update reviewed rows and exact provenance in `src/data.json`. Data corrections are artifact-local unless an external write is explicitly authorized; never misrepresent corrected values as an unchanged external result.
- Theme tokens live in `src/theme.css`. Theme-only edits require no additional confirmation; do not restyle protected chrome through content CSS.
- Import shared charting, components, controls, formatting, and data access only through `src/data-app-public.jsx`. Use the public evidence wrappers and source actions for custom visuals as well.
- The shell owns the only `main` landmark. Authored content uses `article`, `section`, or `div`.

`docs/components/` is a plugin-owned reference snapshot for the copied runtime, outside editable app content. Ordinary app revisions use the component API without modifying these reference files.

## Preserve behavior and identity

Keep the real top bar, theme switching, dashboard refresh, menus, chart editing, source inspection, inline editing, autosave, print/export, and publication/access behavior. Keep the existing project, app ID, published destination, and user presentation during revisions.

Set `surface` in `src/data.json` to `dashboard` or `report`. Each new app needs a fresh stable top-level `id`. Keep it unchanged during data, title, or layout edits. To rename an older app without an ID, assign a new safe ID and record the exact old title as `legacyPresentationTitle`; preserve both in reproducers. Do not scan browser storage, reuse another app's ID, or invent storage migrations. Ordinary title editing uses the shared editor.

Each source-backed component needs a stable `id` and existing reviewed `queryId`. Keep reviewed values, rows, controls, statuses, axes, and computed outputs read-only to inline text editing; mark custom source collections `data-reviewed-rows`. Authored captions/copy may use stable editable IDs; report prose uses `RichNarrative` for the shared formatting toolbar. Tooltip/source metadata is not inline-editable.

Retain the intended movable blocks and owner-only Edit behavior. Use `sortable-layout.md` in the resolved component reference for canvas, freeform, composite, or stack layouts. Keep page controls outside sortable regions. Increment `authoredRevision` only for an explicitly requested rearrangement; routine data, copy, or styling updates preserve user placement. Layout persistence must never mutate reviewed rows or provenance.

## Geometry and themes

Use Classic for unstyled new apps; preserve existing or requested themes.

Standard dashboards have one shell-owned 1440px usable column with 32px desktop / 16px mobile gutters; do not add nested page gutters. Preserve custom full-width/viewport layouts. Full-bleed sections use `--data-app-layout-intent: full-bleed`, retaining aligned inner content. For an explicit custom width/gutter, set `--data-app-layout-intent: user-requested` and `--data-app-content-width` on the authored page. Report defaults and its content-only width option are in the report API.

The protected top bar and tabs remain full-viewport regardless of content width. For app-wide restyling, update the existing `:root` palette in `src/theme.css`, including surfaces, controls, text, borders, and chart colors; never scope the whole palette to a content page. Set `--data-app-chrome-background` and `--data-app-chrome-text` to the desired theme tokens without changing chrome layout or functionality.

Keep metric values and marks contained, controls wrapping, and wide tables scrolling internally. Right-align quantitative table values, left-align text/miniature visuals, and omit redundant axis titles. Maps require projected geography and actual reviewed coordinates; reuse `src/content/dashboard/regional-world-map.js` where suitable, not schematic bubbles presented as geography.

## Protected infrastructure

`AGENTS.md`, `docs/components/`, app/runtime/context/public entry points, shared components and charting, hooks/actions, presentation, source inspection, official chrome icons, Worker/publication, build wiring, integrity manifests, and protected scripts are product-owned. Do not edit, replace, delete, shadow, hide, disable, or bypass them during ordinary app creation or revision. Content CSS/JavaScript must not target global document roots or remove, overlay, or disable protected product DOM.

An explicit user request authorizes only the necessary protected change. Unrequested protected changes require confirmation; vague styling/cleanup requests do not authorize unrelated shell changes. After an authorized edit, run from the app root, listing each allowed path with its own `--scope`:

```sh
DATA_APP_USER_CONFIRMED=1 "<codex-node>" scripts/authorize-protected-change.mjs --confirmed --scope <protected-file> --reason "<explicit request or approval>"
```

Then use `--source` below; unrelated protected edits remain forbidden. Never weaken checks, manually rewrite integrity manifests, or leave a general unlock. Canonical-runtime maintainers review the protected diff, run `DATA_APP_MAINTAINER=1 "<codex-node>" scripts/verify-protected-runtime.mjs --update --maintainer`, and regenerate pinned prebuilt assets and manifest together. This maintenance path is not for generated-app recovery.

## Build and preview

Locate the installed Data plugin and resolve Codex's absolute Node executable once with `load_workspace_dependencies`. New-app preparation returns `documentation.entryPoint` for the installed component API. Before consulting APIs when revising an existing app, resolve its current reference with the read-only preparation command:

```sh
"<codex-node>" "<data-plugin-root>/scripts/data-app.mjs" prepare --project-dir "<app-project>"
```

Open the returned `documentation.entryPoint` and read only relevant topics. `prepare` and `build` include `source: "installed-plugin"`, `apiVersion`, and `runtimeSha256` in that metadata. With `--source`, follow the returned `project-source` reference matching the copied runtime, normally [docs/components/README.md](docs/components/README.md). Reference lookup does not copy files or upgrade the app.

After authoring, build:

```sh
"<codex-node>" "<data-plugin-root>/scripts/data-app.mjs" build --project-dir "<app-project>" --separate-data
```

Ordinary builds verify the installed prebuilt runtime and authored ownership boundary without network, dependency installation, npm, or project `node_modules`. Use `--separate-data` for future apps: `dist/index.html` contains the compiled application, a content-addressed JSON sidecar contains every reviewed row and field, and `dist/data-app-build.json` binds their identities. Serve the whole `dist` directory for local HTTP preview; the app loads the complete sidecar before creating authored content. Keep older copied protected files intact; do not rewrite locks, recover old caches, request runtime-upgrade confirmation, or repeat preparation/copied starter tests merely to build content. An optional `.data-plugin-version` is informational, not a compatibility or authorization gate.

For a portable single-file offline HTML, export the verified split build without recompiling:

```sh
"<codex-node>" "<data-plugin-root>/scripts/data-app.mjs" export-offline --project-dir "<app-project>" --output "<app-project>/.data-app-offline/exports/dashboard.html"
```

All supported exports stay under `.data-app-offline/exports/`, with custom filenames allowed there, so complete portable datasets stay outside publication source and Git. Other output directories are rejected; copy the completed file outside the authoring project for delivery when needed.

After publication, export uses the preserved verified bundle under `.data-app-offline/separate-v1/`. Omitting `--separate-data` still supports the existing standalone build. A publication source checkout contains an immutable data reference and requires verified hydration before building; never substitute an empty `src/data.json` or mutable hosted data for that reference. The publication skill describes recovery.

Static local JS/JSX/TS/TSX/MJS/MTS imports, re-exports, cycles, JSON/assets, and ordinary CSS/PCSS/PostCSS without plugins are supported. Dynamic imports, top-level await, unsupported `import.meta`, CSS modules, and CommonJS need a supported source shape or an explicitly justified source build; never silently switch builds or change semantics.

For measured expensive computation, local `?worker&inline` modules support static local graphs. Send reviewed data once, track request IDs, ignore stale responses, provide failure fallback, and terminate unused workers. Do not introduce workers preemptively. `async-data.md` in the resolved component reference covers loading and error presentation.

Add `--source` only for authorized protected changes or explicitly needed source-build features/unbundled packages. It compiles copied infrastructure and runs its verifier, requiring compatible local Vite dependencies already installed. Never automatically fall back, install dependencies, or substitute prebuilt behavior for an authorized source change. Report missing requirements; restore protected files or complete scoped authorization when verification fails. Do not fork the renderer, replace the app with static HTML, or weaken copied tests to accommodate custom content.

Open a useful source-backed first view early and complete the requested scope in that same artifact. Rebuild after changes and follow the installed Data plugin's `shared/data-app.md` build-and-verification contract: ordinary authoring includes checking the rendered charts and affected interactions, not just the build or source data. Respect browser restrictions and name checks that did not run. Publishing or changing sharing remains a separate authorized workflow.

Follow the installed Data plugin's `shared/data-app.md` lifecycle contract for `buildStatus` in `src/data.json`. Use the single `buildStatus` field: `"creating"` for initial creation and `"updating"` for active revisions, including partial previews. Before final delivery or packaging a newly authored or revised app for publication, set it to `"complete"` when the requested app content and data work are finished, even if unavailable checks must be disclosed; use `"paused"` if work stops with unfinished scope or a known failure. Rebuild and refresh the same preview so the **Creating…** or **Updating…** status in the Updated slot clears, or report if that update is blocked. A successful intermediate build alone does not complete authoring, and clearing progress never claims unperformed verification or changes evidence status or freshness.
