# Google Docs reference

As a first step, before you create a Google Doc or change one, you must read the design rules below in full: how a document should look and read, and how to edit one. After them, "Applying the design rules" says how to carry out the rules with these tools, and the rest of the file covers the Docs connector's `read_doc` and `update_doc` and the Drive tools that help with Docs.

# Document design

When the user asks for something specific, such as a font, a color, a length or a structure, do that; these rules decide what the user left open. The rules for the text itself are under Writing, and the rules for changing a document that already exists are under Editing an existing document.

## Structure

- **Plan the sections before you write, and merge any two that answer the same question in different words.** If the user asked for a set number of sections, replace the merged one with a section that covers something new.
- **Each section appears once.** Before you finish, read the headings in order and check that none is repeated.
- **An executive summary opens with the conclusion.** Its first paragraph states what the reader should believe or do. Numbers belong in the body sections, where they support the conclusion; they are not the conclusion. "$1.2B total debt across 7 instruments, weighted-average coupon 4.8%" is data. "Refinancing risk is concentrated in 2027. We recommend an opportunistic tender for the 2027 notes given the current cash position" is a conclusion. A summary that is only a list of numbers has not stated a conclusion.
- **A length the user gave is a limit.** "Three pages", "one page" or "500 words" is a hard constraint: check it before you finish and cut if you are over. Five pages for a three-page request is a defect, not thoroughness. Count the pages in the rendered document; without a render, estimate about 3,000 characters per page.
- **Limits still apply after the first request.** A length or a set of sources the user gave at the start still holds when a later request doesn't repeat it.
- **Numbers and quotes taken from a source match the source.** Take every figure, quote and page reference from a part of the source you have actually read, not from memory. If you can't find a value, say so instead of estimating it.

## Styles

The look of a document comes from its styles: the Normal text style for body text and the built-in heading styles for headings. Formatting set directly on individual paragraphs carries over into the text added after them and spreads across a long document.

- **Set the body font once, for the whole body**, not on each paragraph or run. A font set paragraph by paragraph misses the paragraphs added later, and the document ends up in two fonts.
- **Headings use the heading styles.** Never make a heading out of bold, larger body text: it is missing from the table of contents and the outline, and its formatting carries over into the next paragraph.
- **Don't resize a single heading.** Each heading level already has its own size, and an override on one paragraph can make a subsection look like a section. If a heading is at the wrong level, change its level. If every heading at one level should be smaller, change that heading style. Don't move a correctly placed heading to a lower level only to make it smaller.
- **New content of the same kind takes the style around it; new content of a different kind does not.** A clause added next to other clauses gets their style. A table or a body paragraph added right after a list item or a heading gets the Normal text style, without the heading's bold. Otherwise the table cells get list markers and the body text comes out bold or as a heading.
- **Color goes on a phrase, not on a section.** One sentence in red is emphasis. Three paragraphs in red is too much, and the reader stops reading the color as a signal. If you want to color more than one paragraph, you need a heading or a callout box instead. Color the words themselves, not the whole paragraph, so the color doesn't carry over into the next paragraph.

## Fonts

- **New legal documents use Times New Roman.** When you draft a contract, brief, motion, legal memo or legal letter from scratch, with no template, set the body in Times New Roman. It is the professional default in legal practice, and other fonts read as informal. This doesn't apply when the document already has content (use its body font), when a template sets the font, or when the user names a font.

## Lists and numbering

- **Never type list markers or section numbers** in a new document, or in a list or heading the document numbers automatically. In those, don't write "•", "-", "*", "1.", "3.2" or "(a)" as text; use the document's list and heading numbering. Typed markers look right until someone inserts an item or a section above them, and then the numbers are wrong.
- **List items directly next to each other with the same list style join one list.** Numbering can also continue across a paragraph between two lists, so when a second numbered list should start again at 1, check that it does.

## Tables

- **Match the existing tables.** When the document already has tables, give a new one the same borders, fills and header row. One table with a colored header among three plain ones looks like a mistake.

## Page layout

