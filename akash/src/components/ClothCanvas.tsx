import { useEffect, useRef, useState } from 'react';
import { createCloth, ClothHandle, ClothOptions } from '../lib/cloth';
import { Palette } from '../lib/art';
import { isSmall } from '../lib/hooks';

export const clothPalette = (p: Palette) => ({ base: p.base, shade: p.shade, light: p.light, zari: p.zari });

type Props = { palettes: Palette[]; opts?: Partial<ClothOptions>; onReady?: (h: ClothHandle) => void; className?: string; label?: string };

/** Real-time WebGL cloth. Falls back to a static gradient when WebGL is unavailable. */
export function ClothCanvas({ palettes, opts = {}, onReady, className = '', label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined; let dead = false;
    const t = setTimeout(() => { if (!dead) cleanup = boot(); }, 90);
    return () => { dead = true; clearTimeout(t); cleanup?.(); };
    // eslint-disable-next-line
  }, []);

  function boot() {
    const c = ref.current!; const small = isSmall();
    const base = { cols: 120, rows: 76, ...opts };
    const h = createCloth(c, {
      ...base, palettes: palettes.map(({ base, shade, light, zari }) => ({ base, shade, light, zari })),
      cols: small ? Math.round((base.cols as number) * 0.5) : base.cols,
      rows: small ? Math.round((base.rows as number) * 0.5) : base.rows,
      dpr: small ? 1.25 : 1.6,
    });
    if (!h) { setFailed(true); return undefined; }
    onReady?.(h);
    const io = new IntersectionObserver(([e]) => h.setActive(e.isIntersecting && !document.hidden), { threshold: 0.01 });
    io.observe(c);
    const vis = () => h.setActive(!document.hidden);
    const rs = () => h.resize();
    document.addEventListener('visibilitychange', vis); window.addEventListener('resize', rs);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', vis); window.removeEventListener('resize', rs); h.destroy(); };
  }

  if (failed) {
    const p = palettes[0];
    return <div className={`cloth-fallback ${className}`} role="img" aria-label={label} style={{ background: `linear-gradient(115deg, ${p.shade}, ${p.base} 45%, ${p.light} 60%, ${p.shade})` }} />;
  }
  return <canvas ref={ref} className={`cloth ${className}`} role="img" aria-label={label} />;
}
