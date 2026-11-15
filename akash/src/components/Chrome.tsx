import { useEffect, useRef, useState } from 'react';
import { site } from '../config/site';
import { PRODUCTS, byId, collectionBySlug, COLLECTIONS } from '../data/catalog';
import { PALETTES, paisleyPattern, sareeArt } from '../lib/art';
import { inr, onScroll, reducedMotion, scrollToId } from '../lib/hooks';
import { useStore } from '../lib/store';
import { IconArrow, IconBag, IconClose, IconHeart, IconMenu, IconMinus, IconPlus, IconSearch, IconUser, IconWhatsApp } from './icons';

/* ───────── Preloader: macro paisley fabric → curtain lift ───────── */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>('in');
  useEffect(() => {
    const r = reducedMotion();
    document.body.style.overflow = 'hidden';
    const a = setTimeout(() => setPhase('out'), r ? 100 : 600);
    const b = setTimeout(() => { setPhase('gone'); document.body.style.overflow = ''; onDone(); }, r ? 250 : 1100);
    return () => { clearTimeout(a); clearTimeout(b); document.body.style.overflow = ''; };
    // eslint-disable-next-line
  }, []);
  if (phase === 'gone') return null;
  return (
    <div className={`preloader ${phase}`} aria-hidden="true">
      <div className="pl-fabric" />
      <div className="pl-vignette" />
      <div className="pl-mark">
        <span className="pl-brand-anim">{site.wordmark}</span>
        <small className="pl-sub-anim">{site.wordmarkSub}</small>
      </div>
      <div className="pl-bar"><i /></div>
    </div>
  );
}

