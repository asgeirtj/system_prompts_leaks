// Shared by probe.mjs, compare.mjs, and package-capture.mjs. Kept standalone
// (node builtins only) so serving files never drags in the build toolchain
// (esbuild, ts-morph).
// Also runnable directly — `node http-serve.mjs <dir>` serves <dir> and
// prints the URL (used for the human review pass over .review.html).

import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };

export function serveDir(root) {
  const rootAbs = resolve(root) + sep;
  const srv = createServer((req, res) => {
    let pathname, p;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      p = resolve(root, '.' + pathname);
    } catch { res.statusCode = 400; return res.end(); }
    // 200 on / so a caller can goto('/') to establish a same-origin page
    // before setContent() (→ fonts load same-origin, no CORS header needed).
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html>'); }
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
