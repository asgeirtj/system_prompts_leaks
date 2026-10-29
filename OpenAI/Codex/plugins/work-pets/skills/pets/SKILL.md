---
name: pets
description: "List, inspect, select, download, or delete animated pets in ChatGPT Work mode. Use for an explicit pet in ChatGPT or established ChatGPT Pets context. Exclude real-world and other-app pets; clarify before invoking."
---

# Pets

Manage the user's pet collection around stable pet IDs. Treat custom-pet sprite-sheet URLs as temporary transport artifacts, never as pet identity.

## Route the request

- For a new pet, new unattached pet artwork, or validation and repair before a pet exists, load [create-pet](../create-pet/SKILL.md).
- For a name, description, or sprite-sheet change to one existing custom pet, or to validate or preview that pet's existing sprite sheet, load [update-pet](../update-pet/SKILL.md).
- For listing, inspecting, selecting, turning off, downloading, or explicitly deleting pets, continue here.
- For a genuinely mixed request, resolve the affected stable IDs first, then load only the focused skill or skills needed for the requested lifecycle states.

Do not run the creation workflow for an existing-pet update. Do not run the update workflow for preview revisions to a pet that has not been created yet.

## Resolve a pet

1. Reuse a stable pet ID that has already been resolved unambiguously in the conversation.
2. Otherwise, call `list_pets`. Follow each returned `cursor` until the target is found or every page has been checked.
3. For "current" or "active," use `active_pet_id` or the matching `is_active` value. For a name, collect exact matches across all relevant pages because names are not unique.
4. If no pet matches, tell the user. If multiple pets could match, show the candidates and ask which one they mean before selecting, downloading, updating, or deleting.

## List and inspect pets

- Use `list_pets` for collection inventory and active-state questions. Continue pagination when the user asks for the complete collection or the target has not appeared yet.
- Report the stable ID, name, description, `is_custom`, and active state when those fields help distinguish candidates.
- Do not fetch sprite sheets merely to list or identify pets.

## Select or turn off a pet

1. Resolve the intended built-in or owned custom pet to one stable ID.
2. Call `select_pet` with that ID. Pass `default` only when the user asks to turn the animated companion off.
3. Verify that the returned `active_pet_id` matches the request. Use `list_pets` for independent readback only when the result is ambiguous or the user asked to see the updated collection.

## Download a sprite sheet

1. Resolve one stable pet ID.
2. Call `get_pet_download_link` only when the user or another workflow needs the actual sprite sheet.
3. Use the returned URL immediately. Custom-pet URLs expire; built-in URLs may be static. Keep the stable pet ID for later work instead of persisting either URL.

## Delete a custom pet

1. Call `delete_pet` only after an explicit deletion request and after resolving one unambiguous custom pet. Never infer deletion from words such as clean up, replace, hide, or turn off.
2. State the exact pet name and stable ID and that the pet record and stored sprite sheet will be permanently deleted before the destructive action is confirmed.
3. Never delete a built-in pet. To hide the companion, call `select_pet` with `default` instead.
4. Verify the returned `deleted`, `pet_id`, and `active_pet_id` values. If the deleted pet was active, report that selection was reset. When independent absence verification is needed, page through `list_pets` until its cursor is null.
