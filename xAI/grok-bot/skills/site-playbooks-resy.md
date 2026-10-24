---
name: site-playbooks-resy
description: >-
  Resy site playbook: a restaurant's open tables from Resy's API, and booking
  one.
---
# Site playbook: Resy

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## Resy availability

### When to use

The user asks whether a restaurant on Resy has a table for N people on a date or in a window. You need the restaurant (a Resy URL, a slug, or a name and city), the party size, and the date or window. The result is the open slots with time, seating type, and price, plus a deep link, or a sold-out, not-found, ambiguous, not-yet-published, party-too-large, or invite-only outcome. Nothing is booked.

### Fastest path

Resy's web app reads a public JSON API at `https://api.resy.com`. Call it yourself with `curl` in the box shell before any browser dispatch, with these headers on every call:

```
-H 'Authorization: ResyAPI api_key="VbWk7s3L4KiK5fzlO7JD3Q5EYolJI7n5"' -H 'Origin: https://resy.com' -H 'Referer: https://resy.com/' -A '<desktop Chrome User-Agent>'
```

1. Venue from a URL `https://resy.com/cities/<city>/venues/<slug>`. `GET /3/venue?url_slug=<slug>&location=<code>`, where the code is the city's short code, not the URL's city slug (`new-york-ny` is `ny`): `ny`, `la`, `sf`, `chi`, `mia`, `dc`, `bos`, `lv`, `sea`, `phl`, `atl`, `aus`, `hou`, `dal`, `tor`, `lon`, `nas`, or `den`. Read `id.resy`, `location.latitude`, `location.longitude`, and `max_party_size`.
2. Venue from a name. `POST /3/venuesearch/search` with the JSON body `{"query": "<name>", "geo": {"latitude": <lat>, "longitude": <lon>}}` for the intended city. Take the `search.hits[]` entry whose `name` equals the query, ignoring case, and read `id.resy`, `url_slug`, `_geoloc.lat`, and `_geoloc.lng`. Matches in several cities with no city given are ambiguous. No match is not found.
3. One day. `GET /4/find?lat=<lat>&long=<lon>&day=<YYYY-MM-DD>&party_size=<N>&venue_id=<id>`.
4. A window of up to 30 days. `GET /4/venue/calendar?venue_id=<id>&num_seats=<N>&start_date=<YYYY-MM-DD>&end_date=<YYYY-MM-DD>`, then step 3 for each `scheduled[]` date whose `inventory.reservation` is `available`.

### Dispatch snippet

```
Check Resy availability for <restaurant>, <N> people, <weekday YYYY-MM-DD>. Read only.
Open https://resy.com/cities/<city>/venues/<slug>?date=<YYYY-MM-DD>&seats=<N>.
Report the venue name and each open time within <time window> with its seating type, and whether a Notify option shows.
Resy notes, for checking open tables or booking on Resy. Skip them for any other job, and follow the task above where it says otherwise. The URL the task gives sets the date and party size, so read the times on that page. Use the page's date or party controls only if it shows something else, and only once. Never build other Resy URLs. The times load after the page itself, so wait once for them, then take one snapshot; do not snapshot a loading page again and again. If no time appears, report what the page shows instead, such as a sold-out message or a Notify option. If the tab crashes or goes blank without an error code, open the same URL once more. Access Denied or a bot check will not clear on reload, so stop and report it with the URL. On an availability check, do not click a time or Notify. A page that asks for a password, a code, or a card number ends the task, so report its URL. On an availability check, report as soon as the times are on screen.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

`/4/find` returns `results.venues[0].slots[]`. For each slot read `date.start` (the venue's local time), `config.type` (the seating type), and `payment.amount` with `payment.currency`. An empty `slots` list on a 200 means no online table for that day and party, and the calendar says why. A `sold-out` date is sold out. A `closed` date is not bookable online, because the venue is closed that day or has not released it yet, so do not call it sold out. A `notify` block means a waitlist. A party above `max_party_size` gets no slots. The deep link is `https://resy.com/cities/<city>/venues/<slug>?date=<YYYY-MM-DD>&seats=<N>`.

### When blocked

- `/4/find` returns 500. Retry once. Then repeat the venue search from step 2 with `"slot_filter": {"day": "<YYYY-MM-DD>", "party_size": <N>}, "availability": true` added to the body, and read the hit's `availability.slots[]`, which has no price. If that fails too, dispatch the snippet. When the calendar says `available` and the page shows no times, say the times could not be read, not that the date is sold out.
- A 419 JSON `Unauthorized` means the key is missing, invalid, or rotated. Fetch `https://resy.com/`, fetch the `modules/app.<hash>.js` bundle its HTML names, and match `apiKey:"([A-Za-z0-9]{30,36})"`.
- A 419 HTML page from Imperva is a CDN block. Wait 30 seconds, retry once, then dispatch the snippet.
- A 403 from `/4/find` is an invite-only venue with no signed-out path. Report it.

### Booking

A booking goes out only after the user's yes, as the `restaurant-booking` skill describes, and Resy books only in a signed-in session. Write that Task yourself, since the snippet above is read only. Dispatch the deep link with `&time=<HHMM>` added, and say the user confirmed that slot. The subagent stops at a page that asks for a password, a code, or a card number and reports its URL. Hand those to the user through the sign-in and payment steps in `restaurant-booking`.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
