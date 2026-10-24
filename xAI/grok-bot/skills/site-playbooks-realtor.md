---
name: site-playbooks-realtor
description: 'Realtor.com site playbook: home listings or school ratings.'
---
# Site playbook: Realtor.com

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

Jobs in this file: Realtor.com search and listing extraction; Realtor.com school rating lookup.

## Realtor.com search and listing extraction

### When to use

The user wants Realtor.com listings for an area (city, ZIP, neighborhood, or map bounds) with filters, or the full record behind a `/realestateandhomes-detail/...` link. The parent needs the location text, listing type, and filters. The user gets a table of address, price, beds, baths, sqft, lot, year built, type, days on market, MLS number, photo, and URL, plus the total count for the criteria. Read only.

### Fastest path

Two steps. Resolve the location with `curl` against an open geocoder, then `browser_navigate` to the filtered URL and read `__NEXT_DATA__`. The main site is behind Kasada, which needs a JS runtime; in earlier testing a plain fetch of any `www.realtor.com` search or detail URL returned HTTP 429 with the challenge body, so listing data never comes through `curl`.

```bash
curl -fsS 'https://parser-external.geo.moveaws.com/suggest?input=Austin%2C%20TX&client_id=rdc-x'
```

Response rows are `.autocomplete[i]` with `area_type` (`city | neighborhood | postal_code | county | school | university | address | street`), `slug_id` (`Austin_TX`, `94110`, `Downtown-Austin_Austin_TX`), `geo_id`, `centroid.{lon,lat}`, `state_code`, `city`, `postal_code`, `counties[]`. Take the highest `_score` row whose `area_type` matches the intent. Same names across states are common (`Brooklyn Heights` gives OH and MO; the NYC neighborhood is `Brooklyn-Heights_Brooklyn_NY`), so when no state was given report the top 3 as candidates.

Search URL grammar. Filters are path segments; Realtor.com canonicalizes them alphabetically and 301s other orders, so emit them alphabetically with `sort-` then `pg-` last.

```
https://www.realtor.com/{listing-base}/{slug_id}/{filter-1}/{filter-2}/.../{sort-segment}/{pg-segment}
```

| Listing type | Base |
|---|---|
| For sale | `realestateandhomes-search` |
| For rent | `apartments` (pets and furnished filters exist only here) |
| Recently sold / New construction / Foreclosures / Pending | `realestateandhomes-search/{slug_id}/show-recently-sold`, `/show-newconstruction`, `/show-foreclosure`, `/show-pending` |

| Filter | Segment |
|---|---|
| Price | `price-{min}-{max}`, `na` for an open bound; drop the segment when both are unset |
| Beds / baths (min) | `beds-{n}`, `baths-{n}` or `baths-{n.5}` |
| Sqft / lot | `sqft-{min}-{max}`, `lotsqft-{min}-{max}` or `lot-{acres}-acres` |
| Year built | `yearbuilt-{min}-{max}` |
| Days on market | `dom-{days}` with `1`, `7`, `14`, `30`, `90` |
| HOA max | `hoa-{max}` monthly |
| Property type | `type-{slug}` with `single-family-home`, `condo`, `townhouse`, `multi-family-home`, `mobile`, `land`, `farms-ranches`, `coop` |
| Features | `feat-pool`, `feat-garage` or `garage-{n}`, `feat-basement`, `feat-waterfront`, `feat-central-air`, `feat-fireplace`, `feat-view`, `feat-hardwood-floors`, `feat-updated-kitchen`, `feat-single-story` |
| Rentals | `feat-cats`, `feat-dogs`, `feat-no-pets`, `feat-furnished` |
| Other | `reduced`, `open-house` (plus `dt-{YYYY-MM-DD}`), `tour`, `schools-{elementary\|middle\|high}-{1..10}` |
| Sort | `sort-{newest\|price-h-l\|price-l-h\|sqft-h-l\|lot-h-l\|photo-h-l\|reduced-date}` |
| Page | `pg-{N}`, 1 indexed |
| Map bounds | `?bbox=west,south,east,north` query param |

