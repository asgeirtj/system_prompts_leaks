---
name: run-skill-generator
description: Author or improve the run-<unit> skill — a per-project skill that tells agents how to build, launch, and drive this project's app. Use when the user asks to set up the project, get it running, write run instructions, or verify build/run steps work from a clean environment.
---

Your job is to produce a **skill** at `<unit>/.claude/skills/run-<unit-name>/`
that lets a future agent build, launch, and **drive** this project from
a clean machine.

The skill has two parts that live together:

```
<unit>/.claude/skills/run-<unit-name>/
  SKILL.md      ← agent-facing instructions — SHORT. Points at the driver.
  driver.mjs    ← (or driver.py, smoke.sh, … — or none: web apps use
                   chromium-cli off-the-shelf, and the heredoc in
                   SKILL.md is the script)
```

That almost always means **writing code**, not just prose. If the app
has any interactive surface (GUI, TUI, long-running server, REPL), the
future agent needs a programmatic way to poke it. A markdown file by
itself cannot click a button — but sometimes the button-clicker
already exists: for web apps it's `chromium-cli`, for servers it's
`curl`. You build (or script) that harness now, commit it alongside
the skill, and the `SKILL.md` documents how to use it.

## Definition of done

You are done when **all** of these are true:

1. **You launched the app in this container and interacted with it** —
   not its test suite, the actual running app. For anything with a GUI,
   that means you have a screenshot file on disk that you took.
2. **The interaction harness is committed** next to the skill. A driver
   script, a REPL wrapper, a smoke test, or the `chromium-cli` heredoc
   inline in `SKILL.md` — whatever you used to drive the app in step 1.
   (Graduated into `scripts/`/`e2e/`? — fine, point at it. Web app with
   `chromium-cli` off-the-shelf? — the inline script is the harness; no
   separate file.)
3. **The `SKILL.md` documents the harness** as the primary agent path —
   the section a future agent reads first is "run this driver / pipe
   these commands to `chromium-cli`," not "run `npm start` and a window
   opens."
4. **Every code block in `SKILL.md` is a command you ran that worked.**
   This session. This container. Not from the README, not inferred.

If you're about to write the skill and you don't have (1), **stop.** You
are about to paraphrase existing docs. That document already exists —
it's called the README, and the whole reason you're here is that it
wasn't enough.

## The deliverables are code AND docs

Typical output is a skill directory containing both:

```
<unit>/.claude/skills/run-<unit>/
  SKILL.md         ← SHORT. Points at the driver. Has the frontmatter
                     that lets Claude auto-load it when someone asks
                     to "run <unit>" or "screenshot <unit>".
  driver.mjs       ← (or driver.py, smoke.sh, … — or none: web apps
                     use chromium-cli off-the-shelf, and the heredoc
                     in SKILL.md is the script)
```

The driver lives **inside the skill directory** by default. They are a
pair — the skill's instructions and the code that implements them. A
driver that lives here is allowed to be a bit messier than production
code; it's agent tooling, not product surface.

**Graduation:** if the driver grows into something the project's own
test suite wants to reuse — shared launch helpers, a real e2e harness —
move it to `scripts/` or `e2e/` and update `SKILL.md` to reference the
new path. The skill stays; the driver finds a better home.

The exact shape depends on the project, but the principle is constant:
**the driver is the deliverable.** The `SKILL.md` is its man page. For
a web app, the driver already exists — `chromium-cli`
([examples/playwright.md](examples/playwright.md)) — and the skill is
the script that runs it. For a desktop app
([examples/electron.md](examples/electron.md)), the driver is a custom
REPL under tmux that exposes `launch`/`ss`/`click`/`eval`. For a server,
the driver is `curl`. Whatever shape it takes, without something that
reaches into the running app, the skill is a description of a window
nobody can touch.

## Where the skill goes

