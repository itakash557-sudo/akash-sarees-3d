// Procedural saree artwork (PLACEHOLDER imagery).
// Real photography replaces this via the `image` field on products/collections (admin upload in Phase 4).
export type Palette = { key: string; name: string; base: string; shade: string; light: string; zari: string; blouse: string; bg1: string; bg2: string };

const P = (key: string, name: string, base: string, shade: string, light: string, zari: string, blouse: string, bg1: string, bg2: string): Palette =>
  ({ key, name, base, shade, light, zari, blouse, bg1, bg2 });

export const PALETTES: Record<string, Palette> = {
  crimson: P('crimson', 'Crimson', '#b0122f', '#8a0c24', '#d93a55', '#e6b34d', '#1d5c47', '#f6e7dc', '#ecc9b8'),
  emerald: P('emerald', 'Emerald', '#0d6a4d', '#08503a', '#2e9a75', '#e3b55a', '#7a0f33', '#e9f0e4', '#c8dcc9'),
  purple: P('purple', 'Royal Purple', '#5a2a86', '#431e66', '#8650b8', '#e6c070', '#c0356b', '#efe6f3', '#d6c4e3'),
  mustard: P('mustard', 'Mustard', '#d29a1c', '#a97800', '#efc34a', '#8c1233', '#8c1233', '#f8eed2', '#ecd9a0'),
  peacock: P('peacock', 'Peacock Blue', '#0c5a78', '#083f56', '#2a8aa8', '#e4b552', '#c1561f', '#e2eef2', '#bdd6df'),
  rose: P('rose', 'Rose', '#d6708c', '#b04f6b', '#ee9db3', '#d9ad5b', '#6f1d3a', '#fbebee', '#f1cdd6'),
  ivory: P('ivory', 'Ivory', '#ece1c8', '#cfc0a0', '#faf3e2', '#c8993a', '#7a1030', '#f7f1e6', '#e9dec8'),
  maroon: P('maroon', 'Maroon', '#6a1232', '#4a0b22', '#8f2a4d', '#e0b04c', '#0f5a43', '#efdfd9', '#d9bbb2'),
  orange: P('orange', 'Saffron', '#e0651f', '#b94a0d', '#f5934b', '#f3d27a', '#5a1a6e', '#fbe8d5', '#f1c8a2'),
  parrot: P('parrot', 'Parrot Green', '#5d9b2b', '#437a1d', '#86c04e', '#e8c15a', '#a3123a', '#eef3dd', '#d3e1b0'),
  indigo: P('indigo', 'Indigo', '#2c3a8a', '#1f2a68', '#4d60b8', '#f2ede0', '#f2ede0', '#e5e8f4', '#c2c9e6'),
  noir: P('noir', 'Noir', '#1c1b22', '#0f0e14', '#3a3946', '#d9b05a', '#a3123a', '#e8e3e3', '#cdc4c6'),
};

const cache = new Map<string, string>();

