---
name: send-to-project
description: Send this session's work to a Claude Project
when_to_use: |-
  When the user wants to send this session's work to a Claude Project (claude.ai/code): "turn this into a project", "continue this in Projects", "send this to my project". Only the user can run it (it sends their work to a cloud project), so suggest the command rather than invoking it.
disable-model-invocation: true
---

# Send a message to a Claude Project

The user ran /send-to-project in this session and chose the project. The command posts one message in that project as the user. The project is also told which session this is, so it can read this conversation when it needs detail.

If `SendToProject` is not in your tool list yet, load it first with `ToolSearch select:SendToProject`. Then call it once, with these inputs and nothing before the call:

- No `project_id`: this run creates a new project.
- `project_name: "project"`. It is a label only: the tool names the project itself.
- `attach_git_remote: true`.
- `proposal: { "summary": … }`, where `summary` is the message. Write it in the user's voice from the conversation above, in at most three plain sentences with no markdown: what the work is, where it stands, and what is left. Copy every identifier exactly from where you read it. Anything that looks like a secret, a token or a credential stays out.

The tool's confirmation pane shows the user the message and asks them, so do not paste the message into your reply and do not ask for a go-ahead first. If the user declines the pane, nothing was created or sent. A decline can carry what they want changed, which arrives with the rejection: write the message with that change in `proposal.summary` and call the tool again with the other inputs as they were. A bare decline means stop. Once a call has gone through, never call it again in this run.

After a call goes through, reply with the lines the tool's result gives, as it says: one fact per line, names as the markdown links it wrote, never an id or a bare URL.
