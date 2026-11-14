import { createElement, useEffect, useRef, useState } from 'react';

export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isSmall = () => typeof matchMedia !== 'undefined' && matchMedia('(max-width: 820px)').matches;

// ── single shared scroll loop: position + damped velocity ──
type Fn = (y: number, vel: number) => void;
const subs = new Set<Fn>();
let lastY = 0, vel = 0, running = false;
function tick() {
  const y = window.scrollY;
  vel += (y - lastY - vel) * 0.18; lastY = y;
  document.documentElement.style.setProperty('--vel', String(Math.max(-1, Math.min(1, vel / 70)).toFixed(3)));
  subs.forEach((f) => f(y, vel));
  if (Math.abs(vel) > 0.05 || Math.abs(y - lastY) > 0) requestAnimationFrame(tick); else { running = false; document.documentElement.style.setProperty('--vel', '0'); subs.forEach((f) => f(y, 0)); }
}
function wake() { if (!running) { running = true; requestAnimationFrame(tick); } }
if (typeof window !== 'undefined') { window.addEventListener('scroll', wake, { passive: true }); window.addEventListener('resize', wake); }
export function onScroll(fn: Fn) { subs.add(fn); fn(window.scrollY, 0); return () => { subs.delete(fn); }; }

export function useInView<T extends Element>(opts: IntersectionObserverInit = { threshold: 0.15 }, once = true) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); if (once) io.disconnect(); } else if (!once) setSeen(false); }, opts);
    io.observe(el); return () => io.disconnect();
    // eslint-disable-next-line
  }, []);
  return [ref, seen] as const;
}

export function Reveal({ children, className = '', delay = 0, as = 'div', ...rest }: any) {
  const [ref, seen] = useInView<HTMLElement>({ threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  return createElement(as, { ref, className: `reveal ${seen ? 'in' : ''} ${className}`, style: { transitionDelay: `${delay}ms`, ...(rest.style || {}) }, ...rest }, children);
}

/** Cinematic masked word-by-word text reveal. */
export function Words({ text, className = '', delay = 0, as = 'span' }: { text: string; className?: string; delay?: number; as?: any }) {
  const [ref, seen] = useInView<HTMLElement>({ threshold: 0.2 });
  const words = text.split(' ');
  return createElement(as, { ref, className: `words ${seen ? 'in' : ''} ${className}`, 'aria-label': text },
    words.map((w, i) => createElement('span', { className: 'w', key: i, 'aria-hidden': true }, createElement('span', { style: { transitionDelay: `${delay + i * 70}ms` } }, w + (i < words.length - 1 ? ' ' : '')))));
}

export const inr = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export function scrollToId(id: string) {
  const el = document.getElementById(id); if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top: y, behavior: reducedMotion() ? 'auto' : 'smooth' });
}