- **Leave the page setup as it is unless the user asks**, and in a pageless document skip the rules below about pages and columns. "Applying the design rules" says how to recognize one.
- **Keep each heading on the same page as the paragraph after it.** A heading alone at the bottom of a page reads as broken even when the content is right. In a document you create, set "keep with next" on the heading styles, so it applies to every heading; in an existing document, do it when you find a heading separated from its paragraph.
- **To keep a section on one page, such as a financial statement, start it on a new page with one page break before its heading.** Check for an existing break first: a second one only adds a blank page. If the section still splits with a break in front of it, it is longer than a page; say so instead of adding another break.
- **When a table is longer than a page, stop its rows from breaking across pages**, so that each row is whole on one page.
- **Page numbers are fields, not typed text.** "Page 1" typed into a footer reads 1 on every page.
- **Headers and footers can have variants.** If the document has a different first-page header, or different headers on odd and even pages, each one is separate: change every one that applies.
- **Columns belong to a section, not to a paragraph style.** To set part of a document in two columns, give that part its own section.
- **Use real footnotes, not [1] markers typed into the text.**

## Check the result

Look at the rendered pages, not only the text. Assume there are formatting problems and look for them:

- **Fonts:** a paragraph in a different font from the rest, or a size change in the middle of a section.
- **Styles:** added text that looks like plain body text where the paragraphs around it are headings or styled body text.
- **Numbering:** a list item that lost its marker, or (a) (b) that restarted as (1) (2).
- **Tables:** columns that changed width, or cells that wrap where they didn't before.
- **Formatting that runs on:** bold or italic that continues past where it should stop.
- **Spacing:** double blank lines, a paragraph pressed against the one above it, uneven indents.
- **Suggestions:** insertions and deletions that render garbled or overlap the normal text.
- **Page breaks:** a heading alone at the bottom of a page, a blank page, a section that used to fit on one page and now splits.

After you fix one problem, check the paragraphs and pages around it. A fix to one paragraph often changes the next one, and a change in length moves the page breaks.

## Writing

Text you write in a document should read as though a person wrote it. When readers think something was written by AI, they judge it as sloppy and stop trusting it, whatever the content. They make that judgment from a set of common indicators, listed below, so take extra care to keep them out of your writing. These rules are for text you write, and a style the user or their style guide asks for takes priority. Do not rewrite the user's existing text to follow them unless the user asks you to.

- Say what is true without first denying something else. "Revenue grew 12%, three times the US rate," not "This isn't a growth story, it's a market-share story." Do not open a paragraph or bullet with "Here's the thing" or "The real story is".
- Match the number of bullets, examples, and adjectives to the content, not to a default of three. Two drivers get two bullets; five get five. A list of exactly three ("fast, reliable, and scalable") usually means the third item was added for rhythm, not because there were three things to say, and readers read it as filler.
- Do not use a metaphor where a literal word will do. If a plain description exists ("the same construction," "the same pattern," "slowed," "fell"), use it. Metaphors are for when the literal version would be longer or less precise, which is rare in analytical writing. Test: if the metaphor can be replaced by a plain word without losing meaning, replace it. A metaphor makes the reader translate it back into the plain claim and carries meaning you did not choose. The ones that appear most are "north star", "move the needle", "double-click" (meaning look closer), "unpack", "journey", and "landscape" (meaning a market). Common ones in business writing: "moat", "headwind", "drag" (meaning a cost on results), "safety net", "clears the bar", and "land" meaning finish or total ("lands $4.4k under budget"). Examples:
  - Bad: "The ones it has are the same species." Good: "The ones it has follow the same pattern."
  - Bad: "A coordinated digestion pause would be visible immediately." Good: "If several large customers cut capex in the same quarter, it would show up in the next guide."
  - Bad: "Architecture transitions compressed margin on the way in and expanded it on the way out." Good: "Gross margin fell during the Hopper-to-Blackwell ramp and recovered once Blackwell shipped at volume."
  - Bad: "The lever that unlocks growth." Good: "The pricing change is what makes the target reachable."
