# Campaign setup the advertiser completes in Ads Manager

Read this when a write to the account was rejected as not available for this ad
account — whether a tool returned it (`writes.md`) or the advertiser quotes it
from an earlier attempt — or when the advertiser asks to set a campaign up
themselves in Ads Manager. It replaces creation, not planning: the plan is
still yours to get right, and they do the clicking.

## Explaining the rejection

It means making changes to that account from here was not available when it
was returned. The cause is not visible from here, so do not guess one:
business verification, payment methods, admin roles and reconnecting do not
change it, and there is no onboarding checklist or step they can complete,
whatever an older error message says. Do not search for one. A missing payment
method still stops delivery once they publish, so name it as that, never as
the cause. Say it once, then move straight to what you can do: plan the
campaign in full. Never offer to hold the plan until access returns.

## Plan in full, create nothing

Which way you arrived decides what happens next:

- **After a tool returned the account-level rejection for this account in this
  conversation**, that account is plan-only for the rest of the conversation.
  Send it no write of any kind again, and ask for no creation approval —
  nothing here can be approved into existence.
- **When the advertiser quotes the rejection from an earlier attempt**, it is
  not proof about this account now: eligibility can change, and it may have
  been another account. Plan in full and offer both the setup guide and
  creating it here. If they choose creation, follow `campaign-execution.md`;
  the first write either succeeds or returns the rejection, which then applies
  the lock above.
- **When the advertiser only chose to build it themselves**, the account can
  still be written. Make no write for this campaign unless they ask, and if
  they change their mind, go back to `campaign-execution.md`. Every other write
  they ask for follows `writes.md` as usual.

Either way, every read still works, so planning keeps its full weight: run
`campaign-creation.md` and the stage references it routes to exactly as for a
created campaign — identity, research, objective, `campaign-targeting.md`,
`campaign-budget.md`, `campaign-creative.md` — and stop where
`campaign-execution.md` would begin. Never run `render-campaign-success` or
describe anything as created, staged or paused; nothing exists until they
publish it.

If the rejection arrived at final creation, the reviewed plan is already
complete. Turn it into the setup guide in the same response; do not replan it.

## Creative they can upload

Write the finished copy — primary text, headline, description, call to action —
per ad. An image generated under `campaign-creative.md` is an asset they upload
themselves, so say which ad it belongs to. Existing Page posts or account media
are referenced by name and where they will find them, never by id.

## The setup guide

One section per level, in the order Ads Manager builds a campaign: **Campaign**,
then each **Ad set**, then each **Ad**. Under each, list only the settings the
plan decided, as the advertiser will see them, with the value to choose:

- Campaign: objective, name, Special Ad Category when one applies, and whether
  the budget sits on the campaign.
- Ad set: conversion location and performance goal, budget and schedule,
  locations, age, and the resolved interests and languages by name, placements.
- Ad: Facebook Page and Instagram account, format, media, copy, destination URL,
  and the dataset or pixel if the plan tracks conversions.

Use the labels from `response-style.md` — `Sales`, `Highest volume` — never API
values or ids. Do not describe screens, menus or button positions you have not
verified; the setting name and its value are what they need. Say that spend
starts when they publish, and that choosing Advantage+ defaults Ads Manager
offers can change what the plan chose.

Finish with one `muse.create_options` menu of what you can still do: adjust the
plan, rework a creative, or check the campaign against the plan once they have
published it — that check is a read, and it works. Offer to create it for them
unless a tool rejected a write to this account in this conversation.
