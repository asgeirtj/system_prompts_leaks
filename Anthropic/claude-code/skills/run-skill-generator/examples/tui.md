# Example: TUI / interactive terminal app

Interactive terminal apps (text editors, REPLs, curses-based UIs) can't
be driven directly by an agent's bash tool — they take over the terminal.
The skill must show how to wrap them in `tmux` so the agent can send
input, capture output, and take screenshots.

## The tmux pattern

This is the standard approach:

1. Start the TUI inside a detached tmux session
2. Send keystrokes with `tmux send-keys`
3. Read screen contents with `tmux capture-pane`
4. Clean up with `tmux kill-session`

The skill's `SKILL.md` should present this as the primary way to drive
the app. A small `driver.sh` that wraps the launch+attach sequence can
live in the skill directory, but for most TUIs the raw tmux commands in
the skill body are enough.

## Example snippet

> ## Run (interactive, for agents)
>
> Start the TUI inside tmux:
>
> ```bash
> tmux new-session -d -s app -x 120 -y 40 './myapp'
> ```
>
> Poll until the ready marker appears (faster + more reliable than a fixed sleep —
> returns the instant the app is up, fails loudly if it isn't):
>
> ```bash
> timeout 10 bash -c 'until tmux capture-pane -t app -p | grep -q "Ready"; do sleep 0.2; done'
> tmux capture-pane -t app -p
> ```
>
> Send input (this example navigates to the Settings screen and toggles
> an option):
>
> ```bash
> tmux send-keys -t app 's'
> timeout 5 bash -c 'until tmux capture-pane -t app -p | grep -q "Settings"; do sleep 0.2; done'
> tmux send-keys -t app 'Down' 'Down' 'Space'  # navigate + toggle
> timeout 5 bash -c 'until tmux capture-pane -t app -p | grep -qF "[x]"; do sleep 0.2; done'
> tmux capture-pane -t app -p
> ```
>
> If you find yourself writing more than a couple of these poll lines, pull
> them into a `wait_for()` helper in a `driver.sh` next to the skill.
>
> Quit:
>
> ```bash
> tmux send-keys -t app 'q'
> tmux kill-session -t app 2>/dev/null || true
> ```
>
> ### Key reference
>
> | Key | Action |
> |---|---|
> | `j` / `k` or `Down` / `Up` | Navigate list |
> | `Enter` | Select |
> | `s` | Settings |
> | `q` | Quit |

## Details worth documenting

- **Terminal size.** Some TUIs break or hide content at small widths.
  Specify a known-good size in the `tmux new-session -x -y` args.
- **Startup time.** Poll for a ready marker (`until tmux capture-pane | grep -q X`)
  rather than a fixed `sleep N` — returns the instant the app is up, and fails
  usefully when it never does. Say what string means ready.
- **Keybinding reference.** A table of the main keys. This is the "API"
  of a TUI — an agent needs it to drive the app.
- **Exit cleanly.** Show the quit keystroke *and* `tmux kill-session` as
  a fallback.
- **Color/unicode quirks.** If `capture-pane` output is hard to read,
  note flags that help (`-e` for escape sequences, `-J` to join wrapped
  lines).

## Also document the direct invocation

For a human running the app interactively, tmux is overkill. Include
the one-liner too:

> ## Run (direct, for humans)
>
> ```bash
> ./myapp
> ```
>
> Press `q` to quit.
