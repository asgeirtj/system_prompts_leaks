---
description: Use the bundled map helpers for URL generation, interactive maps, and data overlays.
---

# Map helpers

Follow [Maps and places](maps.md) for rendering and sourcing requirements.
The implementation is in `/opt/hatch/skills/artifacts/scripts/map_helpers.mjs`.
Use it instead of copying or rewriting URL and map-setup code.

## Place lookups

Use the existing `/opt/hatch/bin/local-search` and `/opt/hatch/bin/places` CLIs.
Set the task's absolute `project_dir`, expanding `~/` with `$JARVIS_HOME/`.
Save details to `.src/research/places.json` for files or
`client/src/research/places.json` for web artifacts. Pass the required flags from
[Resolve places](maps.md#resolve-places), redirect stdout to the file, and collect
command completion before reading it. An explicit `yield_ms: 60000` is useful;
collect the background result if the command outlives it.

## Location data

A `PlaceRef` has a required `label` and optional `venue`, `address`, `locality`,
`region`, `country`, `lat`, `lng`, and `source`. Coordinates are named numbers;
address fields are strings. Store facts and derive provider URLs with the helpers.

## Static map URL

Run the URL script with a JSON file of options:

```bash
bun /opt/hatch/skills/artifacts/scripts/map_urls.mjs static map-options.json
```

Required: `center: [lat, lng]` and `zoom`. Optional: `width`, `height`, `scale`,
`format`, `theme`, task-supplied `language` and `region`, and  
`markers: [{position: [lat, lng], scale: 1 | 2 | 3}]`.  
The script supplies the caller and attribution parameters. It prints the URL;
fetch the image at build time and render the stored copy.

For circles and paths, import `buildStaticMapUrl`, then append one `circles` or
`paths[]` parameter per shape. The pipe-delimited grammar is optional
`color:0xRRGGBBAA`, `fillcolor:0xRRGGBBAA`, `weight:N`, `dash:N`, or `gap:N`,
followed by coordinates. A circle ends with a radius such as `500m`, `1k`, `1mi`,
or `2000ft`; a path lists its points. Use translucent fill alpha.

## Interactive map

Copy all three files from `/opt/hatch/skills/artifacts/map-runtime/dist/` into
the artifact's assets and load them as classic scripts. A static page may not
load a module, so use the generated `map_helpers.js` there, not the `.mjs`:

```html
<link rel="stylesheet" href="assets/hatch-maps.css">
<script src="assets/hatch-maps.js"></script>
<script src="assets/map_helpers.js"></script>
```

```js
const map = MapHelpers.mountMap(el, { places, baseStyle: 'light' }, showPlaceList);
```

In a TypeScript Space, copy `map_helpers.mjs` into `client/src/` and import from
it instead. The names below are the same either way: on a static page reach them
through `MapHelpers`, in a Space import them.

`mountMap` checks capabilities and connects
fatal errors to the required `onUnavailable` callback (the third argument). It
returns the control's map handle or `null`. Supply the callback yourself: show the
place list, or the data as a table or chart. The helper does not create page UI.

For a short place list, call `mountPlaceListMap(el, {places, rows}, showPlaceList)`.
`rows` is an array of DOM elements in the same order as `places`. The helper
numbers pins, synchronizes clicks and highlights, scrolls to selected rows, and
clears selection. Style `.pin`, `.pin--on`, and `.map-selected`; change the last
name with `selectedClass`. Mount once per container and list.

## Data overlays

`heatmapOverlay(id, geoJSON, colorStops, radius)` returns an overlay for `mountMap`.
`colorStops` alternates density thresholds and colors; include transparency at
zero and derive colors from the page. Radius defaults to 20. Pass it in
`overlays`, choose `baseStyle: 'grayscale'`, and use a chart or table callback.

Other encodings use the control's normal `overlays` and `tooltip` options.
Overlays remain below basemap labels; the control's pins remain above them.

### Choropleth

Call `mountChoropleth(el, options, showValueTable)`. Required options:

| Option | Value |
|---|---|
| `boundaryUrl` | A published geometry URL below |
| `rows` | Source records containing region identifiers and rates |
| `featureKey`, `rowKey`, `valueKey` | Geometry join key, row join key, and rate field |
| `colorStops` | Alternating rate thresholds and colors from the page palette |
| `outlineColor` | Outline color from the same palette |

The helper checks capabilities, fetches the geometry, joins values, and mounts
with grayscale, value tooltips, and the same callback for fetch or map failure.
Missing values remain `null` and are excluded from the fill; zero stays visible.
Add a legend explaining missing values and the scale.

Hover text is the page's, so write it in the artifact's language. The default
line is `name: value`; pass `missingLabel` for the words a region with no value
shows, or `tooltip`, a function of the feature, to replace the line outright.

| Geometry | URL | Feature keys |
|---|---|---|
| Countries | `https://external.xx.fbcdn.net/maps/static/boundaries/v1/countries.json` | `iso_2`, `iso_3` |
| US states | `https://external.xx.fbcdn.net/maps/static/boundaries/v1/us_states.json` | `postal_code`, `iso_3166` |

## Navigation links

Call `mapsSearchUrl(place)` or `mapsDirectionsUrl(destination, options)` in the
page. `options` accepts an actual `origin: {lat, lng}` and `travelmode` of
`driving`, `walking`, `bicycling`, or `transit`. The helpers return a URL or `null`
when no location is available. Open links in a new tab.

For build-time generation, run `map_urls.mjs search place.json`, or
`map_urls.mjs directions route.json` with `{"destination": PlaceRef, "options": ...}`.
Use `bun /opt/hatch/skills/artifacts/scripts/map_urls.mjs --help` for CLI usage.
