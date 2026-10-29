# Antigravity Python SDK Reference

The Antigravity Python SDK allows you to programmatically spawn, configure, and
orchestrate AI agents inside your Python pipelines, scripts, or automated
testing suites.

The SDK is publicly available on GitHub at  
[google-antigravity/antigravity-sdk-python](https://github.com/google-antigravity/antigravity-sdk-python)  
and can be installed via PyPI.

--------------------------------------------------------------------------------

## 1. Installation

To install the public Python SDK, run:

```sh
pip install google-antigravity
```

> [!IMPORTANT] The SDK relies on a compiled runtime binary that is included in  
> the platform-specific wheels published to PyPI. Always install using `pip` to  
> ensure you obtain the necessary binary.

--------------------------------------------------------------------------------

## 2. Quickstart Example

The `Agent` class is the easiest way to get started. It manages the full
lifecycle — binary discovery, tool wiring, hook registration, and policy
defaults — behind a single async context manager.

Below is a complete asynchronous example demonstrating agent initialization,
simple chat execution, and streaming response tokens in real time:

```python
import asyncio
import sys
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

async def main():
    # Configure the agent. By default, it runs in read-only mode for safety.
    # Pass capabilities=CapabilitiesConfig() to enable write tools (e.g., run_command, edit_file).
    config = LocalAgentConfig(
        system_instructions="You are an expert assistant for codebase navigation.",
        capabilities=CapabilitiesConfig(),
    )

    # Spawn the agent using the async context manager
    async with Agent(config) as agent:
        # Send a prompt and get a response object (returns instantly, does not block)
        response = await agent.chat("Write a short python script to list files.")

        # Stream the response tokens as they arrive
        async for token in response:
            sys.stdout.write(token)
            sys.stdout.flush()
        print()

if __name__ == "__main__":
    asyncio.run(main())
```

--------------------------------------------------------------------------------

## 3. Advanced Features

### A. Streaming Thoughts and Tool Calls

For complex agentic workflows, you can monitor the agent's internal reasoning or
intercept tool executions in real-time:

```python
# Stream reasoning/thinking deltas
async for thought in response.thoughts:
    print(f"[Thinking] {thought}")

# Stream strongly-typed ToolCall events
async for call in response.tool_calls:
    print(f"[Executing Tool] {call.name} with args: {call.args}")
```

### B. Interactive Loop

You can easily spin up a terminal-based interactive chat loop with the agent:

```python
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig
from google.antigravity.utils.interactive import run_interactive_loop

config = LocalAgentConfig(capabilities=CapabilitiesConfig())
async with Agent(config) as agent:
    await run_interactive_loop(agent)
```
