---
name: site-playbooks-southwest
description: >-
  Southwest site playbook: fares or itineraries, not booking, check-in or
  changes.
---
# Site playbook: Southwest

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## Southwest Airlines flight search

### When to use

The user wants Southwest fares, which no OTA, meta search, or GDS carries. The parent needs origin and destination IATA codes that Southwest serves, dates, adult and senior counts, and dollars or points. The user gets each itinerary's flight numbers, routing, times, duration, stops, and the four fare columns, or a month grid of cheapest days.

### Fastest path

`browser_navigate` the deep link. `/air/booking/select.html` 301 redirects to `/air/booking/select-depart.html` with all params unchanged, and the app then forwards to the booking form at `/air/booking/?...&validate=true`, prefilled from the params. Expect the form, not a results grid. Press "Search flights" once and wait for fare rows.

```
https://www.southwest.com/air/booking/select.html
    ?originationAirportCode=DAL
    &destinationAirportCode=LAS
    &departureDate=2026-10-14
    &returnDate=2026-10-17
    &tripType=roundtrip                  // or "oneway" (no &returnDate)
    &adultPassengersCount=1              // 1-8
    &seniorPassengersCount=0             // 65+; counts toward total (max 8)
    &passengerType=ADULT                 // primary passenger pricing class
    &fareType=USD                        // "USD" (dollars) or "POINTS"
    &promoCode=                          // optional, leave empty for none
    &int=HOMEQBOMAIR                     // internal tracking; safe to omit
```

Worked example.

```
https://www.southwest.com/air/booking/select.html?originationAirportCode=DAL&destinationAirportCode=LAS&departureDate=2026-10-14&returnDate=2026-10-17&tripType=roundtrip&adultPassengersCount=1&fareType=USD&passengerType=ADULT
```

Dates are `YYYY-MM-DD`, local to the origin airport. `adult + senior` is at most 8. Send `fareType=USD`, not `DOLLARS`. Children (2 to 11) and lap infants are not URL params and need the form path. Southwest does not sell true multi city; run one ways in sequence.

The fare columns are Choice Extra, Choice Preferred, Choice, and Basic. Wanna Get Away, Anytime, and Business Select no longer appear on the page, so never wait for them.

Low Fare Calendar deep link (trailing slash; `/air/low-fare-calendar.html` returns 404). No dates, the calendar picks its own anchor month.

Use it when the form path is unusable or the grid stays empty.

```
https://www.southwest.com/air/low-fare-calendar/?originationAirportCode=DAL&destinationAirportCode=LAS&tripType=roundtrip&adultPassengersCount=1&fareType=USD&passengerType=ADULT
```

Airport resolution when given a city name. The station list is in the JS bundle at `https://www.southwest.com/swa-ui/bootstrap/air-booking-v2/1/data.js`, served as plain JavaScript (722 KB, `application/x-javascript`, observed 2026-09-10 off box). It is not base64, so do not pipe it through `base64 -d`. In the box shell run `curl -s https://www.southwest.com/swa-ui/bootstrap/air-booking-v2/1/data.js` and grep for `"emailDisplayName":"…","cityServed":"…","stationName":"…","id":"XYZ"` records, for example `"emailDisplayName":"Dallas (Love)","cityServed":"Dallas","stationName":"Dallas (Love Field)","id":"DAL"`. In earlier testing this fetch was only proven through a residential proxy; it returned 200 from a residential IP without one on 2026-09-10 and is not yet verified on a box. Southwest serves DAL, not DFW, and does not serve JFK.

### Dispatch snippet

```
Open https://www.southwest.com/air/booking/select.html?originationAirportCode=<ORIG>&destinationAirportCode=<DEST>&departureDate=<YYYY-MM-DD>&returnDate=<YYYY-MM-DD or omit>&tripType=<roundtrip|oneway>&adultPassengersCount=<N>&seniorPassengersCount=0&fareType=<USD|POINTS>&passengerType=ADULT
It lands on the prefilled booking form (URL ends in validate=true). Dismiss a cookie banner if one covers the form. Check the form shows <ORIG>, <DEST> and the dates, then press "Search flights" once. If fare rows render directly instead, skip the form.
Wait until flight rows with dollar or points prices appear (up to 10 s), then snapshot. The fare families are Choice Extra, Choice Preferred, Choice, Basic; read the column order off the page header. There is no "Wanna Get Away" button any more; do not wait for one.
For each outbound row read flight numbers, routing, depart and arrive times, duration, stops, and the four fares (an "Unavailable" cell is sold out).
For round trip open the Return tab, snapshot again, and read the return rows the same way.
If the grid stays empty after the wait, reload the page once and wait again. If it is still empty, report empty_grid with the URL and stop.
Return two tables plus one screenshot path. Read only. Never click Continue or a fare Select.
If you see Access Denied, "There was a problem", a captcha, sign-in or password, 2FA, or payment wall, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Each outbound row exposes. Flight numbers as 4 digit numerics, joined by `/` on connections (`1234 / 5678`). Routing like "DAL → LAS" or "DAL → HOU → LAS". Depart and arrive local times like `6:00 AM`. Aircraft when shown, always `Boeing 737-700`, `Boeing 737-800`, or `Boeing 737 MAX 8`. Total duration `Xh Ym`. Stops as "Nonstop", "1 stop in HOU", "2 stops in HOU, MCO". Layover as `Xh Ym layover in <CITY>`. "On-time performance: 78%" when shown. Four fare columns `Choice Extra` / `Choice Preferred` / `Choice` / `Basic` (read the column order off the page header); in points mode a cell shows points plus `+ $5.60`. A cell rendered "Unavailable" is `sold_out: true`; a row with fewer than four cells is `not_offered: true` for the missing one.

Low Fare Calendar. Each day cell renders the lowest fare for an outbound that day (round trip pricing assumes a 3 night return). Read the price and the cell's `data-` attribute or aria label once the first price cell renders.

### When blocked

- Akamai Bot Manager fronts the site (`/akam/13/8333552` sensor, `bazadebezolkohpepadr` token, `ak_bmsc`, `bm_mi`, `bm_sz` cookies). In earlier testing a session without a residential proxy got a generic "There was a problem" page or an Akamai Access Denied HTML, so the box IP may hit the same wall. Not yet verified on a box.
- Tells. "Access Denied" with `Reference #18.…`, or a "There was a problem" card after hydration.
- Retry once, then report `anti_bot_block` or `site_error` with the reference.
- Landing on the booking form is the normal path, not a block. A block is the form failing to move on after "Search flights", or a results page with no fare rows.
- Empty grid (`empty_grid` from the subagent, or no fare rows after the wait and one reload). Do not dispatch the deep link again. Open the Low Fare Calendar deep link for the same route and read the cheapest days; if the calendar also stays empty, tell the user Southwest did not render fares. Google Flights can show other airlines on the route, not Southwest's prices.
- All `/api/air-booking/v1/*` and `/api/content/v1/*` routes return Akamai 403 to cookieless calls. Do not replay them from the shell.
- "We couldn't find any flights" on a route Southwest does not serve is `route_not_served`, not a block.
- Check both codes against the station list.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
