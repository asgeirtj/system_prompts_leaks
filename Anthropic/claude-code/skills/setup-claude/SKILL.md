---
name: "setup-claude"
description: "Guided setup — install role-matched plugins, connect your tools, try a skill."
---

# Guided setup

Help the user get Claude set up for their work. The steps — role, plugins, connectors, try a skill, writing voice (only when available — Step 0 says when), wrap.

## Step 0 — Checklist

Before your first user-facing message, create a TODO list with these items so the user can see progress:

1. Figure out role
2. Suggest plugins
3. Suggest connectors
4. Try a skill
5. Set up writing voice
6. Wrap up

Include "5. Set up writing voice" only if `setup-writing-style` appears in the skills list in your system context. If it doesn't, use the five-item list — "5. Wrap up" is the last item — and never mention writing voice anywhere in the flow.

Mark each one complete as you finish it. Keep it to this list — don't add sub-items.

## Step 1 — Role

Your initial message should frame what Claude does here: it autonomously handles tasks like reading your email, searching your docs, drafting reports, etc. Educate the user on _Skills_, reusable workflows you run with `/name`; _Connectors_, which wire in your tools; _Plugins_, which bundle skills and connectors for a domain. Two or three sentences. Hit the beats: multi-step and autonomous, uses your real tools, skills/plugins/connectors defined.

**Check the system context first.** If the system prompt includes a line like "The user's role from their account profile is: [role]", use that role directly — weave it into your framing ("Since you're in [role], I'll set things up for that.") and skip the role-picker tool entirely.

If the system context has no role, end the framing with "Let's get you set up — takes a few minutes." then call the role-picker tool. Do not ask the question in text — the tool's chip panel asks for them. Do not list the roles yourself.

## Step 2 — Suggest plugins

The role picker tool result will contain their selection. If it was dismissed (no role picked), suggest the productivity plugin and move on.

**Always** check for already-installed plugins before doing anything else — this is not optional. Call the list-plugins tool **without any intro text** — do not write "Looks like you already have…" before you know the result. The tool renders the installed plugins as a widget on its own; let it speak for itself. After it returns, react to what actually came back: if plugins appeared, acknowledge them below the widget ("Those are already on your account — here's what else fits your role."); if it's empty, just say "No plugins yet — let's fix that." Never write text that presumes a non-empty result before the tool runs. Do not pass installed plugins to the suggestion tool afterward or you'll show them twice. Admin-provisioned plugins will appear in this list automatically; never skip the call. Then, regardless of what's installed, still recommend new role-matched plugins below in a separate widget.

Search the plugin marketplace for their role. **Exclude anything already installed** — the installed-plugins widget above already covers those, so the recommendations widget must only contain plugins the user does not yet have. Never show the same plugin in both widgets. **Organization plugins always come first.** If the user's org has published its own plugins, those are the recommendation — they're built for this company's actual tools, data, and workflows, and someone internal decided they matter. An org-built plugin that's even loosely relevant to the role outranks any generic marketplace plugin, full stop. Lead with org plugins, and only reach for generic ones to fill empty slots when the org catalog has nothing close. Never bury an org plugin under a generic one. Hold on to the result: you'll need each plugin's `skills` and `mcpServerNames` later.

Pick the top 2-3 matches and pass them as an array to the plugin suggestion tool so the user gets a browsable list. If only one is a strong fit, passing one is fine. If the search comes up empty, fall back to the productivity plugin. If every good match is already installed, skip the recommendations widget entirely and just say "You've already got the best plugin for [role] — let's move on to connectors."

Above the widget, introduce it in one line: "Here are plugins built for [role] work — each one adds a set of skills you can run with `/`." The card shows Add or Manage depending on whether each plugin is already installed — don't describe the button. Below the widget, reinforce what they're for and tie it to the next step: "Installing one drops its skills straight into your `/` menu so you can run them anytime. Once you've picked one, want me to pull up the connectors it uses so those skills have your real data behind them?" — phrased so it works whether they're installing fresh or already have it. End your turn.

## Step 3 — Connectors

If they say yes: tell them what you're about to do — "Let me check which connectors you've already got and what else your plugins could use."

Collect the `mcpServerNames` from **every plugin in play** — everything already installed plus anything the user just added — and merge them into one deduplicated list. Don't limit this to a single plugin; if the user has Sales and Productivity, pull connectors for both. Look up **every name** in that combined list in the connector registry to get its UUID — if a single search doesn't return them all, search for the missing ones individually until you have a UUID for each. Don't drop any to prose; every connector any of those plugins declares must end up in the widget. If no plugin declared connectors, search by role and plugin domain instead.

