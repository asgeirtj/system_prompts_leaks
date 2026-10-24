---
name: site-playbooks-luma
description: 'Luma site playbook: find events or read one event page, not host tools.'
---
# Site playbook: Luma

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

Jobs in this file: Discover events on Luma; Luma event page; Luma registration.

## Discover events on Luma

### When to use

The user asks what is happening in a city on Luma, wants events in a category such as tech or AI near a place, or wants a list to monitor. The parent needs a city or a category plus a city. The result is a list of events with name, URL, start time and timezone, venue, hosts, calendar, and RSVP or ticket state. Nothing is registered or bought. One pasted event URL is the next section.

### Fastest path

Luma's web UI is a thin client over a public JSON API at `api.luma.com` that needs no key, cookie, or special header, and is geo-scoped by query parameters rather than source IP. Use `curl` in the box shell.

```
curl -s "https://api.luma.com/discover/get-paginated-events?slug={slug}&pagination_limit={N}[&latitude={lat}&longitude={lon}][&pagination_cursor={cursor}]"
curl -s "https://api.luma.com/discover/get-paginated-events?slug=sf&pagination_limit=20"
curl -s "https://api.luma.com/discover/get-paginated-events?slug=tech&latitude=37.7749&longitude=-122.4194&pagination_limit=20"
```

- A place slug (`sf`, `nyc`, `london`, `singapore`, `la`, `berlin`, `tokyo`) scopes itself, and `latitude` and `longitude` are ignored.
- A category slug (`tech`, `ai`, `crypto`, `food`, `arts`, `climate`, `fitness`, `wellness`) requires `latitude` and `longitude`. Without them the API returns `{"entries": [], "has_more": false}`, which is empty, not an error.
- The response is `{ "entries": [...], "has_more": bool, "next_cursor": "<opaque>" }`. While `has_more` is true, repeat with `pagination_cursor={next_cursor}` and the same other parameters. `pagination_limit` works up to about 20 to 25.
- To list cities and categories with coordinates and counts, `curl -s https://luma.com/discover`, take the `<script id="__NEXT_DATA__">` JSON, and read `props.pageProps.initialData` for `categories[]` (`category.slug`, `api_id`, `event_count`), `places[]` (`place.slug`, `place.coordinate.{latitude,longitude}`, `event_count`), and `featured_place.events[]`.
- Luma has no parties category and no anonymous keyword search. Pull the city list and filter `event.name`, `calendar.name`, and hosts for party, nightlife, or social keywords, or pull `food` for that city, and say so in the report.

### Dispatch snippet

```
List upcoming events on Luma for <city or category> (<extra filter, e.g. parties, this week>). Read only, never RSVP or sign in.
In the shell run curl -s "https://api.luma.com/discover/get-paginated-events?slug=<slug>&pagination_limit=20". For a category slug (tech, ai, crypto, food, arts, climate, fitness, wellness) add &latitude=<lat>&longitude=<lon> or the result will be empty.
If you need slugs or coordinates, curl -s https://luma.com/discover and read props.pageProps.initialData.places[] and categories[] from the __NEXT_DATA__ script.
While has_more is true, repeat with &pagination_cursor=<next_cursor> unchanged.
For each entry report event.name, https://luma.com/<event.url>, event.start_at converted to event.timezone, geo_address_info.city_state and full_address, hosts[].name (dedupe), calendar.name, ticket_info (is_free, price, is_sold_out, spots_remaining), guest_count.
For parties, filter names, calendars, and hosts for party, nightlife, or social words and say you did. If the API returns a challenge or 403, or a sign in, captcha, or payment prompt appears, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Each `entries[]` element wraps an `event` plus enrichment.

- `event.name`, `event.start_at` (UTC ISO, render with `event.timezone`), `event.timezone`, `event.api_id`.
- Canonical URL is `https://luma.com/{event.url}`. `event.url` is a short slug such as `weavehacks`, not the `evt-...` id.
- `event.location_type` is `offline` or `online`. `event.geo_address_info.city_state` and `.full_address` are absent for online events or when the host hides the address behind `require_approval`.
- `hosts[].name` (dedupe, the same person can appear twice), `calendar.name`.
- `ticket_info.{is_free, price, is_sold_out, spots_remaining, is_near_capacity, require_approval}` and `guest_count`.

### When blocked

- The page shell at `luma.com` sits behind Cloudflare and Shape, so `curl` or `browser_navigate` to `luma.com/discover` or `luma.com/{slug}` may get a challenge from a box IP. The JSON API did not need any of that in earlier testing, not yet verified on a box. If the API itself returns a challenge or 403, stop and report the URL.
- `api.lu.ma` is live but returns `{"message":"Not found."}` for these paths. Use `api.luma.com`.
- `api.luma.com/search/get-results?query=...` returns 401 and `api.luma.com/discover/search` returns 404. There is no public free-text search.
- If the page asks for a password, 2FA code, captcha, or payment, or a sign in prompt appears, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Luma event page

