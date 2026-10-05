---
name: action-items
description: "Manage your private to-do list for the user. Use to add or update tasks, record what they are waiting on, track blockers, mark tasks complete or canceled, and clean up the list. Not for Dreamers or external task trackers."
---

# Action items

Use this skill to update `/action_items.md` in `dream_notes`. It is the private list of important tasks, commitments, and activities you are helping the user move forward.

Use `cloud_threads.read_dream_notes` to read the file and `cloud_threads.write_dream_notes` to update it.

The main assistant decides what to do for the user. If you're the native memory subagent, use the findings, the parent thread when available, and existing notes to decide which action items to add, update, or close. Make and verify the changes. Dreamers may read the list and suggest changes, but they don't edit it.

When assigned to maintain memory, record the next useful step. Carry it out only if the main assistant also assigns you that work.

## Objective of `/action_items.md`:

- `/action_items.md` contains a list of the user's important ongoing activities – open tasks, commitments, deadlines, scheduled checks, admin, to-dos. You use these items to provide proactive reminders and help for the user, and as a way of tracking progress on the user's ongoing life tasks.
- User requests, connected sources, and Dreamer reports can all surface possible action items. Track relevant open work even if the user explicitly hasn't mentioned it, hasn't asked you to work on it or you aren't starting it immediately.
- You are also responsible for cleaning up action items when they are complete, so that this list remains high-signal. For example, if an expense report shows four items needing information from the user and five awaiting Finance review, track the four as needing the user and don't treat the other five as work for the user. Leave out unrelated team follow-ups with no clear owner.

## Adding to and updating `/action_items.md`:

- Start with [] only if the file is confirmed missing or empty. Do not replace a file you have not read. Store a formatted JSON array with one object per item, no Markdown or code fence.
- Read all of `/action_items.md` before writing; a write replaces the whole file. Set `limit_chars` to `100000` for each read. If `has_more` is true, continue from `next_offset_chars`. If you can't read the whole file, don't write. Preserve any items you aren't updating or removing.
- Add or update an unresolved task, commitment, or deadline that matters to the user, a concrete opportunity to help with something they care about, or a meaningful change to an existing task. Save it as `todo` even if work isn't starting now or one detail still needs checking. Record what is known and the next useful step. If ownership or status is uncertain but the outcome matters to the user, make the to-do about checking that. Record an unanswered request as a request, not an accepted commitment. Tracking it does not authorize an external action or require messaging the user. Leave out unrelated or purely speculative work. Link the original source or a supporting memory note.
- If there is an existing item with the same outcome, update that item, keeping its ID and creation time. Incorporate new evidence about its status, blocker, deadline, or outcome; close it when the evidence shows it was completed or cancelled.
- Use these eleven fields on every item, in this order:
  - id: A unique, stable, readable ID like `choose-boston-wedding-flight`. Use lowercase words separated by hyphens; add a meaningful detail if two names would otherwise match. Preserve an existing ID when converting older items.
  - name: A short, plain name like Check Iberia claim status.
  - emoji: One emoji that fits the task, like 🧾 for a refund or ✈️ for a flight. Keep it out of the name and description. Use null if no emoji fits.
  - description: A short preview for the user. Add context or explain the outcome without repeating the title, like "Process a refund from your cancelled flight on September 12, 2026." Use full calendar dates with the year, not "today," "tomorrow," "next week" or similar wording. For a specific time or cutoff, show it in the user's known time zone and name the zone, like "September 16, 2026 at 3 p.m. PT." If the user's zone is unknown, use the source's stated zone and say the user's zone is unknown. If neither is known, mark the time zone unconfirmed. Don't invent a time for a date-only deadline. Keep the working details in notes.
  - notes: One free-form text string with the detail you need to continue the task. Include useful background, what has been checked or done, decisions, open questions, who or what is pending, deadlines, next steps, and links to original sources or your memory notes when relevant. Write as much as the task needs; paragraphs or line breaks are fine. Use the person's actual name when you know it, including the user's. Otherwise say the user or what you know, rather than you. Link to fuller records instead of copying them wholesale. Use the same date and time rules here. If the source's time zone differs from the user's, keep the original time and zone here too. Use "" when there's nothing to add.
  - blocked: true if no useful next step is possible until something changes; otherwise false.
  - blocked_by: A list of IDs of other items that currently block this one. A nonempty list means blocked is true; use [] when there are none. An item can still have blocked: true with blocked_by: [] when the blocker is outside the list. Any ID here must exist and must not be this item or create a cycle.
  - waiting_on: user, assistant, other, or null. Use user when the user owes a reply, decision, or action; assistant when your work or a delegated result is still pending; other for another person, a service, or an event; and null when nothing is pending. Say exactly who or what is pending in notes. If several things are pending, choose the one that matters most for the next step and mention the rest in notes.
  - status: todo, in progress, done, or cancelled. Start at todo; use in progress when work has begun, done when the outcome is confirmed, and cancelled when it is no longer being pursued. Waiting and blocking are separate from status.
  - updated_at: When the item last changed, in ISO 8601 UTC, like 2026-09-15T14:00:00Z. Refresh it only when something actually changes.
  - created_at: When the item was first recorded, in the same format. Set both timestamps to the same time for a new item; keep created_at unchanged afterward.

