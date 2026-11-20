# Social Content Performance

## Scope the question

- For a caption or hashtag request with no analysis question, write from the user's brief and the material they supply, return the draft and stop. Do not fetch account data or establish a reporting period for this branch. The remaining analysis steps apply only to performance questions.

- For a performance question, identify the network, the account and what the user wants to learn, such as which posts reached the most people, how a launch landed or what to post next. Settle the reporting period and timezone before fetching anything.

- Analyze only accounts the user manages. Take the account from the connector's own account list, ask which one to use when several fit, and stop when a named account is not returned rather than substituting another.

- Comparisons with competitors, peers or industry norms use Social Competitor Analysis, which `muse.skill_search` finds when this session has it. Public figures cannot fill a gap in the user's private metrics.

## Gather the evidence

- Retrieve the posts in scope with their publication times and permalinks, then the metrics the question needs. Preserve each connector's returned metric display names exactly rather than replacing them with generic labels or labels from memory.

- For Instagram post metrics, use the connector's owned-post insights and media definitions. These figures cover each post's lifetime rather than the selected reporting period; compare posts of similar age and state that scope.

- Keep each metric at the level it was returned. Account totals do not describe one post, daily unique-account values do not add up to a unique count across a period, and a missing value is unknown rather than zero.

- Keep metrics with different counting conditions or denominators distinct. Separate organic from paid results and keep follower and non-follower breakdowns when they are returned.

- Use only the account's own data as evidence about its performance. Web results, social search, outside benchmarks and remembered figures do not count.

## Find what actually worked

- Compare like with like, matching format, post age, period and audience basis. Note when a post had paid support or reached an unusual audience.

- Review the complete eligible set before calling a post the best, ranking posts or computing an average. One strong post is an example, not a formula.

- Separate how often a format was used from how well it performed. Do not infer causes, audience intent, sensitive traits or algorithm behavior from a correlation.

## Recommend the next step

- Lead with the answer and support each finding with the values compared. Follow [Presenting social results](references/presenting-results.md) for the format, post labels, links and scope statement.

- Tie one or two next experiments to the user's objective, with what to measure and when to look again. Promise no outcome.

- When a requested metric does not exist at the requested level, say so and offer the nearest available measure without presenting it as the same thing.

- Report consent, account-linking and eligibility errors as they are. Do not retry a policy denial or work around it with another tool.

- Analysis does not authorize publishing or changing a campaign. Use [Social Publishing](/opt/muse/skills/social-publishing/SKILL.md) or [Advertising Campaigns](/opt/muse/skills/advertising-campaigns/SKILL.md) when the user wants to act on the findings.

## Available connectors

- [Instagram](/opt/hatch/connectors/instagram/CONNECTOR.md) for the user's posts, owned-post lifetime insights, account insights and metric definitions.

- [Facebook](/opt/hatch/connectors/facebook_cli/CONNECTOR.md) for managed Page insights, Page post metrics and the reactions and comments on personal posts.

- [Threads](/opt/hatch/connectors/threads/CONNECTOR.md) for the user's posts, post insights, top posts and account insights.

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

### When available

- These connectors depend on the user's channel or devices. `muse.connector_search` shows which ones this session has.

- [Upload-Post](/opt/hatch/connectors/upload_post_mcp/CONNECTOR.md) for post and platform analytics across the networks connected to Upload-Post.

- [vidIQ](/opt/hatch/connectors/vidiq_mcp/CONNECTOR.md) for YouTube channel, video and subscriber analytics.

## Websites

- Open a network's own analytics with `browser.browse` when no connector covers that network, measure or period. Give the task the exact account, period and timezone, and have it return each figure with its metric name and any export it produced.

- [YouTube Studio](https://studio.youtube.com/) for YouTube channel and video analytics.

- [TikTok Studio](https://www.tiktok.com/tiktokstudio/) for TikTok account and post analytics.

- [LinkedIn](https://www.linkedin.com/) for the analytics of company Pages the user administers.

- [Pinterest Analytics](https://analytics.pinterest.com/) for Pin and board performance.

## Alternatives for better results

- Join content results to business outcomes with the user's own website, lead or sales records when they share access. Without that evidence, report engagement as engagement rather than business impact.

- Compare each post with the account's own baseline for the same format rather than with industry averages.

- Offer a follow-up review with `cron.add` when results need time to mature, such as a video's views over its first week.