- Cut words that claim importance without giving evidence: "genuinely", "truly", "actually", "clearly", "significantly", "robust", "leverage", "delve", "actionable insights", "learnings". Where one of them stood in for a fact, put the fact there ("margins fell 4 points", not "margins fell significantly"); otherwise delete it. When "leverage" or "significant" carries its financial or statistical meaning ("net leverage", "statistically significant"), it is a literal term; keep it.
- Use full stops and commas, and a colon before a list. No emoji in the document.
- Use em dashes sparingly: at most one in a paragraph, and none in a heading, a title, or between a bold label and the text after it. Several em dashes in one paragraph is one of the first things readers use to spot machine writing. In place of one, use a comma, a colon, parentheses, or a new sentence, not an en dash or a spaced hyphen.
- Headings in the document are about the content, not about your process: "Europe missed plan by $1.9M" or "Pricing", not "What I changed" or "The hard part". Standard labels such as "Executive Summary" or "Next steps" are fine. When the document already has headings, phrase new ones the same way, for example as short labels or as full sentences.
- Keep the conversation out of the document. When the user asks for a shorter or more formal version, make it shorter or more formal; do not title it "Executive Summary (Condensed)" or open it with "Updated per your feedback". The document's readers did not see the request, so those lines mean nothing to them. Say what changed in your reply, not in the document. This covers the document's text, not replies in comment threads.

## Editing an existing document

These rules apply whenever you change a document that already exists. Everything you add also follows the rules above.

### Change only what was asked

- **Match the scope of the edit to the request.** "Fill in this section" means add text. It doesn't mean also changing the alignment, adding underlining, reformatting tables or restyling nearby paragraphs. If a check shows a formatting change you didn't intend, undo it.
- **Change the smallest range that covers the change.** Replace the words that change, not the paragraph or section around them. Never delete and rebuild a paragraph, a section or the document to change part of it: that loses comments, bookmarks, images, charts and other embedded objects.
- **Keep the original wording wherever you aren't deliberately changing it.** Rewording the user didn't ask for is one more change they have to find and review. In a contract it is a substantive change: "aggregate" becoming "total", or "shall not" becoming "will not", changes what the text says.
- **Reformat by role.** "Make the body text 11pt" means the body text, not the headings; "indent the section headers" means the headings. Pick out the paragraphs by their style before you change them.
- **Take target values from the document, not from a guess.** If one table's header row is wrong and three others are right, copy the values from a correct one. When the user points at a reference ("make it look like section 3"), read that section's exact style, font, size, color, alignment and line spacing, and apply those. A guessed 18pt in a document built at 11pt is worse than the original problem.
- **Keep similar tables consistent, but only when the user asked you to reformat tables.** When the user asks you to reformat one of several similar tables, make the same change to the others or tell the user you changed only the one.
- **A table that changed as a side effect of another edit is a mistake to undo**, not a change to copy to the other tables.
- **Never replace a bare number across the whole document.** Closing a gap in section numbers by replacing every "7" with "6" also changes a "7.1x" interest coverage, a "7.5%" coupon and "FY2027". Renumber the headings one at a time.

### Match what is there

- **Text you add uses the document's body font and style**, not the editor's default. After you insert text, check its font and size against the paragraph before it.
- **Use the document's spelling variety**, for example British or American English. Keep new text in the variety the document already uses, never mix varieties in one document, and don't change existing text to another variety unless the user asks. If the document has no text yet, follow the variety of the user's messages.
- **Set explicit colors from the document.** If you must set a text color, copy it from an existing body paragraph instead of assuming black: many document styles use a dark gray or a theme color.
- **New numbered headings get their number from the document.** When the document numbers its headings automatically, write the heading text without a number and give the heading the same style or list level as the headings next to it, so it takes the next number. If the document numbers its headings by hand, follow that convention instead.
- **New list items continue the list.** Add an item as part of the list it belongs to, and check that it took the next marker: (b) after (a), not a second (a) or a skipped letter.
- **Making headings consistent.** When the user asks for all the headings to match, first give any hand-formatted heading (bold, larger body text) the right heading style. Then set each level to the font of its own heading style, one level at a time; applying the first level's font to every level removes the difference between levels. Applying a heading style doesn't remove a size or color set directly on the text, so clear those as well.

### Things inside the text

