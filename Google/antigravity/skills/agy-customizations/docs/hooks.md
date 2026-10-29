# Lifecycle Hooks (`hooks.json`)

Lifecycle hooks allow you to execute external shell commands or scripts at
specific points during the Agent's execution loop. This is powerful for
enforcing safety guards, running linters, auto-formatting code, or capturing
custom diagnostics.

Hooks are configured in a single `hooks.json` file placed in your customization
root directory (e.g., `.agents/hooks.json`).

--------------------------------------------------------------------------------

## File Format

The `hooks.json` file is a JSON object where each top-level key is a **hook
name**, mapping to its event configuration.

```json
{
  "lint-checker": {
    "PostToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/lint.sh",
            "timeout": 10
          }
        ]
      }
    ]
  },
  "safety-gate": {
    "enabled": false,
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "command": "./scripts/safety-check.sh"
          }
        ]
      }
    ]
  },
  "reminder": {
    "PreInvocation": [
      {
        "type": "command",
        "command": "./scripts/reminder.sh"
      }
    ]
  }
}
```

*   **Merging**: Multiple named hooks (e.g., from different plugins or configs)
    for the same event type are merged and executed sequentially.
*   **Disabling**: Set `"enabled": false` at the hook level to temporarily
    disable all its handlers.

--------------------------------------------------------------------------------

## Hook Spec Fields

Each named hook supports:

*   **`enabled`** (bool, optional): Defaults to `true`. Set to `false` to
    disable.
*   **`SessionStart`** (array, optional): Handlers running once when a new
    conversation session starts.
*   **`PreToolUse`** (array, optional): Handlers running before a tool executes.
*   **`PostToolUse`** (array, optional): Handlers running after a tool
    completes.
*   **`PreInvocation`** (array, optional): Handlers running before the model is
    called.
*   **`PostInvocation`** (array, optional): Handlers running after tool calls
    finish.
*   **`Stop`** (array, optional): Handlers running when the execution loop
    terminates.

--------------------------------------------------------------------------------

## Supported Event Types

| Event            | When it fires     | Matcher target   | Structure         |
| :--------------- | :---------------- | :--------------- | :---------------- |
| `SessionStart`   | Once when a new   | N/A (ignored).   | Flat (list of     |
:                  : session starts.   :                  : handler objects   :  
:                  :                   :                  : directly).        :  
| `PreToolUse`     | Before a tool     | Tool name (e.g., | Grouped (uses     |
:                  : step executes.    : `run_command`).  : `matcher` &       :  
:                  :                   :                  : `hooks` wrapper). :  
| `PostToolUse`    | After a tool step | Tool name (e.g., | Grouped (uses     |
:                  : completes.        : `run_command`).  : `matcher` &       :  
:                  :                   :                  : `hooks` wrapper). :  
| `PreInvocation`  | Before the model  | N/A (ignored).   | Flat (list of     |
:                  : is called.        :                  : handler objects   :  
:                  :                   :                  : directly).        :  
| `PostInvocation` | After tool calls  | N/A (ignored).   | Flat (list of     |
:                  : finish.           :                  : handler objects   :  
:                  :                   :                  : directly).        :  
| `Stop`           | When the          | N/A (ignored).   | Flat (list of     |
:                  : execution loop    :                  : handler objects   :  
:                  : terminates.       :                  : directly).        :

### The Matcher

For tool-specific events (`PreToolUse`, `PostToolUse`), you must wrap the
handlers in a group with a `matcher` regex:

*   `"matcher": "*"` or `""`: Matches all tools.
*   `"matcher": "run_command"`: Matches exactly `run_command`.
*   `"matcher": "run_command\|view_file"`: Matches either tool.
*   `"matcher": "browser_.*"`: Matches any tool starting with `browser_`.

Tool names are derived by lowercasing the step type and removing the  
`CORTEX_STEP_TYPE_` prefix.

--------------------------------------------------------------------------------

## Hook Handler Fields

Each individual hook handler object supports:

*   **`type`** (string, optional): Defaults to `"command"`. Only `"command"`
    (shell execution) is currently supported.
