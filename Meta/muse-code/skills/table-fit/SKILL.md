---
name: table-fit
description: Keep a Markdown table readable in a narrow terminal of about 100 display columns - a wide table or one carrying prose in its cells wraps into unreadable ragged rows. Always call read_skill for bundled:table-fit before emitting a Markdown table in a final answer, and load it as soon as the answer starts forming as a comparison, a mapping, a feature matrix, a pros-and-cons, an options rundown, or a per-item summary across several dimensions. Do not load it for a table already inside a file being edited, for code, data, or test fixtures that merely look tabular, for tables the user pasted for you to read, or for an answer with no table and no tabular shape forming.
user-invocable: false
---

# Table Fit

The answer is read in a terminal about 100 display columns wide. A table wider
than that wraps every row, and wrapped rows lose the column alignment that made
the table worth using. So a table only pays for itself when it stays narrow.

Two budgets, both hard:

- **At most 4 columns.** The label column counts as one.
- **Every cell a short phrase.** Never a sentence, never prose.

If the content fits both, use the table. If it does not, do not shrink the font
of the problem by abbreviating into unreadable shorthand, and do not let the
table run wide. Switch shape instead.

## When the content will not compress

Use one of these instead of a table. Neither is a lesser answer; for prose-heavy
content they are the better one.

**A list** — when each item needs a sentence or two:

```
- **tokio** — the default. Widest ecosystem, work-stealing scheduler, heaviest
  dependency tree. Pick it unless you have a specific reason not to.
- **smol** — small and readable. Fewer integrations, so you write more glue.
```

**Short per-item headings** — when each item needs several dimensions covered in
prose:

```
### tokio
Maturity: production-default across the ecosystem.
Tradeoff: large dependency graph and a heavier compile.

### smol
Maturity: stable, much smaller surface.
Tradeoff: fewer ready-made integrations.
```

## Choosing

Count the dimensions the answer actually needs, then look at the longest value
any cell would hold.

- 4 or fewer dimensions, all values short phrases → table.
- More than 4 dimensions → drop the least useful ones to reach 4, or use
  per-item headings.
- Any dimension whose values run to sentences → list or per-item headings, even
  if there are only two columns.

A mapping with short values on both sides — a key to its meaning, a type to its
size, a flag to its effect — is the case tables are for. Keep those as tables.

## Do not

- Do not measure or ask for the real terminal width. The budget is static.
  Width is per-connection and transient, and must not enter durable context.
- Do not keep a table and simply truncate cells; losing the content is worse
  than losing the table.
- Do not restate the table as prose underneath it. Pick one shape.
- Do not add a table to an answer that did not need a visualization at all. A
  single fact, a one-step action, or a simple edit stays prose.
