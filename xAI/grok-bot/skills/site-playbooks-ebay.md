---
name: site-playbooks-ebay
description: 'eBay site playbook: find, price, or check a product listing.'
---
# Site playbook: eBay

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

Jobs in this file: eBay search products; eBay item page.

## eBay search products

### When to use

The user wants eBay listings for a keyword, optionally scoped by category, condition, price, location, format, or seller, or wants recent sold prices ("what did an iPhone 12 sell for"). The parent needs the query and any filters; a full `/sch/i.html` URL can be used as is. The user gets a table of listings with item id, title, condition, price, shipping, location, seller, and `/itm/<itemId>` URL, plus the page result count. Read only. A known item id or a pasted `/itm/` URL is the item page section below, not a search.

### Fastest path

Build the search URL and `browser_navigate` to it. There is no usable HTTP path; in earlier testing a plain fetch is redirected to `/splashui/challenge`, and eBay's Browse API (`api.ebay.com/buy/browse/v1/item_summary/search`) needs approved developer credentials. Base is `https://www.ebay.com/sch/i.html` with these parameters.

| Parameter | Meaning |
|---|---|
| `_nkw=<query>` | Keyword, URL encoded with `+` for spaces. The only required field. |
| `_sacat=<id>` | Category leaf id (`183454` CCG Individual Cards, `9355` Cell Phones & Smartphones) |
| `LH_ItemCondition=<code>` | `1000` New, `1500` New other, `1750` New with defects, `2000` Manufacturer refurbished, `2010` Certified refurbished, `2020` Excellent refurb, `2030` Very Good refurb, `2500` Seller refurbished, `3000` Used, `4000` Very Good (books/media), `5000` Good, `6000` Acceptable, `7000` For parts or not working. Union as `1000\|1500`. |
| `LH_BIN=1` / `LH_Auction=1` / `LH_BO=1` | Buy It Now only / Auction only / Best Offer enabled |
| `LH_FS=1` | Free shipping |
| `LH_Sold=1&LH_Complete=1` | Sold and completed, for comp pricing. Always pair both. Sometimes challenged when signed out; see When blocked. |
| `LH_PrefLoc=<n>` | `1` US Only, `2` North America, `3` Worldwide, `4` Europe, `5` Asia |
| `LH_TopRatedPlus=1` | Top Rated Plus sellers only |
| `LH_TitleDesc=1` | Search title and description |
| `_udlo=<n>` / `_udhi=<n>` | Price min / max, integer dollars |
| `_stpos=<ZIP>&_dmd=<mi>` | Within X miles of ZIP. Without `_stpos` eBay infers the shipping ZIP from the box IP and prices delivery against it. |
| `_sasl=<seller>&_saslop=1` | Only this seller |
| `_ipg=<n>` | Items per page, `60`, `120`, or `240` only; anything else coerces to 60 |
| `_pgn=<n>` | Page number, 1 indexed |
| `_sop=<n>` | Sort. `12` Best Match (default), `1` Ending soonest, `10` Newly listed, `2` Price lowest, `3` Price highest, `15` Price+Shipping lowest, `16` Price+Shipping highest, `7` Distance nearest |

Worked examples.

```
https://www.ebay.com/sch/i.html?_nkw=vintage+Levi+501+size+32&_ipg=60
https://www.ebay.com/sch/i.html?_nkw=iphone+12&LH_Sold=1&LH_Complete=1&_ipg=60
https://www.ebay.com/sch/i.html?_nkw=Charizard&_sacat=183454&LH_ItemCondition=3000&_sop=15&_ipg=60
```

### Dispatch snippet

