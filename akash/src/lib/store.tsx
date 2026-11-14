import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback, ReactNode } from 'react';
import { byId, Product } from '../data/catalog';
import { site } from '../config/site';

export type Line = { id: string; size: string; look: string; qty: number };
export type OrderRequest = {
  product: Product;
  color?: string;
  size?: string;
  image?: string;
  step?: 'method' | 'whatsapp';
};
type State = { cart: Line[]; wish: string[] };
type Action =
  | { t: 'add'; id: string; size: string; look: string; qty: number }
  | { t: 'qty'; id: string; size: string; look: string; qty: number }
  | { t: 'remove'; id: string; size: string; look: string }
  | { t: 'wish'; id: string }
  | { t: 'clear' };

const KEY = 'akash-sarees:v1';
const same = (l: Line, id: string, size: string, look: string) => l.id === id && l.size === size && l.look === look;

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'add': {
      const hit = s.cart.find((l) => same(l, a.id, a.size, a.look));
      const stock = byId(a.id)?.stock ?? 99;
      if (hit) return { ...s, cart: s.cart.map((l) => (l === hit ? { ...l, qty: Math.min(stock, l.qty + a.qty) } : l)) };
      return { ...s, cart: [...s.cart, { id: a.id, size: a.size, look: a.look, qty: Math.min(stock, a.qty) }] };
    }
    case 'qty': {
      const stock = byId(a.id)?.stock ?? 99;
      return { ...s, cart: s.cart.map((l) => (same(l, a.id, a.size, a.look) ? { ...l, qty: Math.max(1, Math.min(stock, a.qty)) } : l)) };
    }
    case 'remove': return { ...s, cart: s.cart.filter((l) => !same(l, a.id, a.size, a.look)) };
    case 'wish': return { ...s, wish: s.wish.includes(a.id) ? s.wish.filter((x) => x !== a.id) : [...s.wish, a.id] };
    case 'clear': return { ...s, cart: [] };
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY); if (!raw) return { cart: [], wish: [] };
    const p = JSON.parse(raw);
    return { cart: (p.cart || []).filter((l: Line) => byId(l.id)), wish: (p.wish || []).filter((id: string) => byId(id)) };
  } catch { return { cart: [], wish: [] }; }
}

type Panel = null | 'cart' | 'wish';
type Ctx = {
  state: State; add(id: string, o?: { size?: string; look?: string; qty?: number; open?: boolean }): void;
  setQty(l: Line, q: number): void; remove(l: Line): void; toggleWish(id: string): void; clear(): void;
  count: number; subtotal: number; shipping: number | null; total: number | null;
  panel: Panel; setPanel(p: Panel): void;
  quick: string | null; setQuick(id: string | null): void;
  orderItem: OrderRequest | null;
  openOrder(product: Product, options?: { color?: string; size?: string; image?: string; step?: 'method' | 'whatsapp' }): void;
  closeOrder(): void;
  setOrderStep(step: 'method' | 'whatsapp'): void;
  searchOpen: boolean; setSearchOpen(b: boolean): void;
  policy: string | null; setPolicy(p: string | null): void;
  filter: string; setFilter(f: string): void;
  toast(msg: string): void; toasts: { id: number; msg: string }[];
};
const C = createContext<Ctx>(null as any);
export const useStore = () => useContext(C);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [panel, setPanel] = useState<Panel>(null);
  const [quick, setQuick] = useState<string | null>(null);
  const [orderItem, setOrderItem] = useState<OrderRequest | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [policy, setPolicy] = useState<string | null>(null);
  const [filter, setFilter] = useState('new');
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked */ } }, [state]);
  // cross-tab sync
  useEffect(() => {
    const f = (e: StorageEvent) => { if (e.key === KEY) location.reload(); };
    window.addEventListener('storage', f); return () => window.removeEventListener('storage', f);
  }, []);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const openOrder = useCallback((product: Product, options: { color?: string; size?: string; image?: string; step?: 'method' | 'whatsapp' } = {}) => {
    setOrderItem({
      product,
      color: options.color || (product.palette ? (product.palette.charAt(0).toUpperCase() + product.palette.slice(1)) : ''),
      size: options.size || 'M',
      image: options.image || product.image,
      step: options.step || 'method',
    });
  }, []);

  const closeOrder = useCallback(() => {
    setOrderItem(null);
  }, []);

  const setOrderStep = useCallback((step: 'method' | 'whatsapp') => {
    setOrderItem((prev) => (prev ? { ...prev, step } : null));
  }, []);

  const value = useMemo<Ctx>(() => {
    const subtotal = state.cart.reduce((n, l) => n + (byId(l.id)?.price || 0) * l.qty, 0);
    const { flat, freeAbove } = site.shipping;
    const shipping = flat === null ? null : freeAbove !== null && subtotal >= freeAbove ? 0 : flat;
    return {
      state, subtotal, shipping, total: shipping === null ? null : subtotal + shipping,
      count: state.cart.reduce((n, l) => n + l.qty, 0),
      add: (id, o = {}) => {
        const p = byId(id); if (!p) return;
        if (p.stock <= 0) { toast('Sorry — this saree is out of stock'); return; }
        dispatch({ t: 'add', id, size: o.size || 'M', look: o.look || p.palette, qty: o.qty || 1 });
        toast(`${p.name} added to cart`); if (o.open !== false) setPanel('cart');
      },
      setQty: (l, q) => dispatch({ t: 'qty', id: l.id, size: l.size, look: l.look, qty: q }),
      remove: (l) => dispatch({ t: 'remove', id: l.id, size: l.size, look: l.look }),
      toggleWish: (id) => { const had = state.wish.includes(id); dispatch({ t: 'wish', id }); toast(had ? 'Removed from wishlist' : 'Saved to wishlist'); },
      clear: () => dispatch({ t: 'clear' }),
      panel, setPanel, quick, setQuick,
      orderItem, openOrder, closeOrder, setOrderStep,
      searchOpen, setSearchOpen, policy, setPolicy, filter, setFilter, toast, toasts,
    };
  }, [state, panel, quick, orderItem, openOrder, closeOrder, setOrderStep, searchOpen, policy, filter, toasts, toast]);

  return <C.Provider value={value}>{children}</C.Provider>;
}
