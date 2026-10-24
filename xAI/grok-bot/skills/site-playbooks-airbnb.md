---
name: site-playbooks-airbnb
description: 'Airbnb site playbook: search stays or read one listing page, not host tools.'
---
# Site playbook: Airbnb

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

Jobs in this file: Airbnb search listings; Airbnb listing page.

## Airbnb search listings

### When to use

The user wants short term rentals in a place for a date window, filtered by guests, price, place type, bedrooms, amenities, or booking options, or everything inside a map bounding box. The parent needs location, checkin and checkout, and guest counts. The user gets per listing id, title, name, bedrooms, beds, baths, coordinates, price lines, rating, review count, badges, photos, and the `/rooms/{id}` URL.

### Fastest path

`browser_navigate` a `/s/{slug}/homes` URL with filters as query params, then read the StaysSearch JSON that the page embeds in `<script id="data-deferred-state-0">` (about 380 KB). Airbnb has no public API and `/api/v3/StaysSearch` uses rotating persisted query hashes plus device fingerprinting, so the SSR blob is the API.

| Input | URL |
|---|---|
| Free form location | `https://www.airbnb.com/s/{slug}/homes?<filters>`, for example `/s/Paris--France/homes` or `/s/Joshua-Tree--CA--United-States/homes`. The slug parser is forgiving and rewrites the canonical slug. |
| Full Airbnb URL | Use as is and add or override params; Airbnb merges them. |
| Map box only | `https://www.airbnb.com/s/homes?ne_lat=…&ne_lng=…&sw_lat=…&sw_lng=…&search_by_map=true` plus dates and guests. |
| Listing ids | `https://www.airbnb.com/rooms/{N}?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD&adults=N`. Its blob is `StaysPdpSections`, a different schema; see the listing page section below. |

Always end the slug with `/homes`. Plain `/s/{slug}` sometimes 301s to `/{city}/stays`, which returned a "Stay tuned · Error 503" maintenance page in earlier testing.

Filter params (snake_case in the URL, camelCase in the cache key echo). `checkin`, `checkout` (required for accurate pricing), `flexible_trip_lengths[]=weekend|week|month`, `flexible_date_search_filter_type=0|1|2|3` (exact, ±1, ±3, ±7 days), `adults`, `children` (age 2 to 12), `infants` (under 2), `pets`, `min_bedrooms`, `min_beds`, `min_bathrooms`, `price_min`, `price_max` (storefront currency, total per night including fees by default), `display_currency=USD|EUR|GBP|…`, `room_types[]=Entire%20home%2Fapt|Private%20room|Shared%20room|Hotel%20room`, `property_type_id[]=N`, `amenities[]=N` (undocumented, `4` Wi-Fi, `8` Kitchen), `ib=true` Instant Book, `fc=true` free cancellation, `self_check_in=true`, `allows_pets=true`, `superhost=true`, `l_disaster_ready=true` (Luxe), `accessibility_features[]=N`, `host_languages[]={iso-2}`, `category_tag=Tag:NNNN` (`Tag:8536` is Amazing views), `ne_lat`, `ne_lng`, `sw_lat`, `sw_lng`, `search_by_map=true`, `items_offset=N` (0, 18, 36, ...), `section_offset=0`, `pagination_search=true`, `query=`, `refinement_paths[]=%2Fhomes`. Unknown params are dropped silently. Discover enum values by clicking the control in the Filters modal once and reading the param it appends to the URL.

Worked example.

```
https://www.airbnb.com/s/Paris--France/homes?checkin=2026-06-15&checkout=2026-06-20&adults=2&min_bedrooms=2&price_min=100&price_max=500&room_types%5B%5D=Entire%20home%2Fapt&amenities%5B%5D=4&ib=true&superhost=true
```

### Dispatch snippet

