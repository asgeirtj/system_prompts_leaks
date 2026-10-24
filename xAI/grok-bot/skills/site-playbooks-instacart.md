---
name: site-playbooks-instacart
description: 'Instacart site playbook: search and add groceries to a cart, guest first.'
---
# Site playbook: Instacart

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## Instacart search and add to cart as a guest

### When to use

The user wants grocery items priced and placed in an Instacart cart, or a real-time basket total from nearby retailers. The parent needs the item list and, if it matters, the retailer slug. The result is the cart contents with name, size, unit price, deals, and subtotal, plus the storefront URL. This skill adds to a cart, so the Task text must list the items. It runs as a guest first. It never logs in on its own, never enters an address or payment, never checks out. When a storefront has no guest cart, the parent arranges a signed-in session (see When blocked) and dispatches the same steps again.

For a lookup with no cart, such as prices or photos to show the user, write a read-only Task text from the Fastest path that asks for each top result's product page URL and the image URL from that page.

### Fastest path

Open a search surface with `browser_navigate` and wait about 3.5 seconds for the retailer carousels to render.

| Intent | URL |
|---|---|
| Cross-retailer search across nearby stores | `https://www.instacart.com/store/s?k={query}` |
| One retailer's storefront | `https://www.instacart.com/store/{retailer}/storefront` |
| Search inside one retailer | `https://www.instacart.com/store/{retailer}/s?k={query}` |

`{retailer}` is the storefront slug, for example `safeway`, `costco`, `kroger`, `7-eleven`, `grocery-outlet`. Example `https://www.instacart.com/store/s?k=milk`. The form `/store/{retailer}/search/{query}` returns 404. There is no public guest-cart API, so the browser is the only path.

Each search result card links to the product's own page, `https://www.instacart.com/products/{id}-{slug}?retailerSlug={retailer}`. The snapshot shows the card as a button without that URL. The snippet's links page script reads each card's name and `href` while the results are on screen, and a click on the card opens the page. The HTML that `curl` fetches for a product page carries a JSON-LD `Product` with the name, size, price, stock, and image URL. A search page's HTML carries no results.

### Dispatch snippet

```
On Instacart, add these items to a cart and report the cart: <item list>. Prefer retailer <retailer slug or any>. Do not log in, enter an address or payment, or check out.
browser_navigate to https://www.instacart.com/store/<retailer>/s?k=<query> (or https://www.instacart.com/store/s?k=<query> for any retailer), wait 3.5 s, snapshot.
Then run the page script async (page) => { const o = {}; for (const e of (await page.locator('[href*="/products/"]').all()).slice(0, 40)) o[new URL(await e.getAttribute('href'), 'https://www.instacart.com').href] ||= ((await e.getAttribute('aria-label')) || (await e.textContent()) || '').replace(/\s+/g, ' ').trim().slice(0, 99); return o; }; keep each added item's URL.
First add: browser_click the "Add 1 ct <name>" button, wait 2.5 s. A "$0 delivery fee on your first 3 orders" dialog will appear and cannot be closed, ignore it. If a sign-in dialog opens instead and the button never becomes "Decrement quantity of <name>", stop and report guest_add_blocked with the retailer and the URL.
Every later add: run the page script async (page) => page.locator('button[aria-label="Add 1 ct <name>"]').first().dispatchEvent('click'), wait 2 s, confirm the button became "Decrement quantity of <name>".
Open the cart with the page script async (page) => page.locator('header button').filter({ hasText: /delivery fee|View Cart/i }).first().dispatchEvent('click').
Read the dialog matching /Personal .* Cart/i for item lines and "Item subtotal", take one screenshot.
If a captcha, sign in or password, 2FA, or payment prompt appears, stop and report it with the URL.
Report retailer, ZIP, storefront URL, each item with size, price, and product page URL from the links script, subtotal, the $ minimum to checkout, anything you could not add, and the screenshot path.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

The cart drawer is a second `<div role="dialog">` titled `Personal {Retailer} Cart, Shopping in {ZIP}`. Filter dialogs by text (`/Personal .* Cart/i` for the cart, `/delivery fee on your first 3 orders/` for the fee dialog), never by position. Extract with the page script below.

```js
async (page) => {
  const d = page.locator('[role=dialog]').filter({ hasText: /Personal .* Cart/i }).first();
  if ((await d.count()) === 0) return { error: 'cart-drawer-not-open' };
  const items = (await d.locator('li, [class*=cart-item], [class*=CartItem]').allTextContents()).map((t) => t.replace(/\s+/g, ' ').trim()).filter((t) => t.length > 5 && /\$/.test(t));
  const m = ((await d.textContent()) ?? '').match(/Item subtotal[^$]*\$([0-9.]+)/);
  return { item_lines: items.slice(0, 50), subtotal: m ? '$' + m[1] : null };
}
```

Each line carries name, size, current price, any strikethrough original price, and the deal label. The drawer also shows `Item subtotal`, `$X Min. to checkout` (usually $10), and the delivery fee progress. The ZIP comes from the egress IP and `?zip_code=` in the URL is ignored, so the retailer set is whatever the box's IP geolocates to. Change it only through the ZIP button in the header.

### When blocked

- The site runs behind an Akamai/PerimeterX-style edge with invisible reCAPTCHA (site key `6LeN0vMZAAAAAIKVl68OAJQy3zl8mZ0ESbkeEk1m`) on every page. In earlier testing a plain session rendered an empty retailer list or escalated to the captcha and a stealth residential session was needed, so a box IP may see the same; not yet verified on a box.
- Tells are an empty search page after 3.5 seconds or repeated XHR 403s.
- If the dialog is up and a ref click "succeeds" but the counter does not move, that is the overlay. Use the page-script click.
- At storefronts with no guest cart a sign-in modal opens on the first add: the add does not land even after the page-script click, the button never becomes the decrement control, and the dialog stays. That is a sign-in wall, not the fee dialog; the helper stops and reports `guest_add_blocked` with the retailer and the URL. Do not retry the guest snippet or another guest search. The parent tells the user that retailer needs a signed-in session, gets one (credentials through `RequestUserForm`, or a hand-off so the user signs in on the box), and dispatches the same snippet again in that session; the helper still never logs in itself.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
