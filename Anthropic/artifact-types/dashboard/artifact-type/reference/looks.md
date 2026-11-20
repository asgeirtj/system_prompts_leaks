# Ready-made looks

Clay, Ocean and Meadow are looks a person can pick in the questions before a first build (`artifact-type/reference/questions.md`). Each is a whole `dash/look` document. `set` it exactly as it stands, together with the page; every value has been tested to pass the dashboard's checks. The standard look has no document. The page uses the dashboard's tokens and names none of these colors, or the look can't be changed later. Say which look it has.

Write one where this dashboard's view context holds `designSystem`, now or earlier in this chat, or where no view context has come yet. One from a deck or Sheet beside it doesn't count. Where the view context lacks the key, write none, use the dashboard's own look, and say the requested look isn't available here and that there is no setting for it.

Deleting the document drops the look. A whole `set` or a `delete` also clears `tweaks`, the person's own style changes, and they can't be recovered, so read the document first and say so if it has any.

## Clay

Warm paper, clay and ink.

```json
{
  "system": { "name": "Clay" },
  "light": { "ground": "#f6f1e9", "card": "#ffffff", "text": "#2b2620", "muted": "#7a6f62", "border": "#e6dfd3",
    "good": "#006300", "warning": "#734500", "bad": "#8e2626",
    "charts": ["#d97757", "#3d3929", "#c2b280", "#788c5d", "#6a9bcc", "#8b5d7d", "#c9952b", "#5f6b73"] },
  "dark": { "ground": "#14110d", "card": "#221d17", "text": "#f0efec", "muted": "#898781", "border": "#272726",
    "good": "#0ca30c", "warning": "#db9300", "bad": "#ec7e7e",
    "charts": ["#e08363", "#c9c2b3", "#b98e5a", "#93a877", "#7eaddb", "#a97a9b", "#d8a747", "#8d9aa3"] }
}
```

## Ocean

Cool blue-white, deep blues and teal.

```json
{
  "system": { "name": "Ocean" },
  "light": { "ground": "#f0f5fa", "card": "#ffffff", "text": "#0f2233", "muted": "#5a6d80", "border": "#d8e2ec",
    "good": "#006300", "warning": "#734500", "bad": "#8e2626",
    "charts": ["#1d4e89", "#2a78d6", "#1b9aaa", "#62b6e6", "#7fd1ae", "#7a4fb8", "#7a8b99", "#d9c8a0"] },
  "dark": { "ground": "#0b1219", "card": "#15202b", "text": "#f0efec", "muted": "#898781", "border": "#272726",
    "good": "#0ca30c", "warning": "#db9300", "bad": "#ec7e7e",
    "charts": ["#608fcc", "#2f7fe8", "#49b2c2", "#81cffe", "#9deac8", "#a58be8", "#93a3b1", "#edddb6"] }
}
```

## Meadow

Soft green-white, greens and ochre.

```json
{
  "system": { "name": "Meadow" },
  "light": { "ground": "#f2f5ec", "card": "#ffffff", "text": "#1e2a1f", "muted": "#66735f", "border": "#dde4d2",
    "good": "#006300", "warning": "#734500", "bad": "#8e2626",
    "charts": ["#2d6a4f", "#52b788", "#a3b43c", "#7a5c3e", "#d99a2b", "#2b8c8c", "#8a8f85", "#a8415b"] },
  "dark": { "ground": "#0e130e", "card": "#192019", "text": "#f0efec", "muted": "#898781", "border": "#272726",
    "good": "#0ca30c", "warning": "#db9300", "bad": "#ec7e7e",
    "charts": ["#488166", "#72d0a2", "#d8e983", "#917356", "#f1b454", "#4ea4a4", "#a3a79e", "#c05c73"] }
}
```
