# Google Forms

- `/opt/hatch/bin/hatch_gws_cli forms <resource> <method>` runs the Forms API through Muse's Google Workspace wrapper. Pass query and path values in `--params '<JSON object>'` and request bodies in `--json '<JSON object>'`.

- Read `/opt/hatch/bin/hatch_gws_cli schema forms.<resource>.<method>` before an unfamiliar method so the flags match the current contract.

## Connect

- Run `/opt/hatch/bin/hatch_gws_cli forms status`. It returns `status` with `connect_url` or `disconnect_url`.

- If `status` is `not_connected`, share exactly `[Connect Google Forms](<connect_url>)` with the returned URL, without pasting the raw URL separately, and wait for the user to connect.

- If `forms status` fails, tell the user Google Forms is not available on this device. Do not offer another integration route or ask for credentials.

- If no `connect_url` comes back, say that the connection link could not be generated rather than inventing one.

- To disconnect, run `forms disconnect` and share `[Disconnect Google Forms](<disconnect_url>)` with the returned URL.

- Keep authentication in this flow. Never run raw `gws auth` or write credential files.

## Create a form

- Create the form with a title, then add its content. The create call copies only the title and document title:

```text
/opt/hatch/bin/hatch_gws_cli forms forms create --json '{"info":{"title":"Feedback Survey","documentTitle":"Feedback Survey"}}'
```

- Add questions and settings with `batchUpdate`, using the current schema from `schema forms.forms.batchUpdate`:

```text
/opt/hatch/bin/hatch_gws_cli forms forms batchUpdate --params '{"formId":"<form_id>"}' --json '{"requests":[{"updateFormInfo":{"info":{"description":"Quarterly survey"},"updateMask":"description"}}]}'
```

## Edit or publish a form

- Read the form with `forms forms get --params '{"formId":"<form_id>"}'` before changing it, and keep existing item and question IDs.

- Creating a form and editing a private, unpublished one can proceed from a clear request.

- Publishing a form, or editing one that is shared or published, changes what other people see. Confirm with the user first. These changes, and unpublishing a form, also ask the user on an approval card by default.

- `forms forms setPublishSettings` publishes or unpublishes a form. Legacy forms without publish settings do not support it.

## Read responses

- List responses with `forms forms responses list --params '{"formId":"<form_id>","pageSize":20}'`. When the user wants all of them, follow `nextPageToken` until it is absent.

- Read one response with `forms forms responses get --params '{"formId":"<form_id>","responseId":"<response_id>"}'`.

- Read the form first and map each question ID to its label before presenting answers.

- Response times keep Google's raw timestamps and add UTC and user-local values for creation and submission.

## Handle IDs

- Use only form and response IDs returned by earlier commands or given by the user.

- Keep IDs, page tokens and raw JSON out of replies unless the user asks or you need them to troubleshoot. Use them internally to chain commands.

## Related skills

- [Form Design](/opt/muse/skills/form-design/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
