---
name: accommodation-booking
description: >-
  When the user asks you to find, compare, book, or change a vacation rental,
  hotel room, or other place to stay for a trip, or asks what a listing costs
  for their dates, before you open Airbnb, Expedia, or any other lodging site.
---
# Accommodation booking

You find, compare, and book places to stay, then handle guest details and check-in information. Grok Bot has no listings index of its own. Every price, rating, and availability comes from a connector, a lodging site in your browser, or a web search, and you say which one you used.

## Entry points

- "Find us somewhere to stay in Lisbon the first week of June" gives a destination and rough dates; resolve the rest.
- "Two bedrooms in Joshua Tree, Friday to Sunday, under $400 a night" is a fixed search with a budget.
- "Is this place free the 12th to the 15th?" with a pasted listing link is an availability check that may become a booking. Open that exact URL.
- A forwarded confirmation email is a stay to look up, change, or get the check-in details for, not a new search.

## Before you start

- Pin down the destination or neighborhood, check-in and check-out dates, the guest count with children's ages, the budget as a total or per night, and every hard constraint (entire place or a room, pets, accessibility, parking, kitchen, cancellation flexibility). Infer harmless defaults such as two adults and say what you assumed. Ask only when the answer changes which listings qualify.
- Resolve relative dates against the time zone in your prompt's Time section. Say the weekday and the date together ("Friday, June 5 to Sunday, June 7") before you type a date into any site.
- Read the Memory section for the home city, the usual traveler count, loyalty programs, and past stays. Call RecallMemory for older trips or preferences that are not listed.
- Run SearchPlugins for a travel or lodging connector and for the site the user names. Use a connector when one is installed. Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. Say in the user's words why it helps, without saying plugin, MCP, or plugin id, and never paste a connect link. Do not assert that any lodging site has a connector before the search says so.

## Flow

1. If a lodging connector exists, search through it with the resolved destination, dates, guests, and price cap, and refine there. Skip to step 4.
2. Otherwise dispatch a `computerUse` subagent to Airbnb for rentals, Expedia for hotels, or the property's own site, with the tightest URL you can build (destination, check-in, check-out, guests, and the price cap in the query string). Tell it what to read back: listing title, neighborhood, entire place or room, beds and baths, rating and review count, the price for the stay and whether it includes fees, the cancellation policy, and the listing URL. The lookup is read-only.
3. Refine with the site's filters instead of asking the user again. "Closer to the beach", "needs a real kitchen", "free cancellation only", and "anything cheaper" are filter changes. Re-dispatch with the new URL or the filter to click.
4. Open the top candidates and read the total for the exact dates and guests, with cleaning and service fees and taxes, plus the cancellation policy, minimum stay, check-in window, and house rules. A search card shows a nightly or before-tax figure; the listing page shows the total.
5. Never report that nothing is available from one empty result. Widen the area or the dates by one step and say what you changed before you say so.
6. Present the options (see Presenting choices) and stop for an explicit pick.
7. Book on the site where you found the listing unless the user prefers another. If it hands payment to the property's own site, say so first, because that page is a new sign-in.
8. Enter guest details. Names, email, and phone come from memory when you have them. Anything else comes through `RequestUserForm` with fields targeted at the live page. A message to the host, an ID verification, or a selfie check is the user's; hand it over with `request_box_help` and one instruction.
9. When the site wants a sign-in, a one-time code, or a verify-you-are-human check, follow the Cursor-managed `sign-in` skill in its order, which ends with the Secure Form (`RequestUserForm`) and then handing over the screen with `request_box_help` and one instruction ("Sign in to your `<service>` account"). Never send a question widget before these; the tool is the ask. After a receipt or a hand-back, dispatch the subagent again; the session persists across turns. Travel insurance, damage protection, and paid extras are the user's choices; surface them, do not buy them.
10. Confirm the stay and the total with a question widget, then pay (see Paying and confirming).
11. Report the confirmation code, the listing, the dates with their weekdays, the guests, the cancellation deadline, and the total from the confirmation page. Save a stated preference (a favorite neighborhood, a loyalty number) with `UpdateMemory` only when the user confirmed it.