function build(p: Palette, v: number, bare = false): string {
  const id = `${p.key}${v}`;
  const flip = v % 2 === 1;
  const pleats = 11 + (v % 3);
  const skin = '#d9c3ae';
  const xl = (y: number) => 252 - 122 * ((y - 410) / 360);
  const xr = (y: number) => 348 + 122 * ((y - 410) / 360);

  let strips = '';
  for (let i = 0; i < pleats; i++) {
    const t0 = i / pleats, t1 = (i + 1) / pleats;
    const wx0 = 252 + 96 * t0, wx1 = 252 + 96 * t1, hx0 = 130 + 340 * t0, hx1 = 130 + 340 * t1;
    strips += `<polygon points="${wx0},410 ${wx1},410 ${hx1},770 ${hx0},770" fill="${i % 2 ? p.shade : p.base}"/>`;
    strips += `<polygon points="${wx0},410 ${wx0 + 3},410 ${hx0 + 9},770 ${hx0},770" fill="#fff" opacity=".12"/>`;
  }
  const hem = (a: number, b: number) => `${xl(a)},${a} ${xr(a)},${a} ${xr(b)},${b} ${xl(b)},${b}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.bg1}"/><stop offset="1" stop-color="${p.bg2}"/></linearGradient>
<linearGradient id="dp${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".3" stop-color="#fff" stop-opacity=".14"/><stop offset=".62" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
<linearGradient id="zr${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.zari}"/><stop offset=".5" stop-color="#fff3c8"/><stop offset="1" stop-color="${p.zari}"/></linearGradient>
<linearGradient id="sk${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfa68e"/><stop offset=".5" stop-color="${skin}"/><stop offset="1" stop-color="#b79e86"/></linearGradient>
<pattern id="bt${id}" width="30" height="34" patternUnits="userSpaceOnUse"><path d="M15 6q8 8 0 18q-8-10 0-18z" fill="${p.zari}" opacity=".9"/><circle cx="15" cy="12" r="1.6" fill="${p.shade}"/><path d="M0 23q8 8 0 18q-8-10 0-18zM30 23q8 8 0 18q-8-10 0-18z" fill="${p.zari}" opacity=".7"/></pattern>
<pattern id="tp${id}" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M0 22L11 2L22 22z" fill="${p.zari}"/></pattern>
</defs>
${bare ? '' : `<rect width="600" height="800" fill="url(#bg${id})"/>
<path d="M60 800V330A240 240 0 0 1 540 330V800z" fill="${p.light}" opacity=".16"/>
<path d="M82 800V332A218 218 0 0 1 518 332V800" fill="none" stroke="${p.zari}" stroke-width="2" opacity=".45"/>
<ellipse cx="300" cy="782" rx="200" ry="14" fill="#000" opacity=".2"/>`}
<path d="M282 152Q300 140 318 152L322 204L278 204Z" fill="url(#sk${id})"/>
<path d="M232 205Q300 190 368 205L372 250Q352 330 346 410Q362 470 366 520L234 520Q238 470 254 410Q248 330 228 250Z" fill="url(#sk${id})"/>
<path d="M232 205Q300 190 368 205L372 250Q356 300 350 338L250 338Q244 300 228 250Z" fill="${p.blouse}"/>
<path d="M266 197Q300 268 334 197Z" fill="url(#sk${id})"/>
<path d="M250 338L350 338" stroke="${p.zari}" stroke-width="3"/>
<g>${strips}</g>
<polygon points="${hem(410, 770)}" fill="url(#dp${id})"/>
<polygon points="${hem(410, 715)}" fill="url(#bt${id})" opacity=".55"/>
<polygon points="${hem(712, 770)}" fill="url(#zr${id})"/>
<polygon points="${hem(724, 758)}" fill="${p.shade}"/>
<polygon points="${hem(730, 756)}" fill="url(#tp${id})" opacity=".9"/>
<g transform="${flip ? 'translate(600,0) scale(-1,1)' : ''}">
<path d="M212 206L252 214L240 330L252 470L214 566L170 470L188 330Z" fill="${p.base}"/>
<path d="M212 206L252 214L240 330L252 470L214 566L170 470L188 330Z" fill="url(#bt${id})"/>
<path d="M170 470L214 566L252 470L246 520L214 590L176 520Z" fill="url(#zr${id})"/>
<path d="M212 206L252 214L240 330L252 470L214 566L170 470L188 330Z" fill="url(#dp${id})" opacity=".7"/>
<polygon points="225,216 275,190 385,407 335,433" fill="${p.light}"/>
<polygon points="225,216 275,190 385,407 335,433" fill="url(#bt${id})" opacity=".8"/>
<polygon points="225,216 275,190 385,407 335,433" fill="url(#dp${id})" opacity=".6"/>
<path d="M225 216L335 433" stroke="url(#zr${id})" stroke-width="6"/>
<path d="M275 190L385 407" stroke="url(#zr${id})" stroke-width="6"/>
<path d="M335 433Q350 520 330 600Q300 560 312 470Z" fill="${p.light}"/>
<path d="M335 433Q350 520 330 600Q300 560 312 470Z" fill="url(#dp${id})" opacity=".6"/>
</g>
<polygon points="${hem(396, 412)}" fill="${p.shade}" opacity=".9"/>
<path d="M${xl(404)} 404L${xr(404)} 404" stroke="${p.zari}" stroke-width="3"/>
</svg>`;
}

/** Placeholder saree illustration as a data URI. */
export function sareeArt(paletteKey: string, variant = 0): string {
  const k = `${paletteKey}:${variant}`;
  let v = cache.get(k);
  if (!v) {
    const p = PALETTES[paletteKey] || PALETTES.crimson;
    v = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(build(p, variant));
    cache.set(k, v);
  }
  return v;
}

