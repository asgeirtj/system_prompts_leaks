# Claude Models on Google Cloud (Anthropic managed)

**Anthropic-operated** Claude API, reached through a Google Cloud project - Google credentials, Google Cloud IAM access control, and Google Cloud Marketplace billing. Request bodies, streaming, responses, and the `anthropic-version` / `anthropic-beta` headers are the Claude API's. The URL is not: see Required configuration. Model IDs are the Claude API's too (`claude-opus-5-5`, `claude-sonnet-5-5`) - **no prefix and no `@` date separator**. For per-feature availability, see `shared/platform-availability.md`.

> **Not the same as Google Vertex AI.** Google operates Vertex AI, and the docs now call Claude there "Claude Models on Google Cloud (Google managed)", part of Google Cloud's Agent Platform. It has its own endpoints, request format, and feature set, and its client is `AnthropicVertex`.

---

## Which one is the user on?

| What to check | This platform | Vertex AI |
|---|---|---|
| SDK client in the code | Name contains `GoogleCloud` (`googlecloud` in Go) | Name contains `Vertex` (`vertex` in Go) |
| Host in request URLs | `claude.googleapis.com` | A host containing `aiplatform`, such as `aiplatform.googleapis.com` |
| IAM roles | `roles/claude.admin`, `roles/claude.user`, `roles/claude.viewer` | Google's own roles for Vertex AI |

"Claude Models on Google Cloud" without the parenthetical covers both offerings. If that or plain "Google Cloud" is all the user says and none of these settles it, ask which one they use.

---

## Client & install

First-time setup (a Marketplace subscription, two services to enable, and an Anthropic organization) is on the docs page in `shared/live-sources.md`. Use the latest release of each SDK. The newest major versions send API version `2026-10-21`, which rejects some requests older code sends: see `shared/api-version-migration.md`. These clients are in beta.

| Language | Install | Client |
|---|---|---|
| Python | `pip install -U "anthropic[google_cloud]"` | `from anthropic import AnthropicGoogleCloud` -> `AnthropicGoogleCloud()` |
| TypeScript | `npm install @anthropic-ai/google-cloud-sdk` | `import { AnthropicGoogleCloud } from "@anthropic-ai/google-cloud-sdk"` -> `new AnthropicGoogleCloud()` |
| Go | `go get github.com/anthropics/anthropic-sdk-go/v2`; in a project still on the bare module path, `go get github.com/anthropics/anthropic-sdk-go` (v1.83.0 or later). Use one path for every import: mixing them doesn't compile | `import "github.com/anthropics/anthropic-sdk-go/v2/googlecloud"` (on the bare path, `import "github.com/anthropics/anthropic-sdk-go/googlecloud"`) -> `googlecloud.NewClient(ctx, googlecloud.ClientConfig{})` (returns `*googlecloud.Client` and an error) |
| C# | `dotnet add package Anthropic.GoogleCloud` | `using Anthropic.GoogleCloud;` -> `new AnthropicGoogleCloudClient()` |
| Java | `com.anthropic:anthropic-java` plus `com.anthropic:anthropic-java-google-cloud`, both at the same latest version | `AnthropicOkHttpClient.builder().backend(GoogleCloudBackend.fromEnv()).build()` (from `com.anthropic.googlecloud.backends`) |
| PHP | `composer require anthropic-ai/sdk google/auth` | `use Anthropic\GoogleCloud\Client;` -> `new Client()` |
| Ruby | `gem install anthropic googleauth` | `Anthropic::GoogleCloudClient.new` |
| `ant` CLI | See `ant` CLI below | No client to construct |

After construction, call the client as you would `Anthropic()` - `client.messages.create(...)`, `client.beta.sessions.*`, etc. Feature limits are in `shared/platform-availability.md`.

---

## Required configuration

| Value | Env var | Notes |
|---|---|---|
| Project ID | `ANTHROPIC_GOOGLE_CLOUD_PROJECT`, then `GOOGLE_CLOUD_PROJECT` | If neither is set, the project that Application Default Credentials reports, when the credential type carries one. |
| Workspace ID | `ANTHROPIC_GOOGLE_CLOUD_WORKSPACE_ID` | Required unless you set the base URL (`ANTHROPIC_GOOGLE_CLOUD_BASE_URL`): without either, the client raises an error. Organization-level routes (paths starting `/v1/organizations/`) don't need it. Starts with `wrkspc_`. In the Claude Console, under Settings > Workspaces; a developer without Console access must ask someone who has it. |
| Location | `ANTHROPIC_GOOGLE_CLOUD_LOCATION` | Defaults to `global`. Leave it there. |

