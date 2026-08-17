---
name: keybindings-help
description: Customize keyboard shortcuts, rebind keys, add chord bindings, or modify ~/.claude/keybindings.json.
---

# Keybindings Skill

Create or modify `~/.claude/keybindings.json` to customize keyboard shortcuts.

## CRITICAL: Read Before Write

**Always read `~/.claude/keybindings.json` first** (it may not exist yet). Merge changes with existing bindings — never replace the entire file.

- Use **Edit** tool for modifications to existing files
- Use **Write** tool only if the file does not exist yet

## File Format

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "$docs": "https://code.claude.com/docs/en/keybindings",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor"
      }
    }
  ]
}
```

Always include the `$schema` and `$docs` fields.

## Keystroke Syntax

**Modifiers** (combine with `+`):
- `ctrl` (alias: `control`)
- `alt` (aliases: `opt`, `option`) — note: `alt` and `meta` are identical in terminals
- `shift`
- `meta` (aliases: `cmd`, `command`)

**Special keys**: `escape`/`esc`, `enter`/`return`, `tab`, `space`, `backspace`, `delete`, `up`, `down`, `left`, `right`

**Chords**: Space-separated keystrokes, e.g. `ctrl+k ctrl+s` (1-second timeout between keystrokes)

**Examples**: `ctrl+shift+p`, `alt+enter`, `ctrl+k ctrl+n`

## Unbinding Default Shortcuts

Set a key to `null` to remove its default binding:

```json
{
  "context": "Chat",
  "bindings": {
    "ctrl+s": null
  }
}
```

## How User Bindings Interact with Defaults

- User bindings are **additive** — they are appended after the default bindings
- To **move** a binding to a different key: unbind the old key (`null`) AND add the new binding
- A context only needs to appear in the user's file if they want to change something in that context

## Common Patterns

### Rebind a key
To change the external editor shortcut from `ctrl+g` to `ctrl+e`:
```json
{
  "context": "Chat",
  "bindings": {
    "ctrl+g": null,
    "ctrl+e": "chat:externalEditor"
  }
}
```

### Add a chord binding
```json
{
  "context": "Global",
  "bindings": {
    "ctrl+k ctrl+t": "app:toggleTodos"
  }
}
```

## Behavioral Rules

1. Only include contexts the user wants to change (minimal overrides)
2. Validate that actions and contexts are from the known lists below
3. Warn the user proactively if they choose a key that conflicts with reserved shortcuts or common tools like tmux (`ctrl+b`) and screen (`ctrl+a`)
4. When adding a new binding for an existing action, the new binding is additive (existing default still works unless explicitly unbound)
5. To fully replace a default binding, unbind the old key AND add the new one

## Validation with /doctor

The `/doctor` command includes a "Keybinding Configuration Issues" section that validates `~/.claude/keybindings.json`.

### Common Issues and Fixes

| Issue | Cause | Fix |
| --- | --- | --- |
| `keybindings.json must have a "bindings" array` | Missing wrapper object | Wrap bindings in `{ "bindings": [...] }` |
| `"bindings" must be an array` | `bindings` is not an array | Set `"bindings"` to an array: `[{ context: ..., bindings: ... }]` |
| `Unknown context "X"` | Typo or invalid context name | Use exact context names from the Available Contexts table |
| `Duplicate key "X" in Y bindings` | Same key defined twice in one context | Remove the duplicate; JSON uses only the last value |
| `"X" may not work: ...` | Key conflicts with terminal/OS reserved shortcut | Choose a different key (see Reserved Shortcuts section) |
| `Could not parse keystroke "X"` | Invalid key syntax | Check syntax: use `+` between modifiers, valid key names |
| `Invalid action for "X"` | Action value is not a string or null | Actions must be strings like `"app:help"` or `null` to unbind |

### Example /doctor Output

```
Keybinding Configuration Issues
Location: ~/.claude/keybindings.json
  └ [Error] Unknown context "chat"
    → Valid contexts: Global, Chat, Autocomplete, ...
  └ [Warning] "ctrl+c" may not work: Terminal interrupt (SIGINT)
