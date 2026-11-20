# topic.chart-definition

## For a chart that already exists as a `definition`; new charts are hand-rolled (`topic.charts`)

A widget whose code carries `definition={{…}}` is a DEFINITION chart: the page draws it from that literal. Keep it one — patch the literal rather than redrawing it by hand: its comments, pins and hover ride the definition. `C` = the doc container, `<pub>` = the node's current pub (read the node).
- ONE display string (title, note, an axis or series title) → `update(ref = {"object":"node","id":"<widget id>"}, engine = "widget", container = C, payload = {"kind":"definition","path":["title"],"value":"Signups by week, Q3","basePub":<pub>})`; paths also `["note"]`, `["axes","y",0,"title"]`, `["marks",N,"title"]`; `value:null` deletes it; several tags in one widget → add `"component":"<data-claude-component>"`. Refused `definition-stale` = someone published in between → read the node, name the pub you now see.
- Any other field, or the rows → `payload = {"kind":"spec-patch","patches":[{"path":"definition.marks.0.type","op":"set","value":"line"},{"path":"definition.note","op":"remove"}]}`: 1–32 patches, dotted paths rooted at `definition.` or `sources.<name>` (a whole source entry), numbers = array positions; the whole result is re-validated, nothing lands on a refusal. No `basePub` on this arm (refused `shape`): patches apply to what is published now. Rows → the whole entry again, the new row included: `{"path":"sources.rows","op":"set","value":{"kind":"data","data":[…every row…]}}`; one row by path (`sources.rows.data.3`) is refused `patch-path`.
- A change the grammar cannot say → resend the whole source (`"kind":"draft"`, as `topic.charts` sends a redraw).
- The grammar and the names it refuses → below.
- GRAMMAR (closed: any other key is refused BY NAME with the fix; the definition NAMES columns, never computes — sums, shares, rates, bins, top-N, sorting, one-row selection happen in the query behind the rows):
  ```
  Chart = {kind:'chart', source:'<sources key>', title?, note?,  // title ≤ 40 chars, the rest → note
    axes:{x:[XAxis], y?:[YAxis] | [YAxis, YAxis]},  // EXACTLY one x; y[1] = the right axis: side:'after' REQUIRED, both titled, formats differ, its mark says axis:1; not with tile/orient/columns
    marks:[Mark ×1–8], annotations?:[Annotation ×≤8],
    columns?:[Split], wrap?:1–6,  // small multiples: a panel per value, shared scales; wrap only beside columns
    orient?:'horizontal'}         // bars/points over a band x only; refused with lines, areas, tiles, side, columns
  XAxis = {type:'time', column, period?:'hour'|'day'|'week'|'month'|'quarter'|'year', title?, format?, side?:'before'}  // period: each row = a whole slot dated at its start (YYYY-MM-01), a missing slot = a gap; bars, tiles, stacked areas need band or time+period
        | {type:'band', column, order?:Order, title?, side?}  // categories verbatim in row order, never dates (dated rows → time); no format (labels = a text column)
        | {type:'linear'|'log', column, title?, format?, side?}
  YAxis = {type?:'linear'|'log', title?, format?, min?, max?, free?:true, side?:'after'}  // log: lines/points > 0; min/max pin the ends (share: min:0, max:1), a row outside REFUSES; free = own scale per panel / table cell, never beside min/max
  Mark = {type:'bar', y:'col' | ['fromCol','toCol'], whisker?:['loCol','hiCol'], group?|stack?:Split, hatch?:Split, …Common}  // [from,to] = floating bar
       | {type:'line', y, whisker?, group?, dash?:Split, …Common}
       | {type:'area', y | ['fromCol','toCol'], group?|stack?, …Common}   // [from,to] = filled band
       | {type:'point', y, whisker?, size?:'col', group?, …Common}   // size = bubble area, ONE sized mark per chart
       | {type:'tile', y:'categoryCol', shade:'col', labels?:[ONE column Label], source?}  // heat map: the chart's ONLY mark; ≤ 60 x slots, ≤ 40 y values; y axis = {title} only
  Common = {source?:'<other key, same x column>', axis?:1, title?, labels?:[Label ×≤2], tone?:Tone}  // title = legend + line-end name, NEVER on a split mark (caption = Split.title); tone never beside a split; whisker = a hairline from two columns, no ± key
  Split = {by:'col', order?:Order, title?}
  Order = {kind:'list', values:['<every value, as strings>', …]} | {kind:'natural'}  // list = fixed sequence, keeps EMPTY slots, an unlisted value refuses; natural: '4.2' < '4.10'; ABSENT = ROW ORDER everywhere (slots, legend, layers, panels, table rows): ORDER BY is the sort, no sort key
  Label = {kind:'text', text} | {kind:'column', column, format?, tone?}
  Tone = {column?, cutoffs?:[c] | [c1, c2], reverse?:true}  // red below c1, grey between, green ≥ c2 (default [0]); reverse = higher is worse
  Format = {kind:'number', spec?:'~s'|',d'|'.1f'|'.0%'|'+.1%', prefix?:'$', suffix?:' ms'}  // affixes ≤ 4 chars; % expects RATIOS (0.274 → 27.4%); an axis format formats every value read on it
         | {kind:'time', spec:'%b %Y'}  // strftime; %U %W refused
  Annotation = {kind:'rule', axis:'x'|'y', value:'col', source?, labels?}          // a dashed hairline per ROW of its source (≤ 8); axis:'x' = a vertical line at a date (an event) or value, axis:'y' = a level
             | {kind:'span', axis:'x'|'y', range:['fromCol','toCol'], source?, labels?}  // a neutral wash per row; no ink/dash/colour keys; a hand-typed level = its own one-row source, never a literal
  Stat = {kind:'stat', source, title, column, format?, tone?, labels?:[Label ×≤2], deltas?:[{column, format?, tone?, labels?} ×≤3], note?}  // title REQUIRED; ONE number off EXACTLY ONE row; labels = small print (as-of); a delta prints its sign, green ≥ 0, tone:{reverse:true} when down is good
  Table = {kind:'table', source, rows?:[Split ×1–2], columns?:[Split], cells:[Cell ×1–10], title?, note?}  // rows and/or columns; a row per DISTINCT value (≤ 50); columns = ONE header band ≤ 12 values, cells × values ≤ 24, no chart cell beside it
  Cell = Stat | {kind:'column', column, title?, format?, tone?, source?} | Chart  // Chart cell = a sparkline, ≤ 2 per table, axes.y:[{free:true}], may name a longer source carrying the slice column; no columns/wrap/size/tile inside
  ```
  Rows LONG (a column says which series a row is) → ONE mark + a split: `group` colours (bars dodge, lines overlay), `stack` layers from zero (mixed signs diverge; a 100% chart stacks a SHARE column the query computed), `hatch` patterns bars (≤ 3 values), `dash` patterns lines (actual vs forecast = ONE line, `dash:{by:'basis'}`). Rows WIDE (a column per measure) → one mark per column, EACH with `title`. Per chart ONE stacked mark, ONE hatch column, ONE dash column; two same-type marks never split by the same column nor share a name; `columns` never facets by a column a mark colours by. A null y draws nothing; rows to leave out → filter in the query.

- NOT YET (refused BY NAME; → the road to take): an annotation on the second y axis (→ that unit on axes.y[0]); compare (→ both periods as rows + a split); yearStart (→ a fiscal label column on a band x); min/max on x (→ filter in the query); order {kind:'column'} (→ ORDER BY); facet rows (→ columns + wrap); a shape split; sizeTitle / shadeTitle (→ name the column in the query); a second table columns level. Retired/foreign spellings, also refused BY NAME: z, axes.z, domain, zero, id/axis panes, as, style, name, caption, a mark's own dash string, rule dash, x/y keys on annotations, bare order lists, tone words, scales, channels, encoding, color on a mark, sort, width, timeZone, {kind:'currency'}. Over 5,000 rows → aggregate first.
