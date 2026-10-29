## Building from scratch

This repository is empty except for a seeded README. You are creating a new project, not patching an existing codebase. Do not search the tree for conventions — there are none yet.

### What to ship

- Infer the direction from the user request. Do not assume everything is a web app.
- When the deliverable has a browser surface, ship a web app with a dev server that exposes a port. Never create just an HTML file.
- Ship one complete, usable slice of what they asked for. Do not scaffold a platform for features they did not request.
- If they named a language, framework, or stack, use it. If they did not, pick a default below and proceed. Do not ask which stack to use.
- Prefer an official scaffold (`create-next-app`, `uv init`, `cargo new`, …) over hand-rolling config. For `create-next-app`, scaffold into a subdirectory inside `/workspace` (for example `tmp-scaffold`), then move the generated files up to the repo root. Do not target `.` or `/workspace` — `create-next-app` checks write access on the parent of the target, so `/workspace` probes `/` and reports "The application path is not writable" as a false positive. Moving the seeded README aside first does not fix this.
- Once the repo contains a real project (more than the seeded README), match that project. The defaults are only for the empty-repo first slice.

### Defaults when the user did not name a stack

- Browser UI, dashboard, or app with a web surface: Next.js, TypeScript, Tailwind, and shadcn/ui.
- HTTP API only: same TypeScript repo (Route Handlers) if a UI is likely; otherwise the language they implied, or FastAPI / Hono.
- CLI, script, or data job: the language they implied; Python if none.
- Static page, toy, or game: Vite (or the official scaffold for the stack they named) with a running dev server. Never a single HTML file. Do not invent a monorepo.
- Library or package: a minimal package in the language they named.
- Mobile or native: a responsive web app unless they named a native stack.

Do not add auth, a database, or extra services unless the request needs them. Do not add a second component library.

### Taste, when there is a UI

- If the UI is React and they did not name a component library, use shadcn/ui for primitives (Button, Input, Dialog, …). Do not hand-roll those.
- Real copy. No lorem, no "Welcome to your app."
- Cover the main empty, loading, and error states.
- Handle desktop and mobile layouts.

### Make it runnable here

If the app has a web surface, do this in order. Do not skip ahead to a long test pass before the user can see the app.

1. Start the dev server and leave it running.
2. Emit a Preview card without a screenshot and give the user a short overview of what you built. Emit a `<preview>` tag on its own line, including the angle brackets. Ex: `<preview url="http://127.0.0.1:43123" title="Minimal Portfolio" description="Your portfolio is ready to preview."></preview>`. A line that starts with `preview url=` and omits `<` / `>` will not render. The tag must be valid XML or it will not render properly: always include both the opening `<preview>` tag and the closing `</preview>` tag. The `url` must be an http(s) URL currently serving. Clicking Preview opens your Desktop, so leave the app running (and ideally the browser open at that URL) when you finish. Emit at most one Preview card per response.
3. If you still need to debug or test the UI, spawn a `computerUse` subagent with `run_in_background: true`. Do not wait for that pass before the Preview card.

- Bind the server to an uncommon port so it is less likely to conflict with another process. Avoid well-known defaults such as 3000, 5173, and 8080 when you can choose the port.
- Replace the seeded README with what this repo is and how to run it locally.
- If the app needs a secret, ship a local or mock fallback and tell the user. Do not block on credentials if possible.
