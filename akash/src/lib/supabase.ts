import { createClient } from '@supabase/supabase-js';
import { Product } from '../data/catalog';

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

// Fetch all products from Supabase
export async function getLiveProducts(): Promise<Product[] | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) return null;

    return data.map((d: DbProduct) => ({
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
  } catch {
    return null;
  }
}

// Add or update product in Supabase
export async function upsertProduct(p: Partial<DbProduct> & { id: string; name: string; price: number; fabric: string; collection: string; image: string }) {
  const { data, error } = await supabase
    .from('products')
    .upsert({
      id: p.id,
      slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
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
    })
    .select();

  if (error) throw error;
  return data;
}

// Delete product from Supabase
export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// Fetch site settings
export async function getLiveSettings(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error || !data) return {};
    const res: Record<string, string> = {};
    data.forEach((row: { key: string; value: string }) => {
      res[row.key] = row.value;
    });
    return res;
  } catch {
    return {};
  }
}

// Update site setting
export async function updateSetting(key: string, value: string) {
  const { error } = await supabase.from('site_settings').upsert({ key, value });
  if (error) throw error;
}