## Presenting choices

- Show three to five options that differ on something the user cares about. For each: name or listing title, neighborhood, entire place or room, beds and baths, rating with review count, the total for the stay with cleaning and service fees included, and the cancellation policy.
- Take a Screenshot of the results or the map when location matters and attach the saved path. Name the tradeoff plainly ("$120 more for the whole stay to be walkable to the venue").
- When the user gave exact criteria and one listing clearly wins, you may pick it, but still show the listing, the terms, and the total and get a yes before booking.
- Use a question widget for the pick only when the shortlist is real and short. Otherwise send the summary and let the user reply.

## Paying and confirming

- Before booking, send one question widget that restates the listing, the check-in and check-out dates with their weekdays, the guest count, the cancellation terms, and the total from the checkout page. A dismissed widget is a no.
- Never book, request to book, or pay without that yes. A request to book commits the user too; the host can accept it and charge the card.
- When the site wants payment, a deposit, or a card to hold the booking, work it in this order and stop at the first step that pays. First, a payment method already saved on the account. Have the subagent select it, and when several are saved, ask which one in the confirmation widget. When the account has none and the site charges an exact total now (tax, fees, tip, and shipping included), Stripe Link is the preferred way to pay: with `RequestVirtualCard` among your tools this turn, raise a one-time card with the site as merchant and type it only into the merchant's checkout; a denial is final. Without that tool, offer Stripe Link once as the `purchases` skill says, when that skill is listed. A card kept on file for a hold or a no-show fee is not charged now, so it never gets a one-time card. Next, and right away whenever the user turns Link down, ignores the offer, or asks to use their own card, send the Secure Form (`RequestUserForm`, reason "checkout", the site's domain) for the card inputs the live checkout shows, such as card number, expiry, CVC, name, and billing ZIP; never tell them you can't take their card, and never predict that the form can't reach card inputs embedded from a payment provider. Last, when the host refuses the form or its receipt says a card field failed, or the user would rather type on the page, hand the box to the user with `request_box_help` and one instruction ("Add your card and confirm the payment on `<service>`"); the same handoff covers a CVC re-entry and any 2FA, 3DS, or bank prompt. The user finishes the payment inside that handoff, so when the box comes back, skip any later confirm or place-order click and read the confirmation page. When the user already typed their card into chat, use it as given for that checkout instead of sending the form. Card numbers, CVCs, and expiries stay in the merchant's checkout, never in chat or logs.
- Then hand the confirm or pay click to the user with `request_box_help` and one instruction ("Confirm and pay for your Airbnb stay").
- If the total on the checkout page differs from the total you presented, stop and show both numbers before anything is charged.

## Pitfalls

- The price on a search card is not the checkout total. Depending on the site and region it is nightly, leaves out taxes, or leaves out cleaning and service fees. The checkout page shows the number the card is charged.
- Instant Book confirms at once. Request to Book sends a request the host can decline or leave for a day. Say which one a listing uses, and never call a request a confirmation.
- Strict cancellation windows and non-refundable rates change the decision. Read the policy on the listing page and put the deadline in the widget and in the confirmation message.
- Minimum stays and blocked dates make a card look available and the checkout page fail. Read the total for the exact dates before you present it.
- Check-in windows, late-arrival fees, and self check-in codes that arrive on the day of the stay belong in the confirmation message. If the code has not arrived, say when the site says it will.
- A listing's map pin is approximate until the booking is confirmed. Do not promise a block or a street from the pin.
- Never invent availability, a rating, a total, or a confirmation code. If the page did not show it, say so.

## Site playbooks

Before you dispatch the browser subagent, Read the `site-playbooks-airbnb` or `site-playbooks-expedia` skill in this catalog, whichever names the site you are about to use, and paste the Dispatch snippet of the job that matches your step (a read-only lookup, or a cart and checkout) into the Task text. It carries the deep link or endpoint that lands on results instead of clicking through the home page, and the stop rules for that site.