```

**Errors** prevent bindings from working and must be fixed. **Warnings** indicate potential conflicts but the binding may still work.

## Reserved Shortcuts

### Non-rebindable (errors)
- `ctrl+c` — Cannot be rebound - used for interrupt/exit (hardcoded)
- `ctrl+d` — Cannot be rebound - used for exit (hardcoded)
- `ctrl+m` — Cannot be rebound - identical to Enter in terminals (both send CR)
- `capslock` — Caps Lock is not delivered to terminal applications

### Terminal reserved (errors/warnings)
- `ctrl+z` — Unix process suspend (SIGTSTP) (may conflict)
- `ctrl+\` — Terminal quit signal (SIGQUIT) (will not work)

### macOS reserved (errors)
- `cmd+c` — macOS system copy
- `cmd+v` — macOS system paste
- `cmd+x` — macOS system cut
- `cmd+q` — macOS quit application
- `cmd+w` — macOS close window/tab
- `cmd+tab` — macOS app switcher
- `cmd+space` — macOS Spotlight

## Available Contexts

| Context | Description |
| --- | --- |
| `Global` | Active everywhere, regardless of focus |
| `Chat` | When the chat input is focused |
| `Autocomplete` | When autocomplete menu is visible |
| `Confirmation` | When a confirmation/permission dialog is shown |
| `Help` | When the help overlay is open |
| `Transcript` | When viewing the transcript |
| `HistorySearch` | When searching command history (ctrl+r) |
| `Task` | When a task/agent is running in the foreground |
| `ThemePicker` | When the theme picker is open |
| `Settings` | When the settings menu is open |
| `Tabs` | When tab navigation is active |
| `Attachments` | When navigating image attachments in a select dialog |
| `Footer` | When footer indicators are focused |
| `MessageSelector` | When the message selector (rewind) is open |
| `DiffDialog` | When the diff dialog is open |
| `ModelPicker` | When the model picker is open |
| `Select` | When a select/list component is focused |
| `Plugin` | When the plugin dialog is open |
| `Scroll` | When a scrollable view is focused (fullscreen layout) |
| `Doctor` | When the /doctor diagnostics screen is open |

## Available Actions

| Action | Default Key(s) | Context |
| --- | --- | --- |
| `app:interrupt` | `ctrl+c` | Global |
| `app:exit` | `ctrl+d` | Global |
| `app:toggleTodos` | `ctrl+t` | Global |
| `app:toggleTranscript` | `ctrl+o` | Global |
| `app:toggleBrief` | `ctrl+shift+b` | Global |
| `app:toggleTeammatePreview` | `ctrl+shift+o` | Global |
| `app:toggleTerminal` | (none) | Global |
| `app:redraw` | (none) | Global |
| `app:openFrame` | (none) | Global |
| `history:search` | `ctrl+r` | Global |
| `history:previous` | `up` | Chat |
| `history:next` | `down` | Chat |
| `chat:cancel` | `escape` | Chat |
| `chat:killAgents` | `ctrl+x ctrl+k` | Chat |
| `chat:cycleMode` | `shift+tab` | Chat |
| `chat:modelPicker` | `meta+p` | Chat |
| `chat:fastMode` | `meta+o` | Chat |
| `chat:thinkingToggle` | `meta+t` | Chat |
| `chat:workflowKeywordToggle` | `meta+w` | Chat |
| `chat:submit` | `enter` | Chat |
| `chat:newline` | `ctrl+j` | Chat |
| `chat:undo` | `ctrl+_`, `ctrl+-`, `ctrl+shift+-`, `ctrl+shift+_` | Chat |
| `chat:externalEditor` | `ctrl+x ctrl+e`, `ctrl+g` | Chat |
| `chat:stash` | `ctrl+s` | Chat |
| `chat:imagePaste` | `ctrl+v` | Chat |
| `chat:clearInput` | `ctrl+l` | Chat |
| `chat:clearScreen` | `cmd+k` | Chat |
| `autocomplete:accept` | `tab` | Autocomplete |
| `autocomplete:dismiss` | `escape` | Autocomplete |
| `autocomplete:previous` | `up` | Autocomplete |
| `autocomplete:next` | `down` | Autocomplete |
| `confirm:yes` | `y`, `enter` | Confirmation |
| `confirm:no` | `escape`, `n`, `escape` | Settings |
| `confirm:previous` | `up` | Confirmation |
| `confirm:next` | `down` | Confirmation |
| `confirm:nextField` | `tab` | Confirmation |
| `confirm:previousField` | (none) | Confirmation |
| `confirm:cycleMode` | `shift+tab` | Confirmation |
| `confirm:toggle` | `space` | Confirmation |
| `confirm:toggleExplanation` | `ctrl+e` | Confirmation |
| `tabs:next` | `tab`, `right` | Tabs |
| `tabs:previous` | `shift+tab`, `left` | Tabs |
| `transcript:toggleShowAll` | `ctrl+e` | Transcript |
| `transcript:exit` | `ctrl+c`, `escape`, `q` | Transcript |
| `historySearch:next` | `ctrl+r` | HistorySearch |
| `historySearch:accept` | `escape`, `tab` | HistorySearch |
| `historySearch:cancel` | `ctrl+c` | HistorySearch |
| `historySearch:execute` | `enter` | HistorySearch |
| `historySearch:cycleScope` | `ctrl+s` | HistorySearch |
| `task:background` | `ctrl+b` | Task |
| `theme:toggleSyntaxHighlighting` | `ctrl+t` | ThemePicker |
| `theme:editCustom` | `ctrl+e` | ThemePicker |
| `help:dismiss` | `escape` | Help |
| `attachments:next` | `right` | Attachments |
| `attachments:previous` | `left` | Attachments |
| `attachments:remove` | `backspace`, `delete` | Attachments |
| `attachments:exit` | `down`, `escape` | Attachments |
| `footer:up` | `up`, `ctrl+p` | Footer |
| `footer:down` | `down`, `ctrl+n` | Footer |
| `footer:next` | `right` | Footer |
| `footer:previous` | `left` | Footer |
| `footer:openSelected` | `enter` | Footer |
| `footer:clearSelection` | `escape` | Footer |
| `footer:close` | `x` | Footer |
| `messageSelector:up` | `up`, `k`, `ctrl+p` | MessageSelector |
| `messageSelector:down` | `down`, `j`, `ctrl+n` | MessageSelector |
| `messageSelector:top` | `ctrl+up`, `shift+up`, `meta+up`, `shift+k` | MessageSelector |
| `messageSelector:bottom` | `ctrl+down`, `shift+down`, `meta+down`, `shift+j` | MessageSelector |
| `messageSelector:select` | `enter` | MessageSelector |
| `diff:dismiss` | `escape` | DiffDialog |
| `diff:previousSource` | `left` | DiffDialog |
| `diff:nextSource` | `right` | DiffDialog |
| `diff:back` | (none) | DiffDialog |
| `diff:viewDetails` | `enter` | DiffDialog |
| `diff:previousFile` | `up`, `k` | DiffDialog |
| `diff:nextFile` | `down`, `j` | DiffDialog |
| `modelPicker:decreaseEffort` | `left` | ModelPicker |
| `modelPicker:increaseEffort` | `right` | ModelPicker |
| `modelPicker:thisSessionOnly` | `s` | ModelPicker |
| `select:next` | `down`, `j`, `ctrl+n`, `down`, `j`, `ctrl+n` | Settings |
| `select:previous` | `up`, `k`, `ctrl+p`, `up`, `k`, `ctrl+p` | Settings |
| `select:pageUp` | `pageup` | Select |
| `select:pageDown` | `pagedown` | Select |
| `select:first` | `home` | Select |
| `select:last` | `end` | Select |
| `select:accept` | `space`, `enter` | Settings |
| `select:cancel` | `escape` | Select |
| `plugin:toggle` | `space` | Plugin |
| `plugin:install` | `i` | Plugin |
| `plugin:favorite` | `f` | Plugin |
| `doctor:fix` | `f` | Doctor |
| `permission:toggleDebug` | (none) | Confirmation |
| `settings:search` | `/` | Settings |
| `settings:retry` | `r` | Settings |
| `settings:close` | `enter` | Settings |
| `settings:periodDay` | `d` | Settings |
| `settings:periodWeek` | `w` | Settings |
| `settings:sortByTokens` | `t` | Settings |
| `voice:pushToTalk` | `space` | Chat |
| `scroll:pageUp` | `pageup`, `pageup` | Scroll |
| `scroll:pageDown` | `pagedown`, `pagedown` | Scroll |
| `scroll:lineUp` | `ctrl+p`, `k`, `up`, `wheelup` | Transcript |
| `scroll:lineDown` | `ctrl+n`, `j`, `down`, `wheeldown` | Transcript |
| `scroll:top` | `g`, `home`, `ctrl+home`, `g`, `home` | Transcript |
| `scroll:bottom` | `shift+g`, `end`, `ctrl+end`, `shift+g`, `end` | Transcript |
| `scroll:halfPageUp` | `ctrl+u`, `ctrl+u` | Settings |
| `scroll:halfPageDown` | `ctrl+d`, `ctrl+d` | Settings |
| `scroll:fullPageUp` | `ctrl+b`, `b`, `shift+space`, `b` | Transcript |
| `scroll:fullPageDown` | `ctrl+f`, `space`, `space` | Transcript |
| `selection:copy` | `ctrl+shift+c`, `cmd+c` | Scroll |
| `selection:clear` | (none) | Unknown |
| `selection:extendLeft` | `shift+left` | Scroll |
| `selection:extendRight` | `shift+right` | Scroll |
| `selection:extendUp` | `shift+up` | Scroll |
| `selection:extendDown` | `shift+down` | Scroll |
| `selection:extendLineStart` | `shift+home` | Scroll |
| `selection:extendLineEnd` | `shift+end` | Scroll |