Worked example. `https://www.realtor.com/realestateandhomes-search/Austin_TX/baths-2/beds-3/price-400000-800000/type-single-family-home/sort-newest`

Single address. The suggest call with `&area_types=address&limit=5` returns a top row with `line`, `postal_code`, and `prop_status` (`for_rent` or `off_market`) and a null `slug_id`. The snippet takes it from there with the listing base that matches the intent (`show-recently-sold` for an `off_market` address); `address_not_listed` sends a valuation job to the sources in When blocked.

### Dispatch snippet

```
Find Realtor.com <for sale|for rent|recently sold> listings in <location> with <filters>. Read only, never click Contact Agent, Save, Schedule Tour, Get Pre-Approved, or Sign In.
For a city, ZIP, or area, in the box shell run curl -fsS 'https://parser-external.geo.moveaws.com/suggest?input=<url-encoded location>&client_id=rdc-x' and take autocomplete[0].slug_id (match area_type to the input; report the top 3 if the state is unclear).
Open https://www.realtor.com/<realestateandhomes-search|apartments>/<slug_id>/<alphabetical filter segments such as baths-2/beds-3/price-<min>-<max>/type-single-family-home>/sort-newest and wait 3 s.
Run the page script async (page) => { const p = JSON.parse(await page.locator('#__NEXT_DATA__').textContent({ timeout: 5000 })).props.pageProps; return p.searchResults?.home_search ?? p.propertyDetails; } and read total and results[].
Per result report property_id, location.address (line, city, state_code, postal_code), list_price (or list_price_min and _max), description.beds, baths_consolidated, sqft, lot_sqft, year_built, type, days_on_market, source.listing_id, primary_photo.href, and https://www.realtor.com/realestateandhomes-detail/<permalink>.
For a street address, skip slug_id: run the suggest call with &area_types=address&limit=5, open the search URL for the top row's postal_code (show-recently-sold if prop_status is off_market), open the detail URL of the result whose location.address.line matches and run the same page script for propertyDetails; no match is address_not_listed.
If a Kasada challenge (429, KPSDK) does not clear after 3 s, retry that URL once with a full wait, then report kasada_block_persistent with the URL. If a captcha, sign-in or password, 2FA, or payment wall appears, stop and report the URL. Take one screenshot.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

- `props.pageProps.searchResults.home_search.results[]` is the listing array, `.total` the region total, `.count` this page, `.search_title` the query text. `props.pageProps.geo` is the resolved geo block. Page size is `results.length` (42 for sale, 25 rentals). A detail page has the same blob at `props.pageProps.propertyDetails` and `props.pageProps.initialReduxState.propertyDetails`.
- Per listing. `property_id` (`M...` off MLS or numeric), `listing_id`, `location.address.{line, city, state_code, postal_code, coordinate.{lat, lon}}`, `list_price` or `list_price_min` / `list_price_max` for ranges, `price_reduced_amount`, `last_price_change_amount`, `last_price_change_date`, `description.{beds, baths_full, baths_half, baths_consolidated, sqft, lot_sqft, year_built, type, sub_type, garage, stories, text}`, `flags.{is_new_listing, is_new_construction, is_pending, is_contingent, is_foreclosure, is_price_reduced, is_coming_soon}`, `primary_photo.href`, `photos[].href`, `photo_count`, `list_date`, `last_update_date`, `days_on_market`, `hoa.fee`, `open_houses[].{start_date, end_date, time_zone, methods}` (`methods` may include `VIRTUAL`), `virtual_tours[].href`, `branding[].{name, phone, email, type}`, `source.id`, `source.listing_id` (the public MLS number), `schools[].{name, level, rating, distance_in_miles, district_name}` (GreatSchools 1 to 10), `tax_history[]`, `permalink`.
- The canonical URL is `https://www.realtor.com/realestateandhomes-detail/{permalink}`. `description.text` is only on the detail page.

### When blocked

