---
description: Choose and verify Meta maps, resolve places, present geographic data, and build navigation links.
builders: web, file
---

# Maps and places

- Read this when an artifact shows places, maps, routes, directions or geographic data. Use the bundled scripts described in [Map helpers](maps-recipes.md) for URL generation and map setup.

## Choose the rendering approach

- Meta's map services render every map. Use the bundled Meta control for interactive maps and Meta's static endpoint for map images.

- Never substitute another renderer or tile source, including vendored libraries and downloaded tile pyramids. Satellite and aerial imagery are unavailable. Keep the required attribution described below.

- Pick what to show from the surface and the data:
  - A live web page with trusted coordinates shows an interactive vector map. If the control is unavailable or cannot render, it shows the place list without a map.
  - A fixed-layout export or headless rasterization with trusted coordinates shows a stored static map image with the place list beside it. On a confidential VM this case changes, as [Exports on a confidential VM](#exports-on-a-confidential-vm) describes.
  - Places without trusted coordinates get a place list with maps search links and no map.

- A live page uses a vector map or no map, so a static image is never its fallback. Missing coordinates never justify a different renderer or invented location data.

- Static maps take `[lat, lng]` and GeoJSON `[lng, lat]`; the interactive control takes `{lat, lng}`. Keep latitude and longitude named and convert at the boundary.

- For geographic data, choose a map when location carries the meaning, such as adjacency, distance or clustering. Use a chart for comparisons and rankings, and include both when that helps. [Data maps](#data-maps) lists the supported encodings.

## Resolve places

- Resolve places through Meta's places graph when it is reachable. Web search finds candidate names and editorial context but does not replace place resolution.

- For a resolved venue, take its facts and media from the graph record, including on later edits. Never fill missing fields from review sites, web images or stock photos.

- Run the bundled `local-search` and `places details` CLIs through `muse.exec`:
  - For a well-scoped request, use `local-search --search-type discovery`. Start with a broad query that matches the request and add queries only for different facets, at most six. Put the area in `--location`, use one call per area, and add `--radius` when the request states or implies a distance bound.
  - For a "best", insider or trending request, find candidate names with web search, then resolve each with `local-search --search-type known_place`.
  - Fetch details in a batch with `--motivation` describing the artifact's purpose. Always pass `--product-source IG --product-source FB`, because other sources can return review-site quotes and media. Bound `--num-quotes` and `--num-gallery-media` to what the artifact will show.
  - Save the output to a file and read it after the command finishes. Avoid consumers that close the output pipe early, set an explicit `yield_ms` and collect the result if the call continues in the background.
  - Saved or piped details output can retain the reserved top-level `_meta` privacy entry. Filter it out before building a place list or map, for example with `Object.entries(payload).filter(([id]) => id !== '_meta')`. Runtime readback can hide `_meta` from the agent without rewriting the saved file.
  - A failed details batch returns no records. Retry its IDs one at a time and keep the successful results. A place whose details stay unavailable can still appear with the information already obtained.

- Keep the lookup outcomes distinct:
  - When the graph resolves the place, use its coordinates and record. A permanently closed place is not plotted.
  - When the graph rejects a candidate you found, do not name or plot that candidate.
  - When the user named the place but resolution fails, keep it. Plot coordinates the user supplied, or list it with a search link.
  - When the graph is unreachable, use the information already held. Plot user-supplied coordinates and list names or addresses without coordinates with search links.

- An unreachable lookup is not a rejection. Never geocode a place name, approximate from a locality or invent coordinates to fill a lookup gap, and never drop a user-named place because a lookup missed.

- These place-resolution rules do not replace the source data of geographic datasets and overlays.

- Save the details payload under the task's `project_dir`, as `.src/research/places.json` for a file artifact or `client/src/research/places.json` for a fullstack web artifact. A static web artifact has no `project_dir`, so save no payload file and inline its fields into `index.html`. Reuse it on later edits or fetch the details again.

- The payload is build-time input, so never import it into the page. Inline only the fields you use and store images locally.

## Present place data

- Store structured location facts as a `PlaceRef` from the helper reference and derive links from it. Keep display labels separate from source coordinates.

- Store the street line in `address`, the city in `locality` and the state in `region`, without repeating address parts. Keep coordinate provenance where the artifact depends on it. Never invent addresses, neighborhoods, coordinates or drive times.

- Select the fields useful to the artifact: address, hours, price level, rating and count, category, description, known-for items, features, booking links or photos. Limits on showing these fields in chat replies do not apply to artifacts.

- When the payload has suitable review quotes, include one per place with the author's handle and a link to the original. Keep the quote intact and do not copy the author's avatar.

- Check the language of returned strings. Reword categories in the page's language, and omit quotes whose language you cannot verify. Never translate review quotes.

- Report ratings, counts and hours as returned. Show scheduled hours rather than a build-time "open now" claim or other stale live state.

- Download place photos at build time and render the stored copies. Link to reels in a new tab rather than embedding them, following [Social embeds](social-embeds.md).

## Static maps

- Use the [static URL script](maps-recipes.md#static-map-url), which supplies the required caller and attribution parameters.

- Fetch the image at build time and store it, in `project_dir/.src/media/` for a file artifact, in `assets/` for a static web artifact, or in `client/src/assets/` or `ctx.blobs` for a fullstack web artifact. Never ship the static endpoint as an image `src`.

- Center on the points' bounding box and choose a zoom that contains them, since the static service has no fit-bounds operation.

- Request `scale: 2` for high-DPI displays and set the image's width and height to the unscaled dimensions.

- Give the image descriptive alt text and keep the place list beside it.

- Static markers carry no text. Circles and paths use the grammar in the helper reference, with a translucent fill alpha so the map stays visible underneath.

- If the build-time image fetch fails, show the place list without a map.

- Keep the baked-in credit and add the notices link described in [Attribution](#attribution).

## Exports on a confidential VM

- A static map request carries its markers in the URL, so asking for the image tells the service where the reader's places are. On a confidential VM that service is the one recipient the VM exists to keep this data from, and an attested transport would not change that, so never call the static endpoint there.

- Draw the export's map in the guest instead, from coordinates or GeoJSON the build already holds, with the same deterministic plotting the charts use. Fetch no basemap, no tiles and no rendered map image, and do not substitute a third-party renderer or tile service.

- The result is plainer than a Meta basemap, and that is the trade. Published boundary geometry is still available, because that request carries no reader location.

- The rest of this file still holds. Never invent coordinates to fill the drawing, keep the place list beside it, and show only a place list without a map when there are no trusted coordinates.

## Interactive maps

- Use `/opt/muse/assets/artifacts/map-runtime/dist/hatch-maps.js` and `hatch-maps.css`. Confirm both exist, copy them into the artifact's assets and reference the local copies, because a path on the build VM is not a served URL.

- Never install another renderer, load one from a public CDN or import `@meta/maps` directly. Give the map container a resolved height.

- Use the [mount helpers](maps-recipes.md#interactive-map), which check capabilities and route fatal errors to your `onUnavailable` callback. That callback shows "Map unavailable" with a place list, or a table or chart of the values for a data map.

- Boundary-data fetch failures use the same callback. Leave a map mounted after non-fatal tile, sprite or glyph errors.

- Choose `baseStyle` by name: `light` (the default), `dark` or `grayscale`. The runtime owns style URLs, caller identifiers and the viewer's locale, so never pass a style URL or set `locale` or `pv`.

- Never add custom headers to map-resource requests, because the map servers do not support the resulting CORS preflight.

- Keep overlays beneath the basemap labels and the control's pin layers above the overlays, which the runtime does by default.

- When authoring a symbol layer, keep its icons while thinning colliding labels with `text-allow-overlap: false` and `text-optional: true`. Place it last so its labels take priority over the basemap labels.

- For a map with a place list:
  - Number pins to match the rows with `marker` for lists of up to a few dozen places, and escape any source text inserted as HTML. Use the default circle layer for larger lists and overlays for thousands of points.
  - Connect `onSelectPlace` to row highlighting and scrolling, and row clicks to `selectPlace`. Clear the selection when the callback receives `null`.
  - The [interactive helpers](maps-recipes.md#interactive-map) document these APIs.

## Data maps

- Build data maps from GeoJSON sources with layer specifications passed through `overlays` on the vector map, using the [data overlay helpers](maps-recipes.md#data-overlays). The static tier supports only markers, circles and paths, so fixed-layout maps choose from those.

- Match the encoding to the data:
  - A choropleth (`fill` layer) shows rates or ratios for enumeration units, where the value is meaningful across the whole area.
  - Proportional or graduated symbols (`circle` layer) show counts or totals, with symbol area scaled to the value.
  - A heatmap (`heatmap` layer) shows the density of many points.
  - Dot density (small `circle` symbols) shows one dot per item or per stated quantity.
  - Category points (`circle` layer with a `match` expression) show unordered classes.
  - Outlines and routes (`line` layer) show boundaries and paths.

- Never shade raw counts as a choropleth or treat the absence of a phenomenon as a low value. Use point encodings for phenomena that exist only at specific locations.

- Scale proportional symbols with `r = k * sqrt(value)` and show two or three reference sizes in the legend. Graduated symbols may group values into classes. A dot-density legend says whether one dot is one item or a quantity.

- For a choropleth, use the [choropleth helper](maps-recipes.md#choropleth), which fetches the published geometry, joins the data onto its features and mounts the result. Join countries on `iso_2` or `iso_3` and US states on `postal_cod` or `iso_3166`.

- Keep missing values as `null`, leave those regions unpainted and explain them in the legend.

- Use a `grayscale` basemap under data overlays. Choose a sequential palette for ordered values, a diverging palette around a meaningful midpoint, or a categorical palette for unordered classes.

- Derive hues from the page's palette while keeping distinctions legible, and choose a nearby hue when the page accent cannot cover the range. Never use rainbow ramps. [Charts](charts.md) holds the shared encoding guidance.

- Give overlays that carry values a `tooltip` showing those values. Say a region has no data in the artifact's own language rather than leaving the helper's English default.

- A data map that cannot render shows its values as a table or chart, not a place list.

## Language and political view

- Political view controls how disputed borders are drawn. Never infer it from language or choose a default.

- On an interactive map, leave `locale` and `pv` unset so the runtime resolves them for each reader.

- On a static map, pass `language` (an IETF tag) and `region` (a political-view ccTLD) unchanged, and only when the task or context supplies them. Omit any value that is missing.

## Navigation links

- Use Google Maps only for the outbound search and directions handoff, with neutral labels such as "Open in maps" or "Directions". Use the [navigation builders](maps-recipes.md#navigation-links).

- Show a resolved place's facts in the artifact instead of a maps search link. Unresolved or name-only places keep the search link. Directions links stay useful for navigating from the reader's current location.

- Prefer a name plus a street address or locality, and use coordinates when a name has no locating detail. Remove duplicated address parts.

- If a name matches several listings, accept the chooser. Query the street address alone only when the named query would lead to the wrong place.

- Pass a real coordinate pair as `origin`, or omit it so the maps app can request the device location. Never pass a label such as "Your location".

- Keep coordinate commas literal in generated URLs and encode text queries.

- Open outbound links with `target="_blank" rel="noopener"` so the destination opens outside the artifact's frame.

## Attribution

- Leave the interactive control's attribution visible and intact. Never hide, cover, shrink or replace it.

- For static maps, keep `show_attribution=1` and leave the baked-in credit uncropped. Render this notices link beneath the image:

```html
<a href="https://www.facebook.com/maps/attribution_terms"
   target="_blank" rel="noopener">© OpenStreetMap contributors, Map Data Legal Notices</a>
```

- A map drawn in the guest has no baked-in credit to keep, so render the same notices link beneath it whenever it draws published boundary geometry. A drawing made only from the build's own coordinates credits nothing.

## Verify

- Check the rendered artifact for the correct places and coordinate order, readable data, descriptive image alt text, visible attribution and useful content without a map.

- Confirm the surface uses the required map approach. For interactive maps, check that both control files load, the map has a height, and the capability probe and fatal-error handler use the same replacement. Exercise the available viewing surfaces.

- Check that no alternative renderer or tile source ships. Tile, style and glyph requests go to `external.xx.fbcdn.net`, and basemaps are selected by name.

- For static maps, inspect the stored image, the required caller parameters, the task-supplied locale values, the uncropped credit and the notices link, and confirm no image `src` is remote.

- On a confidential VM, confirm the export drew its own map and the build made no static-endpoint, tile or basemap request at all.

- Match resolved-place facts, quotes and photos to the retained payload. Check search links against the resolution rules rather than rejecting every search URL.

- Check data joins, missing values, encoding, palette, legends, tooltips, layer order, and the table or chart shown when a data map cannot render.

- Exercise map and list selection in both directions, including clearing it.

- Open a navigation link and verify its destination, the new tab, query encoding, literal coordinate commas, and an origin that is omitted or backed by coordinates.
