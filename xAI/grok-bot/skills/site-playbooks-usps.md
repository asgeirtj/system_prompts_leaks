---
name: site-playbooks-usps
description: >-
  USPS site playbook: tracking, not pickup, hold mail, Informed Delivery or
  address change.
---
# Site playbook: USPS

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## USPS package tracking

### When to use

The user pastes a USPS tracking number and asks where the package is or when it arrives. The parent needs the tracking number only. The result is the status text, a status category, expected delivery date, last known location, origin and destination, and the event timeline. Nothing about the shipment is changed.

### Fastest path

`browser_navigate` to the public deep link with the number as digits only, then wait 4 seconds for the Akamai check and render.

```
https://tools.usps.com/go/TrackConfirmAction?tLabels=<NUM>
https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223197428490
```

The same data is on the USPS REST API, `GET https://apis.usps.com/tracking/v3/tracking/{trackingNumber}?expand=DETAIL` with a Bearer token from `POST https://apis.usps.com/oauth2/v3/token` (`grant_type=client_credentials`, `client_id`, `client_secret`, `scope=tracking`), but that needs a Consumer Key and Secret registered at `https://gateway.usps.com/`, so use it only when the box already has them.

### Dispatch snippet

```
Track USPS package <tracking number, digits only>. Read only.
browser_navigate https://tools.usps.com/go/TrackConfirmAction?tLabels=<NUM> and wait 4 s, then snapshot.
Read the status heading (e.g. "Delivered, Front Door/Porch", "In Transit to Next Facility") and the "Expected Delivery" text; a trailing * means estimated.
Click the "Tracking History" button, wait 1.5 s, snapshot again, and read up to 30 events (date and time, description, city and state).
If the page shows no tracking heading after 8 s, stop and report an Akamai block with the URL.
If the page shows a captcha, a sign-in or password prompt, a 2FA code request, or a payment step, stop, do not solve or bypass it, and report which wall appeared and the URL.
Never click Add Tracking Plus, Schedule Redelivery, or Hold for Pickup.
Take one screenshot. Report status, category, expected delivery, last location, origin, destination, the events table, and the screenshot path.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

- Status is the free-form heading text. Keep it verbatim and also bucket it. `delivered` for "Delivered" (any sub-state). `out_for_delivery` for "Out for Delivery". `in_transit` for "In Transit", "Arrived at", "Departed", "Accepted", "USPS in possession". `pre_shipment` for "Shipping Label Created", "Pre-Shipment", "Awaiting Item". `available_for_pickup` for "Available for Pickup", "Held at Post Office". `alert` for "Delivery Exception", "No Access", "Return to Sender", "Forwarded". `delivery_attempted` for "Delivery Attempted", "Notice Left". Anything else is `in_transit` with the raw text.
- A trailing `*` on the expected delivery date means it is an estimate.
- Not found renders "A status update is not yet available on your package. It will be available when the shipper provides an update or the package is delivered to USPS. Check back soon."
- API responses carry `trackingNumber`, `status`, `statusCategory`, `expectedDeliveryDate`, `originCity`, `originState`, `destinationCity`, `destinationState`, and `trackingEvents[]` with `eventTimestamp`, `eventType`, `eventCode`, `eventDescription`, `eventCity`, `eventState`, `eventZIP`, `eventCountry`. `expand=DETAIL` is required for the events.

### When blocked

- Akamai Bot Manager fronts `tools.usps.com/go/TrackConfirmAction*` and `m.usps.com/m/TrackConfirmAction*`. A non-browser request gets a 200 with about 220 KB of obfuscated `_abck` challenge JS and `Akamai-Grn` and `X-Akamai-Transformed` headers. In earlier testing a stealth browser on a residential proxy was required and the browser path was never run end to end there, so a box IP may not clear the challenge, not yet verified on a box. If the page has no tracking heading after 8 seconds, stop and report `blocked` with the URL.
- `TrackConfirmAjaxAction.action` returns 404 (`There is no Action mapped for namespace [/] and action name [TrackConfirmAjaxAction]`). The legacy `https://secure.shippingapis.com/ShippingAPI.dll?API=TrackV2` needs a registered USERID (`80040B1A Authorization failure` otherwise) and is being retired. Do not probe either.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass it. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
