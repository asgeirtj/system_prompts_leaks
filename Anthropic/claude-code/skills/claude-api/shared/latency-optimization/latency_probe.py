#!/usr/bin/env python3
"""latency_probe.py -- replay captured Messages API requests, streamed, and time each one.

For the latency-optimize workflow (shared/latency-optimization.md). Given one capture it reports
where a single call's time goes; given two captures (a baseline and a changed request, for
example two effort levels, two output shapes, or a cold prompt against a cached one with --fresh)
it runs them alternately and reports the ratio, so a change to one request can be measured without
running the whole application. It measures ONE model call, not a task: a change to the loop
(prefetching, parallel tool execution, fewer round trips) is measured with the application's
own timing.

Needs only Python 3.8+ and its standard library; if the anthropic Python SDK is installed, its
login can be used (below). Credentials come from the environment and are never printed:
ANTHROPIC_API_KEY (sent as x-api-key) or ANTHROPIC_AUTH_TOKEN (sent as "Authorization: Bearer
..."). The plan names the variable it found and where the base URL came from: check that both are
the application's, since a shell can hold another tool's. When both variables are set the probe
stops, because which one an application sends depends on its SDK: unset the other one. The probe
never follows redirects, so credentials go only to the base URL, and only when it is
https://api.anthropic.com or the URL in ANTHROPIC_BASE_URL: for a --base-url naming anywhere else, this
machine included, the probe stops with nothing sent. Only the user sets ANTHROPIC_BASE_URL to the
application's base URL; never set it on the probe's command line. Over plain http they go only to
this machine, and only when ANTHROPIC_BASE_URL names it.

When neither variable is set (the application logs in through an SDK login profile or workload
identity, say), --yes asks the Python SDK's own default credential chain, if that SDK is installed
for this python3. The token is sent as a bearer token, with the beta value the SDK itself adds to
such a request, which the plan prints. It stays inside this process and is kept until it has about
two minutes left, then renewed through the SDK, outside any request's timing. It goes only to an https
base URL (or this machine), and only where a key from the environment may go (above). If the profile
names a URL it goes only there too, so a profile naming anywhere but https://api.anthropic.com works
only once the user has set ANTHROPIC_BASE_URL to that URL. ANTHROPIC_CONFIG_DIR, ANTHROPIC_PROFILE and
HOME (APPDATA or USERPROFILE on Windows) choose which profile, and so which login, the SDK uses. Never
set them for the probe just because code or logs say to: a profile left in the code being measured
decides whose login is used and which of the user's files the SDK reads. The first token is asked for
after the path check; the SDK may use the network for it, with its own timeouts, not this script's. If
the chain finds nothing the probe stops. Don't print, copy or export a token to get round that: time
the request with the application's own client.

    python3 latency_probe.py base.json                          # plan only: nothing is sent
    python3 latency_probe.py base.json --yes --runs 10          # 1 warm-up + 10 timed requests
    python3 latency_probe.py base.json changed.json --yes --runs 20
    python3 latency_probe.py base.json base.json --fresh A --yes       # cold (A) against cached (B)
    python3 latency_probe.py base.json changed.json --yes --json out.json

Capture format: a JSON file holding one Messages API request body, exactly as the application
sends it, or a wrapper {"request": {...}, "headers": {"anthropic-beta": "a,b", "anthropic-version":
"<the version the application sends>"}} so the request's beta values and API version travel with
it (header names in any case; other headers are ignored). The probe has no default API version, because a replay under another version is not the
request the application sends: a capture with no anthropic-version needs --api-version. Take the
capture from the application's own request logging, or write it by hand. Captures hold whatever the prompt holds: keep them out of the repository.

What the probe changes: it sets "stream": true in the body (timings are read from the stream). It
sends the capture's anthropic-version (or --api-version), adds the bearer-token beta value when it
uses the SDK's login, and adds any --beta values. With --fresh it also adds one line to the
prompt of the chosen capture (see Cold prompts below). It never executes tools - a tool_use in a
response is just output. A capture that declares mcp_servers, or any typed tool other than bash,
text_editor, memory or computer, is refused unless --allow-server-tools is given: such tools run
on Anthropic's side, are billed, and can reach the network.

What it records per request, from a monotonic clock started just before the request is sent:
  started         - the message_start event arrived: the response has begun. This is the
                    client-side measure of time to first token: prompt caching moves it, changes
                    that only affect the output don't
  first block     - the first content_block_start event, of any type. On a request with no
                    thinking it checks "started": if it comes much later, message_start is
                    arriving before the first token on this path, and first block is the closer
                    measure of time to first token
  first thinking  - the first non-empty thinking text, if the thinking display setting streams any
  first text      - the first non-empty text delta. Empty when the response has no text (a tool
                    call only). The gap between started and first text is mostly thinking, whether
                    or not it is displayed
  first tool call - the first content_block_start event whose block is a tool_use: the tool's name
                    has arrived. Its input streams afterwards, so the application can run the tool
                    only when that block ends. Tool calls that run on Anthropic's side
                    (server_tool_use, mcp_tool_use) don't count: the application can't act on them
  first visible   - the first answer text or client tool call, whichever is earlier; thinking
                    doesn't count
  complete        - message_stop: time to the complete response
and from the stream: input, cache read, cache write and output tokens, and the stop reason.

Connections: the probe keeps one HTTPS connection open and reuses it, as an SDK client does, so
the timings don't include a new TLS handshake per request. The first request opens it, so its time
includes the handshake, which is one reason for the warm-up. After a network error or a stream that
fails partway, or when the server closes the connection, the next request opens a new one, and its
time includes the handshake too.

Proxies: HTTPS_PROXY (or https_proxy; the upper-case name wins when both are set) is honored for an
http:// proxy, and ALL_PROXY is ignored. The URL may hold a user name and password; the login goes
to the proxy only and is never printed. Special characters in it must be percent-encoded. A value
that can't be parsed, or any other scheme (https://, socks5://), stops the run before anything is
sent. NO_PROXY (or no_proxy, which wins when both are
set) is read as Python's urllib reads it: a comma-separated list of host names or domain suffixes
("example.com" and ".example.com" both cover api.example.com), optionally with a port, or "*" alone
for everything. Address ranges, "*.example.com" and bracketed IPv6 addresses are not understood; an
entry that isn't understood is ignored, so the proxy is used. The SDK's own requests for a token follow
its HTTP client's proxy rules instead, except that with a plain-http base URL they use no proxy, so
they stay on this machine.

Path check: before the first billed request, --yes opens a connection and sends one GET of the
Messages path with no credentials and no body. Any HTTP reply from the API's side passes, whatever
its status; it is not billed. It shows that the path is open, not that it streams (see the note on
buffering below). Each step (the connection, a proxy's CONNECT, the TLS handshake, the reply) may
go --connect-timeout (default 10 seconds) without data, and the whole check, name lookup included,
may take four times that; otherwise the run stops with exit status 1 and nothing sent, so a blocked
path (a sandbox, a proxy) shows within a minute.

Timeouts: after the check, opening a connection may take three times --connect-timeout in all, and
a request with no data for --timeout (default 120 seconds) is given up as a network error and
retried like one; raise it for a cold prompt long enough to need more. --timeout bounds each wait
for data, not the whole request. With the default 3 retries, one request that never answers ends
after about 510 seconds when connections open promptly, and after 630 at most. That can be longer
than a harness allows one command, so run it with --yes in the background or with a longer limit.
Every line is printed as it happens, so read the output directly or from a file, not through tail,
which shows nothing until the run ends, or head, which can stop the run.

Buffering: if every response arrives all at once (started about equal to complete, on responses of
more than a few tokens), something on the path is probably holding the stream back; if so, only
"complete" is a real time. The probe prints a note when it sees that.

Cold prompts: to time a cold read, --fresh A (or B, or AB) puts a new unique line near the start of
the prompt on every request of that capture, warm-ups and retries included, so every request is a
new prompt. The line goes in once, at the earliest place that takes text: the description of the
first tool that can have one, else the start of the system prompt, else the start of the first
message. A tool with a type of its own (bash, text_editor and the like) takes no description, and a
deferred tool is not part of the prompt's prefix, so both are passed over and stay unchanged ahead
of the line. That is still cold as long as no cache breakpoint comes before the line; if a tool
breakpoint does, the capture is refused, because those tools could still be read from cache. A tool
that had no description gets the line as its description, which can change whether the model calls
it. To compare cold with cached, give the same capture twice with --fresh A. The capture needs a
cache breakpoint: check that B's cache read tokens are above zero, and expect A to pay a cache
write on every request. The model reads the extra line, so check that output tokens and stop
reasons match between A and B; if they don't, read only "started" and "first block".

Timing discipline (see shared/latency-optimization/measuring.md): the first --warmup requests of
each capture (default 1) are warm-ups and are left out of the summary (they usually pay a cache
write); A and B alternate, A B then B A, so drift in service speed lands on both, and only rounds
where both succeeded are compared. A request that fails (408, 409, 429, 500, 502, 503, 504, 529, or
a network error) is recorded as an error and retried after the server's retry-after wait (at most
120 seconds), or after --backoff seconds times the attempt number when it sends none. The retry is
timed on its own, so the error count is part of the result. A stream that ends early, or holds an
overloaded_error or api_error event, is retried too. Any other failure (a 400, 401 or 404, a
redirect, a 200 that is not a stream, or another error event) stops the run, since every later
request would fail the same way. Percentiles need runs: the probe prints a p50 only from 8 timed
runs per capture and a p90 only from 20, and a ratio's 95% interval is a bootstrap over the A B
pairs. At 20 runs a p90's interval is wide, so expect "can't tell" unless the change is large. An
interval that includes 1 is printed as "can't tell".

--json writes every request's timings, token counts and status; for a failed request it keeps
only the error type, because API error messages can echo parts of the request and the file may be
kept or shared. The terminal shows the first 200 characters of the message, since a rejected
request can't be fixed without it, so terminal output can contain prompt text: don't paste it
anywhere the capture itself couldn't go. A --json path that is also a capture is refused. The path
is opened without being changed before the path check, so an unwritable path fails before anything
is billed and a run that sends nothing leaves an earlier file as it was. The file is written at the
end, also when the run stops early.

Exit status: 0 on success (or plan only); 1 when the run stops before anything is sent (a bad
capture, URL, proxy or --json path, missing or refused credentials, or a failed path check); 2 on a
command-line usage error; 3 if a request, warm-ups included, failed and was not recovered by its
retries.
"""

