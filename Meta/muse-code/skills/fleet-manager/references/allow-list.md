# Allow-list template

Split the helper by subcommand, never allow the bare helper: read and steer
verbs may run without a prompt; anything that starts, interrupts, ends,
adopts, attaches, connects or forgets stays on the permission prompt. The
guards are soft, so this split is the safety. Replace `<fleet>` with the
absolute path the skill read gave you.

## Allow without a prompt (read)

```text
python3 <fleet> doctor *
python3 <fleet> detect *
python3 <fleet> context *
python3 <fleet> list *
python3 <fleet> machines
python3 <fleet> status *
python3 <fleet> read *
python3 <fleet> dialog *
python3 <fleet> resources *
python3 <fleet> fetch *
python3 <fleet> wait *
python3 <fleet> events *
```

## Allow without a prompt (steer) — optional, per taste

```text
python3 <fleet> approve *
python3 <fleet> deny *
python3 <fleet> send * --keys *
```

No text-`send` glob: `send * …` cannot tell the notification form from
`--type` (flags may follow the text) and an allow match wins, so every
`send` that carries text stays on the prompt. `--automated` labels what is
typed; it grants nothing.

## Always prompt (guarded)

```text
python3 <fleet> open *
python3 <fleet> stop *
python3 <fleet> close *
python3 <fleet> adopt *
python3 <fleet> attach *
python3 <fleet> connect *
python3 <fleet> forget *
python3 <fleet> send * --type
```

## Claude Code settings template

Claude Code matches `Bash(...)` rules by command prefix (`:*` means "and
anything after"), so each rule names the helper's path plus one verb.
Replace `<fleet>` with the absolute path and put the block in
`.claude/settings.json` (project) or `~/.claude/settings.json` (user):

```json
{
  "permissions": {
    "allow": [
      "Bash(python3 <fleet> doctor:*)",
      "Bash(python3 <fleet> detect:*)",
      "Bash(python3 <fleet> context:*)",
      "Bash(python3 <fleet> list:*)",
      "Bash(python3 <fleet> machines)",
      "Bash(python3 <fleet> status:*)",
      "Bash(python3 <fleet> read:*)",
      "Bash(python3 <fleet> dialog:*)",
      "Bash(python3 <fleet> resources:*)",
      "Bash(python3 <fleet> fetch:*)",
      "Bash(python3 <fleet> wait:*)",
      "Bash(python3 <fleet> events:*)"
    ],
    "ask": [
      "Bash(python3 <fleet> open:*)",
      "Bash(python3 <fleet> send:*)",
      "Bash(python3 <fleet> stop:*)",
      "Bash(python3 <fleet> close:*)",
      "Bash(python3 <fleet> adopt:*)",
      "Bash(python3 <fleet> attach:*)",
      "Bash(python3 <fleet> connect:*)",
      "Bash(python3 <fleet> forget:*)"
    ]
  }
}
```

Muse has no settings-level `Bash(...)` allow-list: its settings file's
`permissions` member is a permission profile, not a list of command rules,
and a settings file that holds only the block above does not load. In Muse
the split above is applied at the permission prompt.
