import { FormEvent, useEffect, useRef, useState } from 'react';
import { site } from '../config/site';
import { COLLECTIONS, PRODUCTS, inCollection } from '../data/catalog';
import { PALETTES } from '../lib/art';
import { clamp, inr, isSmall, onScroll, Reveal, scrollToId, Words } from '../lib/hooks';
import { useStore } from '../lib/store';
import { ClothCanvas } from './ClothCanvas';
import { IconArrow, IconLeft, IconRight } from './icons';

/* ───────── Worth your attention: expanding strips ───────── */
export function Offers() {
  const { setFilter } = useStore();
  const [a, setA] = useState(0);
  return (
    <section id="offers" className="sec offers">
      <div className="wrap">
        <div className="sec-head split">
          <div><p className="eyebrow">Current offers</p><h2 className="serif-xl"><Words text="Worth your attention" /></h2></div>
          <p className="sec-note">Curated handcrafted edits with exclusive festive savings.</p>
        </div>
        <div className="strips" role="tablist" aria-label="Offers">
          {site.promos.map((o, i) => (
            <div key={o.title} role="tab" tabIndex={0} aria-selected={i === a} className={`strip ${i === a ? 'on' : ''}`}
              onMouseEnter={() => setA(i)} onFocus={() => setA(i)} onClick={() => setA(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setA(i); }}>
              <img src={`photos/collections/${o.collection}.jpg`} alt={o.title} loading="lazy" />
              <span className="strip-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="strip-v">{o.kicker}</span>
              <div className="strip-body">
                <small>{o.kicker}</small><h3>{o.title}</h3><p>{o.body}</p>
                <button className="btn-lime sm" onClick={(e) => { e.stopPropagation(); setFilter(o.collection); scrollToId('arrivals'); }}>{o.cta} <IconArrow size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Campaign: pinned, scroll-driven horizontal scene ───────── */
export function Campaign() {
  const { add, setQuick } = useStore();
  const items = [...inCollection(site.campaign.collection), ...inCollection('kanchipuram'), ...inCollection('banarasi')].filter((p, i, a) => a.indexOf(p) === i).slice(0, 7);
  const sec = useRef<HTMLElement>(null), track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [pinned, setPinned] = useState(!isSmall());
  const prog = useRef(0);

  useEffect(() => { const f = () => setPinned(!isSmall()); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  useEffect(() => {
    if (!pinned) { track.current && (track.current.style.transform = ''); return; }
    return onScroll(() => {
      const s = sec.current, t = track.current; if (!s || !t) return;
      const r = s.getBoundingClientRect(); const total = s.offsetHeight - window.innerHeight;
      const p = clamp(-r.top / total, 0, 1); prog.current = p;
      const max = Math.max(0, t.scrollWidth - t.parentElement!.clientWidth);
      t.style.transform = `translate3d(${-p * max}px,0,0)`;
      setI(clamp(Math.round(p * (items.length - 1)), 0, items.length - 1));
    });
    // eslint-disable-next-line
  }, [pinned, items.length]);

  const go = (n: number) => {
    const s = sec.current; if (!s) return;
    const k = clamp(n, 0, items.length - 1);
    if (!pinned) { track.current?.children[k]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); setI(k); return; }
    const top = s.offsetTop + (s.offsetHeight - window.innerHeight) * (k / (items.length - 1));
    window.scrollTo({ top, behavior: 'smooth' });
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const s = sec.current; if (!s || !pinned) return; const r = s.getBoundingClientRect();
      if (r.top > 0 || r.bottom < window.innerHeight) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  });
  // mouse drag → scroll
  useEffect(() => {
    const t = track.current?.parentElement; if (!t) return; let down = false, x = 0;
    const d = (e: PointerEvent) => { if (e.pointerType === 'mouse' && pinned) { down = true; x = e.clientX; } };
    const m = (e: PointerEvent) => { if (!down) return; window.scrollBy(0, (x - e.clientX) * 2.2); x = e.clientX; };
    const u = () => { down = false; };
    t.addEventListener('pointerdown', d); window.addEventListener('pointermove', m); window.addEventListener('pointerup', u);
    return () => { t.removeEventListener('pointerdown', d); window.removeEventListener('pointermove', m); window.removeEventListener('pointerup', u); };
  }, [pinned]);

  const p = items[i]; const pal = PALETTES[p.palette] || PALETTES['crimson'];
  return (
    <section id="campaign" ref={sec} className="campaign" style={{ height: pinned ? `${items.length * 62 + 100}vh` : 'auto', ['--c1' as any]: pal.base, ['--c2' as any]: pal.shade }}>
      <div className="camp-stage">
        <div className="camp-bg" />
        <span className="camp-mark">{site.name.toUpperCase()}</span>
        <div className="camp-copy">
          <p className="eyebrow light">{site.campaign.kicker}</p>
          <h2 className="camp-title" key={p.id}>{p.name}</h2>
          <p className="camp-body">{i === 0 ? site.campaign.body : `${p.fabric} · ${inr(p.price)}`}</p>
          <div className="cta-row">
            <button className="btn-lime sm" onClick={() => add(p.id)} disabled={p.stock <= 0}>{p.stock <= 0 ? 'SOLD OUT' : 'ADD TO CART'}</button>
            <button className="btn-ghost sm" onClick={() => setQuick(p.id)}>QUICK VIEW</button>
          </div>
        </div>
        <div className="camp-track-wrap"><div className="camp-track" ref={track}>
          {items.map((q, k) => (
            <button key={q.id} className={`camp-card ${k === i ? 'on' : ''}`} onClick={() => (k === i ? setQuick(q.id) : go(k))} aria-label={`${q.name}`}>
              <img src={q.image} alt="" loading="lazy" draggable={false} /><span>{String(k + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div></div>
      </div>
    </section>
  );
}

/* ───────── Latest drops grid ───────── */
export function Latest() {
  const { setQuick, setFilter } = useStore();
  const items = PRODUCTS.slice(0, 6);
  return (
    <section id="latest" className="sec latest">
      <div className="wrap">
        <div className="sec-head split">
          <div><p className="eyebrow">Fresh in the showroom</p><h2 className="serif-xl"><Words text="Just Arrived" /></h2></div>
          <button className="link-arrow" onClick={() => { setFilter('all'); scrollToId('arrivals'); }}>View full catalogue <IconArrow size={16} /></button>
        </div>
        <div className="latest-grid">
          {items.map((p, idx) => (
            <Reveal as="article" key={p.id} delay={idx * 60} className={`lcard ${idx === 0 ? 'lcard-big' : ''}`}>
              <button className="lcard-img" onClick={() => setQuick(p.id)} aria-label={`Quick view ${p.name}`}><img src={p.image} alt={p.name} loading="lazy" /></button>
              <div className="lcard-info"><small>{p.fabric}</small><h4>{p.name}</h4><p className="price">{inr(p.price)}</p></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Shopping info tiles ───────── */
export function Info() {
  return (
    <section id="info" className="sec info">
      <div className="wrap info-grid">
        {site.info.map((it, i) => (
          <Reveal key={it.title} delay={i * 80} className="info-card">
            <span className="info-num">{String(i + 1).padStart(2, '0')}</span>
            <h3>{it.title}</h3><p>{it.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Newsletter ───────── */
export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState(''); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setMsg({ ok: false, t: 'Please enter a valid email address.' }); return; }
    setMsg({ ok: true, t: 'Thank you — you are subscribed to new drops.' }); setEmail('');
  };
  return (
    <form className={`news-form ${compact ? 'compact' : ''}`} onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor={compact ? 'nl-f' : 'nl'}>Email address</label>
      <input id={compact ? 'nl-f' : 'nl'} type="email" inputMode="email" autoComplete="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className={compact ? 'btn-crimson sm' : 'btn-lime'} disabled={busy}>{busy ? '…' : 'Subscribe'}</button>
      {msg && <p className={`form-msg ${msg.ok ? 'ok' : 'err'}`} role="status">{msg.t}</p>}
    </form>
  );
}
export function Newsletter() {
  return (
    <section id="newsletter" className="sec news">
      <div className="wrap news-in">
        <p className="eyebrow light">Stay updated</p>
        <h2 className="serif-xl light"><Words text="New drapes, first." /></h2>
        <p className="lead light">Subscribe for new collections and festive showroom edits.</p>
        <NewsletterForm />
      </div>
    </section>
  );
}

/* ───────── Footer ───────── */
export function Footer() {
  const { setFilter, setPolicy } = useStore();
  const c = site.contact, s = site.social;
  const social = Object.entries(s).filter(([, v]) => v);
  return (
    <footer id="footer" className="footer">
      <div className="wrap foot-grid">
        <div className="foot-brand"><span className="brand-main big">{site.wordmark}</span><span className="brand-sub">{site.wordmarkSub}</span><p>{site.tagline}.</p></div>
        <div><h4>Shop</h4><ul>
          <li><button onClick={() => { setFilter('new'); scrollToId('arrivals'); }}>New arrivals</button></li>
          {COLLECTIONS.slice(0, 4).map((x) => <li key={x.slug}><button onClick={() => { setFilter(x.slug); scrollToId('arrivals'); }}>{x.name}</button></li>)}
        </ul></div>
        <div><h4>Explore</h4><ul>
          <li><button onClick={() => scrollToId('story')}>Our story</button></li>
          <li><button onClick={() => scrollToId('collections')}>Collections</button></li>
          <li><button onClick={() => scrollToId('offers')}>Offers</button></li>
          <li><button onClick={() => { setFilter('wedding'); scrollToId('arrivals'); }}>Bridal edit</button></li>
        </ul></div>
        <div><h4>Support</h4><ul>
          {c.phone && <li><a href={`tel:${c.phone}`}>{c.phone}</a></li>}
          {c.whatsapp && <li><a href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`}>WhatsApp</a></li>}
          {c.email && <li><a href={`mailto:${c.email}`}>{c.email}</a></li>}
          {c.address && <li>{c.address}</li>}
          <li><button onClick={() => setPolicy('shipping')}>Shipping policy</button></li>
          <li><button onClick={() => setPolicy('returns')}>Return policy</button></li>
          <li><button onClick={() => setPolicy('privacy')}>Privacy policy</button></li>
          <li><button onClick={() => setPolicy('terms')}>Terms &amp; conditions</button></li>
        </ul></div>
        <div className="foot-news"><h4>Stay updated</h4><p>New collections and festive edits.</p><NewsletterForm compact /></div>
      </div>
      <div className="foot-base wrap">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        {social.length > 0 && <ul className="social">{social.map(([k, v]) => <li key={k}><a href={v} target="_blank" rel="noopener noreferrer">{k}</a></li>)}</ul>}
      </div>
    </footer>
  );
}
