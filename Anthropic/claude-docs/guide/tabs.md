# topic.tabs

## Tabs (add, order, nest, rename, link)

Tabs = the doc's `files`; placement = its `tabs` map `{ "<tab id>": {"name":"Sources", "order":"a1",
"subtabOf":"<parent tab id>"} }` (`order`, `subtabOf` optional). Tray: tabs with an `order` first, ascending as
strings (`"a0"` < `"a1"` < `"a2"` < `"b0"`), the rest after in no useful order → when position matters EVERY
top-level tab gets an order, the main tab `"a0"`. `C` = the doc container; tab ids ← the doc read
(`files[].id`) or a create ack (`lids.f`).

- Add a tab later = ex.1, ONE `batch`; without its placing member the tab exists but does not show; the link = a
  `mention` chip `ref "file/<tab id>"` (`$lid:f` inside the batch, `lids.f` of the ack after it). `birthName` = a
  file NAME: no `/` or control chars, no edge spaces, ≤ 255; display text goes in `tabs.<id>.name`.
  A doc YOU created since the user's last message: ex.1's last `set` becomes
  `{"op":"set","path":["tabs","<main tab id>"],"value":{"name":"Comparison","order":"a0"}}` (`<main tab id>` = `lids.f` in the
  answer to the call that created the doc), a name for what THAT tab holds, never the doc's title. Any other doc:
  ex.1 as printed, its tabs' names untouched.
- AT BIRTH the same members ride the birth `batch` (extra tab `$lid:f2`/`$lid:n2`, the main tab `$lid:f`)
  and the placing member cites the doc being born — `"ref":{"object":"project","id":"$lid:p"}` — with one
  `set` per tab it places, the main tab included, named the same way:  
  `[{"op":"set","path":["tabs","$lid:f2"],"value":{"name":"Sources","order":"a1"}},{"op":"set","path":["tabs","$lid:f"],"value":{"name":"Overview","order":"a0"}}]`.
- Reorder / nest / rename = ONE project patch, any mix (ex.2); ids, contents, comments untouched. Nest: `subtabOf` =
  the parent tab's id (in a batch, `"$lid:<alias>"` of a tab born earlier in it resolves) + an `order` among its
  sub-tabs; un-nest: `{"op":"delete","path":["tabs","<B id>","subtabOf"]}`.
- Remove a tab = `delete` its file, never its body: deleting the body a live tab shows refuses (`tab_body`). A doc
  keeps ≥ 1 tab, so deleting the LAST one refuses (`last_tab`). A deleted tab's sub-tabs stay and list at the top level
  (nothing to move first) → say so; in the doc's own menu a person picks: all sub-tabs too, or keep them. To start
  over, replace that tab's contents (`update`) — never delete-and-recreate the tab.
- What goes where: the main tab answers the ask on its own; a second tab only for material a reader opens
  separately (source list, full dataset, working notes); never one short doc split across tabs; never the main
  tab second.
- Many tabs of one kind (per team / week / interview): an overview tab FIRST (`"a0"`), one line on what the
  others hold; the rest under ONE parent tab, named or numbered in reading order, each with an explicit `order`
  sorting that way (`"b01"` … `"b12"`: pad numbers; placement mints no order by itself).

### Examples

ex.1 — a tab shown as "Sources / raw data" added to a doc: born (its file NAME slash-free), filled, placed second with
the main tab first, linked from it:
```
batch( container = C, batch = [
  {"$lid":"f","verb":"create","object":"file","payload":{"value":{"birthName":"Sources.ldoc"}}},
  {"$lid":"n","verb":"create","object":"node","engine":"prose",
   "payload":{"parent":{"object":"file","id":"$lid:f"},
              "source":{"as":"markdown","from":{"kind":"inline","content":"# Sources\n\n- [Vendor pricing](https://example.com/pricing), checked weekly"}}}},
  {"verb":"update","ref":{"object":"file","id":"$lid:f"},
   "payload":{"kind":"value","value":{"birthName":"Sources.ldoc","content":{"kind":"node","id":"$lid:n"}}}},
  {"verb":"update","ref":{"object":"project","id":"<doc id>"},
   "payload":{"kind":"patch","patch":[
     {"op":"set","path":["tabs","$lid:f"],"value":{"name":"Sources / raw data","order":"a1"}},
     {"op":"set","path":["tabs","<main tab id>","order"],"value":"a0"}]}},
  {"verb":"update","ref":{"object":"node","id":"<main tab's body id>"},"engine":"prose",
   "payload":{"ops":[{"op":"insert","target":{"kind":"root"},"side":"end",
     "source":{"as":"markdown","blocks":{"src":{"type":"mention","ref":"file/$lid:f"}},
               "from":{"kind":"inline","content":"Sources and raw numbers: <?claude block src?>"}}}]}} ] )
```
ex.2 — one patch: A first, B nested under A and renamed:
```
update( ref = {"object":"project","id":"<doc id>"}, payload = {"kind":"patch","patch":[
  {"op":"set","path":["tabs","<A id>","order"],"value":"a0"},
  {"op":"set","path":["tabs","<B id>","subtabOf"],"value":"<A id>"},
  {"op":"set","path":["tabs","<B id>","name"],"value":"Raw data"} ]} )
```
