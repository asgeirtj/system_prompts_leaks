---
name: site-playbooks-united
description: >-
  United site playbook: cash fares or awards, not a booked trip, upgrades or
  check-in.
---
# Site playbook: United

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

Jobs in this file: United Airlines flight search; United award search.

## United Airlines flight search

### When to use

The user wants United's published cash fares and schedules for a route and date without committing to a booking. The parent needs origin and destination IATA codes, depart date, return date for round trips, passenger count, and cabin. The user gets each outbound flight's times, duration, stops, flight numbers, fare brand, and all in price. Multi-carrier or multi-date fare shopping belongs in the Google Flights playbook. MileagePlus award searches have their own section below; do not read award prices off the cash page.

### Fastest path

`browser_navigate` the results deep link. It skips the homepage typeahead, date picker, and trip type radio. The page is a React SPA with zero embedded flight data, so the browser must hydrate it.

```
https://www.united.com/en/us/fsr/choose-flights
  ?f={ORIGIN_IATA}
  &t={DEST_IATA}
  &d={DEPART_YYYY-MM-DD}
  &r={RETURN_YYYY-MM-DD}          # omit for one-way
  &tt={1|0|2}                      # 1=round-trip, 0=one-way, 2=multi-city
  &sc=7                            # search-class, keep 7 for cash fares
  &px={PASSENGER_COUNT}            # integer, 1 to 9
  &taxng=1                         # show all-in (taxes included) pricing
  &clm=7                           # cabin: 7=Economy, 6=Premium Economy, 4=Business, 3=First
  &st=bestmatches                  # bestmatches | priceasc | departtime | arrivetime | duration
  &newDateOverride=true            # use new date logic, safer on cross-month dates
```

Examples, both returned 200 in earlier testing.

```
https://www.united.com/en/us/fsr/choose-flights?f=SFO&t=JFK&d=2026-07-15&r=2026-07-22&tt=1&sc=7&px=1&taxng=1&clm=7&st=bestmatches
https://www.united.com/en/us/fsr/choose-flights?f=SFO&t=JFK&d=2026-07-15&tt=0&sc=7&px=1&taxng=1&clm=7&st=bestmatches
```

Airports are IATA codes only. City names get coerced to a "no flights" state, so resolve them from a static IATA table first; `/api/airports/lookup/search` returns 404. Dates must be `YYYY-MM-DD`, not in the past, and within United's 11 month window. Optional `noflex=true` disables the flexible date calendar above the grid. `tt=2` needs a different `f1`/`t1`/`d1` layout and is out of scope.

### Dispatch snippet

```
Open https://www.united.com/en/us/fsr/choose-flights?f=<ORIGIN>&t=<DEST>&d=<YYYY-MM-DD>&r=<RETURN or omit>&tt=<1 round trip|0 one way>&sc=7&px=<ADULTS>&taxng=1&clm=<7 economy|6 premium|4 business|3 first>&st=priceasc
Wait 4 s after load, then snapshot. If no flight cards, wait 2 s and snapshot once more.
For each outbound card read depart time, arrive time (+1d = next day), duration, stops, flight numbers (UA nnn), fare brand, and the all-in USD price (strip a trailing * and note saver).
If you see "No flights available for the dates you selected", report an empty result. If the date picker reopens, the date was rejected. If the header city is wrong, the IATA code was not recognized. If an error banner renders where the flight cards should be, report site_error_banner with the URL and stop.
Return a table sorted by price plus the results URL and one screenshot path.
Read only. Never click Select, Continue, or a fare price. If a captcha, Akamai 403, sign-in or password, 2FA, or payment wall appears, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Each card exposes, in snapshot text order. Depart time (first time string, `08:30`, local airport time), arrive time (second time string), duration like `5h 35m` or `5h 35m +1d` for next day arrival, stop count `Nonstop`, `1 stop`, `2 stops`, flight numbers like `UA 232` or `UA 232, UA 7411` on multi leg, fare options Basic Economy / Economy / Premium Plus / Business / First with one price each, and the price as a USD number. A `*` on a price (`$348.20*`) marks a Saver or mixed cabin fare; strip it and surface `flags: ["saver"]`. Capture the lowest cabin price unless `clm` asked for a higher cabin.

Round trip pages render outbound cards only. Return cards render after selecting an outbound, which this skill must not click. For return leg pricing run a second one way search with `f` and `t` swapped and `d=<return date>`.

### When blocked

- Akamai fronts every path. `_abck`, `bm_ss`, `bm_s`, `bm_mi`, and `akacd_NS_AB` cookies are set on the first response. In earlier testing a datacenter IP was challenged on the second navigation, so the box IP may hit the same wall. Not yet verified on a box.
- Tells. A captcha or "verify you are a human" page, or an Akamai 403.
- Site error banner. The fsr deep link sometimes renders an error banner ("unable to complete your request") instead of flight cards; the subagent reports `site_error_banner`. The parent does not dispatch the deep link again; it hands the route to the Google Flights playbook and reads United's rows there.
- No out of band JSON path. `/api/flight/recentSearch` returns 405 to GET and `searchFsr` sits behind anti tamper headers plus session cookies. Do not reverse engineer it. The edge resets curl on every united.com path, so the browser is the only way in.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## United award search

### When to use

The user wants MileagePlus award pricing (miles plus a cash copay) for a route and date. Awards live on `/ual/en/us/flight-search/book-a-flight/results`, not the fsr cash page, and may sit behind a MileagePlus sign-in. Do not build award URL parameters; this section stops at the wall and reports.

### Fastest path

Start at the award results path with no query parameters. Expect a MileagePlus sign-in wall, an award search form, or the results. On the wall the subagent reports `award_signin_required` and the parent decides: a signed-in hand-off on the box and the same steps again, or cash fares from the section above with a note that award pricing needs the user's sign-in. MileagePlus credentials never go in the Task text.

### Dispatch snippet

```
Open https://www.united.com/ual/en/us/flight-search/book-a-flight/results (no parameters; do not add award parameters).
Wait 4 s, then snapshot. If a MileagePlus sign-in form or a sign-in prompt blocks the page, stop at once and report award_signin_required with the URL. Do not type a username or password.
If a search form renders instead, fill <ORIGIN>, <DEST>, depart <YYYY-MM-DD>, return <YYYY-MM-DD or none>, <ADULTS>, choose the miles or award option, submit once, wait 4 s, and snapshot.
For each outbound card read depart time, arrive time (+1d = next day), duration, stops, flight numbers (UA nnn), cabin, miles, and the cash copay. Note a saver or waitlist mark.
If the page says no award seats are available, report award_no_results; if nothing renders, report award_results_unreadable with the URL.
Return a table sorted by miles plus the results URL and one screenshot path.
Read only. Never click Select or Continue. If a captcha, Akamai 403, password, 2FA, or payment wall appears, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Report miles and cash copay side by side per cabin, with flight numbers and stops read as in the cash section, and mark saver or waitlist fares. If the page rendered only after sign-in, say the prices are for that account.

### When blocked

- `award_signin_required` is the expected first outcome for a logged-out box.
- Do not re-dispatch the same URL. A user-pasted award results URL is opened as is, with the same stop rules.
- Same Akamai tells and rules as the cash section. If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