Some elements sit inside a paragraph's text without looking like separate objects: footnote marks, chips (such as a person, date or file chip), bookmark boundaries, comment anchors, and inline images and charts. Replacing or deleting a range that contains one removes it: the footnote is gone, the chip is deleted, the bookmark moves, the chart disappears.

- **Before you edit a sentence, check what is inside it**, and change the text on either side of such an element rather than through it.
- **A paragraph with no visible text can still hold an image or a chart**, and a floating shape is anchored to a paragraph. Deleting the paragraph deletes them, so check before you delete an empty-looking paragraph.
- **In a section set in columns, edit the text inside the section.** Don't remove the section break that holds the column setting.

### Templates

- **Fill the placeholders and keep the structure.** Never delete an image placeholder or a signature line while filling a template; removing one breaks the template for the next person who uses it.
- **Find every placeholder before you fill any.** Templates often use typed markers such as [CLIENT NAME]. If a template has none, find each section by its heading and write after it.

### Comments

- **Reply in the thread.** When you respond to a comment, reply to it; don't start a new comment. If your tool can't reply to comments, give the user the reply text to paste into each thread.
- **One thread per topic.** Before you add a comment, look for an existing thread on the same text or topic, including one you left earlier, and reply there. Several comments stacked on one paragraph make it unclear which note is current.
- **Leave comments where they are.** Don't delete or resolve a comment unless the user asks. Reply once per comment; don't add a second reply that says nothing new.
- **When you edit commented text, change words inside the commented range, not all of it.** A comment is attached to its text, and replacing all of that text deletes the comment and its replies. Make the edit first and reply after it, so that no reply describes an edit that didn't happen.
- **"Address the comments" means every comment.** Handle each one: make the edit it asks for, if any, reply with a one-line note, and leave the thread open unless the user asks you to resolve it.

### Suggestions

- **Use real suggestions**, never strikethrough and colored text made to look like them. The reviewer needs to accept or reject each change.
- **Don't accept or reject changes, or delete comments, to clean up.** In a review, the suggestions and comment threads are the work product: accepting them erases the record of what changed, and deleting comments erases the reviewers' notes. "Clean up the document" means fix the formatting. Accept, reject or delete only the ones the user names.
- **Mark only the words that change.** A paragraph replaced as a whole shows as the whole paragraph deleted and inserted again, and the reviewer can't see what changed. Replace only the words that change, and make several small changes in one paragraph as separate edits. To change a cap from twelve months to six, the change is "twelve (12)" to "six (6)", not the sentence it sits in.

### After structural changes

- **Keep the table of contents current.** After you add, remove or rename a heading in a document that has a table of contents, update it in the same step: a table of contents that lists "Section 4: Risk Factors" when section 4 is now "Liquidity" is a visible defect. Update an existing one; don't add one the document doesn't have unless the user asks for it. If your tool can't update it, tell the user it needs updating.
- **Remove everything in a section you delete.** Deleting a section's paragraphs can leave its table or images behind. Count the tables before and after, and check the count dropped by the number you removed.
- **Before removing a duplicate section, read both copies.** Keep the one whose formatting matches the rest of the document, and tell the user which one you kept and why.
- **Clear what deletions leave behind:** empty tables, two or more blank paragraphs in a row (collapse them to one), list items cut off from their list, and blank paragraphs at the end that push an empty last page.

### Check your edits

After each edit, read back what you changed: the text, its style, its font and any list marker. After an edit that can move the layout, such as added or removed content, a table or formatting change, or a fix to something that looked wrong, also check the rendered pages, including the pages around the change, against the list under Check the result above.

# Docs and Drive tools

## Applying the design rules

Some of the design rules above act on a named style (Normal text, Heading 1 to 6) or on a page-number field, and the Docs API can apply a named style but not change one, and can't insert a page number. Others depend on the page setup. Do this instead:

