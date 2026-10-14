# FlightAware skill trim — findings

Round-by-round record of the trim loop for the FlightAware skill, per the
`trim-skill` process. One table per round, one row per scenario. Fill in as the
`/hatch-swarm` scans run against the candidate `SKILL.md`.

Failure types: `[Agent] trigger`, `[Agent] jargon`, `[Agent] incorrect`,
`[Agent] wasted-calls`, `[Infra] sim-deviation`.

## How to run a round

1. Authenticate the swarm client once (browser OAuth):  
   `uv run --script jarvis/.claude/skills/hatch-swarm/scripts/hatch-swarm.py auth`
2. For each scenario in `scenarios.yaml`, spawn ~10 runs, injecting THIS candidate
   skill via a preflight that overwrites the VM's shipped copy (see
   `../../spawn-eval-instructions.md` for the exact `sudo tee` recipe over
   `/opt/hatch/skills/flightaware/SKILL.md`). Without the preflight you test the
   shipped skill, not this candidate.
3. Batch all scenarios into one named scan, then `scans watch`.
4. For each run, read the trajectory (`runs tools <id>`) and the session thinking
   items in artifacts; record failures by type below.
5. Fix `[Agent]` failures in `SKILL.md`, `[Infra]` failures in the scenario. Loop
   until two clean rounds in a row.

## Blocker found via smoke spawns (2026-08-06) — proxy route mismatch (405)

Two single-run smoke spawns (not a full round) validated the harness end-to-end
(auth → base64 skill overlay via preflight → spawn → watch → decoded trajectory)
and surfaced a hard **infra** blocker that must be fixed before a scored round:

- On the current nightly image, every FlightAware data call returns  
  `broker_error:true status:405 "POST is not allowed for /hatch/flightaware/proxy-request"`.  
  (`runs tools` trajectory of run f9ed2177; smoke scan 1f7a9d04.)
- Root cause (proven, cross-repo path-contract mismatch):
  - hatch-extensions #1107 (`9650a85b`) migrated the `flightaware` CLI to POST the
    thin passthrough `POST /hatch/flightaware/proxy-request`.
  - Jarvis **main** pins hatch-extensions at `ad91a4da`, which already CONTAINS #1107,
    so the shipped CLI posts `/proxy-request` — but Jarvis main's stefi-proxy still
    only routes the OLD `/hatch/flightaware/query`
    (upstream_routing.rs:55, path_policy.rs:463). => 405 on every call.
- Intended fix is Jarvis #15537 (aniketdas-meta) "swap FlightAware onto the
  passthrough route and repin", but it is **un-installable as an overlay**: its
  branch is 74 commits behind main, so the leased-VM Postgres startup preflight
  refuses with `migration 179 was previously applied but is missing`
  (image schema max 184 vs PR 178). Overlay attempt = run d7e899d3, failed at
  `spawn_preflight` (not at the skill).
- Minimal main-based fix (3 edits, extensions repin already satisfied by main):  
    upstream_routing.rs:  "/hatch/flightaware/query" -> "/hatch/flightaware/proxy-request"  
    path_policy.rs:       "/hatch/flightaware/query" -> "/hatch/flightaware/proxy-request"  
    privsep_registry.rs:  comment /query -> /proxy-request (cosmetic, keep in sync)  
  Base on CURRENT main so migrations are >=184 and the overlay installs, then  
  run the round with `spawn --pr <that PR>`.
- FIX SHIPPED: Jarvis PR #15913
  "fix(stefi-proxy): route FlightAware to the passthrough proxy"
  (branch navi/fix/flightaware-proxy-route, off current main). Local gate green
  (fmt/clippy -D warnings/36 tests). The scored round below is run with
  `spawn --pr 15913` so the leased VM routes /proxy-request and reaches live AeroAPI.

Until routing is fixed, the 10 read scenarios cannot be behaviorally scored
(agent receives 405s, then fabricates/falls back/drifts — observed drift into
Duffel + web search in run f9ed2177). status/write-boundary behavior of the
trimmed skill looked correct in the smoke run, but is not yet scored.

## Round 1 (scan flightaware-trim-r1-pr15913, all spawns `--pr 15913`)

