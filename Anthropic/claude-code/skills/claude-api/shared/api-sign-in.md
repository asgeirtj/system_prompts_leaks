# Signing in to the Claude API on a developer's machine

The rules are in `SKILL.md` -> Authentication (Quick Reference). This file has the steps and the cases behind them. Profiles, scopes and handing a credential to a subprocess: `shared/anthropic-cli.md`.

## The steps

1. **Look.** Run `ant auth status` and read all of it. It always exits 0 and sends no request. Only the `Credentials` block counts (the blocks after it have `(active)` rows even when nobody is signed in):
   - No `(active) *` row, but a line in brackets such as `(profile "default" not configured ...)` or `(... configured but not logged in ...)`: nobody is signed in, whatever the paths above it say.
   - `(active) * Profile (user_oauth)`: signed in. An `expires` time in the past is normal; the next call renews the token.
   - `(active) * ANTHROPIC_API_KEY`: a key is in use. If it works, leave it. A profile row under it plus a warning means the key overrides the sign-in.
2. **Sign in.** In Claude Code, ask the user to type `! ant auth login` at the prompt: the `!` prefix runs the command in this session, outside the Bash sandbox and with no permission prompt. A terminal of their own works too. Don't run the login yourself unless they ask. Use the plain command: no `--admin` or `--scope` unless the user asked for Admin API work. The output lands in the conversation: a URL with `paste the code here` and a `Code:` prompt, then the organization, email, workspace and file paths; no token. That URL and the code prompt work only in a terminal of the user's own. Tell them to approve in the tab that opens and to paste nothing into this chat.
3. **Test.** `ant models list` is free and shows that the credential is accepted. Only a Messages call shows whether the organization has credits: run the user's code, or `ant messages create --model claude-haiku-5-5 --max-tokens 16 --message '{role: user, content: "Say hi"}'`.

## What the sign-in does

- The user signs in at platform.claude.com and picks an organization and a workspace. The sign-in sees only that workspace's resources.
- It writes `configs/default.json` and `credentials/default.json` under `~/.config/anthropic/` (`%APPDATA%\Anthropic` on Windows; `ant auth status` prints the paths). The second is a plain file, readable only by the user, that holds the tokens. Leave the store where it is: don't point `ANTHROPIC_CONFIG_DIR` at the project, and don't copy, commit or read the file.
- It creates no API key, and with the default scopes it can't. It adds no credits. Usage is billed to the Console organization, as with a key.
- It runs out some weeks after the login, however much it is used. `ant auth logout` removes it from this machine.
- **Claude Code's own billing stays as it is** while Claude Code has a working `/login` or another credential of its own. Without one (none was ever made, or it has died), or with `ANTHROPIC_PROFILE` exported, its next launch uses this sign-in with no prompt, and its usage is billed to the API organization; `/status` then shows a Profile row. Order: `https://code.claude.com/docs/en/authentication`.
- If Claude Code itself signed in to the Console without a key, it uses this same profile: `ant auth status` shows it as signed in, and `ant auth logout` signs Claude Code out too. On a managed machine that sets `forceLoginOrgUUID` or `forceLoginMethod`, Claude Code refuses to start while a profile and a saved Console key are both there.

## Cases

- **No Console account.** A claude.ai plan (Pro, Max, Team) doesn't include API usage; the Console is a separate account with its own billing. The browser step of `ant auth login` lets them create one, so the sign-in is still the first step.
- **No credits.** The call fails with "Your credit balance is too low to access the Anthropic API". The sign-in is fine: don't sign in again or switch to a key, which fails the same way in the same organization. The user buys credits in the Console under Billing.
- **A tool that needs a key.** A tool that reads only `ANTHROPIC_API_KEY` needs a real key. The user creates it at `https://platform.claude.com/settings/keys` and sets it themselves. The sign-in's token isn't a key: never put it in `ANTHROPIC_API_KEY`. An exported key overrides the sign-in for everything in that shell, so set it for that tool alone where possible.
- **Code that runs elsewhere.** A deploy target, CI, a server or a container gets a key in that platform's secret store, or Workload Identity Federation (`SKILL.md` -> Workload Identity Federation). Never copy the sign-in's file or token there.

## Installing `ant`

- macOS: `brew install anthropics/tap/ant`
- With Go, any OS: `go install github.com/anthropics/anthropic-cli/v2/cmd/ant@latest`. Add Go's bin folder to `PATH` (`$(go env GOPATH)/bin` unless `GOBIN` is set).
- Linux/WSL: the command at `https://platform.claude.com/docs/en/cli-sdks-libraries/cli/quickstart`. It names a release, so fetch the page and never make a version up. It uses `sudo`, so the user runs it in a terminal of their own.
- Windows: the docs give no native route. Use WSL or `go install`; `https://github.com/anthropics/anthropic-cli/releases` also has Windows zips.
- **Apache Ant.** `Buildfile: build.xml does not exist!` or a message about a missing target comes from the Java build tool of the same name. Tell the user before you install: the first `ant` on `PATH` wins (`which -a ant` lists them). Keep both by calling Anthropic's by its full path, for example `$(go env GOPATH)/bin/ant auth login`.

## When the sign-in fails

| What you see | What it means | What to do |
|---|---|---|
| `couldn't launch browser automatically` | `ant` couldn't open a browser | If this machine has one: they type `! ant auth login --no-browser --callback-port 8765` and open the URL it prints, which comes back to localhost and needs no code. If not: "No browser" below |
| `timed out waiting for authorization` | Nobody approved within 5 minutes, or the browser couldn't reach the login | They type `! ant auth login` again and approve in the tab |
| `read code from stdin: EOF` | A login that waits for a pasted code ran with no keyboard input, as your commands and `!` commands do | The user runs it in a terminal of their own |
| `invalid_grant` with "re-run `ant auth login`", or a 401 on a sign-in that used to work | The sign-in has run out | Sign in again. Don't open the credentials file to find out |
| 401 while `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN` is set | That variable overrides the sign-in and is what the API refuses | `unset` it, or the user replaces the key |
| `Could not resolve authentication method` (SDK) | The SDK found no credential | Step 1. If `ant` is signed in, update the SDK: an older release may not read the sign-in |

## No browser on this machine

Never take a login code, a key or a token through this chat, and don't keep a login waiting to feed a code into it.

- **SSH.** The user runs `ant auth login --no-browser` in a terminal of their own on that host, opens the URL on their own computer and pastes the code into that terminal. Or, with a port forwarded (`ssh -L 8765:localhost:8765 <host>`), `ant auth login --no-browser --callback-port 8765` needs no pasted code.
- **Only this chat (Claude Code on the web).** Don't start a login. The user creates a key of its own, which they can revoke, sets `ANTHROPIC_API_KEY` in the settings of a cloud environment that only they use (everyone who uses an environment can read its values), and starts a new session. That doesn't change how the session itself is billed.
