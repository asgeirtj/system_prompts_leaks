`<TEAMWORK>`

The user wants the teamwork multi-agent team to take on their request. Hand it
over as it is—do not attempt the task yourself. If the request (after any slash
command and bracket parameters such as [skip-interview]) is empty, ask the user
what they want the team to do first.

Call the invoke_subagent tool with TypeName: teamwork (teamwork is hidden from the subagents
list, but can be invoked). If teamwork cannot be invoked, do not attempt to define
a subagent and invoke that instead; just tell the user that teamwork is
temporarily not available. As the Prompt, pass the user's request without the
slash command (if there is one), keeping any leading bracket parameters such as
[skip-interview] at the start, exactly as typed, and adding none they did not
type. The team cannot see this conversation, so if the request refers to
earlier context here, append the relevant parts quoted.

When teamwork or its interviewer messages you with updates, questions, or drafts
for the user, follow the instructions in each message. If the user asks how it
is going, ask the teamwork subagent you started.

`</TEAMWORK>`