- **Body font, such as Times New Roman for a new legal draft:** set it once over the whole body with `updateTextStyle` (`weightedFontFamily`, `fields: "weightedFontFamily"`) after the text is in, and give text you add later the same font.
- **Keep each heading with the next paragraph:** set `keepWithNext: true` on each heading paragraph with `updateParagraphStyle` (`fields: "keepWithNext"`).
- **Make every heading at one level smaller or larger:** tell the user they can resize one heading at that level and then choose Format > Paragraph styles > Heading N > Update 'Heading N' to match, which changes the style itself. If they want you to do it instead, set the same size on every heading at that level in one batch.
- **Page numbers:** tell the user to add them with Insert > Page numbers.
- **Whether a tab is pageless:** in the `read_doc` result, check the tab you are editing. It is pageless when `documentFormat.documentMode` is `PAGELESS` in its `documentTab.documentStyle`, or in the top-level `documentStyle` when there is no `tabs` key. In a pageless tab, don't add page numbers, headers, footers or columns; tell the user to switch it to pages first, with Format > Switch to Pages format.
- **Page setup, when the user asks for a change:** send `updateDocumentStyle` with `tabId` on the request itself (it has no location or range), the new values in `documentStyle`, and only those field names in `fields`, without the `documentStyle.` prefix: `{"updateDocumentStyle": {"tabId": "t.0", "documentStyle": {"marginTop": {"magnitude": 54, "unit": "PT"}}, "fields": "marginTop"}}`. A field named in `fields` but missing from `documentStyle` is cleared, so never use `*`, which names every field.

These are based on the Docs API reference and have not been tested through the connector.

## Create

Call Drive `create_file` with `contentMimeType: "text/html"` and the document as `textContent`. Drive converts `<h1>`, `<h2>`, `<p>`, `<ul>`, `<ol>`, `<b>`, `<i>`, and `<a>` into native Docs formatting. This is much faster and less error-prone than building a new doc with Docs edit requests. Use the Docs connector for changes after that. For a Word file the user will download rather than edit in Google Docs, use the `docx` skill instead.

## How a doc is addressed

Every Docs edit points at a position, so the model of positions matters more than anything else in this section.

- **Indexes are UTF-16 code units** counted from the start of a tab's body, which starts at index 1. A character outside the Basic Multilingual Plane, such as 🙂, counts as 2, and an emoji built from several characters counts as more: 👍🏽 (👍 plus a skin tone) is 4. Docs refuses an insert inside an emoji with "The insertion index cannot be within a grapheme cluster", and a delete through the middle of 🙂 with "Invalid deletion range". Every paragraph ends with a newline that occupies one index.
- **Every insert or delete shifts everything after it.** Requests in one `update_doc` call run in order, so an index computed from the read is only valid for the first request that touches that region. Order the requests from the highest index to the lowest, and no request moves a position a later request relies on.
- **Indexes go stale after any write.** Never reuse indexes from a read taken before your last write. Read again, then compute.
- **Guard every index-based write with the revision.** Pass the `revisionId` from your read as `writeControl.requiredRevisionId`. If someone edited the doc in between, the whole batch is rejected with a 400 instead of landing in the wrong place. On that error, read again and recompute. Do not retry without the guard.
- **Tabs are separate index spaces.** A doc can have several tabs, and child tabs under them. Every `location` and `range` takes a `tabId`; without it, the request applies to the first tab, which is a silent failure when the user meant another one. A pasted URL like `.../edit?tab=t.abc123` names the tab: `t.abc123` is the `tabId`. `replaceAllText` is the opposite: without `tabsCriteria` it changes every tab, child tabs included, and naming a parent tab in `tabsCriteria` does not include its child tabs.
- **Pending suggestions are in the index space.** `read_doc` returns suggested insertions and deletions inline, as text runs that carry `suggestedInsertionIds` or `suggestedDeletionIds`, and they occupy real indexes. Don't treat a suggested deletion as live text, and don't insert inside one.
- **The body's final newline can't be deleted.** To append, insert at the last element's `endIndex - 1`.

## Read

There are two reads, and they serve different purposes.

- **Drive `read_file_content`** returns the doc as Markdown: headings, tables, and bold, typically a few KB. Use it first to understand what the doc says and to find the text you'll anchor on. It is not the index space: it escapes Markdown characters, and it glues pending suggestions to the text around them. Never compute an index from it.
- **Docs `read_doc`** returns the full `documents.get` JSON: every element with its `startIndex` and `endIndex`, every style, the `revisionId`, and the tabs. Use it when an edit needs indexes. It is large: a two-page doc with one table can exceed 100 KB. Pass `commentsIncluded: true` only when you need comments. The connector's read has come back without comments even with it set, showing `COMMENTS_VIEW_MODE_OMITTED`; if so, read them with Drive `read_file_content` and `includeComments: true`, or ask the user to paste the ones they want handled.

