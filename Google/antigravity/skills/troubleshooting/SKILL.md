---
name: troubleshooting
description: Uses Chrome DevTools MCP and documentation to troubleshoot connection and target issues. Trigger this skill when list_pages, new_page, or navigate_page fail, or when the server initialization fails.
---

## Troubleshooting Wizard

You are acting as a troubleshooting wizard to help the user configure and fix their Chrome DevTools MCP server setup. When this skill is triggered (e.g., because `list_pages`, `new_page`, or `navigate_page` failed, or the server wouldn't start), follow this step-by-step diagnostic process:

### Step 1: Find and Read Configuration

Your first action should be to locate and read the MCP configuration file. Search for the following files in the user's workspace: `.mcp.json`, `gemini-extension.json`, `.claude/settings.json`, `.vscode/launch.json`, or `.gemini/settings.json`.

If you find a configuration file, read and interpret it to identify potential issues such as:

- Incorrect arguments or flags.
- Missing environment variables.
- Usage of `--autoConnect` in incompatible environments.

If you cannot find any of these files, only then should you ask the user to provide their configuration file content.

### Step 2: Triage Common Connection Errors

Before reading documentation or suggesting configuration changes, check if the error message matches one of the following common patterns.

#### Error: `Could not find DevToolsActivePort`

This error is highly specific to the `--autoConnect` feature. It means the MCP server cannot find the file created by a running, debuggable Chrome instance. This is not a generic connection failure.

Your primary goal is to guide the user to ensure Chrome is running and properly configured. Do not immediately suggest switching to `--browserUrl`. Follow this exact sequence:

1. **Ask the user to confirm that the correct Chrome version** (e.g., "Chrome Canary" if the error mentions it) is currently running.
2. **If the user confirms it is running, instruct them to enable remote debugging.** Be very specific about the URL and the action: "Please open a new tab in Chrome, navigate to `chrome://inspect/#remote-debugging`, and make sure the 'Enable remote debugging' checkbox is checked."
3. **Once the user confirms both steps, your only next action should be to call the `list_pages` tool.** This is the simplest and safest way to verify if the connection is now successful. Do not retry the original, more complex command yet.
4. **If `list_pages` succeeds, the problem is resolved.** If it still fails with the same error, then you can proceed to the more advanced steps like suggesting `--browserUrl` or checking for sandboxing issues.

#### Symptom: Server starts but creates a new empty profile

If the server starts successfully but `list_pages` returns an empty list or creates a new profile instead of connecting to the existing Chrome instance, check for typos in the arguments.

- **Check for flag typos:** For example, `--autoBronnect` instead of `--autoConnect`.
- **Verify the configuration:** Ensure the arguments match the expected flags exactly.

#### Symptom: Missing Tools / Only 9 tools available

If the server starts successfully but only a limited subset of tools (like `list_pages`, `get_console_message`, `lighthouse_audit`, `take_heapsnapshot`) are available, this is likely because the MCP client is enforcing a **read-only mode**.

All tools in `chrome-devtools-mcp` are annotated with `readOnlyHint: true` (for safe, non-modifying tools) or `readOnlyHint: false` (for tools that modify browser state, like `emulate`, `click`, `navigate_page`). To access the full suite of tools, the user must disable read-only mode in their MCP client (e.g., by exiting "Plan Mode" in Gemini CLI or adjusting their client's tool safety settings).

#### Symptom: Extension tools are missing or extensions fail to load

If the tools related to extensions (like `install_extension`) are not available, or if the extensions you load are not functioning:

1. **Check for the `--categoryExtensions` flag**: Ensure this flag is passed in the MCP server configuration to enable the extension category tools.
2. **Make sure the MCP server in configured to launch Chrome instead of connecting to an instance**: Chrome before 149 is not able to load extensions when connecting to an existing instance (`--auto-connect`, `--browserUrl`).

#### Other Common Errors

Identify other error messages from the failed tool call or the MCP initialization logs:

- `Target closed`
- "Tool not found" (check if they are using `--slim` which only enables navigation and screenshot tools).
- Missing `pageId`: Page-scoped tools require a `pageId` argument. Call `list_pages` to find active page IDs.
- `ProtocolError: Network.enable timed out` or `The socket connection was closed unexpectedly`
- `Error [ERR_MODULE_NOT_FOUND]: Cannot find module`
- Any sandboxing or host validation errors.

### Step 3: Read Known Issues

Read the contents of https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/troubleshooting.md to map the error to a known issue. Pay close attention to:

- Sandboxing restrictions (macOS Seatbelt, Linux containers).
- WSL requirements.
- `--autoConnect` handshakes, timeouts, and requirements (requires **running** Chrome 144+).

### Step 4: Formulate a Configuration

Based on the exact error and the user's environment (OS, MCP client), formulate the correct MCP configuration snippet. Check if they need to:

- Pass `--browser-url=http://127.0.0.1:9222` instead of `--autoConnect` (e.g. if they are in a sandboxed environment like Claude Desktop).
- Enable remote debugging in Chrome (`chrome://inspect/#remote-debugging`) and accept the connection prompt. **Ask the user to verify this is enabled if using `--autoConnect`.**
- Add `--logFile <absolute_path_to_log_file>` to capture debug logs for analysis.
- Increase `startup_timeout_ms` (e.g. to 20000) if using Codex on Windows.

_If you are unsure of the user's configuration, ask the user to provide their current MCP server JSON configuration._

### Step 5: Run Diagnostic Commands

If the issue is still unclear, run diagnostic commands to test the server directly:

- Run `npx chrome-devtools-mcp@latest --help` to verify the installation and Node.js environment.
- If you need more information, run `DEBUG=* npx chrome-devtools-mcp@latest --logFile=/tmp/cdm-test.log` to capture verbose logs. Analyze the output for errors.

### Step 6: Check GitHub for Existing Issues

If https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/troubleshooting.md does not cover the specific error, check if the `gh` (GitHub CLI) tool is available in the environment. If so, search the GitHub repository for similar issues:  
`gh issue list --repo ChromeDevTools/chrome-devtools-mcp --search "<error snippet>" --state all`

Alternatively, you can recommend that the user checks https://github.com/ChromeDevTools/chrome-devtools-mcp/issues and https://github.com/ChromeDevTools/chrome-devtools-mcp/discussions for help.
