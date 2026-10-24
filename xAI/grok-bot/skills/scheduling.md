---
name: scheduling
description: >-
  When the user mentions their calendar, a meeting, their availability,
  coordinating a time with other people, a recurring reminder, an appointment to
  book, or anything else about their time, read this before you act, even when
  they do not say scheduling.
---
# Scheduling

You are working on the user's time: their calendar, their meetings, their availability, and getting other people into the same slot.

## Entry points

Any of these, whatever words the user used:

- Creating, moving, or cancelling something on their calendar, or finding when they are free.
- Setting up a meeting with other people, replying on a scheduling thread, or sending someone times.
- A recurring reminder tied to a time ("every Sunday evening, help me plan the week").
- An appointment booked on a website first (dentist, salon, class, tickets).

## The five questions

Every request resolves some of five questions. Work only the ones context leaves open.

- WHO. The people on the event, and whether each is invited or only mentioned.
- WHAT. A private hold, a 1:1, a group meeting, focus time, out of office, a reminder.
- WHEN. A concrete date, start, duration, and time zone, or a range still to narrow.
- WHERE. A place, a video call, or a phone call, when it changes how the event is built.
- HOW. Which calendar owns the event, whether anyone is notified, and which channel carries any message to another person.

## Before you mutate

Every calendar write goes through the Google Calendar connector.

- Check for it with SearchPlugins, and read the connector's schema before your first write.
- Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. Say in the user's words why it helps, without saying plugin, MCP, or plugin id, and never paste a connect link. Its connect card handles sign-in, and the calendar tools arrive on the following message.
- Never write an event any other way, and never edit Google Calendar in your browser.

Ground the request from:

- This conversation, including anything forwarded or pasted.
- The Memory section of your prompt, then RecallMemory: working hours, work versus personal calendar, who "my manager" is.
- The Google Calendar connector: existing events, free and busy times, who is already on an event.
- The Gmail connector: the thread being scheduled. When it is not connected, install it the same way or have the user paste or forward the thread.

History is a lead, not consent. An old email, a saved note, or an earlier proposal tells you whom to contact and which slots to suggest. It settles neither WHEN for a new meeting with other people nor whether they are notified. Another attendee's time counts as agreed only when it comes from the current request, the live thread you are scheduling in, a calendar or booking result fetched for this task, or a confirmation received during this coordination.

## Load-bearing vs defaultable

Load-bearing details change what the event means and need grounding or a blocker. Preference details change how it looks. Default them and say what you assumed.

Load-bearing:

- Which person, when a name is ambiguous.
- The request class below.
- Attendees, and whether they are invited or notified.
- Which calendar owns the event, when the user has more than one.
- The concrete date, time, and time zone. "Sometime in the next two weeks" can propose slots but cannot send an invite while another attendee's availability is unverified.
- Place or video, when it changes the setup.
- Any message: recipient, thread, sending account, sent or handed back for review.
- Recurrence, visibility, RSVP, and description wording others will read.

Preference-shaped: duration, title wording, video link, reminders, color, buffers, slot ranking, confirmation length.

Place is a preference for a solo focus block and load-bearing for a dinner invitation. The lists shift with the interpretation.

When a load-bearing gap survives grounding, send one question widget that batches every unresolved meaning-changing detail with real options you verified, and stop. The widget ends the turn. Never ask about preference details.

## Request semantics

Classify before you write:

- Solo bookkeeping. A block, hold, reminder, focus time, or out of office. No attendees.
- Person-attached private hold. A name appears, but the event is a note to self ("put Maya's talk on my calendar so I don't forget"). No attendees, no notification.
- Coordination or invite. The other person expects the event to reach them: "set up", "schedule with", "invite", a reply on their thread.
- Proposal or outreach. Find times, send availability, ask someone, or follow up. A message goes out, and an invite may follow.
- Ambiguous. More than one still fits after grounding. Ask with a widget.

"Put it on my calendar" does not decide the class, and naming a person does not by itself mean an invite.

## Flow

1. Read the message and anything forwarded. Note which questions it answers and classify it.
2. Fill the load-bearing gaps from the grounding sources and check the connector for conflicts.
3. When a gap survives, send the one batched widget and end the turn. Otherwise pick preference details from Defaults.
4. Act through the connector and send any message the class calls for.
5. Report in one or two sentences: the time in the user's zone, who is on it, that it is done, and the event link.
6. When you guessed a preference, offer once to keep it. On a yes, save it with UpdateMemory.

## Defaults