- If useful work can continue, keep blocked false and record the next step. Continue the work only if you were also assigned to do it. If nothing useful can move, set blocked to true; put any tracked task that actually blocks it in blocked_by. When the pending thing arrives or no longer matters, clear or update waiting_on and check whether the task is still blocked.

## Stale tasks:

- Clean up tasks in `/action_items.md` when you notice duplicates, a passed deadline, or a change to what the task is waiting on or blocked by. A passed deadline doesn't mean the task is done or canceled. Check what happened and whether there's still something to do. Use the conversation and memory notes to support changes.
- When an item is done or canceled, set blocked to false, blocked_by to [], and waiting_on to null. Remove its ID from other items' blocked_by lists and check whether those items can proceed. If a canceled dependency still leaves a real obstacle, name it in notes and update the dependent item as appropriate.
- Ensure that you do not write or update your memory and `/action_items.md` files with duplicative information. For duplicates, keep one item, move useful notes and dependency references to it, reconcile what is still pending, and mark the duplicate cancelled with the retained ID in its notes.
- Keep items marked `done` or `cancelled` in `/action_items.md` for seven days after their last real change (`updated_at`). Once more than seven days have passed and the item is still closed, archive it under `/agent_notes/past_tasks/`.
- Seven days after an open item's deadline, check whether anything useful remains to do. If nothing remains, mark it `cancelled`, note why, and archive it right away; don't wait another seven days. An RSVP for an event that already happened can be archived. An overdue expense report or a commitment the user made should stay open if it still matters. If you can't tell, keep the item open and note what needs checking.
- Copy the full item into the archive, preserving anything already there, and verify the copy before removing it from `/action_items.md`. If you can't read or verify the archive, leave the item in the list. If an archived task reopens, restore it to the list with the same ID.

## Examples: action items good dreaming can uncover

These are some examples of action items but are not exhaustive so use your judgement for what the important threads in the user's life and work are.

### Personal life

- **Send proof of homeowners insurance** - The mortgage company says it will add its own coverage on September 18, 2026, but the insurer already emailed a current policy. Track it; check whether proof was already sent, prepare the policy and submission instructions, and flag the potential charge promptly. Keep it open until the lender confirms receipt.
- **Confirm Dad's ride to his appointment** - The user previously asked for help coordinating care. A clinic moves the appointment to a time they can't drive; no other ride is confirmed. Track it. You can compare options while waiting for the user's input; the final booking can become blocked once no other useful step remains.
- **Complete the school trip waiver** - A newsletter mentions a separate waiver due September 16, 2026; you find no confirmation it was submitted. Track it and flag it promptly. You can find the form and identify the one answer or signature still needed without claiming it was never submitted.
- **Request an $80 desk price adjustment** - A recent purchase drops in price while still inside the store's adjustment window. Track it once you verify eligibility and check for an existing credit. After a request is filed, the retailer is `other`; follow up if the promised credit does not arrive.

### Work

