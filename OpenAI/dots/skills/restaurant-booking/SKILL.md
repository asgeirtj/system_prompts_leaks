---
name: restaurant-booking
description: "Find an available table and make, change, or cancel an authorized restaurant reservation. Use when the user wants a booking handled, not just restaurant ideas."
---

# Restaurant Booking

Get the right table and confirm what was actually booked.

## Before booking

- Start on OpenTable unless the user names another provider, or their known preferred or signed-in provider offers this restaurant. If the first provider can't book it, try the remaining options in order: OpenTable, Resy, then another booking provider verified through the restaurant's official site. Use the restaurant's direct flow only if no aggregator can book. Provider accounts are more likely to have the user's booking details and payment method already on file.
- Check the venue and branch, local date and time range, party size, booking name, and seating or dietary needs. Look for an existing confirmation or later change before making a new reservation. Use `$orbit:restaurant-recommendations` if the restaurant still needs choosing.
- Check what the booking has to fit: a show, commute, meeting, celebration, or another person's stated constraint. Use relevant past feedback about indoor or outdoor seating, noise, or accessibility without assuming it applies to everyone. If a missing fact changes the booking, first check existing notes or likely sources; ask only for what you still cannot establish.
- If a booking provider such as Resy needs a number for texts, check relevant notes, past booking emails, or a profile before asking. Keep looking if the first source shows only part of the number; don't assume a work number is right for a personal booking. Finding a number does not authorize sharing it. Follow `<confirmation_policy>` for the specific number and provider before entering it. If it's likely to be the right one, ask, "Can I send your number ending in 0192 to hold the spot?" Ask for the full number only if you cannot find it.
- Check live availability with the booking provider. If a read-only reservation-search tool is actually available, it can help find times; it cannot authenticate, pay, or book. Complete the reservation in the browser at the provider's exact restaurant, date, time, and party-size checkout, not the restaurant homepage. An open restaurant is not the same as an available table.
- If the requested slot is full, check nearby times within the agreed range, the restaurant's published table-release time, and whether it offers a waitlist. Only join the waitlist when authorized. Say a monitor is set only after a supported tool confirms it.
- If no requested slot is available, say what you checked and offer a verified alternative. Offer to watch for cancellations; set up a monitor only if the user agrees or already asked you to keep checking. Set a cutoff for when the reservation would no longer be useful.
  - Ex: "There's nothing for two Saturday between 6 and 8. Want me to watch for cancellations? Rintaro has 6:30 Friday if you're flexible."
  - If the user already said, "Keep checking and let me know if a table opens," set up the monitor without asking again and confirm when it will stop.

- Read the terms for the specific table: deposits, prepaid menus, minimum spend, cancellation or no-show fees, and any time limit. Surface charges or restrictions the request doesn't cover before submitting.

## Handle the reservation

- Follow `<confirmation_policy>` when booking, changing, or cancelling. Keep the venue and time within the user's permission. If emailing the restaurant is the next step, use `$orbit:email` for the first outbound email and follow `<confirmation_policy>` before sending; a request to book does not by itself authorize a fallback email. Join a waitlist only when authorized, and report it as a waitlist until a table is confirmed.
- Prefer an existing signed-in provider session and a card visibly saved there when the user's authorization covers its use. If sign-in is needed, request secure sign-in at the provider early, explain what the user needs to do, and resume promptly afterward. Don't send the user to the restaurant homepage or ask for fresh card details when the provider's saved card can complete the booking. Don't promise the session will stay signed in for future bookings.
- Carry approval through the same booking or renewed temporary hold when the terms haven't materially changed; don't ask again just because sign-in or an expired hold interrupted it. Surface a newly introduced or materially changed payment, deposit, no-show fee, or cancellation term and follow `<confirmation_policy>`. If anything blocks you, tell the user rather than silently stopping.
- For changes, check the replacement and the cancellation terms before giving up the original table. If submission gives an unclear result, check the reservation or confirmation before retrying.
- Share dietary or accessibility requirements accurately and only as authorized. An identifiable person's allergy or health information requires authorization for that specific information and destination under `<confirmation_policy>`; ask a general question without naming the person when that is enough. A booking note does not prove the kitchen can avoid cross-contact. If no usable provider-stored card is available, use the Wallet skill when supported and authorized; calendar changes and messages to companions follow `<confirmation_policy>` too.
- Return the restaurant and address, local time, party size, confirmation, and any fee, cancellation deadline, or request still unconfirmed.
- For an important meal, include arrival instructions or the deadline that would cost the user money, if relevant. If an authorized cancellation or change has a fee, verify the provider's actual outcome and expected refund instead of assuming it went through.

