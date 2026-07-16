// Source-shape detection — shared by both adapters so cfg.shape can override
// the result without either shape's lib importing the other.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ls } from './common.mjs';

// Enumerate .storybook/ config dirs under root (depth-limited, skips
// node_modules). Some DSes use `storybook/` (no dot) — match any dir with a
// main.* file.
export function findStorybookDirs(root, depth = 4) {
  const out = [];
  const isConfigDir = (p) =>
    ['ts', 'js', 'mjs', 'cjs'].some((e) => existsSync(join(p, `main.${e}`)));
  (function walk(d, lvl) {
    if (lvl > depth || !existsSync(d)) return;
    for (const e of ls(d, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name === 'node_modules') continue;
      const p = join(d, e.name);
      if ((e.name === '.storybook' || e.name === 'storybook') && isConfigDir(p)) out.push(p);
      else walk(p, lvl + 1);
    }
  })(root, 0);
  return out;
}

export function detectShape({ INPUTS, SB_STATIC, SB_CONFIG_DIR }) {
  if (SB_STATIC || SB_CONFIG_DIR) {
    console.error(`[DETECT] shape=storybook (explicit ${SB_STATIC ? '--storybook-static' : '--storybook-config'})`);
    return 'storybook';
  }
  const found = findStorybookDirs(INPUTS, 4);
  const shape = found.length ? 'storybook' : 'package';
  console.error(`[DETECT] searched ${INPUTS} (depth 4), found .storybook at [${found.join(', ')}] → shape=${shape}`);
  return shape;
}
