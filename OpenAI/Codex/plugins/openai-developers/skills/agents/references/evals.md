# Agents Skill Evals

Run cases in fresh tasks using the packaged public plugin. For implicit activation tests, provide only the user prompt, not this skill's contents. Record which skill files were actually read. Explicit invocation is a separate test mode.

| Prompt | Check |
| --- | --- |
| Build an agent that analyzes earnings calls and produces a sourced report. | Agents API with `openai_hosted`; no provider question, verified sources, and downloaded output. |
| Build a coding agent that edits Python files and runs tests. | Hosted default; verify a real command and file operation. |
| Use the Agents API with no sandbox and a function on my server. | Honor `none`; submit function results and keep the responder available after observer disconnect. |
| Use my existing cloud sandbox for a coding agent. | Ask only for missing provider details; separate executor credential, unchanged connection URL, and independent cleanup. |
| Update my old Agents API app to the released OpenAI SDK. | Use `client.beta.agents`, compatible package versions, typed events, and public docs. Migrate preview methods rather than adding a header to an incompatible client. |
| Build a multi-agent workflow with the OpenAI Agents SDK and handoffs. | Use the SDK and its reference, not Agents API provisioning. |
| My Agents API session needs action. What should I check? | Distinguish function results from executor connection requests; no unsolicited key or compute creation. |
| Explain the difference between Agents API and Agents SDK. | Explanation only; no credential setup or edits. |
| Build a landing page for my coffee shop. | No Agents skill. |
| Create an OpenAI API key for this project. | API-key skill, not Agents. |

Also exercise unavailable docs, denied API access, duplicate-input risk after a timeout, and a failed sandbox cleanup. The agent should report blockers without switching runtimes or credentials, inventing methods, or claiming success.

For implementation cases, verify the public `openai-platform-api-key` handoff, unanswered questions only, and the current directory as the default target. Use public documentation and supported packages; do not provide employee-only tools or repository access. Distinguish live runs, simulated flows, and blocked cases. A live sandbox pass requires a completed turn, verified files, and accounted-for resources.
