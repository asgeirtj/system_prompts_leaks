---
name: site-playbooks-doordash
description: 'DoorDash site playbook: find stores, a menu, a cart, or a checkout read-back.'
---
# Site playbook: DoorDash

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

Jobs in this file: DoorDash menu extraction; DoorDash pickup or delivery order; DoorDash place after the widget's yes; DoorDash search and store discovery.

DoorDash has four sections. The menu section is read only. The order section builds the cart and stops at the checkout read-back. The place section places, and only after the question widget's yes. The search section, last in this file, is read only and finds open stores for a dish, a cuisine or a store name so the parent can resolve the `/store/` URL the order section needs. Paste the one that matches the step you are on, never two.

## DoorDash menu extraction

### When to use

The user wants the menu of a restaurant on DoorDash, either the template menu of a chain or a specific store's menu with its local prices. The parent needs a DoorDash URL, or a restaurant name plus city. The result is a list of categories with item name, price, description, tags such as Popular, and availability. Nothing is added to a cart.

### Fastest path

DoorDash has two URL surfaces for the same restaurant. Pick by input.

| Input | Surface |
|---|---|
| `/store/{slug}-{storeId}/` URL, per-store pricing wanted, or an independent restaurant | Browser path on `/store/...` (Cloudflare challenge) |
| `/business/{slug}-{businessId}/` URL, or a chain name where template pricing is enough | `curl` of `/business/.../menu` (server-rendered HTML, but it can get the same Cloudflare interstitial as `/store/`, see When blocked) |

Chain menu, one curl in the shell, with the browser subagent dispatched beside it. In earlier testing this returned 200 without a Cloudflare challenge on 2026-05-15. On a box on 2026-09-12 the same curl came back without parseable menu HTML (the parse step exited 1) and `WebFetch` of DoorDash timed out. Give the curl one try with `-m 10` and dispatch the browser subagent in the same round; if the curl returns menu HTML first, stop the helper with `StopSubagent` and use the curl result. Do not run the curl, watch it fail, and dispatch after; on the live run that order cost 49 seconds before the helper started.

```
curl -sL "https://www.doordash.com/business/{slug}-{businessId}/menu" -o menu.html
curl -sL "https://www.doordash.com/business/chipotle-mexican-grill-115/menu" -o menu.html
```

To resolve a chain name to a businessId, grep the public sitemaps in the box shell.

```
curl -sL "https://www.doordash.com/sitemap-business-doordash-index.xml" -o biz_idx.xml
curl -sL "https://cdn.doordash.com/sitemaps/sitemaps/sitemap-doordash-0-business-menu.xml" -o biz_smm.xml
grep -oE "/business/{slug-pattern}-[0-9]+/menu" biz_smm.xml | head -1
```

The menu sitemap index is `https://www.doordash.com/sitemap-business_menu-doordash-index.xml` (5 sharded sitemaps under `cdn.doordash.com/sitemaps/`). If no `/business/` page exists the restaurant is an independent, so use the Browser path with its `/store/` URL. `https://page-service.doordash.com/en-US/store/{slug}-{id}/` serves the same server-rendered HTML body.

### Dispatch snippet

