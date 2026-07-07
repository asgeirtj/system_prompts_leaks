#!/usr/bin/env python3
"""
Accumulate traffic history and generate a live dashboard.
Runs as a post-processing step after traffic-to-badge collects data.
Merges today's paths/referrers snapshot into growing history files,
then generates a self-contained HTML dashboard from all traffic data.
"""

import json
import os
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone

REPO_SLUG = "system_prompts_leaks"
REPO_FULL = "asgeirtj/system_prompts_leaks"
TRAFFIC_DIR = f"traffic-{REPO_SLUG}"
HISTORY_REFERRERS = "traffic_referrers_history.json"
HISTORY_PATHS = "traffic_paths_history.json"
HISTORY_STARS = "traffic_stars_history.json"
HISTORY_TRENDING = "traffic_trending_history.json"

# One-time backfill of github.com/trending history, scraped from Trendshift
# (trendshift.io/repositories/14577) which retained it before this tracker
# existed. Used only to seed the very first run; after that the accumulated
# branch history is authoritative and this is never consulted again.
TRENDING_SEED = [{"date":"2025-08-13","javascript":5},{"date":"2025-08-14","javascript":2},{"date":"2025-08-15","javascript":14},{"date":"2025-08-16","javascript":8},{"date":"2025-08-17","javascript":2},{"date":"2025-08-24","javascript":6},{"date":"2025-08-25","javascript":2,"all":10},{"date":"2025-08-26","all":1,"javascript":1},{"date":"2025-08-27","all":1,"javascript":1},{"date":"2025-08-28","all":1,"javascript":1},{"date":"2025-08-29","all":11,"javascript":1},{"date":"2025-09-16","javascript":2},{"date":"2025-09-24","javascript":6},{"date":"2025-10-04","javascript":5},{"date":"2025-10-13","javascript":1,"all":4},{"date":"2025-10-14","javascript":1,"all":6},{"date":"2025-10-15","javascript":1},{"date":"2025-10-16","javascript":15},{"date":"2025-10-26","javascript":12},{"date":"2026-01-27","javascript":1},{"date":"2026-01-28","javascript":1,"all":3},{"date":"2026-01-29","javascript":1,"all":2},{"date":"2026-01-30","javascript":1,"all":2},{"date":"2026-01-31","javascript":2},{"date":"2026-04-02","all":3},{"date":"2026-06-11","javascript":9},{"date":"2026-06-12","javascript":2},{"date":"2026-06-13","javascript":1},{"date":"2026-06-14","javascript":1},{"date":"2026-06-15","javascript":3},{"date":"2026-06-16","javascript":6},{"date":"2026-06-17","javascript":4},{"date":"2026-06-18","javascript":2},{"date":"2026-06-19","javascript":9},{"date":"2026-06-20","javascript":5},{"date":"2026-06-21","javascript":1,"all":16},{"date":"2026-06-22","javascript":3},{"date":"2026-06-23","javascript":2},{"date":"2026-07-04","all":7,"javascript":3},{"date":"2026-07-05","all":3,"javascript":2},{"date":"2026-07-06","all":1,"javascript":1}]

def load_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

def fetch_from_branch(publish_dir, filename):
    full = f"{TRAFFIC_DIR}/{filename}"
    try:
        raw = subprocess.check_output(
            ["git", "show", f"origin/traffic:{full}"],
            stderr=subprocess.DEVNULL,
        )
        return json.loads(raw)
    except (subprocess.CalledProcessError, json.JSONDecodeError):
        return None

def accumulate(publish_dir):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    data_dir = os.path.join(publish_dir, TRAFFIC_DIR)

    referrers = load_json(os.path.join(data_dir, "traffic_referrers.json"))
    paths = load_json(os.path.join(data_dir, "traffic_paths.json"))

    ref_history = (
        load_json(os.path.join(data_dir, HISTORY_REFERRERS))
        or fetch_from_branch(publish_dir, HISTORY_REFERRERS)
        or []
    )
    path_history = (
        load_json(os.path.join(data_dir, HISTORY_PATHS))
        or fetch_from_branch(publish_dir, HISTORY_PATHS)
        or []
    )

    existing_ref_dates = {e["date"] for e in ref_history}
    existing_path_dates = {e["date"] for e in path_history}

    if referrers and today not in existing_ref_dates:
        ref_history.append({"date": today, "referrers": referrers})
        ref_history.sort(key=lambda x: x["date"])

    if paths and today not in existing_path_dates:
        path_history.append({"date": today, "paths": paths})
        path_history.sort(key=lambda x: x["date"])

    with open(os.path.join(data_dir, HISTORY_REFERRERS), "w") as f:
        json.dump(ref_history, f, separators=(",", ":"))

    with open(os.path.join(data_dir, HISTORY_PATHS), "w") as f:
        json.dump(path_history, f, separators=(",", ":"))

    print(f"Accumulated: {len(ref_history)} referrer snapshots, {len(path_history)} path snapshots")
    return ref_history, path_history

def fetch_star_count():
    """Current stargazers_count via the public REST API (one cheap call)."""
    req = urllib.request.Request(
        f"https://api.github.com/repos/{REPO_FULL}",
        headers={"Accept": "application/vnd.github+json", "User-Agent": "traffic-dashboard"},
    )
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r).get("stargazers_count")
    except Exception as e:
        print(f"Star fetch failed: {e}")
        return None

