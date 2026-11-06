# Facebook Pages Insights

- These commands show how a Page the user manages is performing, from the whole Page's trend over a time window down to individual posts, so you can answer with Facebook's own numbers.

## Read Page insights and posts

```sh
/opt/hatch/bin/facebook-cli pages account-insights --page-id '<page_id>' [--time-range <LAST_7D, LAST_14D, LAST_28D (the default) or LAST_90D>] [--metrics <follower_count,views,unique_viewers,engagement_including_clicks,profile_visits,new_followers,unfollowers (default: views,unique_viewers)>]
```

- `pages account-insights` reads the whole Page's metrics over a time window, along with the Page's name. It's the best starting point for "how is my Page doing," because it shows the overall trend before you look at individual posts.

```sh
/opt/hatch/bin/facebook-cli pages posts list --page-id '<page_id>' [--time-range LAST_28D] [--fields <views,unique_viewers,engagements,engagements_including_clicks,clicks,link_clicks,saves (default: views,engagements)>] [--limit <1 to 10>] [--cursor '<cursor>']
```

- `pages posts list` reads the Page's recent posts in the time window, each with its metrics and activity, in one call. Most post questions can be answered from this one response, including finding a post the user describes by its caption.

```sh
/opt/hatch/bin/facebook-cli pages posts get --page-id '<page_id>' --post-ids '<up to 10 IDs>' [--fields <views,unique_viewers,engagements,engagements_including_clicks,clicks,link_clicks,saves (default: views,engagements)>]
```

- `pages posts get` reads up to 10 posts you already know, with their lifetime metrics. Use it to compare posts the user named, or to fetch metrics `posts list` didn't include, without listing the Page's posts again.

- Each command returns only its default metrics unless you pass `--metrics` or `--fields`. Pass the ones the user asks about, such as `follower_count`, and pass every supported value when the user asks for all of them. Limit any claim about missing data to what you requested.
