---
name: google-workspace
description: "Read this before the first Google Drive, Docs, Sheets or Slides connector call whenever the task creates or changes a Google file. Use this skill whenever the user wants to create or change a Google Doc, Sheet or Slides file in their Google Drive. Triggers include: a request that names Google Docs, Sheets, Slides or Drive and asks to make, edit, format, copy or rename a file; a docs.google.com link with a request to change that file, even a one-line fix or suggested edits; and any follow-up change to a Google file from earlier in the chat, even \"change it\" or \"add a tab\". Includes helper scripts for document positions, cell ranges and slide layout. However, if the user asks for a doc, deck or spreadsheet without naming Google, or gives a Google file only as source material for something new, use Claude's own output type instead. Do NOT use for read-only questions about a Google file, or for Word, Excel, PowerPoint or PDF files."
---

# Google Docs, Sheets, and Slides

The Google connectors are thin wrappers over Google's raw APIs, with almost no guidance of their own. This skill supplies that guidance: which connector does what, the rules that keep edits in the user's file, and, in one reference file per app, how each API really behaves. Most of the app-specific rules in the references were tested against Google's Docs, Sheets and Slides APIs; the rest were seen through the connectors, and a few have not been checked yet.

## Read the reference before you touch the file

| Working on | Read first | Why it matters |
|---|---|---|
| A Google Doc | `references/docs.md` | Docs edits address UTF-16 positions that shift after every insert and go stale after every write. Tabs and pending suggestions change the positions too. |
| A Google Sheet | `references/sheets.md` | Both write tools parse input like the Sheets UI, so text can silently become numbers or dates. Formatting needs numeric sheet IDs, 0-based ranges, and field masks without parentheses. |
| A Google Slides deck | `references/slides.md` | Positions are in EMU, an element's real size is its size times its scale, and an unmasked read can exceed 150 KB for three slides. Slides never shrinks text to fit. |

Read the reference for every app the task touches before the first edit. Embedding a Sheets chart in a deck means reading both. The references are short, and skipping one is how edits land in the wrong place.

## 1. Check the connectors before you start

| Connector | What it can do |
|---|---|
| Google Drive | Create files, upload and convert content, rename, read a file as text, export (PDF and other formats), search, trash |
| Google Docs | Read a doc's full structure and edit it in place, directly or as suggestions |
| Google Sheets | Read values and structure, write values and formulas, format, add tabs and charts |
| Google Slides | Read a deck, add and edit slides, shapes, text, tables, and linked charts |

Drive can create all three file types. It can't edit a file after that. Without the matching editor connector, every change means a new file and a new link, and the user loses the link they already have.

1. Check which Google tools are available in this conversation. On surfaces where tools are deferred, search for and load the tools you need first, such as "google sheets update". Tool names differ by surface, so use the names your surface lists. If a search returns nothing, list all available tools before deciding the connector is missing, because the tool may exist under a different name.
2. If the editor tools are missing, tell the user. When you can list the conversation's connectors, say which case it is: a connector that is set up but turned off in this chat (ask them to turn it on in the chat's connector settings, then continue), or one that isn't connected at all (tell them which connector to add and what it enables).
3. With an editor connector missing, a request to create a new file continues with Drive. A change to an existing file stops and asks. See the missing-connector rule in section 2.
4. If the user asks only for a new file, create it with Drive. If the editor connector is off, add one line saying edits will need it.

Example: "I can create the sheet now. If you want changes later, turn on the Google Sheets connector in this chat first. Then I can edit this file, and the link will stay the same."

## 2. Rules for every file

- **A change goes in the same file.** "Change", "update", "fix", "add", and "switch it to" all mean the user wants the same file and link. Do not recreate the file to skip an edit.
- **A missing editor connector is a choice for the user, not a workaround for you.** When the user asks for a change to an existing file and the editor connector is missing, your whole reply is a short question, not a deliverable. Building the next-best thing feels helpful, but the user's file is still untouched and now there are two artifacts, which is the exact failure this skill exists to prevent. Lead with the fix: name the connector and say that with it on, the edit lands in their existing file and the link stays the same. You may offer an alternative, such as drafted text to paste or a file to import by hand, but only as a named option, and build it only after the user picks it. Example reply, in full: "To add the slide to your deck directly, turn on the Google Slides connector in this chat and I'll do it. Same deck, same link. Or I can draft the slide as a file you'd import by hand. Which do you prefer?"
- **Never trash a file the user didn't ask you to delete.** Drive can trash a file, but it can't restore one. The Docs, Sheets, and Slides connectors can't open a trashed file.
- **Read before you edit, and guard the write.** Every Docs and Slides read returns a `revisionId`. Pass it as `writeControl.requiredRevisionId` on the next batch update. If the file changed in between, the whole batch is rejected with a 400 ("does not match the latest revision") instead of landing on stale positions. Write replies don't return the new revision, so read again before the next guarded write. On a rejection, read again and rebuild the requests; never retry without the guard. Sheets is different: the Sheets reads in `references/sheets.md` return no `revisionId`, so read again right before a Sheets write and send it without `writeControl`.
- **Put everything for one step in one batch.** Batch requests run in order and atomically: if one is invalid, none apply. One call per logical step is faster and leaves no half-finished state.
- **Verify the result.** Read the file again after each edit and check the result before you report it. A tool accepting the call does not mean the content is correct. Each reference has a Verify section.
- **Rename with Drive `update_file`.** A rename keeps the same link.
- **Link every file you name.** When you name a Google file you created, copied, found, or edited, make its title a link, inside the sentence that says what you did: "I added the row to [Team roster](its link)." Don't set the file apart after a colon or on a line of its own ("I've created a file for you: Team roster"). If a Drive result says the user can already see or open a file from the chat, leave that file's link out unless they ask. Always give the link when the user asks for it, wants to send it to someone, or says they can't see or open the file, even if a result said they could. Don't tell the user to use a card or preview unless a result said one is shown. After an edit, say that the link stays the same.