The skill lives at `<unit>/.claude/skills/run-<unit-name>/`, where
`<unit>` is the directory for **one deployable thing** — an app, a
service, a library.

Claude Code **natively discovers** skills from nested `.claude/skills/`
directories: an agent working anywhere inside `<unit>` will see
`/run-<unit-name>` as an available skill, and it auto-loads when the
request matches its description (e.g. "run the desktop app," "take a
screenshot of billing").

- **Single-project repo:** `.claude/skills/run-<repo-name>/` at repo root.
- **Large repo with many apps:** one per app, colocated —
  `apps/billing/.claude/skills/run-billing/`,
  `apps/desktop/.claude/skills/run-desktop/`.
- **App with multiple binaries:** still **one** skill at the app's
  root with a section per binary. They share setup. Start from the
  closest single-binary example and add a `## Run: <name>` section
  per binary.

If you're not sure where the unit boundary is, **ask the user.**

Slugify the directory name: lowercase, dashes for spaces, no slashes
(`run-billing-api`, not `run-billing/api`). The directory name and
the frontmatter `name:` should match — that's the slash command.

## Process

### 0. Find any existing skill about running this app

List the project's skills with their descriptions (same probe `/run`
uses — users name these variously, so match on description, not name):

```bash
d=$PWD; while :; do
  grep -Hm1 '^description:' "$d"/.claude/skills/*/SKILL.md 2>/dev/null
  [ -e "$d/.git" ] || [ "$d" = / ] && break
  d=$(dirname "$d")
done
```

If one is about launching/driving this app — whatever it's named —
**refine, don't rewrite**: verify its claims, fix what's wrong, add
what's missing, preserve what works. Re-run the driver if there is
one. Keep its existing name.

(Also check for a legacy `.claude/run.md` — earlier versions of this
tool produced those. If you find one, migrate it: the body becomes
the skill's `SKILL.md` content, any referenced scripts move into the
skill dir, and delete the old file.)

If none exists, decide where to create it (see above) and continue.

### 1. Discover — and treat every claim as disprovable

Figure out what you're authoring for:

- Manifest right here (`package.json`, `go.mod`, `pyproject.toml`…) and
  it's one self-contained thing → this is the unit.
- Looks like a mega-repo root (`apps/`, `packages/`, `services/`) →
  **ask which one.** List candidates, let them pick, `cd` there.
- Genuinely ambiguous → ask.

Survey the usual places: `README.md`, `package.json` scripts,
`Dockerfile`, `Makefile`, `.github/workflows/`, `CONTRIBUTING.md`. CI
configs are often more accurate than READMEs.

**Every claim in existing docs is a hypothesis.** Especially the
negative ones:

| When docs say… | What you do |
|---|---|
| "Requires macOS/Windows" | Launch it on Linux anyway. Apps rarely refuse to start — they crash on a missing `.so`, which `apt-get` fixes. Native modules for *your host's* keychain/notifications may no-op; the core usually runs. |
| "Requires a GPU" | Try software rendering. Electron/Chrome fall back with `--disable-gpu`. |
| "Requires a paid account / feature flag" | The gate is code you can read. Find it (env var? build define? SSR-embedded JSON?) and patch it for your local run. Document the patch. |
| "Run `npm start`" | That's the human path (spawns a window, waits forever). Find or build the *programmatic* path — `electron-forge start` to build then launch via Playwright, or equivalent. |

"Not supported on Linux" in a README written by a macOS developer
means "I never tried." You're about to try. **If you give up here, the
skill you write is the README with extra steps.**

### 2. Execute — and BUILD the harness you need

You're in a headless Linux container. The app is going to fight you.
That fight is the content of the skill.

Keep a running `NOTES.md` as you go. Every error → every fix → every
command that finally worked. This scratchpad becomes the
Troubleshooting section.

**Work up to a real interaction:**

- **Install + build.** When something's missing, note the exact
  `apt-get` / `npm install` that fixed it.
