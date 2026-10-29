# Speaker Notes

Speaker notes live on `slide.speakerNotes`.

## Set Text

```ts
const speakerNotes = slide.speakerNotes;
speakerNotes.text = notesText;
const savedText = speakerNotes.text;
```

## Notes Text Inline Type

```ts
type NotesTextValue = string | string[] | StructuredTextInput;

type TextRunInput = {
  run: string;
  style?: { bold?: boolean; italic?: boolean; fontSize?: string; color?: FillConfig };
  textStyle?: TextRunInput["style"]; // Compatibility alias.
};
```

## Visibility And Clearing

```ts
speakerNotes.setVisible(visible);
const visibleState = speakerNotes.isVisible();
speakerNotes.clear();
```

## Cookbook

```ts
// Structured presenter notes.
slide.speakerNotes.text = [
  "Open with the customer problem, not the feature list.",
  "Call out the chart source before discussing the slope.",
  "Pause for questions before the implementation timeline.",
];
slide.speakerNotes.setVisible(true);
```

```ts
// Append without deleting imported notes.
slide.speakerNotes.append("\nFollow-up: confirm launch date with PM.");
```