```
Open https://www.airbnb.com/s/<City>--<Country>/homes?checkin=<YYYY-MM-DD>&checkout=<YYYY-MM-DD>&adults=<N>&min_bedrooms=<N>&price_min=<N>&price_max=<N>&room_types%5B%5D=Entire%20home%2Fapt (add ib=true, fc=true, superhost=true as needed).
Wait 3 s. Ignore the "one price for your trip" dialog. Run the page script async (page) => { const s = page.locator('#data-deferred-state-0'); if ((await s.count()) === 0) return { error: 'NO_SSR' }; const d = JSON.parse(await s.textContent()).niobeClientData[0]; const r = d[1].data.presentation.staysSearch.results; return { cacheKey: d[0], pageTitle: r.sectionConfiguration?.pageTitleSections?.sections?.[0]?.sectionData?.structuredTitle, paginationCursors: r.paginationInfo.pageCursors, results: r.searchResults }; }
From results take demandStayListing.id (base64 decode, strip DemandStayListing:), title, subtitle, structuredContent.primaryLine bed and bath bodies, structuredDisplayPrice.primaryLine price or discountedPrice plus qualifier, avgRatingLocalized, badges[].loggingContext.badgeType, contextualPictures[0].picture.
Report the page title count, the cacheKey, a table sorted by price, URLs as https://www.airbnb.com/rooms/<id>, and one screenshot path.
Read only. Never click Reserve, Save, or Sign In. If the page script returns NO_SSR, or a 429, a 503 Stay tuned page, captcha, sign-in or password, 2FA, or payment wall appears, stop, do not reload, and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

The script's `cacheKey` is `niobeClientData[0][0]`, the cache key `"StaysSearch:" + JSON.stringify({...})`, and echoes every filter Airbnb honored, camelCased. Read it to confirm a filter was accepted.

Per `results[i]` (`item`, one of `searchResults`), the fields and their paths.

| Field | Source path | Note |
|---|---|---|
| `listing_id` | `item.demandStayListing.id`, base64 decoded, `DemandStayListing:` prefix stripped | `propertyId` is null, ignore it |
| `url` | `https://www.airbnb.com/rooms/{listing_id}` | |
| `title` | `item.title` | Property type plus neighborhood |
| `name` | `item.subtitle` or `item.nameLocalized.localizedStringWithTranslationPreference` | Host supplied listing name |
| `bedrooms`, `beds`, `bathrooms` | `item.structuredContent.primaryLine[]` entries with `type` `BEDINFO` or `BATHROOMINFO`, parse `body` | Studios show `"1 sofa bed"` with no bedroom row |
| `lat`, `lng` | `item.demandStayListing.location.coordinate.{latitude,longitude}` | Fuzzed by about 150 m |
| `nightly_price` | `item.structuredDisplayPrice.primaryLine.price` when `__typename` is `QualifiedDisplayPriceLine`, `.discountedPrice` when `DiscountedDisplayPriceLine` | Currency formatted string |
| `nightly_price_original` | `item.structuredDisplayPrice.primaryLine.originalPrice` | Only on `DiscountedDisplayPriceLine` |
| `price_qualifier`, `price_a11y_label` | `.qualifier` ("for 5 nights"), `.accessibilityLabel` | |
| `total_before_taxes` | `item.structuredDisplayPrice.explanationData.priceDetails[].items[]`, the `HighlightExplanationLineItem` with description "Price after discount" or "Total before taxes" | Breakdown also holds cleaning fee, service fee, long stay discount |
| `rating`, `review_count` | parse `item.avgRatingLocalized` ("4.85 (132)") | null for new listings |
| `badges[]` | `item.badges[].loggingContext.badgeType` | `GUEST_FAVORITE`, `TOP_TIER_FAVORITE`, `SUPERHOST`, `NEW_LISTING` |
| `photo_url_primary`, `photo_urls[]` | `item.contextualPictures[].picture` (or `xlPicture`) | |
| `payment_messages[]` | `item.paymentMessages` | Strings like "Free cancellation" |
| `max_guests`, `host_name`, `host_avatar_url` | Not in the search payload | PDP only |

Totals. `structuredTitle` reads "60 homes in Lisbon" and is fuzzed past about 270 to "Over 1,000 homes in Paris". A map bound search returns a precise "167 homes within map area" and `mapResults.staysInViewport[]`; for sweeps over 270 subdivide the box into quadrants.

### When blocked

