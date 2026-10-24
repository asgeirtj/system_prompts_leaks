---
name: site-playbooks-target
description: >-
  Target site playbook: find or price a product, or check store pickup for a
  TCIN.
---
# Site playbook: Target

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

Jobs in this file: Target.com find a product; Target.com store pickup and fulfillment.

## Target.com find a product

### When to use

The user names a product ("AirPods Pro 2", "tide pods", "lego star wars millennium falcon") and wants Target's top match with title, brand, price, original price, rating, TCIN, canonical product URL, and image. The parent needs only the free text query. The result also says whether Target spell corrected the query or returned filler because nothing matched. Read only. Pickup or stock at a store for a known TCIN is the fulfillment section below.

### Fastest path

Target's search page is a shell over a public JSON aggregation at `redsky.target.com`. The key is a static public token from Target's JS bundles. The call is unreliable from the box, where it usually returns HTTP 435 (PerimeterX). Dispatch the snippet in the same round as any shell attempt; the snippet tries the call once and falls back to the search page in the browser.

```
GET https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2
    ?key=ff457966e64d5e877fdbad070f276d18ecec4a01
    &channel=WEB
    &keyword=<URL-encoded query>
    &page=%2Fs%2F<URL-encoded query>
    &visitor_id=<any non-empty string, e.g. "skill-runner">
    &pricing_store_id=2885
    &default_purchasability_filter=true
    &count=24
    &offset=0
    &platform=desktop
```

The server returns HTTP 400 with no body if `key`, `channel`, `keyword`, `page`, `visitor_id`, or `pricing_store_id` is missing. `page` only has to start with `/s/`. `visitor_id` accepts any non-empty string. `pricing_store_id=2885` is the default the web bundle uses and gives nationwide pricing; other store ids such as `1000` or `3991` are accepted. Optional params are `count` (default 24), `offset` (item level, so 0, 24, 48; `page_number` is a no-op), `default_purchasability_filter=true` (hides out of stock), `store_ids=<id>` (only items in stock at that store), `category=<id>`, `platform=desktop|mobile`, and `sort_by`.

| `sort_by` | Effect |
|---|---|
| `relevance` (default) | Target's relevance ranking |
| `Featured` | Featured or sponsored bias |
| `PriceLow` | Price low to high |
| `PriceHigh` | Price high to low |
| `RatingHigh` | Average rating high to low |
| `bestselling` | Best sellers first |
| `newest` | Newest first |

Worked example.

```bash
curl -sS -w '\nHTTP %{http_code}' -H 'Accept: application/json' "https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2?key=ff457966e64d5e877fdbad070f276d18ecec4a01&channel=WEB&keyword=AirPods+Pro+2&page=%2Fs%2FAirPods+Pro+2&visitor_id=skill-runner&pricing_store_id=2885&default_purchasability_filter=true&count=24"
```

### Dispatch snippet

