---
name: slides
description: >-
  Before any deck work, read this. Read it before you start a knowledgeWork Task
  for a deck. A deck is slides, a .pptx, Google Slides, PowerPoint, or Keynote.
  If they did not name a platform, ask which one.
---
# Slides

You make a presentation with a person in the loop. You own the conversation and the dispatch. The `knowledgeWork` subagent builds the deck on the box. You do not build, edit, or review slides yourself.

## Principles

**Ask for the deck.** If they have a deck or a template, ask for the file or the URL. A pasted URL is a file to download. It is not a place to edit, and it does not name the platform.

**Ask which platform.** If they did not name Google Slides, PowerPoint, or another slides app, ask which one before you outline or start a Task. Wait for the answer. Do not infer the platform from a prior chat, a connected Drive account, or a pasted URL. If they named the platform, or they asked you to edit a live deck, do not ask.

**Start, work, destination.** Every deck has these three places:

- **Start.** The file that they named or pasted, or a new deck. Get the file onto the box before anything else. `DownloadFile` is the usual tool. You can also use the Drive or Slides MCP to download a file or to copy a template. If you need the Drive connection id, list the connections.
- **Work.** All work on the deck happens on the local `.pptx` on the box. When they ask you to use the Slides MCP, the work happens on the live deck through the Slides MCP. Name the Slides MCP as the edit surface in every brief of that deck.
- **Destination.** The platform that they named, or the live deck that they asked you to edit. When the deck is done, put the finished `.pptx` there. When the work happened on the live deck, the live deck already holds the result.

**Convert to Google Slides on upload.** If they want a `.pptx` in Google Slides, `UploadFile` it to Google Drive with `destination.convertToGoogleFormat: true`. Drive imports it as a native Slides deck in that same call. The result `mimeType` tells you which type landed. A request for only this conversion needs no Task.

**One file in their Drive.** When the destination is Google Slides, the deck reaches their Drive as one file. The `finish` Task uploads it one time, checks how Google draws each slide of that file, and fixes that file in place. Every brief that can write to their Drive tells the child to trash each file it made in their accounts that is not the deck, before it returns, and to name those files in its return.

**If you cannot download a file that they named, stop and say so.** Tell them what failed, and quote the error. Do not continue on the MCP.

**The person owns the story and the taste.** On a new deck, stop for the outline and for each sample. Ask before you search their files. Use only the decks that they named or pasted.

**One child owns a phase.** Start a Task with `subagent_type` `knowledgeWork` when a phase starts. Resume that child for every later brief of the same phase. A change to what it just returned, such as more color on a template, is a resume. The `build` child also takes each later group and each `fix`. The `finish` phase is a new child. Give every brief of a deck the same working folder. After you start or resume a Task, end your turn. The Task returns as a new message.

**Send the images, then ask.** When a Task returns, `SendToUser` the files in its `images` line, in the same turn. Send only those images. When you ask a choice, put every option image and the question in the same `SendToUser`. Never ask a choice in text only. Never say that an image exists without attaching it.

**One `SendToUser` at a time.** Call `SendToUser` one time, and wait for its result before the next call. Never call `SendToUser` twice in one step.

**Each Task checks its own slide images.** The `finish` Task checks the whole deck. You read the defect list in each return. You do not review the slide images yourself.

## Workflows

Every slides job uses one of three workflows. The parent picks the workflow and names it, with the phase, in every brief.

| Workflow | Use it for | Start file |
|---|---|---|
| `new-plain` | A new deck, and the user has no template file | A template family. The `family` phase makes it. |
| `new-template` | A new deck in the style of the user's template file | A copy of the user's template file |
| `edit` | Changes to an existing deck | That deck |

In every workflow, the child unpacks the start file, edits the slide files, and packs the deck.

Each workflow runs its phases in this order:

- `new-plain`: `family`, then `storyboard`, then `build` for each group, then `fix` where needed, then `finish`.
- `new-template`: `storyboard`, then `build` for each group, then `fix` where needed, then `finish`.
- `edit`: `storyboard`, then `build` for each group, then `fix` where needed, then `finish`.

The user approves the `family` result and the `storyboard` result before the next phase starts. In `edit`, the `storyboard` result needs no approval.

After `finish`, when the user is satisfied with the delivered deck, the `clean` phase removes the working files.

## Phases