/* ───────── Announcement bar ───────── */
export function Announcement() {
  const items = site.announcement.filter(Boolean);
  if (!items.length) return null;
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className="announce" role="region" aria-label="Announcements">
      {site.promoPill && <span className="pill-yellow">{site.promoPill}</span>}
      <div className="announce-track">
        {[0, 1].map((k) => (
          <div className="announce-row" key={k} aria-hidden={k === 1}>
            {row.map((t, i) => <span key={i}><b>✦</b> {t}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Navigation ───────── */
export function Nav() {
  const { count, state, setPanel, setSearchOpen, setFilter, toast } = useStore();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => onScroll((y) => setSolid(y > 60)), []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);
  const go = (id: string, filter?: string) => { setOpen(false); if (filter) setFilter(filter); setTimeout(() => scrollToId(id), open ? 250 : 0); };
  const links: [string, () => void][] = [
    ['Home', () => go('top')], ['Collections', () => go('collections')], ['Shop All', () => go('arrivals', 'all')],
    ['New Arrivals', () => go('arrivals', 'new')], ['About', () => go('story')], ['Contact', () => go('footer')],
  ];
  return (
    <>
    <header className={`nav ${solid ? 'solid' : ''}`}>
      <div className="nav-in">
        <button className="nav-burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><IconMenu size={24} /></button>
        <a href="#top" className="brand" onClick={(e) => { e.preventDefault(); go('top'); }} aria-label={`${site.name} — home`}>
          <span className="brand-main">{site.wordmark}</span><span className="brand-sub">{site.wordmarkSub}</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          {links.map(([t, f]) => <a key={t} href="#" onClick={(e) => { e.preventDefault(); f(); }}>{t}</a>)}
        </nav>
        <div className="nav-tools">
          <button className="tool search" onClick={() => setSearchOpen(true)} aria-label="Search sarees"><IconSearch /><span>Search sarees, fabrics…</span></button>
          <button className="tool" onClick={() => toast(site.api.baseUrl ? 'Sign in coming up' : 'Customer accounts arrive with the store backend (Phase 4)')} aria-label="Account"><IconUser /></button>
          <button className="tool" onClick={() => setPanel('wish')} aria-label={`Wishlist, ${state.wish.length} items`}><IconHeart size={20} />{state.wish.length > 0 && <i className="count">{state.wish.length}</i>}</button>
          <button className="tool" onClick={() => setPanel('cart')} aria-label={`Cart, ${count} items`}><IconBag />{count > 0 && <i className="count">{count}</i>}</button>
        </div>
      </div>
    </header>
      <div className={`menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <button className="menu-close" onClick={() => setOpen(false)} aria-label="Close menu"><IconClose size={26} /></button>
        <nav aria-label="Mobile">
          {links.map(([t, f], i) => <a key={t} href="#" style={{ transitionDelay: `${120 + i * 55}ms` }} onClick={(e) => { e.preventDefault(); f(); }}>{t}</a>)}
        </nav>
        <div className="menu-foot">
          <button onClick={() => { setOpen(false); setSearchOpen(true); }}>Search</button>
          <button onClick={() => { setOpen(false); setPanel('wish'); }}>Wishlist</button>
          <button onClick={() => { setOpen(false); toast('Customer accounts arrive with the store backend (Phase 4)'); }}>Account</button>
        </div>
      </div>
    </>
  );
}

/* ───────── Toasts ───────── */
export function Toasts() {
  const { toasts } = useStore();
  return <div className="toasts" role="status" aria-live="polite">{toasts.map((t) => <div key={t.id} className="toast">{t.msg}</div>)}</div>;
}

function useEsc(active: boolean, fn: () => void) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') fn(); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [active, fn]);
}
function useLock(active: boolean) { useEffect(() => { if (!active) return; const o = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = o; }; }, [active]); }

/* ───────── Cart / Wishlist drawer ───────── */
export function Drawer() {
  const { panel, setPanel, state, setQty, remove, subtotal, shipping, total, count, add, toggleWish, toast, setQuick, openOrder } = useStore();
  const close = () => setPanel(null);
  useEsc(!!panel, close); useLock(!!panel);
  const lines = state.cart;
  const checkout = () => {
    toast('Checkout and payments are not connected yet — they arrive with the store backend (Phase 4).');
  };
  return (
    <div className={`drawer-wrap ${panel ? 'open' : ''}`} aria-hidden={!panel}>
      <div className="scrim" onClick={close} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={panel === 'wish' ? 'Wishlist' : 'Shopping cart'}>
        <header>
          <div className="tabs">
            <button className={panel === 'cart' ? 'on' : ''} onClick={() => setPanel('cart')}>Cart{count ? ` (${count})` : ''}</button>
            <button className={panel === 'wish' ? 'on' : ''} onClick={() => setPanel('wish')}>Wishlist{state.wish.length ? ` (${state.wish.length})` : ''}</button>
          </div>
          <button className="x" onClick={close} aria-label="Close"><IconClose /></button>
        </header>
        {panel === 'wish' ? (
          <div className="drawer-body">
            {state.wish.length === 0 && <p className="empty">Your wishlist is empty. Tap the heart on any saree to save it.</p>}
            {state.wish.map((id) => { const p = byId(id)!; return (
              <div className="line" key={id}>
                <img src={p.image} alt="" />
                <div><h4>{p.name}</h4><p className="muted">{p.fabric}</p><p className="price">{inr(p.price)}</p>
                  <div className="line-actions">
                    <button className="mini solid" onClick={() => add(id, { open: false })} disabled={p.stock <= 0}>Add to cart</button>
                    <button className="mini order" onClick={() => openOrder(p)}>Order Now</button>
                    <button className="mini" onClick={() => setQuick(id)}>View</button>
                    <button className="link" onClick={() => toggleWish(id)}>Remove</button>
                  </div>
                </div>
              </div>); })}
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {lines.length === 0 && <p className="empty">Your cart is empty.</p>}
              {lines.map((l) => { const p = byId(l.id)!; return (
                <div className="line" key={`${l.id}${l.size}${l.look}`}>
                  <img src={p.real && l.look === p.palette ? p.image : sareeArt(l.look, p.variant)} alt="" />
                  <div>
                    <h4>{p.name}</h4>
                    <p className="muted">{PALETTES[l.look]?.name} · Blouse {l.size}</p>
                    <p className="price">{inr(p.price)}</p>
                    <div className="line-actions">
                      <div className="qty" role="group" aria-label={`Quantity for ${p.name}`}>
                        <button onClick={() => setQty(l, l.qty - 1)} aria-label="Decrease"><IconMinus size={14} /></button><span>{l.qty}</span><button onClick={() => setQty(l, l.qty + 1)} aria-label="Increase" disabled={l.qty >= p.stock}><IconPlus size={14} /></button>
                      </div>
                      <button className="link" onClick={() => openOrder(p, { size: l.size, color: PALETTES[l.look]?.name })}>Order on WhatsApp</button>
                      <button className="link" onClick={() => remove(l)}>Remove</button>
                    </div>
                  </div>
                  <b className="line-total">{inr(p.price * l.qty)}</b>
                </div>); })}
            </div>
            <footer>
              <dl>
                <div><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
                <div><dt>Shipping</dt><dd>{shipping === null ? 'Calculated at checkout' : shipping === 0 ? 'Free' : inr(shipping)}</dd></div>
                <div className="tot"><dt>Total</dt><dd>{total === null ? `${inr(subtotal)} + shipping` : inr(total)}</dd></div>
              </dl>
              <button className="btn-solid" onClick={checkout} disabled={!lines.length}>Proceed to checkout <IconArrow size={18} /></button>
              <button className="btn-line" onClick={() => { close(); scrollToId('arrivals'); }}>Continue shopping</button>
              <p className="muted small">Pay online or choose cash on delivery at checkout.</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

/* ───────── Quick view ───────── */
export function QuickView() {
  const { quick, setQuick, add, toggleWish, state, openOrder } = useStore();
  const p = quick ? byId(quick) : null;
  const [size, setSize] = useState('M');
  const [look, setLook] = useState('');
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  useEffect(() => { if (p) { setLook(p.palette); setSize('M'); setQty(1); setImg(0); } }, [quick]);
  useEsc(!!p, () => setQuick(null)); useLock(!!p);
  if (!p) return null;
  const wished = state.wish.includes(p.id);
  const gallery = p.real && (look || p.palette) === p.palette ? p.images : [sareeArt(look || p.palette, p.variant), sareeArt(look || p.palette, (p.variant + 1) % 4), sareeArt(look || p.palette, (p.variant + 2) % 4)];
  return (
    <div className="modal-wrap open" onMouseDown={(e) => { if (e.target === e.currentTarget) setQuick(null); }}>
      <div className="modal quick" role="dialog" aria-modal="true" aria-label={p.name}>
        <button className="x" onClick={() => setQuick(null)} aria-label="Close"><IconClose /></button>
        <div className="quick-media">
          <img src={gallery[img]} alt={`${p.name}`} />
          <div className="quick-thumbs">{gallery.map((g, i) => <button key={i} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`}><img src={g} alt="" /></button>)}</div>
        </div>
        <div className="quick-info">
          <p className="eyebrow">{p.fabric}</p>
          <h3>{p.name}</h3>
          <p className="price big">{inr(p.price)}{p.mrp ? <s>{inr(p.mrp)}</s> : null}</p>
          <p className="muted">{p.desc}</p>
          <p className="label">Colour — <b>{PALETTES[look || p.palette]?.name}</b></p>
          <div className="swatch-row">{p.looks.map((k) => <button key={k} className={k === look ? 'on' : ''} style={{ background: PALETTES[k].base }} onClick={() => setLook(k)} aria-label={PALETTES[k].name} aria-pressed={k === look} />)}</div>
          <p className="label">Blouse size</p>
          <div className="chips">{['S', 'M', 'L', 'XL', '2XL'].map((s) => <button key={s} className={s === size ? 'on' : ''} onClick={() => setSize(s)} aria-pressed={s === size}>{s}</button>)}</div>
          <div className="buy-row">
            <div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><IconMinus size={14} /></button><span>{qty}</span><button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase"><IconPlus size={14} /></button></div>
            <button className="btn-solid grow" disabled={p.stock <= 0} onClick={() => { add(p.id, { size, look, qty }); setQuick(null); }}>{p.stock <= 0 ? 'Sold out' : 'Add to cart'}</button>
            <button className={`btn-icon ${wished ? 'on' : ''}`} onClick={() => toggleWish(p.id)} aria-pressed={wished} aria-label="Wishlist"><IconHeart filled={wished} /></button>
          </div>
          <div className="quick-order-row">
            <button
              type="button"
              className="btn-order-now-quick"
              onClick={() => {
                openOrder(p, {
                  color: PALETTES[look || p.palette]?.name,
                  size,
                  image: gallery[img] || p.image,
                });
              }}
              aria-label={`Order ${p.name} via WhatsApp`}
            >
              <IconWhatsApp size={18} />
              <span>Order Now</span>
            </button>
          </div>
          <p className="stock">{p.stock <= 0 ? 'Out of stock' : p.stock <= 3 ? `Only ${p.stock} left` : 'In stock'}</p>
          <dl className="specs">{p.specs.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl>
        </div>
      </div>
    </div>
  );
}

/* ───────── Search ───────── */
export function SearchOverlay() {
  const { searchOpen, setSearchOpen, setQuick } = useStore();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEsc(searchOpen, () => setSearchOpen(false)); useLock(searchOpen);
  useEffect(() => { if (searchOpen) { setQ(''); setTimeout(() => input.current?.focus(), 60); } }, [searchOpen]);
  const t = q.trim().toLowerCase();
  const res = t ? PRODUCTS.filter((p) => [p.name, p.fabric, collectionBySlug(p.collection)?.name, PALETTES[p.palette].name, ...p.looks.map((k) => PALETTES[k].name)].join(' ').toLowerCase().includes(t)) : [];
  return (
    <div className={`search-wrap ${searchOpen ? 'open' : ''}`} aria-hidden={!searchOpen}>
      <div className="scrim" onClick={() => setSearchOpen(false)} />
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search">
        <div className="search-bar"><IconSearch size={24} /><input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sarees, fabrics, colours…" aria-label="Search sarees" /><button onClick={() => setSearchOpen(false)} aria-label="Close search"><IconClose /></button></div>
        {!t && <div className="search-hint"><p className="eyebrow">Popular</p><div className="chips">{COLLECTIONS.map((c) => <button key={c.slug} onClick={() => setQ(c.name.replace(' Sarees', ''))}>{c.name}</button>)}</div></div>}
        {t && res.length === 0 && <p className="empty">No sarees match “{q}”.</p>}
        <div className="search-grid">{res.slice(0, 12).map((p) => (
          <button key={p.id} className="sr" onClick={() => { setSearchOpen(false); setQuick(p.id); }}>
            <img src={p.image} alt="" /><span>{p.name}</span><em>{p.fabric} · {inr(p.price)}</em>
          </button>))}</div>
      </div>
    </div>
  );
}

/* ───────── Policy modal ───────── */
export function PolicyModal() {
  const { policy, setPolicy } = useStore();
  useEsc(!!policy, () => setPolicy(null)); useLock(!!policy);
  if (!policy) return null;
  const titles: Record<string, string> = { shipping: 'Shipping Policy', returns: 'Return Policy', privacy: 'Privacy Policy', terms: 'Terms & Conditions' };
  const text = (site.policies as any)[policy] as string;
  return (
    <div className="modal-wrap open" onMouseDown={(e) => { if (e.target === e.currentTarget) setPolicy(null); }}>
      <div className="modal policy" role="dialog" aria-modal="true" aria-label={titles[policy]}>
        <button className="x" onClick={() => setPolicy(null)} aria-label="Close"><IconClose /></button>
        <h3>{titles[policy]}</h3>
        {text ? text.split('\n').map((l, i) => <p key={i}>{l}</p>) : <p className="muted">This policy has not been published yet. The store owner adds it in <code>src/config/site.ts</code> (later: the admin dashboard).</p>}
      </div>
    </div>
  );
}
