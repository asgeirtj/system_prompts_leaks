# Provider notes: verified behaviours by version

What this skill relies on, with how each item was verified. A row without a
verification is an assumption and says so. Re-verify a row when the provider
version changes; the helper prints the version it saw (`doctor`, `list`).

## Herdr

| version | behaviour | verified how |
| --- | --- | --- |
| 0.9.0 | The socket API answers one request per connection and closes it; `events.subscribe` holds the connection open and streams `{"event","data"}` lines. | The helper's fake server mirrors it; live `events` runs (#36636 evidence) |
| 0.9.0 | Closing a workspace or tab emits ONE `workspace_closed` / `tab_closed` and no per-pane `pane_closed`; the helper folds the container event. | Measured live (#36636); `test_fleet_lifecycle.py` pins it |
| 0.9.0 | `pane.agent_status_changed` is scoped per pane: a pane that appears after the subscription needs its own subscription (the helper re-opens the stream). | Measured live (#36636) |
| 0.9.0 | `agent start` refuses a kind it does not manage with exit 2 and plain-text stderr `unsupported interactive agent kind: <kind>` (no JSON); the helper then runs the kind as the command in the pane and waits for detection. | Measured live (#36636) |
| 0.9.0 | `agent prompt` on a blocked agent is refused with `agent_blocked` before any input; `--wait` from a non-working state needs an observed working/blocked state within 5000 ms, else `agent_prompt_stalled`. | `herdr agent prompt --help` text and live drives |
| 0.9.0 | A freshly started agent can take a prompt into its composer without submitting (Muse 1.0.3, Claude Code): the helper verifies and presses Enter once (`needed_enter: true`). | Measured live (#31985) |
| 0.9.0 | A restored pane is not the prior process, and a pane id can be reissued after a server restart; the ids do not reliably restart from `w1` — after `herdr session stop <name>` and a restart over the master, a named session kept counting (`w5` → `w6`). The identity tuple (`server`, `ref`, `cwd`, `engine`) exists because of the reuse, not the numbering. | the herdr-projects stage-2/3 findings (restart from `w1`); the #38715 round-8 lane FM2 drive on a named session (continued numbering) |
| 0.9.0 | A saved machine whose ssh master is up can refuse a second ssh session (`Session open refused by peer`): the Herdr bridge holds the single slot. Reach it over the master (`ssh -O forward`), never with a fresh `ssh <host>`. | Measured on the fleet (#31985, the SLOT_FACT text) |
| 0.9.0 | `pane wait-output <pane> --regex <re> --timeout <ms>` searches the recent snapshot immediately, then polls; `--source recent-unwrapped` is available. | `herdr pane wait-output --help` |
| 0.9.0 | `notification show <TITLE> --body <TEXT>` shows a server-wide notification (no per-pane target). | `herdr notification show --help` |
| 0.9.0 | `worktree open --path <PATH> --label <TEXT> --no-focus` opens an existing git worktree as a workspace. | `herdr worktree open --help` |
| 0.9.0 | `workspace create --label <TEXT> --cwd <PATH> --no-focus` returns the root pane; `--env KEY=VALUE` exists but the helper never passes environment (launch-environment inheritance stays deferred). | `herdr workspace create --help`; `test_fleet.py` pins no `--env` |
| 0.9.1 | A prompt that arrives while text is half-typed merges with and submits it. The helper reads the composer first and refuses (exit 3) when it holds text. | Reported by the herdr-projects notes and adopted by the identity-and-safety rule; NOT re-verified here (this host runs 0.9.0) — treat as an assumption until a 0.9.1 drive confirms it |
| 0.9.0 | A fresh Muse session sitting on its workspace-trust dialog was `blocked` in one drive and `idle` in the next two (`agent wait --until blocked` returned idle); `dialog` shows the prompt either way. When Herdr did not flag it, `approve --force` answers what `dialog` showed. | Loopback black-box on this host, three runs |
| 0.9.0 | `machine add <SSH_TARGET> --label <LABEL> [--remote-session <NAME>]` prepares the remote server and saves the profile; the target comes FIRST — options-first argv gets `usage: herdr machine add <ssh-target> --label <label> [--remote-session <name>]` and exit 2, although `--help` prints clap-style `[OPTIONS] --label <LABEL> <SSH_TARGET>`. Its ssh runs over a private control socket (`-F /tmp/herdr-ssh-<pid>-0/config -S /tmp/herdr-ssh-<pid>-0/ctl`) that it `-O exit`s before returning, so nothing of its login survives for `connect` to ride. Its prompts and output go to the terminal, so `connect` routes them to stderr and keeps stdout one object. | Both argv orders run against the real binary in an isolated HOME (the fake in `test_fleet.py` rejects options-first the same way); the ssh argv captured with a logging `ssh` on PATH |
| any | An 0.8.x client has no `machine` verb (`unknown command`): the fleet is `local` only. | `list_machines` handles it; not re-verified since 0.9.0 |

## tmux

| version | behaviour | verified how |
| --- | --- | --- |
| 3.x | `list-panes -a -F …` with `#{window_activity}` (epoch seconds) is the liveness signal: activity within 60 s counts as `working`, else `idle`. No agent state exists. | tmux format docs; the tmux suite |
| 3.x | `new-session -d -s <name>` refuses an existing name (`duplicate session`); the helper refuses too and names `status` as the next command. `open` sets `remain-on-exit on` in the same call, so an engine that exits at once leaves a dead pane whose last line is the reason: the helper kills it and answers `failed` (exit 6), never `opened`. A session whose panes all exited later shows `status: exited`, `liveness: dead`. | tmux behaviour; the tmux suite |
| 3.x | The identity engine is `#{pane_start_command}` (first word, after the `env -u …` wrapper `open` adds), else `#{default-shell}`: stable for the pane's life. `#{pane_current_command}` is reported as `program` and decides liveness (`close` refuses while any pane of the session runs a non-shell program). `list-panes` uses a fresh random field separator per read, so no path or title can shift fields. | the tmux suite |
| 3.x | `open` starts the engine under `env -u HERDR_ENV -u HERDR_PANE_ID -u HERDR_SOCKET_PATH -u TMUX …`, so a session is nobody's pane; a Muse engine gets `--workspace <cwd>`, plus `--yolo` only with `open --unattended` (default: the engine's own permission prompts; owner ruling 2026-09-19). `--worktree` and `--label` are `unsupported_by_provider` on tmux. | the tmux suite |
| 3.x | `capture-pane -p -J -S -<n>` is the scrollback read. The composer check for guarded input reads the line under the cursor, for every engine alike: empty or a bare prompt (ends in a prompt character) is free, and so is a prompt glyph followed by exactly one of Muse's idle tips, whole on one row or soft-wrapped over the rows below it (the dim text the TUI draws in an EMPTY composer after a turn settles; the list is the TUI's `prompt_hint.rs` table, shared with host-manager); any other text is half-typed input and nothing is typed over it; a check that cannot run counts as busy. `send-keys -l -- <text>` and `display-message … -- <text>` so text that starts with a dash is text. | the tmux suite |
| 3.7b | A pane-level command (`send-keys`, `capture-pane`, `display-message`) with `-t =<session>` alone does not resolve ("can't find pane"); `-t =<session>:` (exact session, its current window) does. `kill-session -t =<session>` resolves as a session target. | Probed on this host's tmux 3.7b while building the suite |
| 3.x | `display-message -t =<session>: -d 0 <text>` is the notification form of `send`. | tmux behaviour |
| 3.x | `send-keys -l <text>` then `send-keys Enter` types a guarded line; `send-keys C-c` is `stop`; `kill-session -t =<session>` is `close` (refused while a non-shell program runs, unless confirmed). | the tmux suite |
| 3.x | `-L <socket>` selects a private server: tests and black-box runs never touch the user's own sessions (`FLEET_MANAGER_TMUX_SOCKET`). | the tmux suite |

## MSP (host-manager's mode C)

| version | behaviour | verified how |
| --- | --- | --- |
| transport CLI 2026-09 | `muse hosts --json` rows carry the host id, `msp_ready`, `availability` (online\|offline) and no `authorized` key (absent is authorized); a row without `msp_ready` is not a machine. The operator's directory can be wide: 20 advertising hosts on one devserver, 65 for the verifier. | the operator rows of the 2026-09-27 MSP acceptance and this PR's live rows |
| transport CLI 2026-09 | `muse sessions --host <host> --json` answers `result.sessions[]` of `{target: "<host>/<session id>", session: {sessionId, title, workspaceRoot, status: idle\|running\|notLoaded, activeTurnId}}`; `muse show <target>` adds `pendingRequests[]`. One `sessions --host` per online host per digest (in parallel), one `show` per running session. `--all-hosts` is a catalog scan with a 64-host budget: past it the answer is exit 4, `status: partial`, no rows and one `errors[]` entry per host — never the board's source. | live 2026-09-27 (row 24; verifier V-43535 raw envelope); the host-manager fake mirrors both shapes |
| host-manager | `open --host H --cwd P --name N [--prompt-file]` is `muse start` then the brief as `muse send --busy queue`; `send --steer` is `muse steer --turn <running>`; `close --confirm` is `muse interrupt --turn` then `muse task stop-all`, and the host keeps the session listed idle (no per-session end verb); `stop` on a session host-manager did not record is `no_such_session`, so this skill's `stop` names `close` instead. | host-manager's `test_msp_provider.py`; this skill's `test_msp.py` |

