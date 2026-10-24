---
name: site-playbooks-costco
description: >-
  Costco site playbook: costco.com product price and availability, or a Same-Day
  cart.
---
# Site playbook: Costco

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

Jobs in this file: Costco.com product page price and warehouse availability; Costco Same-Day cart from a grocery list.

The first section is read only on `www.costco.com`, the retail site. The second builds a grocery cart on `sameday.costco.com`, a separate storefront. Paste the one that matches the site, never two.

## Costco.com product page price and warehouse availability

### When to use

The user has a costco.com product URL or item number, or names a product sold on costco.com, and wants its online price, whether it is in stock online, and what the page says about warehouse availability. Read only: nothing goes in a cart, no sign-in, no membership purchase. Groceries delivered from a warehouse are the Same-Day section, a different site.

### Fastest path

Product pages are server rendered. One curl in the box shell reads the price from the `ProductSchema` JSON-LD block; stock comes from the rendered page. Dispatch the browser subagent in the same round for the fulfillment card, and stop it with `StopSubagent` if the curl parses and the user asked only for the price.

```
curl -sL -m 15 "https://www.costco.com/p/-/<slug>/<itemId>" -o pdp.html
grep -o '<script id="ProductSchema"[^>]*>[^<]*</script>' pdp.html
```

A HEAD request gets the Kasada 429 and a GET may too, which is why the browser runs beside the curl. The search page's server HTML has no result tiles, so a name is resolved in the browser. Legacy `<slug>.product.<itemId>.html` URLs redirect to the `/p/-/` form.

### Dispatch snippet

```
On costco.com, read price and stock for <product URL, item number, or name>. Read only: never add to cart, sign in, or buy a membership.
Open <https://www.costco.com/p/-/<slug>/<itemId>, or https://www.costco.com/s?keyword=<url-encoded name> then its first match>; wait 4 s after each load.
Run the page script async (page) => page.locator('script[type="application/ld+json"]').allTextContents() for title, url (ends in the item number), brand, image, rating, price.
Read the price label (Online or Warehouse Price), stock (Out of Stock, Low Stock, or Add to Cart), and the fulfillment card's ZIP and warehouse. If its ZIP differs from one given, set it once there and re-read.
"Sign In for Price" is member_price_hidden; never sign in. "Warehouse pricing or availability may vary" with no warehouse stock shown is warehouse_unverified.
On a 429 or blank page, reload once after 5 s. On a captcha, sign-in, 2FA, payment prompt, or second 429, stop and report it with the URL.
Take one screenshot. Report URL, title, item number, brand, image URL, rating, price and label, online stock, the card's ZIP, warehouse and stock note, screenshot path.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

- JSON-LD: `offers.price` and `offers.priceCurrency` are the online price, `sku` the internal SKU, `name` the title, the item number is the last path segment of `url`, and `brand.name`, `image`, and `aggregateRating` (`ratingValue`, `ratingCount`) give the brand, picture and rating. `offers.availability` can read `OutOfStock` while the page lists a price, so take stock from the rendered page and the fulfillment card (`data-testid="fulfillment-zipCode-and-warehouse-selector"`), not from the JSON-LD.
- `Online Price` marks a delivered price and `Warehouse Price` a warehouse one. `Warehouse pricing may vary` or `Item may be available in your local warehouse` is not a stock promise: report `warehouse_unverified`. `Sign In for Price` is `member_price_hidden`.

### When blocked

- HTTP 429 with Kasada headers in the shell is not a reason to retry the curl; use the browser helper already dispatched. In the browser, a 429 or a blank page gets one reload after 5 s, then report `edge_blocked` with the URL.
- No `ProductSchema` block in `pdp.html` means the browser path. Do not scrape search results in the shell.
- `Sign In for Price` means stop for the price. The parent asks the user whether to sign in and, if yes, takes credentials through `RequestUserForm`; the helper never signs in on its own.
- Stop and report if any page asks for a password, a 2FA code, a captcha, a membership purchase, or a payment, naming the wall and the URL. Do not try to solve or bypass it.

## Costco Same-Day cart from a grocery list

### When to use

The user gives a grocery list and wants the best matching Costco Same-Day products added to the cart, ready to review. The parent needs the item list and, optionally, a delivery ZIP. The result is one chosen product with price per list item, whether it came from purchase history, and the final cart count. The skill stops at the cart and never checks out. This is `sameday.costco.com`, not the retail site in the section above.

### Fastest path

`browser_navigate` to `https://sameday.costco.com/`. The page offers two buttons, `Sign in via Costco.com` and `Browse as a guest`. Click `Browse as a guest` unless the user's Chrome is already signed in, then wait for the load (about 10 seconds). You land on `https://sameday.costco.com/store/costco/storefront` with a header button `View Cart. Items in cart: N`.

Search is URL driven, so skip the search box. One navigation per list item, then wait 3 seconds for results.

```
https://sameday.costco.com/store/costco/s?k=<URL-encoded query>
https://sameday.costco.com/store/costco/s?k=organic%20milk
```

In earlier testing there is no anti-bot on the storefront, search, or add surfaces, and the internal Instacart backend is session-token gated, so the rendered storefront is the only path.

### Dispatch snippet

```
On Costco Same-Day, add these to the cart and stop at the cart: <item list>. Never check out or pay.
browser_navigate https://sameday.costco.com/ and click "Browse as a guest" (skip if already signed in), wait about 10 s.
Open https://sameday.costco.com/store/costco/buy_it_again. If it lists past purchases, prefer those for matching items; if it says "Reordering is a breeze", note history unavailable.
For each item, browser_navigate https://sameday.costco.com/store/costco/s?k=<url-encoded item>, wait 3 s, snapshot.
Pick the first genuine match (prefer Kirkland Signature), click its "Add 1 ct <name>" button, wait 2 s, and confirm "View Cart. Items in cart: N" went up by one.
If a Costco.com sign-in page, a 2FA code, a captcha, or a payment prompt appears, stop and report it with the URL.
Take one screenshot at the end. Report the delivery ZIP from the header, each item with chosen product and price, whether it came from purchase history, anything with no match, the final cart count, and the screenshot path.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Snapshots are large (500 to 700 refs), so look only for `Add 1 ct`, `Current price`, and `Items in cart`. The delivery ZIP appears in the header `Delivery <ZIP>` button and is set from the egress IP. Product prices and availability are ZIP specific, so report the ZIP you actually got, or set it through that button first if the user gave one.

### When blocked

- `Sign in via Costco.com` leaves the storefront for Costco's own SSO. If a password page appears, stop, report the sign-in wall and URL, and continue as a guest only if the Task text allows it.
- `/store/costco/storefront` and `/store/costco/buy_it_again` redirect to `/?next=...` until the guest or sign-in choice is made in the same session. Make that choice first, then navigate.
- In earlier testing no captcha or block appeared on a plain session, not yet verified on a box. If one does, stop and report.
- Stop and report if any page asks for a password, a 2FA code, a captcha, or a payment, naming the wall and the URL. Do not try to solve or bypass it.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
