# Prebuilt Data runtime

The plugin ships browser-ready React/Data code and a small pure-JavaScript authoring compiler. Creating a customer dashboard does not install npm packages, download CDN code, extract a dependency tree, or load a native compiler. Vite, Rolldown, and Lightning CSS run at release time or in an explicitly selected `--source` build with compatible local dependencies; the default customer path does not invoke them or npm.

This directory is an intentionally standalone npm workspace. The canonical template's package lock supplies app dependency versions and tarball integrity. The compiler adds pinned browser Rollup, Sucrase, Acorn, and CSS Tree packages. A pinned, publisher-only Terser pass reduces raw inline JavaScript bytes after bundling; it is not shipped or installed for customer builds. Never refresh the canonical template's dependencies as a side effect of rebuilding.

## Rebuild

First refresh the canonical protected-runtime manifest through its maintainer workflow. If its dependency lock changed, refresh this release-only lock:

```sh
node scripts/prebuilt/refresh-lock.mjs
```

Then build from a fresh frozen publisher installation:

```sh
node scripts/prebuilt/build.mjs
node scripts/prebuilt/build.mjs --check
node --test scripts/prebuilt/*.test.mjs
```

The first two commands each make a private temporary workspace, run release-only `npm ci --ignore-scripts`, build, and remove that workspace. `--offline` restricts that publisher install to its existing npm cache. For an already-frozen publisher workspace, pass `--dependencies /absolute/path/to/workspace`; its package and lock must exactly match this directory. `--compiler-only` produces only the standalone compiler for local development and does not finalize a release manifest.

The default output is `assets/data-app-runtime/`. The manifest is written last and records exact artifact hashes/sizes and every protected/build source hash. `--check` rebuilds without changing the shipped assets and rejects any byte drift. Follow the owning package's release workflow for generated artifacts and publish only a verified candidate.

## Artifact contract

- `app.js`: data-free IIFE defining `CodexDataAppRuntime`. Its manifest metadata records the exact own export names of the eight supported runtime modules, captured from the built IIFE at release time. The customer-side linker can therefore reject misspelled imports without evaluating browser code.
- `styles.css`, `print.css`: protected styles, kept separate so authored CSS retains its established ordering.
- `inline.js`: data-free `CodexDataInlineChart` IIFE with the shared chart renderer and editor. Source inspection stays in the separate answer receipt; charts contain no source button or sidebar. The runtime is replacement-safe and less than the inline host's 1 MB limit.
- `inline-trend.js`, `inline-cartesian.js`, `inline-categorical.js`, `inline-flow.js`: release-time partitions of the same canonical renderer. The inline helper selects the family from the validated chart type before embedding it. There are no lazy network chunks, customer-side compilation, or changes to the full dashboard runtime. The general `inline.js` remains for callers preparing a runtime without a chart spec. Family builds preserve mixed line/bar trends, compatible chart-type editing and the unchanged complete-fragment limit; the tradeoff is additional installed assets and release builds.
- `receipt.js`: data-free `CodexDataSourcesReceipt` IIFE for standalone answer provenance, using the same source inspector without the chart runtime. The release build verifies a complete receipt with 2,000 preview rows remains below 1 MB.
- `worker.mjs`: self-contained ESM with named `createDataAppWorker` and `validatePresentation` exports and no default export. The local `createDataAppWorker` binding is preserved so the Sites packager can append its sanitized per-artifact configuration and default export.
- `compiler.cjs`: dependency-free API version 1, exporting `rollup`, `transform`, `parseJavaScript`, `parseCss`, `walkCss`, `generateCss`, and `decodeCssIdentifier`. JSX uses the production automatic React runtime; TypeScript types are stripped, including in `.mts` modules. `commonjs: false` preserves ESM imports for the portable Rollup linker. Callers provide a closed virtual-module graph and call `generate()`, not filesystem-oriented `write()` or `watch()`. The single-file output inlines literal dynamic imports; their module side effects can run eagerly, so it is not an on-demand code-splitting runtime.
- `THIRD_PARTY_NOTICES.txt`: license texts for the exact frozen packages that contributed distributed code.

Two upstream npm packages omit their own license text from the published tarball. `license-overrides.json` supplies reviewed copies from immutable upstream commits, bound to the exact package tarball integrity and license hash. The builder also preserves licenses nested inside vendored packages. Missing or changed notices fail the release build; it never fetches licenses implicitly.

The inline build embeds the canonical stylesheets and inline icon URLs as losslessly compressed DEFLATE data, decoded locally with the browser's native `DecompressionStream`. The chart waits for its stylesheets and icons before rendering; no network, script evaluation, or extra runtime dependency is involved. This keeps the shared dashboard dropdown and menu within the inline size budget. Source builds continue to accept the ordinary CSS string.

The source `buildInputsSha256` is SHA-256 of compact `JSON.stringify(buildInputs)`, where the plugin-relative map is sorted by path. No generated timestamp, publisher path, customer snapshot, authored component, or installation-specific data belongs in these shared assets.
