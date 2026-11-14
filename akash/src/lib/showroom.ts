// Procedural 3D saree showroom — hand-written WebGL (no Three.js; the npm registry is blocked in the build sandbox).
// A camera walks down the aisle: shelves of folded sarees, white display tables, mannequins, glowing ceiling, marble floor.
// Everything is generated at runtime (canvas textures + simple meshes), so no photos are needed.
// If the owner supplies photos/hero/shop.mp4 or shop.jpg, Hero.tsx uses that instead of this scene.

export type ShowroomHandle = {
  start(): void;                 // begin the automatic walk-in (call when the cloth lifts)
  setScroll(p: number): void;    // 0..1 progress through the pinned hero
  setPointer(x: number, y: number): void;
  setActive(b: boolean): void;
  resize(): void;
  destroy(): void;
  progress(): number;
};
export type ShowroomOptions = { brand: string; sub: string; mannequins: { key: string; v: number }[]; sprite: (key: string, v: number) => string; dpr?: number; reduced?: boolean };

type M4 = Float32Array;
const persp = (fov: number, a: number, n: number, f: number): M4 => { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]); };
const look = (e: number[], c: number[]): M4 => {
  let z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]]; let l = Math.hypot(...z); z = z.map((v) => v / l);
  let x = [z[2], 0, -z[0]]; l = Math.hypot(...x) || 1; x = x.map((v) => v / l);          // up = (0,1,0)
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  const d = (a: number[]) => -(a[0] * e[0] + a[1] * e[1] + a[2] * e[2]);
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, d(x), d(y), d(z), 1]);
};
const mul = (a: M4, b: M4): M4 => { const o = new Float32Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; };
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function canvas(w: number, h: number) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')!] as const; }

// ───────────── procedural textures ─────────────
const SAREE = ['#b0122f', '#0d6a4d', '#5a2a86', '#d29a1c', '#0c5a78', '#d6708c', '#ece1c8', '#6a1232', '#e0651f', '#5d9b2b', '#2c3a8a', '#c1561f', '#a3123a', '#1d5c47', '#e8c15a', '#8650b8'];

