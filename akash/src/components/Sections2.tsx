import { useEffect, useRef, useState } from 'react';
import { site } from '../config/site';
import { PRODUCTS, byId, inCollection } from '../data/catalog';
import { PALETTES } from '../lib/art';
import { inr, Reveal, scrollToId, Words } from '../lib/hooks';
import { useStore } from '../lib/store';
import { IconArrow, IconBag, IconHeart, IconLeft, IconMinus, IconPlus, IconRight, IconWhatsApp } from './icons';
import { ProductCard } from './ProductCard';

/* ───────── Brand story ───────── */
export function Story() {
  const { setFilter } = useStore();
  const s = site.story;
  return (
    <section id="story" className="sec story">
      <div className="wrap story-grid">
        <div className="story-copy">
          <p className="eyebrow">{s.kicker}</p>
          <h2 className="serif-xl"><Words text={s.title} /></h2>
          {s.body.map((t, i) => <Reveal as="p" key={i} delay={150 + i * 120} className="lead">{t}</Reveal>)}
          <Reveal delay={400}><button className="btn-solid" onClick={() => { setFilter('all'); scrollToId('arrivals'); }}>{s.cta} <IconArrow size={18} /></button></Reveal>
        </div>
        <div className="story-art" aria-hidden="true">
          <Reveal className="sa a1"><img src="photos/hero/model-1.jpg" alt="Crimson Kanchipuram silk saree" loading="lazy" /></Reveal>
          <Reveal className="sa a2" delay={160}><img src="photos/hero/model-2.jpg" alt="Emerald green Kanchipuram silk saree" loading="lazy" /></Reveal>
          <Reveal className="sa a3" delay={300}><img src="photos/hero/model-3.jpg" alt="Mustard Banarasi brocade silk saree" loading="lazy" /></Reveal>
        </div>
      </div>
    </section>
  );
}

const WaveSvg = ({ flip = false }: { flip?: boolean }) => (
  <svg className={`wave ${flip ? 'flip' : ''}`} viewBox="0 0 2880 90" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 0H2880V52C2640 12 2400 92 2160 52S1680 92 1440 52C1200 12 960 92 720 52S240 92 0 52Z" fill="currentColor" />
  </svg>
);