## 3. Drive, for all three apps

- **Find a file:** use Drive search when the user names a file without a link. Confirm the match with the user if more than one file fits.
- **Create:** `create_file` with `contentMimeType` set to `application/vnd.google-apps.document`, `.spreadsheet`, or `.presentation` creates an empty file. Uploading content with a source type (HTML, CSV, .xlsx, .pptx) converts it into the matching Google type. Each reference says which route fits that app.
- **Read as text:** `read_file_content` returns a compact text rendering: Markdown for a Doc. It is a few KB where the editor connector's full read can be over 100 KB, so use it to understand content, then use the editor read when you need positions.
- **Export:** `download_file_content` with `exportMimeType: "application/pdf"` returns the rendered file as base64. It is large (about 65 KB of text for a four-slide deck), so export only for a visual check, and only where you can run code.

## 4. Helper scripts

The `scripts/` folder next to this file holds tested helpers. They turn the APIs' raw JSON into short readable summaries, and turn simple specs into correct request batches, so the error-prone arithmetic never happens by hand. Use them wherever you can run Python. Run them by their full path inside this skill's folder; the references write that folder as `<skill>`.

| Script | Commands | Used for |
|---|---|---|
| `docs_index.py` | `outline`, `find`, `new-table`, `fill-table` | Docs positions, text search with bold and suggestion state, adding a filled table in one call, filling an existing table |
| `sheets_helper.py` | `range`, `format`, `cells` | A1 ranges to grid ranges, formatting batches from a short spec, reading formulas and error cells |
| `slides_helper.py` | `outline`, `build` | Real slide geometry with overflow and overlap warnings, building slides from an inch-based spec |
| `render_export.py` | one command | Decoding a PDF export into page images to look at |

**Getting JSON to a script.** Large tool results are often saved to a file by the app, and the result tells you the path. Point the script at that path; the scripts read the file as the app saved it. When a result comes back in context and is small (a few KB, such as a masked read or sheet metadata), write it to a file and run the script on it. Don't re-type a large result into a file: that doubles the cost and invites copying errors. If a large result was cut off and not saved, read a smaller slice instead (a field mask, a range, or one tab) rather than guessing.

Every script prints `--help` with its full usage. Each reference shows the commands in context.

## 5. Common failures across apps

| Symptom | Cause | Fix |
|---|---|---|
| "No such tool available" | The tool is deferred, or the name is different on this surface | Search for and load the tool. Use the exact name your surface lists. |
| Permission denied on a file you created | The file is in the trash | Ask the user to restore it from Drive's trash. You can't restore it with the connectors. |
| 400: required revision ID does not match | The file changed after your read, often because of your own previous write | Read again, rebuild the requests from the new read, and send them with the new revision. |
| A whole batch failed on one bad request | Batches are atomic | Fix the named request and resend the full batch. Nothing from the failed call was applied. |
| A read is too large or cut off | Unmasked editor reads include everything | Use Drive `read_file_content`, a field mask, a range, or a single tab. Run the helper on a saved result. |
| Two files where the user expected one | An edit was done by creating a new file | Make changes in place with the editor connector. Tell the user about the extra file; don't trash it without asking. |

Each reference ends with the failures specific to that app.

## 6. What the connectors can't do

When a request runs into one of these, say so plainly and do the alternative. *Reported*: seen through the connectors or in their tool schemas. *Untested*: not yet checked.

- **Claude can't see the user's screen.** No connector shows what the user has selected, or which file, tab or slide they have open. If "this" or "here" isn't clear from the chat, ask which file, heading, slide number or cell range they mean. *Reported.*
- **Comments:** `read_doc` has returned no comments even with `commentsIncluded: true`. To read comments, use Drive `read_file_content` with `includeComments: true`, or ask the user to paste them. `update_doc` has accepted `insertComment` in one report, although its description is cut before listing it; if that request fails, say you can't add comments and offer to list your notes in the reply. *Reported.*
- **Suggestion mode can be refused** with "Unsupported WriteControl mode". Never make direct edits in its place: offer to list the proposed changes or to edit directly (see `references/docs.md`). *Reported.*
- **Request lists are cut short.** The `update_doc`, `update_spreadsheet` and `update_presentation` descriptions stop partway through their request lists. Requests missing from the description, such as `addDocumentTab` and `addChart`, have still worked, so try one before deciding it isn't supported. *Reported.*
- **Uploads travel inside the call.** `create_file` takes the whole file as text or base64, so an .xlsx or .pptx upload is slow and often fails. Build in the file with the editor connectors where you can, and keep uploads small. *Reported.*
- **Images need a public URL.** Slides `createImage` and Docs `insertInlineImage` fetch the image from a URL Google can reach; a file from the chat can't be inserted this way. For a deck, offer the .pptx route; otherwise ask the user to insert the image. *Untested.*
- **A Slides chart must already exist in a Sheet.** Create it there with `addChart`, then embed it with `createSheetsChart`. *Reported.*
- **Drive search uses `title`, not `name`.** `name contains '…'` fails with "Unsupported query field: name"; write `title contains '…'`, and put the file type in a `mimeType` clause. *Reported.*
- **Slides edits may not show in an open deck right away.** If the user doesn't see a change, ask them to reload the deck before you change anything again. *Reported; may be fixed.*
