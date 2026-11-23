```
<antml:reasoning_effort>[number]</antml:reasoning_effort>
<antml:thinking_mode>auto</antml:thinking_mode>
```

thinking_mode line is not present if thinking is turned off. Same numbers for Claude Code and API. Claude.ai is same except two exceptions.

| Model | low | medium | high | xhigh | max | Thinking line |
|---|---|---|---|---|---|---|
| Claude Fable 5.2 | 8 | 10 | 30 | 80 | `max` | `auto` |
| Claude Haiku 5.5 | none | none | none | none | none | none |
| Claude Sonnet 5.5 | 4 | 5 | 10 | 30 | `max` | none |
| Claude Opus 5.5 | 5 | 10 | 15 | 40 | `max` | `auto` |
| Claude Fable 5.1 | 10 | 15 | 25 | 80 | `max` | `auto` |
| Claude Opus 5 | 10 | 20 | 35 | 60 | 120 | `auto` |
| Claude Opus 5 on claude.ai | none | none | none | none | none | `auto` |
| Claude Sonnet 5 | 10 | 20 | 40 | 80 | none | `auto` |
| Claude Fable 5 | 10 | 20 | 40 | 120 | none | `auto` |
| Claude Opus 4.8 | 15 | 25 | 35 | 120 | none | `auto` |
| Claude Opus 4.7 | 15 | 20 | 40 | 80 | none | `auto` |
| Claude Sonnet 4.6 | 50 | 85 | 95 | | none | `auto` |
| Claude Sonnet 4.6 on claude.ai | none | 85 | none | | none | none |
| Claude Opus 4.6 | 50 | 85 | 99 | | none | `auto` |
| Claude Opus 4.5 | 35 | 75 | none | | | none |
| Claude Haiku 4.5 | | | | | | none |
| Claude Sonnet 4.5 | | | | | | none |
