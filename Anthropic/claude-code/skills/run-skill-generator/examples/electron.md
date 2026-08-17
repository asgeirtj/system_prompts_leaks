# Example: Electron / desktop GUI app

Electron apps have a window. A future agent in a headless container
can't see a window. So your deliverable here is not a markdown file
that says "`npm start` opens a window" — it's a **driver script** that
launches the app under xvfb, exposes a REPL of commands (click, type,
screenshot), and lets an agent poke the UI by sending lines of text.

The skill's `SKILL.md` then becomes a short manual for that driver.

## What you're building

```
apps/desktop/
  .claude/skills/run-desktop/
    SKILL.md               ← short. "run the driver, here are the commands"
    driver.mjs             ← REPL: stdin commands → Playwright actions
```

The driver IS the product. Without it, the skill describes a GUI an
agent can never touch.

**Graduation path:** if the driver grows launch helpers the project's
real e2e suite wants to share, move it to `e2e-playwright/driver.mjs`
(or `scripts/drive.mjs`) and update the skill's paths. The skill stays
at `.claude/skills/run-desktop/`; the driver finds a better home.

## Step 1 — get the app to launch AT ALL under xvfb

This is usually the hardest part and produces most of the Gotchas. The
README will say "macOS/Windows only." Ignore that. Install xvfb + the
Chromium shared libs, find the Electron binary, and launch it:

```bash
apt-get install -y xvfb libnss3 libgbm1 libasound2t64 libgtk-3-0 \
  libxss1 libxkbcommon0 libatk-bridge2.0-0 libcups2 libdrm2

# Build the app first. Often the "dev" script is electron-forge which
# does a Vite/webpack build THEN launches. You want just the build:
npm install
npx electron-forge start &   # builds .vite/build/ or dist/
sleep 20 && kill %1          # kill it once built — you'll launch yourself

# Now try the raw launch
xvfb-run -a node -e "
  const { _electron } = require('playwright-core');
  _electron.launch({
    executablePath: './node_modules/electron/dist/electron',
    args: ['--no-sandbox', '.'],
    timeout: 30000,
  }).then(app => {
    console.log('launched, windows:', app.windows().map(w => w.url()));
    return app.close();
  });
"
```

Iterate until it launches. Each missing `.so` → one more `apt-get`
package → one more line in Prerequisites. Each launch timeout → check
the `nodeCliInspect` fuse isn't disabled, check the build output exists.

**`--no-sandbox` is almost always needed in containers.** Electron's
sandbox needs CAP_SYS_ADMIN or user namespaces. Neither by default.

## Step 2 — build the REPL driver

Once you can launch it, turn that throwaway script into a REPL. Start
minimal — you will add commands as you need them. **The REPL is the
right shape** because an agent can run it inside tmux and iterate
without relaunching the (slow) app on every interaction.