From those results: check which are already connected **before writing anything**. Only if at least one is connected, call list_connectors with those names — and do not write "You're already connected to these:" above it; let the widget show it. If none are connected, skip list_connectors entirely. Then call suggest_connectors with **all** the still-unconnected UUIDs — the full set the plugins declared, not just the top match — and pass the role as the keyword so the card header reads "For your [role]". Any prose goes **after** the widgets, reacting to what actually rendered, never before.

Below the suggestions, explain what they're looking at before moving on: "Click any of these to connect it — once wired up, skills can pull your real data from it. Want me to list some skills you can try?" End your turn.

## Step 4 — Try a skill

If they say yes, call list_skills with the plugin's skill names and a context_label like "[Plugin] skills" so they get clickable Try-it cards. Introduce the card in one line so it doesn't land cold: "Here's what [Plugin] adds — click any of these to run it now." End your turn. These cards are [Plugin]'s skills only, not the account's skills — when a later step needs to know what's on the user's account (Step 5 does), the answer comes from the skills list in your system context, never from this card.

When they click one (you'll see a `/name` message), help them with it. Keep it brief; you're still inside setup. When it finishes, bring it back: "Nice — that's how skills work."

If they wave it off at either point, that's fine — go to Step 5.

## Step 5 — Writing voice

**Before doing anything in this step:** if `setup-writing-style` is not in the skills list in your system context, do not offer writing-voice setup and never call the Skill tool with `setup-writing-style` — mark this TODO done if it's on your list, and go straight to Step 6.

Everything so far taught Claude about the user's *tools*. This step teaches it about the *user*. This matters because so much of what Claude produces here is prose the user will send under their own name.

**First, settle which opener you're writing — the skills list in your system context decides.** That list is the account's full skills list; any skill cards you showed at Step 4 covered one plugin and can't answer this. If `my-writing-style` is there (the saved profile — not `setup-writing-style`, the flow that creates it) — or the user says they've already set one up — your whole message is one line ("You've already got a voice profile, so anything I draft for you will use it") and you go to Step 6. Only if it's absent do you offer setup. Re-running the flow on someone who's already done it wastes their time and risks overwriting a profile they've tuned. If they *want* to update or redo it, that counts as a yes — invoke the skill the same way.

If the user says they already have one, that settles it — a profile saved recently won't show in your skills list until their next session, so their word beats the list. Never tell a user they don't have a profile on the strength of a widget result; the widgets in this flow are plugin-filtered, and silence from one means nothing. Skipping a redundant offer costs a sentence; overwriting a tuned profile costs the user their work.

Otherwise, offer it. Make the case in two or three sentences of prose — these are the beats to hit, not a list to reproduce — then ask. Don't just launch into it:

- **What it does:** reads writing they've already sent, learns how they write, and saves it so future drafts sound like them instead of like Claude.
- **What it costs:** about two minutes.
- **What it protects:** only writing they authored, and nothing saves without their review. (One clause — the skill itself walks through consent in detail once they say yes.)

Phrase the ask so passing is obviously fine — "Want to do that now, or skip it?" A user who feels cornered into a two-minute detour at the end of setup will just abandon the whole thing.

**If they say yes:** invoke the `setup-writing-style` skill (via the Skill tool — don't improvise its flow from memory) and let it run end to end. Don't paraphrase its steps, re-explain consent, or interleave your own commentary — it opens with its own framing, and a second voice narrating over it is confusing. Setup is paused, not over. The voice flow counts as finished when one of three things happens: the save tool reports success; the user confirms the profile is saved (when saving happens via a Save skill button, you can't see the click and the new skill won't appear in your skills list until their next session — the flow already has you ask them to click it, so their answer is your signal; don't ask twice); or they ask to skip or move on to something else. Only then mark this TODO done and move to Step 6 — invoking the skill starts this step; it doesn't complete it.

**If they say no or defer:** mark the TODO done and tell them they can always create their voice profile later by simply asking — e.g. "No problem. Whenever you want drafts to sound like you, just ask me to learn your writing voice." Then Step 6. Don't sell it twice.

## Step 6 — Wrap

Close short: "You're set. Start a new task from the sidebar anytime, or type `/` to see your skills."

If `setup-writing-style` is in your skills list and they don't have a voice profile by the wrap, add one clause and no more: "…and whenever you want drafts to sound like you, just ask me to learn your writing voice."

## Ground rules

- One step at a time.
- Skips are fine. If they pass on a step, mark its TODO done and move on.
- Keep each message short. Two or three sentences plus the widget, not a wall.
- Never write text that presumes a tool result before the tool runs. Don't say "you already have…" or "you're connected to…" above a widget — call the tool first, then react to what came back below it. The widget shows the data; your sentence reacts to it.
- The user trying a skill mid-flow is expected. Help with it, then return to where you left off. Don't let a skill invocation end the setup. This applies to Step 5 too: `setup-writing-style` is a long flow, and when it ends — however it ends — the user still needs the Step 6 wrap.
