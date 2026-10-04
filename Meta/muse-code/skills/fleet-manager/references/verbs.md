# fleet-manager verbs (`scripts/fleet_manager.py`)

The verb contract is shared with `host-manager`: one JSON object per verb,
one exit-code table, one receipt line per write. `fleet-manager` adds a
machine to every target and the machine verbs. `<fleet> <verb> --help`
prints the flags of one verb.

```text
<fleet> = python3 <skill-dir>/scripts/fleet_manager.py
<fleet> [--mode herdr|tmux|auto] [--asked-by <who>] <verb> …
```

## Envelope

Every verb prints exactly one object on stdout, success or failure:

| key | meaning |
| --- | --- |
| `outcome` | what happened, one word: a verb's own success word (`healthy`, `detected`, `context`, `listed`, `machines`, `status`, `read`, `dialog`, `attach_command`, `resources`, `waited`, `ready`, `sent`, `notified`, `not_shown`, `keys_sent`, `answered`, `opened`, `interrupted`, `closed`, `adopted`, `forgotten`, `connected`, `fetched`) or a failure word from the exit table |
| `provider` | what served the verb: `herdr`, `tmux`, or `null` when none was selected |
| `ref` | the target the verb acted on (a handle, an address, a machine label); `null` for fleet-wide reads |
| `capabilities` | tmux: `liveness`, `scrollback`, `guarded_input`, `attach_by_name`; Herdr: those four plus `agent_status`, `dialogs`, `prompt_readiness`, `wait`, `wait_for_output`, `workspace`, `tab`, `worktree`, `notify` |
| `progress` | one line per step already taken (also echoed to stderr) |
| `next` | the one command that moves things forward; empty when there is nothing to do (no success word is `ok`; every failure word carries one, `doctor` when nothing more specific applies) |
| `receipt` | write verbs only: `what`, `session` (the identity tuple), `who`, `when` (ISO-8601 UTC), and the same as one `line` (with the `HH:MM UTC` clock) |
| `error` | failures only: the first thing wrong |
| `text` | reads that render something (the board, a read, a dialog, the context digest) |

Exit codes:

- `0` ok.
- `2` `usage` — the message names the flag or address.
- `3` `refused` / `no_such_session` / `identity_mismatch` / `session_live` /
  `name_taken` / `composer_not_empty` — refused by a guard, nothing changed
  (`no_such_session`: the handle names no live session, a gone session, not
  an unknown one).
- `4` `unsupported_by_provider` / `no_provider` — `next` names the
  alternative.
- `5` `needs_user_action` — an install command, a login or second factor,
  a confirmation; `next` is that step.
- `6` `provider_unreachable` / `failed` / `tmux_unavailable` /
  `herdr_unavailable` / `herdr_add_failed` / `composer_unreadable` — the
  guard could not look, so nothing was typed; nothing changed unless the
  line says `created: true`.
- `7` `internal`.

One verb streams instead: `events` (one line per change, for one Monitor;
`events --once` is one object).

## Addresses