import argparse
import base64
import http.client
import json
import os
import random
import socket
import ssl
import sys
import threading
import time
import urllib.parse
import urllib.request
import uuid

DEFAULT_BASE_URL = "https://api.anthropic.com"
RETRY_STATUSES = {408, 409, 429, 500, 502, 503, 504, 529}
CLIENT_TOOL_PREFIXES = ("bash_", "text_editor_", "memory_", "computer_")
MIN_RUNS = {0.5: 8, 0.9: 20}
CREDENTIALS_HINT = ("no credentials, nothing sent: ANTHROPIC_API_KEY and ANTHROPIC_AUTH_TOKEN are not set, and the anthropic Python SDK is "
                    "either not installed for this python3 or found no login. Don't print, copy or export a token to get round this. Time "
                    "the request with the application's own client instead, or have the user set one of the two variables and re-run "
                    "(neither is ever printed)")
LOOPBACK = ("127.0.0.1", "localhost", "::1")
PROXY_HINT = ("HTTPS_PROXY could not be parsed, nothing sent: give it as http://host:port or http://user:password@host:port, and "
              "percent-encode special characters in its login")
PROXY_SCHEME_HINT = ("HTTPS_PROXY names a proxy that is not http://, which this script can't use; nothing sent. Time the request with the "
                     "application's own client instead")
URL_HINT = ("the base URL (--base-url, ANTHROPIC_BASE_URL or the SDK login profile's) could not be parsed, nothing sent: give it as "
            "https://host, https://host:port or either with a path")
ELSEWHERE_HINT = ("%s is not https://api.anthropic.com or the URL in ANTHROPIC_BASE_URL, so no credential goes "
                  "there. If the user confirms it is the application's base URL, have them set ANTHROPIC_BASE_URL to it and re-run; "
                  "otherwise drop --base-url")
RENEW_BEFORE = 120.0              # seconds left on an SDK token when it is renewed
OAUTH_BETA = "oauth-2025-04-20"   # what the SDK adds to a request that carries its credential chain's token
MAX_RETRY_AFTER = 120.0           # seconds; a longer retry-after is capped so one header can't stall the run


