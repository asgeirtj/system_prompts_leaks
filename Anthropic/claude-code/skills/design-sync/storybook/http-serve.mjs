// Shared by probe.mjs, compare.mjs, and package-capture.mjs. Kept standalone
// (node builtins only) so serving files never drags in the build toolchain
// (esbuild, ts-morph).
// Also runnable directly - `node http-serve.mjs <dir>` serves <dir> and
// prints the URL (used for the human review pass over .review.html).

import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

// Without a charset, chromium decodes pages and the scripts they load as
// windows-1252, so raw UTF-8 in a bundle turns into a SyntaxError.
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

// Browsers send the host name from the address bar as Host. A site that points its own
// domain at 127.0.0.1 (DNS rebinding) still sends its own domain, so only these names pass.
// The port isn't checked: through port forwarding, the browser sends the forwarded port, not ours.
const OWN_NAMES = new Set(['127.0.0.1', 'localhost', '[::1]']);
const refusal = (port) => `This page opens only at localhost or 127.0.0.1, so that other websites can't read it. If Claude Code runs on this computer, open http://localhost:${port}/.review.html. If it runs on another computer or in a cloud IDE, first forward port ${port} from there to this computer, then open that address.\n`;

export function serveDir(root) {
  const rootAbs = resolve(root) + sep;
  const srv = createServer((req, res) => {
    // Another site's page can still load these files with a <script> or <img> tag: that request
    // names 127.0.0.1, so it passes the Host check below. Browsers refuse such loads when they see this header.
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    if (!OWN_NAMES.has(req.headers.host?.replace(/:\d*$/, ''))) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end(refusal(req.socket.localPort));
    }
    let pathname, p;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      p = resolve(root, '.' + pathname);
    } catch { res.statusCode = 400; return res.end(); }
    // 200 on / so a caller can goto('/') to establish a same-origin page
    // before setContent() (-> fonts load same-origin, no CORS header needed).
    if (pathname === '/') { res.setHeader('Content-Type', MIME['.html']); return res.end('<!doctype html>'); }
    if (!p.startsWith(rootAbs) || !existsSync(p) || !statSync(p).isFile()) { res.statusCode = 404; return res.end(); }
    res.setHeader('Content-Type', MIME[extname(p)] ?? 'application/octet-stream');
    res.end(readFileSync(p));
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const { port } = await serveDir(process.argv[2] ?? '.');
  console.log(`serving ${resolve(process.argv[2] ?? '.')} at http://127.0.0.1:${port}/ (Ctrl-C to stop)`);
}
