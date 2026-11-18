import { createClient } from '@supabase/supabase-js';
import { Product, PRODUCTS } from '../data/catalog';

export const SUPABASE_URL = 'https://qsrgzahisovdzvumltnn.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_E3DDxKYKdxk_GFugPandNQ_bbme7-g2';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  fabric: string;
  collection: string;
  palette: string;
  price: number;
  mrp?: number | null;
  stock: number;
  is_new: boolean;
  is_best: boolean;
  description: string;
  image: string;
  created_at?: string;
};

const LOCAL_PRODUCTS_KEY = 'akash_catalog_products';
const LOCAL_SETTINGS_KEY = 'akash_store_settings';

// Check if public.products table is live in Supabase
export async function checkSupabaseTableReady(): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (!error) return true;
    if (error.code === 'PGRST205' || error.message.includes('schema cache')) return false;
    return false;
  } catch {
    return false;
  }
}

// Fetch all products from Supabase (with localStorage fallback)
export async function getLiveProducts(): Promise<Product[] | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (!error && Array.isArray(data)) {
      const mapped: Product[] = data.map((d: DbProduct) => ({
        id: d.id,
        slug: d.slug,
        name: d.name,
        fabric: d.fabric,
        collection: d.collection,
        tags: [d.fabric.toLowerCase(), d.collection],
        palette: d.palette || 'maroon',
        variant: 0,
        looks: [d.palette || 'maroon'],
        price: Number(d.price),
        mrp: d.mrp ? Number(d.mrp) : undefined,
        stock: Number(d.stock ?? 10),
        isNew: Boolean(d.is_new),
        isBest: Boolean(d.is_best),
        desc: d.description || '',
        specs: [
          { label: 'Fabric', value: d.fabric },
          { label: 'Collection', value: d.collection },
          { label: 'Blouse piece', value: 'Included' },
          { label: 'Care', value: 'Dry clean recommended' },
        ],
        image: d.image,
        images: [d.image],
        real: true,
      }));
      // Cache locally
      try {
        localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(mapped));
      } catch {}
      return mapped;
    }
  } catch {}

  // Fallback to local storage if edited before DB setup
  try {
    const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return PRODUCTS;
}

// Add or update product in Supabase (with local storage backup)
export async function upsertProduct(p: Partial<DbProduct> & { id: string; name: string; price: number; fabric: string; collection: string; image: string }): Promise<{ cloud: boolean }> {
  const item: Product = {
    id: p.id,
    slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name: p.name,
    fabric: p.fabric,
    collection: p.collection,
    tags: [p.fabric.toLowerCase(), p.collection],
    palette: p.palette || 'maroon',
    variant: 0,
    looks: [p.palette || 'maroon'],
    price: Number(p.price),
    mrp: p.mrp ? Number(p.mrp) : undefined,
    stock: Number(p.stock ?? 10),
    isNew: Boolean(p.is_new),
    isBest: Boolean(p.is_best),
    desc: p.description || '',
    specs: [
      { label: 'Fabric', value: p.fabric },
      { label: 'Collection', value: p.collection },
      { label: 'Blouse piece', value: 'Included' },
      { label: 'Care', value: 'Dry clean recommended' },
    ],
    image: p.image,
    images: [p.image],
    real: true,
  };

  // Always update local cache first so user never loses work
  try {
    const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    let list: Product[] = cached ? JSON.parse(cached) : [...PRODUCTS];
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list));
  } catch {}

  // Attempt Supabase Cloud upsert
  const { error } = await supabase
    .from('products')
    .upsert({
      id: p.id,
      slug: item.slug,
      name: p.name,
      fabric: p.fabric,
      collection: p.collection,
      palette: p.palette || 'maroon',
      price: p.price,
      mrp: p.mrp || null,
      stock: p.stock ?? 10,
      is_new: Boolean(p.is_new),
      is_best: Boolean(p.is_best),
      description: p.description || '',
      image: p.image,
    });

  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('Could not find')) {
      return { cloud: false }; // Saved locally, but cloud table pending
    }
    throw error;
  }

  return { cloud: true };
}

// Delete product
export async function deleteProduct(id: string): Promise<{ cloud: boolean }> {
  // Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    let list: Product[] = cached ? JSON.parse(cached) : [...PRODUCTS];
    list = list.filter((x) => x.id !== id);
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list));
  } catch {}

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
      return { cloud: false };
    }
    throw error;
  }
  return { cloud: true };
}

// Fetch site settings
export async function getLiveSettings(): Promise<Record<string, string>> {
  const localSettings: Record<string, string> = {};
  try {
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (saved) Object.assign(localSettings, JSON.parse(saved));
  } catch {}

  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (!error && data) {
      data.forEach((row: { key: string; value: string }) => {
        localSettings[row.key] = row.value;
      });
    }
  } catch {}

  return localSettings;
}

// Update site setting
export async function updateSetting(key: string, value: string): Promise<{ cloud: boolean }> {
  try {
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
    const obj = saved ? JSON.parse(saved) : {};
    obj[key] = value;
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(obj));
  } catch {}

  const { error } = await supabase.from('site_settings').upsert({ key, value });
  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
      return { cloud: false };
    }
    throw error;
  }
  return { cloud: true };
}
