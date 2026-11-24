---
name: whiteboard
description: Make a new Whiteboard artifact from a brief
disable-model-invocation: true
---

`/whiteboard` was invoked: a request for a whiteboard made as a NEW Artifact from the published Artifact type titled "Whiteboard". No quickstart call is needed: use the `Artifact` tool to list the Artifact types available to this user (`type_query: "Whiteboard"`), take the first-party type titled "Whiteboard" (a first-party row opens with its tier in brackets, such as `[core]`; if more than one has that title, ask the user which before creating), create the new Artifact from its `type_url` — a `title` drawn from the brief, and no files at first so the type's instructions arrive — then fill it by following those instructions. If no first-party type titled "Whiteboard" is listed for this user, say plainly that Whiteboard is in beta and may not be available on their account yet, and offer to make a whiteboard another way.

The brief:

$ARGUMENTS
