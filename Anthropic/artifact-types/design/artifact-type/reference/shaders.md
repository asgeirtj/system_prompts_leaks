# Shaders

One shader is one artboard. Its levers are ordinary tweaks. Words or buttons over it are ordinary markup after the `<canvas>`, absolutely placed, with `pointer-events: none`, and `auto` on buttons.

You don't run your work, so keep to this page's sample, kit and building blocks.

## The artboard

The whole file. Change the title, size, background, aria-label, `data-props`, `FRAG` and `uniforms()`, and add any markup. Keep the rest as is in every artboard. `function shaderStage` is the kit: it compiles `FRAG`, feeds it time, the pointer and `uniforms()`, handles reduced motion, boards off screen, slow machines and lost WebGL, and falls back to the root's background. When a shader fails, `renderVals()` throws the kit's message, so the artboard shows it and the editor passes it to you.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Tide pool</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
body{margin:0}
</style>
</helmet>
<div style="position: relative; width: 960px; height: 600px; overflow: hidden; background: #0B3A4A">
<canvas ref="{{view}}" role="img" aria-label="Light over a shallow pool" style="display: block; width: 100%; height: 100%; touch-action: none"></canvas>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"speed":{"editor":"range","min":0,"max":3,"step":0.01,"default":1,"section":"Motion"},"water":{"editor":"color","default":"#0B3A4A","section":"Color"},"light":{"editor":"color","default":"#E8FFF4","section":"Color"},"ripple":{"editor":"range","min":0,"max":1,"step":0.01,"default":0.6,"section":"Pointer"},"$preview":{"width":960,"height":600}}'>
/* Shader kit */
function shaderStage(logic, frag) {
var calm = matchMedia('(prefers-reduced-motion: reduce)');
var view, paint, buf, gl, uni, raf = 0, away = 0, shown = true, broken = false, fresh = true, before = '', tints = {};
var time = 12, clock = 0, last = 0, down = false, inside = false, press = 0;
var level = 0, ticks = 0, due = 0, next = 0, wait = 2, sharp = 1.5;
var aim = [0.5, 0.5], mouse = [0.5, 0.5], trail = [], oops = 'This shader has an error. Ask Claude to fix it. ';
function fail(text) { broken = true; halt(); sleep(); logic.error = text; logic.setState({}); }
function part(kind, code) {
  var s = gl.createShader(kind);
  if (!s) return;
  gl.shaderSource(s, code); gl.compileShader(s);
  if (gl.getShaderParameter(s, gl.COMPILE_STATUS) || gl.isContextLost()) return s;
  var log = gl.getShaderInfoLog(s) || '', m = /ERROR: \d+:(\d+): (.*)/.exec(log);
  fail(oops + (m ? 'Shader line ' + m[1] + ': ' + m[2] : log));
}
function wake() {
  if (gl && gl.isContextLost()) gl = null;
  if (gl || broken) return !!gl;
  buf = document.createElement('canvas');
  gl = buf.getContext('webgl2', { alpha: false, antialias: false });
  if (!gl) {
    broken = !uni;
    if (broken) view.title = 'This browser can\u2019t draw shaders. You can turn on hardware acceleration or try another browser.';
    return false;
  }
  var v = part(gl.VERTEX_SHADER, '#version 300 es\nvoid main(){vec2 p=vec2(gl_VertexID<<1&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}');
  var f = v && part(gl.FRAGMENT_SHADER, '#version 300 es\nprecision highp float;\nout vec4 outColor;\n#line 1\n' + frag);
  if (!f) return false;
  var prog = gl.createProgram();
  if (!prog) return false;
  gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) { fail(oops + gl.getProgramInfoLog(prog)); return false; }
  gl.useProgram(prog);
  uni = {};
  for (var i = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) - 1; i >= 0; i--) {
    var a = gl.getActiveUniform(prog, i);
    uni[a.name.replace('[0]', '')] = { at: gl.getUniformLocation(prog, a.name), type: a.type };
  }
  fresh = true;
  return true;
}
function sleep() {
  var x = gl && gl.getExtension('WEBGL_lose_context');
  gl = null; if (x) x.loseContext();
}
function tint(color) {
  if (!tints[color]) {
    var g = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    g.fillStyle = color; g.fillRect(0, 0, 1, 1);
    tints[color] = Array.from(g.getImageData(0, 0, 1, 1).data.slice(0, 3), (n) => n / 255);
  }
  return tints[color];
}
function put(name, v) {
  var u = uni[name];
  if (!u) return;
  if (typeof v === 'string') v = tint(v);
  if (u.type === gl.FLOAT) gl.uniform1f(u.at, v);
  else if (u.type === gl.INT || u.type === gl.BOOL) gl.uniform1i(u.at, +v);
  else if (u.type === gl.FLOAT_VEC2) gl.uniform2fv(u.at, v);
  else if (u.type === gl.FLOAT_VEC3) gl.uniform3fv(u.at, v);
}
function draw(now) {
  var dt = Math.min(0.2, (now - last) / 1000), vals = logic.uniforms(), still = calm.matches, text = JSON.stringify(vals), rate = vals.speed == null ? 1 : vals.speed;
  last = now; clock += dt * rate;
  if (!still) time += dt * rate;
  if (!inside && !still) {
    aim = [0.5 + 0.3 * Math.sin(time * 0.37), 0.5 + 0.24 * Math.sin(time * 0.53 + 1.1)];
    drop(false);
  }
  var x = mouse[0], y = mouse[1], k = 1 - Math.pow(0.86, dt * 60);
  mouse = [x + (aim[0] - x) * k, y + (aim[1] - y) * k];
  press += ((down ? 1 : 0) - press) * k;
  var cw = view.clientWidth, ch = view.clientHeight, s = Math.min(devicePixelRatio || 1, 1.5);
  if (!view.__omCapGl) s = Math.pow(0.7, level) * Math.min(s, sharp, Math.sqrt(2.0736e6 / (cw * ch)));
  var w = Math.max(2, Math.round(cw * s)), h = Math.max(2, Math.round(ch * s));
  if (view.width !== w || view.height !== h) { view.width = w; view.height = h; fresh = true; }
  var moved = Math.abs(mouse[0] - x) + Math.abs(mouse[1] - y) > 0.0005 || (press > 0.01 && press < 0.99);
  if (still && !fresh && !moved && text === before) return;
  before = text; fresh = false;
  if (buf.width !== w || buf.height !== h) { buf.width = w; buf.height = h; }
  gl.viewport(0, 0, w, h);
  for (var name in vals) put(name, vals[name]);
  put('uTime', time); put('uResolution', [w, h]); put('uMouse', mouse); put('uPress', press);
  if (uni.uTrail) {
    var t = new Float32Array(36);
    for (var i = 0; i < 12; i++) {
      var p = trail[i] || [0, 0, clock + 1];
      t[i * 3] = p[0]; t[i * 3 + 1] = p[1]; t[i * 3 + 2] = clock - p[2];
    }
    gl.uniform3fv(uni.uTrail.at, t);
  }
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  paint.drawImage(buf, 0, 0);
}
function frame(now) {
  try { draw(now); } catch (e) { fail(oops + e.message); }
}
function count(now) { ticks = 0; due = now + 2e3; }
function tune(now) {
  var f = frameElement;
  sharp = f && f.getBoundingClientRect().width < f.offsetWidth / 2 ? 1 : 1.5;
  if (ticks < 50 && !calm.matches) { level += level < 5; next = now + wait * 1e3; }
  else if (level && now > next) { level--; wait = Math.min(wait * 2, 64); next = now + wait * 1e3; }
  count(now);
}
function tick(now) {
  raf = gl && !gl.isContextLost() ? requestAnimationFrame(tick) : 0;
  if (!raf) return;
  ticks++;
  if (now > due) tune(now);
  if (view.__omCapGl || now - last > (inside ? 12 : Math.max(30, level * level * 4))) frame(now);
}
function run() { clearTimeout(away); if (view && !raf && wake()) { count(last = performance.now()); raf = requestAnimationFrame(tick); } }
function halt() { cancelAnimationFrame(raf); raf = 0; }
function drop(force) {
  var l = trail[0];
  if (!force && l && Math.hypot(l[0] - aim[0], l[1] - aim[1]) < 0.04) return;
  trail.unshift([aim[0], aim[1], clock]);
  trail.length = Math.min(trail.length, 12);
}
function point(e) {
  aim = [e.offsetX / (view.clientWidth || 1), 1 - e.offsetY / (view.clientHeight || 1)];
  inside = true; run();
}
var on = {
  pointermove: (e) => { point(e); drop(false); },
  pointerdown: (e) => { point(e); down = true; drop(true); },
  pointerup: () => { down = false; },
  pointerleave: () => { inside = false; down = false; }
};
var seen = new IntersectionObserver((es) => {
  clearTimeout(away);
  shown = es[es.length - 1].isIntersecting;
  if (shown) run();
  else { halt(); away = setTimeout(sleep, 1500); }
});
function hold(el) {
  for (var ev in on) {
    if (view) view.removeEventListener(ev, on[ev]);
    if (el) el.addEventListener(ev, on[ev]);
  }
  seen.disconnect();
  view = el;
  if (el) { paint = el.getContext('2d'); seen.observe(el); } else halt();
}
document.addEventListener('visibilitychange', () => count(performance.now()));
hold(logic.view.current);
if (wake()) frame(last = performance.now());
return {
  update() { if (logic.view.current !== view) hold(logic.view.current); if (shown) run(); },
  stop() { halt(); clearTimeout(away); hold(null); sleep(); }
};
}
var FRAG = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uWater;
uniform vec3 uLight;
uniform float uRipple;
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float glow = exp(-length(uv - uMouse) * 6.0) * uRipple;
  outColor = vec4(mix(uWater, uLight, glow + 0.1 * sin(uTime)), 1.0);
}
`;
class Component extends DCLogic {
  constructor(props) { super(props); this.view = React.createRef(); }
  componentDidMount() { this.stage = shaderStage(this, FRAG); }
  componentDidUpdate() { this.stage.update(); }
  componentWillUnmount() { this.stage.stop(); }
  uniforms() {
    const p = this.props;
    return { speed: p.speed ?? 1, uWater: p.water ?? '#0B3A4A', uLight: p.light ?? '#E8FFF4', uRipple: p.ripple ?? 0.6 };
  }
  renderVals() {
    if (this.error) throw new Error(this.error);
    return { view: this.view };
  }
}
</script>
</body>
</html>
```