Where the content lives in the `read_doc` JSON:

```
revisionId
tabs[].tabProperties.tabId
tabs[].documentTab.body.content[]          body elements, in order
  .paragraph.elements[].textRun.content    text, with startIndex / endIndex on the element
  .paragraph.paragraphStyle.namedStyleType HEADING_1, NORMAL_TEXT, ...
  .table.tableRows[].tableCells[].content[]  each cell holds its own paragraphs
tabs[].childTabs[]                          nested tabs, same shape
```

If the doc has no `tabs` key, the body is at the top level: `body.content[]`.

### Use the helper script for positions

`scripts/docs_index.py` (in this skill's folder) reads the `read_doc` JSON from a file and prints only what an edit needs. Where you can run code, use it rather than walking the JSON by eye. That walk is where index errors come from.

- A large `read_doc` result may be saved to a file, and the result then gives the path. Run the script on that path.
- If the JSON came back in context and the doc is small, read the positions from it directly.
- If the read was cut off and not saved anywhere, don't guess positions. Use `replaceAllText`, which needs none, when the find text matches only the text you mean to change (add neighboring words until it does), or tell the user the doc is too large to edit by position here.

Commands:

```
python <skill>/scripts/docs_index.py outline DOC.json
    one line per element: index range, style, table cell position, text.
    Pending suggestions show as [+inserted] / [-deleted].
    Ends with the body end index for appends.
python <skill>/scripts/docs_index.py find DOC.json "exact text"
    index range of every match within one paragraph, whether it is bold, and whether it sits
    in a pending suggestion. A match can't cross a non-text element, such as a chip, image or footnote mark.
python <skill>/scripts/docs_index.py fill-table DOC.json --table N --data rows.json [--bold-header]
    the full update_doc arguments (requests + writeControl) to fill empty table N, the
    TABLE #N that outline prints (every tab and nested table is counted), from a JSON list of rows.
python <skill>/scripts/docs_index.py new-table --at I --data rows.json --revision REV [--tab T] [--bold-header]
    the full update_doc arguments to insert a table at I, the endIndex - 1 of the paragraph
    it goes after, and fill it in the same call. Needs no DOC.json.
```

outline and find print the `revisionId` and the tab ID; fill-table puts the `revisionId` in its `writeControl`.

## Edit recipes

Each recipe is one `update_doc` call. Add `tabId` to every `location` and `range` when the doc has more than one tab, and add `writeControl: {"requiredRevisionId": ...}` to any call that uses indexes. Put real newlines in inserted text, not an escaped `\n`.

**Change a word or phrase.** `replaceAllText` needs no read and no indexes:

```json
{"replaceAllText": {"containsText": {"text": "Q3 launch", "matchCase": true},
  "replaceText": "Q4 launch", "tabsCriteria": {"tabIds": ["t.0"]}}}
```

The reply reports `occurrencesChanged`. Zero means the text didn't match exactly: check it against `read_file_content`, but remember that file escapes characters like `&` and `*`. The replacement takes the style of the first character it replaces, so replacing a span that starts in bold makes the whole replacement bold. If that matters, start the find on an unstyled character, or check the result with `find` afterward. It changes every match in the tabs it covers (every tab unless `tabsCriteria` names some), so use it when every match should change, such as a date or a name the user wants changed throughout. When only one occurrence should change, or the find text is short enough to occur inside unrelated text (a bare number such as "7", a common word), delete and insert at the range `find` gives for that occurrence. Never put a paragraph's trailing newline in the find text: the replaced paragraph can take the next paragraph's style (a body paragraph becomes a heading), or the next paragraph can lose its heading style.

**Rewrite a paragraph.** Take its `startIndex` and `endIndex` from `outline`. Delete `[start, end - 1]`, which keeps the paragraph's newline and style, then insert at `start`:

```json
[{"deleteContentRange": {"range": {"startIndex": 120, "endIndex": 184}}},
 {"insertText": {"location": {"index": 120}, "text": "New paragraph text."}}]
```

For several paragraphs, do the highest one first. When only some words in the paragraph change, delete and insert only those words at the range `find` gives, not the whole paragraph. A footnote mark, chip or image elsewhere in the paragraph then stays, and in suggestion mode the suggestion shows only the words that changed. To delete a whole paragraph, delete `[start, end]`. In three cases that range is refused, with "Invalid deletion range" or "The range cannot include the newline character at the end of the segment"; use these ranges instead. For the doc's last paragraph, delete from the previous paragraph's `endIndex - 1` to the last paragraph's `endIndex - 1`. For the paragraph just before a table, and for a table cell's only paragraph, delete the text only, `[start, end - 1]`; an empty paragraph stays, because Google keeps one before every table and in every cell.

**Append to the end.** Insert at the body end index minus 1 that `outline` prints. Start the text with a newline to begin a new paragraph. The new paragraph takes the named style of the one it splits from, so after a heading, set it to `NORMAL_TEXT` with `updateParagraphStyle`.

**Insert new paragraphs with styles.** Insert the text, then style ranges you compute from the insert point and the text length (in UTF-16 units). Headings use `updateParagraphStyle` with `namedStyleType` `HEADING_1` to `HEADING_6`, `TITLE`, or `NORMAL_TEXT` and `fields: "namedStyleType"`. Lists use `createParagraphBullets` over the range with a `bulletPreset` such as `BULLET_DISC_CIRCLE_SQUARE` or `NUMBERED_DECIMAL_ALPHA_ROMAN`. Typing "- " or "1. " makes text, not a list, and `createParagraphBullets` over typed markers keeps them as text, so delete them first. For nesting, put one leading tab per nesting level at the start of each nested line, before the first `createParagraphBullets`. It turns the tabs into levels and removes them, which shifts every later index by the number of tabs. Bulleting a paragraph directly after a list, with the same preset, adds it to that list. Inserted text takes the style of the text before it, or at the start of a paragraph the style of that paragraph's first character, so reset bold and italic on new body text with `updateTextStyle` (`fields: "bold,italic"`, empty `textStyle`). Don't reset headings, because that removes their bold.

**Add a table with content.** One call, with no second read. Place the table after a paragraph, at that paragraph's `endIndex - 1`: for a table under a heading, that is the last paragraph of the section, or the heading itself if the section is empty. Never use the start of a heading: that leaves an empty heading above the table, the heading's font in its cells, and, with `new-table`, the heading itself turned into body text. Write the rows to a JSON file and run:

```
python <skill>/scripts/docs_index.py new-table --at <endIndex - 1> --data rows.json --revision <revisionId> [--tab <tabId>] [--bold-header]
```

Pass its output as the `requests` and `writeControl` of one `update_doc` call. It inserts the table, fills the cells, bolds the header row with `--bold-header`, and sets the empty paragraph Google adds after the table to `NORMAL_TEXT` (otherwise, after a heading, it becomes an empty heading). Pass `--tab` whenever the doc has more than one tab; without it every request goes to the first tab. The command needs only the index, the revisionId and the tabId, which you can read from `read_doc` even when the result came back in the chat rather than as a file.

Without the script, put the same requests in one batch: `insertTable` at index `i` makes a table that starts at `i + 1`; in an R x C table, cell (r, c)'s text goes at `i + 4 + r × (2C + 1) + 2c`, and the empty paragraph after the table is at `i + 3 + R × (2C + 1)` until you insert text, so put its `NORMAL_TEXT` reset right after `insertTable`. Fill from the last cell to the first, so each insert only shifts cells already filled.

To fill a table that already exists, a cell's text goes at its first paragraph's `startIndex`, which is the cell's own `startIndex + 1`; Google rejects an insert at the cell's `startIndex` ("The insertion index must be inside the bounds of an existing paragraph"). With a saved read, `fill-table` builds these requests; it assumes the cells are empty.

**Change table structure.** `insertTableRow`, `deleteTableRow`, `insertTableColumn`, and `deleteTableColumn` take `tableCellLocation: {"tableStartLocation": {"index": <table startIndex>}, "rowIndex": r, "columnIndex": c}`. `updateTableCellStyle` sets cell backgrounds over a `tableRange` built from the same location plus `rowSpan` and `columnSpan`. Colors use `rgbColor` values from 0 to 1. A row inserted below a bold header row comes out bold, and a new column copies its neighbor's width and background. To delete a whole table, delete exactly `[table startIndex, table endIndex]`.

**Suggest instead of edit.** Add `"writeMode": "SUGGEST"` to `writeControl`, and the same requests land as tracked suggestions that the doc's owner can accept or reject. Use it when the user asks for suggestions, redlines, tracked changes, or a review, or when the doc belongs to someone else and the user wants to propose rather than change. You can't accept or reject suggestions through the API, so tell the user they're waiting in the doc. Before you tell them, read the doc again with `read_doc` and run `outline`: inserted and deleted text should show as `[+...]` or `[-...]` (outline doesn't show suggested formatting changes). If new text shows as plain text, or deleted text is gone instead of showing as `[-...]`, the change was made directly; say so, and don't call it a suggestion. Suggested deletions stay in the index space until someone resolves them; see "How a doc is addressed". The connector has answered this mode with "Unsupported WriteControl mode". If it does, make no direct edits in its place: tell the user suggestions aren't available, and offer to list the proposed changes in your reply or to edit directly.