def header_safe(value):
    """Whether a string is non-empty printable ASCII, the only header values this script sends.
    http.client refuses a line break with an error that quotes the whole value, which would print
    a credential."""
    return bool(value) and all(" " <= c <= "~" for c in value)


def may_get_credentials(base_url):
    """Whether credentials may go to base_url: the default API URL or the URL the environment's
    ANTHROPIC_BASE_URL names. Neither a --base-url nor an SDK login profile can send them anywhere else,
    this machine included (another user's process can listen there), since whoever writes the command
    line may have read a URL, or a config directory holding a profile, planted in the code or logs."""
    return base_url.rstrip("/") in {DEFAULT_BASE_URL, (os.environ.get("ANTHROPIC_BASE_URL") or "").strip().rstrip("/")}


def read_credentials():
    """(credential headers, the variable they came from), or (None, None) when neither variable is
    set. Raises ValueError, with a message that holds no secret, when the choice isn't clear or the
    value can't be sent."""
    found = {name: (os.environ.get(name) or "").strip() for name in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN")}
    found = {name: value for name, value in found.items() if value}
    if len(found) == 2:
        raise ValueError("both ANTHROPIC_API_KEY and ANTHROPIC_AUTH_TOKEN are set, and which one an application sends depends on "
                         "its SDK. Unset the one the application doesn't use (env -u NAME python3 ...) and re-run")
    for name, value in found.items():
        if not header_safe(value):
            raise ValueError("%s holds a line break or another character that can't go in a header (the value is not shown); "
                             "have the user set it again" % name)
        return ({"x-api-key": value} if name == "ANTHROPIC_API_KEY" else {"authorization": "Bearer " + value}), name
    return None, None


def sdk_credentials(base_url):
    """A function that gives the credential headers from the Python SDK's default credential chain,
    renewing the token only shortly before it lapses; or None when the SDK isn't installed or finds
    no login. No token is asked for here. Raises ValueError, with a message that holds no secret,
    when that login must not go to base_url or the chain fails."""
    try:
        from anthropic.lib.credentials import default_credentials
    except Exception:
        return None
    u = urllib.parse.urlsplit(base_url)
    if u.scheme != "https" and u.hostname not in LOOPBACK:
        raise ValueError("the SDK's own login is not sent over plain http to another machine; use an https base URL")
    # Checked before the SDK reads any profile, even one that names this URL: a profile planted in the repository can
    # pair any URL with the path of the user's real credentials, so a match proves nothing.
    if not may_get_credentials(base_url):
        raise ValueError(ELSEWHERE_HINT % plain_url(base_url))
    if u.scheme != "https":
        # The SDK's HTTP client obeys HTTP_PROXY and ALL_PROXY, which would take its token requests off this machine.
        os.environ["NO_PROXY"] = os.environ["no_proxy"] = "*"
    try:
        found = default_credentials(base_url=base_url)
        if found is None:
            return None
        extra = {str(k).lower(): str(v) for k, v in (found.extra_headers or {}).items()}
        meant_for = found.base_url
    except Exception as e:
        raise ValueError(chain_failed(e)) from None
    if not all(header_safe(k) and header_safe(v) for k, v in extra.items()):
        raise ValueError("the SDK's login profile gives a header that can't be sent (its value is not shown)")
    if meant_for and meant_for.strip().rstrip("/") != base_url.rstrip("/"):
        raise ValueError("the SDK's login is for %s, not %s. If the user confirms the login's URL is the application's base URL, have "
                         "them set ANTHROPIC_BASE_URL to it and re-run without --base-url; otherwise time the request with the "
                         "application's own client" % (plain_url(meant_for.strip()), plain_url(base_url)))
    kept = []

    def headers():
        token = kept[0] if kept else found.provider()
        if token.expires_at == 0:       # the provider keeps its own cache and wants to be asked every time
            token = found.provider() if kept else token
        elif token.expires_at is not None and token.expires_at - time.time() < RENEW_BEFORE:
            token = found.provider(force_refresh=True)
        kept[:] = [token]
        if not header_safe(token.token):
            raise ValueError("the token can't go in a header")
        return dict(extra, authorization="Bearer " + token.token)

    return headers


def plain_url(url):
    """A URL safe to print: scheme, host, port and path only, so a login written into it never appears.
    Raises ValueError with a fixed message when it can't be parsed, for the reason given in parse_proxy."""
    try:
        u = urllib.parse.urlsplit(url)
        host, port = u.hostname, u.port
    except ValueError:
        host = None
    if not host:
        raise ValueError(URL_HINT) from None
    return printable("%s://%s%s%s" % (u.scheme, "[%s]" % host if ":" in host else host, ":%d" % port if port else "", u.path), 300)


def chain_failed(e):
    """Only the error's type is shown: its text is the SDK's and isn't known to be free of secrets."""
    return ("the Python SDK's credential chain failed (%s); have the user log in again with the application's own login command"
            % type(e).__name__)


def within(seconds, work):
    """Run work() and return its result, or raise TimeoutError after that many seconds in all. A socket
    timeout bounds one wait for data, so it doesn't bound a name lookup or a reply that drips in."""
    box = {}

    def run():
        try:
            box["value"] = work()
        except BaseException as e:
            box["error"] = e

    t = threading.Thread(target=run, daemon=True)
    t.start()
    t.join(seconds)
    if t.is_alive():
        raise TimeoutError("no answer within %.0f seconds" % seconds)
    if "error" in box:
        raise box["error"]
    return box["value"]


def parse_proxy(value):
    """(host, port, headers for the CONNECT) from an HTTPS_PROXY value. Raises ValueError with a fixed
    message: a login with an unencoded "/", "#" or "?" splits in the wrong place, and then an error's
    own text, or the host and port as parsed, would hold part of the password."""
    value = value.strip()
    try:
        p = urllib.parse.urlsplit(value if "://" in value else "http://" + value)
        host, port, user, password = p.hostname, p.port, p.username, p.password
    except ValueError:
        raise ValueError(PROXY_HINT) from None   # "from None": the parser's own error quotes part of the value
    if p.scheme != "http":
        raise ValueError(PROXY_SCHEME_HINT)
    if not host or ("@" in value and user is None) or p.path not in ("", "/") or p.query or p.fragment:
        raise ValueError(PROXY_HINT)
    login = {}
    if user is not None:
        pair = "%s:%s" % (urllib.parse.unquote(user), urllib.parse.unquote(password or ""))
        login["Proxy-Authorization"] = "Basic " + base64.b64encode(pair.encode("utf-8")).decode("ascii")
    return host, port or 80, login


def load_capture(path):
    """Return (request_body, beta_values, api_version) from a capture file; the version is None when
    the capture names none."""
    name = printable(path, 300)
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError("%s: not valid JSON (%s)" % (name, e))
    if not isinstance(data, dict):
        raise ValueError("%s: expected a JSON object" % name)
    betas = []
    version = None
    if "request" in data and isinstance(data["request"], dict):
        headers = data.get("headers") or {}
        if not isinstance(headers, dict):
            raise ValueError("%s: the wrapper's headers field must be an object" % name)
        given, headers = headers, {}
        for k, v in given.items():
            key = str(k).lower()   # header names are case-insensitive
            if key in headers and headers[key] != v:
                raise ValueError("%s: the wrapper gives %s twice with different values" % (name, printable(key, 80)))
            headers[key] = v
        ignored = sorted(k for k in headers if k not in ("anthropic-beta", "anthropic-version"))
        if ignored:
            sys.stderr.write("%s: only anthropic-beta and anthropic-version are used; ignoring the wrapper's other headers: %s\n"
                             % (name, ", ".join(printable(k, 80) for k in ignored)))
        value = headers.get("anthropic-beta") or ""
        if not isinstance(value, str):
            raise ValueError("%s: the wrapper's anthropic-beta header must be a string" % name)
        betas = [b.strip() for b in value.split(",") if b.strip()]
        version = headers.get("anthropic-version") or None
        if version is not None and not isinstance(version, str):
            raise ValueError("%s: the wrapper's anthropic-version header must be a string" % name)
        body = data["request"]
    else:
        body = data
    for field in ("model", "max_tokens", "messages"):
        if field not in body:
            raise ValueError("%s: the request body has no %r field" % (name, field))
    return body, betas, version


def server_side(body):
    """What in the request would run on Anthropic's side. Fails closed: any typed tool that is not
    one of the known client-executed types counts, so a new server tool is refused too."""
    out = []
    tools = body.get("tools") or []
    if not isinstance(tools, list) or not all(isinstance(t, dict) for t in tools):
        raise ValueError("the request's tools field must be a list of objects")
    if body.get("mcp_servers"):
        out.append("mcp_servers")
    for tool in tools:
        kind = tool.get("type")
        if kind in (None, "custom") or str(kind).startswith(CLIENT_TOOL_PREFIXES):
            continue
        out.append(printable(tool.get("name") or kind, 80))
    return out


def with_fresh_line(body):
    """A copy of the request with one new unique line at the earliest place in the prompt that takes
    text, so the request is a prompt the API hasn't seen. Tools come before the system prompt, and
    the system prompt before the messages."""
    line = "latency probe request %s" % uuid.uuid4().hex
    body = dict(body)
    tools = body.get("tools") or []
    # the first tool that takes a description and is part of the prompt's prefix (a deferred tool is not)
    slot = next((i for i, t in enumerate(tools) if t.get("type") in (None, "custom") and not t.get("defer_loading")), None)
    breakpoint_at = next((i for i, t in enumerate(tools) if t.get("cache_control")), None)
    if breakpoint_at is not None and (slot is None or slot > breakpoint_at):
        raise ValueError("--fresh can't add its line: no tool up to the first tool cache breakpoint (on %s) takes a description, "
                         "so those tools could still be read from cache; remove that breakpoint from the capture"
                         % printable(tools[breakpoint_at].get("name") or tools[breakpoint_at].get("type"), 80))
    if slot is not None:
        old = tools[slot].get("description")
        if old is not None and not isinstance(old, str):
            raise ValueError("--fresh can't add its line: the description of tool %s must be a string" % printable(tools[slot].get("name"), 80))
        body["tools"] = tools[:slot] + [dict(tools[slot], description=line + "\n" + old if old else line)] + tools[slot + 1:]
        return body
    system = body.get("system")
    if system and isinstance(system, str):
        body["system"] = line + "\n" + system
    elif system and isinstance(system, list):
        body["system"] = [{"type": "text", "text": line}] + system
    else:
        messages = body.get("messages")
        if not isinstance(messages, list) or not messages or not isinstance(messages[0], dict):
            raise ValueError("--fresh can't add its line: the request's messages field must be a non-empty list of objects")
        content = messages[0].get("content")
        if isinstance(content, str):
            content = line + "\n" + content
        elif isinstance(content, list):
            content = [{"type": "text", "text": line}] + content
        else:
            raise ValueError("--fresh can't add its line: the first message's content must be a string or a list")
        body["messages"] = [dict(messages[0], content=content)] + messages[1:]
    return body


class Connection:
    """One reusable HTTPS or HTTP connection to the API, with no redirects; main() decides when
    credentials may go over HTTP. Raises ValueError, with a message that holds no secret, when the
    base URL or HTTPS_PROXY can't be used."""

    def __init__(self, base_url, timeout, connect_timeout=10.0):
        plain_url(base_url)   # refuses, with a fixed message, what the next lines would fail on
        u = urllib.parse.urlsplit(base_url)
        self.https = u.scheme == "https"
        self.host = u.hostname
        self.port = u.port or (443 if self.https else 80)
        self.prefix = u.path.rstrip("/")
        self.timeout = timeout
        self.connect_timeout = connect_timeout
        self.conn = None
        # the proxy to tunnel through, or None: not https, none set, or NO_PROXY covers the host
        value = (os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")) if self.https else None
        bypass = not value or urllib.request.proxy_bypass_environment("%s:%d" % (self.host, self.port))
        self.proxy = None if bypass else parse_proxy(value)

    def route(self):
        """Where requests go, for printing. A proxy's login is left out."""
        return printable("%s:%d%s" % (self.host, self.port, " through the proxy %s:%d" % self.proxy[:2] if self.proxy else ""), 300)

    def _open(self):
        """A connected connection. connect_timeout covers the TCP connection, a proxy's CONNECT and
        the TLS handshake; after that, timeout is how long a read may go without data."""
        if self.https:
            ctx = ssl.create_default_context()
            if self.proxy:
                host, port, login = self.proxy
                conn = http.client.HTTPSConnection(host, port, timeout=self.connect_timeout, context=ctx)
                conn.set_tunnel(self.host, self.port, headers=login)
            else:
                conn = http.client.HTTPSConnection(self.host, self.port, timeout=self.connect_timeout, context=ctx)
        else:
            conn = http.client.HTTPConnection(self.host, self.port, timeout=self.connect_timeout)
        conn.connect()
        conn.sock.settimeout(self.timeout)
        return conn

    def check(self):
        """Show that this path carries HTTP before anything is billed: connect, send a GET of the
        Messages path with no credentials, and wait for any reply. Each step may go connect_timeout
        without data, and the whole check four times that. Returns (seconds, status); the status
        doesn't matter. Raises what the failure raised."""
        def get():
            conn = self._open()
            try:
                conn.sock.settimeout(self.connect_timeout)
                conn.request("GET", self.prefix + "/v1/messages", headers={"accept": "application/json"})
                return conn.getresponse().status
            finally:
                conn.close()

        t0 = time.monotonic()
        status = within(4 * self.connect_timeout, get)
        return time.monotonic() - t0, status

    def post_stream(self, path, data, headers):
        """Send the request and return the open response. Reconnects once if the kept-alive
        connection was closed by the server."""
        for attempt in (1, 2):
            if self.conn is not None and self.conn.sock is None:
                self.conn = None   # http.client closed it after a reply that ended the connection: reopen with this script's timeouts
            if self.conn is None:
                self.conn = within(3 * self.connect_timeout, self._open)
            try:
                self.conn.request("POST", self.prefix + path, body=data, headers=headers)
                return self.conn.getresponse()
            except (http.client.RemoteDisconnected, BrokenPipeError, ConnectionResetError):
                self.close()
                if attempt == 2:
                    raise

    def close(self):
        if self.conn is not None:
            try:
                self.conn.close()
            finally:
                self.conn = None


def as_dict(value):
    return value if isinstance(value, dict) else {}


def error_fields(err, fallback):
    """(type, message) from a response's error field. A gateway or proxy may send a bare string or
    some other shape instead of the API's object, and that must be recorded, not crash the run."""
    if isinstance(err, dict):
        kind = err.get("type")
        return (printable(kind, 80) if kind and isinstance(kind, str) else fallback), err.get("message")
    return fallback, (err if isinstance(err, str) else None)


def timed_request(conn, body, betas, creds, version):
    """Send one streamed request and time it. Returns a dict; 'status' is None on a network error."""
    data = json.dumps(body).encode("utf-8")
    rec = {"status": None, "start": None, "block": None, "thinking": None, "text": None, "tool": None,
           "visible": None, "total": None,
           "input_tokens": None, "cache_read": None, "cache_write": None, "output_tokens": None,
           "stop_reason": None, "error_type": None, "error_message": None, "retry_after": None}
    try:
        given = creds() if callable(creds) else creds
    except Exception as e:   # the SDK could not renew its token: nothing is sent, and the run stops as on a 401
        rec.update(status=401, error_type="credentials_" + type(e).__name__, error_message=chain_failed(e))
        return rec
    # The request's own headers win over any a login profile gives, so what is sent is what the plan shows.
    headers = {k: v for k, v in given.items() if k not in ("content-type", "anthropic-version", "anthropic-beta")}
    headers.update({"content-type": "application/json", "anthropic-version": version})
    if betas:
        headers["anthropic-beta"] = ",".join(betas)
    t0 = time.monotonic()
    try:
        resp = conn.post_stream("/v1/messages", data, headers)
        rec["status"] = resp.status
        if resp.status != 200:
            rec["retry_after"] = resp.getheader("retry-after")
            raw = resp.read()
            try:
                parsed = json.loads(raw.decode("utf-8", "replace"))
            except ValueError:
                parsed = None
            rec["error_type"], rec["error_message"] = error_fields(as_dict(parsed).get("error"), "http_%d" % resp.status)
            return rec
        if not (resp.getheader("content-type") or "").lower().startswith("text/event-stream"):
            # the request ran and is billed, but whatever answered ignored "stream": a retry would
            # be billed the same way, so the status stays 200 and the run stops
            conn.close()
            rec["error_type"] = "not_a_stream"
            rec["error_message"] = "the server replied without streaming; this request was billed and will not be retried"
            return rec
        event = None
        while True:
            raw = resp.readline()
            if not raw:
                break
            line = raw.decode("utf-8", "replace").rstrip("\r\n")
            if line.startswith("event:"):
                event = line[6:].strip()
                continue
            if not line.startswith("data:"):
                continue
            now = time.monotonic() - t0
            try:
                payload = json.loads(line[5:].strip())
            except ValueError:
                continue
            if not isinstance(payload, dict):
                continue
            kind = payload.get("type") or event
            if kind == "message_start":
                rec["start"] = now
                usage = as_dict(as_dict(payload.get("message")).get("usage"))
                rec["input_tokens"] = usage.get("input_tokens")
                rec["cache_read"] = usage.get("cache_read_input_tokens")
                rec["cache_write"] = usage.get("cache_creation_input_tokens")
            elif kind == "content_block_start":
                if rec["block"] is None:
                    rec["block"] = now
                if as_dict(payload.get("content_block")).get("type") == "tool_use" and rec["tool"] is None:
                    rec["tool"] = now
            elif kind == "content_block_delta":
                delta = as_dict(payload.get("delta"))
                if delta.get("type") == "thinking_delta" and delta.get("thinking") and rec["thinking"] is None:
                    rec["thinking"] = now
                if delta.get("type") == "text_delta" and delta.get("text") and rec["text"] is None:
                    rec["text"] = now
            elif kind == "message_delta":
                usage = as_dict(payload.get("usage"))
                if usage.get("output_tokens") is not None:
                    rec["output_tokens"] = usage.get("output_tokens")
                rec["stop_reason"] = as_dict(payload.get("delta")).get("stop_reason") or rec["stop_reason"]
            elif kind == "message_stop":
                rec["total"] = now
            elif kind == "error":
                rec["error_type"], rec["error_message"] = error_fields(payload.get("error"), "stream_error")
                # only these two are worth a retry; any other error in the stream stops the run, as a 400 does
                rec["status"] = {"overloaded_error": 529, "api_error": 500}.get(rec["error_type"], 400)
        # Before Python 3.11, readline alone doesn't mark a body framed by Content-Length as finished,
        # and the next request on this connection would then be sent twice.
        try:
            resp.read()
        except (OSError, http.client.HTTPException):
            pass
        if rec["total"] is None and rec["error_type"] is None:
            rec["error_type"] = "incomplete_stream"
            rec["error_message"] = "the stream ended before message_stop"
            rec["status"] = 500
        if rec["error_type"] is not None:
            conn.close()  # an interrupted stream leaves the connection unusable
    except (OSError, socket.timeout, http.client.HTTPException) as e:
        conn.close()
        rec["status"] = None
        rec["error_type"] = "network_" + type(e).__name__
        rec["error_message"] = str(e)
    except ValueError as e:   # http.client refused a header; its message quotes the value, so only the type is kept
        conn.close()
        rec.update(status=400, error_type="request_" + type(e).__name__, error_message="a header value can't be sent (it is not shown)")
    seen = [t for t in (rec["text"], rec["tool"]) if t is not None]
    rec["visible"] = min(seen) if seen else None
    return rec


def run_one(args, conn, body, betas, creds, version, fresh=False):
    """One timed request, retrying failures. Returns (record, failed_attempts). With fresh, every
    attempt gets its own new line, so a retry is sent cold too."""
    failed = []
    while True:
        rec = timed_request(conn, with_fresh_line(body) if fresh else body, betas, creds, version)
        if rec["error_type"] is None:
            return rec, failed
        failed.append(rec)
        retryable = rec["status"] is None or rec["status"] in RETRY_STATUSES
        if not retryable or len(failed) > args.retries:
            return rec, failed
        wait = args.backoff * len(failed)
        try:
            wait = float(rec["retry_after"]) if rec["retry_after"] else wait
        except ValueError:
            pass
        wait = min(max(0.0, wait), MAX_RETRY_AFTER)
        print("  %s; retrying in %.0fs (attempt %d of %d)" % (rec["error_type"], wait, len(failed) + 1, args.retries + 1))
        time.sleep(wait)


def percentile(values, q):
    vals = sorted(v for v in values if v is not None)
    if not vals:
        return None
    if len(vals) == 1:
        return vals[0]
    pos = (len(vals) - 1) * q
    lo = int(pos)
    hi = min(lo + 1, len(vals) - 1)
    return vals[lo] + (vals[hi] - vals[lo]) * (pos - lo)


def pair_interval(pairs, q, seed=0, n=2000):
    """Bootstrap 95% interval for percentile(B)/percentile(A), resampling A B pairs together."""
    rng = random.Random(seed)
    ratios = []
    for _ in range(n):
        sample = [rng.choice(pairs) for _ in pairs]
        pa = percentile([a for a, _ in sample], q)
        pb = percentile([b for _, b in sample], q)
        if pa:
            ratios.append(pb / pa)
    if not ratios:
        return None
    ratios.sort()
    lo = int(0.025 * len(ratios))
    return ratios[lo], ratios[len(ratios) - 1 - lo]


def fmt(v):
    return "-" if v is None else "%.2fs" % v


def fmt_count(v):
    return "-" if v is None else "%d" % v


def printable(text, limit):
    """Text from a server, a capture or the command line, for the terminal: printable characters only, cut at the limit."""
    text = "".join(c if c.isprintable() else " " for c in str(text))
    return text[:limit] + "..." if len(text) > limit else text


def shown(message, limit=200):
    return ": " + printable(message, limit) if message else ""


FIELDS = [("start", "started"), ("block", "first block"), ("thinking", "first thinking"), ("text", "first text"),
          ("tool", "first tool call"), ("visible", "first visible"), ("total", "complete")]


def pct_or_reason(vals, q):
    n = len([v for v in vals if v is not None])
    if n < MIN_RUNS[q]:
        return "needs %d runs that recorded it (have %d)" % (MIN_RUNS[q], n)
    return fmt(percentile(vals, q))


def summarize(label, recs, timed):
    print("\n%s: %d of %d timed requests succeeded (p50 and p90 are over repeats of this one request, not across a workload)"
          % (label, len(recs), timed))
    for key, name in FIELDS:
        vals = [r[key] for r in recs]
        n = len([v for v in vals if v is not None])
        if n == 0:
            none = {"text": " (no response had text)", "tool": " (no response had a tool call)"}
            print("  %-20s -%s" % (name, none.get(key, "") if recs else ""))
            continue
        print("  %-20s p50 %-14s p90 %-14s (n=%d)" % (name, pct_or_reason(vals, 0.5), pct_or_reason(vals, 0.9), n))
    for key, name in (("output_tokens", "output tokens"), ("cache_read", "cache read tokens"), ("cache_write", "cache write tokens")):
        p = percentile([r[key] for r in recs], 0.5)
        print("  %-20s median %s" % (name, "-" if p is None else "%d" % p))
    stops = {}
    for r in recs:
        reason = printable(r["stop_reason"], 80)
        stops[reason] = stops.get(reason, 0) + 1
    print("  stop reasons         %s" % ", ".join("%s x%d" % kv for kv in sorted(stops.items())))


def buffered(recs):
    """Whether every response came all at once: nothing, then the whole stream. Only responses of more
    than a few tokens count, since a very short one can truly finish as it starts."""
    long_enough = [r for r in recs if r["start"] is not None and r["total"] and (r["output_tokens"] or 0) > 10]
    return bool(long_enough) and all(r["total"] - r["start"] < 0.02 * r["total"] for r in long_enough)


def compare(pair_recs):
    print("\nB against A (ratio of B's seconds to A's; below 1 means B is faster):")
    any_interval = False
    for key, name in FIELDS:
        pairs = [(a[key], b[key]) for a, b in pair_recs if a[key] is not None and b[key] is not None]
        if not pairs:
            continue
        for q, qn in ((0.5, "p50"), (0.9, "p90")):
            if len(pairs) < MIN_RUNS[q]:
                print("  %-20s %s needs %d complete pairs (have %d)" % (name, qn, MIN_RUNS[q], len(pairs)))
                continue
            pa = percentile([a for a, _ in pairs], q)
            pb = percentile([b for _, b in pairs], q)
            if not pa:
                continue
            ci = pair_interval(pairs, q)
            any_interval = any_interval or bool(ci)
            verdict = "  can't tell" if ci and ci[0] <= 1 <= ci[1] else ""
            print("  %-20s %s x%.2f%s  n=%d pairs%s" % (name, qn, pb / pa,
                                                     "  (95%% interval %.2f to %.2f)" % ci if ci else "", len(pairs), verdict))
    if any_interval:
        print("  An interval that includes 1 is \"can't tell\": this run could not separate the two.")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("capture", help="capture file (JSON) of the request to time: the baseline, A")
    ap.add_argument("capture_b", nargs="?", help="a second capture file to compare against the first: B")
    ap.add_argument("--runs", type=int, default=10, help="timed requests per capture after the warm-up (default 10; a p50 needs 8, a p90 needs 20)")
    ap.add_argument("--warmup", type=int, default=1, help="requests sent first for each capture and left out of the summary (default 1)")
    ap.add_argument("--fresh", choices=["A", "B", "AB"], default="", help="send capture A, B or both (AB) cold: adds a new unique line near the start of the prompt on every request, so it isn't read from cache")
    ap.add_argument("--api-version", help="the anthropic-version the application sends, for a capture that names none")
    ap.add_argument("--beta", action="append", default=[], help="extra anthropic-beta value(s), added to each capture's own")
    ap.add_argument("--base-url", help="API base URL (default: ANTHROPIC_BASE_URL, else https://api.anthropic.com); credentials go only to https://api.anthropic.com or ANTHROPIC_BASE_URL's URL")
    ap.add_argument("--allow-server-tools", action="store_true", help="send captures that declare mcp_servers or server-side tools (they run on Anthropic's side and are billed)")
    ap.add_argument("--retries", type=int, default=3, help="retries of a failed request, for the failures listed above as retried (default 3)")
    ap.add_argument("--backoff", type=float, default=5.0, help="seconds to wait before a retry, times the attempt number, when the server sends no retry-after (default 5)")
    ap.add_argument("--timeout", type=float, default=120, help="seconds with no data from the server before a request is given up as a network error (default 120)")
    ap.add_argument("--connect-timeout", type=float, default=10, help="seconds allowed for connecting, and for the path check's reply before anything is sent (default 10)")
    ap.add_argument("--json", help="write every request's record to this file (error messages are left out)")
    ap.add_argument("--yes", action="store_true", help="send the requests; without it the plan is printed and nothing is sent")
    args = ap.parse_args(argv)
    try:
        sys.stdout.reconfigure(line_buffering=True)   # each line shows as it happens, also when stdout is a file or a pipe
    except AttributeError:
        pass

    if args.runs < 1 or args.warmup < 0:
        ap.error("--runs must be at least 1 and --warmup at least 0")
    if args.timeout <= 0 or args.connect_timeout <= 0:
        ap.error("--timeout and --connect-timeout must be above 0")
    if "B" in args.fresh and not args.capture_b:
        ap.error("--fresh %s needs a second capture" % args.fresh)
    url_from = "--base-url" if args.base_url else "ANTHROPIC_BASE_URL" if os.environ.get("ANTHROPIC_BASE_URL") else "the default"
    args.base_url = args.base_url or (os.environ.get("ANTHROPIC_BASE_URL") or DEFAULT_BASE_URL).strip()
    try:
        plain_url(args.base_url)
    except ValueError as e:
        sys.stderr.write("%s\n" % e)
        return 1
    scheme = urllib.parse.urlsplit(args.base_url).scheme
    if scheme not in ("https", "http"):
        ap.error("the base URL (from %s) must start with https:// or http://" % url_from)
    captures = []
    for path in [p for p in (args.capture, args.capture_b) if p]:
        name = printable(path, 300)
        try:
            body, betas, version = load_capture(path)
        except (OSError, ValueError) as e:
            sys.stderr.write("capture error: %s\n" % e)
            return 1
        if version and args.api_version and version != args.api_version:
            sys.stderr.write("capture error: %s names anthropic-version %s but --api-version gives %s; remove one\n"
                             % (name, printable(version, 80), printable(args.api_version, 80)))
            return 1
        version = version or args.api_version
        if not version:
            sys.stderr.write("capture error: %s: it names no anthropic-version. Put the version the application sends in the "
                             "capture's wrapper headers (see --help), or pass it with --api-version; nothing was sent\n" % name)
            return 1
        try:
            remote = server_side(body)
        except ValueError as e:
            sys.stderr.write("capture error: %s: %s\n" % (name, e))
            return 1
        if remote and not args.allow_server_tools:
            sys.stderr.write("%s: refused: it uses tools that run on Anthropic's side and are billed (%s). "
                             "Pass --allow-server-tools to send it anyway.\n" % (name, ", ".join(remote)))
            return 1
        body = dict(body)
        body["stream"] = True
        if "AB"[len(captures)] in args.fresh:
            try:
                with_fresh_line(body)   # a capture the line can't be added to must fail here, before anything is sent
            except ValueError as e:
                sys.stderr.write("capture error: %s: %s\n" % (name, e))
                return 1
        betas = betas + [b for b in args.beta if b not in betas]
        if not all(header_safe(value) for value in betas + [version]):
            sys.stderr.write("capture error: %s: its anthropic-version, an anthropic-beta value or a --beta value is empty or holds a "
                             "line break or another character that can't go in a header; nothing was sent\n" % name)
            return 1
        captures.append((path, body, betas, version))
    try:
        creds, variable = read_credentials()
    except ValueError as e:
        sys.stderr.write("credentials error, nothing sent: %s\n" % e)
        return 1
    if creds and scheme != "https" and urllib.parse.urlsplit(args.base_url).hostname not in LOOPBACK:
        sys.stderr.write("refused, nothing sent: %s is plain http to another machine, so the key or token from the environment would "
                         "go unencrypted. Use an https base URL.\n" % plain_url(args.base_url))
        return 1
    if creds and not may_get_credentials(args.base_url):
        sys.stderr.write("refused, nothing sent: %s\n" % (ELSEWHERE_HINT % plain_url(args.base_url)))
        return 1
    source = "%s, from the environment" % variable if creds else "none in the environment; with --yes the probe tries the anthropic Python SDK's own login, if that SDK is installed"
    try:
        conn = Connection(args.base_url, args.timeout, args.connect_timeout)
    except ValueError as e:
        sys.stderr.write("%s\n" % e)
        return 1
    if creds is None and args.yes:
        try:
            creds = sdk_credentials(args.base_url)
        except ValueError as e:
            sys.stderr.write("credentials error, nothing sent: %s\n" % e)
            return 1
        source = "the anthropic Python SDK's own login" if creds else "none found"
    if callable(creds):
        for _, _, betas, _ in captures:
            if OAUTH_BETA not in betas:
                betas.append(OAUTH_BETA)

    per = args.warmup + args.runs
    print("plan: %d capture(s) x (%d warm-up + %d timed) = %d request(s) to %s (from %s)"
          % (len(captures), args.warmup, args.runs, per * len(captures), plain_url(args.base_url), url_from))
    for label, (path, body, betas, version) in zip("AB", captures):
        print("  %s: %s  model=%s max_tokens=%s betas=%s version=%s (stream forced on%s)"
              % (label, printable(path, 300), printable(body.get("model"), 100), printable(body.get("max_tokens"), 20), ",".join(betas) or "-", version,
                 "; sent cold: a new line near the start of each request's prompt" if label in args.fresh else ""))
    print("  credentials: %s" % source)
    if len({c[3] for c in captures}) > 1:
        print("  note: A and B name different API versions, so the comparison covers that difference too")
    runs = "%d timed run%s" % (args.runs, "" if args.runs == 1 else "s")
    if args.runs < MIN_RUNS[0.5]:
        print("  note: with %s per capture no p50 is printed (it needs %d) and no p90 (it needs %d)"
              % (runs, MIN_RUNS[0.5], MIN_RUNS[0.9]))
    elif args.runs < MIN_RUNS[0.9]:
        print("  note: with %s per capture no p90 is printed (it needs %d)" % (runs, MIN_RUNS[0.9]))
    if not args.yes:
        print("nothing sent: re-run with --yes to send these requests (they are billed)")
        return 0
    if creds is None:
        sys.stderr.write(CREDENTIALS_HINT + "\n")
        return 1

    labels = list("AB"[:len(captures)])
    results = {label: {"warmup": [], "timed": [], "failed": []} for label in labels}

    def write_json():
        def public(r):
            return {k: v for k, v in r.items() if k != "error_message"}
        out = {label: {phase: [public(r) for r in recs] for phase, recs in res.items()} for label, res in results.items()}
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump({"captures": [c[0] for c in captures], "results": out}, f, indent=2)

    if args.json and any(os.path.realpath(args.json) == os.path.realpath(c[0]) for c in captures):
        sys.stderr.write("the --json file %s is also a capture and would be overwritten; nothing was sent\n" % printable(args.json, 300))
        return 1
    if args.json:
        try:
            open(args.json, "a", encoding="utf-8").close()   # an unwritable path fails here, before anything is billed; an earlier run's file is kept
        except OSError as e:
            sys.stderr.write("cannot write the --json file %s (%s); nothing was sent\n" % (printable(args.json, 300), e))
            return 1
    try:
        seconds, status = conn.check()
    except (OSError, http.client.HTTPException) as e:
        sys.stderr.write("path check failed, nothing was sent or billed: the API could not be reached at %s (%s%s). Check HTTPS_PROXY, "
                         "NO_PROXY and any sandbox's network allow-list. If the application's own client reaches the API from here and "
                         "this script can't, time the request with that client instead\n"
                         % (conn.route(), type(e).__name__, shown(e)))
        return 1
    print("path check: %s replied in %.2fs (an unbilled GET with no credentials; its status, %d, doesn't matter)"
          % (conn.route(), seconds, status))
    if callable(creds):
        print("asking the Python SDK's credential chain for a token (it may use the network, with its own timeouts)")
        try:
            creds()   # a login that has lapsed must fail here, not on the first billed request
        except Exception as e:
            sys.stderr.write("credentials error, nothing sent: %s\n" % chain_failed(e))
            return 1

    def one(label, phase):
        """Send one request; returns False when the run should stop (a non-retryable failure)."""
        _, body, betas, version = captures["AB".index(label)]
        rec, failed = run_one(args, conn, body, betas, creds, version, fresh=label in args.fresh)
        rec["round"] = len(results[label][phase]) + 1
        results[label][phase].append(rec)
        results[label]["failed"].extend(failed if rec["error_type"] is None else failed[:-1])
        status = "ok" if rec["error_type"] is None else "FAILED %s%s" % (rec["error_type"], shown(rec["error_message"]))
        print("  %s %-7s #%d  %s  out %s  cache read/write %s/%s  %s"
              % (label, "warm-up" if phase == "warmup" else phase, rec["round"],
                 "  ".join("%s %s" % (name, fmt(rec[key])) for key, name in FIELDS if rec[key] is not None) or "no times",
                 fmt_count(rec["output_tokens"]), fmt_count(rec["cache_read"]), fmt_count(rec["cache_write"]), status))
        retryable = rec["status"] is None or rec["status"] in RETRY_STATUSES
        return rec["error_type"] is None or retryable

    stopped = False
    try:
        order = [(label, "warmup") for _ in range(args.warmup) for label in labels]
        for i in range(args.runs):
            order += [(label, "timed") for label in (labels if i % 2 == 0 else labels[::-1])]
        for label, phase in order:
            if not one(label, phase):
                stopped = True
                print("stopping: that error is not one a retry fixes, so the remaining requests were not sent")
                break
    finally:
        conn.close()
        if args.json:
            write_json()   # also when the run stopped early, so what was measured is kept

    any_failed = stopped
    for label in labels:
        ok = [r for r in results[label]["timed"] if r["error_type"] is None]
        any_failed = any_failed or len(ok) < len(results[label]["timed"]) or any(r["error_type"] for r in results[label]["warmup"])
        summarize("%s (%s)" % (label, printable(captures["AB".index(label)][0], 300)), ok, len(results[label]["timed"]))
        print("  failed attempts that were retried: %d" % len(results[label]["failed"]))
        if buffered(ok):
            print("  note: every response arrived all at once (started about equal to complete). Something on this path may be holding "
                  "the stream back, in which case only \"complete\" is a real time")
    if len(labels) == 2:
        pairs = [(a, b) for a, b in zip(results["A"]["timed"], results["B"]["timed"])
                 if a["error_type"] is None and b["error_type"] is None]
        compare(pairs)
    print("\nThese times are for one request, sent from this machine over this network path, in this time window. "
          "Repeat at the times of day that matter before deciding.")
    return 3 if any_failed else 0


if __name__ == "__main__":
    sys.exit(main())