### When to use

The user pastes a `lu.ma/<slug>` or `luma.com/<slug>` link and wants that event's details or whether registration is open, free, paid, waitlisted, or approval gated. The parent needs the slug (the last path segment of the link, without query). The subagent reads and reports, and nothing is registered. Registering is the next section.

This playbook covers public reads, not host tools. Host only data such as join links (Zoom or other meeting URLs) and guest lists is not in the public JSON: an online event returns `virtual_info.has_access` false. Get it from Luma's API in the shell if a Luma API key is already set, otherwise use the host dashboard on luma.com in the browser.

### Fastest path

`https://lu.ma/<slug>` answers 301 to `https://luma.com/<slug>`. The event JSON is public with no key, cookie, or special header:

```
curl -s "https://api.luma.com/url?url=<slug>"
```

It returns 200 with `{"kind": "event", "data": {...}}` for a live slug and 404 for an unknown one. The event page embeds the same object in `<script id="__NEXT_DATA__">` at `props.pageProps.initialData`, the fallback when the API is blocked. `event.geo_address_visibility` `guests-only` means the address is shown only after registration.

Map the registration state in this order: `sold_out` or `ticket_info.is_sold_out` true is `sold_out` (add `waitlist` when `waitlist_active`); `show_unlock_code_option` true is `unlock_code_required`; any `ticket_types[].cents` above zero or `ticket_info.is_free` false is `paid`; otherwise `open_free`. Add `approval_required` to the state when `ticket_info.require_approval` or any `ticket_types[].require_approval` is true.

### Dispatch snippet

```
Read the Luma event at https://luma.com/<slug> (a lu.ma/<slug> link redirects there). Read only, never register, pay, approve, or sign in from this Task.
In the shell run curl -s "https://api.luma.com/url?url=<slug>" and read data. A 404 means the slug is wrong; report slug_not_found and stop.
Report event.name, event.start_at and event.end_at in event.timezone, event.location_type, geo_address_info.city_state and full_address (absent with geo_address_visibility guests-only means the address is shown to guests only), hosts[].name, calendar.name, guest_count, and the description text from description_mirror content[].content[].text.
Report the registration state, first match: sold_out (sold_out or ticket_info.is_sold_out; add waitlist if waitlist_active), unlock_code_required (show_unlock_code_option), paid (any ticket_types[].cents above 0 or ticket_info.is_free false), else open_free; add approval_required when ticket_info.require_approval or any ticket_types[].require_approval is true. List ticket_types[] name, type, cents, currency, spots_remaining. List registration_questions[] label and required, name_requirement, phone_number_requirement.
If the API returns a challenge or 403, read the same fields from the __NEXT_DATA__ script on https://luma.com/<slug> at props.pageProps.initialData.data; if the page is challenged too, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

- `slug_not_found` is the API's 404. Check the pasted link for a trailing path or query before reporting.
- `virtual_info.has_access` false means the join link is hidden from a public reader, not missing. Do not retry the public API or the public page for it.

### When blocked

- If the API returns a challenge or 403, read `__NEXT_DATA__` from the event page in the browser. If the page is challenged too, stop and report `cloudflare_challenge` with the URL.
- If the page asks for a password, 2FA code, captcha, or payment, or a sign in prompt appears, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Luma registration

### When to use

The user asks to register for a Luma event. Run the event page section first and dispatch this only when its state is `open_free`. The subagent clicks the registration control once and stops at whatever appears next.

### Fastest path

There is no shell step. The click happens on `https://luma.com/<slug>` after the event page section reported `open_free`.

### Dispatch snippet

```
Register for the Luma event at https://luma.com/<slug>, whose registration state is open_free. Never pay, never approve, never sign in from this Task.
Open https://luma.com/<slug>, click the registration control once, and stop at whatever appears next (a form, a sign in, a code, a password, a payment, an approval, or an unlock code). Report it as sign_in_required, payment_required, approval_pending, unlock_code_required, or the form's fields, with the URL. Do not fill any field. Do not open a second event.
If the page is challenged, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

- After a registration click, `sign_in_required`, `payment_required`, `approval_pending`, or `unlock_code_required` names the wall the attempt stopped at. Treat every prompt after the click as a wall and report it rather than working through it.

### When blocked

- A sign in, one time code, password, payment form, approval notice, or unlock code prompt after the registration click is the stop. Report which one and the URL. Do not solve or bypass it, and do not fetch a code from the user's mailbox.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
