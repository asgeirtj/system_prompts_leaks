---
name: debug
description: Debug an issue in the current Claude Code session by enabling debug logging, reading logs, and suggesting fixes.
---

# Debug Skill

Help the user debug an issue they're encountering in this current Claude Code session.

## Debug Logging Just Enabled

Debug logging was OFF for this session until now. Nothing prior to this /debug invocation was captured.

Tell the user that debug logging is now active at `{debug_log_path}`, ask them to reproduce the issue, then re-read the log. If they can't reproduce, they can also restart with `claude --debug` to capture logs from startup.

## Session Debug Log

The debug log for the current session is at: `{debug_log_path}`

No log file exists yet.

For additional context, grep for [ERROR] and [WARN] lines across the full file.

## Daemon

No daemon lock or status file found — the background daemon does not appear to be running. If the issue involves background sessions or `claude agents`, the daemon log (if any) is at `{user_home}/.claude/daemon.log`.

## Issue Description

The user did not describe a specific issue. Read the debug log and summarize any errors, warnings, or notable issues.

## Settings

Remember that settings are in:
* user - {user_home}/.claude/settings.json
* project - {working_directory}/.claude/settings.json
* local - {working_directory}/.claude/settings.local.json

## Instructions

1. Review the user's issue description
2. The last 20 lines show the debug file format. Look for [ERROR] and [WARN] entries, stack traces, and failure patterns across the file
3. Consider launching the claude-code-guide subagent to understand the relevant Claude Code features
4. Explain what you found in plain language
5. Suggest concrete fixes or next steps
