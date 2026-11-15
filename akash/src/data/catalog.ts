// SAMPLE CATALOGUE — placeholder products and prices for design/dev only.
// Phase 4 replaces this with the database-backed API (products, categories, images, inventory).
import { sareeArt } from '../lib/art';
import { hasPhoto } from '../lib/photos';

export type Collection = {
  slug: string;
  name: string;
  royalTitle?: string;
  kicker: string;
  blurb: string;
  palette: string;
  variant: number;
};
export type Product = {
  id: string; slug: string; name: string; fabric: string; collection: string; tags: string[];
  palette: string; variant: number; looks: string[]; price: number; mrp?: number; stock: number;
  isNew?: boolean; isBest?: boolean; desc: string;
  specs: { label: string; value: string }[];
  image: string; // swap for a real photo URL; gallery = images[]
  images: string[];
  real?: boolean; // true when real photos exist in /photos/products
};

export const COLLECTIONS: Collection[] = [
  { slug: 'wedding', name: 'Wedding Sarees', royalTitle: 'WEDDING EDIT', kicker: 'Bridal & festive', blurb: 'For the big day and beyond.', palette: 'maroon', variant: 1 },
  { slug: 'kanchipuram', name: 'Kanchipuram Sarees', royalTitle: 'KANCHIPURAM ICONS', kicker: 'Temple borders', blurb: 'Bold zari, heavy borders.', palette: 'crimson', variant: 1 },
  { slug: 'banarasi', name: 'Banarasi Sarees', royalTitle: 'BANARASI HEIRLOOMS', kicker: 'Brocade heirlooms', blurb: 'Kadhua and jamdani weaves.', palette: 'emerald', variant: 0 },
  { slug: 'party', name: 'Party Wear Sarees', royalTitle: 'FESTIVE RADIANCE', kicker: 'After dark', blurb: 'Shimmer, sequins, georgette.', palette: 'purple', variant: 0 },
  { slug: 'silk', name: 'Silk Sarees', royalTitle: 'ZARI SIGNATURES', kicker: 'Pure & lustrous', blurb: 'Rich silks for celebrations.', palette: 'rose', variant: 0 },
  { slug: 'traditional', name: 'Traditional Sarees', royalTitle: 'BRIDAL ÉLAN', kicker: 'Heritage weaves', blurb: 'Regional classics.', palette: 'mustard', variant: 1 },
  { slug: 'designer', name: 'Designer Sarees', royalTitle: 'DESIGNER SILHOUETTES', kicker: 'Modern drapes', blurb: 'Organza, net and ruffles.', palette: 'peacock', variant: 0 },
  { slug: 'cotton', name: 'Cotton Sarees', royalTitle: 'HERITAGE COTTON', kicker: 'Everyday ease', blurb: 'Breathable, easy to drape.', palette: 'indigo', variant: 1 },
];

