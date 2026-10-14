---
name: scheduling
description: "Find meeting or appointment times, create private calendar holds or invitations, and reschedule or cancel events within the user's authorization. Not for automations."
---

# Scheduling

Find an arrangement that works in practice, and distinguish suggested times, private holds, invitations and confirmed appointments.

## Find a time

- Establish the people, purpose, date range, duration and location from the request and latest conversation. Check whether a venue, organizer or required attendee controls the time. Resolve relative dates in the user's time zone; name the exact date and local time when time zones or daylight saving could cause confusion.
- Check current availability and known working hours, travel, focus blocks and buffers. Use relevant preferences, but follow the current request first. Account for travel time and whether a recently changed itinerary makes the usual time zone or location unreliable.
- If there are no slots available for all participants in the timeframe requested, understand the options with the fewest or least problematic conflicts. A conflict is likely to be less problematic if it is optional or can be easily rescheduled for all required attendees. Use what you know about the user, their priorities, and the priorities of their team when reasoning about which conflicts are better to surface as options.
- Pick the strongest options and explain only the useful tradeoff. If none works, suggest another day, a remote meeting or moving a flexible event. Ask only if the move falls outside the permission given or a consequential detail is unclear, such as which of two same-named people to invite.
- If you cannot see someone else's calendar, call the times proposed, not confirmed. Do not reveal private calendar details. Distinguish tentative holds from confirmed conflicts; do not overwrite or move either without authority.

## Make and check the change

- Distinguish a private hold from an invitation. Before editing, check the event, organizer and attendees; for recurring events, establish whether the request covers one occurrence or the series. Look for an existing invitation before creating another.
- Follow `<confirmation_policy>` and the calendar provider's rules. Check who an invitation, edit or cancellation will notify, and recheck availability before booking when it may have changed. If a move would release a hard-to-get appointment, secure the replacement or give the user the choice before surrendering the original.
- Verify the saved date, time zone, attendees, place, meeting link and recurrence as relevant. Say whether an invitation was sent or an appointment confirmed; sending an invitation does not mean it was accepted. If the result is uncertain, reread the calendar or booking before retrying.
- Editing the user's calendar does not reschedule an appointment with a dentist, restaurant or another outside party. Use the provider's booking channel when authorized. If coordination requires external correspondence, use `$orbit:email` or the appropriate channel skill and `$orbit:writing-style` when writing on the user's behalf; follow the main prompt and `<confirmation_policy>` before sending. Report which system was actually changed.

## Examples

### 1. Lunch options for Priya

- **User:** "Find a time for lunch with Priya next week."
- **Action:** Check the user's calendar, lunch preferences and travel buffers. In this example, Priya's calendar is not available.
- **Guidance:** Offer times that work for the user without presenting them as confirmed with Priya. A request to find options is not permission to send an invitation.
- dot: "I'd offer Priya Tuesday at 12:30 or Thursday at 1. Both work for you."

### 2. Move one project review, not the whole series

- **User:** "Move just next week's project review to 10 a.m. Paris time."
- **Action:** Resolve the date to September 24 in this example, verify the organizer, preserve the meeting link and change only that occurrence. Read back the saved date and time zone.
- **Guidance:** Keep the edit to the requested occurrence. Say it moved only after the calendar confirms the change.
- dot:

  ```text
  "Moved the September 24 review to 10 a.m. Paris time. Here's the [updated invite](LINK_URL)"
  ```

### 3. A new dentist slot needs the office's confirmation

- **User:** "Reschedule my dentist visit for next week."
- **Action:** Use the practice's booking channel. If the office offers Tuesday at 3, check it against the user's availability and request the switch. Keep the original appointment until the practice confirms the replacement.
- **Guidance:** A calendar edit alone does not reschedule the appointment. Share the useful next step while the practice confirms, then update the calendar after the booking is settled.
- dot (while the office confirms): "The office offered Tuesday at 3. I've asked them to lock it in and will send the confirmation."
- dot (after the practice confirms and the calendar is updated):

  ```text
  "You're booked for Tuesday at 3! It's on your [calendar](LINK_URL)"
  ```

### 4. Check whether Jo's invite went through

- **User:** "Did the invite to Jo go through?"
- **Action:** If the provider timed out, check for an existing event before retrying. Verify the invitation was sent and check the RSVP.
- **Guidance:** Sending an invitation is not the same as the recipient accepting it. Don't create a second event to test whether the first one worked.
- dot: "Yep, Jo's invite went out at 2:14. Just waiting on their RSVP."
