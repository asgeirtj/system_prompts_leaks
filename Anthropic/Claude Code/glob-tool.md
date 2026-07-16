<!-- Glob is NOT in the main-agent tool set as of Claude Code 2.1.211 (removed ~April 2026). It is available only to search subagents (Explore etc.). Verified against a 2.1.211 main-agent capture: 28 tools, no Glob. This is the tool definition subagents receive. -->

# The `Glob` Tool

A fast **filename / path matching** tool. It answers the question: *"Which files exist whose
path matches this pattern?"*

Glob searches file **names and paths** — it does **not** look inside files. (Its sibling,
`Grep`, searches file **contents**. See `grep-tool.md`.)

---

## When to use it

- Locating files by name or extension (e.g. all `*.test.ts` files).
- Discovering the structure/layout of a codebase before diving in.
- Finding the most recently modified files matching a pattern.
- Any time you'd reach for `find . -name ...` or shell globbing in a terminal.

> **Important:** Prefer this tool over running `find` or `ls` through the Bash tool for file
> discovery. It is faster, works on any codebase size, and returns results sorted usefully.

---

## Parameters

| Parameter | Type   | Required | Description                                                                                  |
| --------- | ------ | -------- | -------------------------------------------------------------------------------------------- |
| `pattern` | string | **Yes**  | The glob pattern to match files against (e.g. `**/*.js`, `src/**/*.{ts,tsx}`).               |
| `path`    | string | No       | The directory to search within. Defaults to the current working directory. **Do not** pass `undefined` or `null` to mean "current directory" — simply omit the parameter. |

---

## Glob pattern syntax

Glob patterns are simpler than regular expressions. The most useful tokens:

| Token       | Meaning                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| `*`         | Matches any run of characters **except** a path separator (`/`).        |
| `**`        | Matches any number of directories, recursively (including zero).        |
| `?`         | Matches exactly one character.                                          |
| `{a,b,c}`   | Matches any of the comma-separated alternatives (brace expansion).      |
| `[abc]`     | Matches one character from the set.                                     |

### Common patterns

- `*.md` — every Markdown file in the search directory (top level only).
- `**/*.md` — every Markdown file at **any** depth.
- `src/**/*.js` — all `.js` files anywhere under `src/`.
- `**/*.{ts,tsx}` — all TypeScript and TSX files, recursively.
- `**/test_*.py` — all Python files beginning with `test_`, at any depth.
- `?[0-9]*.log` — log files whose second character is a digit.

---

## Output

- Returns a **list of matching file paths**.
- Results are **sorted by modification time**, most recently modified first. This is handy:
  the file you just touched (or the one most relevant to recent work) tends to appear at the
  top.
- If nothing matches, an empty result is returned (not an error).

---

## Examples

**All TypeScript files anywhere in the project:**
```json
{ "pattern": "**/*.ts" }
```

**Test files under a specific directory:**
```json
{
  "pattern": "**/*.test.{ts,tsx}",
  "path": "packages/web/src"
}
```

**Config files at the repo root:**
```json
{ "pattern": "*.{json,yml,yaml,toml}" }
```

**Every README, regardless of depth:**
```json
{ "pattern": "**/README.md" }
```

---

## Glob vs. Grep — which one?

| You want to…                                      | Use      |
| ------------------------------------------------- | -------- |
| Find files **named** a certain way                | `Glob`   |
| Find files **containing** certain text            | `Grep`   |
| List all `*.py` files                             | `Glob`   |
| Find which `*.py` files call `requests.get`       | `Grep` (with `glob: "*.py"`) |
| Understand directory layout                       | `Glob`   |
| Read the matching lines of code                   | `Grep` (`output_mode: "content"`) |

A common workflow is to **chain them**: use `Glob` to narrow to a set of candidate files,
then `Grep` to search their contents. Note that `Grep` also accepts its own `glob` parameter,
so for simple "search these file types" cases you may not need a separate `Glob` call at all.

---

## Tips & gotchas

- **`*` does not cross directory boundaries; `**` does.** `src/*.js` matches files directly in
  `src/`, while `src/**/*.js` matches `.js` files in `src/` and every subdirectory.
- **Omit `path` for the whole project.** Don't pass an empty string or a placeholder — just
  leave it out to search from the working directory.
- **Sorted by recency.** Because results are ordered by modification time, `Glob` is a quick
  way to answer "what did I change most recently that matches X?"
- **For broad, open-ended searches** across many directories and naming conventions, consider
  delegating to an exploration agent rather than issuing many individual `Glob` calls.
