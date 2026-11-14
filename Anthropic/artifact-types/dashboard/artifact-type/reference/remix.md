# Remixing a dashboard into another format

A remix shows what this dashboard already shows, in another of its own formats. A format is a shape of the page, so it's still the same artifact. The page asks for a remix in the `request` field of its message, which names the format and a draft, `drafts/<id>`. The formats are:

- Dashboard, the usual dashboard, whatever its shape.
- Scrollyteller (the Scroll story) and Visual analysis, in `artifact-type/reference/design-defaults.md`.
- Visual short, in `artifact-type/reference/visual-short.md`.

Every format is offered whatever the page is now, so picking the one it already has is a request for a fresh take: the same figures in a new order, drawn another way where that reads better. Before you write, read the format's description, and `artifact-type/reference/one-writer.md` as for any new page.

## The draft

Other people may have this dashboard open, so the remix is written beside it as a draft, which changes nothing for them until an editor presses Save. Only that `request` starts a draft. If a person asks for another format in the chat there is none, and the change replaces the page for everyone as you write it, so they need to hear that before you write.

Each request is a new draft with a new id, made from the dashboard and not from an earlier draft. The page wrote `drafts/<id>` when the format was picked, and the draft is wanted for as long as that document is there. So read it (`read_db` collection `drafts`, doc `<id>`) before each round of writes. If it's missing, the draft was saved, canceled, replaced or never begun, and no page would show what you write. Tell the person, who can pick a format under Design again.

A draft holds these documents, and anything else you write in it, such as a title or a look, is ignored:

- **The page**, in collection `drafts/<id>/files`: doc `index.html`, with any `.css` or `.js` it names beside it. These files are the whole page. None of the old page's files load with it, so copy in each `dash.calc`, `dash.loader` or helper it needs.
- **A source that is new, or whose call changes**, at `drafts/<id>/datasets/<dataset id>`. It replaces the dashboard's whole document, so write all of it. Every other source is the dashboard's own, read by its id.
- **Changed filter defaults**, in collection `drafts/<id>/dash`, doc `params`, which replaces all of the defaults.

A write or a delete in the dashboard's own `files/`, `datasets/` or `dash/` shows to everyone at once.

## Who sees what

Everyone who can edit the dashboard can see the draft, and nobody else can. The person who asked sees it on their page once it has an `index.html`, which also replaces any earlier draft of theirs, and the page draws it again after each write. It waits while they edit, comment or look at an earlier version. Until it shows, their `check`, `runs` and `page` still describe the dashboard, however new the `at`. While it shows, they describe the draft.

While the view context holds `draft`, the person is looking at that draft, so the changes they ask for belong in it. Without `draft` they see the dashboard itself, even if a draft exists, and mean that unless they speak of the draft. Say which of the two you changed. The heading on the page is the draft's own, but the dashboard's name, `dash/meta`, isn't part of a draft. A new name shows to everyone at once, so change it only when they ask for the name, and tell them that first.

In the top bar, Save copies the draft over the dashboard for everyone and removes the old page's files. Other sources stay, and History keeps the dashboard as it was. Cancel discards the draft for good, and Undo and Redo switch between the dashboard and the draft. After Save, a new or changed query on a connector someone shares shows readers "Shared results are updating." until the connector is shared again. They decide whether to press Save from what you tell them as you hand it over: that people who can edit the dashboard can see the draft, what those buttons do, what the new page leaves out and what readers will see of such a query.

## What carries over

Explore the data before you plan the page, with queries of your own where they help, and let what you learn inform the design. The rule on personal fields in `SKILL.md` holds for those queries too.

People who know the dashboard will compare the two. So keep each calc's `id` and `fn` and each dataset's call as they are, unless the format's description says otherwise. A changed call also loses its place in a share. Whatever the format, a certified query's call changes only if the person asks, and you tell them it loses the Certified mark.

A story carries less than a dashboard. Start from what the dashboard is for, choose the finding it serves, and keep what tells it. Tiles often fold into sentences, and a table people look things up in can stand at the foot of a page that scrolls.

A story often drops the filters. A figure measured over a filter's default, like "+22% since 2006", is a different number over all the data, so it keeps that base or its sentence says the new one. A finding typed as text goes stale beside live numbers, so the words that turn on the data, headlines too, are filled from it.

Another format can leave sources unread, and they stay in `datasets/`. A Dashboard is where they come back, with controls for the `{{name}}`s their queries take, since it can show all that is there and not only what the page reads.
