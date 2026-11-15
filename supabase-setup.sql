-- ============================================================
-- AKASH SAREES — SUPABASE DATABASE SETUP SCRIPT
-- ============================================================

-- 1. Create Products Table
create table if not exists products (
  id text primary key,
  slug text,
  name text not null,
  fabric text not null,
  collection text not null,
  palette text default 'maroon',
  price numeric not null,
  mrp numeric,
  stock integer default 10,
  is_new boolean default false,
  is_best boolean default false,
  description text,
  image text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS & Policies
alter table products enable row level security;
drop policy if exists "Public view products" on products;
create policy "Public view products" on products for select using (true);
drop policy if exists "Allow all write products" on products;
create policy "Allow all write products" on products for all using (true) with check (true);

-- 2. Create Site Settings Table
create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table site_settings enable row level security;
drop policy if exists "Public view settings" on site_settings;
create policy "Public view settings" on site_settings for select using (true);
drop policy if exists "Allow all write settings" on site_settings;
create policy "Allow all write settings" on site_settings for all using (true) with check (true);

-- Initial Site Settings
insert into site_settings (key, value) values
  ('whatsapp_number', '+91 82206 23649'),
  ('announcement_1', '✦ NEW DROP ✦ UP TO 40% OFF ✦ FREE SHIPPING ALL OVER INDIA ✦'),
  ('announcement_2', 'Pure zari, tested and certified · Handwoven silk')
on conflict (key) do nothing;

-- 3. Initial Saree Catalog Insertion
insert into products (id, slug, name, fabric, collection, palette, price, mrp, stock, is_new, is_best, description, image) values
  ('P001', 'kumkum-temple-border', 'Kumkum Temple Border', 'Kanchipuram Silk', 'kanchipuram', 'crimson', 18900, 21000, 8, true, true, 'Authentic handwoven Kanchipuram silk saree with rich temple border.', 'photos/products/kumkum-temple-border.jpg'),
  ('P002', 'mayura-peacock-pallu', 'Mayura Peacock Pallu', 'Kanchipuram Silk', 'kanchipuram', 'peacock', 21400, null, 5, true, false, 'Royal peacock motifs with intricate gold zari weave.', 'photos/products/mayura-peacock-pallu.jpg'),
  ('P003', 'rajahamsa-zari-weave', 'Rajahamsa Zari Weave', 'Kanchipuram Silk', 'kanchipuram', 'mustard', 24800, null, 4, false, false, 'Heritage swan motifs woven with pure gold zari.', 'photos/products/rajahamsa-zari-weave.jpg'),
  ('P004', 'mango-motif-silk', 'Mango Motif Silk', 'Silk', 'silk', 'parrot', 12600, null, 12, true, false, 'Classic paisley and mango motifs on pure mulberry silk.', 'photos/products/mango-motif-silk.jpg'),
  ('P005', 'pavadai-glow-silk', 'Pavadai Glow Silk', 'Silk', 'silk', 'rose', 11800, 13500, 9, false, true, 'Subtle rose pink silk drape with soft luminous shine.', 'photos/products/pavadai-glow-silk.jpg'),
  ('P006', 'gaja-border-silk', 'Gaja Border Silk', 'Silk', 'silk', 'maroon', 16200, null, 6, false, false, 'Traditional elephant border design on rich maroon silk.', 'photos/products/gaja-border-silk.jpg'),
  ('P007', 'rani-brocade-banarasi', 'Rani Brocade Banarasi', 'Banarasi Silk', 'banarasi', 'purple', 25800, null, 4, true, false, 'Opulent royal brocade weave straight from Varanasi weavers.', 'photos/products/rani-brocade-banarasi.jpg'),
  ('P008', 'kadhua-bloom-banarasi', 'Kadhua Bloom Banarasi', 'Banarasi Silk', 'banarasi', 'emerald', 27500, null, 3, false, true, 'Mastercrafted kadhua floral jaal on emerald green silk.', 'photos/products/kadhua-bloom-banarasi.jpg'),
  ('P009', 'ganga-jamdani-drape', 'Ganga Jamdani Drape', 'Banarasi Silk', 'banarasi', 'ivory', 22400, null, 2, false, false, 'Delicate jamdani weave on pristine ivory raw silk.', 'photos/products/ganga-jamdani-drape.jpg'),
  ('P010', 'tulsi-everyday-cotton', 'Tulsi Everyday Cotton', 'Cotton', 'cotton', 'indigo', 2400, null, 40, true, false, 'Lightweight, breathable pure cotton saree for comfortable everyday wear.', 'photos/products/tulsi-everyday-cotton.jpg'),
  ('P011', 'kalamkari-breeze', 'Kalamkari Breeze', 'Cotton', 'cotton', 'orange', 2900, 3400, 25, false, true, 'Artisanal hand-painted kalamkari floral drapes.', 'photos/products/kalamkari-breeze.jpg'),
  ('P012', 'chettinad-check-cotton', 'Chettinad Check Cotton', 'Cotton', 'cotton', 'maroon', 2600, null, 18, false, false, 'Traditional vibrant checks with temple borders from Chettinad.', 'photos/products/chettinad-check-cotton.jpg'),
  ('P013', 'aurora-organza-bloom', 'Aurora Organza Bloom', 'Organza', 'designer', 'rose', 9800, null, 7, true, false, 'Contemporary ethereal organza saree with delicate floral embroidery.', 'photos/products/aurora-organza-bloom.jpg'),
  ('P014', 'mirage-ruffle-georgette', 'Mirage Ruffle Georgette', 'Georgette', 'designer', 'peacock', 7200, null, 10, false, false, 'Playful tiered ruffles in deep peacock blue.', 'photos/products/mirage-ruffle-georgette.jpg'),
  ('P015', 'noor-embroidered-net', 'Noor Embroidered Net', 'Net', 'designer', 'ivory', 8900, null, 6, false, true, 'Exquisite sequins and threadwork on soft ivory net.', 'photos/products/noor-embroidered-net.jpg'),
  ('P016', 'suhag-bridal-kanjivaram', 'Suhag Bridal Kanjivaram', 'Kanchipuram Silk', 'wedding', 'crimson', 38500, null, 3, true, false, 'The quintessential grand South Indian bridal silk saree.', 'photos/products/suhag-bridal-kanjivaram.jpg'),
  ('P017', 'vivaah-gold-tissue', 'Vivaah Gold Tissue', 'Tissue', 'wedding', 'mustard', 31200, 36000, 4, false, true, 'Gleaming gold metallic tissue saree woven with pure silk warp.', 'photos/products/vivaah-gold-tissue.jpg'),
  ('P018', 'swayamvar-zardozi', 'Swayamvar Zardozi', 'Banarasi Silk', 'wedding', 'maroon', 42000, null, 2, false, false, 'Heavy handcrafted zardozi embroidery on deep maroon banarasi.', 'photos/products/swayamvar-zardozi.jpg'),
  ('P019', 'sangeet-sequin-georgette', 'Sangeet Sequin Georgette', 'Georgette', 'party', 'purple', 6900, null, 14, true, false, 'Dazzling dual-tone sequins designed for evening celebrations.', 'photos/products/sangeet-sequin-georgette.jpg'),
  ('P020', 'cocktail-noir-shimmer', 'Cocktail Noir Shimmer', 'Georgette', 'party', 'noir', 5400, null, 11, false, false, 'Sophisticated black georgette saree with metallic border.', 'photos/products/cocktail-noir-shimmer.jpg'),
  ('P021', 'diwali-gleam-silk', 'Diwali Gleam Silk', 'Silk', 'party', 'orange', 8200, 9500, 9, false, true, 'Festive orange silk saree with shimmering golden threadwork.', 'photos/products/diwali-gleam-silk.jpg'),
  ('P022', 'gopuram-heritage', 'Gopuram Heritage', 'Silk', 'traditional', 'emerald', 14300, null, 7, false, false, 'Timeless temple gopuram motifs on emerald green silk.', 'photos/products/gopuram-heritage.jpg'),
  ('P023', 'paithani-lotus-pallu', 'Paithani Lotus Pallu', 'Silk', 'traditional', 'peacock', 19900, null, 5, true, false, 'Authentic Paithani silk weave featuring the sacred lotus pallu.', 'photos/products/paithani-lotus-pallu.jpg'),
  ('P024', 'ikat-weave-classic', 'Ikat Weave Classic', 'Cotton', 'traditional', 'parrot', 3600, null, 20, false, false, 'Geometric resist-dyed ikat patterns on handloom cotton.', 'photos/products/ikat-weave-classic.jpg')
on conflict (id) do nothing;