// name, fabric, collection, palette, price, flags(n=new,b=best), mrp, stock, extra look palettes
type Row = [string, string, string, string, number, string, number?, number?, string[]?];
const ROWS: Row[] = [
  ['Kumkum Temple Border', 'Kanchipuram Silk', 'kanchipuram', 'crimson', 18900, 'nb', 21000, 8, ['emerald', 'purple']],
  ['Mayura Peacock Pallu', 'Kanchipuram Silk', 'kanchipuram', 'peacock', 21400, 'n', undefined, 5, ['crimson', 'mustard']],
  ['Rajahamsa Zari Weave', 'Kanchipuram Silk', 'kanchipuram', 'mustard', 24800, '', undefined, 0],
  ['Mango Motif Silk', 'Silk', 'silk', 'parrot', 12600, 'n', undefined, 12, ['rose']],
  ['Pavadai Glow Silk', 'Silk', 'silk', 'rose', 11800, 'b', 13500, 9],
  ['Gaja Border Silk', 'Silk', 'silk', 'maroon', 16200, '', undefined, 6, ['peacock']],
  ['Rani Brocade Banarasi', 'Banarasi Silk', 'banarasi', 'purple', 25800, 'n', undefined, 4],
  ['Kadhua Bloom Banarasi', 'Banarasi Silk', 'banarasi', 'emerald', 27500, 'b', undefined, 3, ['maroon', 'noir']],
  ['Ganga Jamdani Drape', 'Banarasi Silk', 'banarasi', 'ivory', 22400, '', undefined, 2],
  ['Tulsi Everyday Cotton', 'Cotton', 'cotton', 'indigo', 2400, 'n', undefined, 40],
  ['Kalamkari Breeze', 'Cotton', 'cotton', 'orange', 2900, 'b', 3400, 25, ['parrot']],
  ['Chettinad Check Cotton', 'Cotton', 'cotton', 'maroon', 2600, '', undefined, 18],
  ['Aurora Organza Bloom', 'Organza', 'designer', 'rose', 9800, 'n', undefined, 7, ['ivory', 'crimson']],
  ['Mirage Ruffle Georgette', 'Georgette', 'designer', 'peacock', 7200, '', undefined, 10],
  ['Noor Embroidered Net', 'Net', 'designer', 'ivory', 8900, 'b', undefined, 6, ['rose', 'noir']],
  ['Suhag Bridal Kanjivaram', 'Kanchipuram Silk', 'wedding', 'crimson', 38500, 'n', undefined, 3],
  ['Vivaah Gold Tissue', 'Tissue', 'wedding', 'mustard', 31200, 'b', 36000, 4],
  ['Swayamvar Zardozi', 'Banarasi Silk', 'wedding', 'maroon', 42000, '', undefined, 2],
  ['Sangeet Sequin Georgette', 'Georgette', 'party', 'purple', 6900, 'n', undefined, 14],
  ['Cocktail Noir Shimmer', 'Georgette', 'party', 'noir', 5400, '', undefined, 11],
  ['Diwali Gleam Silk', 'Silk', 'party', 'orange', 8200, 'b', 9500, 9],
  ['Gopuram Heritage', 'Silk', 'traditional', 'emerald', 14300, '', undefined, 7],
  ['Paithani Lotus Pallu', 'Silk', 'traditional', 'peacock', 19900, 'n', undefined, 5],
  ['Ikat Weave Classic', 'Cotton', 'traditional', 'parrot', 3600, '', undefined, 20],
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export let PRODUCTS: Product[] = ROWS.map((r, i) => {
  const [name, fabric, collection, palette, price, flags, mrp, stock = 5, extra = []] = r;
  const variant = i % 4;
  const art = sareeArt(palette, variant);
  const slug = slugify(name);
  const real = [`photos/products/${slug}.jpg`, ...[2, 3, 4].map((n) => `photos/products/${slug}-${n}.jpg`)].filter(hasPhoto);
  const img = real[0] || art;
  return {
    id: `P${String(i + 1).padStart(3, '0')}`, slug: slugify(name), name, fabric, collection,
    tags: [fabric.toLowerCase(), collection], palette, variant, looks: [palette, ...extra],
    price, mrp, stock, isNew: flags.includes('n'), isBest: flags.includes('b'),
    desc: `A ${fabric.toLowerCase()} saree in ${palette}. Sample description — replace with the product’s real details.`,
    specs: [
      { label: 'Fabric', value: fabric },
      { label: 'Length', value: '5.5 m (sample)' },
      { label: 'Blouse piece', value: 'Included (sample)' },
      { label: 'Care', value: 'Dry clean (sample)' },
    ],
    image: img, images: real.length ? real : [art, sareeArt(palette, (variant + 1) % 4), sareeArt(palette, (variant + 2) % 4)], real: real.length > 0,
  };
});

export function setLiveProducts(list: Product[]) {
  PRODUCTS = list;
}

export const byId = (id: string): Product => {
  return PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
};
export const inCollection = (slug: string) => (slug === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.collection === slug || p.tags.includes(slug)));
export const collectionBySlug = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);