```
Find "<query>" on Target.com. Read only, do not add to cart or check out.
In the box shell run curl -sS -w '\nHTTP %{http_code}' -H 'Accept: application/json' "https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2?key=ff457966e64d5e877fdbad070f276d18ecec4a01&channel=WEB&keyword=<url-encoded query>&page=%2Fs%2F<url-encoded query>&visitor_id=skill-runner&pricing_store_id=2885&default_purchasability_filter=true&count=24"
Check the HTTP status first; the lines below apply to a 200 only.
If data.search.search_response.facet_list is missing or empty, report no results and do not return a product.
If data.search.search_response.metadata.auto_corrected_keyword is set, report the correction.
From each of the first five data.search.products report tcin, item.product_description.title (decode HTML entities), item.primary_brand.name, price.formatted_current_price, price.formatted_comparison_price, ratings_and_reviews.statistics.rating.average and .count, item.enrichment.buy_url, item.enrichment.image_info.primary_image.url.
If the endpoint returns 403 with a captchaAbsoluteURL body, stop and report that URL. On HTTP 435, a body with an appId or blockScript field, or any other 4xx, do not run it again: report api_blocked for the 435 and open https://www.target.com/s?searchTerm=<url-encoded query>, click "Continue shopping" if the Health Data Consent modal shows, wait 2.5 s, read each a[href*="/-/A-"] anchor (TCIN in the href) with the title and price text of its card, and take one screenshot.
Stop and report the URL if a captcha, sign in, 2FA, or payment wall appears.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Check the outcome first. Paths are under `data.search.search_response`.

- `facet_list` missing or empty means no real matches; Target pads `products[]` with about 200 unrelated bestsellers and `metadata.total_results` is padded too. Report `no_results`. Never return the first filler item as the match.
- `metadata.auto_corrected_keyword` non null means the products are for the corrected keyword ("airpoods" to "airpods"). Report the correction.

Top product is `data.search.products[0]`.

| Field | Path |
|---|---|
| tcin | `.tcin` |
| title | `.item.product_description.title`, decode `&#160;`, `&#38;`, `&#34;`, `&#8482;` |
| brand | `.item.primary_brand.name`, null for private label and grocery |
| price | `.price.formatted_current_price`, `"$249.99"` or `"See price in cart"` |
| original_price | `.price.formatted_comparison_price`, null when not on sale |
| rating | `.ratings_and_reviews.statistics.rating.average`, 0 to 5, null if unrated |
| rating_count | `.ratings_and_reviews.statistics.rating.count` |
| product_url | `.item.enrichment.buy_url` |
| image_url | `.item.enrichment.image_info.primary_image.url` |
| desirability | `.desirability_cues[].display`, for example `"Bestseller"` |

`"See price in cart"` is a real MAP restricted item; read `.price.current_retail` (numeric, sometimes populated) or open `buy_url`. Drop products whose `__typename` is not `ProductSummary` if you want to be defensive about sponsored slots. `https://www.target.com/p/<slug>/-/A-<tcin>` is canonical and `/-/A-<tcin>` alone 301s to it.

### When blocked

