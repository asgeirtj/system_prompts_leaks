---
name: site-playbooks-fedex
description: >-
  FedEx site playbook: track a package, not label creation, proof of delivery or
  refunds.
---
# Site playbook: FedEx

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## FedEx package tracking

### When to use

The user pastes a FedEx tracking number and asks where the package is, when it arrives, or who signed for it. The parent needs the tracking number only. The result is current status, last known location, scheduled or estimated delivery window, service type, signed-by name, and the scan events. Nothing about the shipment is changed.

### Fastest path

`browser_navigate` to the tracking deep link and wait 4 seconds, since the tracking detail is a JS app that renders 1 to 3 seconds after load.

```
https://www.fedex.com/fedextrack/?trknbr={NUMBER}
https://www.fedex.com/fedextrack/?trknbr=394002115586
```

Use `trknbr=`, not `trackingnumber=`, which can bounce through the landing page. Put one number in each URL. Comma-joined batches (`trknbr=A,B,C`) can land on a system-error page, so look several numbers up one after another in the same Task.

The official Track API, `POST https://apis.fedex.com/track/v1/trackingnumbers` with a Bearer token from `POST https://apis.fedex.com/oauth/token` (`grant_type=client_credentials&client_id={ID}&client_secret={SECRET}`), a JSON body `{"includeDetailedScans": true, "trackingInfo": [{"trackingNumberInfo": {"trackingNumber": "{NUMBER}"}}]}`, and `X-locale: en_US`, needs a project registered at `developer.fedex.com`, so use it only when the box already has the credentials.

### Dispatch snippet

```
Track FedEx package <tracking number>. Read only, never schedule, hold, redirect, or enter an address.
browser_navigate https://www.fedex.com/fedextrack/?trknbr=<NUMBER>, wait 4 s, then check the URL. /detailedtracking is a single shipment, /multitrkidsummary lists several, /multitrkidnotfound or /no-results-found is not found, /duplicate-results needs a trkqual, /guestAuthentication or /howtoproceed is a private shipment (stop and report).
One number per URL; for several numbers repeat these steps for each, never comma-join them.
If the URL lands on /system-error, wait 5 s and navigate to the same URL once more; if it lands there again, stop and report system_error with the URL and the page text.
Snapshot and read the status heading (Delivered, On the way, Pending), the service line, the Scheduled delivery or Delivered row, and "Signed for by:".
Click "Travel history", snapshot, and read every scan event (timestamp, location, description).
If you see Access Denied or only an empty shell after the wait, stop and report the Akamai wall with the URL.
If the page shows a captcha, a sign-in or password prompt, a 2FA code request, a ZIP verification, or a payment step, stop, do not solve or bypass it, and report which wall appeared and the URL.
Take one screenshot. Report status, service, last location, delivery window or actual delivery, signed by, events oldest first, and the screenshot path.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

- Web view. Status heading, service line, delivery row, "Signed for by:" value, and the travel history rows with timestamp, location, description, newest first.
- API view. Data is at `output.completeTrackResults[i].trackResults[j]`.
- Status. `latestStatusDetail.code` is `DL` delivered, `OD` out for delivery, `IT` in transit, `PU` picked up, `OC` order created, `SE` shipment exception, `CA` canceled, with `latestStatusDetail.description` and `statusByLocale`.
- Location. `latestStatusDetail.scanLocation` (`city`, `stateOrProvinceCode`, `countryCode`) or `scanEvents[0].scanLocation`.
- Delivery. `estimatedDeliveryTimeWindow.window.{begins,ends}`, else `standardTransitTimeWindow.window.ends` or `dateAndTimes[]` where `type` is `ESTIMATED_DELIVERY` or `ACTUAL_DELIVERY`.
- Service. `serviceDetail.type` (`FEDEX_GROUND`, `GROUND_HOME_DELIVERY`, `FEDEX_EXPRESS_SAVER`, `PRIORITY_OVERNIGHT`, `INTERNATIONAL_PRIORITY`, `GROUND_ECONOMY`, formerly `SMART_POST`).
- Signature. `deliveryDetails.receivedByName` with `deliveryDetails.signatureType` (`DIRECT`, `INDIRECT`, `ADULT`, `NO_SIGNATURE_REQUIRED`, where the name is null).
- Events. `scanEvents[]` with `date`, `eventType`, `eventDescription`, `scanLocation`, `exceptionCode`, `exceptionDescription`, `delayDetail.{status,type,subType}`, newest first.
- Not found in the API is `output.alerts[]` with `TRACKING.DATA.NOTFOUND.404`. Private shipments give `TRACKING.AUTHORIZATION.ERROR` or `TRACKING.AUTHENTICATEDDELIVERY.ERROR`. Data is purged after about 18 months.

### When blocked

- Every fedex.com page is behind Akamai (cookies `_abck`, `ak_bmsc`, `bm_mi`, `bm_sz`, `fdx_cbid`, `fdx_bman`). In earlier testing a plain session got an Access Denied HTML page and a stealth browser on a residential proxy was required, so a box IP may hit the same wall, not yet verified on a box. If the page shows Access Denied or still shows only the empty shell after the wait, stop and report the wall and URL.
- A label the shipper created recently returns not found or a system-error page until the first carrier scan.
- When the shipper's email shows no pickup or drop-off scan yet, report `pre_transit_unscanned`, not `not_found`, take the ship date and expected delivery from that email, and do not re-dispatch in the same turn. A system-error page that persists after the one retry on a number already scanned is a FedEx-side failure: report `system_error` and use the shipper's email, or the Track API when credentials are already on the box.
- The internal `/trackingCal/track` XHR is bound to those cookies and returns 403 or "FedEx Page Not Found" from the shell. Do not `curl` it.
- 16-character numbers are Delivery Manager confirmation codes and redirect to a different flow. Standard numbers are 12, 15, or 22 digits.
- A sign-in or ZIP verification prompt is the private-shipment wall. Stop and report.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass it. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
