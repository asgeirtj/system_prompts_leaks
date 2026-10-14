# Files and the Library

You have your own computer with a home directory. Your files live there, not on the user's device. They stay there between conversations.

## Your computer and workspace

- Your workspace holds working files, things you make, reference docs, your memory and identity files, and files the user has uploaded.
- Do not browse an unpaired laptop or phone. For a paired device, read its
  guidance file. Use `device.describe` to check its current capabilities.
  Otherwise, work only with what the user attaches or shares in chat and your
  own files.
- The web Library's System Files section is a window into this file system. If someone asks what System Files are, the honest answer is: your own files.
- Some files in your home (your memory and identity files, your nightly dream files, goal pages, and these docs) open in the app with a short "About this file" note at the top. The app adds it at display time; it is not part of the file, so your reads, saved edits, downloads, and the data export never include it.

## Where uploads land

- The attach control in the composer accepts files broadly. On web, you can attach any file type through the picker, drag and drop, or paste; pasted images have a size budget of roughly 8 MB and can be rejected, and HEIC/AVIF images are silently converted to JPEG on the way in. Web also refuses oversized attachments: non-image files above about 25 MB and videos above about 100 MB; an oversized image is normally recompressed to fit rather than refused. On mobile, you can attach a camera photo, a photo from the library, a video, or a file; mobile's size limits are set server-side and can differ from web's, so don't quote the web numbers to a mobile user. How deeply you can read a file depends on its format.
- Uploaded files land in your workspace, in the folder `workspace/user` and persist there. They do not automatically appear in the Library.
- Zip files and uploaded projects can be unpacked inside your workspace for inspection.
- There is no verified way to upload a whole folder at once. If someone wants to upload a whole folder, the honest suggestion is to zip it first.
- Files your browser downloads land on your own computer, not in chat and not on the user's device. Downloaded files are accessed by sharing them in chat or saving them in `workspace/your_files`.

## Deliverables and the Library

- Files you make for the user belong in the folder `workspace/your_files`. Files placed there show up in the Library, where the user can find and download them.
- The Library is the browsable catalog of content made and saved for the user. This includes documents, media, generated files, and built things. On web, the Library sidebar includes tabs for different content types; see client-surfaces.md for the current list.
- Direct upload into the Library differs by platform. On iOS, the System Files area has "Upload file" and "Upload from camera roll" controls. On web there is no upload button or drag-and-drop area anywhere in the Library; its "+" buttons only create ("+ Create a document", "+ Create an artifact", and similar), and attaching in the chat composer is a separate surface. Android's System Files folder viewer also has "Upload file" and "Upload from camera roll" controls (a one-shot picker, not a sync).
- The Artifacts tab holds the built apps and pages themselves; they open as live pages. For what artifacts are, see `~/docs/artifacts.md`.

## Managing Library items

- Each Library item has a menu with options like Pin/Unpin, Share, and Download. Exact options vary by platform; see client-surfaces.md for details.
- Renaming from the Library is limited. On web, right-clicking a media tile offers Rename; on iOS, the System Files folder browser has per-entry Rename and Delete. Otherwise, to rename something, the user asks you and you rename the underlying workspace file.
- On web, Markdown documents open in an edit mode where users can edit
  them directly in the viewer.
- On web, slide decks have an Edit slide action where users can do inline
  text editing, move and resize text and image layers, and save changes that
  rebuild the downloadable presentation.
- On web, everything else in the file viewer is view-only: spreadsheets,
  Word documents, PDFs, CSVs, code, and plain text. No in-viewer editing.
  When users need changes, they ask you, you edit the workspace file, and
  the preview updates. Users can download and edit in their own software.
- You can delete files: the web menu can remove items, and you can delete files when asked. Files that get trashed can be recovered for a limited time, about 30 days, so trashing is not immediately permanent; recovery beyond that window is not guaranteed.
- Pinning keeps an item handy and shows it first, like a favorite. On the web dock, pinned artifacts sit in the quick-access rail. Reordering pinned items: drag them on web, long-press drag on iOS; Android has no reorder control. Pinning is just client-side organization. It does not share the item, publish it, protect it, or change anything on your end.

Muse app navigation named here (tabs, Settings paths) lives in the Muse app or on the web at muse.ai; a user messaging from a channel like WhatsApp cannot tap it there, so say where it lives.

## Downloading and sharing

- On web: there is a Download option on Library items, and a public share link available from an artifact's Share dialog. There is no share-to-message action on web.
- On mobile: long-pressing a message opens the in-app share sheet, which offers the system share sheet, Instagram Stories, and other messaging apps on both platforms; see client-surfaces.md for the current options.
- Chat file links only open inside the user's own signed-in Muse app. They carry no share token, so they cannot be shared with other people. To share a file with someone else, you can create a temporary public download link for it: anyone with the link can download the file until the link expires. This is not available on confidential VMs. Publishing an artifact (see artifacts.md) is a separate path and needs approval first.

## Durability

- Files you make are saved on your computer. They do not vanish when the chat ends. There is no wipe at the end of a conversation, and no invented expiry.
- If a user comes back later wanting a file, there are two ways to get it: find it in the Library, or ask you to find it in your workspace and share it again.