- Kasada tells. HTTP 429, `KP_UIDz` and `KP_UIDz-ssn` cookies, `X-Kpsdk-Ct` / `X-Kpsdk-R` / `X-Kpsdk-Im` headers, `window.KPSDK={};` in the body, and a challenge script at `/{uuid}/{uuid}/ips.js`. In earlier testing a plain or proxy only session still hit it and a stealth residential session was needed.
- The box browser hits it often, so plan the chain below before the first dispatch.
- `robots.txt` states scraping is unauthorized without permission from Move Sales, Inc. Mention this to the user when the request is high volume or commercial.
- `api.realtor.com/graphql` and `api-prod.realtor.com/graphql` are partner gated (GET 500, POST needs a signed client id). Do not probe them.
- If the Kasada challenge does not clear after about 3 seconds, the snippet retries once with a full wait, then reports `kasada_block_persistent` with the URL. If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.
- After `kasada_block_persistent` the parent owns the next step, in this order, and does not dispatch the same URL again. When the Task lists several locations, the remaining slugs once each, in their own dispatches; one 429 does not end the Realtor pass. Then the alternates below, in the same turn, without another Realtor round.
- Redfin serves listing cards to a plain fetch: `https://www.redfin.com/zipcode/<zip>` with the geocoder row's `postal_code`, or a `/city/<id>/<ST>/<City>` page when known, with filters as one path segment such as `/filter/max-price=900k,min-beds=2,property-type=condo`. Cards are `.bp-Homecard` (the `title` attribute is the address) with price, beds, baths, sqft, and a `/home/<id>` link. After a few fetches it answers HTTP 202 with `x-amzn-waf-action: challenge` and an empty body, so one shell fetch at most; on that tell or any empty body, open the same URL in the browser and read the cards. Read only.
- Zillow answers a plain fetch with a PerimeterX 403 ("Access to this page has been denied", `px-captcha`). Do not use it from the shell.
- For a valuation or comps job when no listing site is reachable, the county assessor or GIS portal for the parcel is a public source with no sign-in: search by address or parcel number, read assessed value, last sale date and price, lot and building size, and name the county and the portal in the report. A public MLS mirror varies by market; use one only when the Task or the user names it.

## Realtor.com school rating lookup

### When to use

The user names a school with a city and state, pastes a `realtor.com/local/schools/...` link, or gives a property address and wants the assigned elementary, middle, and high schools. The parent needs the school name plus city and state, or the address. The user gets the GreatSchools rating (1 to 10), parent review count and average, grades served, enrollment, student teacher ratio, district, address, NCES code, and canonical URL. Read only.

### Fastest path

Two `curl` calls in the box shell. School detail pages are not behind Kasada in earlier testing (7 schools across states and funding types), so a plain GET returns the full `__NEXT_DATA__` blob.

Resolve the name.

```
GET https://parser-external.geo.moveaws.com/suggest
    ?input=<urlenc "<name> <city> <state>">
    &client_id=rdc-search-default
    &area_types=school
    &limit=10
```

Take the highest scoring `autocomplete[i]` with `area_type === "school"`. It carries `slug_id`, `school_id`, `school`, `line`, `city`, `postal_code`, `state_code`, `centroid.{lat,lon}`, `has_catchment`. If empty, retry once without `area_types`; if still empty report `school_not_found`. Accepted params are only `input`, `client_id`, `area_types`, `limit`, `include`; others fail with a `whitelistValidation` 400.

Fetch the page. `{slug_id}` is `{Name-With-Dashes}-{schoolId}`, and `schoolId` is Realtor's 9 or 10 digit id, not the NCES or GreatSchools id.

```bash
curl -fsS 'https://www.realtor.com/local/schools/Sylvia-Mendez-Elementary-078571861' -o /tmp/school.html
python3 -c "import re,json;h=open('/tmp/school.html').read();print(json.dumps(json.loads(re.search(r'<script id=\"__NEXT_DATA__\" type=\"application/json\">(.*?)</script>',h,re.S).group(1))['props']['pageProps']['school']))"
```

A good response is about 250 to 430 KB and contains `<script id="__NEXT_DATA__"`. A body under 2 KB with `KPSDK` or "reference ID" is the Kasada interstitial (see When blocked).

