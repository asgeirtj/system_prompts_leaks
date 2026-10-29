# MCP review examples and evidence

For each app needing initial public review, draft five positive and three
negative cases from its actual tools, schemas, and intended user workflows.
Skills-only plugins need no MCP cases, demo, or reviewer credentials; existing
reviewed dependencies need an eligible version rather than a new review.

Before handoff, verify each MCP tool's annotations include boolean `readOnlyHint`,
`openWorldHint`, and `destructiveHint` values matching its behavior. Correct
missing or inaccurate annotations in the server source. Annotation justifications
are not required.

Guide the creator through a useful test set:

1. Identify the main tasks users should accomplish and the limits of the app.
   Propose coverage from the implementation, then ask the creator only about
   unclear intended behavior, realistic examples, and required test data.
   Draft the cases yourself; do not ask the creator to author them from scratch.
2. Make each positive case test a distinct supported behavior: a core workflow,
   meaningful input variation, valid boundary, or multi-step task where supported.
   Use natural user prompts instead of telling the model which tool to call.
   Do not pad the set with paraphrases or invent capabilities to fill the count.
3. Give each case a purpose, reproducible setup, and observable pass condition.
   Name exact expected tools and important argument values in the expectations.
   State what the user should receive and which returned data must support it;
   avoid vague outcomes such as "works correctly". For random, live, or generated
   results, assert valid ranges, required properties, and consistency with the
   tool response rather than an invented exact output.
4. Choose negative prompts that plausibly resemble the app's purpose but are
   outside its capabilities, so they test when its tools should not be invoked.
   State the expected explanation or clarification and prohibited tool use in
   the case description. Keep these distinct from supported workflows that
   return no results or encounter authentication/validation errors; those need
   explicit recovery expectations when tested. Never treat a fabricated success
   as acceptable error handling.
5. Use reviewer-accessible fixtures and include any necessary conversation
   context or setup in the description. Keep secrets in secure reviewer-access
   fields. Present the draft set with a short explanation of its coverage, invite
   corrections, and resolve missing setup or ambiguous pass conditions before
   calling the cases ready to run.
6. Run cases where access and authorization allow, comparing actual tool calls,
   arguments, and user-visible results with the expectations. Record **Passed**,  
   **Failed**, **Blocked**, or **Not run** with evidence in preparation notes;
   do not add unsupported result fields to the manifest. Fix the app or the
   expectation based on intended behavior, not merely to make a failure pass.
   Preserve unverified status when execution is unavailable.

For example, "Search works" is too vague. For a supported catalog search,
"Find blue mugs under $20" can expect the actual search tool with the color and
price filters, and a response containing only matching returned items. Use a
known test catalog to make this reproducible. A request to purchase a found mug
is a useful negative case only if purchasing is unsupported: explain that limit
without attempting a purchase or claiming an order was placed. Adapt examples
to the plugin's real contract.

Declare cases in one of these locations; never combine them:

- **Exactly one MCP server:** root `plugin.json` under
  `extensions.com.openai.review.test_cases`, with `positive` and `negative`
  arrays. Each case has `description` and `prompt`; positive cases also have
  `tools_triggered` and `expected_behavior` as strings, not arrays. Optional
  evidence uses `file_attachment_urls` and `expected_output_url`.
- **Multiple servers:** each exact `mcp.json` server's
  `extensions.com.openai.review`, with `testCases` and `negativeTestCases`
  arrays. Each case has `description` and `userPrompt`; positive cases also
  have `toolsTriggered` and `expectedOutput`. Optional evidence uses
  `fileAttachmentUrls` and `expectedOutputUrl`.

Other package fields under `extensions.com.openai`:

- `review.demo_recording_url`: a reviewer-accessible recording of the submitted
  behavior. Verify the link.
- `review.commerce` and `review.commerce_description`: truthful declarations
  about commerce behavior, when applicable.
- `publication.release_notes`: what changed in this release.
- `publication.countries`: intended supported country codes. Omission preserves
  targeting; an empty list deliberately removes restrictions.
