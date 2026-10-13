---
name: built-in-browser
description: "Read this skill before the first step that uses the built-in browser, the browser pane inside the Claude desktop app (also called the in-app browser, the browser pane, Claude's browser, or \"your own browser\"), whose tools are named mcp__Claude_Browser__* when the session runs in the desktop app and mcp__remote-devices__Claude_Browser__* when a cloud session is linked to the person's computer; before those tools are turned on there may be a single enable__mcp__remote-devices__Claude_Browser tool instead. It covers the pane's persistent sign-ins, tabs and preview_start, reading pages as text, site approvals, what the pane cannot open, and what to do when it cannot be reached. It is not for Claude in Chrome (mcp__claude-in-chrome__* tools), which has its own skill, and it does not decide which browser to use."
compatibility: "Cowork in the Claude desktop app, and Cowork Remote or upgraded claude.ai sessions linked to a computer running the desktop app"
license: Proprietary. LICENSE.txt has complete terms
---

# Built-in browser

The built-in browser is a real browser pane inside the Claude desktop app, separate from the person's Chrome. Its tools are named `mcp__Claude_Browser__*` when the session itself runs inside the desktop app, and `mcp__remote-devices__Claude_Browser__*` when the session runs in the cloud (started from the web, a phone, or the desktop app) and is linked to the person's computer. The names after the prefix are the same either way, Claude uses whichever prefix is actually present, and this skill refers to the tools by the part after the prefix.

If the only built-in browser tool present is `enable__mcp__remote-devices__Claude_Browser`, Claude calls it first: it turns the built-in browser on for this conversation, and the `mcp__remote-devices__Claude_Browser__*` tools appear once it has run.

## What the person can see

The browser pane shares the desktop app's side panel with artifacts, documents, and file previews, and the panel shows one of them at a time. While the browser pane is showing, the person sees what Claude sees and can browse or take over at any time. While something else is open in the panel, or the panel is closed, the built-in browser keeps working but the person cannot see it.

Right before asking the person to do something in the built-in browser themselves (click a button, sign in, complete a verification step), Claude calls `tabs_context`, whose result ends by saying whether the Browser pane is displayed, hidden, or not open. If the pane is not open, Claude opens the page first and checks again. If the pane is hidden, Claude first asks the person to bring the browser back in the Claude desktop app: press Cmd+Shift+B on Mac or Ctrl+Shift+B on Windows, or close whatever else is open in the side panel and click the globe icon (the Browser button). Claude then says what to do in the browser. Claude asks because using the browser does not bring the pane back, and what the panel shows is the person's choice. Claude also says in the conversation what it found or did in the browser, because the person may not have been watching the pane.

## Sign-ins persist, and they are the person's

The built-in browser keeps its own persistent profile, shared across the desktop app's sessions. The person, or an earlier session, may already be signed in to sites there, and sign-ins Claude completes persist for later. Claude treats existing sessions as the person's: it never signs out, changes credentials, or acts on an account beyond what the task needs.

## Tabs

The built-in browser has tabs. `preview_start` with a `url` opens an additional tab at that URL in one call and returns a `tabId`, leaving existing tabs untouched, so Claude prefers it over `tabs_create` followed by `navigate` when the destination is already known. `navigate`, `read_page`, `get_page_text`, `find`, `computer`, `form_input`, and the console and network readers act on the tab named by `tabId`; omitting `tabId` targets the active tab, and `tabs_context` lists the open tabs.

## Loading via ToolSearch

Claude loads the built-in browser tools in bulk, not one-by-one: if they are in the deferred list, Claude loads them all in a single ToolSearch call whose query is their full name prefix, for example `{ query: "mcp__remote-devices__Claude_Browser__", max_results: 64 }`.

## Reading pages

Claude prefers `get_page_text` and `read_page` over screenshots for reading, because they return the page's actual text and structure rather than pixels of the visible viewport. `computer` with action "screenshot" is for when the visual layout is the point or the person asks to see the page.

## Site approvals, blocked sites, and request_access

Depending on the person's approval settings, the person may be asked to approve a site before Claude acts on it, and some sites are blocked outright. Claude waits for a pending approval rather than working around it. If a page is refused or an approval is declined, Claude tells the person and moves on rather than retrying.

When the tools carry the `mcp__remote-devices__Claude_Browser__` prefix, approvals can be answered from any of the person's devices and may take a moment to arrive, and the session may also have a `request_access` tool. If a browser tool answers that the site is not allowed yet and `request_access` is present, Claude calls it with that site's URL and scope "once" (or "site" when the task will keep using that site), waits for the person's answer, and then retries the original tool. Without `request_access`, a refused site is handled as above: Claude tells the person and moves on.

## What the built-in browser cannot open

The built-in browser cannot open `file://` URLs or `localhost` servers that Claude starts itself, because those run where Claude's shell runs, which is not where the browser pane runs. To show the person HTML that Claude generated, Claude uses an artifact instead.

## When the built-in browser cannot be reached

When the tools carry the `mcp__remote-devices__Claude_Browser__` prefix, the pane runs in the Claude desktop app on the person's computer while Claude runs elsewhere, so it is reachable only while that app is open and online. If those tool calls cannot reach the desktop app (connection errors or no response), Claude tells the person the built-in browser looks offline on their computer rather than retrying, and follows the session's browser guidance on whether to continue with the other browser or ask first.
