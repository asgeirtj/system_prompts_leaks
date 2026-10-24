---
name: site-playbooks-etsy
description: 'Etsy site playbook: find or price a product, not seller tools or shop apps.'
---
# Site playbook: Etsy

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## Etsy search products

### When to use

The user wants Etsy listings for a query ("hand poured soy candles under $50, sorted by top reviews"), optionally filtered by price, item type, shipping, sale, or ordering. The parent needs the query and filters. The user gets listing id, title, shop, URL, price and original price, rating and review count, badges, free shipping flag, and an `is_ad` flag separating organic results from Etsy Ads. Read only; Etsy's Open API v3 is partner gated, so the consumer search page is the surface.

### Fastest path

Warm up on the homepage, submit the query through the search box, then apply filters by URL in the same tab. In earlier testing a cold deep link to `/search?q=` drew the DataDome captcha far more often than the homepage did, and a plain HTTP fetch of `/search` returned a DataDome 403, so there is no `curl` path.

Filter parameters appended to `https://www.etsy.com/search?q=<query>`.

| Filter | URL param |
|---|---|
| Ordering | `&order=most_relevant` (default), `most_recent`, `price_asc`, `price_desc`, `highest_reviews` |
| Price | `&min=25&max=50` (whole dollars) |
| Handmade / Vintage / Craft supply | `&is_handmade=true` / `&is_vintage=true` / `&is_supply=true` |
| Digital downloads | `&instant_download=true` (a bare search appends `&instant_download=false`) |
| Free shipping | `&free_shipping=true` |
| On sale | `&is_discounted=true` |
| Ships to country | `&ship_to=US` (ISO code) |
| Customizable / Personalizable | `&customizable=true` / `&is_personalizable=true` |
| Color | `&attr_1=<colorId>`, ids only from the left rail links |
| Category | taxonomy path such as `/c/home-and-living/home-decor/candles`, or the left rail category links |
| Pagination | `&page=2` (about 64 results per page) |

Dynamic facets (material, occasion, recipient, style, holiday, room) are per category and multi select; read their `href`s off the left rail and append them. Worked example.

```
https://www.etsy.com/search?q=hand+poured+soy+candle&order=highest_reviews&min=25&max=50&is_handmade=true&free_shipping=true
```

### Dispatch snippet

```
Search Etsy for "<query>" <filters>. Read only, never add to cart, favorite, or sign in.
Open https://www.etsy.com/ and wait 7 s. If the title is exactly "etsy.com" or a captcha-delivery.com iframe is present, stop and report the DataDome wall.
Type "<query>" into input[name="search_query"] and submit. Wait 6 s.
Then open https://www.etsy.com/search?q=<query with + for spaces><&order=highest_reviews|most_recent|price_asc|price_desc><&min=<n>&max=<n>><&is_handmade=true><&free_shipping=true> in the same tab and wait 4 s.
With a page script iterate div.js-merch-stash-check-listing.v2-listing-card, dedupe by data-listing-id, and read data-shop-id, a.v2-listing-card__img href (cut at ?) and aria-label (title), img src, .currency-symbol plus .currency-value, any "Original Price" amount, the "N star rating with M reviews" aria-label, and whether the card contains "Ad from shop", "Bestseller", "Free shipping".
Take one screenshot. If a captcha, sign in or password, 2FA, or payment prompt appears at any point, stop and report it with the URL.
Report a table of listing_id, title, shop_id, listing_url, image_url, price, original_price, rating, review_count, badges, is_ad, free_shipping, in page order with ads flagged.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Per card patterns from the source, for use on a card's HTML.

| Field | Pattern |
|---|---|
| listing_id / shop_id | `data-listing-id="(\d+)"` / `data-shop-id="(\d+)"` |
| listing_url, title | `<a class="v2-listing-card__img" ... href="(...)" aria-label="(...)">`, URL up to `?`, title is the `aria-label` (decode `&amp;`) |
| image_url | `src="(https://i\.etsystatic\.com/.../il_300x300\.\d+_\w+\.jpg)"`, swap `300x300` for `640xN` for a larger image |
| price | `currency-symbol">([^<]+)<` plus `currency-value">([\d.,]+)<` |
| original_price | `Original Price[^$]*\$([\d.,]+)` (only when discounted) |
| rating, review_count | `aria-label="([\d.]+) star rating with ([\d.,kK]+) reviews"` (counts are abbreviated, `3.8k`) |
| is_ad | `<span class="wt-screen-reader-only">Ad from shop ([^<]+)</span>` |
| bestseller | contains `Bestseller` (the href also carries `&bes=1`) |
| free_shipping | contains `Free shipping` |

- The hidden `<form action="/cart/listing.php">` in each card carries `<input name="listing_id">` and `<input name="listing_url">` as a stable fallback for id and URL.
- The one `ld+json` block is an `ItemList` of the first few listings only (name, url, shop as `brand`, image, offer price), so read the cards for the full page. There is no `__INITIAL_STATE__`.
- About 23 of about 59 page one cards are ads, and `data-listing-id` repeats about 6 times per card across nested nodes. Never infer organic from position; always dedupe by id.
- The result count is no longer surfaced numerically. Report `result_count_text` as null.

### When blocked

- The wall is DataDome (`Server: DataDome`, `geo.captcha-delivery.com`). Two flavors. Interrogation (`rt:i`) auto solves in a few seconds of JS. Captcha (`t:bv`) is an iframe and cannot be solved.
- Tells. A title of exactly `etsy.com`, or a `captcha-delivery.com` iframe in the body.
- In earlier testing a `t:bv` captcha flagged the IP and the fix was a fresh proxy IP, which the box cannot do; a box IP may hit the same wall, not yet verified on a box.
- Our own traffic data shows Etsy runs from the box hit no bot wall, so treat a captcha as unusual. Do not reload a challenged page repeatedly.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared, its tell, and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
