// Hand-written WebGL cloth renderer (no Three.js available in this build environment).
// Isolated so it can be replaced by a React-Three-Fiber <Cloth/> later without touching pages.
export type ClothPalette = { base: string; shade: string; light: string; zari: string };
export type ClothOptions = {
  palettes: ClothPalette[];
  cols?: number; rows?: number;
  size?: [number, number];
  wind?: number; pleat?: number;
  fov?: number; dist?: number;
  tex?: [number, number];
  dpr?: number;
  motifCols?: number; motifRows?: number;
  border?: boolean;
};
export type ClothHandle = {
  show(i: number, ms?: number): void;
  setScroll(p: number): void;
  setPointer(x: number, y: number): void;
  setActive(b: boolean): void;
  setPaused(b: boolean): void;
  resize(): void;
  renderOnce(): void;
  destroy(): void;
};

type V3 = [number, number, number];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function perspective(fov: number, aspect: number, n: number, f: number) {
  const t = 1 / Math.tan(fov / 2);
  return new Float32Array([t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]);
}
function lookAt(eye: V3, c: V3, up: V3) {
  const z = norm(sub(eye, c)), x = norm(cross(up, z)), y = cross(z, x);
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
}
function mul(a: Float32Array, b: Float32Array) {
  const o = new Float32Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s;
  }
  return o;
}
const hex = (h: string): V3 => { const n = parseInt(h.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

// ── Textures: woven silk with zari butta motifs, temple border and pallu band ──
function rng(seed: number) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }

function paint(p: ClothPalette, w: number, h: number, mask: boolean, mc: number, mr: number, border = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  const zari = mask ? '#fff' : p.zari;
  if (mask) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
  else {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, p.shade); gr.addColorStop(0.5, p.base); gr.addColorStop(1, p.shade);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // weave
    g.globalAlpha = 0.035; g.fillStyle = '#000';
    for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2);
    g.globalAlpha = 0.022; g.fillStyle = '#fff';
    for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 2, h);
    const r = rng(7); g.globalAlpha = 0.06;
    for (let i = 0; i < 9000; i++) { g.fillStyle = r() > 0.5 ? '#fff' : '#000'; g.fillRect(r() * w, r() * h, 2, 1); }
    g.globalAlpha = 1;
  }
  const bodyTop = h * 0.06, bodyBot = h * 0.8;
  const dx = w / mc, dy = (bodyBot - bodyTop) / mr;
  g.fillStyle = zari;
  const motif = (cx: number, cy: number, s: number) => {
    g.save(); g.translate(cx, cy); g.scale(s, s);
    g.beginPath(); g.moveTo(0, -16); g.bezierCurveTo(14, -6, 14, 12, 0, 16); g.bezierCurveTo(-12, 10, -10, -4, 0, -16); g.fill();
    g.globalAlpha = mask ? 1 : 0.9; g.restore();
  };
  for (let j = 0; j < mr; j++) for (let i = 0; i < mc; i++) {
    const ox = (j % 2) * dx * 0.5;
    motif(i * dx + dx / 2 + ox, bodyTop + j * dy + dy / 2, Math.min(dx, dy) / 46);
  }
  if (!border) return c;
  // borders
  const band = (y0: number, y1: number, col: string, fill = true) => { g.fillStyle = col; if (fill) g.fillRect(0, y0 * h, w, (y1 - y0) * h); };
  band(0, 0.028, zari); if (!mask) band(0.028, 0.045, p.shade); else band(0.028, 0.045, '#000');
  band(0.8, 0.83, zari);
  if (!mask) band(0.83, 0.955, p.shade); else band(0.83, 0.955, '#000');
  g.fillStyle = zari;
  const step = w / 56;
  for (let x = 0; x < w; x += step) { g.beginPath(); g.moveTo(x, h * 0.955); g.lineTo(x + step / 2, h * 0.84); g.lineTo(x + step, h * 0.955); g.fill(); }
  band(0.955, 1, zari);
  return c;
}