In `project/canvas.json`, every shader's `boards` entry has `"is_interactive": true`, or it gets no Play button.

## Uniforms the kit sets, if declared

- `uniform float uTime;` seconds, from 12. Frozen under reduced motion.
- `uniform vec2 uResolution;` pixels; it can change, so size things by it.
- `uniform vec2 uMouse;` the pointer, 0 to 1 with y up, smoothed. With no pointer over the artboard it drifts slowly (unless motion is reduced), so a pointer effect still shows.
- `uniform float uPress;` 0 to 1, eased, while pressed.
- `uniform vec3 uTrail[12];` points the pointer left behind, newest first: x, y as in `uMouse`, z the age in seconds at `speed`'s rate, below 0 when empty. Presses add a point.

## Tweaks

- `uniforms()` returns one entry per uniform of yours, named as in `FRAG`, with the same default as `data-props`. A number sets a float or int, true/false a bool, a color string a vec3, an array a vec2 or vec3. An enum: `['Soft', 'Sharp'].indexOf(p.edge ?? 'Soft')`.
- `speed` is special: return it and the kit runs `uTime` at that rate. Never multiply `uTime` by a tweak in the shader.
- Give 4 to 8 levers, each visibly changing the picture across its whole range: every color, even one used once (nothing else can edit it), two or three shape sliders, `speed` if it moves, one or two pointer strengths. Sections: Color, Look, Motion, Pointer. The panel shows prop names as written, so use plain words, like `glow`.

