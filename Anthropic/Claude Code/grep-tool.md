<!-- Grep is NOT in the main-agent tool set as of Claude Code 2.1.211 (removed ~April 2026). It is available only to search subagents (Explore etc.). Verified against a 2.1.211 main-agent capture: 28 tools, no Grep. This is the tool definition subagents receive. -->

# The `Grep` Tool

A powerful **content search** tool built on top of [ripgrep](https://github.com/BurntSushi/ripgrep)
(`rg`). It answers the question: *"Which files contain text matching this pattern, and what
are the matching lines?"*

Grep searches **inside** files. (Its sibling, `Glob`, searches file **names**. See
`glob-tool.md`.)

---

## When to use it

- Finding where a function, variable, class, or string is defined or used.
- Locating all occurrences of a pattern across a codebase.
- Counting how many times something appears.
- Any time you'd reach for `grep`, `rg`, `egrep`, or `grep -r` in a shell.

> **Important:** Always prefer this tool over running `grep`/`rg` through the Bash tool.
> It is purpose-built, respects `.gitignore` by default, and returns results in a clean,
> structured form. Running `grep` in Bash is discouraged.

---

## Parameters

| Parameter      | Type    | Required | Description                                                                                         |
| -------------- | ------- | -------- | --------------------------------------------------------------------------------------------------- |
| `pattern`      | string  | **Yes**  | A regular expression to search for. Full regex syntax is supported (e.g. `log.*Error`, `function\s+\w+`). |
| `path`         | string  | No       | File or directory to search in. Defaults to the current working directory.                          |
| `glob`         | string  | No       | Glob pattern to filter which files are searched (e.g. `*.js`, `*.{ts,tsx}`). Maps to ripgrep's `--glob`. |
| `type`         | string  | No       | File type to search (e.g. `js`, `py`, `rust`, `go`). Often more efficient than `glob` for standard types. |
| `output_mode`  | string  | No       | One of `content`, `files_with_matches` (default), or `count`. Controls what is returned (see below). |
| `-i`           | boolean | No       | Case-insensitive search.                                                                            |
| `-n`           | boolean | No       | Show line numbers. Only applies when `output_mode` is `content`.                                    |
| `-A`           | number  | No       | Lines of context to show **A**fter each match. (`content` mode only.)                               |
| `-B`           | number  | No       | Lines of context to show **B**efore each match. (`content` mode only.)                              |
| `-C`           | number  | No       | Lines of context to show before **and** after each match. (`content` mode only.)                    |
| `multiline`    | boolean | No       | Enable multiline mode so `.` matches newlines and patterns can span lines. Default `false`.         |
| `head_limit`   | number  | No       | Limit output to the first N lines/entries (like piping to `head -N`). Works across all output modes. |

---

## Output modes explained

The `output_mode` parameter changes *what* you get back. Picking the right one keeps results
focused:

- **`files_with_matches`** *(default)* — Returns just the list of file paths that contain at
  least one match. Best when you only need to know *where* something lives. Cheapest output.

- **`content`** — Returns the actual matching lines (and optional surrounding context via
  `-A`/`-B`/`-C`). This is the mode that supports `-n`, `-A`, `-B`, and `-C`. Use it when you
  need to *read* the matches, not just locate the files.

- **`count`** — Returns the number of matches per file. Use it to gauge how widespread a
  pattern is before diving in.

---

## Regex notes

- The `pattern` is a regular expression, **not** a literal string. Characters like `.`, `(`,
  `)`, `{`, `[`, `*`, `+`, `?`, `|`, `\` have special meaning.
- To match them literally, escape with a backslash. Example: to find the literal text
  `interface{}` in Go, write the pattern as `interface\{\}`.
- Ripgrep uses the Rust regex engine. By default, patterns are matched **per line** — a
  pattern cannot span multiple lines unless `multiline: true` is set.

---

## Examples

**Find every file that mentions `TODO` (just the file list):**
```json
{ "pattern": "TODO" }
```

**Show the matching lines with line numbers, only in JavaScript files:**
```json
{
  "pattern": "useState",
  "glob": "*.js",
  "output_mode": "content",
  "-n": true
}
```

**Case-insensitive search with 3 lines of surrounding context:**
```json
{
  "pattern": "deprecated",
  "output_mode": "content",
  "-i": true,
  "-C": 3
}
```

**Count how often `console.log` appears, per file, in TypeScript sources:**
```json
{
  "pattern": "console\\.log",
  "type": "ts",
  "output_mode": "count"
}
```

**Multiline search — a `struct` block spanning several lines:**
```json
{
  "pattern": "struct \\{[\\s\\S]*?name",
  "multiline": true,
  "output_mode": "content"
}
```

---

## Tips & gotchas

- **Filter early.** Combining `pattern` with `glob` or `type` is far faster and cleaner than
  searching everything and sorting through noise.
- **`type` vs `glob`.** `type` uses ripgrep's built-in language definitions (it knows which
  extensions belong to `python`, `rust`, etc.). `glob` gives you precise control over file
  patterns. Use whichever expresses your intent more clearly.
- **Escaping in JSON.** Because patterns travel through JSON, a backslash in the regex must be
  written as `\\` in the JSON string (e.g. `\\.` to match a literal dot).
- **`.gitignore` aware.** Like ripgrep, the tool skips ignored files (e.g. `node_modules`) by
  default — usually what you want.
- **For exploration, pair with `Glob`.** Use `Glob` to discover candidate files by name, then
  `Grep` to search their contents — or hand both off to an agent for broad fan-out searches.
