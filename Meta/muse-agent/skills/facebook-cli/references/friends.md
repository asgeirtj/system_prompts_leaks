# Facebook friends

- `me friends` searches the user's friends by name or profile details, such as location, work, school, interests or upcoming birthdays.

## Search by name or profile details

```sh
/opt/hatch/bin/facebook-cli me friends [--name '<name>'] [--city '<current city>'] [--hometown '<hometown>'] [--work '<employer or job title>'] [--education '<school>'] [--filter-mode <AND (default) or OR>] [--limit <up to 20>] [--after '<paging.cursors.after from the previous response, with the same filters>']
/opt/hatch/bin/facebook-cli me friends --birthday-within-days [<0 for today, up to 365; default 7>] [--limit <up to 20>] [--after '<paging.cursors.after from the previous response>']
```

- `me friends` allows the user to search their friends with different details and queries. Use this for questions such as 'whose birthday is coming up' or 'which friends have a specific interest'.

- Filter with `--name` (or `-n`), `--city` for the current city, `--hometown`, `--work` for an employer or job title and `--education` for a school. Each is a case-insensitive substring match.

- Without filters, the command returns close friends first.

- Friends who hide their birthday are excluded, so the result is not a complete birthday calendar.

- For today's birthdays, pass `--birthday-within-days 0`. The results can also include tomorrow's, so keep only friends whose `birthday_date` is today.

- For a calendar period such as December, choose a day count that reaches the end of the period, then keep only friends whose returned `birthday_date` falls inside it. The search counts forward from today, so a longer window also returns earlier birthdays. Results are ordered by upcoming birthday. For a complete period, pass each `paging.cursors.after` back as `--after` with the same window until no cursor remains, then filter by `birthday_date`.

```sh
/opt/hatch/bin/facebook-cli me friends --json-query '<FindPeople query>' [--limit <up to 20>]
/opt/hatch/bin/facebook-cli me friends --json-query '{"filters": {"friend_by": ["<fb_user_id from me>"], "topic": ["hiking"]}}'
```

- Use `--json-query` with a FindPeople query for interests, sports, entertainment and similar topics. Put the user's `fb_user_id` from `me` in `friend_by`. In the query, choose the filter key that matches what the user is asking about. Each value is a list, such as `["hiking"]`:
  - `topic` for interests and hobbies
  - `sports` for teams and sports
  - `company` for an employer and `job` for a job title
  - `college` for a college or university and `school` for any school
  - `location` for the current city and `hometown` for a hometown
  - `movies`, `music`, `tv_shows`, `books`, `games` or `podcasts` for entertainment

- An interest search returns one result set of at most 20 friends and has no paging. To find more, refine the query instead.

- When an interest search returns few or no friends, refine the query or report what it found. Do not scan friends' profiles, posts, timelines, groups or Page likes to infer interests this lookup does not establish.

## Explain a match

- Interest searches with `--json-query` return `match_context`, the evidence for why each friend matched. Use it to tell the user the reason.

- `match_context` can list `groups`, `pages` and `profile_details`. Show the readable names, such as "member of the Hiking Enthusiasts group" or "follows the Home Cooking Tips Page". Describe only that evidence.

- If a friend matched without `match_context`, say the search matched them but gave no reason.