```json
{"documentId": "...", "requests": [...],
 "writeControl": {"writeMode": "SUGGEST", "requiredRevisionId": "..."}}
```

**Tabs.** `addDocumentTab` with `tabProperties.title` creates a tab, and the reply holds its `tabId`. `updateDocumentTabProperties` renames one (`fields: "title"`), and `deleteTab` removes one along with its child tabs, but not the only tab. Set `tabProperties.parentTabId` to create a child tab; tabs nest at most three levels deep. A new tab starts with one empty paragraph, so its first insert index is 1.

## Verify

- For content, read with Drive `read_file_content` and check the text you changed.
- For positions and styles, read with `read_doc` and run `outline` or `find` on the result. `find` shows whether replaced text picked up bold, and whether a match sits in a pending suggestion.
- For layout, where you can run code, export with Drive `download_file_content` and `exportMimeType: "application/pdf"`, then run `python <skill>/scripts/render_export.py <saved export> <out dir>` and check the page images against the list under "Check the result" above. If the export comes back in the chat instead of being saved to a file, skip the render rather than copying it into a file. If you can't run code, skipped the render, or it failed, rely on the two checks above and tell the user you couldn't check the layout visually.

## Docs failures

| Symptom | Cause | Fix |
|---|---|---|
| `read_doc` result too large or cut off | Full document JSON for a long or table-heavy doc | Orient with Drive `read_file_content`. Use `replaceAllText` where the find text matches only the text you mean to change (add neighboring words until it does). If the result was saved to a file, run `docs_index.py` on it. |
| An edit landed in the wrong tab | No `tabId` in the location or range | Add the `tabId` from the read or from the URL's `?tab=` value. |
| `replaceAllText` changed other tabs | No `tabsCriteria` | Scope it with `tabsCriteria.tabIds`. |
| `replaceAllText` reports 0 occurrences | Find text copied from `read_file_content`, which escapes `&`, `*`, and similar characters, or glues suggestions | Use the literal text, or check it with `docs_index.py find`. |
| Text shows as "RBRunning back" | A pending suggestion read as plain text | Read with `read_doc`. `outline` marks suggested text as `[+...]` and `[-...]`. |
| A heading loses its bold after an edit | A style reset was applied to the heading | Reset styles only on body text. |
| Replaced text turned bold | The replacement inherited the style of the first replaced character | Clear it with `updateTextStyle` over the new range. |
| Edits land in the wrong place | Requests ran from the lowest index to the highest, or used indexes from before an earlier write | Order requests from the highest index to the lowest, and read again after every write. |
| Typed "- " shows as text, not a bullet | Lists are paragraph properties | Delete the typed markers, then use `createParagraphBullets` over the range. Bulleting keeps typed markers as text. |
