---
name: setup-cowork
description: Guided Cowork setup — install a matching plugin, try a skill, connect tools. Use when: set up cowork, setup cowork, get started with cowork, cowork onboarding, configure cowork, personalize cowork.
---

# Setup Cowork

Help the user get Cowork configured for their work. Six steps — role, plugins, connectors, try a skill, writing voice, wrap.

## Step 0 — Checklist

Before your first user-facing message, create a TODO list with these items so the user can see progress:

1. Figure out role
2. Suggest plugins
3. Suggest connectors
4. Try a skill
5. Set up writing voice
6. Wrap up

Mark each one complete as you finish it. Keep it to these six — don't add sub-items.

## Step 1 — Role

Your initial message should frame what Cowork is: it autonomously handles tasks like reading your email, searching your docs, drafting reports, etc. Educate the user on _Skills_, reusable workflows you run with `/name`; _Connectors_, which wire in your tools; _Plugins_, which bundle skills and connectors for a domain. Two or three sentences. Hit the beats: multi-step and autonomous, uses your real tools, skills/plugins/connectors defined.

Next, ask the user for their role. Something like: "Let's get you set up — takes a few minutes. What kind of work do you do?" Then call the ShowOnboardingRolePicker tool, which renders a clickable role-picker chip row: do not list the roles yourself. The tool result is their answer — {"role": ...} is their role for the rest of setup; {"dismissed": true} or {} means they didn't pick one.

If the ShowOnboardingRolePicker tool is not available in this session, ask in plain text instead and offer these options as a short list they can reply to (they can also answer in their own words):

- Product management
- Engineering
- Human resources
- Finance
- Marketing
- Sales
- Operations
- Data science
- Design
- Scientist
- Legal
- Student
- Founder
- Healthcare

In the plain-text case, end your turn after asking. Their reply — one of the options or a free-form answer — is their role for the rest of setup.

## Step 2 — Suggest plugins

The role picker tool result will contain their selection. If it was dismissed or came back empty — or they skipped the plain-text question — they didn't pick a role: just suggest the productivity plugin and move on.

**Always** check for already-installed plugins before doing anything else — this is not optional. Call ListPlugins **without any intro text** — do not write "Looks like you already have…" before you know the result. The tool renders the installed plugins as a widget on its own; let it speak for itself. After it returns, react to what actually came back: if plugins appeared, acknowledge them below the widget ("Those are already on your account — here's what else fits your role."); if it's empty, just say "No plugins yet — let's fix that." Never write text that presumes a non-empty result before the tool runs. Do not pass installed plugins to SuggestPluginInstall afterward or you'll show them twice. Admin-provisioned plugins will appear in this list automatically; never skip the call. Then, regardless of what's installed, still recommend new role-matched plugins below in a separate widget.

Search the plugin marketplace for their role with SearchPlugins. **Exclude anything already installed** — the installed-plugins widget above already covers those, so the recommendations widget must only contain plugins the user does not yet have. Never show the same plugin in both widgets. **Organization plugins always come first.** If the user's org has published its own plugins, those are the recommendation — they're built for this company's actual tools, data, and workflows, and someone internal decided they matter. An org-built plugin that's even loosely relevant to the role outranks any generic marketplace plugin, full stop. Lead with org plugins, and only reach for generic ones to fill empty slots when the org catalog has nothing close. Never bury an org plugin under a generic one.

Pick the top 2-3 matches and pass them as an array to SuggestPluginInstall so the user gets a browsable list. If only one is a strong fit, passing one is fine. If the search comes up empty, fall back to the productivity plugin. If every good match is already installed, skip the recommendations widget entirely and just say "You've already got the best plugin for [role] — let's move on to connectors."

Above the widget, introduce it in one line: "Here are plugins built for [role] work — each one adds a set of skills you can run with `/`." The card shows Add or Manage depending on whether each plugin is already installed — don't describe the button. Below the widget, reinforce what they're for and tie it to the next step: "Installing one drops its skills straight into your `/` menu so you can run them anytime. Once you've picked one, want me to pull up the connectors it uses so those skills have your real data behind them?" — phrased so it works whether they're installing fresh or already have it. End your turn.

## Step 3 — Connectors

If they say yes: tell them what you're about to do — "Let me check which connectors you've already got and what else your plugins could use."

Cover **every plugin in play** — everything already installed plus anything the user just added. Don't limit this to a single plugin; if the user has Sales and Productivity, pull connectors for both. Search SearchMcpRegistry per plugin domain, using the plugin's name and the user's role as queries, until every plugin in play has connector results — the results carry each connector's directoryUuid and whether it's already installed. Don't drop any relevant hit to prose; every connector those searches surface for their plugins should end up in the widget.