## GLSL that compiles first time

WebGL2, GLSL ES 3.00. The kit adds `#version`, precision and `out vec4 outColor;`, so `FRAG` starts at your uniforms. `main()` writes `outColor` with alpha 1.0.

- No `gl_FragColor`, `varying`, `texture2D`, `#version`, backticks or `${`.
- Floats have a point: `2.0`, not `2`, outside constructors. No mixing float and int: `float(i)`.
- A function is defined before it's used. No recursion.
- Never use as names: `input output filter sample half fixed common active partition smooth flat texture patch resource class long short double union cast`.
- Nothing that gives NaN: `pow(max(x, 0.0), y)`, `sqrt(max(x, 0.0))`, `normalize(v + 1e-5)`, divide by `max(d, 1e-4)`, `smoothstep` with its first edge below its second.
- Every pixel runs every frame: at most about 30 noise calls and 64 march steps a pixel. Never call `fbm` inside a loop over `uTrail`.

## Making it good

- Paint a subject, not a screensaver: where the light comes from, what's near and far. 2 to 4 colors from the brief; never a rainbow.
- Aspect: `vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;` keeps circles round. `(uMouse - 0.5) * uResolution / uResolution.y` puts the pointer in the same units, and `uTrail` the same way.
- Use the whole value range, from the ground color to near white.
- Slow: big shapes at 0.05 to 0.3 times `uTime`, small detail a little faster.
- Depth: 2 to 4 layers at different scales; soft falloffs (`exp(-d * k)`); highlights from a normal by finite differences.
- Light adds up: sum it, then `col = 1.0 - exp(-col * 1.3);` so it glows instead of clipping.
- Grain of about 0.02 hides banding.
- The pointer should read in the first second: something near it bends, glows or parts.

