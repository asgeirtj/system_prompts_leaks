---
name: restaurant-booking
description: >-
  When the user asks you to book, reserve, or hold a restaurant table, check
  what times a named restaurant has open, or find somewhere with a table for a
  given night and party, before you open any reservation site.
---
# Restaurant booking

Reserve a table through OpenTable, Resy, Tock, TheFork, Yelp Reservations, the restaurant's own site, or a regional equivalent, using your browser. The user's request already authorizes the search, so do not ask whether to use your browser. A reservation commits the user, and sometimes a card for a no-show fee, so the one confirmation you owe them is the go/no-go before you place it. Choosing which restaurant is the Cursor-managed `restaurant-recommendations` skill's job. This skill turns a choice into a confirmed booking.

## Entry points

- "Get us a table for four on Saturday night" gives a party and a date but no restaurant.
- "Book Lazy Bear for two at 7 on the 14th" gives an exact restaurant, time, and party.
- "Does Frenchette have anything open Friday?" is an availability check that may become a booking.
- A pasted reservation link: open that exact URL.

## Before you start

- Resolve what the reservation needs: restaurant, date, time or time window, party size, seating or occasion notes (outdoor, high chair, a birthday), and whose name, phone, and email it goes under. Take what the conversation and the Memory section of your prompt already give, and use `RecallMemory` for older facts such as a usual party size or a seating preference. Skip the questions those already answer.
- Resolve the date against the Time section of your prompt. Tools run on UTC and the user lives in the zone named there. Turn a relative phrase ("a week from Friday", "the 12th") into a weekday and date pair and state both to the user before you type either into a site.
- Verify the booking route. Never assume a restaurant is on Resy or OpenTable from brand familiarity. Run `WebSearch` on the restaurant name plus "reservations", or `WebFetch` its own site and follow its reservation link; the route it names is the one to use. If the user named a platform, use that one.
- Check for a connector. Run `SearchPlugins` for the platform you are about to use. If a connector is installed, work through it. Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. Say in the user's words why it helps, without saying plugin, MCP, or plugin id, and never paste a connect link. If the search finds nothing, use your browser and do not claim a connector exists.
- If no restaurant is named and the ask is about which place is good, use the Cursor-managed `restaurant-recommendations` skill first with the inferred date, time, party, location, and cuisine, then come back here to check live slots.

## Flow

1. Dispatch a `computerUse` subagent read-only. Give it the exact URL when you can build one: the platform's search page with the date, time, and party size in its query parameters when the site exposes them, or the restaurant's own reservation page. Give it the exact date, time window, and party size, and tell it to report every open slot in the window, the seating type, any deposit or cancellation policy on the page, and the element references for the booking controls. No booking on this pass.
2. If a hand-built results URL fails or lands on an error or empty page, do not try more URL patterns. A crashed or blank tab is often transient on the box, so have the subagent open the same URL once more. If it fails again on a site with a site playbook, follow that playbook's When blocked. On any other site, send the subagent to the platform's homepage search form, run the search through the UI, and read the visible results.
3. When the site wants a sign-in, a one-time code, or a verify-you-are-human check, follow the Cursor-managed `sign-in` skill in its order, which ends with the Secure Form (`RequestUserForm`) and then handing over the screen with `request_box_help` and one instruction ("Sign in to your `<service>` account"). Never send a question widget before these; the tool is the ask. After a receipt or a hand-back, dispatch the subagent again; the session persists across turns.
4. If nothing is open in the window, have the subagent read the nearest times, the adjacent day when the user's window allows it, and any notify or waitlist option. Report what is open and offer the real alternatives: another time, another day, or a similar restaurant through the Cursor-managed `restaurant-recommendations` skill. Never book a different restaurant on your own.
5. Present the slots (see Presenting choices) and confirm with a question widget whose options are the real slots you saw. Skip the widget only when the user gave an exact restaurant, time, and party size and that exact slot is open.
6. Place the reservation. Dispatch `computerUse` to select the confirmed slot and open the guest details form. When the form asks for name, phone, or email, call `RequestUserForm` with fields targeted from the subagent's latest snapshot and the site's domain. When the tool's description lists saved vault keys, reuse them for those repeat fields instead of asking the user to retype; never for passwords. After the receipt, have the subagent take a fresh snapshot, put any special request in the notes field, and click the confirm control.
7. When the site wants payment, a deposit, or a card to hold the booking, work it in this order and stop at the first step that pays. First, a payment method already saved on the account. Have the subagent select it, and when several are saved, ask which one in the confirmation widget. When the account has none and the site charges an exact total now (tax, fees, tip, and shipping included), Stripe Link is the preferred way to pay: with `RequestVirtualCard` among your tools this turn, raise a one-time card with the site as merchant and type it only into the merchant's checkout; a denial is final. Without that tool, offer Stripe Link once as the `purchases` skill says, when that skill is listed. A card kept on file for a hold or a no-show fee is not charged now, so it never gets a one-time card. Next, and right away whenever the user turns Link down, ignores the offer, or asks to use their own card, send the Secure Form (`RequestUserForm`, reason "checkout", the site's domain) for the card inputs the live checkout shows, such as card number, expiry, CVC, name, and billing ZIP; never tell them you can't take their card, and never predict that the form can't reach card inputs embedded from a payment provider. Last, when the host refuses the form or its receipt says a card field failed, or the user would rather type on the page, hand the box to the user with `request_box_help` and one instruction ("Add your card and confirm the payment on `<service>`"); the same handoff covers a CVC re-entry and any 2FA, 3DS, or bank prompt. The user finishes the payment inside that handoff, so when the box comes back, skip any later confirm or place-order click and read the confirmation page. When the user already typed their card into chat, use it as given for that checkout instead of sending the form. Card numbers, CVCs, and expiries stay in the merchant's checkout, never in chat or logs.
8. Read the confirmation page. Report the confirmation number, the restaurant, the weekday and date, the time in the user's zone, the party size, and the cancellation policy if shown. Attach the confirmation screenshot at its exact saved path when the subagent captured one.
9. Offer once to add the reservation to their calendar. With a Google Calendar connector connected, create the event through it. Without one, run `SearchPlugins` for it. Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. Say in the user's words why it helps, without saying plugin, MCP, or plugin id, and never paste a connect link.

