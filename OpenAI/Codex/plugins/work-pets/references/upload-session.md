# Pet upload-session contract

Use this contract only after `validate_pet_spritesheet` returns `valid: true` for the exact final PNG or WebP file. The eventual create or update repeats the same structural validation before image scanning and pet moderation.

1. Call `prepare_pet_upload` with only `file`, set to the final sprite sheet's absolute local path. The host uploads the file and passes its authenticated reference to the tool; do not supply file metadata, a workspace path, or a signed-upload URL.
2. Read `upload.upload_session_id` from the result. The exact validated bytes have already been transferred into that pet-scoped session; no additional upload is required.
3. Consume `upload.upload_session_id` exactly once:
   - pass it as `upload_session_id` to `create_pet` for a new pet; or
   - pass it as `updates.upload_session_id` to `update_pet` for an existing custom pet.
4. Treat the session as short-lived. If preparation or a consuming create or update fails, call `prepare_pet_upload` with `file` again and use the new session before retrying.
5. After creation or update, keep the returned stable pet ID as durable identity. Never persist a download URL or upload-session ID as pet identity.