function shelfTex() {
  const [c, g] = canvas(512, 512); const r = rng(7);
  g.fillStyle = '#3d2216'; g.fillRect(0, 0, 512, 512);
  // carved jaali panel on top
  const jg = g.createLinearGradient(0, 0, 0, 78); jg.addColorStop(0, '#e08a3a'); jg.addColorStop(1, '#b8601f');
  g.fillStyle = jg; g.fillRect(0, 0, 512, 78);
  g.strokeStyle = 'rgba(60,24,8,.85)'; g.lineWidth = 3;
  for (let x = -40; x < 560; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40, 78); g.moveTo(x + 40, 0); g.lineTo(x, 78); g.stroke(); }
  g.fillStyle = '#2a140c'; g.fillRect(0, 76, 512, 8);
  const rows = 4, rh = (512 - 84) / rows;
  for (let i = 0; i < rows; i++) {
    const y0 = 84 + i * rh, y1 = y0 + rh;
    const bg = g.createLinearGradient(0, y0, 0, y1); bg.addColorStop(0, '#2b160d'); bg.addColorStop(1, '#4a2a1a'); g.fillStyle = bg; g.fillRect(0, y0, 512, rh);
    let x = 10;
    while (x < 500) {
      const w = 46 + r() * 28, n = 5 + Math.floor(r() * 5); const col = SAREE[Math.floor(r() * SAREE.length)];
      const sh = 9 + r() * 3; let y = y1 - 12;
      for (let k = 0; k < n && y > y0 + 8; k++) {
        g.fillStyle = k % 3 === 2 ? SAREE[Math.floor(r() * SAREE.length)] : col; g.fillRect(x, y - sh, w, sh);
        g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(x, y - sh, w, 2);
        g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y - 2, w, 2);
        if (r() > 0.55) { g.fillStyle = 'rgba(240,200,110,.85)'; g.fillRect(x, y - sh + 3, w, 2); }
        y -= sh;
      }
      x += w + 5 + r() * 6;
    }
    g.fillStyle = '#c9a06a'; g.fillRect(0, y1 - 12, 512, 6); g.fillStyle = '#5a3820'; g.fillRect(0, y1 - 6, 512, 6);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y0, 512, 6);
  }
  g.fillStyle = 'rgba(255,200,130,.08)'; g.fillRect(0, 0, 512, 512);
  return c;
}
function floorTex() {
  const [c, g] = canvas(512, 512); const r = rng(11);
  const b = g.createLinearGradient(0, 0, 512, 512); b.addColorStop(0, '#e3cdb9'); b.addColorStop(1, '#d4b9a2'); g.fillStyle = b; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(${120 + r() * 40},${80 + r() * 30},${70 + r() * 30},${0.06 + r() * 0.12})`; g.lineWidth = 1 + r() * 2.5; g.beginPath(); let x = r() * 512, y = r() * 512; g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 220; y += (r() - 0.5) * 220; g.quadraticCurveTo(x + (r() - 0.5) * 80, y + (r() - 0.5) * 80, x, y); } g.stroke(); }
  for (let i = 0; i < 12; i++) { const x = r() * 512, y = r() * 512, rr = 60 + r() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); }
  g.strokeStyle = 'rgba(110,80,70,.35)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 509, 509);
  return c;
}
function ceilTex() {
  const [c, g] = canvas(256, 256); g.fillStyle = '#f3e6d4'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(150,100,60,.22)'; g.lineWidth = 2; g.strokeRect(1, 1, 254, 254);
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(210,150,90,.12)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  return c;
}
function glowTex(rgb = '255,236,200') { const [c, g] = canvas(128, 128); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.25, `rgba(${rgb},.55)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c; }
function coveTex() { const [c, g] = canvas(64, 128); const gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(255,140,50,1)'); gr.addColorStop(0.5, 'rgba(255,120,40,.35)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 128); return c; }
function solid(col: string) { const [c, g] = canvas(4, 4); g.fillStyle = col; g.fillRect(0, 0, 4, 4); return c; }
function tableTex() {
  const [c, g] = canvas(256, 512); const r = rng(23);
  const b = g.createLinearGradient(0, 0, 256, 0); b.addColorStop(0, '#e9e6e8'); b.addColorStop(0.5, '#ffffff'); b.addColorStop(1, '#e4e0e3'); g.fillStyle = b; g.fillRect(0, 0, 256, 512);
  // fanned stacks of folded sarees laid on the table
  for (let k = 0; k < 6; k++) {
    const y = 50 + k * 72 + r() * 10, col = SAREE[Math.floor(r() * SAREE.length)];
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(40, y + 6, 180, 46);
    for (let j = 0; j < 4; j++) { g.fillStyle = j === 3 ? col : SAREE[Math.floor(r() * SAREE.length)]; g.fillRect(34, y - j * 3, 186, 40); }
    g.fillStyle = 'rgba(240,200,110,.9)'; g.fillRect(34, y + 4, 186, 4); g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(34, y - 9, 186, 3);
  }
  return c;
}
function backWallTex(brand: string, sub: string) {
  const [c, g] = canvas(1024, 512);
  const b = g.createLinearGradient(0, 0, 0, 512); b.addColorStop(0, '#a0142f'); b.addColorStop(1, '#6a0b20'); g.fillStyle = b; g.fillRect(0, 0, 1024, 512);
  g.globalAlpha = 0.16; g.strokeStyle = '#f2b640'; g.lineWidth = 2;
  for (let x = 0; x < 1024; x += 64) for (let y = 0; y < 512; y += 80) { g.beginPath(); g.moveTo(x + 32, y + 12); g.bezierCurveTo(x + 62, y + 20, x + 60, y + 58, x + 36, y + 62); g.bezierCurveTo(x + 14, y + 66, x + 8, y + 40, x + 26, y + 34); g.stroke(); }
  g.globalAlpha = 1;
  g.strokeStyle = '#e8b958'; g.lineWidth = 10; g.beginPath(); g.moveTo(312, 512); g.lineTo(312, 200); g.arc(512, 200, 200, Math.PI, 0); g.lineTo(712, 512); g.stroke();
  g.strokeStyle = 'rgba(232,185,88,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(336, 512); g.lineTo(336, 200); g.arc(512, 200, 176, Math.PI, 0); g.lineTo(688, 512); g.stroke();
  const ig = g.createRadialGradient(512, 280, 20, 512, 280, 300); ig.addColorStop(0, 'rgba(255,190,110,.55)'); ig.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = ig; g.fillRect(312, 0, 400, 512);
  g.textAlign = 'center'; g.fillStyle = '#ffe2a8'; g.font = 'italic 600 96px "Cormorant Garamond", Georgia, serif'; g.fillText(brand, 512, 190);
  g.font = '600 22px Manrope, Arial, sans-serif'; g.fillStyle = 'rgba(255,226,168,.85)';
  (g as any).letterSpacing = '8px'; g.fillText(sub, 512, 236);
  return c;
}

