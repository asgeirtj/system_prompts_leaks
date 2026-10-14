---
name: greenfield-project-scaffolding
description: Use only when all three gates already hold. (1) This same user turn explicitly says to start, implement, build, scaffold, or go ahead with a new project now; prior answers, planning, decisions, and reminders never authorize. (2) No named path or confirmed suitable here/current-folder target resolves placement. (3) Inspection is forbidden, or permitted top-level inspection has already proved the current root home-like, general-purpose, or falsely empty. Do not load this skill merely to check eligibility. Exclude existing work, bug fixes, component edits, server or verification work, and standalone, paste-ready, single-file, or snippet delivery.
user-invocable: false
---

# Greenfield Project Scaffolding

Choose the project root and its normal layout before the first write.

1. Confirm current-turn authorization and a complete enough request.
   Authorization is satisfied only when the current user turn itself explicitly asks
   to start, implement, build, scaffold, or go ahead with a new project now. Answers
   to prior questions, planning or decision turns, and reminders that work remains do
   not authorize this workflow without those implementation-now words in the same
   user turn. If
   authorization is absent, stop without project-shape work or a file write. If product
   behavior or delivery constraints are missing, visibly truncated, or materially
   ambiguous, ask one focused clarification question and stop until the answer resolves
   the gap. Do not invoke this workflow merely because the deliverable is an application
   or game.
2. Resolve explicit placement before treating it as unknown. `here`, `this folder`,
   `the current folder`, `this directory`, and `the current directory` count as targets
   only when permitted facts confirm that the current directory is a suitable intended
   project root. A home-like, general-purpose, or false-empty current directory is not
   made suitable by deictic wording. Preserve an explicit named path and an existing
   project root. Existing repositories, projects, or notebooks remain excluded.
3. Honor inspection limits. When the user forbids inspecting existing files, honor that restriction.
   Use only the request, `pwd`, and path semantics. Do not list or read nearby content.
   When an explicit no-peek constraint leaves placement unresolved, create a
   user-meaningful dedicated subdirectory from the request and path semantics. Skip all
   discovery steps below.
4. Otherwise reuse the permitted inspection that triggered this workflow. Use the
   request, `pwd`, and observed top-level entries and project markers. Do not repeat
   an already completed read solely for this workflow. Inspect only placement facts
   that remain missing and are allowed by the user. Determine whether the user named
   a target and whether the current directory is already the intended project root.
   Do not adopt an unrelated nearby repository merely because it exists.
5. Reject a risky root before project work. When permitted inspection proves that the
   current directory is home-like, general-purpose, or contradicts an empty/current-root
   premise, treat it as requiring a dedicated child. Treat a home-like, general-purpose,
   or false-empty current root as closed to project artifacts. The first project mutation
   must establish the dedicated child. Keep every scaffold path and scaffold command
   working directory beneath the chosen root.

   If this skill is loaded late after current-task project artifacts already exist at
   the rejected root, stop further project mutation; relocate only those current-task
   artifacts into the dedicated child before any other project mutation. Relocate rather
   than duplicate them. Do not copy, synchronize, or mirror them back to the rejected
   root. Continue exclusively in the dedicated child. Do not inspect, move, or delete
   unrelated content while repairing the task's paths.

   Choose exactly one root:
   - Preserve an explicit named path or existing project root.
   - Use the current directory when permitted facts confirm it is suitable and the
     request makes it already the intended project root.
   - When the current directory is a home-like or general-purpose directory, or
     conflicts with the request's premise, and no target was named, create one
     user-meaningful dedicated subdirectory derived from the requested product.
   Do not add another wrapper directory inside the chosen root.
6. Use the ecosystem-native layout inside that root. Keep entry points, package files,
   source, tests, and assets where that ecosystem normally puts them. Create a
   directory only when the ecosystem convention or concrete near-term contents need
   it; do not create a directory that would contain only one file as decoration.
   Avoid placeholder files and speculative layers. For a playable browser app or game
   using no-build vanilla HTML/JavaScript that was not explicitly requested as
   standalone or single-file, keep the entry HTML in the dedicated project root and
   put substantial behavior in at least one separate authored `.js` or `.mjs` source file.
   For a framework or typed stack, use the normal source modules for that stack; do not
   force a root HTML file or a token JavaScript file. When the request explicitly chooses
   a standalone, single-file, paste-ready, or offline artifact shape, preserve it and
   defer artifact and verification mechanics to `bundled:browser-app-delivery`.
7. Scaffold the smallest complete runnable shape the request needs, then use the
   applicable delivery or verification workflow. Report the chosen root clearly.
8. Before handoff, audit known paths and paths created or changed for this task.
   Keep its scaffold artifacts under exactly one chosen project root. Relocate or
   remove only current-task artifacts outside it; do not inspect, move, or delete
   unrelated content.

Do not invoke this workflow for existing repositories, projects, or notebooks, bug fixes,
repository maintenance, component-only edits. Preserve an explicit standalone,
single-file, snippet, or paste delivery request without turning it into a project.
