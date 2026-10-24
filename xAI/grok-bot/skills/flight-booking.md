---
name: flight-booking
description: >-
  When the user asks you to find, compare, book, change, or check in for a
  flight, look up an itinerary, or fetch a boarding pass, before you search any
  airline or travel site or touch a checkout.
---
# Flight booking

You find, compare, and book flights, then handle check-in and boarding passes. Grok Bot has no flight index of its own. Every price and schedule comes from a connector, a travel site in your browser, or a web search, and you say which one you used.

## Entry points

- "Get me on a flight to Chicago next Thursday" gives a destination and a date; resolve the rest.
- "Cheapest nonstop LAX to JFK on the 12th" is a fixed route with a ranking rule.
- "I have to be in Lisbon sometime in May" is a flexible date search; the price calendar matters more than any single fare.
- A forwarded confirmation or deal email is an itinerary to look up, check in for, or rebook, not a new search.

## Before you start

- Pin down origin, destination, dates, passenger count, cabin, and any hard constraint (arrive before a meeting, no red-eyes, one alliance only). Infer harmless defaults such as one adult in economy and say what you assumed. Ask only when the answer changes which flights qualify.
- Resolve relative dates against the time zone in your prompt's Time section. Say the weekday and the date together ("Thursday, October 9") before you type a date into any site.
- Read the Memory section for the home airport, seat and airline preferences, loyalty programs, known traveler numbers, and passport expiry. Call RecallMemory for older trips or preferences that are not listed.
- Run SearchPlugins for a flights or travel connector and for the airline the user names. Use a connector when one is installed. Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. Say in the user's words why it helps, without saying plugin, MCP, or plugin id, and never paste a connect link. Do not assert that any airline has a connector before the search says so.
- Vague places need airports. "Washington" means DCA, IAD, and BWI. Search all of them and label the airport in each option unless the user has ruled one out.

## Flow

1. If a flights connector exists, search through it with the resolved route, dates, passengers, and cabin, and refine there. Skip to step 4.
2. Otherwise dispatch a `computerUse` subagent to Google Flights or the airline's own site with the tightest URL you can build (route, dates, passengers, and cabin in the query string). Tell it what to read back: airline and flight number, departure and arrival times, duration, stops, connecting airports, fare name, total price, and bag rules when shown.
3. Refine with the site's filters instead of asking the user again. "No connections", "leave after lunch", "not Newark", and "anything cheaper" are filter changes. Re-dispatch with the new URL or the filter to click.
4. Treat every time as local wall clock at that airport. An "arrive before 23:00" rule means the local arrival date and the local clock, so check both. When a trip crosses zones, label each time with its airport ("departs SFO 08:15, arrives JFK 16:45") and convert to the user's zone only when you say you did.
5. Never report that a route has no service from one empty result. Run WebSearch for the route and check the airline's own site first.
6. Present the options (see Presenting choices) and stop for an explicit pick.
7. Book on the site the user prefers. With no preference, book on the airline's own site. If a travel site shows the fare but hands payment to the airline, say so before you start, because the airline page is a new sign-in.
8. Enter passenger details. Legal names, dates of birth, and contact details come from memory when you have them. Anything else comes through `RequestUserForm` with fields targeted at the live page. Passport numbers and expiry dates go into the form as secret fields, never into chat. Loyalty and known traveler numbers come from memory or from a saved vault key listed in the `RequestUserForm` description (the key `ktn` names one fact on every site; a frequent flyer key carries the airline in its name). Multi-step passenger pages get one form per page.
9. When the site wants a sign-in, a one-time code, or a verify-you-are-human check, follow the Cursor-managed `sign-in` skill in its order, which ends with the Secure Form (`RequestUserForm`) and then handing over the screen with `request_box_help` and one instruction ("Sign in to your `<service>` account"). Never send a question widget before these; the tool is the ask. After a receipt or a hand-back, dispatch the subagent again; the session persists across turns. Seats, bags, and paid add-ons are the user's choices; surface them, do not buy them.
10. Confirm the itinerary and total with a question widget, then pay (see Paying and confirming).
11. Report the booking reference, the itinerary, and the total from the confirmation page. Save a stated preference (a new loyalty number, a favorite airline) with `UpdateMemory` only when the user confirmed it.

## Presenting choices

