---
description: Choose and verify Meta maps, resolve places, present geographic data, and build navigation links.
builders: web, file
---

# Maps and places

Read this when an artifact shows places, maps, routes, directions, or geographic
data. Use the bundled scripts described in [Map helpers](maps-recipes.md) for URL
generation and map setup.

## Choose the rendering approach

Meta's map services render every map. Use the bundled Meta control for interactive
maps and Meta's static endpoint for map images. Do not substitute another renderer
or tile source, including vendored libraries or downloaded tile pyramids. Satellite
and aerial imagery are unavailable. Preserve the required attribution below.

| Surface and data | What to show |
|---|---|
| Live web page with trusted coordinates | An interactive vector map. If the control is unavailable or cannot render, show the place list without a map. |
| Fixed-layout export or headless rasterization with trusted coordinates | A stored static map image with the place list beside it. |
| Places without trusted coordinates | A place list with maps search links, without a map. |

A live page uses a vector map or no map; a static image is not its fallback.
Missing coordinates do not justify choosing a different renderer or inventing
location data. Static maps take `[lat, lng]`; GeoJSON and interactive map coordinates
use `[lng, lat]`. Keep latitude and longitude named and convert at the boundary.

The second row is different on a confidential VM; see
[Exports on a confidential VM](#exports-on-a-confidential-vm).

For geographic data, choose a map when location carries the meaning, such as
adjacency, distance, or clustering. Use a chart for comparisons and rankings; a
page can include both. See [Data maps](#data-maps) for supported encodings.

## Resolve places

Resolve places through Meta's places graph when it is reachable. Use web search
for candidate names and editorial context; it does not replace place resolution.
For a resolved venue, take its facts and media from the graph record, including on
later edits. Do not fill missing fields from review sites, web images, or stock
photos.

Run the bundled `local-search` and `places details` CLIs through `exec`:

- For a well-scoped request, use `local-search --search-type discovery`. Start with
  a broad query that matches the request. Add queries only for different facets,
  at most six. Put the area in `--location`, use one call per area, and add
  `--radius` when the request states or implies a distance bound.
- For a best, insider, or trending request, find candidate names with web search,
  then resolve each with `local-search --search-type known_place`.
- Fetch details in a batch with `--motivation` describing the artifact's purpose.
  Always pass `--product-source IG --product-source FB`; other sources can return
  review-site quotes and media. Bound `--num-quotes` and `--num-gallery-media` to
  what the artifact will show.
- Save output to a file and read it after the command finishes. Avoid consumers
  that close the output pipe early. Set an explicit `yield_ms` and collect the
  completed result if the call continues in the background.
- A failed details batch returns no records. Retry its IDs individually and keep
  the successful results. A place whose details remain unavailable can still
  appear with the information already obtained.

Keep lookup outcomes distinct:

| Evidence | Place handling |
|---|---|
| Graph resolves the place | Use its coordinates and record. A permanently closed place is not plotted. |
| Graph rejects a candidate you found | Do not name or plot that candidate. |
| User named the place, but resolution fails | Retain it. Plot user-supplied coordinates if present; otherwise list it with a search link. |
| Graph is unreachable | Use the information already held: plot user-supplied coordinates; list names or addresses without coordinates with search links. |

An unreachable lookup is not a rejection. Do not geocode a place name, approximate
from a locality, or invent coordinates to fill a lookup gap. Never drop a
user-named place because a lookup missed. These place-resolution rules do not
replace the source data for geographic datasets and overlays.

Save the details payload under the task's `project_dir`: `.src/research/places.json`
for file artifacts or `client/src/research/places.json` for web artifacts. Reuse it
on later edits or fetch details again. It is build-time input: never import the
payload into the page. Inline only the fields used and store images locally.

## Present place data

Store structured location facts using `PlaceRef` from the helper reference and
derive links from them. Keep display labels separate from source coordinates. Store the street
line in `address`, the city in `locality`, and the state in `region`; do not repeat
address parts. Preserve coordinate provenance where the artifact depends on it.
Never invent addresses, neighborhoods, coordinates, or drive times.

- Select useful fields for the artifact: address, hours, price level, rating and
  count, category, description, known-for items, features, booking links, or photos.
  Chat-reply limits on displaying these fields do not apply to artifacts.
- When the payload has suitable review quotes, include one per place with the
  author's handle and a link to the original. Preserve the quote; do not copy the
  author's avatar.
- Check the language of returned strings. Reword categories in the page's language;
  omit quotes whose language you cannot verify. Do not translate review quotes.
- Report ratings, counts, and hours as returned. Show scheduled hours rather than
  a build-time "open now" claim or other stale live state.
- Download place photos at build time and render stored copies. Link to reels in
  a new tab rather than embedding them; [Social embeds](social-embeds.md) applies.

## Static maps

Use the [static URL script](maps-recipes.md#static-map-url), which supplies the
required caller and attribution parameters. Fetch the image at build time and store it in
`.src/media/` for file artifacts. Where web asset storage is needed, use
`client/src/assets/` or `ctx.blobs`. Never ship the static endpoint as an image `src`.

- Center on the points' bounding box and choose a zoom that contains them; the
  static service has no fit-bounds operation.
- Request `scale: 2` for high-DPI display and set the image's width and height to
  the unscaled dimensions.
- Give the image descriptive alt text and keep the place list beside it.
- Static markers carry no text. Circles and paths use the grammar in the helper
  reference; use translucent fill alpha so the underlying map remains visible.
- If the build-time image fetch fails, show the place list without a map.
- Preserve the baked-in credit and add the notices link in [Attribution](#attribution).

## Exports on a confidential VM

A static map request carries its markers in the URL, so asking for the image
tells the service where the reader's places are. On a confidential VM that is
the one recipient the VM exists to keep this data from, and an attested
transport would not change it, so do not call the static endpoint there at all.

Draw the export's map in the guest instead, from coordinates or GeoJSON the
build already holds, with the same deterministic plotting the charts use. Fetch
no basemap, no tiles and no rendered map image, and do not substitute a
third-party renderer or tile service to make up the difference. The result is
plainer than a Meta basemap; that is the trade. Published boundary geometry is
still available, because that request carries no reader location of its own.

The rest of this file still holds. Do not invent coordinates to fill the
drawing, keep the place list beside it, and where there are no trusted
coordinates the third row still applies: a place list and no map.

## Interactive maps

Use `/opt/hatch/skills/artifacts/map-runtime/dist/hatch-maps.js` and
`hatch-maps.css`. Confirm both exist, copy them into the artifact's assets, and
reference the local copies. A build-VM path is not a served URL. Do not install
another renderer, load one from a public CDN, or import `@meta/maps` directly.
Give the map container a resolved height.

Use the [mount helpers](maps-recipes.md#interactive-map), which check capabilities
and route fatal errors to your `onUnavailable` callback. That callback shows
"Map unavailable" with a place list, or a table or chart of the values for a data
map. Boundary-data fetch failures use the same callback. Leave a map mounted
after non-fatal tile, sprite, or glyph errors.

Choose `baseStyle` by name: `light` (default), `dark`, or `grayscale`. The runtime
owns style URLs, caller identifiers, and viewer locale. Do not pass a style URL or
set `locale` or `pv`. Do not add custom headers to map-resource requests: the map
servers do not support the resulting CORS preflight.

Keep overlays beneath basemap labels and the control's pin layers above overlays.
The runtime supplies these defaults. If authoring a symbol layer, keep icons while
thinning colliding labels with `text-allow-overlap: false` and `text-optional: true`;
place it last so its labels take priority over basemap labels.

For a map with a place list:

- Number pins to match rows using `marker` for lists of a few dozen places. Escape
  any source text inserted as HTML. Use the default circle layer for larger lists
  and overlays for thousands of points.
- Connect `onSelectPlace` to row highlighting and scrolling, and row clicks to
  `selectPlace`. Clear the selection when the callback receives `null`.

Read the [interactive helpers](maps-recipes.md#interactive-map) for these APIs.

## Data maps

Use GeoJSON sources with layer specifications through `overlays` on the vector
map, built by the [data overlay helpers](maps-recipes.md#data-overlays). The
static tier supports only markers, circles, and paths; choose from those
capabilities for fixed-layout maps.

| Encoding | Layer type | Data |
|---|---|---|
| Choropleth | `fill` | Rates or ratios for enumeration units, with a meaningful value across the represented area |
| Proportional or graduated symbols | `circle` | Counts or totals; scale symbol area with the value |
| Heatmap | `heatmap` | Density of many points |
| Dot density | Small `circle` symbols | One dot per item or per stated quantity |
| Category points | `circle` with a `match` expression | Unordered classes |
| Outlines and routes | `line` | Boundaries and paths |

Do not shade raw counts as a choropleth or treat absence of a phenomenon as a low
value. Use point encodings for phenomena that exist only at specific locations.
Scale proportional symbols with `r = k * sqrt(value)` and show two or three
reference sizes in the legend. Graduated symbols may group values into classes.
A dot-density legend must say whether a dot represents one item or a quantity.

For choropleths, use the [choropleth helper](maps-recipes.md#choropleth), which
fetches the published geometry, joins the data onto its features, and mounts the
result. Join countries on `iso_2` or `iso_3` and US states on `postal_code` or
`iso_3166`. Keep missing values as `null`, leave those regions unpainted, and
explain them in the legend.

Use a `grayscale` basemap under data overlays. Choose a sequential palette for
ordered values, a diverging palette around a meaningful midpoint, or a categorical
palette for unordered classes. Derive hues from the page's palette while preserving
legible distinctions; choose a nearby hue if the page accent cannot support the
required range. Do not use rainbow ramps. See [Charts](charts.md) for shared
encoding guidance.

Give overlays that carry values a `tooltip` showing the relevant values, and say
a region has no data in the artifact's own language rather than leaving the
helper's English default. A data map that cannot render shows its values as a
table or chart, not a place list.

## Language and political view

Political view controls disputed borders. Do not infer it from language or choose
a default.

| Rendering | Parameters |
|---|---|
| Interactive | Leave `locale` and `pv` unset so the runtime resolves them per reader. |
| Static | Pass `language` (IETF tag) and `region` (political-view ccTLD) unchanged only when supplied by the task or context; omit missing values. |

## Navigation links

Use Google Maps only for the outbound search and directions handoff, with neutral
labels such as "Open in maps" or "Directions". Use the
[navigation builders](maps-recipes.md#navigation-links).

- Show a resolved place's facts in the artifact instead of a maps search link.
  Unresolved or name-only places retain that link. Directions links remain useful
  for navigation from the reader's current location.
- Prefer a name plus street address or locality; use coordinates when a name has
  no locating detail. Deduplicate address parts.
- If a name matches multiple listings, accept the chooser. Query the street address
  alone only when the named query would lead to the wrong place.
- Pass a real coordinate pair for `origin`, or omit it so the maps app can request
  the device location. Never pass a label such as "Your location".
- Keep coordinate commas literal in generated URLs and encode text queries.
- Open outbound links with `target="_blank" rel="noopener"` so the destination
  opens outside the artifact's frame.

## Attribution

Leave the interactive control's attribution visible and intact. Do not hide,
cover, shrink, or replace it.

For static maps, keep `show_attribution=1` and leave the baked-in credit uncropped.
Render this notices link beneath the image:

```html
<a href="https://www.facebook.com/maps/attribution_terms"
   target="_blank" rel="noopener">© OpenStreetMap contributors, Map Data Legal Notices</a>
```

A map drawn in the guest has no baked-in credit to keep, so render that same
notices link beneath it whenever it draws published boundary geometry. A drawing
made only from the build's own coordinates credits nothing.

## Verify

- Check the rendered artifact: correct places and coordinate order, readable data,
  descriptive image alt text, visible attribution, and useful content without a map.
- Confirm the surface uses the required map approach. For interactive maps, check
  that both control files load, the map has height, and the probe and fatal-error
  handler use the same replacement. Exercise the available viewing surfaces.
- Check that no alternative renderer or tile source is shipped. Tile, style, and
  glyph requests use `external.xx.fbcdn.net`; select basemaps by name.
- For static maps, inspect the stored image, required caller parameters, task-supplied
  locale values, uncropped credit, and notices link. No remote image `src`.
- On a confidential VM, confirm the export drew its own map and that the build
  made no static-endpoint, tile, or basemap request at all.
- Match resolved-place facts, quotes, and photos to the retained payload. Check
  search links against the resolution rules rather than rejecting every search URL.
- Check data joins, missing values, encoding, palette, legends, tooltips, layer
  ordering, and the table or chart shown when a data map cannot render.
- Exercise map/list selection in both directions, including clearing it.
- Open a navigation link and verify its destination, new tab, query encoding,
  coordinate commas, and omitted or coordinate-backed origin.
