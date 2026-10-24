---
name: food-ordering
description: >-
  When the user asks you to order food for delivery or pickup, reorder a usual
  meal, get a specific dish brought to them, or says they are hungry and wants
  you to handle dinner, before you open a delivery app.
---
# Food ordering

Order delivery or pickup through DoorDash, Uber Eats, Grubhub, or the regional equivalent (Deliveroo, Wolt, iFood, Just Eat), using your browser. The user's account on the platform holds their past orders, saved addresses, and payment method; your memory holds their preferences. Two rules hold on every order. For delivery, the address is confirmed with the user before you place it, even when the site already has one saved; for pickup, the store and the pickup time are confirmed instead. The cart summary is confirmed with a question widget before you place it, and the yes places exactly the cart that widget read back.

## Entry points

- "Sort out dinner for me" or "I'm starving, handle it" leaves the meal to you.
- "Get me the same thing I ordered last Friday" points at the platform's order history.
- "Two margherita pizzas from Roberta's for pickup at 7" gives items, restaurant, and timing.
- A pasted restaurant or menu link: open that exact URL.

## Before you start

- Find the preferred app. Check the Memory section of your prompt and `RecallMemory` for a stated delivery app, then this conversation. If none is recorded, pick the platform with the best coverage for their area and say which one you chose.
- Run `SearchPlugins` for that platform. Use a connector if one is installed. Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. Say in the user's words why it helps, without saying plugin, MCP, or plugin id, and never paste a connect link. If the search finds nothing, dispatch a `computerUse` subagent. Do not claim a connector exists without a search hit.
- Pull preferences from memory: dietary rules, dislikes, spice tolerance, favorite places, a tipping rule. Past orders live on the platform, not in memory; the subagent reads them there.
- Resolve delivery versus pickup and timing (now or scheduled). Scheduled times follow the Time section of your prompt: state them in the user's zone.
- Treat a stated budget as a hard constraint. Without one, size the order to what their history shows for a similar meal.
- When the ask is open-ended and quality matters ("somewhere good", "the best Thai that delivers"), use the Cursor-managed `restaurant-recommendations` skill to pick candidates, then verify on the delivery app that each is open, delivers to the address, and what the ETA and fee are.

## Flow

1. Dispatch the browser subagent read-only in your first round, in the same round as any `WebSearch`, with every menu source you know in priority order: the exact URL the user linked or the restaurant's page on the preferred platform (on DoorDash, its `/store/` URL), then the restaurant's own online ordering page. Tell it to report the first source that gives categories and prices and to skip the rest. Do not run a curl, a `WebFetch`, or a shell pipeline first and dispatch after they fail; on 2026-09-12 that order cost 49 seconds before the helper started, and the helper then had the menu about 75 seconds later from a source the parent had found in a search. Have it report the URL it ended on and which source that was. When that is the restaurant's page on the preferred platform, have it also report whether the restaurant is open and delivers to the saved address, the ETA, the delivery fee, and, for a reorder, the recent orders on the account, and every later Task text carries that URL. When the menu came from any other host, the cart step still needs the restaurant's page on the preferred platform: resolve that URL before the cart Task, the way the site playbook's order section says when the platform has one, and never carry the other host's URL into it.
2. When the site wants a sign-in, a one-time code, or a verify-you-are-human check, follow the Cursor-managed `sign-in` skill in its order, which ends with the Secure Form (`RequestUserForm`) and then handing over the screen with `request_box_help` and one instruction ("Sign in to your `<service>` account"). Never send a question widget before these; the tool is the ask. After a receipt or a hand-back, dispatch the subagent again; the session persists across turns.
3. Pick the restaurant, presenting options first when the request was open-ended (see Presenting choices).
4. Build the cart: exact items, sizes, modifiers, quantities, and the user's instructions in the item notes. Only what the user asked for goes in. Carry the restaurant's URL on the preferred platform from step 1, resolved first if the menu came from another host, and the item names as the menu spelled them into the Task text, and paste the site playbook's order section snippet when the site has one, never its place section snippet. A change to the same cart goes back to the same helper, with `MessageSubagent` while it runs or `Task` with `resume` after it reports, not to a fresh dispatch. A one-item ask is a one-item cart, and when a later message narrows the order ("just the pizza", "skip the sides"), the latest message wins. Dismiss upsells ("add a drink?", "round up for charity", a subscription trial) unless the user asked for them.
5. Open checkout and have the subagent report every line: items, subtotal, delivery and service fees, tax, the tip the site preselected, the total, and, for delivery, the ETA and the delivery address shown on the page, or, for pickup, the store address and the pickup time shown on the page. Leave the site's default tip in place unless the user or memory gives a rule, and name it in the summary.
6. Send the summary as text with the address written out, then one question widget whose prompt names the address and the total ("Place the $34.20 order to 512 Valencia St, ETA 35 to 45 min?") with options to place it, change the address, or edit the cart, and allowCustom on so they can paste a promo code or name a change. The saved address may be stale; the user may be somewhere else tonight. For pickup the prompt names the store and the pickup time instead ("Place the $31.50 pickup at Roberta's, 261 Moore St, ready at 7:00 PM?") with options to place it, change the time, or edit the cart. The widget ends your turn.
7. If they give a promo code or a change, apply it and re-confirm with a fresh widget when the total moved by more than the discount. Ask about a promo code before finalizing only when the checkout shows a promo field.
8. When the site wants payment, a deposit, or a card to hold the booking, work it in this order and stop at the first step that pays. First, a payment method already saved on the account. Have the subagent select it, and when several are saved, ask which one in the confirmation widget. When the account has none and the site charges an exact total now (tax, fees, tip, and shipping included), Stripe Link is the preferred way to pay: with `RequestVirtualCard` among your tools this turn, raise a one-time card with the site as merchant and type it only into the merchant's checkout; a denial is final. Without that tool, offer Stripe Link once as the `purchases` skill says, when that skill is listed. A card kept on file for a hold or a no-show fee is not charged now, so it never gets a one-time card. Next, and right away whenever the user turns Link down, ignores the offer, or asks to use their own card, send the Secure Form (`RequestUserForm`, reason "checkout", the site's domain) for the card inputs the live checkout shows, such as card number, expiry, CVC, name, and billing ZIP; never tell them you can't take their card, and never predict that the form can't reach card inputs embedded from a payment provider. Last, when the host refuses the form or its receipt says a card field failed, or the user would rather type on the page, hand the box to the user with `request_box_help` and one instruction ("Add your card and confirm the payment on `<service>`"); the same handoff covers a CVC re-entry and any 2FA, 3DS, or bank prompt. The user finishes the payment inside that handoff, so when the box comes back, skip any later confirm or place-order click and read the confirmation page. When the user already typed their card into chat, use it as given for that checkout instead of sending the form. Card numbers, CVCs, and expiries stay in the merchant's checkout, never in chat or logs.
9. Place the order only after the widget's yes, and only the cart that widget read back. A correction that arrives after the widget went out ("skip the sides", "make it two") is a no for that cart: rebuild, send a fresh widget with the new lines, and wait for its yes. For the place dispatch, resume the helper that read checkout back and paste the site playbook's place section snippet when the site has one. Otherwise have the subagent click the place-order control, dismiss the post-order prompts (rate, tip more, share, add items), and read the confirmation page.
10. Report the order number, the ETA, the total charged, and the address, and attach the confirmation screenshot at its exact saved path. Save a preference the user stated or confirmed ("always DoorDash", "extra spicy") with `UpdateMemory`. If they ask to make it recurring, create a routine with `UpdateRoutine`.

