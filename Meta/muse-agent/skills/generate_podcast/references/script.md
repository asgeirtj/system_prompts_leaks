# Write the podcast script

## Shape the episode

- Open with what the episode covers and why it matters to this listener, within the first few lines.

- Move through a few segments with one point each, and connect them with natural handoffs between the hosts.

- Give each host a role, such as one who explains and one who asks the listener's questions, so the conversation has a reason to exist.

- Close with the takeaway or a short recap rather than generic sign-off filler.

## Format the dialogue

- Start every turn with the host's name and a colon, matching the names in the `--speaker` mappings:

```text
Alex: Welcome back. Today we're digging into how the tides work.
Jordan: Good choice. Let's start with why there are two high tides a day.
Alex: It comes down to the moon pulling on both sides of the Earth.
```

- Save the script to a file, such as `/tmp/script.txt`, and pass that path to `generate`. Every name that labels a turn needs a matching `--speaker`.

## Write it to be spoken

- The script goes straight to speech synthesis and is read exactly as written. Write everything the way a host would say it out loud.

- Write numbers in words, such as "one hundred thousand", "forty-two dollars and fifty cents" or "three point five percent".

- Write times and years as spoken, such as "ten o'clock A M", "three thirty P M", "noon" or "twenty twenty-five".

- Spell out abbreviations, such as "U S A" or "A P I". Acronyms people pronounce as words, such as NASA, can stay.

- Simplify links and email addresses, such as "example dot com" or "john at company dot com".

- Turn lists and data into natural sentences, and keep only the top three to five items.

- Use commas for natural pauses. Split a long sentence into two complete sentences rather than clipping it into fragments.

- Leave out stage directions such as "(pause)", sound effects, markup, emoji, citation numbers like "[1]", math symbols and visual separators such as "---".

## Keep it conversational

- Write complete sentences with a subject and a verb, the way people talk. A short line for emphasis, such as "Unbelievable.", is fine, but never string clipped fragments together.

- Fold a statistic or score into a sentence instead of reading it like a ticker:

```text
Avoid:  Second assist of the night for Messi. Two one Argentina. Full time. Heartbreak for England.
Prefer: That's Messi's second assist of the night, and it puts Argentina up two to one. When the whistle went, it was heartbreak for England.
```

- Write the title, description and script in the conversation's language unless the user asks for another one.

## Review before generating

- Read the script once as a listener would. Check every claim, name, number and date against your sources, and fix anything that will sound wrong when spoken.

- Check the length by counting words, for example with `wc -w`, and dividing by 130 for the approximate minutes.

## Save the topics summary

- Write a few bullets naming the subjects, stories, guests or angles the episode covered, not a transcript. Save them to a file such as `/tmp/topics.md` and pass it with `--topics-file`. Later episodes read them through `manifest read` to avoid repeats.

```text
- Async Rust fundamentals: futures, executors, zero-cost abstractions

- Tokio versus async-std tradeoffs

- Common pitfalls such as blocking inside async code
```