- PerimeterX. In earlier testing a bare session got a PerimeterX HTML shell with no `#data-deferred-state-0` script, so the box IP may hit the same wall; the page script's `NO_SSR` is the tell. Not yet verified on a box.
- HTTP 429, or the "Stay tuned" Error 503 page on a URL that already ends in `/homes`, is Airbnb's rate limit on repeated requests in one session; it cleared after a 45 s wait.
- Back off at least 45 s, do not refresh, and make at most one more navigation. If that fails too, do not dispatch to Airbnb again: move to the next source the Task names (the property's own site or another rentals site), or hand the user a prebuilt `/s/{slug}/homes` URL, and report `rate_limited`.
- "Stay tuned · Error 503" with a URL that lacks `/homes` is the redirect problem.
- Retry once with the `/s/{slug}/homes` form.
- Do not call `/api/v3/StaysSearch` directly.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Airbnb listing page

### When to use

The user has a room id or a pasted `/rooms/{id}` URL and wants one listing's details for a date window: layout, capacity, rating, the price for those dates, and the cancellation terms. The parent needs the id plus checkin, checkout, and guest count. Read only.

### Fastest path

Navigate `https://www.airbnb.com/rooms/{id}?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD&adults=N&display_currency=USD`. The page embeds a `StaysPdpSections` blob in `<script id="data-deferred-state-0">` at `niobeClientData[0][1].data.presentation.stayProductDetailPage.sections`. Its `metadata` holds the title line, capacity, ratings, and coordinates, and the cache key at `niobeClientData[0][0]` echoes the `dateRange` the page priced.

The price lines, fees, amenities, house rules, and cancellation policy are null in the blob and render client side, so the subagent reads them as page text. Dispatch one listing per Task with a pause between dispatches; several listings in one Task run into the rate limit in the search section.

### Dispatch snippet

```
Open https://www.airbnb.com/rooms/<id>?check_in=<YYYY-MM-DD>&check_out=<YYYY-MM-DD>&adults=<N>&display_currency=<USD|EUR|GBP>. Wait 3 s. Ignore the "one price for your trip" dialog if it appears.
Run the page script async (page) => { const n = page.locator('#data-deferred-state-0'); if ((await n.count()) === 0) return { error: 'NO_SSR' }; const s = JSON.parse(await n.textContent()).niobeClientData[0][1].data.presentation.stayProductDetailPage.sections; return { share: s.metadata.sharingConfig, log: s.metadata.loggingContext.eventDataLogging, cap: s.sections.find((x) => x.sectionId === 'BOOK_IT_SIDEBAR')?.section?.maxGuestCapacity }; }
From share take title, propertyType, personCapacity, starRating, reviewCount. From log take listingId, listingLat, listingLng, roomType, isSuperhost, guestSatisfactionOverall and the six sub ratings.
Then read the rendered page once: the booking sidebar's nightly price, nights, cleaning fee, service fee and total before taxes for the dates in the URL, and the sleeping arrangement, amenities, house rules and cancellation policy as page text. Report a field the page does not show as unreadable, never a guess.
Report one block: URL, title line, property type, capacity, rating and review count, price lines and total, layout, amenities, rules, cancellation, and one screenshot path.
Read only. Never click Reserve, Save, or Sign In, and do not change the dates. If the page script returns NO_SSR, or a 429, a 503 Stay tuned page, captcha, sign-in or password, 2FA, or payment wall appears, stop, do not reload, and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

- `sharingConfig.title` is one string with property type, rating, bedrooms, beds, and baths. `eventDataLogging` carries `listingId`, `listingLat`, `listingLng`, `roomType`, `isSuperhost`, and the six sub ratings.
- The cache key's `dateRange` confirms the dates in the URL were honored. A price the subagent reports as unreadable means the sidebar had not rendered one; do not fill it from the search card.

### When blocked

- No `#data-deferred-state-0` script is the PerimeterX tell from the search section. Report `NO_SSR` and the URL.
- HTTP 429 or the "Stay tuned" Error 503 page follows the search section's rate limit rule, handing the user the dated `/rooms/{id}` URL at the end.
- A sidebar with no price for the dates is `no_price_for_dates`.
- A new date window is a new dispatch the parent decides on.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