- Duration. 30 minutes for a 1:1, 60 for a group, unless told otherwise.
- Video. A generated video link for a grounded virtual meeting, none for solo holds.
- Title. "`<Other person>` / `<User>`" for a 1:1, topic only for a group. The user never hears the title.
- Description. Empty unless the request carries an agenda.
- Reminders. The calendar's default.
- Time zone. Your prompt's Time section, for every time you type or say. Tools run on UTC. When you resolve a relative date, say the weekday and the date together.

## Updating events other people are on

Changing an event that already has attendees is load-bearing. Fetch it, read who is on it, and confirm with a widget before writing.

- Cosmetic edits for the user's own view (title wording, color, a private description tag, reminders, visibility) notify nobody.
- Real changes (time, place, agenda, cancellation) notify every attendee.
- When the choice is not obvious, such as a typo fix on someone else's invite or moving a meeting the user does not own, ask first.
- Add or remove people with the connector's add-attendee and remove-attendee style operations when the connector offers them, instead of replacing the whole list.

## How requests arrive

- An explicit request in chat. Resolve what is missing and act.
- A forwarded email or message with an instruction ("get this on the calendar"). Read the thread. The instruction is the intent.
- A forwarded thread with no instruction. Propose what you think it means and wait for the answer before writing anything.
- A routine firing on a schedule, created with UpdateRoutine: "every Sunday evening, plan the week". Offer one when the user describes a recurring reminder rather than a one-off event.

## When the booking happens on a website

A dentist, salon, gym class, government office, or ticketed event is reserved on its own site. A calendar hold alone tells the user something is booked when it is not.

- Run SearchPlugins for the service first and use a connector when one exists.
- Otherwise hand the reservation to a computerUse subagent with the exact URL, the slot or preference, and what to report back. Confirm with a widget before it places the reservation.
- When the site wants a sign-in, a one-time code, or a verify-you-are-human check, follow the Cursor-managed `sign-in` skill in its order, which ends with the Secure Form (`RequestUserForm`) and then handing over the screen with `request_box_help` and one instruction ("Sign in to your `<service>` account"). Never send a question widget before these; the tool is the ask. After a receipt or a hand-back, dispatch the subagent again; the session persists across turns.
- Use RequestUserForm for the other typed fields (name, phone, a booking note).
- When the site wants payment, a deposit, or a card to hold the booking, work it in this order and stop at the first step that pays. First, a payment method already saved on the account. Have the subagent select it, and when several are saved, ask which one in the confirmation widget. When the account has none and the site charges an exact total now (tax, fees, tip, and shipping included), Stripe Link is the preferred way to pay: with `RequestVirtualCard` among your tools this turn, raise a one-time card with the site as merchant and type it only into the merchant's checkout; a denial is final. Without that tool, offer Stripe Link once as the `purchases` skill says, when that skill is listed. A card kept on file for a hold or a no-show fee is not charged now, so it never gets a one-time card. Next, and right away whenever the user turns Link down, ignores the offer, or asks to use their own card, send the Secure Form (`RequestUserForm`, reason "checkout", the site's domain) for the card inputs the live checkout shows, such as card number, expiry, CVC, name, and billing ZIP; never tell them you can't take their card, and never predict that the form can't reach card inputs embedded from a payment provider. Last, when the host refuses the form or its receipt says a card field failed, or the user would rather type on the page, hand the box to the user with `request_box_help` and one instruction ("Add your card and confirm the payment on `<service>`"); the same handoff covers a CVC re-entry and any 2FA, 3DS, or bank prompt. The user finishes the payment inside that handoff, so when the box comes back, skip any later confirm or place-order click and read the confirmation page. When the user already typed their card into chat, use it as given for that checkout instead of sending the form. Card numbers, CVCs, and expiries stay in the merchant's checkout, never in chat or logs.
- Once the site confirms, put the appointment on the calendar through the connector, confirmation number included, and share the event link.

## Constraints

- Write a concrete event only after the load-bearing details are grounded, defaulted as safe preferences, or explicitly wanted as placeholders. When the owning calendar is ambiguous, ask instead of using the default calendar.
- Attendees follow intent. Invite every grounded participant on a coordinated event, include the user unless they are not attending, and give holds, reminders, and placeholders no attendees.
- A message to another person, whether an availability proposal or a confirmation, goes out on the user's behalf. Confirm with a widget first, write it in the user's voice, and send it through the Gmail connector or the thread's own channel. Never save a Slack draft and call it done.
- The event link is the proof. Put the link the connector returns in your report.
- Do not read the event title back. Confirm the time, the people, and that it is done.
- Never invent availability or a confirmation number. When a source is missing, say so and offer the real path.
- An explicit instruction beats any default here.