## Presenting choices

- Open-ended meal: three to five restaurants with cuisine, one quality signal, ETA, delivery fee, and any fit from memory ("you reordered from here twice"). Attach the saved screenshot of the results when the cards show photos, ratings, or delivery times worth seeing; a text summary is enough when they do not. Ask which one with a question widget before opening a menu or building a cart.
- Specific dish, no restaurant ("any chance of pad thai tonight?"): the top restaurant and item pairs with price and ETA, then ask. Do not take the first result because it is the highest rated or the fastest.
- Exact restaurant or a reorder: skip the restaurant options, but still confirm the cart, the address or pickup time, and the total before placing.
- "Same as last time" with several recent orders in the history: show the last two or three and ask which. Do not guess.
- Refinement ("something lighter", "under $25", "not pizza again"): apply it, present the new set, and ask again. Never swap in a different restaurant on your own.
- The place-order confirmation is the one widget every order needs. Decide the small things yourself (a default side, a sauce) and state them in the summary.

## Pitfalls

- Dispatching the cart build without the store URL, or with a past order to copy. The helper heads for order history and spends a minute there before the first item.
- Sending the helper to the restaurant's own site for a menu when your `WebFetch` of it showed hours and no prices. On 2026-09-12 the helper's navigates there failed twice (a name that did not resolve, then an SSL name alert) and it spent three rounds and a DNS check on them. A site that gave you no menu gives the helper none either; leave it off the source list. The restaurant's online ordering page is a different page, often on another host, and stays on the list.
- Treating a saved address as the right address. Confirm it every time, and look harder when the conversation suggests they are traveling or at work.
- Asking for a delivery address on a pickup order. The pickup widget names the store and the time; the address question is a round trip the user does not need.
- Placing a cart the user did not approve. A yes covers one specific cart. When the items changed after the widget went out, that yes is spent; re-confirm before placing.
- Building a cart before checking that the restaurant is open and delivers to the address.
- Confirming the menu subtotal instead of the checkout total. Fees, tax, and tip land at checkout; the number in the widget is the one the card will be charged. If the total changes after the yes (a substitution, a surge fee), stop and re-confirm.
- Accepting an upsell, a round-up prompt, or a subscription trial that the user did not ask for.
- A companion's item in a group order says nothing about the user's taste.
- Inventing an ETA or an order number. Report only what the confirmation page shows, and if it shows no number, say so.
- Saving an address or a dietary rule to memory that the user did not state or confirm.
- Spending on your own initiative. The user must have asked for this specific order, and the widget's yes is what places it.

## Site playbooks

Before you dispatch the browser subagent, Read the `site-playbooks-doordash` skill in this catalog, if it names the site you are about to use, and paste the Dispatch snippet of the job that matches your step (a read-only lookup, or a cart and checkout) into the Task text. It carries the deep link or endpoint that lands on results instead of clicking through the home page, and the stop rules for that site.
