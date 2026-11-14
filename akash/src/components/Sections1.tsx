import { ReactNode, useEffect, useRef } from 'react';
import { site } from '../config/site';
import { COLLECTIONS, PRODUCTS, inCollection, Product } from '../data/catalog';
import { clamp, inr, isSmall, Reveal, scrollToId, Words } from '../lib/hooks';
import { useStore } from '../lib/store';
import { IconArrow, IconLeft, IconRight } from './icons';
import { ProductCard } from './ProductCard';
import { RoyalArchCard } from './RoyalArchCard';

export function Marquee() {
  const items = site.marquee;
  const row = [...items, ...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">{[0, 1].map((k) => <div className="marquee-row" key={k}>{row.map((t, i) => <span key={i}>{t}<b>✦</b></span>)}</div>)}</div>
    </div>
  );
}

/* ───────── Shop by weave: arch cut-outs ───────── */
export function Collections() {
  const { setFilter } = useStore();
  return (
    <section id="collections" className="sec moods">
      <div className="wrap">
        <div className="sec-head split moods-head">
          <div>
            <p className="eyebrow">Featured collections</p>
            <h2 className="moods-title"><Words text="Shop by Weave" /></h2>
          </div>
          <p className="sec-note">Kanchipuram, Banarasi, Silk, Cotton, Designer, Wedding, Party wear and Traditional — real authentic drapes photographed in showroom.</p>
        </div>
        <div className="royal-arches-grid">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60}>
              <RoyalArchCard
                id={c.slug}
                title={c.royalTitle || c.name.replace(' Sarees', '').toUpperCase()}
                image={`photos/collections/${c.slug}.jpg`}
                count={inCollection(c.slug).length}
                onClick={() => { setFilter(c.slug); scrollToId('arrivals'); }}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Curved (cylinder-like) 3D rail ───────── */
export function CurvedRail({ children, className = '' }: { children: ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = el.current!; let raf = 0;
    const update = () => {
      raf = 0; const small = isSmall(); const mid = box.clientWidth / 2;
      box.querySelectorAll<HTMLElement>('[data-card]').forEach((c) => {
        const cx = c.offsetLeft + c.offsetWidth / 2 - box.scrollLeft;
        const d = clamp((cx - mid) / (box.clientWidth * 0.5), -1.6, 1.6), a = Math.abs(d);
        c.style.transform = `translate3d(0,${(a * a * (small ? 16 : 44)).toFixed(1)}px,${(a * (small ? 16 : 60)).toFixed(1)}px) rotateY(${(-d * (small ? 9 : 20)).toFixed(2)}deg) scale(${(1 - a * 0.035).toFixed(3)})`;
      });
    };
    const q = () => { if (!raf) raf = requestAnimationFrame(update); };
    box.addEventListener('scroll', q, { passive: true }); window.addEventListener('resize', q); q(); setTimeout(q, 400);
    // mouse drag
    let down = false, sx = 0, sl = 0, moved = 0;
    const pd = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = box.scrollLeft; moved = 0; };
    const pm = (e: PointerEvent) => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); box.scrollLeft = sl - dx; if (moved > 4) box.classList.add('dragging'); };
    const pu = () => { down = false; box.classList.remove('dragging'); };
    const click = (e: MouseEvent) => { if (moved > 5) { e.preventDefault(); e.stopPropagation(); moved = 0; } };
    box.addEventListener('pointerdown', pd); window.addEventListener('pointermove', pm); window.addEventListener('pointerup', pu); box.addEventListener('click', click, true);
    return () => { box.removeEventListener('scroll', q); window.removeEventListener('resize', q); box.removeEventListener('pointerdown', pd); window.removeEventListener('pointermove', pm); window.removeEventListener('pointerup', pu); box.removeEventListener('click', click, true); cancelAnimationFrame(raf); };
  }, []);
  const by = (dir: number) => el.current?.scrollBy({ left: dir * el.current.clientWidth * 0.6, behavior: 'smooth' });
  return (
    <div className={`curved ${className}`}>
      <div className="curved-track" ref={el} tabIndex={0} role="region" aria-label="Scrollable carousel — use arrow keys">{children}</div>
      <div className="rail-btns"><button onClick={() => by(-1)} aria-label="Previous"><IconLeft /></button><button onClick={() => by(1)} aria-label="Next"><IconRight /></button></div>
    </div>
  );
}

/* ───────── Woven to be remembered ───────── */
export function Signatures() {
  const { setQuick, setFilter } = useStore();
  const items = PRODUCTS.filter((p) => p.isBest || p.isNew).slice(0, 10);
  return (
    <section id="signatures" className="sec sigs">
      <div className="wrap">
        <div className="sec-head split">
          <div>
            <p className="eyebrow">The signatures</p>
            <h2 className="serif-xl"><Words text="Woven to Be" /> <em className="gold-script">Remembered</em></h2>
          </div>
          <button className="link-arrow" onClick={() => { setFilter('all'); scrollToId('arrivals'); }}>Explore the edit <IconArrow size={16} /></button>
        </div>
      </div>
      <CurvedRail className="sig-rail">
        {items.map((p) => (
          <button key={p.id} data-card className="sig-card" onClick={() => setQuick(p.id)} aria-label={`${p.name}, ${inr(p.price)} — quick view`}>
            <img src={p.image} alt="" loading="lazy" draggable={false} />
            <span className="sig-meta"><small>{p.fabric}</small><b>{p.name}</b><em>{inr(p.price)}</em></span>
          </button>
        ))}
      </CurvedRail>
    </section>
  );
}

/* ───────── New arrivals / shop all shelf ───────── */
export function Arrivals() {
  const { filter, setFilter } = useStore();
  const list: Product[] = filter === 'new' ? PRODUCTS.filter((p) => p.isNew) : filter === 'best' ? PRODUCTS.filter((p) => p.isBest) : inCollection(filter);
  const title = filter === 'new' ? 'New Arrivals' : filter === 'all' ? 'All Sarees' : filter === 'best' ? 'Best Sellers' : COLLECTIONS.find((c) => c.slug === filter)?.name || 'Sarees';
  const chips: [string, string][] = [['new', 'New arrivals'], ['best', 'Best sellers'], ['all', 'All sarees'], ...COLLECTIONS.map((c) => [c.slug, c.name.replace(' Sarees', '')] as [string, string])];
  return (
    <section id="arrivals" className="sec arrivals">
      <div className="wrap">
        <div className="sec-head split">
          <div>
            <p className="eyebrow">Fresh from the loom</p>
            <h2 className="serif-xl" key={title}><Words text={title} /></h2>
          </div>
          <p className="count">{list.length} {list.length === 1 ? 'saree' : 'sarees'}</p>
        </div>
        <div className="chips scroll-x" role="tablist" aria-label="Filter sarees">
          {chips.map(([k, t]) => <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{t}</button>)}
        </div>
      </div>
      <CurvedRail className="shelf" key={filter}>
        {list.map((p) => <div key={p.id} data-card className="shelf-item"><ProductCard p={p} /></div>)}
        {list.length === 0 && <p className="empty wrap">No sarees here yet.</p>}
      </CurvedRail>
    </section>
  );
}
