---
name: site-playbooks-ups
description: 'UPS site playbook: track a package.'
---
# Site playbook: UPS

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## UPS package tracking

### When to use

The user pastes a UPS tracking number (usually `1Z` plus 16 characters) or a 12-digit InfoNotice door-tag number and asks where the package is. The parent needs that number only. The result is status, estimated or actual delivery date, delivery window, signed-by name, last scan location, and the event timeline. Nothing about the delivery is changed.

### Fastest path

`browser_navigate` to the public tracking URL with `requester=ST/` (trailing slash as in UPS's own emails), which suppresses the My Choice upsell and login modals, then wait 4 seconds for the Angular app to paint.

```
https://www.ups.com/track?loc=en_US&tracknum=<TN>&requester=ST/
https://www.ups.com/track?loc=en_US&tracknum=1Z6Y34W90305161551&requester=ST/
```

The UPS Developer API, `GET https://onlinetools.ups.com/api/track/v1/details/{trackingNumber}?locale=en_US&returnSignature=true` with a Bearer token from `POST https://onlinetools.ups.com/security/v1/oauth/token`, returns the same data in `trackResponse.shipment[].package[].activity[]`, but needs a `client_id` and `client_secret` registered at `developer.ups.com` (free tier up to 250 calls a day), so use it only when the box already has them.

### Dispatch snippet

```
Track UPS package <tracking number>. Read only, never click My Choice, Change Delivery, Authorize Driver to Leave, or Hold for Pickup.
browser_navigate https://www.ups.com/track?loc=en_US&tracknum=<TN>&requester=ST/ and wait 4 s, then snapshot (wait 2 s more if the tree is empty).
Classify by the heading. Delivered (read "Delivered On" and "Signed by:"), Out For Delivery (read the time window), On the Way or In Transit (read "Estimated Delivery Date"), Label Created, Delivery Attempted, Returned to Sender, "We could not locate the information" (not found), "Please enter a valid tracking number" (invalid).
Read the activity list (data-spec="activity-list") for every scan, local time, location, description. If the page lists child shipments, report them as a multi-piece master.
If you see "Powered and protected by Akamai" or an "Access Denied" page, wait 8 s and retry once via https://www.ups.com/us/en/home; if it is still blocked, stop and report with the URL.
If a red Tracking Error banner shows instead of a status heading, retry once via https://www.ups.com/us/en/home and the tracking URL; if it shows again, stop and report tracking_error with the URL.
If the page shows a captcha or reCAPTCHA, a sign-in or password prompt, a 2FA code request, or a payment step, stop, do not solve or bypass it, and report which wall appeared and the URL.
Take one screenshot. Report outcome, service, status, delivery date and window or delivered time, signed by, last location, the events table, and the screenshot path.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Read these from the snapshot, or with a page script on the selectors, which in earlier testing were stable across 2024 to 2026 revisions but should be checked against the live page.

- Status banner `[data-spec="header-status-text"]` or `h1.heading-1` inside `<ups-tracking-summary>`.
- Estimated delivery date `[data-spec="delivery-date-text"]`, rendered like `Friday, May 22` with no year. Infer the year and roll forward if the date is more than 14 days in the past.
- Delivery window `[data-spec="delivery-time-text"]`, for example "by 7:00 P.M.".
- Signed by. In the "Proof of Delivery" rail, the label `Signed By:` followed by a span with the surname.
- Last known location. The first item under `[data-spec="activity-list"]`, formatted `{City}, {State} {ZIP}, {Country}`.
- Events. Each `<li>` or `[role="listitem"]` inside `[data-spec="activity-list"]` has a `<time datetime>` when present or text like `{Day-name}, {Month} {DD}, {YYYY} at {HH}:{MM} {AM/PM}`, a location (empty for "Origin Scan" or "Order Processed"), and a description ("Departed from Facility", "Arrived at Facility", "Out For Delivery", "Delivered", "Exception"). Times are local to the scan location, so keep them paired with the location and do not sort by parsed time.
- InfoNotice lookups show status and next attempt date only, never a signed-by name.

### When blocked

- Akamai Bot Manager fronts `www.ups.com/track`, `wwwapps.ups.com/WebTracking/track`, and `m.ups.com/mobile/track/details`. The challenge page has `<div id="sec-if-cpt-container">` and "Powered and protected by Akamai". In earlier testing a plain session never got past it and a stealth browser on a residential proxy was required, and the box hits it often. If it shows after the 4 second wait, wait 8 more seconds and snapshot again. If still challenged, navigate to `https://www.ups.com/us/en/home`, wait 2 seconds, and retry the tracking URL once, then stop.
- An "Access Denied" page (HTTP 403 with an Edgesuite reference) is the same Akamai block. One retry through the home page, then stop.
- A red "Tracking Error" banner on a page that otherwise rendered is a UPS-side lookup failure, not an invalid number and not a bot wall.
- One retry through the home page, then the subagent reports `tracking_error`.
- After any of these the parent takes one step, not another dispatch: hand the user the tracking deep link to open in their own browser, or read the Track API under Fastest path when UPS Developer API credentials are already on the box. Do not register for credentials for this job.
- A reCAPTCHA iframe (site key `6LeGXsYiAAAAALO5vceT2N-DmLNfQotjbGM27a8Z`) means the session is flagged. Stop and report it. Do not try to solve it.
- Dead ends. `POST https://webapis.pkginfo.ups.com/track` returns 500 without a warmed cookie jar and CSRF token, `https://www.ups.com/track/api/Track/GetStatus` redirects to `/error.page`, `https://webapis.ups.com/track/api/Track/GetStatus` returns the app shell, and `/track/client/main.*.js` is 403 without a page session. Do not `curl` them.
- A My Choice login wall or sign-in prompt is a stop-and-report wall.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass it. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