## Presenting choices

- Open-ended search: three to five restaurants, each with name, cuisine, neighborhood, one quality signal, the open times in the window, and the verified booking link. Attach the saved screenshot when the results page shows photos, maps, or cards worth browsing; otherwise text is enough. Ask which restaurant and time with a question widget before booking.
- Named restaurant with several open slots: list the times as text ("6:45, 7:15, and 8:30 PM, all indoor") and ask with a question widget whose options are those slots.
- Exact restaurant, time, and party, and the slot is open: book it and say what you did. No widget.
- Refinement ("somewhere Italian instead", "a bit later", "less expensive"): apply the filter, present the new set, and ask again. Never swap in a new restaurant and book it.
- Known access risk: keep the hedge short and specific to the chosen site ("Marea books through OpenTable, which sometimes blocks me. Trying it now."). If it blocks and you verified a booking link, send the link. Otherwise check the restaurant's own site and the search results for one other legitimate booking route, report what you verified, and ask before booking there, or say you checked and found none. Never guess that Resy or the restaurant's own site takes reservations.
- Every widget option must be a slot or a route you saw. Never pad with guesses.

## Pitfalls

- Typing a relative date without first stating the weekday and date pair. Booking sites show the date without its weekday, so a wrong date silently returns the wrong day's slots.
- Trying other URL patterns after a hand-built results URL failed. Reopen the same URL once. The homepage search form comes next only on a site without a playbook.
- Some restaurants book only through their own site or by phone. Say so and give the route instead of forcing a platform.
- A party above the platform's online maximum usually needs a large-party form or a call. Report that route; do not split the party into two bookings unless asked.
- Deposits, prepaid menus, and cancellation windows change the decision. Mention them before the widget when they are visible, and again in the confirmation message.
- Holding tables at several restaurants "to be safe" is not something the user asked for. Book one.
- If the confirmation page shows no number, say so instead of inventing one; a connected Gmail connector can find the confirmation email.
- Label times in the user's zone. The site shows the restaurant's local time, which differs when the user is traveling.
- Save a stated preference ("always outdoor if possible", "book under Sam's name") with `UpdateMemory` only when the user says it, not when you infer it.

## Site playbooks

Before you dispatch the browser subagent, Read the `site-playbooks-opentable` or `site-playbooks-resy` skill in this catalog, whichever names the site you are about to use, and paste the Dispatch snippet of the job that matches your step (a read-only lookup, or a cart and checkout) into the Task text. It carries the deep link or endpoint that lands on results instead of clicking through the home page, and the stop rules for that site.
