---
name: site-playbooks-opentable
description: >-
  OpenTable site playbook: open tables at a restaurant or in an area, and
  booking one.
---
# Site playbook: OpenTable

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## OpenTable availability

### When to use

The user wants open tables on OpenTable for a party size, a date, and a time or window, at a named restaurant or for a cuisine in an area. You need the party size, the date, the time, and either the restaurant's OpenTable page or a search term with the neighborhood and city. The result is the open times near the requested time with their seating labels, and any deposit or card notice, or a sold-out or not-bookable outcome. Nothing is booked.

### Fastest path

The browser is the path. OpenTable's JSON endpoints sit behind a bot wall, so do not call them from the shell.

Put a URL that already carries the party size and time in the Task, so the subagent reads times instead of working the pickers.

- A named restaurant. Find its page with `WebSearch` for the name, city, and "OpenTable", which usually returns `https://www.opentable.com/r/<slug>`. Open `https://www.opentable.com/r/<slug>?covers=<N>&dateTime=<YYYY-MM-DD>T<HH:MM>:00`.
- A cuisine or area. Open `https://www.opentable.com/s?covers=<N>&dateTime=<YYYY-MM-DD>T<HH:MM>:00&term=<cuisine neighborhood city>`.

### Dispatch snippet

```
Check OpenTable availability for <restaurant, or cuisine in neighborhood, city>, <N> people, <weekday YYYY-MM-DD>, around <HH:MM>. Read only.
Open <restaurant page or search URL>.
Report each restaurant's name, its open times within <window> of <HH:MM> with any seating or experience label, any deposit or card notice the page already shows, and the page URL. At most <K> restaurants.
OpenTable notes, for checking open tables or booking on OpenTable. Skip them for any other job, and follow the task above where it says otherwise. The URL the task gives sets the party size and time, so read the times on that page. Use the page's date, time, or party controls only if those controls show something else, and only once. The time buttons' hidden labels can name a different party size, so trust the party control. A search covers the whole city even when the term names a neighborhood, so choose results by the neighborhood on each card. Never build other OpenTable URLs. If the tab crashes or goes blank without an error code, open the same URL once more. If the times are still loading, wait once, then take one snapshot; do not snapshot a loading page again and again. Access Denied, a challenge page, or a blocked response will not clear on reload, so stop and report it with the URL. On an availability check, never click a time, because that holds the table. Before completing a booking, check that the details page shows the requested party size. A page that asks for a password, a code, or a card number ends the task, so report its URL. If the requested time is gone, report the nearest open times on that page. On an availability check, report as soon as the requested date's times are on screen.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Times are the restaurant's local time. A time with a marker or an experience name is a special seating that is often prepaid. A no-online-availability message or a notify option means nothing is bookable online at that time.

Offer the times the subagent saw, an adjacent day, or the restaurant's phone line, as the `restaurant-booking` skill describes.

### When blocked

Access Denied or a blocked response from OpenTable does not clear on reload. Tell the user OpenTable blocked the check and send them the restaurant page URL. A timeout or a crashed tab is a slow page, not a block, so do not report it as one.

### Booking

A booking goes out only after the user's yes, as the `restaurant-booking` skill describes. Write that Task yourself, since the snippet above is read only. The box browser may already be signed in to OpenTable, so dispatch before asking for a sign-in. Give the restaurant URL with the confirmed date, time, and party. Say the user confirmed that slot, give only the guest details you have, and ask for the confirmation number and a screenshot. The subagent stops at a page that asks for a password, a code, or a card number and reports its URL. Hand those to the user through the sign-in and payment steps in `restaurant-booking`.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
