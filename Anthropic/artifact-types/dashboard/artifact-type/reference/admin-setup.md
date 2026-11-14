# Setting up certified queries (Claude Data) for an organization

These are facts for answering an admin, or a member who asks why their Certify query switch is off.

A certified query is one connector call that a person in the organization vouched for, with a title. Each one is a `*.query.json` file, or `*.toolcall.json` for older ones, under `skills/certified-queries/references/` in one plugin that the organization chose. Claude reads that plugin's skill wherever the plugin is installed. The dashboard reads and saves these files through the Claude Data connector as the person at the keyboard, so the plugin library decides who may see or save one.

Certifying runs nothing and gives nobody data access. It saves the text of the call. Later the query runs like any other, with the reader's own connector and access, or with the sharer's where a dashboard's connector is shared.

## Choosing the plugin

Until a plugin is chosen nothing is certified, and a query's editor shows a "Certified queries" box instead of the switch. The box offers Enable to someone who can set them up, and tells anyone else whom to ask. Enable makes a plugin named `claude-data`, shown as "Claude Data", in the organization's own library, installs it for every member, who can each turn it off, and chooses it. If the library already has a plugin of that name, Enable stops, and that one can be chosen in admin settings.

In Admin settings › Artifacts › Data, once the Certified queries switch is on, an admin can pick a Marketplace and a Plugin and press Save. It can be any plugin the organization already has, in its own library or in a marketplace it added, though only some organizations can choose one synced from a repository. While none is chosen, saving with "Claude Data" picked in the Plugin list makes that plugin and installs it for every member, just as Enable does.

The plugin needs nothing inside it. Each certification writes the `certified-queries` skill's `SKILL.md` if it is missing or its words differ, so an organization's own edits to it don't last.

An organization has one such plugin at a time. The choice can be changed but not cleared. Choosing another leaves the old plugin as it is: dashboards stop showing its Certified marks, but Claude still reads it wherever it stays installed.

Who sees the plugin is set in Admin settings › Plugins, per group too. Members it isn't available to see no Certified marks on a dashboard, and Claude doesn't use the queries for them.

## Who can

Enable and certifying from a dashboard both need permission to manage the organization's plugin library, which the library checks again at each step. The Owner and Primary owner roles have it, and on Enterprise so does a custom role with Libraries set to "Can manage". There is no permission for a single plugin. Admin settings › Artifacts is for people who manage the organization, and the two lists there need library management as well.

## When there is no switch, or it is held off

If a query's editor shows neither the box nor a Certify query switch, certified queries are off for the organization or not available to it. An admin turns them on with the Certified queries switch in Admin settings › Artifacts › Data, which is on by default on Team, and off on Enterprise and for an organization with zero data retention throughout. If that page has nothing of certified queries, they aren't available. If the switch is on and a member still sees neither, an admin's connector settings, or a permission they refused, may keep Claude Data from them.

When a Certify query switch is held off, its tooltip says why: no permission, a plugin kept in a repository, a query that couldn't be shared as it is written, a plugin held on an earlier version, or certified queries that can't be reached. "Couldn't check certification" means that the lookup failed, not that the query isn't certified. The reason stands beside it, with a Retry only where asking again could help.

With the Certified queries switch off, dashboards show nothing of certification and nothing can be certified. Turned on again, it brings everything back, the chosen plugin included. Turning it off doesn't remove the plugin, so Claude still reads it in a chat wherever it is installed.

## A plugin synced from a repository

An organization that wants code review of every certified query keeps the plugin in a repository, syncs it (Sync from GitHub or Sync from GitLab, in Admin settings › Plugins) and chooses it as above. For now, only some organizations can choose one. For the rest, the Marketplace list leaves synced plugins out, and no admin setting changes that. An existing plugin can be moved this way: download it, commit it, sync it, and choose it.

Dashboards then show which queries are certified but hold the switch off. Queries are added, changed and removed in the repository, by pull request, because a sync would overwrite anything saved elsewhere. The repository holds:

```
.claude-plugin/marketplace.json     {"name": "finance", "owner": {"name": "Finance"}, "plugins": [{"name": "finance-metrics", "source": "./"}]}
.claude-plugin/plugin.json          {"name": "finance-metrics", "description": "…"}
skills/certified-queries/SKILL.md
skills/certified-queries/references/weekly-signups.query.json
```

`SKILL.md` is copied from a plugin that Enable made. An older copy names only `*.toolcall.json`, and Claude looks only for what it names. This is one query file:

```json
{
  "id": "weekly-signups",
  "title": "Weekly signups by platform",
  "description": "Completed signups per ISO week, split by platform.",
  "call": { "connector": "BigQuery", "tool": "bigquery_query", "args": { "sql": "SELECT … WHERE week >= {{start}}" } },
  "filters": { "start": { "label": "From", "type": "date", "default": "2026-01-01" } },
  "hints": ["Stack by platform."]
}
```

- `id` is the file's name, in lower-case letters, digits, `-` and `_`.
- `call` holds exactly `connector`, `tool` and `args`, with each value a reader supplies left as `{{name}}` and described under `filters`.
- A filter's `type` is `text`, `number`, `boolean` or `date`. `many: true` takes a list, `allowed` lists the only values it takes, and `default` is used when nobody gives one.
- `hints`, typed in the editor's Additional context box, are notes on how to chart or explain the result. Claude goes by them for that, and ignores and points out anything else they ask.

With no `kind`, as here, a `{{name}}` inside a query is filled in as a literal that brings its own quotes. With `kind: "call"` beside `call`, the value is written in as it is, and `rules` beside them must limit each one. A file that breaks this format is listed as invalid, and nothing in it is certified.
