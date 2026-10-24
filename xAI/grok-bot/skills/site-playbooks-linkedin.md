---
name: site-playbooks-linkedin
description: >-
  LinkedIn site playbook: job postings search, not applying, profiles or people
  search.
---
# Site playbook: LinkedIn

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## LinkedIn recent jobs search

### When to use

The user wants fresh LinkedIn postings matching role keywords in a place within a recency window (default last 24 hours). The parent needs keywords and a location text or `geoId`. For "tailored to my profile" compose keywords as `currentTitle + top 3 skills + seniority`, since the personalized `/jobs/collections/recommended/` feed needs a signed in session and 302s to the auth wall anonymously. The user gets `jobId`, title, company, location, posted date, relative time, and the canonical URL.

### Fastest path

`curl` the public guest endpoint in the box shell. It returns the job card grid as an HTML fragment (about 25 to 35 KB) with no cookies, auth, Referer, or User-Agent needed.

```
curl -s 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=<URL-encoded role+skills>&location=<URL-encoded location>&f_TPR=r86400&sortBy=DD&start=0'
curl -s 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=senior+frontend+engineer&location=San+Francisco+Bay+Area&f_TPR=r86400&sortBy=DD&start=0'
```

| `f_TPR` | Window |
|---|---|
| `r3600` | Last 1 hour |
| `r86400` | Last 24 hours (default) |
| `r604800` | Last 7 days |
| `r2592000` | Last 30 days |
| omitted | All time |

`sortBy=DD` is most recent first and `R` is relevance. `location` takes free text (`San Francisco Bay Area`, `New York, NY`, `Remote`) or `geoId=<n>` (`90000084` San Francisco Bay Area, `90000070` New York City Metropolitan Area, `103644278` United States, `92000000` Remote). Look up others at `https://www.linkedin.com/jobs-guest/api/typeaheadHits?query=<text>&typeaheadType=GEO`. Location text drives scope, not the request IP. Quoted phrases (`%22senior+react%22`) and required tokens (`%2Btypescript`) pass through as is.

Each response holds 10 `<li>` cards (`&count=` is ignored). Paginate with `start=10`, `start=20`, or any positive integer. Stop when a page returns fewer than 10 cards; there is no total count field. For one posting's full description run `curl -s 'https://www.linkedin.com/jobs/view/{jobId}/'`, which returns about 300 KB with `<title>` and JSON-LD. Do not enrich every card. Keep to about 1 request per second and add a 1 to 2 s delay on backfills.

### Dispatch snippet

```
In the shell run curl -s -w '\nHTTP %{http_code}' 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=<role+skills>&location=<location>&f_TPR=<r3600|r86400|r604800|r2592000>&sortBy=DD&start=0'
From each <li> take data-entity-urn="urn:li:jobPosting:(\d+)", the base-card__full-link href (strip from ?), h3.base-search-card__title, the h4.base-search-card__subtitle link text, span.job-search-card__location, the time datetime and text, and whether "Actively Hiring" appears. Collapse whitespace.
If 10 cards came back and more are wanted, repeat with start=10, start=20, pausing 1 s between calls. Stop under 10 cards.
Return a table of job_id, title, company, location, posted date, relative time, and URL https://www.linkedin.com/jobs/view/<slug>-<jobId>.
If curl returns a status other than 200 or a Cloudflare challenge page, do not retry it; open https://www.linkedin.com/jobs/search?keywords=<...>&location=<...>&f_TPR=<...>&sortBy=DD in the browser and read the same cards. A 200 with no data-entity-urn cards means no more results. Never apply or save.
If a sign-in, captcha, or payment wall appears, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

Regexes per `<li>` block.

| Field | Extractor |
|---|---|
| `jobId` | `data-entity-urn="urn:li:jobPosting:(\d+)"` |
| `url` | `<a class="base-card__full-link[^"]*" href="([^"]+)"`, strip from the first `?` |
| `title` | `<h3 class="base-search-card__title">\s*([\s\S]*?)</h3>` |
| `company` | `<h4 class="base-search-card__subtitle">[\s\S]*?<a[^>]*>\s*([\s\S]*?)\s*</a>` |
| `location` | `<span class="job-search-card__location">\s*([\s\S]*?)</span>` |
| `posted_iso` | `<time[^>]*datetime="([^"]+)"` (date only, `YYYY-MM-DD`) |
| `posted_relative` | `<time[^>]*>([\s\S]*?)</time>` ("6 hours ago") |
| `display_order` | `data-row="(\d+)"` |
| `actively_hiring` | presence of `<div class="job-posting-benefits text-sm">` with "Actively Hiring" |

Apply `.replace(/\s+/g,' ').trim()` to every text capture. `<time>` carries `class="job-search-card__listdate(?:--new)?"`, so match both. The canonical URL is `https://www.linkedin.com/jobs/view/{kebab-slug}-{jobId}`; the href adds `?position=N&pageNum=0&refId=...&trackingId=...`. Slugs may contain percent encoded UTF-8, so dedupe on the numeric `jobId`.

### When blocked

- The guest jobs API sits behind Cloudflare and can answer with a challenge instead of the card fragment. The tell is a status other than 200, or a Cloudflare challenge page in place of the card fragment.
- Do not retry curl or wait it out: fall through at once to the browser jobs search in the snippet, with the box's signed in session when it has one.
- Report `cloudflare_challenge` with the URL if the browser path is also challenged.
- A 429 goes to the browser path like any other non-200. Report `rate_limited` only when the browser path is rate limited too.
- `/jobs/collections/recommended/` 302s to the auth wall anonymously. Do not fetch it.
- A sign in modal on `/jobs/search` in the browser path is `auth_wall`.
- Do not sign in from the Task; a signed in session comes from the box, not from the subagent.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