```
Search eBay for "<query>" <filters>. Read only, never click Buy It Now, Place bid, Make offer, Add to Watchlist, Add to cart, or Sign in.
Open https://www.ebay.com/sch/i.html?_nkw=<query with + for spaces>&_ipg=60<&LH_Sold=1&LH_Complete=1 for sold comps><&_udlo=<min>&_udhi=<max>><&LH_ItemCondition=<code>><&_sop=<n>>. Wait 2.5 s.
If the title is "Access Denied", "Error Page | eBay", or "Pardon Our Interruption", or a captcha, sign in or password, 2FA, or payment prompt appears, stop and report the wall and the URL. Do not reload and do not open another eBay URL.
With a page script iterate li.s-card and read a.s-card__link href (item id is the /itm/(\d{8,}) part), .s-card__title, .s-card__subtitle, .s-card__price, .s-card__image img src, and the .s-card__attribute-row and .s-card__footer--row texts.
Drop the "Shop on eBay" placeholder card (item id 123456 or no data-listingid).
Split a price like "$92.92$109.32" into price and was price. Subtitle segment 0 is the condition.
Flag a card as sponsored if its last row, with U+2063 and whitespace stripped, reads "sponsored".
Read h1.srp-controls__count-heading for the result count. Take one screenshot.
Report a table of itemId, url https://www.ebay.com/itm/<id>, title, image src, condition, price, was price, shipping, location, seller, format, watchers or sold count, sponsored.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

- The legacy `.s-item__*` selectors no longer match. Use `.s-card__title`, `.s-card__subtitle`, `.s-card__price`, `.s-card__attribute-row`, `.s-card__footer--row`.
- `data-listingid` on the `<li>` is an internal tracking id, not the item id. Always take the item id from the `/itm/(\d{8,})` part of the href.
- The price node concatenates sale and strikethrough with no separator, `$92.92$109.32`. Parse with `/^(\$[\d,.]+)(\$[\d,.]+)?$/`; capture 2 is the was price. Ranges read `$0.99 to $3.00`.
- The subtitle is condition plus item specifics joined by ` · ` (`Pre-Owned · Size 32`). `[0]` is the condition, the rest are specifics.
- Classify each attribute row by regex.

| Field | Regex |
|---|---|
| buyFormat | `/buy it now\|or best offer\|best offer accepted\|auction/i` |
| bidCount | `/^(\d+)\s+bids?\b/i` |
| shipping | `/^\+\$\|^free delivery\|^free shipping\|delivery$\|shipping$/i` |
| location | `/^located in /i` |
| returnsAccepted | `/^free returns$/i` |
| watchers | `/^(\d+)\s+watchers?\b/i` |
| soldCount | `/^(\d+)\s+sold\b/i` |
| coupon | `/coupon\|% off/i` |
| seller | `/^(\S+)\s+(\d+(?:\.\d+)?)%\s+positive\s+\(([^)]+)\)/i` (`34.3K` is 34300, `1.4M` is 1400000) |
| skip | `/^view similar active items$\|^sell one like this$/i` |

- The sponsored marker in the last row is obfuscated with U+2063 and decoy letters, so `includes("Sponsored")` is false. Strip `[\u2060-\u2064\u200B-\u200D\uFEFF]` and whitespace, lower case, then test for `sponsored`.
- The result count reads `776 results for ...` or `18,000+ results for ...`; a `+` means approximate. "Authenticity Guarantee" appears as a row only in supported categories (`_sacat=15709` sneakers, `14324` watches, `169291` handbags, trading cards over $250).
- Sold mode uses the same selectors. The bid row is the final count (`41 bids`), `Best offer accepted` marks an OBO sale, the seller row surfaces reliably, and `.s-card__price` is the sold price. The per card sold date has no stable selector; the item page shows `Sold on <date>` under `.x-item-sold-history`.
- Item page (`https://www.ebay.com/itm/<itemId>`) selectors. Title `h1.x-item-title__mainTitle span.ux-textspans`, price `.x-price-primary .ux-textspans`, bids `.x-bid-count .ux-textspans`, time left `.ux-timer__time .ux-textspans` (plus `<meta itemprop="endDate">`), condition `.x-item-condition-text .ux-textspans`, seller `.x-sellercard-atf__info__about-seller a` and `.x-sellercard-atf__data-item-block`, shipping `.ux-labels-values--shipping`, specifics `.ux-layout-section-evo__item--table-view dl`, images `.ux-image-carousel-item img`, canonical `<link rel="canonical">`.

### When blocked