const VS = `
attribute vec2 aUv;
uniform mat4 uVP; uniform float uTime, uWind, uPleat; uniform vec2 uSize;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
float height(vec2 p){
  float pleats = sin(p.x*uPleat + sin(p.y*0.35+uTime*0.25)*0.9) * 0.22;
  float big = sin(p.x*0.55 + p.y*0.35 + uTime*0.55)*0.55 + sin(p.x*0.23 - p.y*0.5 + uTime*0.4)*0.45;
  float flutter = sin(p.x*1.7 + uTime*1.4 + p.y*1.1)*0.09 + sin(p.y*2.3 - uTime*1.1)*0.06;
  return (pleats + big + flutter) * uWind;
}
void main(){
  vec2 p = (aUv-0.5)*uSize;
  float e = 0.07;
  float h0 = height(p), hx = height(p+vec2(e,0.0)), hy = height(p+vec2(0.0,e));
  vec3 pos = vec3(p, h0);
  vN = normalize(vec3(-(hx-h0)/e, -(hy-h0)/e, 1.0));
  vP = pos; vUv = aUv;
  gl_Position = uVP * vec4(pos, 1.0);
}`;

const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
uniform sampler2D uA, uB, uM; uniform float uMix; uniform vec3 uCam, uLight, uZariA, uZariB;
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(uCam - vP);
  vec3 L = normalize(uLight - vP);
  vec3 tex = mix(texture2D(uA, vUv).rgb, texture2D(uB, vUv).rgb, uMix);
  float m = texture2D(uM, vUv).r;
  vec3 zari = mix(uZariA, uZariB, uMix);
  float nl = max(dot(N, L), 0.0);
  float fill = max(dot(N, normalize(vec3(-0.5, 0.25, 0.8))), 0.0);
  vec3 H = normalize(L + V);
  float nh = max(dot(N, H), 0.0);
  float spec = pow(nh, 42.0) * 0.6 + pow(nh, 9.0) * 0.16;
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  float fold = 0.72 + 0.28 * N.z;
  vec3 col = tex * (0.2 + nl * 0.95 + fill * 0.28) * fold;
  col += tex * rim * 0.38 + vec3(1.0, 0.9, 0.78) * spec * 0.3;                  // silk sheen
  vec3 metal = zari * (0.55 + nl * 1.1) + vec3(1.0, 0.86, 0.55) * spec * 2.6 + rim * zari * 0.4;
  col = mix(col, metal, m);
  col *= 1.0 - 0.38 * pow(length(vUv - 0.5) * 1.35, 2.0);                       // vignette
  col = col / (1.0 + col * 0.18);
  gl_FragColor = vec4(col, 1.0);
}`;

export function createCloth(canvas: HTMLCanvasElement, opts: ClothOptions): ClothHandle | null {
  const gl = (canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' }) ||
    canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  if (!gl) return null;

  const size = opts.size || [34, 22];
  const cols = opts.cols || 120, rows = opts.rows || 76;
  const fov = ((opts.fov || 48) * Math.PI) / 180;
  const baseDist = opts.dist || 11;
  const [tw, th] = opts.tex || [2048, 1024];
  const maxDpr = opts.dpr || 1.6;

  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); } return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  // mesh
  const pos: number[] = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) pos.push(i / cols, j / rows);
  const idx: number[] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const vb = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
  const ib = gl.createBuffer()!; gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  const aUv = gl.getAttribLocation(prog, 'aUv'); gl.enableVertexAttribArray(aUv); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = { vp: U('uVP'), time: U('uTime'), wind: U('uWind'), pleat: U('uPleat'), size: U('uSize'), mix: U('uMix'), cam: U('uCam'), light: U('uLight'), za: U('uZariA'), zb: U('uZariB'), a: U('uA'), b: U('uB'), m: U('uM') };

  const mkTex = (c: HTMLCanvasElement, unit: number) => {
    const t = gl.createTexture()!; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const mc = opts.motifCols || 26, mr = opts.motifRows || 10;
  const colorCanvases = opts.palettes.map((p) => paint(p, tw, th, false, mc, mr, opts.border !== false));
  const texes = colorCanvases.map((c) => { const t = mkTex(c, 0); return t; });
  const maskTex = mkTex(paint(opts.palettes[0], tw, th, true, mc, mr, opts.border !== false), 2);
  const bind = (unit: number, t: WebGLTexture) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); };
  gl.uniform1i(u.a, 0); gl.uniform1i(u.b, 1); gl.uniform1i(u.m, 2);
  bind(2, maskTex);

  let cur = 0, next = 0, mix = 0, mixFrom = 0, mixStart = 0, mixMs = 0, transitioning = false;
  const setPair = (a: number, b: number) => { bind(0, texes[a]); bind(1, texes[b]); gl.uniform3fv(u.za, hex(opts.palettes[a].zari)); gl.uniform3fv(u.zb, hex(opts.palettes[b].zari)); };
  setPair(0, 0);

  let scroll = 0, px = 0, py = 0, tpx = 0, tpy = 0, active = true, paused = false, raf = 0, t0 = performance.now(), frozen = false;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pleat = opts.pleat ?? 2.7;

  const fit = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(2, Math.floor(canvas.clientWidth * dpr)), h = Math.max(2, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
  };

  const draw = (now: number) => {
    fit();
    const time = frozen ? 4.2 : (now - t0) / 1000;
    px += (tpx - px) * 0.06; py += (tpy - py) * 0.06;
    if (transitioning) {
      const k = Math.min(1, (now - mixStart) / mixMs); const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      mix = mixFrom + (1 - mixFrom) * e;
      if (k >= 1) { transitioning = false; cur = next; mix = 0; setPair(cur, cur); }
    }
    const aspect = canvas.width / canvas.height;
    const dist = baseDist * (1 + scroll * 0.9) * (aspect < 1.2 ? 1 + (1.2 - aspect) * 0.9 : 1);
    const yaw = 0.22 + scroll * 0.75 + px * 0.1, pitch = -0.16 + py * 0.06 - scroll * 0.25;
    const eye: V3 = [Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist - 0.6, Math.cos(yaw) * Math.cos(pitch) * dist];
    const vp = mul(perspective(fov, aspect, 0.1, 200), lookAt(eye, [0, -0.4, 0], [0, 1, 0]));
    gl.uniformMatrix4fv(u.vp, false, vp);
    gl.uniform1f(u.time, time); gl.uniform1f(u.wind, reduce || frozen ? 0.6 : 1.0); gl.uniform1f(u.pleat, pleat);
    gl.uniform2f(u.size, size[0], size[1]); gl.uniform1f(u.mix, mix);
    gl.uniform3f(u.cam, eye[0], eye[1], eye[2]);
    gl.uniform3f(u.light, px * 9 + 4, -py * 6 + 5, 7);
    gl.clearColor(0.1, 0.03, 0.06, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
  };

  const loop = (now: number) => { raf = 0; if (!active || paused) return; draw(now); if (!reduce) raf = requestAnimationFrame(loop); };
  const start = () => { if (!raf) raf = requestAnimationFrame(loop); };
  if (reduce) { frozen = true; draw(performance.now()); } else start();

  return {
    show(i, ms = 1400) {
      if (i === cur && !transitioning) return;
      next = i; mixFrom = 0; mixStart = performance.now(); mixMs = reduce ? 1 : ms; transitioning = true;
      setPair(cur, next); if (reduce) { frozen = true; draw(performance.now() + 5); }
    },
    setScroll(p) { scroll = Math.max(0, Math.min(1, p)); if (reduce) draw(performance.now()); },
    setPointer(x, y) { tpx = x; tpy = y; },
    setActive(b) { active = b; if (b && !reduce) start(); },
    setPaused(b) { paused = b; if (!b && active && !reduce) start(); },
    resize() { draw(performance.now()); },
    renderOnce() { draw(performance.now()); },
    destroy() { cancelAnimationFrame(raf); active = false; const ext = gl.getExtension('WEBGL_lose_context'); ext?.loseContext(); },
  };
}
