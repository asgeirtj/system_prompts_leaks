---
name: site-playbooks-expedia
description: 'Expedia site playbook: compare flights, hotels, or travel options.'
---
# Site playbook: Expedia

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## Compare travel options on Expedia

### When to use

The user wants to shop Expedia inventory the way a traveler would and get a shortlist, not a booking. The parent needs the destination or airports, dates, and party size, plus any caps such as a nightly price. Stays searches return hotels and Vrbo rentals together. Flights searches return round trip totals plus a flexible date price strip.

### Fastest path

Deep link search URLs control most state, so the form is rarely needed. All results hydrate in the browser from `https://www.expedia.com/graphql`, which has no public or cookieless path.

Stays (hotels and Vrbo).

```
https://www.expedia.com/Hotel-Search
  ?destination=<URL-encoded "City, State, Country">
  &regionId=<market id>          # optional but locks the market; e.g. Seattle = 3121
  &startDate=YYYY-MM-DD
  &endDate=YYYY-MM-DD
  &adults=2&rooms=1              # &children=age,age for kids
  &sort=PRICE_LOW_TO_HIGH        # RECOMMENDED | PRICE_LOW_TO_HIGH | REVIEW | DISTANCE | PROPERTY_CLASS
  &price=0,350                   # min,max. TOTAL stay price, not per night
```

Flights.

```
https://www.expedia.com/Flights-Search
  ?leg1=from:City%20(SEA),to:City%20(JFK),departure:MM/DD/YYYYTANYT
  &leg2=from:City%20(JFK),to:City%20(SEA),departure:MM/DD/YYYYTANYT
  &passengers=adults:1
  &trip=roundtrip                 # oneway | roundtrip
  &mode=search
```

Other verticals follow the same load, scroll, read pattern from the top nav (`/Hotels`, `/Flights`, `/Cars`, `/Vacation-Packages`, `/Activities`, `/Cruises`) or the search routes `/carsearch` and `/things-to-do/search`. To find an unknown `regionId`, type the city into the `Where to?` typeahead and read the resolved link, or inspect a returned detail URL.

### Dispatch snippet

```
Flights: open https://www.expedia.com/Flights-Search?leg1=from:<City>%20(<ORIG>),to:<City>%20(<DEST>),departure:<MM/DD/YYYY>TANYT&leg2=from:<City>%20(<DEST>),to:<City>%20(<ORIG>),departure:<MM/DD/YYYY>TANYT&passengers=adults:<N>&trip=<roundtrip|oneway>&mode=search
Wait about 5 s. For each option read airline, depart, arrive, duration, stops, and the total price. Also read the flexible date strip (date and price pairs).
Stays: open https://www.expedia.com/Hotel-Search?destination=<City%2C%20State%2C%20Country>&startDate=<YYYY-MM-DD>&endDate=<YYYY-MM-DD>&adults=<N>&rooms=1&sort=PRICE_LOW_TO_HIGH&price=0,<TOTAL_CAP>
Click "Got it" on the taxes and fees dialog, scroll down 4 times, then read the cards after the "Search results" heading: name, rating, review count, $ nightly, $ total, Fully refundable, badges, detail URL with the h<id>.
Return tables sorted by price with a 3 item shortlist and one screenshot path each. Read only. Never click Reserve, Select, or Continue.
If a captcha, Akamai block, sign-in or password, 2FA, or payment wall appears, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Stays. Scope to the main list, which begins after the `Search results` heading; each main card is headed `Photo gallery for {name}`. Skip the `VIP Access properties (N)` carousel and sponsored modules above and within the list, which carry their own prices and ratings. Each card has name, guest rating (`9.4 out of 10` plus review count), `$NNN nightly`, `$NNN total`, an optional struck through "was" price, `Fully refundable`, `Reserve now, pay later`, and badges (`VIP Access`, `Member Prices`). The detail link is `/{City}-Hotels-{Name}.h{HOTELID}.Hotel-Information?...` and `h{HOTELID}` is the stable property id. Use the `Property type` filter (`Hotels` vs `Vacation rentals`) to separate hotels from Vrbo.

Flights. Each option shows airline, depart and arrive times, total duration, stop count, and the round trip total for `trip=roundtrip`. A 7 day flexible date strip renders inline (`Fri, Jun 12 $416`); read it to answer "would other dates be cheaper" without re-searching.

### When blocked

- Akamai Bot Manager is on every route (`ak_bmsc`, `bm_ss`, `bm_so` cookies, `X-Akamai-Reference-Id` header). In earlier testing a residential proxy session loaded cleanly and a bare datacenter session is liable to challenges, so the box IP may hit a wall on `/Hotel-Search` and `/Flights-Search`. Not yet verified on a box. A clean bare homepage means nothing for the search routes.
- Member Prices and One Key rates need sign in. Report public pricing and note the "Sign in to unlock Member Prices" prompt. Do not sign in.
- Do not POST to `/graphql`. It uses persisted query hashes, client headers, and valid `bm_*` cookies.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
