---
name: skill-creator
description: Create new skills, edit existing skills, and iterate wording. Use when writing SKILL.md from scratch, improving existing skills, turning repeated workflows into reusable skills, or refining skill descriptions to improve trigger reliability.
---

# Skill Creator

A skill for authoring and iteratively improving local ZCode skills.

At a high level, the loop is:

- Figure out what the skill should do and roughly how it should do it
- Write a draft of the skill
- Try the skill on 2–3 realistic test prompts
- Read the outputs with the user and revise
- Repeat until the skill is good enough

Your job when this skill is loaded is to figure out where the user is in this loop and help them progress. They might say "I want a skill for X" (start at the top), or they might already have a draft (jump to evaluate/iterate). Be flexible — if the user says "just vibe with me, no formal evaluation," do that.

## Communicating with the user

People using this skill range from seasoned skill authors to first-timers. Pay attention to context cues. In doubt, briefly explain a term ("an *eval prompt* is just a test message you'd send the model to see how the skill behaves") rather than assuming familiarity.

---

## Creating a skill

### Capture intent

Start by understanding what the user wants. If the current conversation already shows a workflow worth capturing (e.g., the user has been doing the same thing manually a few times and says "turn this into a skill"), extract answers from the conversation history first — the tools they used, the order of steps, corrections they made, input/output formats. Confirm gaps with the user before drafting.

Useful questions:

1. What should this skill enable the model to do?
2. When should it trigger? What user phrasings or contexts?
3. What's the expected output format?
4. Are there example inputs/outputs to lock the behavior down?

### Where skills live

ZCode discovers skills in these directories (highest priority first):

- `<project>/.zcode/skills/<name>/SKILL.md`
- `<project>/.agents/skills/<name>/SKILL.md`
- `~/.zcode/skills/<name>/SKILL.md`
- `~/.agents/skills/<name>/SKILL.md`

**Default to creating new skills under `.agents/skills/`** — it's the standard, cross-tool location for new skills. Note that `.zcode/skills` still takes priority during discovery: if the same skill name exists in both, the `.zcode/skills` copy wins, so `.zcode/skills` is the place to *override* a skill. Pick the `<project>` path for skills that only make sense in this repo; pick the `~/` (user) path for personal skills you want everywhere.

### Write the SKILL.md

Every skill is a directory containing a `SKILL.md` with YAML frontmatter and markdown body:

```text
my-skill/
├── SKILL.md          (required)
└── (optional)
    ├── references/   (extra docs the model reads on demand)
    ├── scripts/      (helper scripts the model can invoke)
    └── assets/       (templates, fixtures, etc.)
```

Required frontmatter:

- `name` — the skill's identifier. Lowercase kebab-case, 1–64 chars. Must match the directory name.
- `description` — when this skill should trigger and what it does. This is the primary triggering signal — both *what* the skill does and *in what contexts* belong here, not in the body. Models tend to *under*-trigger skills, so write descriptions a little bit pushy: instead of "How to build a dashboard for internal data," write "How to build a fast dashboard for internal data. Use whenever the user mentions dashboards, data visualization, internal metrics, or wants to display any company data — even if they don't explicitly say 'dashboard'."

Optional (reserved) frontmatter fields are listed in the ZCode skill spec; for most skills you only need `name` and `description`.

### Progressive disclosure

ZCode loads skills in three layers:

1. **Metadata** (name + description) is always in context. Keep it short.
2. **SKILL.md body** is loaded only when the skill triggers. Target under 500 lines.
3. **Bundled files** (under `references/`, `scripts/`, `assets/`) are read on demand. Unlimited size in principle.

If the body is getting long, split domain-specific detail into reference files and have the SKILL.md tell the model when to read them. For example:

```text
cloud-deploy/
├── SKILL.md            (workflow + selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

The SKILL.md then says "if the target is AWS, read references/aws.md before proceeding."

### Writing style

Prefer the imperative form ("Read the file before editing"). Explain *why* something matters when the rule isn't obvious — modern models follow guidance better when they understand the reason. If you find yourself writing all-caps MUSTs and NEVERs, that's usually a sign the rule needs better explanation rather than louder enforcement.

Examples beat rules. If the skill produces structured output, include a literal example of the format. If a specific tool should be used, show the call.

### Test prompts

After writing the draft, come up with 2–3 realistic test prompts — the kind of thing a user would actually type, with concrete file paths, column names, casual phrasing, even typos. Share them with the user: "Here are a few cases I want to try. Anything to add or change?"

Then run them: load the draft skill, hand the model the test prompt, and inspect what happens. ZCode does not currently spawn parallel evaluation subagents, so do this one prompt at a time and look at each result with the user.

---

## Reviewing the draft

For each test prompt:

1. Make sure the draft skill is on disk where ZCode can discover it (one of the directories listed above).
2. In a fresh ZCode turn, give the test prompt to the model. Either let the description trigger the skill, or use `/skill <name> <prompt>` to force-load it.
3. Look at the result *with the user*. Did the skill trigger? Did the output match what they wanted? Where did it go off the rails?

Note both the *result* and the *trace*: if the skill caused the model to do a bunch of busywork (re-reading the same files, writing a throwaway script, going in circles), the skill is probably over-prescribing or unclear. That's a signal to cut, not to add more rules.

---

## Improving the skill

This is the heart of the loop. You ran the test prompts, the user reviewed the outputs, now make the skill better.

How to think about improvements:

1. **Generalize from feedback.** You and the user are iterating on a handful of examples for speed, but the skill needs to work for inputs neither of you has seen. If a stubborn issue resists targeted edits, try a different framing or metaphor instead of layering more constraints. Fiddly overfit rules and oppressive MUSTs make the skill worse over time.

2. **Keep the prompt lean.** Remove things that aren't pulling their weight. If the model is wasting tokens on busywork the skill encouraged, delete the offending guidance and see what happens.

3. **Explain the why.** Today's models reason well when given context. Even if the user's feedback is terse or frustrated, work out what they actually want and transmit that understanding into the instructions. Reframing usually beats more enforcement.

4. **Look for repeated work.** If every test run independently wrote the same helper script or took the same multi-step approach, bundle the script under `scripts/` and have the skill point at it. Write it once instead of having the model reinvent it every time.

Then loop:

1. Apply the improvements.
2. Rerun the test prompts.
3. Show the user the new outputs.
4. Keep going until they're happy or further changes stop helping.

---

## Updating an existing skill

If the user wants to update an existing installed skill rather than create one:

- Preserve the original `name` and directory name. If the installed skill is `research-helper`, the updated version is still `research-helper`, not `research-helper-v2`.
- If the installed skill path is read-only (e.g., shipped under an official plugin cache), copy the skill to a writable user location like `~/.agents/skills/<name>/`, edit there, and let user-priority discovery override the original.
- Same-name skills from different paths are kept as separate installed skills; path is the installation identity.

---

## The core loop, one more time

- Figure out what the skill is about.
- Draft it.
- Try 2–3 realistic test prompts.
- Read the results with the user.
- Improve.
- Repeat until the user is happy or improvements stop landing.

Good luck.