- `publication.translations`: localized listing descriptions and subtitles keyed
  by locale. Base listing fields supply English; do not synthesize an `en-US` entry.

In review information, countries and translations occupy the first page;
reviewer credentials follow on a separate page. When the dashboard supports
field-level ZIP ownership, ZIP-supplied countries and translations are prefilled
and locked, including explicit empty lists/maps. Update the ZIP to change them.
Fields omitted from the ZIP remain editable, including after saving and
reopening. Check the saved country targeting and translation text before review.
Older dashboard/backend versions may keep the entire publication section locked;
use the ZIP for those versions rather than assuming inline edits are available.

### Record the demo video

Every app entering initial public review needs a verified demo recording. Guide recording and hosting during preparation, before the final submission-portal upload, connection, and testing step. Help the creator produce it rather than stopping at a script or a request for a URL.

Use an existing development installation or preview in the intended host to demonstrate the version being packaged. A real demo may need a working development connection and sign-in; that is distinct from connecting the saved submission in the portal. If no runnable setup is available, explain that specific recording dependency, finish the independent listing and publication details, and guide the minimum supported development setup. Do not prescribe a submission draft upload merely to begin preparation, create a duplicate private plugin, or claim a recording is complete without real interactions.

1. Draft a short walkthrough from the review cases: show the version being packaged
   in the intended host, any necessary development connection steps, realistic prompts,
   actual tool results, and the main supported interactions. Include a relevant
   boundary or error-handling example. Use a dedicated test account and sample
   data, keeping passwords, tokens, and unrelated private content off screen.
2. Offer to use the **Computer** plugin to perform the visible walkthrough.
   Follow its available tool instructions and the creator's preferences. Check
   recording capabilities before starting: computer control and screenshots do
   not by themselves provide video capture. Use an available recording tool;
   otherwise guide the creator to start and stop their screen recorder while
   you demonstrate the app. If Computer is unavailable or declined, give the
   creator the same walkthrough to record manually. Do not make Computer a
   submission requirement.
3. Rehearse the flow and resolve failures before recording. Capture real
   interactions and results, leaving enough time to read them. Stay within
   authorized actions; use test or sandbox flows for actions with side effects.
4. Play back the saved video to verify readable prompts/results, successful
   playback, coverage of the walkthrough, and absence of exposed secrets. Do
   not substitute mockups, a script, or fabricated results for a working demo.
5. Help the creator host the recording at their chosen reviewer-accessible
   destination within the authorized scope. Verify playback and permissions,
   write the actual URL to `extensions.com.openai.review.demo_recording_url`,
   and rebuild the ZIP. Until a working recording link exists, keep this item
   marked incomplete; a local video alone does not complete the URL field.

For example, a dice plugin walkthrough can show "Roll a d20," "Roll 2d6+3 and show the calculation," and "Roll a 2.5-sided die." Explain what to capture: the actual d20 result, both d6 results and their sum plus 3, and the invalid-input explanation without a tool call. Adapt the prompts to the actual plugin. Give the creator the recording steps and hosting guidance now; ask for the link after helping them produce the recording, then write the verified URL into the package.

### Reviewer access

Supply reviewer credentials and instructions only through secure dashboard
fields, never the package. When authentication is required, guide the creator
to prepare a dedicated demo or test account with sample data, permissions, and
subscription access needed for every case. Include its exact login URL,
tenant/workspace, and sign-in steps. For username/password sign-in, supply the
demo account credentials. For magic links or email codes, create an account using
`mcp-review@theaicompany.org`, or invite that email to the demo workspace, before
submitting. Reviewers must not need to register or configure an account themselves.
Use the matching sign-in method in the reviewer-credentials step where available;
on older dashboard versions, include the method and reviewer email in the secure
credentials field. Never use a real user account with production data.
Verify the reviewer can sign in without access to the creator's mailbox, phone,
social account, or private network, and run the cases. Keep credentials,
permissions, test data, and subscription access working for future reviews.
If access cannot be verified, report the blocker rather than marking review
information complete. Verify imported values in the saved draft. If ZIP
import is unsupported, use editable dashboard fields where available and report
remaining gaps.