- **Verify a prompt change fixed the problem** - The user says they changed a prompt after reports that important findings were ignored; no validation result is available. Track verifying the change as `todo` even if no one asked you to test it and you aren't starting now. Record where to check and any result you later find.
- **Review the performance claim before launch** - The user accepted a review, but the latest test no longer supports a number in the launch copy. Update the existing launch-review item if it has the same outcome. Link both sources, draft corrected wording, and flag it before the copy freezes.
- **Claim a vendor outage credit** - An outage email quietly mentions a 15-day claim window. Check that the team was affected, the plan qualifies, and no one has filed; then track it if the user owns it or needs to coordinate with the owner. You can collect the incident dates and draft the claim.
- **Send an early beta invite** - The user previously asked for early testers; an older customer thread contains an offer, and the feature is now ready. Check that the customer fits and nobody followed up, then track the outreach and prepare a draft linking back to the offer.
- **Unblock the new hire's first week** - The scheduled onboarding lead will be away. Check the latest agenda and handoff thread; if coverage is still missing and the user owns or needs to coordinate it, track that specific gap and draft a handoff. If a replacement is already confirmed, do not add it.

### Example JSON

These five hypothetical records correspond to the examples above: homeowners insurance, the school waiver, the desk credit, the launch claim, and the beta invite. They show when you can still help, when your work is blocked, and who or what you're waiting on. In these five records, none depends on another tracked item, so `blocked_by` stays empty even when a user or a retailer is blocking progress. The next example shows what happens when one tracked task blocks another. Source descriptions are illustrative. When an example gives a time, assume the user is in Pacific time.  
```json
[
  {
    "id": "send-proof-homeowners-insurance",
    "name": "Send proof of homeowners insurance",
    "emoji": "🏠",
    "description": "Help prevent your mortgage company from charging you for extra coverage.",
    "notes": "The lender said it would add its own coverage on September 18, 2026, without proof. The current policy was checked and no earlier submission was found in the available records. The policy was sent through the lender's requested channel. The upload receipt is saved, but the lender has not confirmed acceptance. Call to verify receipt if it is still unconfirmed on September 17, 2026; keep this open until the lender confirms. Sources: lender notice, insurer renewal and upload receipt.",
    "blocked": false,
    "blocked_by": [],
    "waiting_on": "other",
    "status": "in progress",
    "updated_at": "2026-09-15T17:00:00Z",
    "created_at": "2026-09-15T14:00:00Z"
  },
  {
    "id": "complete-school-trip-waiver",
    "name": "Complete the school trip waiver",
    "emoji": "🎒",
    "description": "The school needs a separate signed waiver by September 16, 2026.",
    "notes": "The newsletter links to a separate waiver due September 16, 2026. The form was found and it requires a parent's signature. No submission confirmation was found in the available records. The form and deadline were sent to the user. No other step can move until the user signs or confirms it was already submitted. Sources: school newsletter and waiver.",
    "blocked": true,
    "blocked_by": [],
    "waiting_on": "user",
    "status": "in progress",
    "updated_at": "2026-09-15T16:00:00Z",
    "created_at": "2026-09-15T14:00:00Z"
  },
  {
    "id": "request-desk-price-adjustment",
    "name": "Request an $80 desk price adjustment",
    "emoji": "🧾",
    "description": "Recover the price difference on your desk order.",
    "notes": "The order was verified as eligible, no existing credit was found, and the request was filed on September 15, 2026, after the user approved it. The retailer promised a response by September 21, 2026, and a follow-up is scheduled for September 22, 2026, if the credit has not appeared. There is no useful step before then; a filed request is not a confirmed credit. Sources: order receipt, adjustment policy and retailer acknowledgment.",
    "blocked": true,
    "blocked_by": [],
    "waiting_on": "other",
    "status": "in progress",
    "updated_at": "2026-09-15T18:00:00Z",
    "created_at": "2026-09-15T14:00:00Z"
  },
  {
    "id": "review-launch-performance-claim",
    "name": "Review the performance claim before launch",
    "emoji": "🚀",
    "description": "Correct a number in the launch copy by September 16, 2026 at noon PT.",
    "notes": "The user accepted this review in Slack, and this existing item already covers it. A Dreamer found the latest test does not support the number in the copy. A subagent is comparing both results; qualified wording can be drafted while that work runs. Flag the discrepancy to the user before copy freezes at noon PT on September 16, 2026 (3 p.m. ET in the project schedule). Sources: launch thread, copy draft and both test reports.",
    "blocked": false,
    "blocked_by": [],
    "waiting_on": "assistant",
    "status": "in progress",
    "updated_at": "2026-09-15T17:30:00Z",
    "created_at": "2026-09-14T18:30:00Z"
  },
  {
    "id": "send-early-beta-invite",
    "name": "Send an early beta invite",
    "emoji": "🧪",
    "description": "Reconnect with a customer who offered to test the feature.",
    "notes": "The user previously asked for help finding early testers. An older customer offer was found and the feature and customer fit were checked. No later outreach was found in the available records. A draft invite is ready; no reply, decision or delegated work is currently outstanding. Next: share the draft with the user in the next regular update. Sources: original customer thread and beta-readiness note.",
    "blocked": false,
    "blocked_by": [],
    "waiting_on": null,
    "status": "in progress",
    "updated_at": "2026-09-15T19:00:00Z",
    "created_at": "2026-09-15T15:00:00Z"
  }
]
```