- eBay is fronted by Akamai. Tells are a page title of exactly `Access Denied` with a `Reference #` line and an `errors.edgesuite.net` link, `Pardon Our Interruption...` at `/splashui/challenge`, or an HTTP 403 whose title is `Error Page | eBay` with a `SORRY` headline and a `reference-id` line. It shows on `/sch/`, `/itm/`, and the homepage, while a HEAD request returns 200 with an empty body, so a status check proves nothing. `m.ebay.com` and `&_rss=1` are gated the same way.
- In earlier testing, 40 to 60 percent of fresh cloud sessions were blocked on first navigation even with stealth and residential proxies, and the fix was rotating to a new IP, which the box cannot do. The box is challenged often, so plan the next step before you dispatch.
- The first challenge ends searching in that session. Repeated `/sch/` navigations in one session make the block worse, so the subagent does not try a second query, a narrower query, a homepage warmup, or the same URL again. It reports the wall, the title and the URL and stops. Do not try to solve the challenge.
- The parent's next step, in this order. Hand the box to the user for one verification, then resume the same subagent on the same URL; or open a user-pasted `/itm/` URL with the item page section below; or move to the off-site sources the Task names. Do not dispatch a second eBay subagent for the same query, and do not report prices from a page that never rendered.
- Sold and completed searches (`LH_Sold=1&LH_Complete=1`) often work signed out and are sometimes challenged on the first sold URL. When one is challenged, offer the user a box hand-off to sign in to eBay and resume the same URL; do not dispatch another signed-out sold search. Credentials never go in the Task text.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## eBay item page

### When to use

The user has an eBay item id or pasted a `/itm/` URL and wants the current state of that one listing: title, price, format (auction with a bid count, or Buy It Now), time left and end date, condition, seller, shipping, and item specifics. Also the fallback when a search was challenged and the user pastes the listing instead. The parent needs the item id or URL and nothing else. Read only.

### Fastest path

`browser_navigate` to `https://www.ebay.com/itm/<itemId>`; a pasted URL with a slug or query string works as is. There is no HTTP path (the same 403 `Error Page | eBay` as search). The selectors are the item page ones under Read the result in the search section. One navigation per item, only for the ids the user named.

### Dispatch snippet

```
Read eBay item <itemId>. Read only, never click Buy It Now, Place bid, Make offer, Add to Watchlist, Add to cart, or Sign in.
Open https://www.ebay.com/itm/<itemId>. Wait 2.5 s.
If the title is "Access Denied", "Error Page | eBay", or "Pardon Our Interruption", or a captcha, sign in or password, 2FA, or payment prompt appears, stop and report the wall and the URL. Do not reload and do not open another eBay URL.
With a page script read h1.x-item-title__mainTitle span.ux-textspans, .x-price-primary .ux-textspans, .x-bid-count .ux-textspans, .ux-timer__time .ux-textspans, the content of meta[itemprop="endDate"], .x-item-condition-text .ux-textspans, .x-sellercard-atf__info__about-seller a, .x-sellercard-atf__data-item-block, .ux-labels-values--shipping, the .ux-layout-section-evo__item--table-view dl pairs, link[rel="canonical"] href, and meta[property="og:image"] content.
Format is auction when the bid count node is present, otherwise Buy It Now. For an ended listing read .x-item-sold-history for "Sold on <date>".
If the title node is missing and no wall appeared, report item_not_found with the page title.
Take one screenshot of the title and price block.
Report itemId, url, title, image URL, price, format, bids, time left and end date, condition, seller and feedback, shipping, up to 8 item specifics, and whether the listing has ended.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

- The bid count node present means an auction and its text is the bid count; absent means Buy It Now. Report both `meta[itemprop="endDate"]` and the rendered countdown when present.
- An ended listing shows `Sold on <date>`; report it as ended with that date. Hand back `link[rel="canonical"]`, not a pasted URL with tracking parameters.

### When blocked

- Same Akamai tells as the search section: `Access Denied`, the 403 `Error Page | eBay` with `SORRY`, or `Pardon Our Interruption...` at `/splashui/challenge`. A challenge on search in the same session predicts one here, so one item, one navigation, no reload.
- When the item page is challenged, the subagent stops and reports. The parent hands the box to the user for one verification and resumes the same URL, or asks the user for the title, price and time left from their own browser and says the live read did not happen. Never imply a live read succeeded.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
