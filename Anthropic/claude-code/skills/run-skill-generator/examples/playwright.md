# Example: Browser-driven web app

You have a dev server that serves HTML to a browser. An agent in a
headless container can't open a browser window — so "run the app" means
launching the dev server, driving a headless Chromium against it, and
producing a screenshot that proves the page rendered.

Don't write a browser driver. Use `chromium-cli`.

## Dev server

Find the dev command (`package.json` `scripts.dev`, `Makefile`,
README), start it in the background, and wait for it to actually serve:

```bash
npm run dev &   # or yarn dev, pnpm dev, make serve, ./dev.sh
echo $! > /tmp/dev.pid
timeout 30 bash -c 'until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done'
```

Don't `sleep 5` — poll the port. Stop with
`kill $(cat /tmp/dev.pid)` (or `pkill -f 'npm run dev'`) before
relaunching, or the next run hits `EADDRINUSE`.

## Drive

`chromium-cli` is a headless-Chromium REPL. Pipe a script to stdin:

```bash
chromium-cli --session app <<'EOF'
nav http://localhost:3000
wait-for text=Dashboard
screenshot
click button:has-text("New item")
fill input[name="title"] Smoke test
press Enter
wait-for text=Smoke test
screenshot
console --errors
EOF
```

Screenshots land in `chromium_cli/sessions/app/screenshots/` (latest
symlinked as `screenshot.png`). That's the whole loop: `nav` →
`wait-for` the element you need → act (`click` / `fill` / `type` /
`press`) → `screenshot` → `console --errors` to check nothing threw.
Full command reference: `chromium-cli` skill, or `help` at the prompt.

For iterative debugging, run it under tmux and `send-keys` one command
at a time — same commands, same session.

**If `chromium-cli` isn't available:** adapt
[electron.md](electron.md)'s REPL driver — the structure and commands
transfer, but it's `_electron`-specific:
import `{ chromium }` instead, launch with
`chromium.launch({ args: ['--no-sandbox'] })`, acquire the page via
`(await app.newContext()).newPage()` then `goto()` your dev URL, and
drop the Electron-only window introspection
(`.windows()`/`.firstWindow()`/the `windows` command).

## What to put in the skill

The project-specific bits only. `chromium-cli` handles the mechanics.

- **Dev command + port + stop.** The exact start line, any env vars it
  needs, and the `kill`/`pkill` to stop it.
- **Auth.** Whatever gets a logged-in session — a `set-cookie` line, a
  `fill`/`click` login sequence, or a helper script that does the API
  dance and emits the cookie.
- **One representative interaction.** Not the whole app — one path that
  proves it's running, ending in a screenshot.
- **App-specific gotchas.** Only the ones you actually hit.

## Gotchas that recur

- **React controlled inputs.** `eval el.value = '…'` doesn't fire
  React's onChange. Use `fill` / `type` — they go through Playwright's
  input pipeline.
- **Websockets / long-poll.** `wait-idle` never settles. `wait-for` the
  element you actually need.
- **Slow first paint.** Vite/Next compile routes on demand; the first
  `nav` can take 10s+. `wait-for` handles it; raw `sleep` doesn't.
- **`screenshot-element <sel>`** crops to one element — use it when the
  diff is in a specific component, not the whole page.
- **Check `console --errors` before declaring success.** A page can
  render its shell while every data fetch 500s.