```
Get the menu for <restaurant name> in <city>: categories in order, item names, and price strings. Read only, never add to cart or check out. If a password, 2FA, captcha, or payment prompt appears, stop and report it with the URL.
Sources, in order: <DoorDash /store/<slug>-<storeId>/ URL if known>, <the restaurant's own online ordering page if known>. Try each once. Report the first source that gives categories and prices and skip the rest.
If you have a /business/<slug>-<businessId>/ URL or the restaurant is a chain, run in the shell curl -sL -m 10 "https://www.doordash.com/business/<slug>-<businessId>/menu" -o menu.html once and parse the <script type="application/ld+json"> block (hasMenuSection[], hasMenuItem[], offers.price) or __NEXT_DATA__. If that fails, continue with the sources below.
For a /store/ URL, browser_navigate to https://www.doordash.com/store/<slug>-<storeId>/?pickup=true and wait 4 s. If the title is "Just a moment..." or the URL contains __cf_chl_tk after another 5 s, move to the next source.
If an address modal appears, fill input[placeholder='Address'] with "<city>, <state>", pick the first menuitem, click Save.
Scroll down six times (500 ms apart), snapshot once, read each region MenuItem-{itemId} for name and price. aria-disabled="true" means sold out.
Take one screenshot. Report: source used, URL read, categories in order with item name and price string, sold out marked, screenshot path. Skip descriptions and tags unless asked. On failure, the error and URL for each source tried.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Three embedded sources, in order of preference. Read them from `menu.html` in the box shell or, on a store page, with a page script.

```
async (page) => page.locator('script[type="application/ld+json"]').allTextContents()
async (page) => page.locator('#__NEXT_DATA__').textContent({ timeout: 5000 })
```

- JSON-LD `Restaurant` / `Menu` with `hasMenuSection[]`, `hasMenuItem[]`, `name`, `description`, `offers.price`, `offers.priceCurrency`. Cleanest source.
- `__NEXT_DATA__` with menu data under `props.pageProps.<...>.menu.categories[].items[]`. The shape changes occasionally, so parse defensively.
- HTML as last resort. `<h2 data-anchor-id="MenuItem-{itemId}">`, `<span data-anchor-id="MenuItem-Price">`, category headers as `<h2>` inside `<div data-anchor-id="StoreMenuList">`.

Price strings like `$13.65*` mean starting price with required modifiers and `$13.65+` means base price with optional add-ons. Keep the string as shown, strip the suffix for a numeric value, and flag `base_price`. Sold-out items carry `aria-disabled="true"` on the item region, so report them as unavailable instead of dropping them. Locale prefixes `/en-CA/`, `/en-AU/`, `/en-NZ/`, `/en-GB/`, `/fr-CA/` exist and show local currency, so keep `offers.priceCurrency`.

### When blocked

- `Timeout 25000ms` or `net::ERR_CONNECTION_CLOSED` on a `/store/` URL is not a Cloudflare challenge, and a retry does not help. On 2026-09-12 a helper hit the timeout once and the connection error twice on the same store URL inside four minutes.
- Every `/store/` URL sits behind a Cloudflare managed challenge (`<title>Just a moment...</title>`, `cType: 'managed'`, `cZone: 'www.doordash.com'`). In earlier testing only a JS-executing browser cleared it, and a box IP may hit the same wall. Once cleared, the `__cf_bm` cookie (about 30 minutes) carries across `/store/` pages.
- `/business/{slug}-{businessId}/menu` can return the same Cloudflare interstitial as `/store/`. An empty parse of `menu.html` (no JSON-LD, no `__NEXT_DATA__`) together with a `Just a moment...` title means browser only, and the parent does not retry the curl. With a `/store/` URL the helper takes the snippet's `/store/<slug>-<storeId>/?pickup=true` path at once; without one, resolve it with the search section at the end of this file first.
- A 403 with the DoorDash-branded error page ("We're having trouble loading the page you requested." with a Ray ID) is a block, not a challenge to wait out.
- `consumer-mobile-bff.doordash.com/v3/stores/{id}/` and `/v1/stores/{id}/menu` return `401 {"name":"authorization_invalid","message":"Access Denied"}` without a user JWT. `m.doordash.com` returns 500. Do not probe either.
- Stop and report if the page asks for a password, a 2FA code, a captcha, or a payment, naming the wall and the URL. Do not try to solve or bypass it.

## DoorDash pickup or delivery order

### When to use

The user has approved a restaurant. The parent holds the `/store/` URL from the menu read or the user's link, the exact items with options and quantities, pickup or delivery, and for delivery the address to confirm. The result is the cart and every checkout line read back, with nothing placed. Placing is its own dispatch with the next section's snippet, after the question widget's yes. A cart change after that widget spends the yes, so read the changed cart back and send a fresh widget before the place dispatch.

### Fastest path

One dispatch builds the cart and reads back checkout. Give it the `/store/` URL (with `?pickup=true` for pickup), the item list, and the stop rule. Never dispatch without the URL, and never point the helper at a past order to copy. On a live order on 2026-09-12 the parent steered the URL in by `MessageSubagent` after the helper had started, and the helper then left the store page for order history. That detour took ten rounds and about 85 seconds, with two navigations, a scroll hunt through order history, and a click by screen position, before the first item.

A change to the same cart goes to the same helper. While it runs, steer it with `MessageSubagent`. After it reports, call `Task` with `resume` and its id. If the resume is refused or the helper reports that its tab no longer shows the store, dispatch fresh with the URL. On the live order, fresh dispatches spent three to seven rounds choosing a tab and re-reading the page before they touched the cart.

A read-only menu dispatch that took the browser path reports the URL it ended on. When that is a `/store/` URL, carry it, and the item names as the menu spelled them, into this Task text. The `business_menu` fast path reports a `/business/` URL, which names a brand, not a location, and a menu that the helper got from another host reports that host's URL. The cart Task can use neither. Resolve the `/store/` URL first: the user's link, the account's order history in a read-only dispatch, a read-only dispatch to the `/business/` page that picks the user's location and reports the `/store/` URL it lands on, or the search section at the end of this file.

### Dispatch snippet

```
On DoorDash, build this <pickup|delivery> cart and stop at the checkout page without placing it: <item, options, quantity; one per line>.
browser_navigate https://www.doordash.com/store/<slug>-<storeId>/?pickup=true in the current tab (drop ?pickup=true for delivery), wait 4 s. On "Just a moment..." wait 5 s more, then stop and report the Cloudflare wall. If an address modal appears, fill input[placeholder='Address'] with "<city>, <state>", pick the first menuitem, click Save.
For each item, click it, set the listed options and quantity in the dialog, click the add control, and continue. Take a required option not listed here as the dialog's default and name it in the report. Do not open the cart between items.
Then open the cart once, check each line, click checkout, and read the checkout page. Never click the place-order control, a tip, a promo, or an upsell.
If a sign-in, password, 2FA, captcha, or new-payment prompt appears, stop and report it with the URL.
Take one screenshot. Report the store URL, pickup or delivery, each cart line with options, quantity, and price, subtotal, fees, tax, preselected tip, total, the store address and pickup time or the delivery address and ETA, any default you took, and the screenshot path.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### When blocked

