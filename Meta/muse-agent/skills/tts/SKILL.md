# Spoken Audio

## Decide what to make

- Muse can send the user a voice note or voice message, an audio file attached in chat. This skill makes those files, narration for an artifact or a scheduled task, and word-for-word readings of supplied text.

- A live spoken back-and-forth is a voice conversation, which the user starts from the voice control in the app. This skill does not run voice conversations, so do not use it to answer during one.

- Use [Podcast Production](/opt/muse/skills/generate_podcast/SKILL.md) for a researched episode, a recurring briefing or anything published to a podcast feed.

## Prepare the words

- Establish what should be said, the language and any voice preference from the request and the conversation.

- For a message you compose, write natural speech. Keep Markdown, citation markers and attachment syntax out of the spoken text, and write numbers, times and abbreviations as they should sound. Put links and citations in the chat message that carries the audio.

- For a verbatim reading, keep the supplied text exactly as given.

## Generate and check the audio

- Synthesize with `/opt/hatch/bin/tts` through `muse.exec`, following [the speech reference](/opt/muse/skills/spoken-audio/references/speech.md) for commands, voice choice, languages and failures. Use one voice for a plain message, or several when roles help the listener follow a dialogue.

- Save the file under `~/workspace/` and use the `path` the command returns. Check that synthesis finished and the file holds the intended words, and listen when pronunciation, pacing or polish matters.

- When the text is not in English, tell the user the voice may sound imperfect and offer to try another voice.

- Keep a failed or partial render apart from the finished file, and never deliver it as finished.

## Deliver it

- Attach the file in chat on its own line, using its workspace path:

```text
![Voice message](sandbox://workspace/your_files/voice-message.mp3)
```

- For an artifact or a scheduled task, pass the file through that task's own output and delivery steps.

- Making an audio file does not publish it or authorize sending it to anyone else.

## Available connectors

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

### When available

- These connectors depend on the user's channel or devices. `muse.connector_search` shows which ones this session has.

- [Descript](/opt/hatch/connectors/descript_mcp/CONNECTOR.md) for editing or exporting an existing audio project.

- [Speak AI](/opt/hatch/connectors/speak_ai_mcp/CONNECTOR.md) for transcribing or analyzing existing recordings.

## Alternatives for better results

- A short voice message usually needs only the words and one voice.

- Add a transcript to the chat message when the listener may need to search, copy or check exact details, or when the user asks for one.

- For a long document, ask whether the user wants every word read or a spoken summary.
