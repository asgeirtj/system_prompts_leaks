---
name: site-playbooks-craigslist
description: >-
  Craigslist site playbook: search listings near a city, not posting or
  replying.
---
# Site playbook: Craigslist

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## Craigslist search listings

### When to use

The user wants Craigslist postings for a query in a city (`sfbay`, `newyork`, `losangeles`, `seattle`, `chicago`, `boston`) and category (`sss` for sale all, `cta` cars and trucks, `apa` apartments, `ggg` for sale by owner, `jjj` jobs, `zip` free).

The parent needs city, category, query, and optional price, bedroom, or distance filters. The user gets title, price, location, posting time, lat/lon, posting id, and canonical URL per listing. Read only.

### Fastest path

The web UI is a thin client over a public JSON API at `https://sapi.craigslist.org`. No auth, no cookies, no anti bot. Call it with `curl` in the box shell and send a `Referer` for the target city.

```
GET https://sapi.craigslist.org/web/v8/postings/search/full
    ?searchPath={cat}
    &query={q}
    &sort={date|rel|priceasc|pricedsc}
    &batch=1-0-360-1-0
    &lang=en&cc=us
Referer: https://{city}.craigslist.org/
```

- To scope to a subarea prefix it in `searchPath`, as in `searchPath=sfc/apa` for SF proper apartments or `searchPath=eby/cta` for East Bay cars. Subarea codes are in `data.decode.locations[i][2]`. Subarea scoping is far cheaper than fetching region wide (`apa` returns about 9,800 bay wide against about 253 for `sfc/apa`).
- The API geo scopes by request IP when no `postal` is given, not by `Referer`. Check `data.areas` (for example `{"3": {"name": "newyork"}}`). If it shows the wrong city add `postal=<zip>&search_distance=<mi>` for any ZIP in the target metro. Verified in earlier testing with `postal=10001&search_distance=10` for NYC and `postal=94103&search_distance=25` for SF Bay.
- Filters go on the query string and are confirmed in `data.humanReadableParams`. `min_price`, `max_price`, `min_bedrooms`, `max_bedrooms`, `min_bathrooms`, `bundleDuplicates=1`, `hasPic=1`, `postal=<zip>`, `search_distance=<mi>`, `availabilityMode=available`, `auto_make_model=<text>`, `min_auto_year`, `max_auto_year`, `min_auto_miles`, `max_auto_miles`. Unrecognized params are silently dropped.
- The first page is 360 (`batch=1-0-360-1-0`). In earlier testing later pages come from `/web/v8/postings/search/batch` with a `cacheId` taken from the first response, but the `/full` response carries no `cacheId` and `/batch` answers `400 That url is unsupported (bad cacheId)` without one (observed 2026-09-10 off box; the top level `configId` is rejected too). Stop at 360, report `data.totalResultCount`, and narrow with a subarea or filters when more exist. Keep at most 1 request per second; Craigslist answers aggressive clients with terse 403s. Worked example.

```bash
curl -fsS -H 'Referer: https://sfbay.craigslist.org/' 'https://sapi.craigslist.org/web/v8/postings/search/full?searchPath=sss&query=bicycle&sort=date&batch=1-0-360-1-0&lang=en&cc=us&postal=94103&search_distance=25'
```

### Dispatch snippet

```
Search Craigslist <city> for "<query>" in category <cat><, subarea <sub>>. Read only, never post, reply, or flag.
In the box shell run curl -fsS -H 'Referer: https://<city>.craigslist.org/' 'https://sapi.craigslist.org/web/v8/postings/search/full?searchPath=<sub/><cat>&query=<url-encoded query>&sort=date&batch=1-0-360-1-0&lang=en&cc=us<&min_price=<n>&max_price=<n>><&postal=<zip>&search_distance=<mi>>'
Check data.areas is the right metro; if not, add postal=<zip in that metro>&search_distance=<mi> and rerun.
Decode each data.items[] entry. Posting id is data.decode.minPostingId + item[0]; posted epoch is data.decode.minPostedDate + item[1]; category id is item[2] (68 bik, 93 spo, 122 pts, 197 bop, 5 fua, 101 foa); price is item[3] (0, -1, or missing is null); item[4] is "locIdx:hoodDescIdx:hoodIdx~lat~lon" with data.decode.locations[locIdx][2] as the subarea and data.decode.locationDescriptions[hoodDescIdx] as the location; the title is the last plain string; the [6, slug] block is the slug and the [13, key] block is the posting key.
URL is https://www.craigslist.org/view/d/<slug>/<key>.
Stay under 1 request per second and stop at the first 360. Report data.totalResultCount and a table of posting_id, title, price, location, subarea, posted time, url.
If 403s persist after a 1 s pause and one retry, or a password, 2FA, captcha, or payment prompt appears, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

`data.items[]` are positional arrays. Most fields are offsets into `data.decode.*`, which is rebuilt per response, so always decode against the response in hand and never cache the tables.

- `item[0]` is `postingIdOffset`. The posting id is `data.decode.minPostingId + item[0]`. `item[0]` alone 404s.
- `item[1]` is `postedDateOffset` in seconds. The epoch is `data.decode.minPostedDate + item[1]`.
- `item[2]` is `categoryId`. It maps to the `cat3` URL segment through a fixed enum not in the response. Observed `5` fua, `68` bik, `93` spo, `101` foa, `122` pts, `197` bop.
- `item[3]` is the price as an integer. `0` or missing means free, and `-1` also appears (3 of 360 items, observed 2026-09-10 off box). Report null for all three, not `$0`.
- `item[4]` is `"locIdx:hoodDescIdx:hoodIdx~lat~lon"`. `data.decode.locations[locIdx]` is `[1, city, subareaAbbr]`, `data.decode.locationDescriptions[hoodDescIdx]` is the display location, and `lat~lon` are the coordinates.
- The title is the last plain string element. For `cta` it is `item[-1]`; for `apa` a trailing `[5, beds, sqft]` block pushes it earlier, so iterate from the end to the first plain string.
- Tagged blocks `[code, ...]`. `5` is `[beds, sqft]`, `6` is the URL slug, `10` is the formatted price ("$1,350"), `4` is image id refs. In earlier testing `13` is the geo cluster cell; its string is also the posting key in the site's own listing URL (observed 2026-09-10 off box).
- The listing URL is `https://www.craigslist.org/view/d/{slug}/{key}` with `slug` from the `[6, ...]` block and `key` from the `[13, ...]` block. It needs no `cat3` and returned 200 for 4 of 4 items checked; the older `https://{city}.craigslist.org/{subareaAbbr}/{cat3}/d/{slug}/{postingId}.html` form 301s to it and a wrong `cat3` 404s (observed 2026-09-10 off box). In earlier testing `https://{city}.craigslist.org/search/{cat}?postingId={postingId}` redirected to the listing; on 2026-09-10 it 301d to the area search page and dropped the id, so do not use it.
- Neighborhood labels vary per response and category. For neighborhood scoped searches also match a lat/lon bounding box on `item[4]` (North Beach plus Russian Hill is lat 37.794 to 37.810, lon -122.425 to -122.404).

### When blocked

- No anti bot today. In earlier testing a plain unproxied fetch returned 200 with 134 KB of JSON on the first try, even without `Referer`; not yet verified on a box.
- The wrong region in `data.areas` is the common failure. Add `postal` and `search_distance`.
- Terse 403s mean throttling. Sleep about 1 second between requests and retry once. If they persist, stop and report the status and URL.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
