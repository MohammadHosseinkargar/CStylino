# Performance Checklist

## Before / After Notes

- Before: App-wide client boundary via `components/providers.tsx` in root layout; most pages marked `use client`.
- Before: Heavy client deps in global layouts (framer-motion, gsap, react-query, leaflet).
- Before: Leaflet CSS imported in client map; needs to be scoped to tracking page only.
- Before: Product images have fallback logic, but many pages are still client-only.
- After: Root layout no longer wraps the entire app in client providers; public pages render as Server Components.
- After: React Query and Session providers are scoped per-page or to storefront chrome.
- After: Added short-lived LRU caches + cache headers for tracking, products, categories, and settings APIs.
- After: Image sizing hints added for fill images; placeholder fallback normalized for local product paths.

## Commands Used

- `npm i -D @next/bundle-analyzer`
- `npm i -D @types/leaflet`
- `npm i sharp`
- `ANALYZE=true npm run build`

## Bundle Analysis (Before)

- `static/chunks/6535-*.js` (~170 KB parsed): `framer-motion` + Radix; pulled by `components/storefront/header.tsx`.
- `static/chunks/d0deef33.*.js` (~148 KB parsed): `leaflet` core; pulled by `components/customer/tracking-map.tsx`.
- `static/chunks/c15bf2b0-*.js` (~51 KB parsed): `gsap`; pulled by `components/storefront/store-landing-page.tsx`.
- `static/chunks/7762-*.js` (~83 KB parsed): `react-hook-form` + `zod`; pulled by checkout and admin forms.
- `static/chunks/1713-*.js` (~9 KB parsed): `@tanstack/react-query`; pulled by pages using `useQuery`.