- Show three to five options that differ on something the user cares about. For each: airline and flight number, departure and arrival times with airport codes, duration, stops, fare name, bag and change caveats when shown, and the total for all passengers.
- For flexible dates, take a Screenshot of the price calendar or date grid, attach the saved path, summarize the two or three cheapest or most convenient combinations, and ask which dates to search.
- When the user gave exact criteria ("the cheapest direct flight") and one option clearly wins, you may pick it, but still show the picked itinerary and total and get a yes before payment.
- Use a question widget for the pick only when the shortlist is real and short. Otherwise send the summary and let the user reply.

## Paying and confirming

- Before payment, send one question widget that restates the full itinerary, passenger names, fare, and total.
- When the site wants payment, a deposit, or a card to hold the booking, work it in this order and stop at the first step that pays. First, a payment method already saved on the account. Have the subagent select it, and when several are saved, ask which one in the confirmation widget. When the account has none and the site charges an exact total now (tax, fees, tip, and shipping included), Stripe Link is the preferred way to pay: with `RequestVirtualCard` among your tools this turn, raise a one-time card with the site as merchant and type it only into the merchant's checkout; a denial is final. Without that tool, offer Stripe Link once as the `purchases` skill says, when that skill is listed. A card kept on file for a hold or a no-show fee is not charged now, so it never gets a one-time card. Next, and right away whenever the user turns Link down, ignores the offer, or asks to use their own card, send the Secure Form (`RequestUserForm`, reason "checkout", the site's domain) for the card inputs the live checkout shows, such as card number, expiry, CVC, name, and billing ZIP; never tell them you can't take their card, and never predict that the form can't reach card inputs embedded from a payment provider. Last, when the host refuses the form or its receipt says a card field failed, or the user would rather type on the page, hand the box to the user with `request_box_help` and one instruction ("Add your card and confirm the payment on `<service>`"); the same handoff covers a CVC re-entry and any 2FA, 3DS, or bank prompt. The user finishes the payment inside that handoff, so when the box comes back, skip any later confirm or place-order click and read the confirmation page. When the user already typed their card into chat, use it as given for that checkout instead of sending the form. Card numbers, CVCs, and expiries stay in the merchant's checkout, never in chat or logs.
- Then hand the confirm or pay click to the user with `request_box_help` and one instruction ("Confirm the payment for your Delta booking").
- If the total on the review page differs from the fare you presented, stop and show both numbers before anything is charged.

## Check-in and boarding passes

- Check in on the airline's own check-in page with the booking reference and passenger name through a `computerUse` subagent. Look for the reference in the itinerary, memory, and the confirmation email before asking.
- Find the confirmation and boarding-pass emails through the user's mail connector (Gmail or Outlook) when one is connected. If none is, run SearchPlugins for one. Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. Say in the user's words why it helps, without saying plugin, MCP, or plugin id, and never paste a connect link. If the user doesn't connect one, open their webmail in the browser subagent instead.
- Download the boarding pass from the airline's page or email to `/workspace` with the browser subagent, then attach the file with SendToUser. A PDF is fine. Name the file by flight and route so several legs stay apart.
- Seat changes, bag purchases, and upgrades offered at check-in are the user's choices. List them, do not buy them.

## Pitfalls

- Prices move between search and checkout. Flag any jump before the payment step.
- Basic economy and light fares often exclude carry-on or checked bags and forbid changes. Say so when the fare name suggests it.
- International trips need passport details and sometimes visa answers. Ask early, through a form, so the booking does not stall at the passenger page.
- Travel sites that redirect to the airline for payment change the sign-in context. Expect a second sign-in, worked in the same order.
- Multi-leg and open-jaw itineraries deserve a segment-by-segment review before the widget.
- Changes, cancellations, refunds, and credits depend on the fare, the booking channel, the time to departure, and current airline policy. Look up the current policy on the airline's site before you tell the user what to click or whom to call.
- Never invent a fare, a seat map, or a confirmation number. If the page did not show it, say so.

## Site playbooks

Before you dispatch the browser subagent, Read the `site-playbooks-google-flights`, `site-playbooks-united`, `site-playbooks-southwest`, or `site-playbooks-expedia` skill in this catalog, whichever names the site you are about to use, and paste the Dispatch snippet of the job that matches your step (a read-only lookup, or a cart and checkout) into the Task text. It carries the deep link or endpoint that lands on results instead of clicking through the home page, and the stop rules for that site.
