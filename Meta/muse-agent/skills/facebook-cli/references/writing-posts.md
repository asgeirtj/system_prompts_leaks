# Writing Facebook posts

- These commands are useful for publishing text updates to the user's own Facebook profile. A native approval shows the exact text, audience and sharing destinations so the user can confirm who will see it.

## Publish a text post

```sh
/opt/hatch/bin/facebook-cli post create --message 'Exact post text'
```

- Audience and sharing follow the user's current Facebook defaults. The approval displays those choices for confirmation.

- Drafting or revising text does not publish the post. Preserve the user’s final post text unless they ask you to edit it

## Audience and sharing

- If a different audience is requested, read the available choices and pass a returned ID or exact name with `--privacy`:

```sh
/opt/hatch/bin/facebook-cli post audiences
/opt/hatch/bin/facebook-cli post create \
  --message 'Exact post text' \
  --privacy '<returned audience ID or exact name>'
```

- Only me, Friends, and Public are supported when returned. Custom audiences and per-person inclusions/exclusions are currently unavailable. Sharing settings and destination eligibility are available through:

```sh
/opt/hatch/bin/facebook-cli post crossposting
/opt/hatch/bin/facebook-cli post crossposting --privacy '<returned audience ID or exact name>'
```

- Omit audience and sharing flags to use Facebook defaults. The command resolves and displays them.

- `auto_share` describes the account setting. `eligible` describes whether this post can use that destination.

- For a requested sharing change, include `--share-to-story`, `--share-to-instagram` or `--share-to-threads` with `on` or `off` in the creation command. These choices apply to that post, leaving account settings unchanged.

- If `post create` rejects the audience or destination, say nothing was posted and ask the user how to proceed. Do not retry with another audience, spelling or flag.

- Do not select a different audience or destination without the user's prompting.

## Confirm the outcome

- A successful receipt confirms publication, and contains `post_id` and `post_url`. Show its `post_url` as a clickable link. Missing links or an empty read do not justify a retry in publication

- A timeout, interrupted response, or unknown outcome may mean the post was created. Another write should not be attempted without the user’s request. Use [Reading posts](/opt/hatch/connectors/facebook_cli/references/reading-posts.md) to reconcile the attempt. If readback cannot confirm the outcome, report it as unconfirmed and ask the user to check Facebook before another attempt.

- Report that nothing was posted only when approval was denied or the service explicitly confirms rejection. Otherwise, treat an uncertain outcome as unconfirmed.

## Related actions

- [Reading posts](/opt/hatch/connectors/facebook_cli/references/reading-posts.md) for inspecting a published update.

- [Page publishing](/opt/hatch/connectors/facebook_cli/references/pages-publishing.md) for publishing as a Page.
