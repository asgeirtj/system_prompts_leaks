---
name: site-playbooks-google-flights
description: 'Google Flights site playbook: cheapest fares or itineraries on a route.'
---
# Site playbook: Google Flights

Read this before you dispatch a computerUse subagent to this site. Follow the Fastest path, fill in every URL you know, then paste the Dispatch snippet into the Task text as written. The subagent does not read skills, so every rule it needs is in the snippet, including the ground rules at its end. Secrets never go in the Task text. They come through `RequestUserForm`.

## Google Flights cheapest itinerary search

### When to use

The user wants the cheapest one way or round trip fares between two airports on fixed dates, without booking. The parent needs origin and destination IATA codes, the depart date, and the return date for round trips. The user gets the lowest priced itineraries with price, airline, total duration, stops, depart and arrive times, and the results URL as the booking link.

### Fastest path

Build the `tfs` parameter with the Node script below in the box shell, then `browser_navigate` the results URL. No form filling, no clicks.

`tfs` is a protobuf, base64url encoded (`+` to `-`, `/` to `_`, strip `=` padding), with fields in this wire order.

| Field | Wire type | Value |
|---|---|---|
| `f2` | varint | `0` (seat placeholder) |
| `f3` | message, repeated, one per leg | `{ f2: "YYYY-MM-DD" (date), f13: {f1:1, f2:"<ORIGIN>"}, f14: {f1:1, f2:"<DEST>"} }` |
| `f8` | varint | `1` (passengers, 1 adult) |
| `f9` | varint | `1` (cabin, 1=economy, 2=premium economy, 3=business, 4=first) |
| `f19` | varint | trip type, `1`=round trip, `2`=one way |

One way is exactly one `f3` leg with `f19=2`. Round trip is two `f3` legs (the second reverses airports and uses the return date) with `f19=1`. `f19` is the trip type field, not `f2`. A single leg with `f19=1` or no `f19` renders round trip fares labeled "round trip".

```js
// node tfs.js in the box shell
function v(n){const o=[];while(n>127){o.push((n&0x7f)|0x80);n>>>=7;}o.push(n&0x7f);return Buffer.from(o);}
function tag(f,w){return v((f<<3)|w);}
function vf(f,n){return Buffer.concat([tag(f,0),v(n)]);}
function sf(f,s){const b=Buffer.from(s);return Buffer.concat([tag(f,2),v(b.length),b]);}
function mf(f,b){return Buffer.concat([tag(f,2),v(b.length),b]);}
const airport = c => Buffer.concat([vf(1,1), sf(2,c)]);
const leg = (date,from,to) => Buffer.concat([sf(2,date), mf(13,airport(from)), mf(14,airport(to))]);
function tfs({oneway, origin, dest, depart, ret}) {
  const p = [vf(2,0), mf(3, leg(depart, origin, dest))];
  if (!oneway) p.push(mf(3, leg(ret, dest, origin)));
  p.push(vf(8,1), vf(9,1), vf(19, oneway ? 2 : 1));
  return Buffer.concat(p).toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
// one way SFO to JFK 2026-07-15 gives "EAAaHhIKMjAyNi0wNy0xNWoHCAESA1NGT3IHCAESA0pGS0ABSAGYAQI"
```

Results URL. `&curr=USD` forces USD and `&hl=en` forces English. Always append both so the box locale does not change currency or language.

Build one `search?tfs=` URL per route and date pair in the shell, then paste the finished URL into every computerUse Task, including re-dispatches and resumes. Never send the subagent to the Flights home page to type airports and dates.

```
https://www.google.com/travel/flights/search?tfs=<TFS>&curr=USD&hl=en
https://www.google.com/travel/flights/search?tfs=EAAaHhIKMjAyNi0wNy0xNWoHCAESA1NGT3IHCAESA0pGS0ABSAGYAQI&curr=USD&hl=en
```

### Dispatch snippet

