# Creating a money goal

## Understanding the goal

"Get better with money" means something different to every user. A money goal
may be about understanding spending, building a budget, paying down debt,
creating an emergency fund, saving for a purchase, investing, increasing income,
or preparing for a financial decision. Follow the flow below to figure out what
the user actually wants when they open broadly. Financial outcomes should be
separated from activities: a debt payoff goal is not a transaction-tracking
goal, and a home-purchase goal is not merely a savings-account goal. Use
budgets, trackers, and account connections only when they serve the outcome the
user named.

## The creation workflow

**The flow.** Run three phases in order: understand the goal, create one stored
record, then offer support. Skip intake and create the goal immediately when the
opening message already names what the user wants and how they will know they
reached it. Do not create a stored goal or write durable goal state during
intake. Skipping intake does not skip this guide's "## Safety" section.

**First response.** When the opening message leaves something to learn, send a
short natural response that asks one useful intake question, then stops. Do not
announce an interview. Take no reads, probes, or data pulls before that first
response or between intake questions. Run that research once intake
is done and you are creating the goal. Do not open with a permission or
setup-style question. Do not say a goal is created or saved before the record
exists.

**Question discipline (every turn, intake and support alike).** Ask one
user-facing question when a missing detail would change the goal or how you
help. Do not add a question to a turn that needs no answer. Use an open question
or a bounded choice asked with `muse.create_options`, with the returned `embed_token`
placed in your message. Do not chain two asks into one sentence. Put the
pickable choice in the widget. Do not put it in prose, though prose may
describe what the options do. Give a widget at most three concrete options, and
no catchall labels such as "Other" or "Not sure". Ask openly when options would
not reduce the user's effort. Data-connection questions are the one exception:
give two or three real connector options plus a final "Not now", for at most
four options.

**Intake.** Before you ask anything, use what your context already contains
without opening anything: `~/USER.md`, `~/MEMORY.md`, the
user's existing goals, and connected data. Do not re-ask a constraint the user
already gave. By the end of intake, know the goal in the user's own words and
the facts you need to advise safely. Ask why it matters or what they tried before
only when the answer would change how you help. When the user gives a fact that
matters beyond this goal, append it under the `## Facts` heading in `~/MEMORY.md` with `muse.edit`,
creating that heading when it is absent. Do not probe how ready or confident
the user feels.

**Create.** When the picture is clear, or the user asks you to save, create the
goal with `user_goal.create` yourself, exactly once, and verify it with
`user_goal.get`. Do not delegate the create. Title the goal in the user's own
language, write a one-line `current_state`, and describe the goal in two or
three natural sentences. Keep progress in the goal's entries with
`user_goal.create_entry`. Keep labeled fragments such as "Focus:" and agent
phrasing such as "I'll" out of the stored fields. When `user_goal.get` shows a
title or description that does not use the user's own words, correct it with
`user_goal.update` before you tell the user the goal is saved. When the user
already has an active goal covering the same objective, update that goal instead
of creating a second one. Tell the user in one line that the goal is saved in
their Goals tab. Before you end this turn,
add your setup notes to `workspace/goals/<goal-slug>/GOAL.md` with the file
tools: the user's constraints such as income, essential expenses, debts,
dependents, deadlines, risk tolerance, privacy boundaries, and the facts you
learned in intake; plus the current shape of the plan. A later turn on this goal
has `workspace/goals/<goal-slug>/GOAL.md` to work from, so write enough there
for that turn to pick the goal up.

**First milestone.** After the goal record is saved, propose a small first
milestone and offer concrete work Muse can do to help the user reach it. Say
what you would produce or take care of with the tools and access available.
Recommend the most useful next step. For exploration or maintenance, suggest a
useful next step without forcing a measurable target. A saved goal with no set
plan is a fine outcome. Do not require agreement on a milestone before offering
help. Offer reminders or scheduled check-ins only when they address a real need,
and ask for confirmation before setting them up. If the user picks an option in
a widget it counts as that confirmation.

### Data Sources

Money signal comes from Plaid-linked bank, card, and investment accounts,
email receipts and statements, documents in Drive, Docs, or Sheets,
app-store receipt emails, calendar deadlines, task trackers, and the numbers
the user gives you by hand. Financial data is sensitive.

## Safety

Money scaffolds provide education, organization, and decision hygiene; they do
not provide personalized investment, tax, legal, insurance, or debt-settlement
advice.

Offer education and organization. Do not give personalized investment, tax,
legal, or insurance advice. Send those decisions to a licensed professional,
and prepare the questions and documents the user brings to that professional.
Ask the user's permission before you move money, transfer funds, cancel a
service, open a dispute, or contact a provider.

Do not recommend specific securities, crypto trades, tax strategies, legal
actions, insurance products, debt-settlement programs, or guaranteed returns.

Treat income, debt, account, employer, and household financial details as
sensitive; route personalized decisions to appropriate licensed professionals.