```javascript
// .claude/skills/run-<unit>/driver.mjs
// REPL driver for <app>. Run under xvfb on headless Linux.
// Designed for agents: wrap in tmux, send-keys commands, capture-pane output.
import { _electron as electron } from 'playwright-core';
import * as readline from 'node:readline';
import * as fs from 'node:fs';
import * as path from 'node:path';

const APP_DIR = path.resolve(import.meta.dirname, '../../..');
const SHOT_DIR = process.env.SCREENSHOT_DIR || '/tmp/shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

let app = null;
let page = null;   // the window/page you actually interact with

const electronBin = process.platform === 'darwin'
  ? path.join(APP_DIR, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron')
  : path.join(APP_DIR, 'node_modules/electron/dist/electron');

const COMMANDS = {
  async launch() {
    if (app) return console.log('already launched');
    app = await electron.launch({
      executablePath: electronBin,
      args: ['--no-sandbox', APP_DIR],
      env: { ...process.env, DISPLAY: process.env.DISPLAY || ':99' },
      timeout: 30_000,
    });
    // Electron has no clean "loaded" signal — this sleep is a blind guess.
    // Replace with a poll once you know what ready looks like for this app:
    // wait until windows() includes the expected URL, or waitForSelector on firstWindow().
    await new Promise(r => setTimeout(r, 8_000));
    // Find the real UI page. Often NOT firstWindow() — may be a
    // splash screen, or the real content is in a BrowserView overlay.
    page = app.windows().find(w => !w.url().startsWith('devtools://'))
        ?? await app.firstWindow();
    console.log('launched.', app.windows().length, 'windows:');
    for (const w of app.windows()) console.log(' ', w.url());
  },

  async ss(name) {
    if (!page) return console.log('ERROR: launch first');
    const f = path.join(SHOT_DIR, (name || `ss-${Date.now()}`) + '.png');
    await page.screenshot({ path: f });
    console.log('screenshot:', f);
  },

  // Click via evaluate(), NOT locator.click(). If the content lives in a
  // BrowserView layered over the main window, Playwright's coordinate
  // math hits the wrong layer. DOM .click() always works.
  async click(sel) {
    if (!page) return console.log('ERROR: launch first');
    const r = await page.evaluate(s => {
      const el = document.querySelector(s);
      if (!el) return 'NOT_FOUND';
      el.click(); return 'OK';
    }, sel);
    console.log('click', sel, '→', r);
  },

  async 'click-text'(text) {
    if (!page) return console.log('ERROR: launch first');
    const r = await page.evaluate(t => {
      const els = [...document.querySelectorAll('button, a, [role="button"]')];
      const el = els.find(e => e.textContent?.trim() === t)
              ?? els.find(e => e.textContent?.includes(t));
      if (!el) return 'NOT_FOUND';
      el.click(); return 'OK: ' + el.tagName;
    }, text);
    console.log('click-text', JSON.stringify(text), '→', r);
  },

  async type(text)  { if (page) await page.keyboard.type(text, { delay: 30 }); },
  async press(key)  { if (page) await page.keyboard.press(key); },

  async wait(sel) {
    if (!page) return console.log('ERROR: launch first');
    try { await page.waitForSelector(sel, { timeout: 10_000 }); console.log('found:', sel); }
    catch { console.log('TIMEOUT:', sel); }
  },

  async eval(expr) {
    if (!page) return console.log('ERROR: launch first');
    try { console.log(JSON.stringify(await page.evaluate(expr))); }
    catch (e) { console.log('ERROR:', e.message); }
  },

  async text(sel) {
    if (!page) return console.log('ERROR: launch first');
    console.log(await page.evaluate(
      s => (s ? document.querySelector(s) : document.body)?.innerText ?? '(null)',
      sel || null));
  },

  // Introspection: essential for figuring out which window/webContents
  // actually has the UI. Electron apps often spawn several.
  async windows() {
    if (!app) return console.log('ERROR: launch first');
    for (const w of app.windows()) console.log(' ', w.url());
    const wcs = await app.evaluate(({ webContents }) =>
      webContents.getAllWebContents().map(w => ({ id: w.id, type: w.getType(), url: w.getURL() })));
    console.log('webContents:');
    for (const w of wcs) console.log(` [${w.id}] ${w.type}: ${w.url}`);
  },

  async quit() { if (app) await app.close().catch(()=>{}); app = null; page = null; },
  help() { console.log('commands:', Object.keys(COMMANDS).join(', ')); },
};

// Stop Electron from stealing stdin — use the raw fd.
const stdin = fs.createReadStream(null, { fd: fs.openSync('/dev/stdin', 'r') });
const rl = readline.createInterface({ input: stdin, output: process.stdout, prompt: 'driver> ' });

rl.on('line', async line => {
  const [cmd, ...rest] = line.trim().split(/\s+/);
  if (!cmd) return rl.prompt();
  const fn = COMMANDS[cmd];
  if (!fn) { console.log('unknown:', cmd, '— try: help'); return rl.prompt(); }
  try { await fn(rest.join(' ')); } catch (e) { console.log('ERROR:', e.message); }
  if (cmd === 'quit') { rl.close(); process.exit(0); }
  rl.prompt();
});
rl.on('close', async () => { await COMMANDS.quit(); process.exit(0); });

console.log('<app> driver — "help" for commands, "launch" to start');
rl.prompt();
```

**This is a starting skeleton.** As you try to reach interesting parts
of the app you'll add app-specific commands: navigate to a particular
view, focus a weird input type, bypass an auth gate, whatever. Those
commands encode hard-won knowledge — keep them.

## Step 3 — use it yourself, via tmux

Run the driver the same way the next agent will:

```bash
tmux new-session -d -s app -x 200 -y 50
tmux send-keys -t app 'cd /workspace/apps/desktop && xvfb-run -a node .claude/skills/run-desktop/driver.mjs' Enter
timeout 20 bash -c 'until tmux capture-pane -t app -p | grep -q "driver>"; do sleep 0.2; done'
tmux send-keys -t app 'launch' Enter
timeout 60 bash -c 'until tmux capture-pane -t app -p | grep -q "launched"; do sleep 0.2; done'
tmux send-keys -t app 'ss 01-landing' Enter
timeout 10 bash -c 'until tmux capture-pane -t app -p | grep -q "screenshot:"; do sleep 0.2; done'
tmux send-keys -t app 'windows' Enter    # which page has the real UI?
tmux capture-pane -t app -p
```

Then actually open `/tmp/shots/01-landing.png`. Is it the app? Is it
blank? Is it a login screen? Each of these tells you what to do next.

Keep going — click into the main feature, fill a form, see the result
show up, screenshot it. The driver grows whatever commands you need
(`focus-input`, `goto-settings`, `login-as-test-user`…). When one real
flow works end-to-end, you're done building and ready to write.

## Step 4 — write SKILL.md

Keep it short. The driver is the meat; `SKILL.md` is the manual.
Structure that works:

> ---
> name: run-desktop
> description: Build, run, and drive the <app> Electron desktop app. Use when asked to start the desktop app, take a screenshot of it, build it, or interact with its UI.
> ---
>
> <App> is an Electron desktop app. For agent/automated use, drive it
> via the Playwright REPL at `.claude/skills/run-desktop/driver.mjs`
> under xvfb. Launch is slow (~10s) and the interesting UI lives in a
> BrowserView, not the main window — the driver handles both.
>
> All paths are relative to `apps/desktop/`.
>
> ## Prerequisites
>
> ```bash
> apt-get install -y xvfb libnss3 libgbm1 libasound2t64 libgtk-3-0 \
>   libxss1 libxkbcommon0 libatk-bridge2.0-0 libcups2 libdrm2
> ```
>
> ## Build
>
> ```bash
> npm install
> npx electron-forge start   # builds .vite/build/ — Ctrl-C once built
> # <any patch you had to apply: sed a feature gate, etc.>
> ```
>
> ## Run (agent path)
>
> ```bash
> cd apps/desktop
> xvfb-run -a node .claude/skills/run-desktop/driver.mjs
> ```
>
> Wrap in tmux for interactive use:
>
> ```bash
> tmux new-session -d -s app -x 200 -y 50
> tmux send-keys -t app 'cd apps/desktop && xvfb-run -a node .claude/skills/run-desktop/driver.mjs' Enter
> timeout 20 bash -c 'until tmux capture-pane -t app -p | grep -q "driver>"; do sleep 0.2; done'
> tmux send-keys -t app 'launch' Enter
> timeout 60 bash -c 'until tmux capture-pane -t app -p | grep -q "launched"; do sleep 0.2; done'
> tmux send-keys -t app 'ss landing' Enter
> tmux capture-pane -t app -p
> ```
>
> Screenshots land in `/tmp/shots/` (override: `SCREENSHOT_DIR`).
>
> ### Commands
>
> | command | what it does |
> |---|---|
> | `launch` | launch the app, wait for windows |
> | `ss [name]` | screenshot → `/tmp/shots/<name>.png` |
> | `click <css-sel>` | click element (via DOM, not coords — see Gotchas) |
> | `click-text <text>` | click button/link containing text |
> | `type <text>` / `press <key>` | keyboard input |
> | `wait <css-sel>` | wait for element, 10s timeout |
> | `eval <js>` | evaluate in the page, print JSON |
> | `text [css-sel]` | print innerText |
> | `windows` | list all windows + webContents (find the real UI) |
> | `quit` | close app, exit |
>
> Plus any app-specific commands you built: `<your-command>` — <what it does>.
>
> ## Run (human path)
>
> ```bash
> npm start   # opens a window; useless headless. Ctrl-C to quit.
> ```
>
> ## Gotchas
>
> - **<the specific weird thing you hit>** — <why> → <fix/workaround>
> - <etc. — only things you actually hit, not generic advice>
>
> ## Troubleshooting
>
> - **Launch timeout (30s):** build output missing? → re-run the build
>   step. `nodeCliInspect` fuse disabled? → Playwright can't attach;
>   don't disable that fuse in dev builds.
> - **"Missing X server":** forgot `xvfb-run`. Headless Linux needs it.
> - **Stale Xvfb locks:** `rm -f /tmp/.X*-lock; pkill Xvfb`
> - <anything else you actually hit>

## Obstacles you will hit (and they go in Gotchas)

These are real patterns from real Electron apps. You'll hit some subset:

- **`firstWindow()` gives you a splash/loading screen,** not the app.
  Wait longer, or find the right page by URL, or wait for a specific
  selector that only appears when the app is actually ready.

- **The real UI is in a BrowserView, not a BrowserWindow.** Playwright
  sees it as a separate "window" with a different URL. The `windows`
  command exists exactly for figuring this out. `getBrowserViews()`
  may also return empty on newer Electron — use
  `webContents.getAllWebContents()` instead.

- **`locator.click()` clicks the wrong thing.** Playwright computes
  click coordinates relative to the main window. If your content is in
  a BrowserView overlay, those coordinates hit the window behind it.
  The driver skeleton uses `page.evaluate(el => el.click())` for this
  reason — DOM click bypasses coordinates entirely.

- **Feature gates block the thing you need to test.** The app checks a
  plan tier, or an env flag, or a feature flag baked into SSR HTML.
  Find where the check happens (grep the built output for the gate
  name) and patch it for your local run — a `sed` on the build output,
  an env var override, or (for SSR-embedded flags) intercept the
  response via CDP `Fetch.enable` and rewrite it in-flight. Document
  exactly what you patched and why.

- **contentEditable inputs** (ProseMirror, Tiptap, Slate) aren't
  `<textarea>`. `fill()` won't work. Focus the element, then use
  `keyboard.type()`. Add a `focus <sel>` command if the app has these.

- **Electron steals stdin.** The `fs.openSync('/dev/stdin', 'r')` +
  `createReadStream` trick in the skeleton protects your REPL's input.

- **Native modules fail to load** (keychain, notifications, etc.).
  Usually non-fatal — the core app runs, those features no-op. Note it
  and move on.
