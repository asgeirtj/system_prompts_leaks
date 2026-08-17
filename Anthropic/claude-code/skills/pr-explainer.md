---  
name: pr-explainer  
description: Generate a shareable walkthrough artifact for a pull request — what changed, why, and a reviewer-oriented before/after narrative.  
---

No PR number was given — explain the current branch's pending PR:
1. `git log --oneline @{upstream}..HEAD` for the commit list (fall back to `origin/main..HEAD` if no upstream)
2. `git diff @{upstream}...HEAD` for the unified diff

## Goal

Produce a **shareable PR walkthrough artifact** — a self-contained HTML page a  
reviewer can read before opening the diff to understand what this change does,  
why it's being made, and where to focus attention. Pitch the writing at a  
reviewer seeing this PR for the first time.

Wherever the answers end up in the sections below, the page must answer all  
five of these questions:

1. What is the problem this PR is trying to solve?
2. Why is it a problem?
3. How are we solving it?
4. What alternatives did we consider?
5. Why is the current approach better than the alternatives?

If the diff, PR body, and commit messages give no evidence for one of these —  
most often 4 and 5 — say that plainly (e.g. "the PR doesn't record what  
alternatives were considered") instead of inventing an answer.

## Build it from the explainer template

Load the `artifact-explainer` skill and build the page from its template,  
publishing with the Artifact tool as that skill directs. Use the  
template's **sections flavor** — keep the sections structure, delete the  
numbered steps. Fill the slots as follows:

- **Lede** — what this PR changes and why it's needed, in two or three  
  sentences. If the PR body already says this well, reuse it.
- **Sections** — lead with one architecture or flow diagram when the change  
  has a structural story; otherwise skip straight to the code. Open with a  
  before/after section showing the user-observable change (behavior, API  
  shape, or output); skip it if the change has no observable surface. Then  
  group the diff into sections cut at the material's joints — group related  
  changes rather than splitting per file. In each section the code snippet is  
  usually the subject matter itself: a trimmed snippet, a plain-language  
  explanation, and anything a reviewer should look closely at; add a diagram  
  only where structure or flow genuinely needs one (the skill's diagram-first  
  default applies to concept explainers, not PR walkthroughs, which are  
  mostly symbolic content). End with a section for what's *not* obvious from  
  the diff — context the diff alone doesn't show (why this approach over an  
  alternative, what was tried and rejected, follow-ups intentionally left  
  out).
- **Recap** — restate the takeaways as where a reviewer should focus

  attention.

End the page body with this line verbatim:

> Paste this URL back into Claude Code to keep iterating on these findings.

## Keep it honest

Describe what the diff *actually does* — trace it, don't infer from names. If  
something in the PR is unclear to you, say so in section 4 rather than  
guessing.
