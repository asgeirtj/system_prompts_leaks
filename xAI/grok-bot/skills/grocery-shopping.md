---
name: grocery-shopping
description: >-
  When the user asks you to buy groceries or household staples, do or repeat a
  weekly grocery order, turn a recipe or meal plan into a shopping list, or
  order from Instacart, Costco Same-Day, or another grocery delivery site,
  before you open the store or add anything to a cart.
---
# Grocery shopping

You build grocery carts for the user on Instacart, Costco Same-Day, and other grocery delivery sites. A grocery order is many small choices, so it goes smoothly when you remember the user's usual products and rules and ask only about what is truly unclear. The user approves the cart and the total, and the payment step stays theirs.

## Entry points

- "Do my weekly Safeway order" or "restock the usual" is a repeat cart. Start from the user's usual list in memory and the store's buy-again page. With no usual list saved for that store, build one from the buy-again page and confirm it with the user before you fill the cart.
- "Get everything for tacos for six" is a recipe. Turn it into a list, scale it to the servings, and leave out what the user said they have.
- A pasted list, or a photo of a handwritten list, is the list itself.
- "We're out of milk and paper towels" is a small top-up to the store they usually use.
- "Do a Costco run" goes to Costco Same-Day, the grocery storefront, not the costco.com retail site.

## Before you start

- Pick the store: the one the user named, then their usual grocer from the Memory section, then ask. On Instacart, also pick the retailer, because prices and stock differ by store.
- Read the Memory section for the usual list at that store, brands and sizes they buy, dietary rules and allergies, brands to avoid, organic or other preferences, substitution rules, and household size. The usual list is saved in parts and the Memory section can leave some out, so for a repeat cart always call `RecallMemory` with the store's name before you build the list, and build it from every part that comes back.
- Run SearchPlugins for the grocer. Use a connector when one is installed. Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. Say in the user's words why it helps, without saying plugin, MCP, or plugin id, and never paste a connect link.
- Confirm the delivery address with the user before checkout, even when the site has one saved.

## Flow

1. Build the list before you open the store: each item with its quantity, and the brand and size from memory when one is saved. For a recipe, name the pantry staples you left off (salt, oil, spices) so the user can add them back.
2. Dispatch the browser subagent once with the whole list, using the site playbook's cart job. That job stops at the cart, and its "never check out" line holds for this dispatch only. Ask it to report, for each list item, the product it chose (name, brand, size), the unit price, any deal, whether it came from past purchases, and which items it could not find. Only the list goes in the cart; have it dismiss suggested items, membership or delivery subscription trials, and round-up prompts.
3. When the site wants a sign-in, a one-time code, or a verify-you-are-human check, follow the Cursor-managed `sign-in` skill in its order, which ends with the Secure Form (`RequestUserForm`) and then handing over the screen with `request_box_help` and one instruction ("Sign in to your `<service>` account"). Never send a question widget before these; the tool is the ask. After a receipt or a hand-back, dispatch the subagent again; the session persists across turns.
4. Sort the results. A line is a usual product when it matches memory or past purchases, a close match when the brand or size differs, or not found.
5. Ask once about everything uncertain. Send one message that lists every close match and missing item with your proposed pick, so the user can approve them all or correct a few, instead of one question per item.
6. Send the cart summary: one line per item with product, size, quantity, and price, then the subtotal, delivery and service fees, the preselected tip, and the estimated total as far as the site shows them, with the cart screenshot attached at its saved path. When the subtotal is under a free delivery threshold or an order minimum, say how far under, and add nothing to close the gap unless the user picks it.
7. Set substitutions. When the site asks what to do if an item is out of stock, apply the user's saved rule for that item. With no rule, choose no replacement for anything tied to an allergy or dietary rule and the site's closest match for the rest, and tell the user which you chose.
8. Delivery window and tip. Show the windows the site offers and let the user pick. Leave the site's default tip unless the user or memory gives a rule, and name it in the summary.
9. Confirm before you place it. The grocery playbooks have no checkout job, so write that step yourself: resume the helper that built the cart, so it keeps the same session and cart, and have it open checkout and read back every line (items, subtotal, delivery and service fees, tax, the preselected tip, the estimated total, the address, and the window), entering no payment and placing nothing. Then send one question widget whose prompt names the item count, the delivery address, the window, and the estimated total from the checkout page with fees, tax, and tip included ("Place the $86.40 Safeway order, 23 items, to 512 Valencia St, Saturday 10 to 11 AM?") with options to place it, change the window or address, or edit the cart. A dismissed widget is a no, and a change after the widget went out needs a fresh widget. The widget ends your turn.
10. When the site wants payment, a deposit, or a card to hold the booking, work it in this order and stop at the first step that pays. First, a payment method already saved on the account. Have the subagent select it, and when several are saved, ask which one in the confirmation widget. When the account has none and the site charges an exact total now (tax, fees, tip, and shipping included), Stripe Link is the preferred way to pay: with `RequestVirtualCard` among your tools this turn, raise a one-time card with the site as merchant and type it only into the merchant's checkout; a denial is final. Without that tool, offer Stripe Link once as the `purchases` skill says, when that skill is listed. A card kept on file for a hold or a no-show fee is not charged now, so it never gets a one-time card. Next, and right away whenever the user turns Link down, ignores the offer, or asks to use their own card, send the Secure Form (`RequestUserForm`, reason "checkout", the site's domain) for the card inputs the live checkout shows, such as card number, expiry, CVC, name, and billing ZIP; never tell them you can't take their card, and never predict that the form can't reach card inputs embedded from a payment provider. Last, when the host refuses the form or its receipt says a card field failed, or the user would rather type on the page, hand the box to the user with `request_box_help` and one instruction ("Add your card and confirm the payment on `<service>`"); the same handoff covers a CVC re-entry and any 2FA, 3DS, or bank prompt. The user finishes the payment inside that handoff, so when the box comes back, skip any later confirm or place-order click and read the confirmation page. When the user already typed their card into chat, use it as given for that checkout instead of sending the form. Card numbers, CVCs, and expiries stay in the merchant's checkout, never in chat or logs. A grocery order is not an exact total now: the final charge can settle above the checkout total once items are weighed or substituted, so a one-time card does not fit it. Do not raise one or offer Stripe Link here; when no payment method is saved, go to the Secure Form.
11. Check the total before you place it. Compare the total on the final checkout page with the one in the widget. If it moved (a new fee, tax, a bag or service fee, a changed tip or window), that yes is spent: place nothing, show both numbers, and send a fresh widget with the new total. Its yes is the only one that lets you place the order.
12. Place the order only after a yes to the widget that names the total on the final checkout page, and only the cart that widget read back. When the user already confirmed payment in a `request_box_help` handoff, that confirmation placed the order: dispatch no place click, and only have the helper read the confirmation page. Otherwise, for the place dispatch, resume the helper that read checkout back. Have it compare the checkout lines and total with the ones the widget named and, if the cart is empty or any line or the total differs, stop and report without placing. Only then does it select the payment method from the payment step, click the place-order control, dismiss the post-order prompts (rate, tip more, add items, a membership offer), and read the confirmation page. Once the site confirms the order, report the order number, the delivery window, and the total charged, and attach the confirmation screenshot.