### Example: one task blocks another

Before the user chooses a date, venue pricing is blocked by `choose-offsite-date`. Both items are waiting on the user, but only the venue item lists another task in `blocked_by`.  
```json
[
  {
    "id": "choose-offsite-date",
    "name": "Choose a date for the team offsite",
    "emoji": "📅",
    "description": "Pick September 24 or 25, 2026 for the team offsite.",
    "notes": "The user asked for help planning the team offsite. September 24 and 25, 2026, both work for the team; the user still needs to choose. No further date research is needed. Source: planning thread.",
    "blocked": true,
    "blocked_by": [],
    "waiting_on": "user",
    "status": "in progress",
    "updated_at": "2026-09-15T15:00:00Z",
    "created_at": "2026-09-15T14:00:00Z"
  },
  {
    "id": "compare-offsite-venue-prices",
    "name": "Compare venue prices for the offsite",
    "emoji": "🏢",
    "description": "Find out what the shortlisted venues cost for the chosen date.",
    "notes": "Prices depend on the exact date, and the user still needs to choose September 24 or 25, 2026. The venue shortlist is ready; there is no useful price comparison to make until the date is set. Sources: venue shortlist and planning thread.",
    "blocked": true,
    "blocked_by": [
      "choose-offsite-date"
    ],
    "waiting_on": "user",
    "status": "todo",
    "updated_at": "2026-09-15T15:10:00Z",
    "created_at": "2026-09-15T14:05:00Z"
  }
]
```
After the user confirms September 25, 2026, mark the date task `done` and keep it in the list. Remove its ID from the venue task, clear `blocked` and `waiting_on`, and leave its status `todo` until work starts.  
```json
[
  {
    "id": "choose-offsite-date",
    "name": "Choose a date for the team offsite",
    "emoji": "📅",
    "description": "You chose September 25, 2026 for the team offsite.",
    "notes": "The user asked for help planning the team offsite. September 24 and 25, 2026, both worked for the team; the user confirmed September 25, 2026, in the planning thread. Source: planning thread.",
    "blocked": false,
    "blocked_by": [],
    "waiting_on": null,
    "status": "done",
    "updated_at": "2026-09-16T09:00:00Z",
    "created_at": "2026-09-15T14:00:00Z"
  },
  {
    "id": "compare-offsite-venue-prices",
    "name": "Compare venue prices for the offsite",
    "emoji": "🏢",
    "description": "Find out what the shortlisted venues cost on September 25, 2026.",
    "notes": "The venue shortlist is ready, and the user confirmed September 25, 2026. Next: check published rates for that date and prepare a comparison. No price research has started yet. Sources: venue shortlist and planning thread.",
    "blocked": false,
    "blocked_by": [],
    "waiting_on": null,
    "status": "todo",
    "updated_at": "2026-09-16T09:00:00Z",
    "created_at": "2026-09-15T14:05:00Z"
  }
]
```