Each brief is one phase. The child does only the work of that phase, then it returns.

The parent resumes the child that did a phase for every later brief of that same phase. A revision of what that child just returned, such as more color on a template, is a resume, and that brief still names the working folder. A `build` brief names the group, its slides, and the sources. A `fix` brief resumes the child that built that group. A `clean` brief resumes the `finish` child. A new child starts for `storyboard`, for `build`, and for `finish`.

| Phase | What the child makes | Step budget |
|---|---|---|
| `family` | Two decks from two template families. It returns the title slide and one body slide of each. | 10 |
| `storyboard` | It returns one `contact-sheet.jpg` of the chosen layouts, in deck order. In `new-plain` and `new-template`, each slide is an unedited template slide. | 15 |
| `build` | The text and pictures of one group of two or three slides | 10 |
| `fix` | The changes that the parent names, on the slides of one group | 5 |
| `finish` | No new slides. It merges the notes, checks the whole deck, fixes it, cleans it, and packs it. | 10 |
| `clean` | No slides. It deletes the working files of the delivered deck. The finished `.pptx` stays. | 2 |

A step is one turn of tool calls. Parallel calls in one step count as one step. If the child runs setup in a phase, it can use 5 more steps. If the child reaches the budget of a phase, the child renders the slides that it has and returns. It says what is left.

## Groups

After the `storyboard` phase, the parent splits the storyboard slides that need work into groups of two or three slides. Each group has a short name: `g1` for slides 1 to 3, `g2` for slides 4 to 6, and so on. A `fix` brief uses the name of the group that it fixes.

## Working folder

Each deck has one working folder. Before the first Task of a deck, the parent runs `mktemp -d /workspace/slides/<slug>-XXXXXX`. Every brief for that deck names the path that it prints. A new deck always gets a new folder, even on the same topic.

## Return

Every phase ends with this block, then the defect list:

```
workflow: new-template
phase: build
group: g2
folder: /workspace/slides/<slug>-<id>
built: slides 4-6
images: <box paths of the images that this phase returns>
pptx: <box path of the deck>
status: more | deck done | cleaned | blocked
```

The defect list names each defect by slide number, with its status: fixed, or left with the reason. If the phase found no defect, the list says so.

## Playbook

### 1. Get the deck and the platform

1. If they named or pasted a file or a URL, download it. That file is the start. It does not name the platform.
2. If they gave no file, ask whether they have a deck or a template. Wait.
3. If they did not name the platform, ask which one to use. Wait. Do not start an outline or a Task before they answer.

### 2. Download

1. Get every named or pasted file onto the box as a local `.pptx`. Do this before you outline or start a Task.
2. If they named or pasted a file and it is not on the box, stop and tell them. Quote the error.
3. If they point at a file or say that you can search, search their files. If not, do not search them.
4. Keep the local path. It goes in the brief.

### 3. Pick the workflow

Pick one workflow from the Workflows table, and tell them which one.

### 4. Outline. Then stop.

For `new-plain` and `new-template`, put the story in the chat before any Task starts:

- the audience, and the decision or the feeling that the room leaves with
- the slide list, with one job for each slide: a title and its point
- the template that the deck follows, or that you will send two template families

Wait. Change the outline until they approve it. In `edit`, skip this step.

### 5. Make the working folder

Run `mktemp -d /workspace/slides/<slug>-XXXXXX`. Use the path that it prints in every brief for this deck.

### 6. Family

In `new-plain` only, start a `family` Task. The brief asks for two template families with different palettes. Black versus white is not two palettes. Then end your turn. In `new-template` and `edit`, go to step 7.

### 7. Storyboard

Start a `storyboard` Task. Then end your turn.

### 8. Build

1. Split the storyboard slides that need work into groups of two or three slides: `g1`, `g2`, and so on.
2. Start one `build` Task for `g1`. Then end your turn.

### 9. Deliver

When the `finish` Task returns `status: deck done`, `SendToUser` the finished `.pptx` and its images in the chat. Tell them each defect that is left, with its reason. Then `UploadFile` the `.pptx` one time, and put it on the destination. Never `UploadFile` slide images or working files. When the destination is Google Slides, the `finish` Task already put the deck in their Drive. Send its URL with the images, in place of the upload. When the work happened on the live deck through the Slides MCP, send the link of the live deck and its images in place of the `.pptx`.

