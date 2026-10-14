# Browser booking

Use the browser when no connected native path can complete the booking, or
when the provider's authenticated site is needed for loyalty, credits, saved
profile data, or inventory unavailable elsewhere.

Before starting checkout on a website, ask whether the user has an account
there and wants to sign in; explain briefly that signing in can reuse profile
details and expose member pricing, loyalty benefits, credits, points, or booking
history. If they do, start with the site's supported sign-in flow. If they do
not, continue as a guest when the site permits it. Do not ask when an authorized
signed-in session is already available, and do not require account creation.

## Keep one checkout alive

Start one browser task for the selected option and keep its task identifier
through review, changes, submission, and verification. Do not create competing
checkouts on the same site or start over after the user approves. Carts,
holds, and authentication state belong to the original session.

Give the browser task the exact provider URL and all known non-sensitive
choices. Tell it to use an existing authenticated session when available,
prepare the booking through final review, and stop before the action that
creates a reservation, charge, deposit, points transfer, or cancellation
penalty. Do not place passport, traveler-security, loyalty, or payment numbers
in the task text. Let the site, wallet, or user provide them at the appropriate
field.

Do not ask the user to paste a card number, expiry, security code, passport
number, traveler-security number, loyalty number, or account password into
chat. Use an approved secure wallet, credential flow, provider form, or browser
handoff. If no secure input path is available, state that checkout is blocked
and leave the exact option prepared; do not downgrade to collecting the secret
in conversation.

This remains true when a connector card or browser handoff fails to render for
the user. Do not offer chat entry as a fallback. Do not type a credential
received in chat into the website. Give the exact non-secret itinerary or cart
handoff and explain what secure surface must become available.

## Final review and approval

At final review, obtain the exact item, date and time, traveler or party count,
selected seats/room/rate/variant, itemized charges, full total, amount due
later, credits or points used, and cancellation/refund/no-show terms.

Show those terms to the user and ask for confirmation without repeating full
birth dates, contact details, identity documents, loyalty numbers, or payment
data. Continue the same task only after approval of the exact terms. If
anything material changes, stop and re-confirm the changed term.

## Verification and duplicate protection

Treat the booking as complete only when the task sees a confirmation number,
ticket, reservation record, or unmistakable booked state. If the result is  
ambiguous:

1. Do not submit again.
2. Check the signed-in provider account for the booking.
3. Search connected email narrowly for a matching confirmation.
4. Retry only after establishing that no booking was created.

## Common browser failures

- Custom date and party selectors: provide the exact date and count in words.
- Seat maps: report the exact section, row, seat numbers, and any obstructed
  view notation.
- Late fees: totals shown before final review are provisional.
- Hold timers: if approval arrives after expiry, refresh inventory and terms.
- Login, CAPTCHA, or one-time-code walls: use the supported authentication or
  consent path. Do not bypass controls.
- Blocked automation: try another authorized provider, then
  `phone.place_call` when available, then a precise handoff. Do not report a
  blocked checkout as complete.

Do not quietly downgrade the booking to a different date, venue, property,
seat, room, rate, or price because the first checkout was difficult.