`s3` (a handle the board minted) or `machine[:server]/<ref>`: `machine` is
`local` or a machine label; `server` is a Herdr session name (default: the
profile's); `ref` is a pane id (`w1:p2`), a unique live agent name, a human
label (the pane's label, its terminal title, its tab's or its workspace's
label — exact first, then a unique case-insensitive match; two matches name
the candidates), or a tmux session name. Pane ids, names and labels are
server-local: never drop the machine part.

A handle-shaped address nobody minted (`send s17 …`, when a human named the
session `s17`) is not refused as an unknown handle: it is resolved like any
other name — one fleet read, every session's name and the labels a human
sees, exact first then a unique case-insensitive match; two answers name the
candidates, none is `no_such_session`. A handle this skill minted always
wins over a session named like it.

A handle carries the identity tuple
`(provider, machine, server, ref, cwd, engine)` — `server` is the Herdr
socket path or the tmux socket label the verb actually used, stored on the
handle at open/adopt/list and compared like every other field — and every
write verb checks the whole tuple first: a restored pane is not the prior
process and a pane id or name can be reissued to a new one; a mismatch is
`identity_mismatch` (exit 3) naming `adopt <address>`, which takes the
session now under the address on purpose. `list` shows such a handle as
`drift (…)` and never re-points it at the stranger.

## Read verbs (allow-listable)

| verb | does |
| --- | --- |
| `doctor [--no-start] [--no-install]` | `healthy` (or `needs_user_action` / `no_provider` / `provider_unreachable`): `checks` rows (`python`, `herdr`, `tmux`, `machines_directory`, `provider`), every machine's reachability, the one next command; starts a stopped Herdr server, installs tmux when that needs no password |
| `detect [--no-start] [--no-install]` | the provider decision for this host: `reason` (`herdr_reachable`, `herdr_started`, `herdr_down`, `tmux_available`, `tmux_installed`, `requested`, `no_provider`), `providers` rows (`installed`, `reachable`, `server`, `version`, `capabilities`) |
| `context [--reset]` | one digest: `sessions` rows (each with `identity` and `group`: `waiting-on-you`, `ready-for-review`, `working`, `idle`; an MSP host's sessions come from one `muse sessions --host <host>` per online host of yours, four at a time under a per-host deadline (`FLEET_MANAGER_MSP_LIST_TIMEOUT_S`, 8 s) — a pending request is `waiting-on-you`, a running turn `working`, else `idle` — and carry `provider: msp`; a host that does not answer, or not in time, is `unreachable` with the transport's own message or "did not answer within N s (listing pending; ask again)", never "0 sessions"; strangers' hosts and sessions are never read or rendered), `groups`, machines with reachability (`connected`, `stale`, `unreachable`, `disabled`, or `unverified` for a directory row whose `connect` stopped before verification — its `next` is that `connect`, never an outage), `coverage`/`unknowns`, `resources` (`cpu_count`, `load_1m`, `memory_available_mb`, `disk_free_mb`, `sampled_at`), `changed` since the last call, `items` (`outage`, `recovered`; the cadence is under Outage cadence below), `text` |
| `list [<machine>] [--dialogs] [--hint]` | the board (`text`), the compact `inventory`, and `rows` (one per server with `agents`, `state`, `next_step`); blocked first; every machine, connected or not. A Herdr row carries `labels` — the names a human sees (`pane` from the snapshot's panes, `tab`, `workspace`; empty ones and a tab's or workspace's own number left out) — and the board and `context` print the pane's name, else its tab's, in quotes beside the session, so the name a human gave a pane is on the board they read; a workspace label (usually what `open --label` wrote) stays in the row and addressable |
| `machines` | Herdr's saved list plus `~/.config/muse/machines.toml`, plus your MSP hosts (`muse hosts` over the transport CLI, with `TBH_AGENTS_SESSION_PROTOCOL` on; provider `msp`, source `msp`, the host's transport id as label and target): this machine's own advert, the hosts of your own login family (ids carrying your login as a dash-bounded token, `msp-<user>-<host>` and the like), every host you saved with `connect <host id>` or that an ssh row's label already names, every host holding a session this skill opened or adopted, and any host you name in the turn — never the rest of a shared directory, whose size is `msp.directory` (`advertising`, `shown`, `not_shown`) and one `notes` line; each with `provider`, `modes` (the modes it supports — an MSP host whose id an ssh-registered row already carries as its label or id is that one row with `msp` added — its sessions are read through its ssh provider, `open` on it prefers msp), `reachability` (an MSP host: `connected` when `muse hosts` says online, `unreachable` when offline — never a login), `note`, `next`; `shadowed` names directory rows Herdr also saves; with the flag on, `msp` (`state`, `note`, `hosts`) and, when the source is not available, one `notes` line saying why (no CLI, an older build without the `muse` verbs, a transport that does not answer) |
| `status <addr>` | the identity tuple, `live`, agent status, `identity_ok` / `identity_drift` for a handle; a session that no longer exists is `no_such_session` (exit 3) — "gone", while `provider_unreachable` (exit 6) is "unknown"; an agentless Herdr pane this skill holds (a shell pane, an adopted raw pane) is `status: no_agent` with `liveness_only: true`; an MSP session answers through host-manager's `status --mode msp --ref` (`group` beside `status`) |
| `read <addr> [--lines N] [--chars N] [--tail] [--source visible\|recent\|recent-unwrapped]` | the session's recent output (`text`, `lines`, the native `status`); `--tail` is the last `--lines` rows (default 60) of its visible screen as the engine drew them (blank rows and rule lines squeezed), chrome and all — you read it as you would in attach; an MSP session has no screen: `--tail` and the plain read are the same transport tail, `status` its `group` |
| `dialog <addr> [--lines N]` | what a blocked session is asking (Herdr) |
| `resources [<machine>]` | load, CPUs, memory, disk under `$HOME` on this host and every reachable machine (portable shell probes down the ladder) |
| `wait <addr> [--until s1,s2] [--duration S]` | Herdr `agent wait` on one session (never a poll): `waited` with `reached` true or false and the last `status`; default states idle, done or blocked; default duration 600 s, enforced by the helper (Herdr's own `--timeout` is a backstop 5 s behind it); a Herdr-side error is a failure envelope — `no_such_session` (exit 3) for a target Herdr does not know, exit 6 otherwise — never read out of Herdr's prose |
| `events [--interval S] [--once] [--kinds …] [--duration S] [--replay-baseline]` | the fleet stream for one Monitor (Herdr `events.subscribe` per reachable server; unreachable machines re-probed every `--interval`) |

### `fetch <machine> <path>`

One report or library file home from a machine, by content hash.

- The machine is asked for the file's sha256 first; the copy happens only
  when the home copy is missing or its own sha256 differs (the last hash is
  also kept in the state file). Success is `fetched` with `copied`,
  `unchanged`, `sha256`, `bytes`, `home`, `rung`.
- The copy lands under `<state dir>/home/<machine>/<path>` and nowhere
  else: no destination flag (the agent's cwd is usually a repository; a
  human moves the file).
- A symlink is `refused`; a directory or missing path is `usage`; above the
  copy cap, `usage` with the cap named; `local` is `usage` (read it in
  place).
- A box without `sha256sum`/`shasum`, a copy that does not decode, or bytes
  whose hash differs write nothing (`provider_unreachable`).
- Code never travels this way: it comes home through a PR.

## Steer verbs (allow-listable by subcommand)

| verb | does |
| --- | --- |
| `send <addr> <text> [--automated]` | a notification only a human watching the pane sees (Herdr `notification show`; tmux `display-message`); never types, and the agent never receives it — never `sent`: `notified` when Herdr reports it shown, `not_shown` for a tmux status-line message (it reaches only an attached client) or a Herdr `shown: false`; either says `nothing was typed` in `message` and its `next` is the `--type` form |
| `approve <addr> [--key K] [--force]` / `deny <addr> …` | answers a recognised y/N or numbered dialog (Herdr); refused when the session is not blocked or the dialog is unreadable (`--key` after reading it). `approve` reads the dialog first: Enter confirms the highlighted choice (a `❯`/`›` row, or a bare `>` only on a numbered row — Codex's `> You are in <dir>` banner is never the choice), so when that choice is not the affirmative one it refuses (`code: agent_blocked`, `highlighted`) and `next` is the attach command. When Herdr calls the session idle but the screen shows a dialog (Codex's directory trust, a fresh Muse trust prompt in some drives), the refusal carries `code: agent_blocked` and `next` is the one command that answers it: `approve <addr> --force` when the affirmative choice is highlighted, else the attach command |
| `send <addr> --keys <key…>` | named keys for any other dialog (Herdr), under the composer guard; a row of the dialog's own choice block is not held text, so keys go through to answer it — a line a person typed is held text whatever shape it has |

## Guarded verbs (permission prompt)

| verb | does |
| --- | --- |
| `adopt <machine[:server]>/<ref> [--name N]` | mints a handle for a session this skill did not open, with its identity recorded (`--name` is a Herdr agent rename); a name another session already answers to is `name_taken` (exit 3) naming the holder, and nothing is adopted or renamed |
| `attach <addr>` | the command a human runs to sit in front of the session; nothing is executed |
| `stop <addr>` | interrupts the current turn (ctrl-c); the session stays; an agentless Herdr pane gets `pane send-keys c-c` into its shell; an MSP session has no ctrl-c — `unsupported_by_provider` naming `close` |
| `close <addr> [--confirm "<the human's words>"]` | closes the pane / kills the tmux session; a live session (working, blocked, a non-shell program in any of its panes) is `session_live` (exit 3) without `--confirm`; on an MSP session host-manager's `close --confirm` ends its work (the running turn interrupted, its tasks stopped) and the receipt says the host keeps the row listed idle until it unloads it — gone is the host's own `not_found` (`no_such_session`); a repeat with the words is `closed` again |
| `forget <label> [--confirm "<words>"]` | drops a `machines.toml` row (`forgotten`); `session_live` while it has live sessions unless confirmed; a Herdr-saved machine is Herdr's (`next` is `herdr machine remove <id>` — Herdr 0.9.0 takes the id from `machine list --json`, not the label) |

### `send <addr> <text> --type [--wait] [--until …] [--timeout ms] [--automated] [--no-verify] [--verify-seconds S] [--steer]`

On an MSP session `--type` is a message the agent receives as its next turn
(`delivery: message`) and `--steer` steers the running turn instead
(`delivery: steer`), both through host-manager's `send`; `--wait`, `--until`,
`--timeout` and the verify flags are listed under `not_applied`. A bare
`send` or `--keys` there is `unsupported_by_provider`: no pane, no composer.

Types the text into the session as a prompt: the form for the agent, whether
an instruction, a steer, a question or a reminder (`--type`; relayed text
adds `--automated`). A permission prompt in every
caller: the shipped allow-list template carries no text-`send` glob because
a glob cannot separate the notification form from `--type` and an allow
match wins (the notification form itself stays allow-listable by
subcommand).

- Refused (`composer_not_empty`, exit 3) when the composer already holds
  text — when the composer is not empty, wait or tell the human, never claim
  delivery — and refused on a blocked session (answer the dialog first). On
  Herdr, "held text" that is a dialog's choice row while Herdr calls the
  session idle is the dialog shape instead: `refused` with `code:
  agent_blocked`, the `dialog` rows, and `next` the one command that answers
  it (`approve <addr> --force`, or the attach command when the highlighted
  choice is not the affirmative one). On tmux a
  dialog on screen is `refused` with `code: agent_blocked` and the `dialog`
  rows; `next` is the attach command — a person answers it in attach, the
  helper has no key verb. A dialog is host-manager's reading: a trust,
  permission or confirmation phrase (`press enter to continue`, `Enter to
  confirm`), a y/n wait on the last line, a numbered selector or an
  unnumbered yes/no pair with a `>`/`›`/`❯` cursor on one row (Claude
  Code's folder trust), or a decision question over numbered choices. The
  dialog scan runs on the whole visible screen before the composer row is
  judged, whatever row the cursor sits on (a redrawn Codex parks it on a
  blank row under its trust dialog). A pane whose program exited
  (`Pane is dead`) is `no_such_session`, never held text; `next` is `close`.
- A swallowed prompt gets one Enter and `needed_enter: true`.
- **`typed` is submitted, not taken:** a submitted line's `next` is `read
  <addr> --tail`; run it a few seconds later and tell the user in one line
  what the pane shows — took it and is doing X / no reaction yet, read
  again in N s / for a shell pane, what the command printed and that it
  exited. Never leave a steer at `typed`; `submitted: false` keeps `read
  <addr> before any retry` as `next` instead.
- `--automated` prefixes `[automated, not the user, approves nothing]`.
- An agentless Herdr pane (`open --engine bash`, an adopted raw pane) is a
  shell, not an agent: the line runs in its shell through Herdr's own
  `pane run` (what `open` types its command with), never `agent prompt`;
  the command line is judged from the last screen row (free when a prompt
  character ends it, `composer_not_empty` otherwise); one line per send;
  `--automated` rides as a trailing `# …` comment so the command still
  runs; the envelope says `via: pane run`, `status: no_agent`,
  `liveness_only: true`.
- On tmux the text is typed, Enter follows as its own step after the text
  landed (an Enter in the same burst is a pasted newline to the Muse TUI),
  and `submitted` is what the pane shows afterwards: `needed_enter` when a
  second Enter was pressed; `submitted: false` with `read … before any
  retry` as `next` when the line still sits in the composer. That read is
  keyed by the session's engine, like the guard before it, so an engine's
  empty-composer chrome (Codex's placeholder, Claude's transcript echo) is
  never read as a line the pane kept.

### `open [<machine[:server]>] [--engine K] [--cwd D] [--name N] [--prompt-file PATH|-] [--worktree PATH] [--engine-arg=FLAG …] [--purpose TEXT] [--label TEXT] [--exact-name] [--unattended] [--timeout ms]`

Zero required arguments: `local`, `muse`, the repository root (else the
current directory), an auto name (`<dir>-<n>`; a taken name gets `-2`/`-3`,
`--exact-name` refuses with `name_taken`). Success is `opened` with
`identity`, `created: true` and a `receipt`.

- Herdr: `workspace create` (or `worktree open --path` for `--worktree`),
  `agent start --kind` (engine args after `--`; a kind Herdr does not
  manage runs as the command in the pane), then the brief with
  `agent prompt --wait`. A shell kind (`bash`, `zsh`, `sh`, …) runs through
  `pane run` and nothing waits for an agent Herdr will never detect: the
  answer is `opened` with a handle, `status: no_agent`, `liveness_only:
  true`, `via: pane run`; the brief is not sent (`send --type` runs a
  line). `list`/`context` show the pane as a liveness-only row (the tmux
  shape) for as long as this skill holds its handle; any other command that
  never becomes an agent is still `failed` (exit 6) with the pane left to
  read and close.
- tmux: `new-session -d` under `env -u HERDR_* -u TMUX` (a Muse engine gets
  `--workspace <cwd>`); an engine that exits at once is `failed` (exit 6)
  with its last line, nothing left behind; `--worktree`/`--label` are
  `unsupported_by_provider`; the brief is not sent (no readiness signal).
- `--unattended` adds `--yolo` for a Muse engine and nothing for any other
  engine (pass that engine's own flag with `--engine-arg`); default is the
  engine's normal permission prompts; the envelope carries `unattended` and
  `posture` (the flags actually added).
- An MSP host (`modes` carries `msp`): host-manager's `open --host <host>
  --cwd <dir>` through the transport, the brief as the first turn; `--cwd`
  is required (`usage` naming it: that machine's directories are not this
  one's), `--engine` other than `muse`, `--worktree`, `--label` and
  `--engine-arg` are `unsupported_by_provider`. Success carries `mode:
  msp`, `mode_line`, `attach` (the transport's tail command), the handle,
  `session_receipt` (the start and the brief) and `via: host-manager open
  --mode msp`; a host that stopped advertising or answering between the
  listing and the open is `provider_unreachable` (exit 6) with `created:
  false`, and every other machine answers as before. Every `open` receipt,
  on every provider, carries `mode` (`herdr` | `tmux` | `msp`).
- After a timeout, run `list` before any second `open`: the session is
  usually there under its name, and a second `open` makes a second session.
- No `--dry-run`: `progress` names each step as it happens and `close`
  undoes the result.

### `connect <ssh-target|label> [--label N] [--mode herdr|tmux] [--session S] [--no-login]`

One command, one `progress` line per step; it stops at the first thing
wrong with `next`. `via` says `herdr` or `ssh-master`; `remote` carries what
that path observed.

- With Herdr on this host: `herdr machine add <target> --label N
  [--remote-session S]` (the target first: Herdr 0.9.0's parser rejects
  options-first argv) records the machine (Herdr's list is authoritative,
  no directory row) with Herdr's own login, which Herdr closes before the
  add returns. Then an answering forward is reused with no ssh; else a
  master that already answers (this skill's, or one the user's ssh config
  keeps) carries the forward with no login; else this skill opens its one
  master, and the remote server is started or forwarded. Login accounting:
  a fresh host costs Herdr's login plus at most one of this skill's; a
  reconnect costs at most one and usually none.
- A failed add is `herdr_add_failed` (exit 6) with the Herdr command as
  `next`, never a silent tmux fallback. An add that exits 0 but whose
  `herdr machine list` read-back fails is `provider_unreachable` with
  `connect <label>` as `next` (never a second add).
- Without Herdr, or with `--mode tmux`: save to `machines.toml`, open
  the ssh master (the one interactive login, one second factor), verify the
  remote provider, start a stopped remote Herdr server, forward its socket,
  record. A box without tmux gets it installed when that needs no password,
  else the install command as `next` (exit 5).
- A saved label: re-forward over the live master, starting a stopped remote
  Herdr server over it first (one progress line, never a question).
- An MSP host: nothing to log in to (a transport id is not an ssh target);
  `connected` when `muse hosts` lists it online, `provider_unreachable`
  when offline, `next` is `open <host> --cwd <dir>`; a host that is not
  yours is saved to `machines.toml` as provider `msp`, so the digest reads
  it with yours from then on, and `forget <host id>` drops that row (one
  of your own hosts is not a row: it leaves when it stops advertising).
- `--label <other>` for a target the directory holds verified tmux-only
  under another label is `usage` naming the saved label. `--no-login` never
  opens a login (exit 5 or 6 with the command instead).

## Provider rule and remote ladder

Herdr when installed and its server answers (started when down, never
installed); tmux otherwise (installed when that needs no password; else the
exact command in `next`); `--mode` overrides; Windows: `no_provider`. A
machine that advertises MSP is provider `msp` whatever the pin: its
sessions are host-manager's mode C, reached through host-manager's helper
(`FLEET_MANAGER_HOST_MANAGER`, else the `host-manager` skill beside this
one) — one call of it per verb, the two skills one record of the session.
No `ssh` ever goes to an MSP host id, and no session or command id is minted
here: host-manager's provider does that. `resources` does not read an MSP
host (no shell; `reachability: unsupported`), `events` does not watch one
(`context` does).

A machine is reached down one ladder: the forwarded Herdr socket (a
`fleet-manager@<home host>` pane on that server runs the command and its
output comes back through the pane) → the existing ssh ControlMaster
(`BatchMode=yes`, `ControlMaster=no`, never a fresh login) → `unreachable`
with `connect` as the next command. Output comes home through the pane or
the master and stops above `FLEET_MANAGER_COPY_CAP_BYTES` (4 MiB) on either
rung with the cap named; this host owns the record.

Outage cadence: a machine that stops answering
is skipped for two minutes (a successful `connect <label>` ends that window
early) and keeps its last group in `context` as `stale`; one `outage` item
after ten minutes, one `recovered` item when it returns.

Copying home is lazy. No verb copies a file per round: `context` and `list`
pull status only (one snapshot per machine). `fetch` is the only copy, by
content hash, and a repeated `fetch` of an unchanged file is one round trip
and no bytes. Symlinks are never followed; code comes home through a PR.

## Environment

`TBH_AGENTS_SESSION_PROTOCOL` (host-manager's flag: on lists MSP hosts and opens on them; off is the old path byte for byte), the transport CLI override host-manager honours (named in its `references/mode-msp.md`), `FLEET_MANAGER_HOST_MANAGER` (host-manager's skill directory; default: the sibling `host-manager`), `FLEET_MANAGER_MSP_HELPER_TIMEOUT_S` (300: one host-manager call), `FLEET_MANAGER_MSP_LIST_TIMEOUT_S` (8: one host's session listing inside a digest; past it the host is "not answered yet"); `HERDR_BIN_PATH`, `HERDR_SOCKET_PATH` (Herdr's own); `FLEET_MANAGER_SSH`, `_DIR` (forwards and masters, `/tmp/fleet-manager-<uid>`), `_STATE` (`~/.local/share/muse/fleet-manager/state.json`), `_MACHINES` (`~/.config/muse/machines.toml`), `_SESSION`, `_REMOTE_SOCKET`, `_TMUX_SOCKET` (a private tmux server), `_ASKED_BY`, `_CONNECT_TIMEOUT_S` (25; a login step gets at least the smaller of 5 s and that, however little budget is left), `_SERVER_WAIT_S` (12: how long a just-started remote server may take to answer over the forward), `_COPY_CAP_BYTES`, `_CALL_TIMEOUT_S` / `_SSH_TIMEOUT_S` / `_API_TIMEOUT_S`, `_NOW` (injected clock for tests).