- **Launch the app.** Not the test suite — the app. A desktop GUI
  (Electron, native) needs `xvfb-run` and a handful of `lib*`
  packages; a web app driven by `chromium-cli` runs headless and
  needs neither. Launch timeouts and cryptic crashes are normal at
  this stage. Read the stack trace, install the missing thing, try
  again.
- **Build a harness to drive it.** You need a handle on the running
  app that lets you send input and observe output programmatically.
  The shape depends on the project (see table below).

  **Cover the layer(s) PRs actually touch.** A tmux driver that pokes
  the CLI's user surface is the right handle for UI changes — and the
  wrong one for a PR that touches one internal function. For the
  latter an agent wants `NODE_ENV=test bun run script.ts` (or
  equivalent): import the function, call it, observe. If most PRs
  here touch internals, that direct-invocation path is the driver's
  main entry point, and the tmux launch is secondary. Look at recent
  merged PRs: what layer do they touch? Cover that.

  For a **web** app, `chromium-cli` is the driver — you script it,
  you don't write it (see [examples/playwright.md](examples/playwright.md)).
  For a **desktop** GUI (Electron), write a REPL driver (stdin
  commands → click/type/screenshot), run it inside tmux, and use
  `send-keys` / `capture-pane`. You will iterate on that driver — it
  starts minimal (`launch`, `ss`, `quit`) and grows whatever commands
  you need to reach the interesting part of the app.
- **Do one real user flow end-to-end.** Click the button. Fill the
  form. See the result in the DOM. Take a screenshot. **Actually look
  at the screenshot.** If it's blank or showing an error page, you're
  not done.
- **Then run the tests.** Unit tests are a sanity check, not the main
  event.
- **Stop cleanly.**

**Obstacles are content.** You will hit weird ones — coordinate systems
that don't line up, APIs that return empty on this Electron version,
feature gates that hide the thing you need to test. Each of these gets
a bullet in Gotchas and (often) a helper in your driver. The gold
standard is a Gotchas section full of things nobody could have guessed.

**The driver script gets committed alongside the skill.** It is not
scaffolding. It is the way future agents (and humans) will drive this
app. It defaults to living inside the skill directory (for a web app
using `chromium-cli`, that means inline in `SKILL.md` — the heredoc
is the script). If it outgrows that — if the project's real test
suite wants to import from it — move it to `scripts/` or `e2e/` and
update `SKILL.md` to point there.

### 3. Write SKILL.md

Short. Point at the driver. Use [template.md](template.md) as the
starting structure — it has the frontmatter shape.

**The frontmatter matters.** The `name:` becomes the slash command
(`/run-billing`). The `description:` is what Claude scans to decide
whether to auto-load this skill — put the **verbs an agent would
actually type** in it: "run," "start," "build," "test," "screenshot."
Generic descriptions ("helpful utilities for billing") won't match.

Body structure:

1. One-paragraph intro: what this app is, how it's driven —
   `<driver-path>` under xvfb/tmux for desktop, `chromium-cli` for
   web, `curl` for a server.
2. **Prerequisites** — the exact `apt-get install` line you ran.
3. **Build** — the exact commands, in order. Include any patches you
   had to apply (feature gates, config overrides) with the exact `sed`
   or edit.
4. **Run (agent path)** — FIRST. How to launch the driver, what
   commands it accepts, where screenshots land. If it's a REPL, show
   the tmux wrapping. This is the section the next agent will actually
   use.
5. **Run (human path)** — SECOND, if different. `npm start` → window
   opens → Ctrl-C. Brief. Note that it's useless headless.
6. **Gotchas** — the battle scars. The things that look like they
   should work but don't, and the workaround. If this section is
   generic, you didn't fight hard enough.
7. **Troubleshooting** — symptom → fix. Only errors you actually hit.

Keep it **verified** (you ran it), **prescriptive** (one path, not
options), **honest** (flaky? slow? say so).