/** Repeating paisley fabric (preloader / textures). */
export function paisleyPattern(base = '#c8102e', gold = '#f2b640'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="300" viewBox="0 0 240 300">
<rect width="240" height="300" fill="${base}"/>
<g fill="none" stroke="${gold}" stroke-width="3">
<path d="M120 40C176 48 196 120 150 168C112 206 64 180 70 128C74 94 104 82 124 98C142 112 134 140 114 138" />
<path d="M120 62C160 70 174 118 142 150" opacity=".6"/>
</g>
<g fill="${gold}" opacity=".9"><circle cx="124" cy="132" r="7"/><circle cx="40" cy="30" r="5"/><circle cx="200" cy="30" r="5"/><circle cx="40" cy="230" r="5"/><circle cx="200" cy="260" r="5"/></g>
<g fill="${gold}" opacity=".75"><path d="M40 260q10 14 0 28q-10-14 0-28z"/><path d="M200 120q10 14 0 28q-10-14 0-28z"/></g>
</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/** Layered one-point-perspective saree-shop interior (PLACEHOLDER for the owner's real shop photo/video).
 *  Three transparent layers that the hero scales at different speeds = a "walking into the shop" dolly. */
export function shopLayers(): { back: string; mid: string; near: string } {
  const W = 1600, H = 900, iL = 540, iR = 1060, iT = 330, iB = 560;
  const cols = ['#b0122f', '#0d6a4d', '#5a2a86', '#d29a1c', '#0c5a78', '#d6708c', '#e0651f', '#6a1232', '#5d9b2b', '#2c3a8a', '#ece1c8', '#8a0c24'];
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const pt = (u: number, v: number, right: boolean): [number, number] => {
    const x = lerp(0, iL, u), yt = lerp(0, iT, u), yb = lerp(H, iB, u);
    return [right ? W - x : x, yt + v * (yb - yt)];
  };
  const quad = (u0: number, u1: number, v0: number, v1: number, r: boolean) =>
    [pt(u0, v0, r), pt(u1, v0, r), pt(u1, v1, r), pt(u0, v1, r)].map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ');
  const uri = (s: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`;

  // ── back: ceiling, floor, side walls, far wall, glow ──
  const ceilPt = (u: number, s: number) => [lerp(lerp(0, iL, u), lerp(W, iR, u), s), lerp(0, iT, u)];
  let strips = '';
  for (let k = 0; k < 6; k++) {
    const u0 = 0.06 + k * 0.15, u1 = u0 + 0.09;
    const a = ceilPt(u0, 0.45), b = ceilPt(u0, 0.55), c = ceilPt(u1, 0.55), d = ceilPt(u1, 0.45);
    strips += `<polygon points="${[a, b, c, d].map((q) => q.join(',')).join(' ')}" fill="#fff4d6"/>`;
  }
  let tiles = '';
  for (let k = -7; k <= 7; k++) tiles += `<line x1="${800 + k * 150}" y1="${H}" x2="${800 + k * 34}" y2="${iB}" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>`;
  let farShelves = '';
  for (let j = 0; j < 5; j++) for (let i = 0; i < 9; i++) farShelves += `<rect x="${iL + 10 + i * 56}" y="${iT + 14 + j * 40}" width="46" height="30" fill="${cols[(i * 3 + j * 5) % cols.length]}" opacity=".85"/>`;
  const back = head + `<defs>
<linearGradient id="ce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0a0a"/><stop offset="1" stop-color="#e6ad72"/></linearGradient>
<linearGradient id="fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4a2a20"/><stop offset="1" stop-color="#e0b894"/></linearGradient>
<radialGradient id="gl"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".95"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="#2a0d12"/>
<polygon points="0,0 ${W},0 ${iR},${iT} ${iL},${iT}" fill="url(#ce)"/>${strips}
<polygon points="0,${H} ${W},${H} ${iR},${iB} ${iL},${iB}" fill="url(#fl)"/>${tiles}
<polygon points="0,0 ${iL},${iT} ${iL},${iB} 0,${H}" fill="#6b1a24"/>
<polygon points="${W},0 ${iR},${iT} ${iR},${iB} ${W},${H}" fill="#6b1a24"/>
<rect x="${iL}" y="${iT}" width="${iR - iL}" height="${iB - iT}" fill="#8d2a2a"/>${farShelves}
<ellipse cx="800" cy="450" rx="300" ry="170" fill="url(#gl)" opacity=".85"/>
<ellipse cx="800" cy="760" rx="520" ry="110" fill="url(#gl)" opacity=".3"/></svg>`;

  // ── mid: shelving units on both walls (transparent) ──
  const n = 9; let mid = '';
  const defsMid = `<defs>
<linearGradient id="dl" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${iL}" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
<linearGradient id="dr" gradientUnits="userSpaceOnUse" x1="${W}" y1="0" x2="${iR}" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs>`;
  for (const r of [false, true]) {
    mid += `<polygon points="${quad(0, 1, 0.04, 0.96, r)}" fill="#26090d"/>`;
    for (let j = 0; j < 6; j++) {
      const v0 = 0.07 + j * 0.148, v1 = v0 + 0.125;
      for (let i = 0; i < n; i++) {
        const u0 = 1 - Math.pow(1 - i / n, 1.7), u1 = 1 - Math.pow(1 - (i + 1) / n, 1.7), du = u1 - u0;
        const a = u0 + du * 0.09, b = u1 - du * 0.09, c = cols[Math.floor(rnd() * cols.length)];
        mid += `<polygon points="${quad(a, b, v0, v1, r)}" fill="${c}"/>`;
        for (let f = 1; f <= 3; f++) { const v = v0 + (v1 - v0) * f / 4; mid += `<polygon points="${quad(a, b, v - 0.004, v + 0.004, r)}" fill="#000" opacity=".26"/>`; }
        mid += `<polygon points="${quad(a, b, v1 - 0.03, v1, r)}" fill="#e6b34d" opacity=".85"/>`;
        mid += `<polygon points="${quad(a, b, v0, v0 + 0.022, r)}" fill="#fff" opacity=".2"/>`;
      }
      mid += `<polygon points="${quad(0, 1, v1, v1 + 0.02, r)}" fill="#4a2616"/>`;
    }
    for (let i = 0; i <= n; i++) { const u = 1 - Math.pow(1 - i / n, 1.7); mid += `<polygon points="${quad(Math.max(0, u - 0.004), Math.min(1, u + 0.004), 0.04, 0.96, r)}" fill="#3b1a10"/>`; }
    mid += `<polygon points="${quad(0, 1, 0, 0.05, r)}" fill="#3b1a10"/><polygon points="${quad(0, 1, 0.95, 1, r)}" fill="#2a120b"/>`;
    mid += `<polygon points="${quad(0, 1, 0, 1, r)}" fill="url(#${r ? 'dr' : 'dl'})"/>`;
  }
  const midSvg = head + defsMid + mid + '</svg>';

  // ── near: big mannequins + vignette (transparent) ──
  const place = (svg: string, x: number, y: number, w: number, h: number) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
  const near = head + `<defs><radialGradient id="vg" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#14040a" stop-opacity="0"/><stop offset="1" stop-color="#14040a" stop-opacity=".8"/></radialGradient></defs>`
    + place(build(PALETTES.crimson, 0, true), 20, 240, 540, 720)
    + place(build(PALETTES.purple, 2, true), 1030, 170, 560, 747)
    + `<rect width="${W}" height="${H}" fill="url(#vg)"/></svg>`;
  return { back: uri(back), mid: uri(midSvg), near: uri(near) };
}

/** Transparent-background saree-on-mannequin (used as sprites inside the 3D showroom). */
const MODEL_SPRITES: Record<string, string> = {
  crimson: 'photos/sprites/model_crimson.png',
  maroon: 'photos/sprites/model_maroon.png',
  emerald: 'photos/sprites/model_emerald.png',
  mustard: 'photos/sprites/model_mustard.png',
  bridal: 'photos/sprites/model_bridal.png',
  purple: 'photos/sprites/model_maroon.png',
  peacock: 'photos/sprites/model_emerald.png',
  rose: 'photos/sprites/model_crimson.png',
  ivory: 'photos/sprites/model_mustard.png',
  orange: 'photos/sprites/model_bridal.png',
};

export function sareeBare(paletteKey: string, variant = 0): string {
  return MODEL_SPRITES[paletteKey] || 'photos/sprites/model_crimson.png';
}
