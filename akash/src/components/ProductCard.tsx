import { useRef } from 'react';
import { Product } from '../data/catalog';
import { PALETTES } from '../lib/art';
import { inr } from '../lib/hooks';
import { useStore } from '../lib/store';
import { IconHeart, IconEye, IconWhatsApp } from './icons';

export function discount(p: Product) { return p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0; }

export function ProductCard({ p, variant = 'card' }: { p: Product; variant?: 'card' | 'frame' }) {
  const { state, toggleWish, add, setQuick, openOrder } = useStore();
  const wished = state.wish.includes(p.id);
  const media = useRef<HTMLDivElement>(null);
  const d = discount(p);
  const tilt = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !media.current) return;
    const r = media.current.getBoundingClientRect();
    media.current.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 9}deg`);
    media.current.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 7}deg`);
  };
  const reset = () => { media.current?.style.setProperty('--ry', '0deg'); media.current?.style.setProperty('--rx', '0deg'); };
  return (
    <article className={`pcard ${variant}`}>
      <div className="pcard-media" ref={media} onPointerMove={tilt} onPointerLeave={reset}>
        <button className="pcard-img" onClick={() => setQuick(p.id)} aria-label={`Quick view ${p.name}`}>
          <img src={p.image} alt={`${p.name} — ${p.fabric} saree`} loading="lazy" draggable={false} />
        </button>
        <div className="badges">
          {p.stock <= 0 ? <span className="badge dark">SOLD OUT</span> : <>
            {p.isNew && <span className="badge">NEW</span>}
            {p.isBest && <span className="badge gold">BESTSELLER</span>}
            {d > 0 && <span className="badge dark">−{d}%</span>}
          </>}
        </div>
        <button className={`heart ${wished ? 'on' : ''}`} onClick={() => toggleWish(p.id)} aria-pressed={wished} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}>
          <IconHeart filled={wished} size={18} />
        </button>
        <div className="pcard-actions">
          <button onClick={() => setQuick(p.id)}><IconEye size={15} /> View</button>
          <button className="solid" onClick={() => add(p.id)} disabled={p.stock <= 0}>{p.stock <= 0 ? 'Sold out' : 'Add'}</button>
          <button className="act-order" onClick={() => openOrder(p)}><IconWhatsApp size={15} /> Order</button>
        </div>
      </div>
      <div className="pcard-info">
        <h3>{p.name}</h3>
        <p className="fabric">{p.fabric}{p.stock > 0 && p.stock <= 3 ? <em> · only {p.stock} left</em> : null}</p>
        <div className="pcard-row">
          <p className="price">{inr(p.price)}{p.mrp ? <s>{inr(p.mrp)}</s> : null}</p>
          <div className="dots" aria-label="Available colours">{p.looks.map((k) => <i key={k} style={{ background: PALETTES[k].base }} title={PALETTES[k].name} />)}</div>
        </div>
        <div className="pcard-btn-bar">
          <button
            type="button"
            className="btn-order-now"
            onClick={(e) => {
              e.stopPropagation();
              openOrder(p);
            }}
            aria-label={`Order ${p.name} now`}
          >
            <IconWhatsApp size={16} />
            <span>Order Now</span>
          </button>
        </div>
      </div>
    </article>
  );
}