```glsl
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5; mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
  return v;
}
vec2 grad(vec2 i) { float a = hash(i) * 6.28318; return vec2(cos(a), sin(a)); }
float gnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(dot(grad(i), f), dot(grad(i + vec2(1, 0)), f - vec2(1, 0)), u.x),
             mix(dot(grad(i + vec2(0, 1)), f - vec2(0, 1)), dot(grad(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y);
}
float caustic(vec2 p, float t) {
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  vec2 w = vec2(gnoise(p * 0.9 + t * 0.23), gnoise(r * p * 0.9 + 7.1 - t * 0.2));
  float a = gnoise(r * p * 1.7 + w * 2.2 + t * 0.17), b = gnoise(r * r * p * 2.6 - w * 1.6 - t * 0.14 + 3.3);
  float r1 = exp(-abs(a) * 26.0), r2 = exp(-abs(b) * 34.0);
  return r1 * 0.55 + r2 * 0.28 + r1 * r2 * 1.8;
}
```

- Liquid, marble, smoke: `fbm(q + 1.6 * vec2(fbm(q + t), fbm(q + 5.2 - t)))`, mapped through your colors with `smoothstep`.
- Water light: `caustic(p * 2.0, uTime * 0.9)` at two scales, added over a clear blue or green floor. Keep the water bright.
- Ripples: for each `uTrail` point with z >= 0 at distance `d`, with `r = d - z * 0.34`, a ring `sin(r * 58.0) * exp(-r * r * 81.0) * exp(-z * 1.1)`. Sum into a height, take its gradient, and shift what you draw by it.
- Goo: `f`, the sum of `r * r / max(dot(p - c, p - c), 1e-4)` over moving centers `c`. `smoothstep(0.95, 1.05, f)` is the edge; `f`'s gradient gives a normal.
- Sunlight through leaves: looking up, leaves filling most of the frame. Cells of small rotated leaf shapes (check the 3x3 neighbors), 4 layers: far ones pale, near ones dark, each lit from behind (mixed toward yellow-green by `exp(-d * 3.0)` from the sun at `uMouse`), sky in the gaps, a soft flare on top.
- Soft shadows: a shape mask blurred by a wide `smoothstep`, drifting over a lit surface.
- Aurora: 3 curtains: a base height from `fbm`, `smoothstep(-0.06, 0.12, y) * exp(-y / h)`, `y` the height above it, vertical rays from `fbm`, added up.

## Rules

- Flashing stays inside the accessibility limit at any tweak setting: nothing brightens and darkens over much of the artboard more than 3 times a second. Asked for a strobe, pulse as fast as that allows and say so.
- A shader someone asked for is exempt from "no gradient washes".
- Comments in `FRAG` are short labels. Nothing on the canvas holds instructions to Claude or a later reader: those live on this page.

## Limits

One pass, no memory between frames, no pictures: no true fluid or particle simulation, no photo, video, camera, microphone or network input. Asked for one, make the effect itself over an abstract ground in the brief's colors, never a painted stand-in, and say in your reply what it can't do.

A desktop browser runs about 16 shaders at once; the rest hold still.

In your reply, say to press Play to use the pointer, and that Tweaks holds the levers.
