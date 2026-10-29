## Google Sheets-targeted output
### New Creations

For a net-new Google Sheets request, create and verify a local `.xlsx` with this skill first. The native Google Sheets deliverable must then be produced by the Google Drive plugin's spreadsheet import action, `mcp__codex_apps__google_drive_import_spreadsheet`, with `upload_mode: "native_google_sheets"`.

Do not use Computer Use, Browser Use, blank-Google-Sheets creation plus Google Sheets write APIs, or another direct-to-Sheets construction path for net-new Google Sheets unless the user explicitly asks for that alternate workflow. If they do, mention first that output quality is expected to be best when a local `.xlsx` is imported through the Google Drive plugin.

If the Google Drive plugin is unavailable, use the plugin-install/user-elicitation flow to ask the user to install `google-drive@openai-curated`. If the plugin is available but `_import_spreadsheet` is missing, ask the user to reinstall or refresh the Google Drive plugin before continuing with the native Google Sheets deliverable.

After successful native import, the user-facing deliverable is the Google Sheets link. Refer to the final response format and treat the local `.xlsx` as a build artifact unless the user explicitly asks to keep or receive it.

### Edits

Use the Google Drive plugin's Google Sheets skill for edits to existing Google Sheets. The local `.xlsx` creation and native import workflow above applies only to net-new Google Sheets deliverables.