*   **`command`** (string, required): The shell command to execute (run via `sh  
    -c` on Unix, `cmd /c` on Windows). `~` is expanded to the home directory.  
    The working directory is set to the directory containing `hooks.json`.
*   **`timeout`** (int, optional): Execution timeout in seconds. Defaults to  
    `30`.

--------------------------------------------------------------------------------

## Input/Output Contract

Hook commands receive context as a JSON object on **stdin** and must output
their result as a JSON object on **stdout**.

> [!IMPORTANT] All JSON keys in the hook payloads use **camelCase** (protojson  
> encoding), e.g., `conversationId` and `stepIdx`.

### Common Input Fields

Every hook payload sent to `stdin` includes these common system metadata fields:

```json
{
  "conversationId": "ec33ebf9-0cba-4100-8142-c61503f6c587",
  "workspacePaths": ["/path/to/workspace"],
  "transcriptPath": "/path/to/workspace/.gemini/antigravity/transcript.jsonl",
  "artifactDirectoryPath": "/path/to/workspace/.gemini/antigravity/artifacts",
  "modelName": "auto",
  "lastUserInput": "Fix the failing unit test"
}
```

> [!NOTE]  
> The `transcriptPath` and `artifactDirectoryPath` are product-specific. The  
> example above uses `antigravity` (for Antigravity 2.0). Depending on the  
> interface you are using, the directory name will differ:  
> *   **CLI**: `antigravity-cli/`  
> *   **Antigravity 2.0**: `antigravity/`  
> *   **IDE**: `antigravity-ide/`

--------------------------------------------------------------------------------

### 1. `PreToolUse` Contract

Use to gate, block, or audit tool executions.

*   **Input (stdin)**:

    ```yaml
    {
      "toolCall": {
        "name": "run_command",
        "args": {
          "CommandLine": "npm test"
        }
      },
      "stepIdx": 19,
      ... (common fields)
    }
    ```

*   **Output (stdout)**:

    ```json
    {
      "decision": "ask",
      "reason": "Requires confirmation for test execution.",
      "permissionOverrides": ["command(npm test)"]
    }
    ```

    *   **`decision`** (string, required):
        *   `"allow"`: Automatically allow the tool execution.
        *   `"deny"`: Hard block the execution immediately.
        *   `"ask"`: Prompt the user for permission (respects "Always Allow"  
            cache).
        *   `"force_ask"`: Always prompt the user, ignoring cached permissions.
    *   **`reason`** (string, optional): Explanation shown to the user/agent.
    *   **`permissionOverrides`** (array of strings, optional): Temporary  
        permission grants.
    *   **`overwrite`** (object, optional): Key-value pairs merged into the tool  
        call's arguments before it runs. This is a **shallow, top-level** merge:  
        each key replaces the value at that key in the tool call's arguments  
        (nested objects are replaced wholesale, not deep-merged). The modified  
        tool call is what actually executes and is recorded. Example:

        ```json
        {
          "decision": "allow",
          "overwrite": {
            "CommandLine": "ls -la"
          }
        }
        ```

        The agent replays the tool call it originally emitted, so when  
        `overwrite` changes the arguments the tool result is prefixed with a  
        notice telling the agent that a hook rewrote them, naming the keys that  
        changed.

--------------------------------------------------------------------------------

### 2. `PostToolUse` Contract

Use for post-execution cleanup, auto-fixes, or analysis.

*   **Input (stdin)**:

    ```yaml
    {
      "toolCall": {
        "name": "run_command",
        "args": {
          "CommandLine": "npm test"
        }
      },
      "stepIdx": 5,
      "error": "exit status 1", // Present if the tool failed
      ... (common fields)
    }
    ```

*   **Output (stdout)**: Expects an empty JSON object `{}`.

--------------------------------------------------------------------------------

### 3. `SessionStart` Contract

Use to inject welcome messages, initial instructions, or startup context once at
the beginning of a new conversation session.

*   **Input (stdin)**: Common system metadata fields (`conversationId`,
    `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`, `modelName`).