```
Open https://www.google.com/travel/flights/search?tfs=<TFS>&curr=USD&hl=en (<TFS> encodes <ORIGIN> to <DEST>, depart <YYYY-MM-DD>, return <YYYY-MM-DD or none>).
Wait about 4 s after load. Confirm the title reads "<Origin city> to <Destination city> | Google Flights".
Run the page script async (page) => page.locator('[role=main]').first().innerText() and parse every row: depart time, arrive time (+1 = next day), airline, total duration, stops, route, $price.
Skip rows without an airline or airport codes, dedupe, sort by price ascending, and return the cheapest <N> as a table with the results URL and one screenshot path.
Read only. Do not click Select flight. If a captcha, sign-in, or payment wall appears, stop and report the URL.
Ground rules for this Task. A Timeout or a net::ERR_* code from browser_navigate means the box cannot reach that host. Do not retry it, even if the tool result says to, and do not run DNS or connectivity checks. Move to the next source this Task names, or report the code and URL. An HTTP block (403, 419, 429, 503) follows this Task's own rule. Work in the tab you start in. Do not open a second tab, and switch tabs only when a tool result names a page you did not intend. In-page tabs are part of the page. A page script is an async (page) => function: run it with browser_run_code if you hold it. Without it, read rendered text from browser_snapshot or browser_find, read a <script> tag from the HTML that curl fetches in the box shell, and report a field neither yields as unreadable, never visible text in its place. Name the read you used. Snapshot a page state once. After a click, a scroll, or a wait this Task calls for, take one new snapshot. Do not snapshot the same state twice. Report as soon as the stop rule above is met, one line per item, only the fields asked for, no page dumps.
```

### Read the result

```js
async (page) => page.locator('[role=main]').first().innerText()   // all rows, about 3 KB
async (page) => page.locator('li.pIav2d').allInnerTexts()         // one string per row
```

Each row reads like `2:35 PM` dash `11:20 PM JetBlue 5 hr 45 min SFO` dash `JFK Nonstop 414 kg CO2e ... $205`, where each dash is an en dash (U+2013) on the page. Multi stop rows add `1 stop` and a connection like `50 min PHX`.

Parse per row. Depart time, arrive time (a trailing `+1` means next day arrival), airline, total duration, stops (`Nonstop` is 0, `N stop` or `N stops` is N), route as two IATA codes joined by U+2013, price `$NNN`.

Rows are duplicated in the DOM, once fully (airline plus airport codes) and once condensed. Skip rows lacking an airline name or airport codes, then dedupe by (depart, arrive, airline, price). The list defaults to Google's "Best" ranking, so sort ascending by price yourself. Flight numbers are not in the list view; they appear only after expanding a row's chevron ("Operated by ... as ... flight NNNN"), which is read only but costs turns. Times are local to each airport and durations already account for the offset. Round trip prices are the total fare.

### When blocked

- In earlier testing no captcha or 403 was hit. Proxies were used only to keep currency and locale stable, which `&curr=USD&hl=en` handles. Not yet verified on a box.
- Zero priced rows in `[role=main]` under the right title means no flights for the route or date. Report it as a real empty result with the URL.
- If the title does not name the requested cities, the page is not the route you asked for.
- Recheck the IATA codes and rebuild `tfs`.
- There is no usable JSON API. The internal `batchexecute` and GRPC endpoints are obfuscated, so do not hunt for one.
- If the page asks for a password, 2FA code, captcha, or payment, stop. Do not solve or bypass. Report which wall appeared and the URL it was on.

## Working with the subagent

Recipe steps name actions, not tools. A page script, a scroll, or a fill lands on whichever browser tools the subagent holds, and the ground rules say how, so paste the snippet as written. A subagent without a page-script tool reads what the snapshot or a shell fetch shows and names that read in its report.

Fill in every URL you know before you dispatch. A dispatch that changes something on the site (a cart, a booking, a form) never goes out without its URL. A read-only lookup may start from a name and a place when its section allows it. When the Fastest path is a shell call, run it with a short timeout and never queue a second lookup behind it. A failed call follows the section's own rule for that response (a single retry, a fresh key, or stop and report); when the section has no rule for it, or the call hangs, dispatch the subagent at once. When the section says the call is unreliable from the box, dispatch in the same round and stop the subagent with `StopSubagent` if the call returns first. A change to a job in flight goes to the same subagent, with `MessageSubagent` while it runs and `Task` with `resume` after it reports. A fresh dispatch spends rounds finding a tab and re-reading the page before it does anything.