def fetch_star_windows():
    """Real stars gained in rolling 1d / 7d / 30d windows, counted from live
    starredAt timestamps (GraphQL, newest-first). Matches GitHub's own numbers
    and is independent of snapshot timing. Returns None on failure."""
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        return None
    now = datetime.now(timezone.utc)
    bounds = {"d1": now.timestamp() - 86400, "d7": now.timestamp() - 7*86400, "d30": now.timestamp() - 30*86400}
    counts = {"d1": 0, "d7": 0, "d30": 0}
    cursor, pages = None, 0
    try:
        while pages < 60:
            after = f', after: "{cursor}"' if cursor else ''
            query = ('{ repository(owner:"asgeirtj", name:"system_prompts_leaks"){ stargazers(first:100%s, '
                     'orderBy:{field:STARRED_AT, direction:DESC}){ pageInfo{endCursor hasNextPage} edges{starredAt} } } }') % after
            body = json.dumps({"query": query}).encode()
            req = urllib.request.Request("https://api.github.com/graphql", data=body,
                headers={"Authorization": f"Bearer {token}", "User-Agent": "traffic-dashboard", "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as r:
                s = json.load(r)["data"]["repository"]["stargazers"]
            oldest = now.timestamp()
            for e in s["edges"]:
                t = datetime.fromisoformat(e["starredAt"].replace("Z", "+00:00")).timestamp()
                oldest = t
                for k, b in bounds.items():
                    if t >= b:
                        counts[k] += 1
            pages += 1
            if oldest < bounds["d30"] or not s["pageInfo"]["hasNextPage"]:
                break
            cursor = s["pageInfo"]["endCursor"]
        print(f"Star windows: today={counts['d1']} 7d={counts['d7']} 30d={counts['d30']} ({pages} pages)")
        return counts
    except Exception as e:
        print(f"Star windows fetch failed: {e}")
        return None

def accumulate_stars(publish_dir):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    data_dir = os.path.join(publish_dir, TRAFFIC_DIR)

    star_history = (
        load_json(os.path.join(data_dir, HISTORY_STARS))
        or fetch_from_branch(publish_dir, HISTORY_STARS)
        or []
    )

    count = fetch_star_count()
    if count is not None:
        # one cumulative point per day; refresh today's if it already exists
        if star_history and star_history[-1]["date"] == today:
            star_history[-1]["stars"] = count
        else:
            star_history.append({"date": today, "stars": count})
        star_history.sort(key=lambda x: x["date"])

    with open(os.path.join(data_dir, HISTORY_STARS), "w") as f:
        json.dump(star_history, f, separators=(",", ":"))

    print(f"Accumulated: {len(star_history)} star snapshots (latest={star_history[-1]['stars'] if star_history else 'n/a'})")
    return star_history, fetch_star_windows()

def fetch_trending_rank(url):
    """Rank of this repo on a github.com/trending page (1-based article
    position), or None if not listed / fetch failed. Trending has no API,
    but the page is server-rendered HTML: one <h2><a href="/owner/repo">
    per entry, in rank order."""
    import re
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (traffic-dashboard)"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            html = r.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"Trending fetch failed ({url}): {e}")
        return None
    repos = re.findall(r'<h2 class="h3 lh-condensed">.*?href="/([^"]+)"', html, re.S)
    try:
        return repos.index(REPO_FULL) + 1
    except ValueError:
        return None

def accumulate_trending(publish_dir):
    """One entry per day: {"date", "all": rank?, "javascript": rank?}.
    Ranks move all day, so when a day already has an entry keep the BEST
    (lowest) rank seen — the workflow runs several times a day."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    data_dir = os.path.join(publish_dir, TRAFFIC_DIR)

    history = (
        load_json(os.path.join(data_dir, HISTORY_TRENDING))
        or fetch_from_branch(publish_dir, HISTORY_TRENDING)
        or [dict(e) for e in TRENDING_SEED]  # first run only; deep-copied so the constant is never mutated
    )

    ranks = {}
    for lang, url in [
        ("all", "https://github.com/trending?since=daily"),
        ("javascript", "https://github.com/trending/javascript?since=daily"),
    ]:
        rank = fetch_trending_rank(url)
        if rank is not None:
            ranks[lang] = rank

    if ranks:
        entry = next((e for e in history if e["date"] == today), None)
        if entry is None:
            history.append({"date": today, **ranks})
            history.sort(key=lambda x: x["date"])
        else:
            for lang, rank in ranks.items():
                if lang not in entry or rank < entry[lang]:
                    entry[lang] = rank

    with open(os.path.join(data_dir, HISTORY_TRENDING), "w") as f:
        json.dump(history, f, separators=(",", ":"))

    print(f"Accumulated: {len(history)} trending snapshots (today={ranks or 'not trending'})")
    return history

def build_dashboard(publish_dir, ref_history, path_history, star_history, star_windows, trending_history):
    data_dir = os.path.join(publish_dir, TRAFFIC_DIR)
    views = load_json(os.path.join(data_dir, "traffic_views.json"))
    clones = load_json(os.path.join(data_dir, "traffic_clones.json"))

    if not views or not clones:
        print("Missing views/clones data, skipping dashboard")
        return

    embedded = json.dumps({
        "views": views,
        "clones": clones,
        "referrer_series": ref_history,
        "paths_series": path_history,
        "stars_series": star_history,
        "stars_windows": star_windows,
        "trending_series": trending_history,
    }, separators=(",", ":"))

    html = DASHBOARD_TEMPLATE.replace("__DATA_PLACEHOLDER__", embedded)

    out_path = os.path.join(publish_dir, TRAFFIC_DIR, "dashboard.html")
    with open(out_path, "w") as f:
        f.write(html)
    print(f"Dashboard written to {out_path}")

    redirect = """<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0;url=https://github.com/asgeirtj/system_prompts_leaks">
<link rel="canonical" href="https://github.com/asgeirtj/system_prompts_leaks">
<meta property="og:title" content="System Prompts Leaks">
<meta property="og:description" content="Extracted system prompts from Anthropic, OpenAI, Google, xAI, and more. Updated regularly.">
<meta property="og:image" content="https://opengraph.githubassets.com/1/asgeirtj/system_prompts_leaks">
<meta property="og:url" content="https://github.com/asgeirtj/system_prompts_leaks">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<title>System Prompts Leaks</title>
</head></html>"""
    with open(os.path.join(publish_dir, "index.html"), "w") as f:
        f.write(redirect)
    print("Root redirect written")

DASHBOARD_TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>system_prompts_leaks — Traffic Dashboard</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='1' x2='1' y2='0'%3E%3Cstop offset='0%25' stop-color='%236366f1'/%3E%3Cstop offset='100%25' stop-color='%23818cf8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' fill='url(%23g)'/%3E%3Cpath d='M16 44 L26 32 L34 38 L48 20' stroke='%23fff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Ccircle cx='48' cy='20' r='4' fill='%23fbbf24'/%3E%3C/svg%3E">
<script src="https://cdn.jsdelivr.net/npm/apexcharts@4/dist/apexcharts.min.js"></script>
<style>
  :root { --bg:#fafafa;--card:#fff;--border:#e5e7eb;--text:#111827;--text2:#6b7280;--shadow:0 1px 3px rgba(0,0,0,0.06); }
  @media(prefers-color-scheme:dark){ :root { --bg:#0b0f19;--card:#141927;--border:#1e293b;--text:#e2e8f0;--text2:#94a3b8;--shadow:0 1px 3px rgba(0,0,0,0.4); } }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);padding:20px 24px;max-width:1280px;margin:0 auto}
  .header{display:flex;align-items:baseline;gap:12px;margin-bottom:6px}
  h1{font-size:1.4rem;font-weight:800;letter-spacing:-0.02em}
  .subtitle{color:var(--text2);font-size:.8rem;margin-bottom:20px}
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px}
  .stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:var(--shadow)}
  .stat-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text2);font-weight:600}
  .stat-val{font-size:1.6rem;font-weight:800;margin:2px 0;letter-spacing:-0.02em}
  .stat-sub{font-size:.75rem;color:var(--text2)}
  .trend-up{color:#10b981}.trend-down{color:#ef4444}
  .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 16px 8px;margin-bottom:16px;box-shadow:var(--shadow)}
  .card-title{font-size:.85rem;font-weight:700;margin-bottom:8px;letter-spacing:-0.01em}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media(max-width:768px){.grid-2{grid-template-columns:1fr}}
  .section{font-size:.9rem;font-weight:700;margin:24px 0 10px;letter-spacing:-0.01em}
  table{width:100%;border-collapse:collapse;font-size:.8rem}
  th{text-align:left;padding:6px 10px;border-bottom:2px solid var(--border);color:var(--text2);font-weight:700;font-size:.65rem;text-transform:uppercase;letter-spacing:.04em}
  td{padding:6px 10px;border-bottom:1px solid var(--border)}
  tr:last-child td{border-bottom:none}
  tr.clickable{cursor:pointer;transition:background .15s}
  tr.clickable:hover{background:rgba(99,102,241,.06)}
  tr.clickable.active{background:rgba(99,102,241,.10)}
  .mono{font-family:'SF Mono','Fira Code','Cascadia Code',monospace;font-size:.75rem}
  .bar-wrap{position:relative}
  .bar-fill{position:absolute;left:0;top:2px;bottom:2px;border-radius:3px;opacity:.12}
  .badge{display:inline-block;font-size:.6rem;padding:1px 5px;border-radius:4px;font-weight:700;margin-left:4px}
  .badge-up{background:rgba(16,185,129,.15);color:#10b981}
  .badge-down{background:rgba(239,68,68,.15);color:#ef4444}
  .badge-new{background:rgba(99,102,241,.15);color:#6366f1}
  .stat-since{font-size:.6rem;margin-top:6px;padding:2px 7px;background:rgba(99,102,241,.08);color:#6366f1;border-radius:4px;display:inline-block;font-weight:600;letter-spacing:.02em}
  @media(prefers-color-scheme:dark){.stat-since{background:rgba(99,102,241,.15);color:#818cf8}}
  .drill-info{text-align:center;font-size:.75rem;color:var(--text2);margin-top:4px}
</style>
</head>
<body>
<div class="header">
  <h1>system_prompts_leaks</h1>
</div>
<p class="subtitle">Traffic dashboard — auto-updated daily from the <code>traffic</code> branch</p>
<div class="stats" id="stats"></div>
<div class="card"><div class="card-title">Daily Views</div><div id="viewsChart"></div><p class="drill-info">Drag to zoom — click Reset to restore</p></div>
<div class="card"><div class="card-title" style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px">GitHub Stars (cumulative)<span id="starReadout" style="font-weight:600;font-size:.78rem;color:var(--text2)"></span></div><div id="starsChart"></div><p class="drill-info">Bars show stars gained per day · drag to zoom</p></div>
<div class="card" id="trendingCard" style="display:none"><div class="card-title" style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px">GitHub Trending Rank<span id="trendingReadout" style="font-weight:600;font-size:.78rem;color:var(--text2)"></span></div><div id="trendingChart"></div><p class="drill-info">Daily rank on github.com/trending · lower is better · #1 is the top of the page · gaps = not listed that day</p></div>
<p class="section">Page Trends — daily 14-day view count for the top pages</p>
<div class="card"><label style="display:inline-flex;align-items:center;gap:6px;font-size:.75rem;color:var(--text2);margin-bottom:8px;cursor:pointer"><input type="checkbox" id="showAgg" style="cursor:pointer"> Show folders, root &amp; overview</label><div id="pathTrendChart"></div></div>
<div class="grid-2">
  <div class="card"><div class="card-title">Top Pages (top 20 — peak 14-day count across all snapshots)</div><table id="pathsTable"></table></div>
  <div class="card"><div class="card-title">Top Referrers (top 20 — peak 14-day count across all snapshots)</div><table id="refsTable"></table></div>
</div>
<p class="section" id="pageHistorySection" style="display:none">Page History</p>
<div class="card" id="pageHistoryCard" style="display:none"><div class="card-title" id="pageHistoryTitle"></div><div id="pageHistoryChart"></div><table id="pageHistoryTable" style="margin-top:12px"></table></div>
<p class="section">All Referrers — peak 14-day count per source across all snapshots</p>
<div class="card"><div id="allRefsChart"></div></div>
<p class="section">Referrer Trends</p>
<div class="card"><div id="refTrendChart"></div></div>
<p class="section">Day Detail</p>
<div class="card"><div class="card-title" id="dayDetailTitle">Click a day on the views chart to see that day's breakdown</div><div id="dayDetail" style="min-height:60px"></div></div>
<p class="section">Daily Clones</p>
<div class="card"><div id="clonesChart"></div></div>

<script>
const DATA = __DATA_PLACEHOLDER__;
const fmt = n => n != null ? n.toLocaleString() : '-';
const colors = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#06b6d4','#84cc16','#a855f7','#fb923c','#2dd4bf','#f43f5e','#facc15','#38bdf8'];

let isDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
function apexTheme() { return isDark ? 'dark' : 'light'; }

function shortenPath(p) {
  const b = p.replace('/asgeirtj/system_prompts_leaks', '');
  if (!b) return 'Overview';
  if (b === '/tree/main') return '/ (root)';
  if (b.startsWith('/tree/main/')) return b.replace('/tree/main/', '') + '/';
  if (b.startsWith('/blob/main/')) return b.replace('/blob/main/', '');
  return b;
}

const views = DATA.views, clones = DATA.clones;
const vDays = views.views.sort((a,b) => a.timestamp.localeCompare(b.timestamp));
const cDays = clones.clones.sort((a,b) => a.timestamp.localeCompare(b.timestamp));
const peakView = vDays.reduce((a,b) => b.count > a.count ? b : a);
const avgViews = Math.round(views.count / vDays.length);
const last7 = vDays.slice(-7).reduce((s,d) => s + d.count, 0);
const prev7 = vDays.slice(-14,-7).reduce((s,d) => s + d.count, 0);
const trend = prev7 ? Math.round((last7 - prev7) / prev7 * 100) : 0;
const trendCls = trend >= 0 ? 'trend-up' : 'trend-down';
const sinceStart = new Date(vDays[0].timestamp);
const sinceFmt = sinceStart.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
const dayCount = Math.round((Date.now() - sinceStart.getTime()) / 86400000);

const starSeries = (DATA.stars_series||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
const curStars = starSeries.length ? starSeries[starSeries.length-1].stars : null;
// stars gained over the trailing ~7 days. The backfill ends at the API's
// 40k-stargazer cap, so early on there's a multi-week gap before today's
// point — label the gain by its TRUE span so it never claims "7d" for a
// 36-day delta. Self-heals to "7d" once daily points fill in.
// gain over the trailing N days: find the snapshot ~N days back and subtract.
// Returns {gain, days} where days is the TRUE span covered (so it never claims
// "7d" for a wider gap left by the one-time 40k-cap backfill seam).
function starGainOver(n) {
  if (starSeries.length < 2) return null;
  const lastDate = new Date(starSeries[starSeries.length-1].date);
  const cutoff = new Date(lastDate); cutoff.setDate(cutoff.getDate()-n);
  let base = starSeries[0];
  for (const p of starSeries) { if (new Date(p.date) <= cutoff) base = p; }
  return { gain: curStars - base.stars, days: Math.round((lastDate - new Date(base.date)) / 86400000) || 1 };
}
// Prefer live rolling-window counts (real starredAt timestamps, matches
// GitHub's own numbers); fall back to the daily series if that fetch failed.
const sw = DATA.stars_windows;
const g7s = starGainOver(7);
const starGain = sw ? sw.d7 : (g7s ? g7s.gain : null);
const starGainDays = 7;

if (curStars != null) {
  let parts;
  if (sw) {
    parts = [['today',sw.d1],['7d',sw.d7],['30d',sw.d30]];
  } else {
    parts = [['today',starGainOver(1)?.gain],['7d',starGainOver(7)?.gain],['30d',starGainOver(30)?.gain]];
  }
  document.getElementById('starReadout').innerHTML = parts
    .filter(([,v])=>v!=null)
    .map(([l,v])=>`<span class="${v>=0?'trend-up':'trend-down'}">${v>=0?'+':''}${fmt(v)}</span> ${l}`)
    .join(' &nbsp;·&nbsp; ');
}

const statCards = [
  { l:'Total Views', v:fmt(views.count), s:fmt(views.uniques)+' unique', t:`since ${sinceFmt} · ${dayCount}d` },
  { l:'Total Clones', v:fmt(clones.count), s:fmt(clones.uniques)+' unique' },
  { l:'Daily Avg', v:fmt(avgViews), s:fmt(Math.round(clones.count/cDays.length))+' clones' },
  { l:'Peak Day', v:fmt(peakView.count), s:peakView.timestamp.slice(0,10) },
  { l:'7-Day Trend', v:`<span class="${trendCls}">${trend>=0?'+':''}${trend}%</span>`, s:fmt(last7)+' vs '+fmt(prev7) },
];
if (curStars != null) {
  const tdy = sw ? sw.d1 : null;
  const sub = sw
    ? `<span class="trend-up">+${fmt(sw.d1)}</span> today · <span class="trend-up">+${fmt(sw.d7)}</span> 7d`
    : (starGain!=null ? `<span class="${starGain>=0?'trend-up':'trend-down'}">${starGain>=0?'+':''}${fmt(starGain)}</span> last ${starGainDays}d` : '&nbsp;');
  statCards.splice(2, 0, { l:'GitHub Stars', v:'★ '+fmt(curStars), s: sub });
}

document.getElementById('stats').innerHTML = statCards.map(s=>`<div class="stat"><div class="stat-label">${s.l}</div><div class="stat-val">${s.v}</div><div class="stat-sub">${s.s}</div>${s.t?`<div class="stat-since">${s.t}</div>`:''}</div>`).join('');

const baseOpts = { chart:{fontFamily:'Inter,-apple-system,system-ui,sans-serif',background:'transparent',foreColor:isDark?'#94a3b8':'#6b7280',toolbar:{show:true,tools:{download:true,selection:true,zoom:true,zoomin:false,zoomout:false,pan:false,reset:true}}}, theme:{mode:apexTheme()}, grid:{borderColor:isDark?'#1e293b':'#e5e7eb',strokeDashArray:3}, tooltip:{theme:apexTheme()}, };

new ApexCharts(document.getElementById('viewsChart'), {
  ...baseOpts,
  chart:{...baseOpts.chart, type:'area', height:320, id:'views',
    events:{ markerClick:function(e,ctx,cfg){ showDayDetail(vDays[cfg.dataPointIndex]?.timestamp.slice(0,10)); } },
    zoom:{enabled:true,type:'x',autoScaleYaxis:true},
  },
  series:[
    {name:'Views', data:vDays.map(d=>[new Date(d.timestamp).getTime(), d.count])},
    {name:'Unique', data:vDays.map(d=>[new Date(d.timestamp).getTime(), d.uniques])},
  ],
  colors:['#6366f1','#f59e0b'],
  fill:{type:'gradient',gradient:{shadeIntensity:1,opacityFrom:0.4,opacityTo:0.05,stops:[0,95]}},
  stroke:{curve:'smooth',width:2.5},
  xaxis:{type:'datetime',labels:{datetimeUTC:false}},
  yaxis:{labels:{formatter:v=>v>=1000?(v/1000).toFixed(1)+'k':v}},
  dataLabels:{enabled:false},
  markers:{size:0,hover:{size:5}},
  legend:{position:'top',horizontalAlign:'left',fontSize:'12px'},
}).render();

if (starSeries.length) {
  // Build daily points. If two snapshots are >1 day apart (e.g. the tracker
  // missed a few days), spread the gain evenly across the missing days so a
  // multi-day delta never renders as one false single-day spike.
  const cumData = [], deltaData = [];
  starSeries.forEach((p,i)=>{
    const t = new Date(p.date).getTime();
    if (i===0) { cumData.push([t,p.stars]); deltaData.push([t,p.stars]); return; }
    const prev = starSeries[i-1], pt = new Date(prev.date).getTime();
    const days = Math.max(1, Math.round((t-pt)/86400000));
    const per = (p.stars - prev.stars) / days;
    for (let k=1;k<=days;k++) {
      const tk = pt + k*86400000;
      cumData.push([tk, k===days ? p.stars : Math.round(prev.stars + per*k)]);
      deltaData.push([tk, Math.round(per)]);
    }
  });
  new ApexCharts(document.getElementById('starsChart'), {
    ...baseOpts,
    chart:{...baseOpts.chart, type:'line', height:320, id:'stars', zoom:{enabled:true,type:'x',autoScaleYaxis:true}},
    series:[
      {name:'Total stars', type:'area', data:cumData},
      {name:'Gained / day', type:'column', data:deltaData},
    ],
    colors:['#f59e0b','#6366f1'],
    fill:{type:['gradient','solid'],gradient:{shadeIntensity:1,opacityFrom:0.35,opacityTo:0.05,stops:[0,95]}},
    stroke:{curve:'smooth',width:[2.5,0]},
    plotOptions:{bar:{borderRadius:2,columnWidth:'55%'}},
    xaxis:{type:'datetime',labels:{datetimeUTC:false}},
    yaxis:[
      {seriesName:'Total stars',labels:{formatter:v=>v>=1000?(v/1000).toFixed(1)+'k':Math.round(v)}},
      {seriesName:'Gained / day',opposite:true,labels:{formatter:v=>Math.round(v)}},
    ],
    dataLabels:{enabled:false},
    markers:{size:0,hover:{size:5}},
    legend:{position:'top',horizontalAlign:'left',fontSize:'12px'},
    tooltip:{shared:true,x:{format:'MMM d, yyyy'}},
  }).render();
}

// GitHub Trending rank. No official API — scraped daily from the trending
// page's article order. Y axis is reversed so #1 sits at the top; gaps mean
// the repo wasn't on that day's list. Two series: "All languages" and
// "JavaScript" (the language bucket GitHub files this repo under).
const trendSeries = (DATA.trending_series||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
if (trendSeries.length) {
  document.getElementById('trendingCard').style.display = '';
  const mkSeries = key => trendSeries.map(d=>[new Date(d.date).getTime(), d[key]!=null?d[key]:null]);
  const latest = trendSeries[trendSeries.length-1];
  const best = key => { const v = trendSeries.map(d=>d[key]).filter(x=>x!=null); return v.length?Math.min(...v):null; };
  const bestAll = best('all'), bestJs = best('javascript');
  const bits = [];
  if (latest.all != null) bits.push(`<span class="trend-up">#${latest.all}</span> all today`);
  if (latest.javascript != null) bits.push(`<span class="trend-up">#${latest.javascript}</span> JS today`);
  if (bestAll != null) bits.push(`best #${bestAll} all`);
  if (bestJs != null) bits.push(`best #${bestJs} JS`);
  document.getElementById('trendingReadout').innerHTML = bits.join(' &nbsp;·&nbsp; ');

  new ApexCharts(document.getElementById('trendingChart'), {
    ...baseOpts,
    chart:{...baseOpts.chart, type:'line', height:280, id:'trending', zoom:{enabled:true,type:'x'}},
    series:[
      {name:'All languages', data:mkSeries('all')},
      {name:'JavaScript', data:mkSeries('javascript')},
    ],
    colors:['#6366f1','#f59e0b'],
    stroke:{curve:'straight',width:2.5},
    xaxis:{type:'datetime',labels:{datetimeUTC:false}},
    yaxis:{reversed:true,min:1,forceNiceScale:true,labels:{formatter:v=>'#'+Math.round(v)}},
    dataLabels:{enabled:false},
    markers:{size:4,hover:{size:6}},
    legend:{position:'top',horizontalAlign:'left',fontSize:'12px'},
    tooltip:{shared:true,x:{format:'MMM d, yyyy'},y:{formatter:v=>v!=null?'#'+v:'not listed'}},
  }).render();
}

if (curStars != null && trendSeries.length) {
  const latest = trendSeries[trendSeries.length-1];
  const bestRank = Math.min(...trendSeries.flatMap(d=>[d.all,d.javascript].filter(x=>x!=null)));
  const cur = latest.all != null ? latest.all : latest.javascript;
  const lbl = latest.all != null ? 'all langs' : 'JavaScript';
  if (cur != null) statCards.splice(statCards.length, 0, { l:'Trending Rank', v:'#'+cur, s:`${lbl} today · best #${bestRank}` });
  document.getElementById('stats').innerHTML = statCards.map(s=>`<div class="stat"><div class="stat-label">${s.l}</div><div class="stat-val">${s.v}</div><div class="stat-sub">${s.s}</div>${s.t?`<div class="stat-since">${s.t}</div>`:''}</div>`).join('');
}

new ApexCharts(document.getElementById('clonesChart'), {
  ...baseOpts,
  chart:{...baseOpts.chart, type:'bar', height:240, stacked:false},
  series:[
    {name:'Clones', data:cDays.map(d=>[new Date(d.timestamp).getTime(), d.count])},
    {name:'Unique', data:cDays.map(d=>[new Date(d.timestamp).getTime(), d.uniques])},
  ],
  colors:['#6366f1','#f59e0b'],
  plotOptions:{bar:{borderRadius:3,columnWidth:'60%'}},
  xaxis:{type:'datetime',labels:{datetimeUTC:false}},
  yaxis:{labels:{formatter:v=>v>=1000?(v/1000).toFixed(1)+'k':v}},
  dataLabels:{enabled:false},
  legend:{position:'top',horizontalAlign:'left',fontSize:'12px'},
}).render();

const latestRefs = DATA.referrer_series.length ? DATA.referrer_series[DATA.referrer_series.length-1].referrers : [];
const prevRefs = DATA.referrer_series.length > 7 ? DATA.referrer_series[DATA.referrer_series.length-8].referrers : null;

// GitHub's API only returns 10 paths/referrers per snapshot, so aggregate the
// peak 14-day count per source across all snapshots to surface up to 20.
const allPathsMap = {};
DATA.paths_series.forEach(s=>s.paths.forEach(p=>{ if(!allPathsMap[p.path]||p.count>allPathsMap[p.path].count) allPathsMap[p.path]={count:p.count,uniques:p.uniques,peak:s.date}; }));
// A path is a real file page if it's a /blob/main/ URL; everything else
// (the repo Overview, /tree/main root, and /tree/main/<dir> folder listings)
// is an aggregate view that the toggle can hide.
const isFilePath = p => p.replace('/asgeirtj/system_prompts_leaks','').startsWith('/blob/main/');

const allRefsMap = {};
DATA.referrer_series.forEach(s=>s.referrers.forEach(r=>{ if(!allRefsMap[r.referrer]||r.count>allRefsMap[r.referrer].count) allRefsMap[r.referrer]={count:r.count,uniques:r.uniques,peak:s.date}; }));
const allRefs = Object.entries(allRefsMap).sort((a,b)=>b[1].count-a[1].count);

function renderTopPagesTable(showAgg) {
  const topPaths = Object.entries(allPathsMap).filter(([p])=>showAgg||isFilePath(p)).sort((a,b)=>b[1].count-a[1].count).slice(0,20);
  document.getElementById('pathsTable').innerHTML = '<thead><tr><th>#</th><th>Page</th><th>Peak Views</th><th>Unique</th></tr></thead><tbody>'+
    topPaths.map(([path,d],i)=>{
      const w = Math.round(d.count/(topPaths[0]?.[1].count||1)*100);
      const esc = path.replace(/'/g,"\\'");
      return `<tr class="clickable" onclick="showPageHistory('${esc}')"><td style="color:var(--text2)">${i+1}</td><td class="bar-wrap"><div class="bar-fill" style="width:${w}%;background:${colors[i%colors.length]}"></div><span class="mono">${shortenPath(path)}</span></td><td>${fmt(d.count)}</td><td>${fmt(d.uniques)}</td></tr>`;
    }).join('')+'</tbody>';
}

let pageHistChart = null;
function showPageHistory(path) {
  document.querySelectorAll('#pathsTable tr.clickable').forEach(r=>r.classList.remove('active'));
  const rows = document.querySelectorAll('#pathsTable tr.clickable');
  rows.forEach(r=>{ if(r.querySelector('.mono')?.textContent===shortenPath(path)) r.classList.add('active'); });

  const series = DATA.paths_series.map(s=>{
    const p = s.paths.find(x=>x.path===path);
    return { date:s.date, count:p?p.count:null, uniques:p?p.uniques:null };
  }).filter(d=>d.count!==null);

  const section = document.getElementById('pageHistorySection');
  const card = document.getElementById('pageHistoryCard');
  section.style.display = '';
  card.style.display = '';
  document.getElementById('pageHistoryTitle').textContent = shortenPath(path) + ' — view count over time';

  if (pageHistChart) pageHistChart.destroy();
  pageHistChart = new ApexCharts(document.getElementById('pageHistoryChart'), {
    ...baseOpts,
    chart:{...baseOpts.chart, type:'area', height:260, zoom:{enabled:true,type:'x',autoScaleYaxis:true}},
    series:[
      {name:'Views (14d window)', data:series.map(d=>[new Date(d.date).getTime(), d.count])},
      {name:'Unique', data:series.map(d=>[new Date(d.date).getTime(), d.uniques])},
    ],
    colors:['#6366f1','#f59e0b'],
    fill:{type:'gradient',gradient:{shadeIntensity:1,opacityFrom:0.4,opacityTo:0.05,stops:[0,95]}},
    stroke:{curve:'smooth',width:2.5},
    xaxis:{type:'datetime',labels:{datetimeUTC:false}},
    yaxis:{labels:{formatter:v=>v>=1000?(v/1000).toFixed(1)+'k':v}},
    dataLabels:{enabled:false},
    markers:{size:3,hover:{size:5}},
    legend:{position:'top',horizontalAlign:'left',fontSize:'12px'},
    tooltip:{shared:true,x:{format:'MMM d, yyyy'}},
  });
  pageHistChart.render();

  const tbl = document.getElementById('pageHistoryTable');
  tbl.innerHTML = '<thead><tr><th>Date</th><th>Views (14d)</th><th>Unique</th><th>Change</th></tr></thead><tbody>'+
    series.map((d,i)=>{
      let badge='';
      if(i>0&&series[i-1].count!=null){const delta=d.count-series[i-1].count;const pct=series[i-1].count?Math.round(delta/series[i-1].count*100):0;if(delta!==0) badge=`<span class="badge ${delta>0?'badge-up':'badge-down'}">${delta>0?'+':''}${pct}%</span>`;}
      return `<tr><td class="mono">${d.date}</td><td>${fmt(d.count)}</td><td>${fmt(d.uniques)}</td><td>${badge}</td></tr>`;
    }).reverse().join('')+'</tbody>';

  card.scrollIntoView({behavior:'smooth',block:'nearest'});
}

const topRefs = allRefs.slice(0,20);
document.getElementById('refsTable').innerHTML = '<thead><tr><th>#</th><th>Referrer</th><th>Peak Views</th><th>Unique</th></tr></thead><tbody>'+
  topRefs.map(([ref,d],i)=>{
    const w = Math.round(d.count/(topRefs[0]?.[1].count||1)*100);
    let badge = '';
    if(prevRefs){ const cur=latestRefs.find(x=>x.referrer===ref); const p=prevRefs.find(x=>x.referrer===ref); if(cur&&p){const delta=Math.round((cur.count-p.count)/p.count*100); if(delta!==0) badge=`<span class="badge ${delta>0?'badge-up':'badge-down'}">${delta>0?'+':''}${delta}%</span>`;}else if(cur&&!p){badge='<span class="badge badge-new">new</span>';}}
    return `<tr><td style="color:var(--text2)">${i+1}</td><td class="bar-wrap"><div class="bar-fill" style="width:${w}%;background:${colors[i%colors.length]}"></div>${ref}${badge}</td><td>${fmt(d.count)}</td><td>${fmt(d.uniques)}</td></tr>`;
  }).join('')+'</tbody>';

new ApexCharts(document.getElementById('allRefsChart'), {
  ...baseOpts,
  chart:{...baseOpts.chart, type:'bar', height:Math.max(250, allRefs.length*32)},
  series:[{name:'Peak 14-day views',data:allRefs.map(([,d])=>d.count)},{name:'Unique',data:allRefs.map(([,d])=>d.uniques)}],
  colors:['#6366f1','#f59e0b'],
  plotOptions:{bar:{horizontal:true,borderRadius:4,barHeight:'65%',dataLabels:{position:'top'}}},
  xaxis:{categories:allRefs.map(([n])=>n),labels:{formatter:v=>v>=1000?(v/1000).toFixed(0)+'k':v}},
  yaxis:{labels:{style:{fontSize:'11px'}}},
  dataLabels:{enabled:false},
  tooltip:{y:{formatter:v=>fmt(v)}},
  legend:{position:'top',horizontalAlign:'left',fontSize:'12px'},
}).render();

const allRefNames = new Set();
DATA.referrer_series.forEach(s=>s.referrers.forEach(r=>allRefNames.add(r.referrer)));
const topRefNames = [...allRefNames].map(n=>({n,c:(latestRefs.find(r=>r.referrer===n)||{count:0}).count})).sort((a,b)=>b.c-a.c).slice(0,8).map(x=>x.n);

new ApexCharts(document.getElementById('refTrendChart'), {
  ...baseOpts,
  chart:{...baseOpts.chart, type:'line', height:320, zoom:{enabled:true,type:'x'}},
  series:topRefNames.map((name,i)=>({
    name, data:DATA.referrer_series.map(s=>{const r=s.referrers.find(x=>x.referrer===name); return [new Date(s.date).getTime(), r?r.count:null];})
  })),
  colors:colors.slice(0,8),
  stroke:{curve:'smooth',width:2},
  xaxis:{type:'datetime'},
  yaxis:{labels:{formatter:v=>v>=1000?(v/1000).toFixed(1)+'k':v}},
  dataLabels:{enabled:false},
  markers:{size:0,hover:{size:4}},
  legend:{position:'top',fontSize:'11px'},
}).render();

const allPathNames = new Set();
DATA.paths_series.forEach(s=>s.paths.forEach(p=>allPathNames.add(p.path)));

// Page Trends + Top Pages share one toggle. Default hides aggregate paths
// (Overview / root / folder listings) so only real file pages show; the
// checkbox brings them back. Chart is destroyed/recreated on toggle.
let pathTrendChart = null;
function renderPageTrend(showAgg) {
  const names = [...allPathNames].filter(n=>showAgg||isFilePath(n))
    .map(n=>({n,c:(allPathsMap[n]||{count:0}).count})).sort((a,b)=>b.c-a.c).slice(0,8).map(x=>x.n);
  if (pathTrendChart) pathTrendChart.destroy();
  pathTrendChart = new ApexCharts(document.getElementById('pathTrendChart'), {
    ...baseOpts,
    chart:{...baseOpts.chart, type:'line', height:380, zoom:{enabled:true,type:'x'}},
    series:names.map(name=>({
      name:shortenPath(name), data:DATA.paths_series.map(s=>{const p=s.paths.find(x=>x.path===name); return [new Date(s.date).getTime(), p?p.count:null];})
    })),
    colors:colors.slice(0,8),
    stroke:{curve:'smooth',width:2},
    xaxis:{type:'datetime'},
    yaxis:{labels:{formatter:v=>v>=1000?(v/1000).toFixed(1)+'k':v}},
    dataLabels:{enabled:false},
    markers:{size:0,hover:{size:4}},
    legend:{position:'top',fontSize:'11px'},
  });
  pathTrendChart.render();
}
function renderPages() {
  const showAgg = document.getElementById('showAgg').checked;
  renderTopPagesTable(showAgg);
  renderPageTrend(showAgg);
}
document.getElementById('showAgg').addEventListener('change', renderPages);
renderPages();

function showDayDetail(date) {
  if (!date) return;
  const el = document.getElementById('dayDetail');
  const titleEl = document.getElementById('dayDetailTitle');
  const day = vDays.find(d=>d.timestamp.startsWith(date));
  const clone = cDays.find(d=>d.timestamp.startsWith(date));
  const snap = DATA.referrer_series.find(s=>s.date===date);
  const pathSnap = DATA.paths_series.find(s=>s.date===date);
  titleEl.textContent = date;
  let html = '<div class="grid-2" style="gap:12px">';
  html += '<div><strong style="font-size:.75rem">Views:</strong> '+(day?fmt(day.count)+' ('+fmt(day.uniques)+' unique)':'no data')+'<br><strong style="font-size:.75rem">Clones:</strong> '+(clone?fmt(clone.count)+' ('+fmt(clone.uniques)+' unique)':'no data')+'</div>';
  if (snap) {
    html += `<div><strong style="font-size:.75rem">Referrers (14-day window, ${snap.referrers.length}):</strong><br>`;
    snap.referrers.forEach(r=>{ html += `<span class="mono" style="font-size:.7rem">${r.referrer}: ${fmt(r.count)} (${fmt(r.uniques)} uniq)</span><br>`; });
    html += '</div>';
  }
  html += '</div>';
  if (pathSnap) {
    html += `<div style="margin-top:8px"><strong style="font-size:.75rem">Top pages (14-day window, ${pathSnap.paths.length}):</strong>`;
    html += '<table style="margin-top:4px"><thead><tr><th>Page</th><th>Views</th><th>Unique</th></tr></thead><tbody>';
    pathSnap.paths.forEach(p=>{ html += `<tr><td class="mono">${shortenPath(p.path)}</td><td>${fmt(p.count)}</td><td>${fmt(p.uniques)}</td></tr>`; });
    html += '</tbody></table></div>';
  }
  el.innerHTML = html;
  el.scrollIntoView({behavior:'smooth',block:'nearest'});
}
</script>
</body>
</html>"""

if __name__ == "__main__":
    publish_dir = sys.argv[1]
    print(f"Processing traffic data in {publish_dir}")
    ref_history, path_history = accumulate(publish_dir)
    star_history, star_windows = accumulate_stars(publish_dir)
    trending_history = accumulate_trending(publish_dir)
    build_dashboard(publish_dir, ref_history, path_history, star_history, star_windows, trending_history)
