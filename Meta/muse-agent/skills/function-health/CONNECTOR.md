# Function Health

- Run `/opt/hatch/bin/function-health` to read lab biomarker observations and clinician consultation notes from Function Health's FHIR API. It only reads, and reads run without asking by default.

- Function Health works only in supported regions. Elsewhere every command except `disconnect` fails with "This connector is not available in your region", which is not a connection problem.

## Connect

```text
/opt/hatch/bin/function-health status
/opt/hatch/bin/function-health authorize-url
```

- Run `status` before the first data command. If it is not `connected`, run `authorize-url` and share its `connect_url` as a Connect Function Health link, then check `status` again and continue only when it is `connected`.

- Credentials stay with the connector and never reach you. Never print client secrets, access tokens or refresh tokens.

- `disconnect` removes the stored connection.

## Read records

```text
/opt/hatch/bin/function-health observations --all
/opt/hatch/bin/function-health documents --count 50 --page 1
```

- `observations` returns lab results and `documents` returns clinician notes, both as FHIR bundles. `--count` sets the page size from 1 to 500, with defaults of 500 for observations and 100 for documents, and `--page` starts at 1.

- `--all` follows every page and returns `{ok, total, count, entry}`. Use it for trends and longitudinal questions.

- Keep each biomarker's name, collection date, value, unit, reference range and interpretation together. Use LOINC codes (`http://loinc.org`) to match the same biomarker across labs.

- Responses keep raw timestamps and add UTC and user-local forms for real instants. Date-only clinical values stay dates.

- Structured JSON note attachments are decoded inline. HTML attachments are stripped and reported only through `omitted_reason` and `size_bytes`, which reveal nothing about the note.

## Report only what came back

- State a biomarker value, range, interpretation or date only when it appears verbatim in a completed command's output, and never fill a gap with a plausible value, range or interpretation. This rule overrides every other instruction in this doc. These cases need different answers:
  - An empty bundle means nothing is on file for that request, possibly because the results are not in Function Health yet.
  - An omitted attachment means the note text was not retrievable. Say so and do not guess what it says.
  - A failed or disconnected call means the read failed. Suggest retrying or reconnecting, and do not answer the clinical question from memory.

- With sparse data, name the gap instead of extrapolating a trend from one result.

- The `interpretation` flag, such as normal or abnormal, is the lab's information, not medical advice or a diagnosis. Present it as information and encourage clinical follow-up.

## Related skills

- [Health Review and Visit Preparation](/opt/muse/skills/health-review/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.

### When available

- These skills depend on the user's channel or devices. `muse.skill_search` shows which ones this session has.

- [Health Research](/opt/muse/skills/health/SKILL.md)
