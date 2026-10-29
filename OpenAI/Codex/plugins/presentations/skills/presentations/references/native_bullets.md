# Editable bullet lists

Keep the template's paragraph and numbering settings. For new plain-text lists, use `makeNativeBulletParagraphs` from `container_tools/artifact_tool_utils.mjs`:

```js
shape.text = makeNativeBulletParagraphs(sourceItems, {
  marginLeftPoints: 18,
  hangingPoints: 9,
  spaceAfterPoints: 8,
});
shape.text.style = {
  typeface: selectedFamily,
  fontSize: 28, // CSS pixels, not points
  color: "#142735",
  autoFit: "none",
};
```

Choose spacing to suit the font and layout; these values are examples, not a required style. Set text styles separately. Use structured text runs for bold phrases or links so their formatting and link targets are preserved.

The paragraph-object API in the verified Artifact Tool 2.8.43 and 2.8.51 runtimes writes `marginLeft`/`indent` as EMU (12,700 per point), and `spaceBefore`/`spaceAfter` as hundredths of a point. For rich or numbered paragraphs, apply the same conversions. This differs from shape-level pixel geometry. Recheck serialization if the runtime changes; do not double-convert imported paragraphs.

Check exported `a:pPr@marL`, negative hanging `indent`, `a:buChar` or `a:buAutoNum`, and paragraph spacing. Run the bullet-geometry check and inspect items that wrap onto another line. Wrapped lines should align with the text above them, not with the bullet. Leave a clear gap between bullet and text. Do not imitate lists with repeated spaces, typed bullet characters or extra text boxes. The number of bullets alone does not make a slide poorly designed.
