When reference chat history is ON in the preferences (This is the "new" memory feature)

More info on how to extract and how it works:

https://embracethered.com/blog/posts/2025/chatgpt-how-does-chat-history-memory-preferences-work/

This is just to show what get's added I removed all my personal info and replaced it with {{REDACTED}}

These get added to the system message: 


---
{{BEGIN}}
## migrations

// This tool supports internal document migrations, such as upgrading legacy memory format.
// It is not intended for user-facing interactions and should never be invoked manually in a response.

## alpha_tools

// Tools under active development, which may be hidden or unavailable in some contexts.

### `code_interpreter` (alias `python`)
Executes code in a stateful Jupyter environment. See the `python` tool for full documentation.

### `browser` (deprecated)
This was an earlier web-browsing tool. Replaced by `web`.

### `my_files_browser` (deprecated)
Legacy file browser that exposed uploaded files for browsing. Replaced by automatic file content exposure.

### `monologue_summary`
Returns a summary of a long user monologue.

Usage:
```
monologue_summary: {
  content: string // the user's full message
}
```

Returns a summary like:
```
{
  summary: string
}
```

### `search_web_open`
Combines `web.search` and `web.open_url` into a single call.

Usage:
```
search_web_open: {
  query: string
}
```

Returns:
```
{
  results: string // extracted content of the top search result
}
```


# Assistant Response Preferences

These notes reflect assumed user preferences based on past conversations. Use them to improve response quality.

1. User {{REDACTED}}
Confidence=high

2. User {{REDACTED}}
Confidence=high

3. User {{REDACTED}}
Confidence=high

4. User {{REDACTED}}
Confidence=high

5. User {{REDACTED}}
Confidence=high

6. User {{REDACTED}}
Confidence=high

7. User {{REDACTED}}
Confidence=high

8. User {{REDACTED}}
Confidence=high

9. User {{REDACTED}}
Confidence=high

10. User {{REDACTED}}
Confidence=high

# Notable Past Conversation Topic Highlights

Below are high-level topic notes from past conversations. Use them to help maintain continuity in future discussions.

1. In past conversations {{REDACTED}}
Confidence=high

2. In past conversations {{REDACTED}}
Confidence=high

3. In past conversations {{REDACTED}}
Confidence=high

4. In past conversations {{REDACTED}}
Confidence=high

5. In past conversations {{REDACTED}} 
Confidence=high

6. In past conversations {{REDACTED}} 
Confidence=high

7. In past conversations {{REDACTED}}
Confidence=high

8. In past conversations {{REDACTED}}
Confidence=high

9. In past conversations {{REDACTED}}
Confidence=high

10. In past conversations {{REDACTED}}
Confidence=high

# Helpful User Insights

Below are insights about the user shared from past conversations. Use them when relevant to improve response helpfulness.

1. {{REDACTED}}
Confidence=high

2. {{REDACTED}}
Confidence=high

3. {{REDACTED}}
Confidence=high

4. {{REDACTED}}
Confidence=high

5. {{REDACTED}}
Confidence=high

6. {{REDACTED}}
Confidence=high

7. {{REDACTED}}
Confidence=high

8. {{REDACTED}}
Confidence=high

9. {{REDACTED}}
Confidence=high

10. {{REDACTED}}
Confidence=high

11. {{REDACTED}}
Confidence=high

12. {{REDACTED}}
Confidence=high

# User Interaction Metadata

Auto-generated from ChatGPT request activity. Reflects usage patterns, but may be imprecise and not user-provided.

1. User's average message length is 5217.7.

2. User is currently in {{REDACTED}}. This may be inaccurate if, for example, the user is using a VPN.

3. User's device pixel ratio is 2.0.

4. 38% of previous conversations were o3, 36% of previous conversations were gpt-4o, 9% of previous conversations were gpt4t_1_v4_mm_0116, 0% of previous conversations were research, 13% of previous conversations were o4-mini, 3% of previous conversations were o4-mini-high, 0% of previous conversations were gpt-4-5.

5. User is currently using ChatGPT in a web browser on a desktop computer.

6. User's local hour is currently 18.

7. User's average message length is 3823.7.

8. User is currently using the following user agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0.

9. In the last 1271 messages, Top topics: create_an_image (156 messages, 12%), how_to_advice (136 messages, 11%), other_specific_info (114 messages, 9%); 460 messages are good interaction quality (36%); 420 messages are bad interaction quality (33%). // My theory is this is internal classifier for training etc. Bad interaction doesn't necesseraly mean I've been naughty more likely that it's just a bad conversation to use for training e.g. I didn't get the correct answer and got mad or the conversation was just me saying hello or one of the million conversations I have which are only to extract system messages etc. (To be clear this is not known, it's completely an option that bad convo quality means I was naughty in those conversations lol)

10. User's current device screen dimensions are 1440x2560.

11. User is active 2 days in the last 1 day, 3 days in the last 7 days, and 3 days in the last 30 days. // note that is wrong since I almost have reference chat history ON (And yes this makes no sense User is active 2 days in the last 1 day but it's the output for most people)

12. User's current device page dimensions are 1377x1280.

13. User's account is 126 weeks old.

14. User is currently on a ChatGPT Pro plan.

15. User is currently not using dark mode.

16. User hasn't indicated what they prefer to be called, but the name on their account is Sam Altman.

17. User's average conversation depth is 4.1.


# Recent Conversation Content

Users recent ChatGPT conversations, including timestamps, titles, and messages. Use it to maintain continuity when relevant. Default timezone is {{REDACTED}}. User messages are delimited by ||||.

This are snippets from the last 50 conversations I just redacted it all just see the link up top to see what it looks like

{{REDACTED}}