From those results: check which are already connected **before writing anything**. Only if at least one is connected, call ListConnectors with those names as keywords — and do not write "You're already connected to these:" above it; let the widget show it. If none are connected, skip ListConnectors entirely. Then call SuggestConnectors with **all** the still-unconnected UUIDs — the full set the searches surfaced, not just the top match. Any prose goes **after** the widgets, reacting to what actually rendered, never before.

Below the suggestions, explain what they're looking at before moving on: "Click any of these to connect it — once wired up, skills can pull your real data from it. Want me to list some skills you can try?" End your turn.

## Step 4 — Try a skill

If they say yes, call ListSkills with the plugin's name and their role as keywords so they get clickable skill cards; if the filter comes back empty, call it again with no keywords. Introduce the card in one line so it doesn't land cold: "Here's what [Plugin] adds — click any of these to run it now." End your turn. That card is keyword-filtered — when a later step needs to know everything on the user's account (Step 5 does), the answer comes from a keywordless ListSkills call or your system context's skills list, never from this filtered card.

When they click one (you'll see a `/name` message), help them with it. Keep it brief; you're still inside setup. When it finishes, bring it back: "Nice — that's how skills work."

If they wave it off at either point, that's fine — go to Step 5.

## Step 5 — Writing voice

Everything so far taught Cowork about the user's *tools*. This step teaches it about the *user*. This matters because so much of what Cowork produces is prose the user will send under their own name.

**First, settle which opener you're writing — the account's full skills list decides.** Check the skills in your system context, or call ListSkills with no keywords; the plugin-filtered card from Step 4 covered one plugin and can't answer this. If `my-writing-style` is there (the saved profile — not `setup-writing-style`, the flow that creates it) — or the user says they've already set one up — your whole message is one line ("You've already got a voice profile, so anything I draft for you will use it") and you go to Step 6. Only if it's absent do you offer setup. Re-running the flow on someone who's already done it wastes their time and risks overwriting a profile they've tuned. If they *want* to update or redo it, that counts as a yes — invoke the skill the same way.

If the user says they already have one, that settles it — a recently saved profile may not show in your skills list yet, so their word beats the list. Never tell a user they don't have a profile on the strength of a widget result; the widgets in this flow are plugin-filtered, and silence from one means nothing. Skipping a redundant offer costs a sentence; overwriting a tuned profile costs the user their work.

If `setup-writing-style` itself isn't available in this session, skip the offer entirely: mark this TODO done and go to Step 6 — the wrap's closing clause covers it.

Otherwise, offer it. Make the case in two or three sentences of prose — these are the beats to hit, not a list to reproduce — then ask. Don't just launch into it:

- **What it does:** reads writing they've already sent, learns how they write, and saves it so future drafts sound like them instead of like Claude.
- **What it costs:** about two minutes.
- **What it protects:** only writing they authored, and nothing saves without their review. (One clause — the skill itself walks through consent in detail once they say yes.)

Phrase the ask so passing is obviously fine — "Want to do that now, or skip it?" A user who feels cornered into a two-minute detour at the end of setup will just abandon the whole thing.

**If they say yes:** invoke the `setup-writing-style` skill (via the Skill tool — don't improvise its flow from memory) and let it run end to end. Don't paraphrase its steps, re-explain consent, or interleave your own commentary — it opens with its own framing, and a second voice narrating over it is confusing. Cowork setup is paused, not over. The voice flow counts as finished when one of three things happens: the save tool reports success; the user confirms the profile is saved (when saving happens via a Save skill button, you can't see the click and the new skill won't appear in your skills list until their next session — the flow already has you ask them to click it, so their answer is your signal; don't ask twice); or they ask to skip or move on to something else. Only then mark this TODO done and move to Step 6 — invoking the skill starts this step; it doesn't complete it.

**If they say no or defer:** mark the TODO done and tell them they can always create their voice profile later by simply asking — e.g. "No problem. Whenever you want drafts to sound like you, just ask me to learn your writing voice." Then Step 6. Don't sell it twice.

## Step 6 — Wrap

Close short: "You're set. Start a new task from the sidebar anytime, or type `/` to see your skills."

If they don't have a voice profile by the wrap, add one clause and no more: "…and whenever you want drafts to sound like you, just ask me to learn your writing voice."

## Ground rules

- One step at a time.
- Skips are fine. If they pass on a step, mark its TODO done and move on.
- Keep each message short. Two or three sentences plus the widget, not a wall.
- Never write text that presumes a tool result before the tool runs. Don't say "you already have…" or "you're connected to…" above a widget — call the tool first, then react to what came back below it. The widget shows the data; your sentence reacts to it.
- The user trying a skill mid-flow is expected. Help with it, then return to where you left off. Don't let a skill invocation end the setup. This applies to Step 5 too: `setup-writing-style` is a long flow, and when it ends — however it ends — the user still needs the Step 6 wrap.
- If a tool named above isn't available in this session, skip that step's card and keep going in plain text.
