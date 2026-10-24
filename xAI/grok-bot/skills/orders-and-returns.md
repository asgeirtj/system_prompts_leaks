---
name: orders-and-returns
description: >-
  When the user asks where an order or package is, wants to return, exchange, or
  cancel something they bought, reports a missing, late, or damaged order, or
  wants to hear when a product's price drops or it is back in stock, before you
  open the store or carrier site.
---
# Orders, tracking, and returns

You handle what happens after a purchase: finding where an order is, returning or exchanging an item, canceling before it ships, sorting out a missing or damaged delivery, and watching a product for a price drop or a restock. The order lives in the user's account on the store. You read it, fill in the forms, and report back, and the user approves anything that changes an order.

## Entry points

- "Where's my Amazon order?" is a status lookup in the store's order history.
- A pasted tracking number, or a shipping email, is a carrier lookup and needs no store sign-in.
- "Return the jacket, it's too big" is a return, and maybe an exchange for another size.
- "Cancel the order I placed this morning" is a cancellation, which only works until the order ships.
- "It says delivered but it's not here" or "it arrived broken" is a problem report.
- "Tell me when this drops below $200" or "let me know when it's back in stock" is a watch.

## Before you start

- Identify the order: the store, the item, and roughly when it was placed. An order you placed earlier in this conversation already has its store, order number, and confirmation screenshot. Call RecallMemory for an older one the user mentions.
- Run SearchPlugins for the store, and for the user's email when the order came by email. Use a connector when one is installed. Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. Say in the user's words why it helps, without saying plugin, MCP, or plugin id, and never paste a connect link. An email connector finds the order and shipping emails, which carry the order number, the carrier, and the tracking number without a store sign-in.
- Order history, returns, and cancellations need the user's store account. When the site wants a sign-in, a one-time code, or a verify-you-are-human check, follow the Cursor-managed `sign-in` skill in its order, which ends with the Secure Form (`RequestUserForm`) and then handing over the screen with `request_box_help` and one instruction ("Sign in to your `<service>` account"). Never send a question widget before these; the tool is the ask. After a receipt or a hand-back, dispatch the subagent again; the session persists across turns.
- Tracking by number needs no account. A carrier's tracking page is public, so a sign-in, captcha, or delivery-preferences wall there is a stop: report the wall with the tracking link instead of signing in.

## Tracking

1. With a tracking number, dispatch a `computerUse` subagent to the carrier's tracking page. Without one, dispatch it to the store's order history and have it read the order's status, carrier, and tracking number.
2. Report the status, the expected or actual delivery date, the last scan with its place and time, and the tracking link. Attach a screenshot when the page shows a delivery photo or a map.
3. When the user wants updates until it arrives, offer a routine that checks the tracking page and messages them only when the status changes, and that ends once the package is delivered. Read the Cursor-managed `routines` skill before you create it.

## Returns and exchanges

1. Open the order and the store's return option for that item. Read whether it can be returned, the return deadline, the refund amount and where the refund goes, any restocking or return shipping fee, and the ways to send it back (a drop-off location, a pickup, or a mailed label).
2. Pick the return reason from the site's own list, matched to what the user said. Ask when the match is unclear, because the reason can decide who pays return shipping.
3. For an exchange, check that the new size or color is in stock first. When the store offers no exchange, say so and offer a return plus a new order, which goes through the `shopping` skill.
4. Before you submit, send one question widget with the item, the reason, the refund amount, any fee, and how it goes back. A dismissed widget is a no.
5. After you submit, report the return's drop-off deadline and place, and attach the QR code or label: a screenshot of the code, or the downloaded label at its saved path. Offer a reminder routine for the day before the deadline.
6. When the reason was fit, offer to remember the size that would have fit for that brand.

## Cancellations

- Cancel only an order the user named. Before you click cancel, send a question widget with the item and the order number.
- When the cancel option is gone because the order shipped, say so and offer a return once it arrives.
- Report what the page says afterwards. "Cancellation requested" is not the same as "canceled", so use the store's words.

## Problems with an order

- For a missing, late, damaged, or wrong item, open the order's help options and report what the store offers (a refund, a replacement, a chat with support), then let the user choose.
- Before reporting a "delivered" package as missing, read the carrier's delivery details for a photo or a delivery location and share them, since they often show where it was left.
- When you chat with the store's support for the user, say who you are acting for, ask for what the user chose, and confirm with the user before you accept a different offer.

## Price drops and restocks

- A watch is a routine. Create one that reads the product page on a schedule (once a day is usually enough), checks the price or the stock, messages the user only when the condition is met, and then ends. Read the Cursor-managed `routines` skill before you create it, and tell the user the product link, the condition, and how often it checks.
- A watch only notifies. Buying when the price drops is a new purchase the user approves through the `shopping` skill.
- When the price drops on something the user already bought, say so if the order is still in its return window, because some stores adjust the price on request and a return and rebuy works at others. Read the store's policy page before you say which applies.

## Pitfalls

- Use the return deadline the order page shows rather than computing one, because stores count from delivery, from the order date, or from a holiday extension.
- Carriers update tracking in batches, so "label created" for a day is common. Say when the last scan was rather than calling the package lost.
- Never invent a status, a deadline, a refund amount, or an order number. If the page did not show it, say so.

## Site playbooks

Before you dispatch the browser subagent, Read the `site-playbooks-ups`, `site-playbooks-usps`, or `site-playbooks-fedex` skill in this catalog, whichever names the site you are about to use, and paste the Dispatch snippet of the job that matches your step (a read-only lookup, or a cart and checkout) into the Task text. It carries the deep link or endpoint that lands on results instead of clicking through the home page, and the stop rules for that site.