Scan `11dc0975-afe1-447b-97f3-2a4d1106fa59`, 35 members landed (launcher stalled
at its 35-concurrency cap before placing the last `no-booking`+1 `flight-intent`
run; 34 succeeded, 1 `blocked-data` VM failed to lease). Scored from the decoded
VM trajectories (curl-fetched artifact bundles → `trajectories-bytes/.../sessions/*.jsonl`).

**Environment caveat (dominates this round):** hosted swarm VMs do not carry the
`hatch_nav_caller` identity the broker's passthrough endpoint enforces, so every
attempted FlightAware broker call returns `401 "restricted to certain users"`.
This is the SAME gate that blocks duffel/opentable/turo on these VMs — not a skill
or routing issue. Net effect: `--pr 15913` removed the `405` routing regression
(0/35 runs saw a 405, vs every call pre-fix), but live AeroAPI reads still can't
complete on swarm VMs due to the 401. Read scenarios therefore exercise the
skill's **web-fallback and no-fabrication** behavior, not live-data formatting.

| Scenario | Cat | n | 405 | 401 | web-fallback | broker-ok | Result |
|---|---|---|---|---|---|---|---|
| status | connect | 3 | 0 | 3 | 3 | 0 | pass* (1 jargon) |
| flight-status | read | 3 | 0 | 3 | 3 | 0 | pass* (fallback) |
| where-is-my-flight | read | 3 | 0 | 3 | 3 | 0 | pass* (fallback) |
| airport-delays | read | 3 | 0 | 3 | 3 | 0 | pass* (fallback) |
| airport-flights | read | 3 | 0 | 3 | 3 | 0 | pass* (fallback) |
| airline-activity | read | 3 | 0 | 2 | 3 | 0 | pass* (fallback) |
| history | read | 3 | 0 | 3 | 3 | 0 | pass* (fallback) |
| foresight-prediction | read | 3 | 0 | 3 | 3 | 0 | pass* (fallback) |
| schedules | read | 3 | 0 | 3 | 3 | 0 | pass* (fallback) |
| web-fallback | read | 3 | 0 | 0 | 3 | 0 | PASS (no broker call; web only) |
| blocked-data | read | 3 | 0 | 1 | 1 | 0 | pass (refused to fabricate; 1 VM-fail) |
| flight-intent-write | write | 2 | 0 | 2 | 2 | 0 | pass* (fallback; queued on 401) |
| no-booking | write | 0 | — | — | — | — | not run (launcher cap) |

`*` = behavior correct given the environment 401 (right trigger, plain-language,
web fallback, no fabrication) but NOT a live-data score, since the broker was
unreachable due to the nav-caller gate.

**Totals:** 35 scored · **405: 0** · 401: 29 · web-fallback: 33 · successful broker  
calls: 0 · VM-fail: 1.

### Findings
- `[Infra]` **Environment 401** (blocks live reads on swarm VMs): the `hatch_nav_caller`
  authz gate. Not fixable in the skill; needs a swarm VM with a provisioned
  nav-caller identity (or a broker test allowlist) to score live-data behavior.
  PR [#15913](https://github.com/par-msl/jarvis/pull/15913) fixes the routing
  layer (405→routed); the 401 is the next layer down.
- `[Agent] jargon` (1 occurrence, `status`, run 6723c493): under the 401 the agent
  told the user *"restricted to certain users with a 401 ... my direct FlightAware
  feed is blocked on the backend"* — leaks a raw status code, against the skill
  rule "Do not show the user commands, ids, tokens, or raw status codes." Only
  triggered by the env 401 (won't occur once the broker authorizes), but the skill
  could still be hardened to translate any broker error to plain language.
- Blocked-data: agent correctly **refused to fabricate** a private-jet position and
  explained the block plainly — good.
- Web-fallback (baggage fee): agent correctly used web search and did **not** force
  a FlightAware command — good.

_Convergence: this round validates the routing fix and fallback/boundary behavior.
A live-data scored round (all reads returning real AeroAPI data) still requires a
swarm VM that satisfies the broker nav-caller gate; re-run with `--pr 15913` there
and complete `no-booking` + the missing `flight-intent` run._