- `plp_search_v2` is behind PerimeterX. It answered HTTP 435 with a JSON body of the form `{"appId":"PXGWPp4wUS","blockScript":"https://captcha.px-cdn.net/...","uuid":"...","vid":""}` for most box calls, with either key. Treat 435 or any `appId` or `blockScript` body as `api_blocked`: do not repeat the call, rotate the key, or add headers; the browser search page is the path.
- A 403 whose JSON body is `{"captchaRelativeURL": "/captcha?trackingId=...", "captchaAbsoluteURL": "https://redsky.target.com/captcha?trackingId=..."}` is a captcha wall, not a key problem (observed 2026-09-10 from a residential IP, for both keys and with the browser's own `visitorId` cookie). Stop and report it with the `captchaAbsoluteURL`.
- Any other 4xx from redsky most likely means the key rotated. Open the search page and look for `redsky_aggregations` in the HTML; the SSR config carries the key as `"apiKey":"<40 hex>"`. Both `9f36aeafbe60771e321a7cc95a78140772ab3e96` and `ff457966e64d5e877fdbad070f276d18ecec4a01` returned 200 on the fulfillment endpoints below while the search call returned 435, so a 435 is a block, not a key problem.
- The public site loads the HUMAN sensor `client.px-cloud.net/PXGWPp4wUS/main.min.js` as `<script id="humanSensor">`. In earlier testing a plain session was challenged within 5 to 10 requests, so a box IP may hit the same wall on the browser path.
- The Health Data Consent modal blocks the grid until "Continue shopping" is clicked.
- If a captcha, challenge page, sign in prompt, password, 2FA code, or payment request appears, stop and report which wall and on which URL. Do not try to solve or bypass it.

## Target.com store pickup and fulfillment

### When to use

The user has a TCIN, or a product URL with `/-/A-<tcin>` in it, and wants order pickup, in-store, or shipping availability for it at a store or near a ZIP, with the available quantity where Target exposes it. The parent needs the TCIN and either a store id or a ZIP. Read only. A product name with no TCIN is the search section above first.

### Fastest path

Two redsky calls, same public key as the search section.

1. ZIP to stores, skipped when the user gave a store id. `GET https://redsky.target.com/redsky_aggregations/v1/web/nearby_stores_v1?key=<key>&limit=5&within=50&place=<ZIP>&channel=WEB&visitor_id=skill-runner` returns `data.nearby_stores.stores[]` with `store_id`, `location_name`, `distance`, and `status`.
2. Fulfillment for one store. `GET https://redsky.target.com/redsky_aggregations/v1/web/product_fulfillment_v1?key=<key>&tcin=<tcin>&store_id=<store_id>&zip=<ZIP>&channel=WEB&visitor_id=skill-runner` returns `data.product.fulfillment`; `key`, `tcin`, and `store_id` are enough. Without `store_id` it carries `shipping_options` only. One store per call, at most five.

Both answered with either key while `plp_search_v2` returned 435; the snippet still carries the browser fallback in case they are blocked too.

A digital store id such as `3991` returns HTTP 206 and an unknown TCIN 404. Store `2885`, the search section's pricing default, is a real store in New Jersey, so never pass it as the user's store.

### Dispatch snippet

```
Check Target store pickup for TCIN <tcin> at <store id or ZIP>. Read only, do not add to cart, check out, or sign in.
With a ZIP and no store id, in the box shell run curl -sS -w '\nHTTP %{http_code}' -H 'Accept: application/json' "https://redsky.target.com/redsky_aggregations/v1/web/nearby_stores_v1?key=ff457966e64d5e877fdbad070f276d18ecec4a01&limit=5&within=50&place=<zip>&channel=WEB&visitor_id=skill-runner" and take store_id, location_name, distance from data.nearby_stores.stores[].
For each store id (max 5) run curl -sS -w '\nHTTP %{http_code}' -H 'Accept: application/json' "https://redsky.target.com/redsky_aggregations/v1/web/product_fulfillment_v1?key=ff457966e64d5e877fdbad070f276d18ecec4a01&tcin=<tcin>&store_id=<store_id>".
If data.product.tcin differs from <tcin>, report both ids.
From data.product.fulfillment read sold_out; from store_options[0] read store.location_name, order_pickup.availability_status, in_store_only.availability_status, location_available_to_promise_quantity; from shipping_options read availability_status and services[].min_delivery_date.
On HTTP 435, or a body with appId or blockScript, report api_blocked with the URL and do not run it again. On HTTP 404 with "No product found" report tcin_not_found. On HTTP 206 naming a digital store report store_id_invalid and use the ZIP path.
If api_blocked and a browser is allowed, open https://www.target.com/p/-/A-<tcin>, click "Continue shopping" if the Health Data Consent modal shows, wait 2.5 s, read the pickup, delivery and shipping text as rendered, take one screenshot. Stop and report the URL on a captcha, challenge page, sign in, 2FA, or payment wall.
Report a table of store_id, name, distance, pickup, in-store, quantity, then shipping status and earliest delivery date.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

All paths are under `data.product.fulfillment`.

| Field | Path and values |
|---|---|
| pickup | `store_options[0].order_pickup.availability_status`, `IN_STOCK` or `UNAVAILABLE` |
| in_store | `store_options[0].in_store_only.availability_status`, `IN_STOCK` or `NOT_SOLD_IN_STORE` |
| quantity | `store_options[0].location_available_to_promise_quantity`, a float; `0.0` with `UNAVAILABLE` is no stock at that store |
| shipping | `shipping_options.availability_status`; its `available_to_promise_quantity` reads `10.0` for in-stock items, so report "10 or more" |
| flags | `sold_out`, `is_out_of_stock_in_all_store_locations`; true with `NOT_SOLD_IN_STORE` is an online-only item |

`data.product.tcin` can differ from the requested TCIN, which is why the snippet reports both ids.

The browser PDP fallback reads rendered text, so it names that read and marks the quantity unreadable.

### When blocked

- HTTP 435 or a PerimeterX body from any redsky URL is `api_blocked`, as in the search section. No retry, no key rotation; the subagent goes to the browser PDP at once, or stops when the Task allows no browser. The parent then hands the user the PDP URL or names another retailer.
- `tcin_not_found`: check the id against the `/-/A-<tcin>` part of the user's URL before reporting it.
- If a captcha, challenge page, sign in prompt, password, 2FA code, or payment request appears, stop and report which wall and on which URL. Do not try to solve or bypass it.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