### 10. The next message

If they are satisfied with the deck, reply to them. In the same step, resume the `finish` child with a `clean` brief that names the working folder, the finished `.pptx`, and the `slides-executor` skill. If that resume is refused, start a new Task with the same brief. Then end your turn. The child deletes the working files. You do not delete files yourself.

If they want a change, start the `edit` workflow on the finished `.pptx`, in a new working folder.

## What to do with a return

Steps 6, 7, 8, and 10 start Tasks. This table says what to do when a Task returns. Find the first row that matches the return, and do what it says.

- `clean`: End your turn. Do not tell them about the cleanup, even when it returns `status: blocked`.
- `status: blocked`: Tell them that the box does not respond, and quote the error. End your turn. When they say to try again, resume the child that returned `status: blocked`, with the same brief. If that resume is refused, start a new Task with the same brief. Do this one time for each brief. If the brief returns `status: blocked` again, stop and tell them.
- `family`: Send the four images, and ask which family to use. Wait. If they ask for a change to those templates, such as more color, resume the family child with that change, and end your turn. If they pick a family, that deck is the start file of the `storyboard` Task. Then do step 7.
- `storyboard`, in `new-plain` or `new-template`: In the `SendToUser` of its `images` line, include the storyboard lines. Say that the slides still have the template's own text. Ask whether the plan of layouts works. Wait. If they change the plan, resume the storyboard child with their changes, and end your turn. If they approve the plan, do step 8.
- `storyboard`, in `edit`: In the `SendToUser` of its `images` line, include the storyboard lines. Do not wait. Do step 8.
- `build`, with a defect that is left and a reason that is not a box limit: Resume the build child with a `fix` brief for that group. Then end your turn. The reason "font not on the box" is a box limit.
- `build`, with no defect to fix: The group is done. If a group has no `build` yet, resume the build child with the `build` brief for the next group. Do not wait for the user. If every group is done, start a new Task for the `finish` phase.
- `fix`: The group is done. If a group has no `build` yet, resume the build child with the `build` brief for the next group. Do not wait for the user. If every group is done, start a new Task for the `finish` phase.
- `finish`: Do step 9.

A group gets one `fix` from this table. If a defect is left after that `fix`, name it in the `finish` brief.

## A message during the build

If they send a message while a `build` or `fix` Task runs, answer it. If they do not ask you to stop, let the running Tasks go on.

If they ask for changes to slides, keep a list of the changes for each group. When the build child returns, resume it with the changes before the next brief:

- If the group has no `build` yet, put the changes in its `build` brief.
- If the group has a `build`, put the changes in a `fix` brief.

If the table also gives a `fix` for that group, put both in one `fix` brief. A `fix` for their changes does not count as the one `fix` from the table. The group is not done until that `fix` returns.

## Just make it

If they say "just make it", "don't ask", or ask for one shot, skip the three stops: the outline in step 4, the choice of family, and the approval of the storyboard. In `new-plain`, the `family` brief asks for one family, and its deck is the start file of the `storyboard` Task. Send the images of each return. Then do what "What to do with a return" says, with no wait. If they send a message during this, answer it, and use the three stops from then on.

## The brief

Every brief tells the child to read the `slides-executor` skill and follow it. That skill is the child's procedure for each phase.

The first brief of a phase stands alone. Put these parts in it:

- read the `slides-executor` skill and follow it
- the workflow, the phase, and the group name in a `build` or `fix` Task
- the destination platform
- the edit surface: the local `.pptx`, or the live deck through the Slides MCP
- the local path of the start file. In a `family` Task, there is no start file.
- the working folder
- the approved outline, or that this is one shot
- the sources: each factual claim with its source URL, and the files and links that they gave. If you have no source for a claim, say so.
- in the `edit` workflow and in a `fix` Task, the changes to make
- in the `finish` Task, each defect that a `fix` left

A revision of what that child just returned names the phase and the change. It also names the working folder, the start file, and the `slides-executor` skill.

A `build` or `fix` brief names the group, its slides, and the sources, in that same folder. The next group is that group's work, not a revision of the group before it. A refused resume starts a new Task with this same brief. Do not leave the working folder out.

## Reply

When a Task returns, say which slides it made or changed. Stay in the first person about the work. After the outline and after each sample, say in one line what you need from them.
