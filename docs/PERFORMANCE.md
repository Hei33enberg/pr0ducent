# Frontend performance (pr0ducent)

Operational rules for bundle size, images, and motion. **Shared shell / tokens** with murd0ch live in [`newsc0rp-main/src/styles/design-tokens.md`](../../newsc0rp-main/src/styles/design-tokens.md) (§15 links here for product-specific perf notes).

## Parity audit (newsc0rp-main vs pr0ducent)

| Area | murd0ch (newsc0rp LP) | pr0ducent |
|------|------------------------|-----------|
| Below-fold LP sections | `React.lazy` + `Suspense` on [`Index.tsx`](../../newsc0rp-main/src/pages/Index.tsx) | Same pattern on [`src/pages/Index.tsx`](../src/pages/Index.tsx) |
| Hero images | [`vite-imagetools`](https://github.com/JonasKruckenberg/imagetools) + query params (e.g. `?format=webp&w=…`) | Same plugin in [`vite.config.ts`](../vite.config.ts); caricature import uses WebP pipeline |
| Vendor chunks | `manualChunks` in Vite | Mirrored policy; split `react` / `recharts` / `framer-motion` (see `vite.config.ts`) |
| Builder profile charts | N/A (no equivalent page) | `recharts` loaded via lazy [`BuilderProfileCharts`](../src/components/BuilderProfileCharts.tsx) |

## Lazy boundaries

- Keep **above-the-fold** on `/` eager: [`HeroSection`](../src/components/HeroSection.tsx), [`ComparisonCanvas`](../src/components/ComparisonCanvas.tsx) when a run is active.
- Lazy-load marketing sections below the hero: builder comparison, feature matrix, plans, calculator, FAQ, blog strip, history, footer — see `Index.tsx`.

## Images

- Prefer **WebP** via `vite-imagetools` imports; set explicit **`width` / `height`** on `<img>` where possible (LCP).
- Large PNGs should not ship untransformed.

## Bundles

- Run `npm run build` and inspect `dist/assets/*.js` names/sizes after changing dependencies or lazy boundaries.
- **recharts** is heavy; keep it out of the initial `/` chunk (only `BuilderProfile` route loads charts).

## Motion / a11y

- Respect **`prefers-reduced-motion`** in [`HeroSection`](../src/components/HeroSection.tsx): Framer transitions degrade to static layout when reduced motion is requested.
- Infinite CSS animations are gated in [`src/index.css`](../src/index.css) where applicable.

## Optional checks

- Lighthouse locally: Chrome DevTools → Lighthouse → Mobile.
- Playwright smoke: `npm run test:e2e` (if configured for your env).
