---
name: "muse-feedback"
title: "Muse feedback"
description: "Use for feedback and feature requests to the Muse team. Whenever your response tells the user you can't do a specific thing they wanted, or accepts them giving up on one, offer once to file feedback in that response. This covers missing integrations you can't do yourself, capabilities you lack, and tasks that keep failing at a specific point. File only on their go-ahead. Also use when asked to send, view, check, or withdraw feedback."
metadata: { "includeInPrompt": true }
---

# Muse feedback

## Purpose

File a user's feedback with the Muse team via the
`feature-request` CLI. Each report goes to the Muse team as a private
note; nothing in it is published anywhere.

For Muse's general early access program, use  
`/opt/hatch/skills/muse-early-access/SKILL.md`.

When the user asks to share feedback, follow the filing steps below for the
feedback they want to send. The guidance about when to offer feedback applies
only to proactive offers.

## When to offer feedback

- "I wish you could see the sleep data from my `<the-service>` watch": a
  service Muse doesn't support.  
  `--kind missing-integration --subject <the-service>`.
- "Can you scan this paper form?" when Muse has no such capability:  
  `--kind missing-capability --subject document-scanning`.
- "Checkout on that store's site never loads": a supported feature failing
  somewhere specific, repeatably: `--kind broken-behavior --subject <the-site>`.
- A connect or setup flow that keeps failing until the user gives up
  ("forget it, I'll do it myself") is a gap too, even though nobody said
  "can't": `broken-behavior` with the service as subject.

A workaround does not cancel the report. When the user wanted an automatic
connection and settles for pasting, typing, or doing it themselves, the wish
they arrived with is exactly what the Muse team can't see; make the offer in
the same message as the workaround: "I can't connect to your watch. Want me
to mention to the Muse team that you'd like that? Meanwhile, paste me the
numbers each morning and I'll track them the same way."

For feature requests naming an outside service or device, use
`missing-integration`, even if the ask sounds like a capability, with that
service's own name as the subject slug: lowercase, dashes for spaces, and
for a site the name without the `.com`. Use `missing-capability` for gaps or
requests to change a restriction with no outside service involved. Use
`broken-behavior` for problems with Muse, including slowness and answer quality.

- Do not offer unprompted feedback about Muse being slow, expensive, limited,
  or broken, including sign-in failures, outages, and model quality. For
  failed connections to outside services, follow the give-up guideline above.
- Do not offer unprompted feedback about slowness, even at a named site,
  unless the task keeps failing.
- Do not offer unprompted feedback about changing an intentional restriction.
- Do not offer unprompted feedback about errors that recovered or failures
  without a specific point of failure.
- Fix or retry your own execution mistakes. Do not offer unprompted feedback
  about them.

When the user gets frustrated, ask yourself why. If the answer is something
within your control, fix it: offering to report would only seem like an
excuse. If the answer is an issue worth filing, offer to do so following
our guidelines.

## Positive feedback

When the user explicitly asks to pass along praise, such as "tell your
developers I love this app", use `positive-feedback`. Never offer to report
praise unprompted. Use the praised feature as the subject, or `muse` for the
app overall. Also use `positive-feedback` for general offers to help or
contribute, describing the offer as given. Follow the same filing and
repeat-report rules below.

## Filing

Keep feedback replies brief and focused on what the user needs to know.

1. Describe the feedback in terms any user could share, free of private data:
   no names, contact details, addresses, account numbers, or amounts.
   Do not claim an unverified cause.
   Everything about this user's own situation (their goal, their marathon,
   their job) belongs in `--context`, which never joins the report the Muse
   team receives; it is kept locally so a later conversation can be specific
   if the gap is ever closed.

   Use details already in the conversation. Use the affected feature, service,  
   or issue as the subject, such as `response-speed`, `answer-quality`, or  
   `sign-in`. Use `muse` when the conversation gives no more specific topic.  
   Ask only for approval to send the report; do not ask the user for  
   additional report details.

   Draft the report. Drafting sends nothing and files nothing. Pass no  
   `--context`: the draft runs before the user has agreed, so nothing about  
   their own situation belongs in it yet.

```bash
feature-request draft --kind missing-integration --subject whoop \
  --summary 'wants sleep and workout data from their Whoop watch'
```

2. Present the returned summary as an unsent draft, quoting it in full and
   verbatim. Ask whether to send it to the Muse team as a private note, and
   say that the report excludes details about the user's own situation. End
   your turn. Do not file until the user explicitly approves in a later turn.
   Ask once. If they decline or do not answer the offer, drop it for the rest
   of the conversation, including the goodbye.
