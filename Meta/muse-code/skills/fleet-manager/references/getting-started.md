# Getting started: nothing → first session in five steps

`<fleet>` is `python3 <skill-dir>/scripts/fleet_manager.py`, with the
directory taken from the read that delivered this skill (`skill-dir` when
present, else the directory of the SKILL.md path it shows). Every command prints one
JSON object; `text` is the human-readable part, `next` is the one command to
run when something is missing, and `<fleet> <verb> --help` lists a verb's
flags.

## 1–4. Doctor, open, context, steer

```text
<fleet> doctor                                   # provider, machines, next command
<fleet> open                                     # muse, this repository root, an auto name, this host
<fleet> open --engine claude --cwd ~/repo --name reviewer --prompt-file brief.md
<fleet> context                                  # the whole picture; read `text`, act on `groups`
<fleet> read s1                                  # what it is doing or said
<fleet> dialog s1                                # what it is asking (Herdr)
<fleet> approve s1                               # answer a y/N or numbered dialog
<fleet> send s1 "heads up: I'll close this in 5 min"   # a notification, nothing typed
<fleet> send s1 "run the tests" --type --wait    # typed in as a prompt; refused over a non-empty composer
```

`doctor` answers `provider: herdr` (server answering, started if it was
down) or `provider: tmux` (liveness, scrollback, guarded input,
open/stop/close only); `needs_user_action` means the tmux install needs a
password: run `next`, rerun. `open` answers `opened` with `handle` (`s1`),
`addr`, `identity` and a `receipt`. `send --type` with `submitted: false`
means `read` before sending again.

## 5. Add a machine

```text
<fleet> connect me@buildbox --label buildbox
```

One command, one `progress` line per step; it stops at the first thing
wrong with `next` naming the fix. Without Herdr here it opens one ssh
master of its own (one login, at most one second-factor prompt), checks
what runs there, starts a stopped Herdr server and forwards its socket, or
records the machine as tmux-only. With Herdr here it adds the machine
through Herdr first (`herdr machine add`, Herdr's own login, closed before
it returns), then reuses an answering forward or ssh master, else opens one
ssh master of its own: a fresh host costs Herdr's login plus at most one of
this skill's; `connect buildbox` again usually costs none. Then
`open buildbox --engine claude --cwd ~/repo`, and `context` covers both
machines. A report the remote session wrote comes home with
`<fleet> fetch buildbox /home/me/repo/report.md`; unchanged content copies
nothing. A machine that advertises MSP (`machines` lists it with `modes`
`msp` when `TBH_AGENTS_SESSION_PROTOCOL` is on) needs no `connect` at all:
`<fleet> open <host> --cwd /home/me/repo --prompt-file brief.md` opens a
session there in one call; never `ssh` an MSP host id.

## Troubleshooting

| you see | it means | do |
| --- | --- | --- |
| `unsupported_by_provider` / `no_provider` (exit 4) | this provider cannot do that verb, or there is none | run the verb `next` names (tmux has no dialogs: `read`, then `send --type`) |
| `needs_user_action` (exit 5) | a step needs you: a password, a second factor, a confirmation | do the step in `next`, rerun |
| `provider_unreachable` (exit 6) with `connect …` | the ssh master is down or the Herdr socket does not answer | run the `connect` line in `next` with a terminal attached |
| `herdr_add_failed` (exit 6) | Herdr could not add the machine (its own output says why) | run the `herdr machine add …` line in `next`; a tmux-only box: `connect <target> --mode tmux` |
| `no_such_session` (exit 3) | the handle names a session that is gone | `list`; the session ended or was closed |
| `identity_mismatch` (exit 3) "not the session it was minted for" | the pane id or name now belongs to another process | `list`, use the new handle |
| `composer_not_empty` (exit 3) | someone is typing in that session | `read`, wait or finish the line, retry |
| `session_live` (exit 3) "is live; close refused" | the session still works | `stop` it first, or `close … --confirm "<the user's words>"` |
| a machine shows `stale` in `context` | it stopped answering, inside the skip window (`verbs.md`, Outage cadence) | nothing yet; the last group is kept; an `outage` item follows |
| `herdr machine list` fails | the Herdr client catalog is broken | `herdr machine list --json` by hand; `local/...` addresses keep working |

State lives in `~/.local/share/muse/fleet-manager/state.json` (handles,
outages, the last `context`, the last hash of every fetched file), fetched
files under `~/.local/share/muse/fleet-manager/home/<machine>/`, machines in
`~/.config/muse/machines.toml`, forwards and ssh masters under
`/tmp/fleet-manager-<uid>/`. Deleting the state file loses handles only; the
next `list` mints new ones.