// ───────────── engine ─────────────
type Obj = { buf: WebGLBuffer; n: number; tex: WebGLTexture; tint: number[]; mode: 0 | 1 | 2; pass: 0 | 1 | 2 | 3 };

export function createShowroom(cv: HTMLCanvasElement, o: ShowroomOptions): ShowroomHandle | null {
  const gl = cv.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' }) as WebGLRenderingContext | null;
  if (!gl) return null;
  const sh = (t: number, s: string) => { const x = gl.createShader(t)!; gl.shaderSource(x, s); gl.compileShader(x); return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null; };
  const vs = sh(gl.VERTEX_SHADER, 'attribute vec3 aP;attribute vec2 aT;uniform mat4 uM;varying vec2 vT;varying float vD;void main(){gl_Position=uM*vec4(aP,1.0);vT=aT;vD=gl_Position.w;}');
  const fs = sh(gl.FRAGMENT_SHADER, 'precision mediump float;uniform sampler2D uTex;uniform vec3 uTint;uniform vec3 uFog;uniform float uFogD;uniform float uMode;varying vec2 vT;varying float vD;void main(){vec4 c=texture2D(uTex,vT);if(uMode<1.5&&uMode>0.5&&c.a<0.4)discard;float f=1.0-exp(-uFogD*vD);vec3 col=c.rgb*uTint;if(uMode>1.5){col*=c.a*(1.0-f);gl_FragColor=vec4(col,1.0);}else{col=mix(col,uFog,f);gl_FragColor=vec4(col,c.a);}}');
  if (!vs || !fs) return null;
  const pg = gl.createProgram()!; gl.attachShader(pg, vs); gl.attachShader(pg, fs); gl.linkProgram(pg);
  if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) return null;
  gl.useProgram(pg);
  const aP = gl.getAttribLocation(pg, 'aP'), aT = gl.getAttribLocation(pg, 'aT');
  const uM = gl.getUniformLocation(pg, 'uM'), uTint = gl.getUniformLocation(pg, 'uTint'), uFog = gl.getUniformLocation(pg, 'uFog'), uFogD = gl.getUniformLocation(pg, 'uFogD'), uMode = gl.getUniformLocation(pg, 'uMode');
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic') as any;

  const tex = (src: HTMLCanvasElement | HTMLImageElement | null, pot = true, repeat = true) => {
    const t = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, t);
    if (src) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    const w = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, w); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, w);
    if (pot && src) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  };
  const objs: Obj[] = [];
  const mesh = (verts: number[], t: WebGLTexture, tint = [1, 1, 1], mode: 0 | 1 | 2 = 0, pass?: 0 | 1 | 2 | 3) => {
    const buf = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const ob: Obj = { buf, n: verts.length / 5, tex: t, tint, mode, pass: pass ?? (mode === 0 ? 0 : mode === 1 ? 1 : 3) }; objs.push(ob); return ob;
  };
  // quad from 4 corners (a,b,c,d in order), uv repeats (ur, vr)
  const quad = (a: number[], b: number[], c: number[], d: number[], ur = 1, vr = 1) => [...a, 0, 0, ...b, ur, 0, ...c, ur, vr, ...a, 0, 0, ...c, ur, vr, ...d, 0, vr];

  const quadF = (a: number[], b: number[], c: number[], d: number[], ur = 1, vr = 1) => quad(a, b, c, d, ur, vr).map((v, i) => (i % 5 === 4 ? vr - v : v));
  // ── world ──
  const W = 3.5, H = 3.6, Z0 = 7, Z1 = -16;
  const tShelf = tex(shelfTex()), tFloor = tex(floorTex()), tCeil = tex(ceilTex()), tTable = tex(tableTex(), true, false);
  const tGlow = tex(glowTex(), true, false), tGlowO = tex(glowTex('255,150,70'), true, false), tCove = tex(coveTex(), true, false), tWhite = tex(solid('#fffaf0'), false, false), tSide = tex(solid('#f3eef0'), false, false);
  const tBack = tex(backWallTex(o.brand, o.sub), false, false);
  const len = Z0 - Z1, bay = 2.4;
  mesh(quad([-W, 0, Z0], [W, 0, Z0], [W, 0, Z1], [-W, 0, Z1], 2.2, len / 3.5), tFloor, [1.25, 1.18, 1.1]);
  mesh(quad([-W, H, Z1], [W, H, Z1], [W, H, Z0], [-W, H, Z0], 3, len / 4), tCeil);
  mesh(quadF([-W, 0, Z0], [-W, 0, Z1], [-W, 3.15, Z1], [-W, 3.15, Z0], len / bay, 1), tShelf, [1.35, 1.22, 1.08]);
  mesh(quadF([W, 0, Z1], [W, 0, Z0], [W, 3.15, Z0], [W, 3.15, Z1], len / bay, 1), tShelf, [1.35, 1.22, 1.08]);
  mesh(quad([-W, 3.15, Z0], [-W, 3.15, Z1], [-W, H, Z1], [-W, H, Z0]), tSide, [0.55, 0.36, 0.22]);
  mesh(quad([W, 3.15, Z1], [W, 3.15, Z0], [W, H, Z0], [W, H, Z1]), tSide, [0.55, 0.36, 0.22]);
  mesh(quadF([-W, 0, Z1], [W, 0, Z1], [W, H, Z1], [-W, H, Z1]), tBack, [1, 1, 1]);
  // tables with folded sarees
  const table = (x: number, z0: number, z1: number) => {
    const w = 0.55, h = 0.85, xa = x - w, xb = x + w;
    mesh(quad([xa, h, z0], [xb, h, z0], [xb, h, z1], [xa, h, z1]), tTable, [1.1, 1.1, 1.1]);
    mesh([...quad([xa, 0, z0], [xb, 0, z0], [xb, h, z0], [xa, h, z0]), ...quad([xb, 0, z1], [xa, 0, z1], [xa, h, z1], [xb, h, z1]), ...quad([xa, 0, z1], [xa, 0, z0], [xa, h, z0], [xa, h, z1]), ...quad([xb, 0, z0], [xb, 0, z1], [xb, h, z1], [xb, h, z0])], tSide, [1.12, 1.1, 1.12]);
  };
  table(-1.55, 3.4, 0.2); table(1.55, -0.6, -3.8); table(-1.55, -5, -8.2); table(1.55, -9.4, -12.6);
  // ceiling lights: glows + LED strips + warm cove along both walls + light pools on the floor
  const glow: number[] = [], pool: number[] = [], cove: number[] = [];
  for (let z = 5.4; z > Z1 + 1; z -= 2.6) for (const x of [-1.7, 0, 1.7]) {
    const s = 0.55; glow.push(...quad([x - s, H - 0.02, z + s], [x + s, H - 0.02, z + s], [x + s, H - 0.02, z - s], [x - s, H - 0.02, z - s]));
    const p = 1.5; pool.push(...quad([x - p, 0.015, z + p], [x + p, 0.015, z + p], [x + p, 0.015, z - p], [x - p, 0.015, z - p]));
  }
  mesh(glow, tGlow, [1.6, 1.4, 1.1], 2); mesh(pool, tGlow, [0.42, 0.33, 0.24], 2);
  cove.push(...quad([-W, H - 0.02, Z0], [-W + 1.2, H - 0.02, Z0], [-W + 1.2, H - 0.02, Z1], [-W, H - 0.02, Z1], 1, 1));
  mesh(cove, tCove, [1, 0.9, 0.8], 2);
  const cove2 = quad([W, H - 0.02, Z0], [W - 1.2, H - 0.02, Z0], [W - 1.2, H - 0.02, Z1], [W, H - 0.02, Z1]);
  mesh(cove2, tCove, [1, 0.9, 0.8], 2);
  for (const x of [-0.85, 0.85]) mesh(quad([x - 0.09, H - 0.03, Z0], [x + 0.09, H - 0.03, Z0], [x + 0.09, H - 0.03, Z1], [x - 0.09, H - 0.03, Z1]), tWhite, [1.1, 1.05, 0.95], 2);
  // wall wash glow on shelves (warm)
  mesh(quad([-W + 0.02, 0.2, Z0], [-W + 0.02, 0.2, Z1], [-W + 0.02, 3.1, Z1], [-W + 0.02, 3.1, Z0]), tGlowO, [0.22, 0.14, 0.08], 2);
  mesh(quad([W - 0.02, 0.2, Z1], [W - 0.02, 0.2, Z0], [W - 0.02, 3.1, Z0], [W - 0.02, 3.1, Z1]), tGlowO, [0.22, 0.14, 0.08], 2);

  // mannequins (billboards facing +Z), textures load async from SVG
  const place: [number, number, number][] = [[-2.55, 1.2, 0], [2.55, -2.2, 1], [-2.55, -4.4, 2], [2.5, -7, 3], [-2.5, -10, 4], [2.5, -11.6, 5], [-0.9, -14.6, 6], [0.9, -14.6, 7], [0, -14.2, 8]];
  const sprites: { ob: Obj; img: HTMLImageElement }[] = [];
  place.forEach(([x, z, k]) => {
    const m = o.mannequins[k % o.mannequins.length]; const hh = k === 8 ? 2.35 : 2.05, ww = hh * 0.75;
    const ob = mesh(quad([x - ww / 2, -0.1, z], [x + ww / 2, -0.1, z], [x + ww / 2, hh - 0.1, z], [x - ww / 2, hh - 0.1, z]).map((v, i) => (i % 5 === 4 ? 1 - v : v)), tex(null, false, false), [1, 1, 1], 1);
    const img = new Image(); img.width = 600; img.height = 800;
    img.onload = () => { const [cc, cg] = canvas(600, 800); cg.drawImage(img, 0, 0, 600, 800); ob.tex = tex(cc, false, false); };
    img.src = o.sprite(m.key, m.v); sprites.push({ ob, img });
  });
  // soft contact shadows under mannequins
  const sh2: number[] = []; place.forEach(([x, z]) => { const r = 0.6; sh2.push(...quad([x - r, 0.012, z + r], [x + r, 0.012, z + r], [x + r, 0.012, z - r], [x - r, 0.012, z - r])); });
  mesh(sh2, tGlow, [0.06, 0.03, 0.03], 0, 2);

  gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0.93, 0.8, 0.66, 1);
  const FOG = [0.93, 0.8, 0.66];

  // ── camera state ──
  let sTarget = 0, sCur = 0, auto = o.reduced ? 1 : 0, started = !!o.reduced, t0 = 0, px = 0, py = 0, cpx = 0, cpy = 0, active = true, raf = 0, dead = false, scrollP = 0;
  const DUR = 6500;
  const frame = (now: number) => {
    raf = 0; if (dead) return;
    const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) { schedule(); return; }
    if (started && auto < 1 && !o.reduced) auto = clamp((now - t0) / DUR, 0, 1);
    const a = ease(auto);
    sTarget = a * 0.26 + (o.reduced ? 0.3 : scrollP * 0.74);
    sCur += (sTarget - sCur) * 0.07; cpx += (px - cpx) * 0.05; cpy += (py - cpy) * 0.05;
    const s = clamp(sCur, 0, 1), tt = now / 1000;
    const z = 6.2 - s * 16.2, bob = Math.sin(tt * 1.9 + s * 40) * 0.012 * (0.4 + (1 - Math.abs(sTarget - sCur) * 8 > 0 ? 0.6 : 0));
    const ex = Math.sin(s * 5.2) * 0.35 + cpx * 0.18, ey = 1.55 + bob + (a < 1 ? 0 : 0);
    const yaw = Math.sin(s * 5.2 + 0.9) * 0.05 + cpx * 0.09, tx = ex + Math.sin(yaw) * 7, tz = z - Math.cos(yaw) * 7;
    const aspect = w / h, fov = (aspect < 0.8 ? 78 : 64 - s * 8) * Math.PI / 180;
    const m = mul(persp(fov, aspect, 0.1, 60), look([ex, ey, z], [tx, 1.35 - cpy * 0.2 - s * 0.05, tz]));
    gl.viewport(0, 0, cv.width, cv.height); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(uM, false, m); gl.uniform3fv(uFog, FOG);
    for (let pass = 0; pass < 4; pass++) {
      gl.depthMask(pass < 2);
      if (pass === 3) gl.blendFunc(gl.ONE, gl.ONE); else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      for (const ob of objs) {
        if (ob.pass !== pass) continue;
        gl.bindBuffer(gl.ARRAY_BUFFER, ob.buf);
        gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(aT); gl.vertexAttribPointer(aT, 2, gl.FLOAT, false, 20, 12);
        gl.bindTexture(gl.TEXTURE_2D, ob.tex); gl.uniform3fv(uTint, ob.tint); gl.uniform1f(uMode, ob.mode); gl.uniform1f(uFogD, ob.mode === 2 ? 0.03 : 0.034);
        gl.drawArrays(gl.TRIANGLES, 0, ob.n);
      }
    }
    gl.depthMask(true);
    lastS = s; schedule();
  };
  let lastS = 0;
  const schedule = () => { if (!raf && active && !dead) raf = requestAnimationFrame(frame); };
  const resize = () => {
    const d = Math.min(devicePixelRatio || 1, o.dpr || 1.5);
    const w = Math.max(2, Math.round(cv.clientWidth * d)), h = Math.max(2, Math.round(cv.clientHeight * d));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  };
  resize(); schedule();
  return {
    start() { if (started) return; started = true; t0 = performance.now(); schedule(); },
    setScroll(p: number) { scrollP = clamp(p, 0, 1); schedule(); },
    setPointer(x: number, y: number) { px = x; py = y; schedule(); },
    setActive(b: boolean) { active = b; if (b) schedule(); else if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    resize() { resize(); schedule(); },
    progress: () => lastS,
    destroy() { dead = true; if (raf) cancelAnimationFrame(raf); sprites.forEach((s) => (s.img.onload = null)); const e = gl.getExtension('WEBGL_lose_context'); e?.loseContext(); },
  };
}