3. File it in the later turn, once the user says yes. Pass the same `--kind`,
   `--subject` and `--summary` you drafted, and add the `--context` the draft
   would not take. The command refuses a summary that changed after the user
   saw it. Send the line they agreed to, or draft the new wording and ask
   again.

   Set `file --client-surface` from the current message's `Sent from` metadata:  
   `web`, `ios`, or `android`. For a provider chat, use its channel:  
   `whatsapp` or `messenger`. Use `unknown` when the metadata is  
   unavailable. Do not ask the user which client they are using or append a  
   surface tag to new summaries.

```bash
feature-request file --kind missing-integration --subject whoop \
  --summary 'wants sleep and workout data from their Whoop watch' \
  --context 'training for a marathon; wants readiness briefings'
```

   Single-quote `--summary` and `--context`: inside double quotes bash reads  
   `$650` as a variable and drops it, so "pays $650 rent" records as "pays 50  
   rent".

4. Describe the report category in ordinary words, such as "a missing
   fitness-watch connection". Do not show field names, slugs, or raw command
   output. Do not quote the summary again. Report delivery according to the
   command's output:

   - `sent_to_developers: true`: confirm that the report went to the Muse team
     as a private note and excludes the user's personal context.
   - `sent_to_developers: false` with `delivery_confirmed: true`: it was
     already with the Muse team; nothing new went out, and never say it was.
   - `sent_to_developers: false` with `delivery_confirmed: false`: nothing
     went out this time and no earlier delivery was ever confirmed. Tell the
     user: "I've kept your request here, but I couldn't confirm it reached
     the Muse team. I won't resend it right now in case it already got
     through."

5. Read the error text when the command fails. Every refusal below recorded
   nothing and sent nothing.

   - Summary mismatch: retry in the same turn with the exact draft summary.
     For a first filing, this must be the wording the user approved. To change
     a new report's wording, draft it and ask for approval again.
   - Missing draft: draft the report and file in a later turn. For a first
     filing, ask for approval before filing.
   - Same-turn draft: end the turn and file after the user replies in a later
     turn. For a first filing, that reply must explicitly approve the report.
   - Expired draft: draft the report again and file in a later turn. For a
     first filing, ask for approval again.
   - Hourly limit: nothing was recorded or sent. Say it could not be filed
     now, and do not run `file` again in this conversation.

   For every other error, do not run the command again in this conversation,  
   because the report may already have reached the Muse team. Do not promise  
   a background retry, and do not tell the user you will make sure it lands.

## One report per gap

The Muse team counts how many people ask, not how many times. When the user
raises an already-filed gap again, use the existing report and its original
approval. Do not offer another report or request approval again.

1. Draft the same kind and subject. The later filing must use the exact
   summary from this draft.
2. End your turn acknowledging the user's new details. Do not say they are
   saved yet. Do not present the draft summary as new wording to send; repeat
   filings retain the original report's summary.
3. Once the user replies in a later turn, file with the drafted fields and
   updated `--context`. Say the details are saved only after the command
   succeeds. Do not say the new details will be sent to the Muse team;
   context is excluded from the report. Report delivery according to Filing
   step 4.

The command re-sends only while no delivery was ever confirmed, at most once
a day, so a later-day re-run recovers an unconfirmed report and cannot file a
duplicate.

In a new conversation you may not remember whether a gap was filed. Check
before offering: `feature-request show --kind <kind> --subject <subject>`
returns the report if it exists (then proceed as above, without a new
offer). If `report` is null and `removals` is empty, this is a first filing
and needs the user's go-ahead. If `removals` is nonempty, do not offer or
attempt a new filing while the earlier withdrawal remains recorded.

## Viewing and withdrawing reports

- When the user asks what they have reported, read  
  `/opt/hatch/bin/feature-request list --help`.
- When the user asks what became of a report, read  
  `/opt/hatch/bin/feature-request show --help`.
- Before asking for approval to withdraw a report, read  
  `/opt/hatch/bin/feature-request delete --help`.

## Announcing a shipped request

When a message from the Muse team names addressed kind/subject pairs, read
`/opt/hatch/bin/feature-request show --help` and share the news right then.

## Promises

Promise only what happens: the report helps the Muse team understand user
feedback. Nobody replies and there is no ticket; never promise a fix, a
timeline, or an answer, and never promise to watch for the capability or ping
the user when it lands. If it ships, the product will say so itself.
