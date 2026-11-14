# Akash Sarees Shop — cinematic frontend (Phase 2–3)

Reference: a saree-store site recorded on video. Structure and motion were recreated; its name, photos and copy were NOT reused.

## Hero: 3D showroom walk-in (new)
`src/lib/showroom.ts` — a procedural 3D saree showroom in hand-written WebGL (no photos needed): marble floor, saree-stacked shelves, white display tables, mannequins, glowing ceiling, branded back wall.
Sequence: paisley cloth covers the screen -> lifts away -> camera walks in automatically -> scroll to keep walking to the back wall (hero is pinned for 3 screens).
If you add `photos/hero/shop.mp4` or `shop.jpg`, the real footage replaces the 3D scene automatically. Without WebGL it falls back to the layered placeholder.
Mannequin sprites and back-wall text come from `art.ts` / `site.wordmark`. Captions: `site.hero.walkCaptions`.

## Run
    node build.mjs          # builds dist/ (esbuild + React)
    cd dist && python3 -m http.server 5173     # open http://localhost:5173
Or open `dist/` on any static host (Netlify etc.).

## Your real photos (women models, shop video)
Put files in `photos/` (see `photos/README.txt`), run `node build.mjs`, done — no code edits.
- `photos/hero/shop.jpg` / `shop.mp4` → the "walk into the shop" zoom (a placeholder shop interior is drawn until you add yours)
- `photos/hero/model-1.jpg`, `model-2.jpg`, `model-3.jpg` → real model photos with a slow cinematic zoom
- `photos/products/<product-slug>.jpg` (+ `-2.jpg`, `-3.jpg`) → product photos
Use only photos you own or have licensed, with the models' permission.

## What is real
- **WebGL cloth** (`src/lib/cloth.ts`): displaced mesh, analytic normals, pleats + wind, silk sheen, metallic zari, pointer-driven light, scroll-driven camera, crossfading colourways. Hero + footer. Falls back to a gradient without WebGL; freezes on reduced-motion; pauses off-screen; lighter mesh on mobile.
- Curved 3D rails, pinned scroll scene, arch cut-outs, wavy section edges, masked text reveals, page-bend on scroll velocity.
- Working: cart (persisted in localStorage, qty, subtotal), wishlist, quick view, search, filters, mobile menu, policy modals.

## What is NOT done yet (honest list)
- **Stack deviation:** npm registry was blocked in the build sandbox, so no Three.js / R3F / Drei / GSAP / Lenis / Vite / Tailwind. The 3D is hand-written WebGL. `cloth.ts` + `ClothCanvas.tsx` are isolated so they can be swapped for R3F.
- **Imagery is procedural placeholder art** (`src/lib/art.ts`). Replace via the `image`/`images` fields in `src/data/catalog.ts` (admin upload in Phase 4).
- **Catalogue is sample data** (`src/data/catalog.ts`) incl. prices. Phase 4 replaces it with a database + API.
- No backend: checkout, online payment (Razorpay planned, server-side verification), COD orders, accounts, admin, order tracking, newsletter storage, product pages and a dedicated shop page are Phase 4. Buttons that need the backend say so instead of faking success.
- No 3D product viewer (no real GLB models exist); a gallery is used instead.
- Business details (phone, address, socials, shipping fee, policies) are empty in `src/config/site.ts` and hidden until filled.
- Google Fonts are loaded from the CDN (Cormorant Garamond, Anton, Manrope, Caveat).