- The Cloudflare challenge and the 401 endpoints from the menu section apply here too.
- Stop and report if the page asks for a sign-in, a password, a 2FA code, a captcha, or a new payment method. The parent handles those with `RequestUserForm` or `request_box_help` and dispatches again.
- If an item's required option is not in the Task text, take the default the dialog preselects and name it in the report. Do not stop for it.

## DoorDash place after the widget's yes

### When to use

The question widget for this exact cart came back yes, and nothing changed since. This snippet goes only into the place dispatch. It never goes into the cart Task, which is the section above.

### Fastest path

Resume the helper that read checkout back, with `Task` and `resume` and its id. Its tab still holds the checkout page, so the place is one click and one confirmation read. Give it the lines the widget read back so it can refuse a cart that drifted.

### Dispatch snippet

```
Place the DoorDash order now. The checkout page should be open in your tab with these lines: <lines the widget read back>. If it is not open, browser_navigate <the store URL the cart Task used, with ?pickup=true only for pickup> in the current tab, open the cart, and click checkout. If any line differs from the list above, stop and report the difference without placing.
Click the place-order control once. Dismiss post-order prompts (rate, tip more, share, add items) without accepting anything. Read the confirmation page and take one screenshot.
Report the order number if shown, the pickup time or ETA, the total charged, and the screenshot path. If no confirmation appears within 20 s, screenshot and report the page as it is. Do not click the place-order control again.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### When blocked

- A sign-in, password, 2FA, captcha, or new-payment prompt means stop and report with the URL, as in the cart section.
- No confirmation within 20 seconds means screenshot and report the page as it is. Do not click the place-order control a second time.

## DoorDash search and store discovery

### When to use

The user names a dish, a cuisine, or a store (a restaurant, a grocery, a convenience or retail store on DoorDash) and an address or a city, and wants to know which stores are open, with ETA and fees, or the parent needs a `/store/` URL for the menu or order section and has none. Read only. Nothing goes in a cart, no address is saved to an account, no sign-in.

### Fastest path

Browser only, behind the same Cloudflare edge as `/store/`. Give the helper the search URL with the term URL-encoded and the address to set.

```
https://www.doordash.com/search/store/<term>/
https://www.doordash.com/search/store/tacos/
```

The "Just a moment..." check clears on its own in about 6 s, then the page renders "Results for `<term>`" with an address control and store cards, each linking to a `/store/` URL. Curl gets a 403 error page.

When the page is not a results list, the snippet falls back to a search from the home page.

### Dispatch snippet

```
On DoorDash, find stores for "<term>" near <address or city, state> and report them. Read only: never add to cart, check out, sign in, or save anything.
browser_navigate https://www.doordash.com/search/store/<url-encoded term>/ in the current tab, wait 4 s. On "Just a moment..." wait 5 s more; if it stays, or the URL contains __cf_chl_tk, stop and report the Cloudflare wall. If the page is not a list of stores, browser_navigate https://www.doordash.com/, search for "<term>" from the page's search control, wait 4 s.
If an address modal appears, fill input[placeholder='Address'] with "<address or city, state>", pick the first menuitem, click Save. If the header shows a different address, change it through that header control once; if it will not change, report the address DoorDash used.
Scroll down twice (500 ms apart), snapshot once. For up to <N> stores read name, open or closed, ETA, delivery fee, rating if shown, and the /store/<slug>-<storeId>/ link the card points to. Do not open store pages.
If a sign-in, password, 2FA, captcha, or payment prompt appears, stop and report it with the URL.
Take one screenshot. Report the address used, the term, one line per store with those fields and its /store/ URL, and the screenshot path. On failure, the error and URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Each store line carries the `/store/{slug}-{storeId}/` URL. That URL, with `?pickup=true` for pickup, is what the menu section's browser path and the order section's Task text take. A `/business/` URL names a brand and not a location, so do not substitute one. ETA and fee are for the address the helper reports, not the user's saved address, so read the address line before quoting them. A store shown closed still has a menu and a `/store/` URL, so keep it in the list and mark it closed.

### When blocked

- The Cloudflare rules from the menu section apply. A 403 with the DoorDash-branded error page is a block, not a challenge, and waiting does not clear it; report `cloudflare_blocked` with the URL.
- A results list with no store cards after the address is set means the term found nothing at that address.
- Retry once with a broader term (the cuisine instead of the dish), then report `no_stores_found` with the address used.
- If the address modal will not accept the address, or the header address cannot be changed, report the address DoorDash used and let the parent decide. Do not sign in to change a saved address.
- Stop and report if the page asks for a sign-in, a password, a 2FA code, a captcha, or a payment. The parent handles those with `RequestUserForm` or `request_box_help`.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
