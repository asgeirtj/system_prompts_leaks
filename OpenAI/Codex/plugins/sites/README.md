# Sites plugin

Build, preview, and publish websites through the [Sites workflow](skills/sites/SKILL.md#workflow). The skill owns execution order and common command contracts; references contain preview, capability, and troubleshooting details.

## Instruction ownership

| Surface | Owns |
| --- | --- |
| [Sites](skills/sites/SKILL.md) | Ordered workflow, helper/tool inputs, hosting manifest, design guidance, and completion. |
| [Design](skills/sites/SKILL.md#design) | Conditional experience guidance under `references/design/`, independent of platform capabilities. |
| [Local](skills/sites/references/preview/local.md) / [managed Linux](skills/sites/references/preview/managed.md) | Preview adapters, read when needed. |
| [Capabilities](skills/sites/SKILL.md#capabilities) | Data/files, identity/service access, connected apps, remote MCP, browser WebMCP, and scheduled updates. |
| [Troubleshooting](skills/sites/references/troubleshooting.md) | Diagnostics, profile repair, static-to-Worker migration, and resumption. |
| `scripts/` and templates | Mechanical workflow, platform integration, and runnable defaults. |

Keep the core and ordinary reading path short; load reference details only when needed. Add instructions for Sites-specific contracts, necessary execution order, or targeted design mitigations; keep general implementation advice out of the bundle. Conditional pages should address one platform capability or experience pattern without restating the lifecycle. App eligibility, visitor consent, private service access, and preview access are distinct contracts.

`sites` is the only skill entrypoint. Building, hosting, and Site-hosted MCP use its workflow and conditional references, not separate aliases. Templates and packaging helpers live under `skills/sites`; the public workflow scripts remain under `scripts/`.

## Release preparation

Follow the [maintained-plugin validation and release process](https://github.com/openai/openai/blob/master/chatgpt/oai-maintained-plugins/README.md#validate-the-catalog-or-one-plugin) using the clean plugin source. No release build or plugin-directory dependency installation is needed. Connector-preview helpers ship in the Vinext starter and use the Site project's installed dependencies.

Changes here prepare source for the maintained-plugin release process; they do not update an installed release or an experimental override. Only canonical main Sites capabilities belong here; alpha-only features remain in their separate release recipe.