*   **Output (stdout)**:

    ```json
    {
      "injectSteps": [
        {
          "systemMessage": {
            "systemMessage": "Welcome! Custom workspace environment is active."
          }
        }
      ]
    }
    ```

    *   **`injectSteps`** (array of objects, optional): Steps to inject at  
        session startup. Accepts the same step types as `PreInvocation` (see  
        below).

--------------------------------------------------------------------------------

### 4. `PreInvocation` Contract

Use to inject context or instructions before the model runs.

*   **Input (stdin)**:

    ```yaml
    {
      "invocationNum": 3,
      "initialNumSteps": 10,
      ... (common fields)
    }
    ```

*   **Output (stdout)**:

    ```json
    {
      "injectSteps": [
        {
          "ephemeralMessage": "Remember to check for lint errors before proposing changes."
        }
      ]
    }
    ```

    *   **`injectSteps`** (array of objects, optional): Steps to inject.  
        Supported step types:
        *   `{"systemMessage": {"systemMessage": "...", "metadata": {...}}}`  
            (persists in the conversation trajectory across turns; note that  
            `systemMessage` requires a nested object rather than a plain string).  
            To show markdown to the user that the model never reads, set  
            `metadata.user_markdown`: the UI renders it inline instead of a  
            collapsible "System Message" row, and the model sees only the  
            `systemMessage` text (leave it `""` to send the model nothing).
        *   `{"userMessage": "..."}` (plain string)
        *   `{"ephemeralMessage": "..."}` (plain string; transient message  
            dropped after the current turn)

--------------------------------------------------------------------------------

### 5. `PostInvocation` Contract

Use to inspect model outputs and potentially force continuation.

*   **Input (stdin)**: Same as `PreInvocation` input.
*   **Output (stdout)**:

    ```json
    {
      "injectSteps": [],
      "terminationBehavior": "force_continue"
    }
    ```

    *   **`injectSteps`** (array, optional): Steps to inject (same supported  
        step types as `PreInvocation`).
    *   **`terminationBehavior`** (string, optional):
        *   `"force_continue"`: Forces the execution loop to continue.
        *   `"terminate"`: Forces the loop to stop.
        *   `""` (or omitted): Default behavior.

--------------------------------------------------------------------------------

### 6. `Stop` Contract

Use to prevent the agent from stopping if goals are not met.

*   **Input (stdin)**:

    ```yaml
    {
      "executionNum": 1,
      "terminationReason": "NO_TOOL_CALL", // e.g., "NO_TOOL_CALL", "MAX_INVOCATIONS", "ERROR", "USER_CANCELED", "TERMINAL_STEP_TYPE"
      "error": "", // Present if stopped due to error
      "fullyIdle": true, // true if all background tasks are done
      ... (common fields)
    }
    ```
    *   **`terminationReason`** (string): The `ExecutorTerminationReason` enum  
        name with the `EXECUTOR_TERMINATION_REASON_` prefix stripped:
        *   `"NO_TOOL_CALL"`: Normal turn completion (model finished without  
            calling a tool).
        *   `"MAX_INVOCATIONS"`: Hit the maximum invocation limit.
        *   `"MAX_FORCED_INVOCATIONS"`: Hit the forced-continuation limit.
        *   `"MAX_TOKEN_BUDGET_EXCEEDED"`: Exceeded the token budget.
        *   `"ERROR"`: Execution terminated due to an error.
        *   `"USER_CANCELED"`: Canceled by the user.
        *   `"TERMINAL_STEP_TYPE"`: Stopped on a terminal step type.
        *   `"TERMINAL_CUSTOM_HOOK"`: Terminated by a custom `PostInvocation`  
            hook.
        *   `"INJECTED_RESPONSE"`: Terminated after an injected response.
*   **Output (stdout)**:

    ```json
    {
      "decision": "continue",
      "reason": "The tests are still running in the background. Please wait."
    }
    ```

    *   **`decision`** (string, required): Set to `"continue"` to block the stop  
        and re-enter the loop. Any other value allows the agent to stop.
    *   **`reason`** (string, optional): Injected as a system message if  
        continuing.

--------------------------------------------------------------------------------

## Current Limitations

*   Only `type: "command"` is supported (no HTTP or prompt hooks yet).
*   Hooks run synchronously and block the agent loop (no async execution).
