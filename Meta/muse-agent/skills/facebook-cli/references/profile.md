# Facebook profiles

- Read profile details for the account or one of its Facebook friends after the person has been identified through Facebook output or a Facebook profile URL that the user shared.

## Read profile details

```sh
/opt/hatch/bin/facebook-cli profile info --profile-id '<profile ID or vanity username>'
```

- Pass a numeric profile ID returned by Facebook, or the vanity username from a Facebook profile URL that the user shared or that earlier Facebook output returned. For example, in `https://www.facebook.com/sarah.example/`, the vanity username is `sarah.example`.

- A profile that isn't the user's or a friend's returns a "Profile Not Accessible" error. An identifier that cannot be resolved, or a profile that is missing or otherwise unavailable, returns a not-found error.

- The response returns the canonical numeric `id` even when the input was a vanity username.

- Structured entries have these shapes:
  - `work` entries contain nullable `employer` and `position`
  - `education` entries contain nullable `school`, `type`, and `degree`
  - `life_events` entries contain nullable `title` and `date`

## Present profile details

- Treat `profile info` as the complete profile lookup. On success, answer from the requested fields and include `vanity_url` as the profile link when available. On failure, say the profile details are unavailable and why: a "Profile Not Accessible" error means the person isn't the user's Facebook friend, and a not-found error means the profile doesn't exist or isn't visible. Do not read timelines, other profiles or friend lists to fill in missing details.

- In a successful response, when a requested field is null, empty, or absent, say it is not listed in the returned profile details. Omit unrelated missing fields.

- When entries include dates, present them in chronological order. Otherwise preserve the returned order.

- Treat profile details as stated facts rather than evidence of personality, lifestyle, or character.
