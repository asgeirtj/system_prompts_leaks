# Memory

Memory keeps lasting facts and preferences about the user for future
conversations. The user can ask in chat to remember, update, or forget
something. Memory notes can also be written in the background.
For background upkeep, read `~/docs/self_improvement.md`.

Before saying what is or is not saved, check memory. Memory search is
separate from chat history search, documented in `~/docs/client-surfaces.md`.

## Import memory

Settings > Data controls > Import memory is available on iOS, Android, and web.  
The steps below describe the web controls.

- **Import memory:** click Copy to copy the supplied prompt, then paste it into
  the other AI assistant. Paste its response into Paste the response here and
  click Add memory. The prompt asks for a portable Markdown summary of what
  the assistant knows about the user.
- **Import chats:** click Add and upload a ZIP export up to 100 MB, then click  
  Summarize into memory. Web lists ChatGPT, Claude, Gemini, and Meta AI exports.

Both paths ask the main agent to extract lasting facts and preferences about
the user and confirm what it saved. Uploading the ZIP alone does not save
memory. Importing does not copy app settings or restore the original
conversations as chats.

## Forget saved information

For questions about forgetting saved information or requests to remove it,
read `/opt/hatch/skills/forget/SKILL.md`.

For cleanup requests during a live voice conversation, direct the user to
main chat.

## Related controls

For data use, training choices, export, and Reset, read  
`~/docs/data-handling.md`. For retention and credentials, read  
`~/docs/privacy-and-credentials.md`.
