DROP YOUR REAL PHOTOS / VIDEO HERE, then run:  node build.mjs   (Netlify: set build command to that)

HERO  (photos/hero/)
  shop.jpg      photo of your shop interior (wide, landscape, at least 1920px) -> becomes the "walk into the shop" zoom
  shop.mp4      optional: a short walk-through video of the shop (muted, 8-15 s, under ~8 MB) -> plays over shop.jpg
  model-1.jpg, model-2.jpg, model-3.jpg   landscape photos of women wearing your sarees (only use photos you own
                or have written permission/licence to use, including the model's consent)
  Anything missing is simply skipped; the 3D silk scenes always remain.

PRODUCTS  (photos/products/)
  <product-slug>.jpg          main photo, e.g.  kumkum-temple-border.jpg
  <product-slug>-2.jpg, -3.jpg, -4.jpg   extra angles
  Slugs are the product names in lower-case with dashes (see src/data/catalog.ts).
  In Phase 4 the admin dashboard uploads these instead.

Tip: compress images (JPG ~250-400 KB hero, ~120 KB product) for fast mobile loading.