A value passed to the constructor wins over the environment: `project` and `workspace_id` in Python and Ruby, `project` and `workspaceId` in TypeScript and PHP, `Project` and `WorkspaceID` in Go, `.project()` and `.workspaceId()` on `GoogleCloudBackend.builder().fromEnv()` in Java, `Project` and `WorkspaceId` on `GoogleCloudClientOptions` in C#.

**Never write the endpoint by hand in SDK code** - the client builds it from these values. For raw HTTP, take the URL from the docs page in `shared/live-sources.md`, send `Authorization: Bearer <Google access token>`, and send neither `x-api-key` nor `anthropic-workspace-id` (the workspace ID is in the URL).

## `ant` CLI

Use the latest `ant` (1.43.0 or later): versions before 1.39.0 ignore these settings and may send requests to the Claude API. Set the project and workspace ID as above, or pass `--google-cloud-project` and `--google-cloud-workspace-id`, and sign in with `gcloud auth application-default login`; `ant auth login` doesn't apply. Setting the project, workspace ID or location, by variable or flag, makes `ant` use this platform; `GOOGLE_CLOUD_PROJECT` alone doesn't.

Unset `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_PROFILE` and Anthropic's Workload Identity Federation env vars (`ANTHROPIC_FEDERATION_RULE_ID`, `ANTHROPIC_ORGANIZATION_ID`, `ANTHROPIC_SERVICE_ACCOUNT_ID`, `ANTHROPIC_IDENTITY_TOKEN`, `ANTHROPIC_IDENTITY_TOKEN_FILE`) and leave out `--profile`, `--api-key-stdin` and `--auth-token-stdin`, since each outranks these settings. Also unset `ANTHROPIC_WORKSPACE_ID` and leave out `--workspace-id`, which send a header this platform refuses. Then confirm with `ant auth status` that `Google Cloud` is the active credential. `--base-url` and `ANTHROPIC_BASE_URL` aren't used (`--google-cloud-base-url` or `ANTHROPIC_GOOGLE_CLOUD_BASE_URL` overrides the URL and receives the Google token, so unset a leftover one), and `ant beta:worker` isn't supported.

## Authentication

The SDK clients get a Google access token from Application Default Credentials: `gcloud auth application-default login` for local development, the attached service account on Google Cloud, or `GOOGLE_APPLICATION_CREDENTIALS` for a key file. Google's Workload Identity Federation and service account impersonation also work through Application Default Credentials. The identity making calls needs `roles/claude.user` on the project.

**There are no API keys here.** The SDK clients ignore `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, and `ANTHROPIC_BASE_URL`, and the Claude Console can't create keys for this organization.

---

## What to tell users

- Treat it as the Claude API: sections of this skill about the Claude API apply, except where this file or `shared/platform-availability.md` says otherwise. Do **not** apply Vertex AI's feature limits or use `AnthropicVertex`.
- Setup creates a new Anthropic organization, separate from any the company already has. Workspaces and Console settings don't carry over, and files, skills, batches, and Managed Agents resources stay in the old organization. A Zero Data Retention arrangement doesn't carry over either, and a beta limited to selected organizations needs the same access on the new one.
- Managed Agents works here through the client above. Access is checked when a session or deployment is created, not while it runs, so revoking an identity's access stops neither. To stop a running session, send it a `user.interrupt` event by itself; once it's `idle`, you can archive or delete it. To stop a deployment, pause or archive it: it doesn't re-check its creator's access on each scheduled run. MCP tunnels aren't available. For self-hosted workers, which you write yourself here, see `shared/managed-agents-self-hosted-sandboxes.md` -> What changes vs `cloud`; that file's steps for environment keys and the pre-built workers don't apply here.
- Most of the Admin API is not offered here (`shared/admin-api.md` -> Platform Restrictions). Of the predefined roles, only `roles/claude.admin` can open the Claude Console, which is reached from the Google Cloud console, and some Console pages may be hidden, so when a task can be done either in the Console or through the API or `ant`, use the API or `ant`.
- This skill has no per-token prices for this platform, and whether the first-party prices in SKILL.md apply is unknown. US-only inference (`inference_geo: "us"`) has the same 1.1x multiplier as on the Claude API.
- A **403** can come from Google: check that `claude.googleapis.com` is enabled on the project and that the caller has `roles/claude.user` or `roles/claude.admin` (organization-level routes need `roles/claude.admin`). If both are fine, see `shared/error-codes.md` -> 403 Forbidden. `Model {model} is not available for this organization's inference configuration.` means the organization can't use that model, so use another one.
- Moving from Vertex AI: do the first-time setup and grant `roles/claude.user`, then replace the client, set the project and workspace ID, and replace the `@` before the date in older model IDs with a hyphen. Vertex AI's regional and multi-region endpoints have no match here (the location stays `global`), so check data-location needs first. For US-only inference, set `inference_geo: "us"` on each request.
