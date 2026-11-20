---
description: Use the bundled map helpers for URL generation, interactive maps, and data overlays.
---

# Map helpers

- Follow [Maps and places](maps.md) for the rendering and sourcing requirements. The implementation lives in `/opt/muse/assets/artifacts/scripts/map_helpers.mjs`. Use it instead of copying or rewriting URL and map-setup code.

## Place lookups

- Use the existing `/opt/hatch/bin/local-search` and `/opt/hatch/bin/places` CLIs, with the flags [Resolve places](maps.md#resolve-places) requires.

- Save details where [Resolve places](maps.md#resolve-places) says, writing a leading `~/` as `$JARVIS_HOME/`.

- Redirect stdout to a file and wait for the command to complete before reading it. An explicit `yield_ms: 60000` helps, and collect the background result if the command outlives it.

- When parsing redirected `places details` output, skip the reserved top-level `_meta` entry as [Resolve places](maps.md#resolve-places) requires.

## Location data

- A `PlaceRef` has a required `label` and optional `venue`, `address`, `locality`, `region`, `country`, `lat`, `lng` and `source`. Coordinates are named numbers and address fields are strings.

- Store facts in a `PlaceRef` and derive provider URLs from it with the helpers.

## Static map URL

- Run the URL script with a JSON file of options:

```bash
bun /opt/muse/assets/artifacts/scripts/map_urls.mjs static map-options.json
```

- `center: [lat, lng]` and `zoom` are required. `width`, `height`, `scale`, `format`, `theme`, the task-supplied `language` and `region`, and `markers: [{position: [lat, lng], scale: 1 | 2 | 3}]` are optional.

- The script supplies the caller and attribution parameters and prints the URL. Fetch the image at build time and render the stored copy.

- For circles and paths, import `buildStaticMapUrl`, then append one `circles` or `paths[]` parameter per shape.

- The pipe-delimited grammar starts with any of `color:0xRRGGBBAA`, `fillcolor:0xRRGGBBAA`, `weight:N`, `dash:N` or `gap:N`, followed by coordinates. A circle ends with a radius such as `500m`, `1k`, `1mi` or `2000ft`, and a path lists its points. Use a translucent fill alpha.

## Interactive map

- Copy all three files from `/opt/muse/assets/artifacts/map-runtime/dist/` into the artifact's assets and load them as classic scripts. A static page may not load a module, so use the generated `map_helpers.js` there, not the `.mjs`:

```html
<link rel="stylesheet" href="assets/hatch-maps.css">
<script src="assets/hatch-maps.js"></script>
<script src="assets/map_helpers.js"></script>
```

```js
const map = MapHelpers.mountMap(el, { places, baseStyle: 'light' }, showPlaceList);
```

- In a TypeScript Space, copy `map_helpers.mjs` into `client/src/` and import from it instead. The names below are the same either way: reach them through `MapHelpers` on a static page and import them in a Space.

- `mountMap` checks capabilities and connects fatal errors to the required `onUnavailable` callback, its third argument. It returns the control's map handle or `null`.

- Supply that callback yourself, showing the place list or the data as a table or chart. The helper creates no page UI.

- For a short place list, call `mountPlaceListMap(el, {places, rows}, showPlaceList)`, where `rows` is an array of DOM elements in the same order as `places`. The helper numbers pins, keeps clicks and highlights in sync, scrolls to the selected row and clears the selection.

- Style `.pin`, `.pin--on` and `.map-selected`, and rename the last one with `selectedClass`. Mount once per container and list.

## Data overlays

- `heatmapOverlay(id, geoJSON, colorStops, radius)` returns an overlay for `mountMap`. `colorStops` alternates density thresholds and colors, so include transparency at zero and derive the colors from the page. `radius` defaults to 20.

- Pass the heatmap in `overlays`, choose `baseStyle: 'grayscale'` and use a chart or table callback.

- Other encodings use the control's normal `overlays` and `tooltip` options. Overlays stay below the basemap labels, and the control's pins stay above them.

### Choropleth

- Call `mountChoropleth(el, options, showValueTable)` with these required options:
  - `boundaryUrl` is one of the published geometry URLs below.
  - `rows` holds the source records with region identifiers and rates.
  - `featureKey`, `rowKey` and `valueKey` name the geometry join key, the row join key and the rate field.
  - `colorStops` alternates rate thresholds and colors from the page palette.
  - `outlineColor` is an outline color from the same palette.

- The helper checks capabilities, fetches the geometry, joins the values and mounts the map with a grayscale basemap, value tooltips and the same callback for a fetch or map failure.

- Missing values stay `null` and are left out of the fill, while zero stays visible. Add a legend that explains missing values and the scale.

- The hover text belongs to the page, so write it in the artifact's language. The default line is `name: value`. Pass `missingLabel` for the words a region with no value shows, or pass `tooltip`, a function of the feature, to replace the line entirely.

- The published geometry:
  - Countries use `https://external.xx.fbcdn.net/maps/static/boundaries/v1/countries.json` and join on `iso_2` or `iso_3`.
  - US states use `https://external.xx.fbcdn.net/maps/static/boundaries/v1/us_states.json` and join on `postal_cod` or `iso_3166`.

## Navigation links

- Call `mapsSearchUrl(place)` or `mapsDirectionsUrl(destination, options)` in the page. `options` accepts a real `origin: {lat, lng}` and a `travelmode` of `driving`, `walking`, `bicycling` or `transit`.

- The helpers return a URL, or `null` when no location is available. Open the links in a new tab.

- For build-time generation, run `map_urls.mjs search place.json`, or `map_urls.mjs directions route.json` with `{"destination": PlaceRef, "options": ...}`. Run `bun /opt/muse/assets/artifacts/scripts/map_urls.mjs --help` for the CLI usage.
