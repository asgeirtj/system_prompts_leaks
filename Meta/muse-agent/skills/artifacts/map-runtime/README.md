# Artifact map runtime

Bundles `@meta/maps` into a standalone script that a generated web artifact can
load with two plain tags. Artifacts have no bundler and no React, so they cannot
use the component API directly.

Built output is vendored into the bundle at `/opt/hatch/skills/artifacts/map-runtime/dist/`:

| File | Purpose |
|---|---|
| `hatch-maps.js` | IIFE exposing `window.HatchMaps` — `mountMap` and `isMetaMapSupported` |
| `hatch-maps.css` | MapLibre control and canvas styles |

**Both are required.** Loading the script without the stylesheet stacks the
tiles on top of each other, so the map looks broken rather than missing.

## Usage from an artifact

Copy both files into the artifact's own assets first. The bundle path is a
filesystem location on the build VM; a published artifact is served from its own
origin, so referencing `/opt/hatch/...` from the page 404s and leaves
`HatchMaps` undefined.

```bash
cp /opt/hatch/skills/artifacts/map-runtime/dist/hatch-maps.{js,css} <assets>/
```

```html
<link rel="stylesheet" href="assets/hatch-maps.css">
<script src="assets/hatch-maps.js"></script>
<div id="map" style="height: 420px"></div>
<script>
  HatchMaps.mountMap(document.getElementById('map'), {
    clientId: 'artifact_web',
    places: [
      {label: 'Chaotic Coffee', lat: 47.6588, lng: -117.426},
      {label: 'Mobius Discovery Center', lat: 47.6575, lng: -117.4231},
    ],
    onFatalError: () => {
      document.getElementById('map').textContent = 'Map unavailable';
    },
  });
</script>
```

The container needs a resolved height. A map in a zero-height element renders
nothing and reports no error.

`onFatalError` is not optional in practice. It fires for the map control's own
fatal errors and for anything thrown while the map is being constructed — a
render-phase throw is caught by a boundary inside `mountMap` rather than
escaping to the window. Surfaces differ in what they let a map do, and the same
bundle renders normally on some and not others, so give the callback a real
fallback — the place list, or a short "Map unavailable" block — because a build
cannot tell in advance which surface it will get.

`_nc_client_caller` is fixed at `Muse_Artifact`; pass the artifact kind as
`clientId`, which becomes `_nc_client_id`. Both are wire identifiers that
maps-side dashboards group by, so do not invent per-artifact values.

`locale` and `politicalView` are overrides, and the example leaves them out on
purpose. The style, glyph and tile requests leave the reader's own browser, so
the maps backend resolves the values correct for whoever is reading; setting
them pins one view of every disputed border onto every reader of the artifact.
Set them only to correct a resolution observed to be wrong.

`rtlTextPluginUrl` defaults to `false`, so MapLibre's RTL text plugin is not
registered and Arabic, Hebrew and Persian labels render mis-shaped and reversed.
The library's own default resolves the vendored asset through `import.meta.url`,
which this build cannot emit — esbuild at `--format=iife` has no asset loader —
so declining is the honest default rather than a silent failure. A page that maps
an RTL-script region and can serve the asset from its own origin passes the URL.

Attribution is mounted by the map control. It is mandatory — do not hide,
overlay, or reimplement it. See  
`hatch-skills/skills/artifacts/references/maps.md`.

## Maps do not render in every artifact surface

A vector map needs WebGL and a Web Worker, and not every surface an artifact
opens on provides them. Ask before mounting:

```js
const {supported, reason} = HatchMaps.isMetaMapSupported();
if (supported) {
  HatchMaps.mountMap(el, {
    clientId: 'artifact_web',
    places,
    onFatalError: () => renderPlaceListOnly(),
  });
} else {
  renderPlaceListOnly(); // reason is 'webgl' or 'worker'
}
```

**The probe is not the whole story.** A surface can pass it and still refuse the
style, glyph and tile requests once the map has mounted, which arrives through
`onFatalError` rather than through the probe. `onFatalError` is also the backstop
for a lost GL context and for a throw during construction, which `mountMap`
catches rather than letting reach the window. Point both at the same fallback
and the page degrades identically whichever fires. Surface specifics live in
`references/maps.md`, under "Probe the surface before you mount".

Test a map change on more than one surface -- a build that renders in one place
tells you nothing about the others.

## Build

```bash
bun build.mjs
```

`@meta/maps` resolves from Metaccio. Both `.npmrc` and `bunfig.toml` scope only
the `@meta` prefix, so every other JS dependency in this repo keeps resolving
from the public registry.

Metaccio authenticates a corp host by network position — no token. Buildkite
agents qualify, and `bundle-setup/scripts/build.sh` gives the build container
host networking whenever `fwdproxy` resolves. A corp laptop running
`x2pagentd` reaches the same registry over http through `127.0.0.1:10054`
instead; keep those proxy lines out of the committed config, since CI has no
agent daemon listening.

Peer note: this package carries no passenger dependencies, and should not gain
one. `@meta/maps` declares `next` and `@opentelemetry/api` as optional peers and
imports neither at module scope — telemetry reads OTel off the global registry
(`Symbol.for('opentelemetry.js.api.1')`) when something else registered it. The
only reference is a type-only import in `mapTelemetry.d.ts`, which
`skipLibCheck` absorbs; if a change makes that type reachable from `src/`, it
belongs in `devDependencies` and never in `dependencies`.
