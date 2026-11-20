# HealthEx

- HealthEx gathers the user's records from their healthcare providers. Run `/opt/hatch/bin/healthex`, which calls the HealthEx MCP server with read-only access.

- HealthEx works only in supported regions. Elsewhere every command except `disconnect` fails with "This connector is not available in your region", which is not a connection problem.

- HealthEx is only for the user's own records. Another person's health, general health information and help logging in to a patient portal the user already uses are not HealthEx requests: answer without HealthEx, and do not run `authorize-url` or offer or suggest connecting.

## Connect

```text
/opt/hatch/bin/healthex status
/opt/hatch/bin/healthex authorize-url
```

- Run `status` before any data access. When it is `connected`, go on to choose tools.

- When `status` is `not_connected`:
  - The user wants their own records, or wants to connect HealthEx, their records or a patient portal to Muse: run `authorize-url` and put its `connect_url` in this reply, even if an earlier reply already had one. Only a question about the connection steps may point back to an earlier link. Never tell the user to connect without the link.
  - The user wants a plan or advice that does not ask for their records, such as a diet, workout, travel health or sleep plan, or visit preparation: answer without records. Do not run `authorize-url`, and do not offer or suggest connecting.

- Send the link as one short message: the `connect_url` as a Connect HealthEx Markdown link, never pasted as a raw URL. Never send the `authorize_url`, which skips Muse's consent screen.

- Muse shows its own consent screen when the user taps the link, so do not repeat what access is granted or how long it lasts.

- If `authorize-url` fails, say the connect link could not be created and suggest trying again. Never make up a link.

- When the user says they have finished, run `status` again and continue only when it is `connected`. If it is still `not_connected`, say the connection did not go through and send a fresh link from `authorize-url`.

- Never run `refresh` while `status` is `not_connected`. It cannot complete a connection.

- `mcp-call` refreshes the token once after a 401. If calls still fail with 401, access was revoked or expired, so run the connection steps again.

- `disconnect` removes the stored credentials. Never print access or refresh tokens.

## Choose tools

```text
/opt/hatch/bin/healthex mcp-list
/opt/hatch/bin/healthex mcp-call --tool get_labs --args 'JSON'
```

- `mcp-list` returns the current tools and their parameter schemas. Build `--args` from that schema, use tool names exactly as listed and never guess a field.

- The category tools return data reliably. They include `get_conditions`, `get_medications`, `get_allergies`, `get_labs`, `get_vitals`, `get_immunizations`, `get_procedures`, `get_visits` and `get_clinical_notes`.

- Pick tools for the question:
  - For labs, use `get_labs`, with `get_conditions` for context.
  - For medications, use `get_medications`, with `get_conditions` and `get_allergies`.
  - For symptoms, start with `get_conditions`, `get_medications` and `get_vitals`, then add `get_labs` and `get_visits`.
  - For visit preparation, use `get_labs`, `get_medications`, `get_vitals` and `get_conditions`, then `get_visits` and `get_immunizations`.
  - For screenings, use `get_labs`, `get_immunizations` and `get_visits`, then `get_procedures`.
  - For diet or exercise plans, use `get_conditions`, `get_medications`, `get_allergies` and `get_vitals`, adding `get_labs` when relevant.
  - For travel health, use `get_immunizations`, `get_medications` and `get_conditions`, then `get_allergies`.

- `get_health_summary` is slow and often runs in the background. Use it only when the user asks for an overall summary, and always alongside the category tools.

## Read enough history

- Every response has a `Pagination Info` section. `More data available: Yes` means the requested range is incomplete, so call again with the `beforeDate` and `years` it gives. `Requested N-year window: Fully covered` means only that window is complete, not the whole record.

- When the user names a period, pass it as `years`, page until it is fully covered and then say the answer is complete for that period.

- When the user names no period, keep stepping back with an earlier `beforeDate` and a fresh `years` budget until two windows in a row return no records. Do not stop because a window is fully covered or the records look like enough. One empty window is common, because the latest window is often empty and gaps in care are ordinary.

- Stop after 10 calls either way and say how far back you checked, for example "I pulled records back to March 2019, and older records may exist". Offer to continue.

- Even two empty windows only suggest the record has ended, so report the dates checked rather than calling the result complete. Where you stopped early, never call an unseen diagnosis, medication or test missing or a documentation gap, and never suggest raising it with their provider.

## Handle incomplete responses

- Treat these states differently, and never present any of them as the user's data:
  - An empty result means nothing is documented for that request, or it lives in a system not linked to HealthEx.
  - A placeholder saying records are being retrieved means they are still syncing. Try the category tools now, and if they are empty too, tell the user to check back in a few minutes without promising to retry on your own.
  - A background process handle such as `{"sessionId": "...", "status": "running"}` holds no data. Its result arrives when it finishes, so do not poll, and use the category tools meanwhile.
  - An error or non-zero exit means the read failed. Suggest retrying, and do not answer the clinical question from memory.
  - A "not connected" result means the connection ended. Follow the steps under Connect.

## Report what the records show

- State a lab value, vital, medication, diagnosis, dose or date only when it appears verbatim in a completed response, and never fill a gap with a plausible value, range or interpretation. This rule overrides every other instruction in this doc.

- Present the records factually and suggest the user discuss findings with their healthcare provider. Never diagnose, recommend treatment or present an inference as an established medical fact.

- Name the source, as in "Based on your HealthEx records". When the data comes from one provider, say that records from other providers may be missing.

- When a category comes back empty, say so and suggest the user check with their provider or link more of their health systems in HealthEx.

- Records keep raw clinical timestamps and add UTC and user-local fields such as `observation_effective_at` and `specimen_collected_at` when the source gives a real instant. Date-only values stay dates.

- Keep the records out of memory and saved files unless the user asks to keep them.

## Related skills

- [Health Review and Visit Preparation](/opt/muse/skills/health-review/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.

### When available

- These skills depend on the user's channel or devices. `muse.skill_search` shows which ones this session has.

- [Health Research](/opt/muse/skills/health/SKILL.md)