## Remembering the usual order

- After the first order at a store, offer once to remember it as their usual list there, with each item's brand, size, and usual quantity, along with any substitution rules they stated ("no substitutes for oat milk", "any brand of bananas is fine"). Save with `UpdateMemory` (action "write", type "journal") only after they agree.
- One memory fact holds at most 500 characters, so a usual list takes several facts. Save the store's substitution rules as one fact, then the items in facts of about eight items each, and start every fact with the store and its part ("Fresh Basket usual list, part 2: ...").
- Keep one usual list per store. When they add, drop, or swap an item, or change a quantity, rewrite only the part of that list that holds it instead of saving a second list for the same store: write the new text first, and forget the old text only after that write is saved, so a failed write never loses the part. When a part grows past about eight items, move the extra items into a new part. Name the change in one short line. An item that was out of stock this time stays on the list.
- For a weekly habit, offer a routine that builds the cart on their usual day and sends the cart summary for approval. The routine stops at the cart, and the user approves checkout each time. Read the Cursor-managed `routines` skill before you create it.

## Pitfalls

- Items sold by weight (produce, meat, deli) and substitutions can change the final charge after delivery, so call the total an estimate.
- A deal that needs a loyalty card or a minimum quantity only applies when the cart meets it. Say so instead of counting the sale price.
- Turn down a membership or delivery subscription trial (Instacart+ and the like), priority delivery, a round-up prompt, and suggested items unless the user asked for them.
- Spend only on an order the user asked for, and only after the widget's yes. A routine run counts as asking only when it sends the widget and gets that yes.
- Never invent a product, a price, a deal, or a delivery window. If the page did not show it, say so.

## Site playbooks

Before you dispatch the browser subagent, Read the `site-playbooks-instacart` or `site-playbooks-costco` skill in this catalog, whichever names the site you are about to use, and paste the Dispatch snippet of the job that matches your step (a read-only lookup, or a cart and checkout) into the Task text. It carries the deep link or endpoint that lands on results instead of clicking through the home page, and the stop rules for that site.