/* ───────── The Bridal Collection (dark, wavy edges) ───────── */
export function Bridal() {
  const { setFilter, add, openOrder } = useStore();
  const items = [...inCollection('wedding'), ...inCollection('kanchipuram')].slice(0, 5);
  return (
    <section id="bridal" className="bridal">
      <div className="wave-top"><WaveSvg /></div>
      <div className="wrap bridal-grid">
        <Reveal className="bridal-hero">
          <img src="photos/hero/model-5.jpg" alt="South Indian bride in crimson and gold zari bridal saree" loading="lazy" />
          <button onClick={() => { setFilter('wedding'); scrollToId('arrivals'); }} className="view-col">View the<br />collection <IconArrow size={16} /></button>
        </Reveal>
        <div className="bridal-side">
          <p className="eyebrow light">Wedding & festive</p>
          <h2 className="serif-xl light"><Words text="The Bridal Collection" /></h2>
          <div className="bridal-cards">
            {items.map((p, i) => (
              <Reveal key={p.id} delay={i * 90} className="frame-card">
                <div className="frame-img"><img src={p.image} alt={p.name} loading="lazy" /></div>
                <p className="fc-name">{p.name}</p><p className="fc-price">{inr(p.price)}</p>
                <div className="frame-card-actions">
                  <button className="gold-bar" onClick={() => add(p.id)} disabled={p.stock <= 0}>{p.stock <= 0 ? 'SOLD OUT' : 'ADD TO CART'}</button>
                  <button className="gold-bar-order" onClick={() => openOrder(p)} disabled={p.stock <= 0}><IconWhatsApp size={13} /> ORDER NOW</button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <div className="wave-bottom"><WaveSvg flip /></div>
    </section>
  );
}

/* ───────── Trend rows ───────── */
function TrendRow({ id }: { id: string }) {
  const p = byId(id)!; const { add, setQuick, openOrder } = useStore();
  const [size, setSize] = useState('M');
  return (
    <div className="trow">
      <button className="trow-img" onClick={() => setQuick(p.id)} aria-label={`Quick view ${p.name}`}><img src={p.image} alt="" loading="lazy" /></button>
      <div className="trow-info">
        <h4>{p.name}</h4><p className="muted">{p.fabric}</p>
        <div className="chips tiny" role="group" aria-label="Blouse size">{['S', 'M', 'L', 'XL'].map((s) => <button key={s} className={s === size ? 'on' : ''} onClick={() => setSize(s)} aria-pressed={s === size}>{s}</button>)}</div>
        <p className="price">{inr(p.price)}</p>
      </div>
      <div className="trow-actions">
        <button className="round-order" onClick={() => openOrder(p, { size })} disabled={p.stock <= 0} aria-label={`Order ${p.name} on WhatsApp`} title="Order on WhatsApp"><IconWhatsApp size={16} /></button>
        <button className="round-add" onClick={() => add(p.id, { size, open: false })} disabled={p.stock <= 0} aria-label={`Add ${p.name} to cart`}><IconBag size={18} /></button>
      </div>
    </div>
  );
}
export function Trends() {
  const day = PRODUCTS.filter((p) => p.isBest).slice(0, 4), season = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  return (
    <section id="trends" className="sec trends">
      <div className="wrap two">
        <div><h3 className="bar-title"><Words text="Trend of the Day" /></h3>{day.map((p) => <TrendRow key={p.id} id={p.id} />)}</div>
        <div><h3 className="bar-title"><Words text="Seasonal Special" /></h3>{season.map((p) => <TrendRow key={p.id} id={p.id} />)}</div>
      </div>
    </section>
  );
}

/* ───────── Featured sarees: look switcher ───────── */
export function Showcase() {
  const { add, toggleWish, state, setQuick, openOrder } = useStore();
  const ids = ['P001', 'P008', 'P007', 'P016', 'P003'];
  const [idx, setIdx] = useState(0);
  const p = byId(ids[idx])!;
  const [look, setLook] = useState(p.palette);
  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [prev, setPrev] = useState<string | null>(null);
  const cur = p.image;
  const last = useRef(cur);
  useEffect(() => { setLook(byId(ids[idx])!.palette); setQty(1); }, [idx]);
  useEffect(() => { if (last.current !== cur) { setPrev(last.current); last.current = cur; const t = setTimeout(() => setPrev(null), 900); return () => clearTimeout(t); } }, [cur]);
  const pal = PALETTES[look] || PALETTES[p.palette];
  const wished = state.wish.includes(p.id);
  const step = (d: number) => setIdx((idx + d + ids.length) % ids.length);
  return (
    <section id="showcase" className="sec showcase" style={{ ['--tint' as any]: pal.light }}>
      <div className="wrap show-grid">
        <div className="thumbs" role="tablist" aria-label="Change look">
          <span className="script hand">Change look</span>
          {ids.map((id, i) => { const q = byId(id)!; return <button key={id} role="tab" aria-selected={i === idx} className={i === idx ? 'on' : ''} onClick={() => setIdx(i)} aria-label={q.name}><img src={q.image} alt="" /></button>; })}
        </div>
        <div className="stage">
          <div className="halo" />
          {prev && <img className="look out" src={prev} alt="" aria-hidden="true" />}
          <img key={cur} className="look in" src={cur} alt={`${p.name} in ${pal.name}`} />
          <span className="script new-drop">{p.isNew ? 'New drop 2026' : 'Exclusive'}</span>
          <div className="stage-nav"><button onClick={() => step(-1)} aria-label="Previous saree"><IconLeft /></button><button onClick={() => step(1)} aria-label="Next saree"><IconRight /></button></div>
        </div>
        <div className="show-info">
          <button className="link-arrow small" onClick={() => scrollToId('arrivals')}>Shop all sarees <IconArrow size={14} /></button>
          <p className="eyebrow">{p.fabric}</p>
          <h2 className="serif-xl caps" key={p.id}>{p.name}</h2>
          <p className="price big">{inr(p.price)}{p.mrp ? <s>{inr(p.mrp)}</s> : null}</p>
          <p className="lead small">{p.desc}</p>
          <ul className="spec-icons">{p.specs.map((s) => <li key={s.label}><b>{s.label}</b><span>{s.value}</span></li>)}</ul>
          <p className="label">Select blouse size</p>
          <div className="chips" role="group" aria-label="Blouse size">{['S', 'M', 'L', 'XL', '2XL'].map((s) => <button key={s} className={s === size ? 'on' : ''} onClick={() => setSize(s)} aria-pressed={s === size}>{s}</button>)}</div>
          <p className="label">Select colour — <b>{pal.name}</b></p>
          <div className="swatch-row">{p.looks.map((k) => <button key={k} className={k === look ? 'on' : ''} style={{ background: PALETTES[k]?.base || '#800020' }} onClick={() => setLook(k)} aria-pressed={k === look} aria-label={PALETTES[k]?.name || k} />)}</div>
          <div className="buy-row">
            <div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><IconMinus size={14} /></button><span>{qty}</span><button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase"><IconPlus size={14} /></button></div>
            <button className="btn-icon" onClick={() => setQuick(p.id)} aria-label="Quick view">i</button>
            <button className={`btn-icon ${wished ? 'on' : ''}`} onClick={() => toggleWish(p.id)} aria-pressed={wished} aria-label="Wishlist"><IconHeart filled={wished} /></button>
          </div>
          <button className="curve-cta" onClick={() => add(p.id, { size, look, qty })} disabled={p.stock <= 0}><span>{p.stock <= 0 ? 'SOLD OUT' : 'ADD TO CART'}</span><i><IconArrow size={20} /></i></button>
          <button
            type="button"
            className="showcase-order-btn"
            onClick={() => openOrder(p, { color: pal.name, size, image: cur })}
            disabled={p.stock <= 0}
            aria-label={`Order ${p.name} via WhatsApp`}
          >
            <IconWhatsApp size={18} />
            <span>ORDER NOW VIA WHATSAPP</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────── Edits for every occasion ───────── */
const EDITS = [
  { title: 'The Wedding Edit', sub: 'Silks for the big day', slug: 'wedding', img: 'photos/collections/wedding.jpg' },
  { title: 'Heritage Weaves', sub: 'Traditional classics', slug: 'traditional', img: 'photos/collections/traditional.jpg' },
  { title: 'Festive Glow', sub: 'Party & celebration', slug: 'party', img: 'photos/collections/party.jpg' },
  { title: 'The New Drape', sub: 'Designer silhouettes', slug: 'designer', img: 'photos/collections/designer.jpg' },
];
export function Edits() {
  const { setFilter } = useStore();
  return (
    <section id="edits" className="sec edits">
      <div className="wrap">
        <div className="sec-head">
          <p className="eyebrow">Curated by the house</p>
          <h2 className="shout"><Words text="EDITS FOR" /> <em className="gold-script"> every occasion</em></h2>
        </div>
        <div className="edit-grid">
          {EDITS.map((e, i) => (
            <Reveal as="button" key={e.slug} className="edit-card" delay={i * 90} onClick={() => { setFilter(e.slug); scrollToId('arrivals'); }}>
              <img src={e.img} alt={e.title} loading="lazy" />
              <span className="edit-text"><small>{e.sub}</small><b>{e.title}</b><em>EXPLORE NOW <IconArrow size={13} /></em></span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