**Paths in SKILL.md are relative to `<unit>/`,** not to the skill
directory. State this at the top if there's any ambiguity. When the
driver lives inside the skill, its path from `<unit>` is
`.claude/skills/run-<unit-name>/driver.mjs` — it's long, but explicit.

### 4. Verify

Fresh shell, `cd` into the unit, follow the skill's `SKILL.md`
line-by-line without deviating. Any improvisation = a gap. Fix it.

## Project-type patterns

Pick a starting shape for your driver. These examples are shared with
the `/run` skill (same per-project-type patterns are used as the
fallback when no project-specific run skill exists) — if you're
authoring a new one, the example is your starting template.

| Project type | Driver shape | Example |
|---|---|---|
| Web server / API | Background-launch + `curl`-based smoke script | [examples/server.md](examples/server.md) |
| CLI tool | Representative-args smoke script, check exit codes + output | [examples/cli.md](examples/cli.md) |
| TUI / interactive terminal | tmux wrapper: `send-keys` / `capture-pane` | [examples/tui.md](examples/tui.md) |
| Electron / desktop GUI | Playwright `_electron` REPL driver under xvfb, screenshots, tmux-wrapped | [examples/electron.md](examples/electron.md) |
| Browser-driven | dev server + `chromium-cli` script | [examples/playwright.md](examples/playwright.md) |
| Library / SDK | Import-and-call smoke script | [examples/library.md](examples/library.md) |

For a web app, start from [examples/playwright.md](examples/playwright.md)
— drive it with `chromium-cli`, no custom driver needed. For a
desktop app, start from [examples/electron.md](examples/electron.md)
— it has the full `_electron` REPL driver skeleton, the tmux wrapping,
and the catalog of obstacles you'll hit.

## What to include

- **Prerequisites** — OS packages, runtimes, tools. Ubuntu `apt-get`
  lines. The exact ones.
- **Setup** — install deps, configure, any patches.
- **Build** — compile/bundle.
- **Run (agent path)** — the driver. Commands. Screenshot location.
- **Direct invocation** — if callable: how to import and run internal
  code without the full app. The env var / flag that bypasses init
  guards. Many PRs need only this.
- **Run (human path)** — if meaningfully different.
- **Test** — the test suite command.
- **Gotchas** — non-obvious traps you hit.
- **Troubleshooting** — error → fix.
- **The driver itself** — committed in the skill dir (or graduated
  to `scripts/`/`e2e/`), or inline in `SKILL.md` for `chromium-cli`
  web apps; referenced from `SKILL.md` either way.

## What to leave out

- **Anything you didn't run.** If the README says `yarn start:prod` and
  you never ran it, it's not in the skill. Full stop.
- **Documented happy paths for platforms you're not on.** You're in a
  Linux container. A macOS-only section you can't verify is
  speculation. Mention it exists; don't elaborate.
- **Exhaustive options.** One working path.
- **Architecture prose.** That's other docs.
- **Generic troubleshooting.** "If the build fails, check your Node
  version" — useless. Only include errors you actually hit and fixed.

## Red flags — you are about to ship the wrong thing

Stop and reconsider if:

- **You haven't taken a screenshot** of a GUI app. You didn't run it.
- **Your skill has no driver/smoke script** to point at, and the app
  is interactive. The next agent has no way to drive it. (Web app
  using `chromium-cli`? — the heredoc in `SKILL.md` is the driver;
  no separate file needed.)
- **Your skill reads like the README.** Same structure, same
  commands, same caveats. You paraphrased.
- **Your Troubleshooting section is generic.** Real execution produces
  specific, weird errors. Generic errors = you didn't execute.
- **You wrote "not supported on this platform"** without trying to
  launch it. The README author was on a Mac. You are not. Try.
- **Everything worked first try.** Either this project is trivially
  simple, or you ran the test suite and called it done.
