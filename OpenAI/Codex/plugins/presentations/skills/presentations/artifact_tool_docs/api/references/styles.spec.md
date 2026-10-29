# Named Text Styles

`presentation.styles` stores reusable text styles for shapes and text ranges.

## Style Surface Map

| Need | API |
| --- | --- |
| Deck-level tokenized text style ids | `presentation.theme.textStyles({...})` |
| Slide-scoped generated text style ids | `slide.theme.textStyles({...})` |
| Explicit named styles by facade | `presentation.styles.add(name)` |

## Built-In Styles

```ts
const styles = presentation.styles;
const style = styles.get(styleName);
const summary = styles.describe(styleName);
const allStyles = styles.describe();
```

## Custom Style

```ts
const custom = presentation.styles.add(styleName);
custom.description = styleDescription;
custom.color = styleColor;
custom.bold = isBold;
custom.italic = isItalic;
custom.fontSize = fontSizePx;
custom.alignment = alignment;
```

## Named Style Facade Fields

```ts
type NamedStyleFacade = {
  description?: string;
  usageHint?: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  alignment?: "left" | "center" | "right" | "justify";
  underline?: string;
  color?: ColorConfig;
};
```

Use broader `TextStyleConfig` objects on `shape.text.style = { ... }`,
`presentation.theme.textStyles(...)`, and `slide.theme.textStyles(...)`.

## Use A Style

```ts
shape.text = textValue;
shape.text.style = styleName;

const range = shape.text.get(rangeText);
range.style = styleName;
```

Named styles are block-level for paragraph style assignments and range-level for selected text ranges.

## Cookbook

```ts
// Deck-level type scale.
const display = presentation.styles.add("Display");
display.fontSize = 52;
display.bold = true;
display.color = "#0f172a";
display.usageHint = "Hero and section titles";

const body = presentation.styles.add("Body");
body.fontSize = 20;
body.color = "#475569";
body.usageHint = "Readable body copy";
```

```ts
// Apply a style, then emphasize one range.
shape.text = "Revenue accelerated across enterprise accounts.";
shape.text.style = "Body";
shape.text.get("Revenue").style = "Display";
```