Property address, path A. Point in polygon with `curl` only.

1. `suggest?input=<urlenc address>&client_id=rdc-search-default&area_types=address&limit=5`; take `centroid.{lat,lon}` and `mpr_id` from the top row.
2. For each level, `suggest?input=<urlenc "elementary <city>">&client_id=rdc-search-default&area_types=school&limit=20` (then `middle <city>` and `high <city>`). Keep rows with `has_catchment: true` and the address's `state_code`.
3. Fetch each candidate's school page and read `school.boundary` (GeoJSON `MultiPolygon`). Test the centroid with Shapely `Point(lon, lat).within(shape(boundary))` if installed, otherwise a plain ray casting check in python3. About 5 to 10 fetches per address.

### Dispatch snippet

```
Look up <school name>, <city>, <state> on Realtor.com. Read only.
In the box shell run curl -fsS 'https://parser-external.geo.moveaws.com/suggest?input=<url-encoded "name city state">&client_id=rdc-search-default&area_types=school&limit=10' and take the top autocomplete row with area_type "school"; if none, retry without area_types, then report school_not_found.
Run curl -fsS 'https://www.realtor.com/local/schools/<slug_id>' -o /tmp/school.html and parse the <script id="__NEXT_DATA__"> JSON with python3; the data is props.pageProps.school.
Report rating, parent_rating, review_count, grades, education_levels, student_count, student_teacher_ratio, district.name, location (street, city, state, postal_code), nces_code, greatschools_id, funding_type, and the URL. For private schools rating is null; say private_school_not_rated.
If the body is under 2 KB and contains KPSDK, retry once, then open the URL in the browser and run the page script async (page) => JSON.parse(await page.locator('#__NEXT_DATA__').textContent({ timeout: 5000 })).props.pageProps.school. If a captcha, sign-in, or payment wall appears, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

| Output | Path under `props.pageProps.school` |
|---|---|
| great_schools_rating | `rating` (1 to 10, null for private schools) |
| parent_reviews.average / .count | `parent_rating` (1 to 5, null when `review_count === 0`) / `review_count` |
| grades_served | `grades` (strings like `["K","1",...,"5"]`, `"PK"` for preK; render `K-5` only when contiguous) |
| education_levels | `education_levels` (`["elementary"]`, or all three for K-12) |
| enrollment | `student_count` |
| student_teacher_ratio | `student_teacher_ratio` (float `16.3`, null for private) |
| district | `district.name` (`district.id` is Realtor's 11 char id, not NCES) |
| address | `location.{street, city, state, postal_code}` |
| nces_id | `nces_code` (12 digits, or 8 on older entries; keep as is) |
| great_schools_id | `greatschools_id` (7 digits, never used in URLs) |
| funding_type | `funding_type` (`public`, `private`, `charter`) |
| url | `https://www.realtor.com/local/schools/{slug_id}` |
| catchment_polygon | `boundary` (GeoJSON MultiPolygon, public schools with `has_catchment: true`) |

Private schools have null `rating`, `student_teacher_ratio`, `district.name`, and `boundary`; report `null_rating_reason: private_school_not_rated` rather than failing. `school.assigned` is always null on the school page. `props.pageProps.nearbySchools` is nearby places metadata, not schools.

### When blocked

- School pages returned no challenge in earlier testing; not yet verified on a box. A body under 2 KB containing `KPSDK` and "reference ID", or a challenge script at `/{uuid}/{uuid}/ips.js?KP_UIDz=...`, is Kasada. Retry once, then use the browser path.
- Property detail pages are always behind Kasada on plain HTTP. In earlier testing a stealth residential browser session was needed; a box IP may hit the same wall in the browser too.
- Dead ends. `/local/schools/search?searchTerm=...` renders `_error`; `www.realtor.com/api/v1/schools/search` and `/api/v1/rdc_search/schools` 404; `/api/v1/hulk` 403; `parser-external.geo.moveaws.com/schools`, `/schools_search`, `/locality`, `/reverse_geocode` 404.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