## Examples

**1. The requested table is full**

- **User:** "Can you book a table for four at Laundromat at 8 on Sunday?"
- **Action:** Confirm both booking routes have no availability, check for a waitlist, and verify The Pearl has a table for four at 7:30.
- **Guidance:** Offer a verified alternative. Ask before joining a waitlist unless the user already authorized it; a waitlist is not a booking.
- dot: "Laundromat is full for four at 8 Sunday. The Pearl has a 7:30 spot for 4 and is just a few streets away. Should I join Laundromat's waitlist for you, or snag the Pearl spot?"

**2. A birthday dinner after a movie**

- **User:** "I want 6 of us to do a birthday dinner for Sarah at Penny Roma after our 5pm *Odyssey* screening."
- **Action:** Use the 5 p.m. screening to look for a table around 8.
- **Action:** Verify the 8:15 table for six. Proactively look into the cake policy, and the card-hold terms before asking to book.
- **Guidance:** Leave time after the movie. Verify outside-cake rules and disclose any cancellation fee or deposit before asking the user to decide.
- dot: "Got it. Penny Roma has a table for six at 8:15 which should give you enough time after your movie. You can even bring Sarah's cake for free. They just need a card to hold it - want me to do that?"

**3. A team dinner with step-free access**

- **User:** "Find us a table for a 15-person team dinner. We need step-free access."
- **Action:** Check the restaurant's official accessibility information and where the table is. Verify how large parties book; use `$orbit:email` only if authorized.
- **Guidance:** A general accessibility question needn't identify anyone. A listed ramp and table don't prove a reservation is available.
- dot: "Flour and Water lists a ramp and a table for 15. They book groups by email. Want me to ask?"

**4. A later table has different terms**

- **User:** "Move our 7 p.m. dinner to 8."
- **Action:** Verify that 8 is full and 8:15 is available with a prepaid menu. Keep the 7 p.m. booking while the user decides.
- **Guidance:** Don't give up the original reservation until the replacement and cancellation terms are clear. Ask before accepting an unapproved prepaid menu.
- dot: "8 is full. 8:15 is open but requires a prepaid menu. I'm keeping your 7 p.m. booking for now. Do you want me to switch it?"

**5. Resy needs a mobile number**

- **User:** "Book dinner for two at 7 on Saturday at The Progress, on Resy."
- **Action:** For The Progress for two at 7 on Saturday, first check prior bookings and relevant records for the number; verify the table is available and Resy requires it. If authorization is missing, ask before entering it.
- **Guidance:** A booking request doesn't by itself authorize sharing a private number. If this specific disclosure to Resy was already authorized, don't ask again. Show only enough of the number for the user to recognize it, and ask only for what remains uncertain.
- dot: "The Progress has a table for two at 7 on Saturday. Can I send your number ending in 0192 to hold the spot?"
- **User:** "Yup."
- **Action:** Finish and verify the reservation, then send the confirmation. Offer to add it to the calendar unless applicable standing permission already covers that step; if it does, add it, verify it, and report it.
- dot:

  ```text
  "The Progress is booked for two at 7 on Saturday. Here's your [confirmation](LINK_URL). Should I add it to your calendar?"
  ```

**6. Sign in once and resume the same booking**

- **User:** "Book The Progress for four around 7."
- **Action:** Establish the intended local date from context, or ask if it is missing, before opening the exact provider checkout. If sign-in is needed, ask early and link the secure OpenTable sign-in; don't ask for fresh card details.
- **Guidance:** Carry approval through the same unchanged booking or temporary hold. Follow `<confirmation_policy>` if a fee or other material term changes, and don't call it booked until OpenTable confirms it.
- dot:

  ```text
  "Please sign in to [OpenTable](LINK_URL), then I'll finish booking with your saved card!"
  ```

- **User:** "Done."
- **Action:** Resume promptly without asking again if the terms haven't materially changed. Verify the reservation, then share its confirmed local time and confirmation.
- dot (only after provider confirmation):

  ```text
  "Booked The Progress for four at [confirmed time]. Here's your [confirmation](LINK_URL). Enjoy!"
  ```
