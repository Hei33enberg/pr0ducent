# pr0ducent vs murd0ch / p0xi — parity gaps (balanced)

**Status:** Living checklist after the 2026-03 “balanced parity” remediation. Goal: same **interaction + rhythm** as the newsc0rp shell, not 1:1 content or IA.

## Done (this iteration)

| Area | What shipped | Notes |
|------|----------------|-------|
| Sticky header | Tighter `top` offsets, `@supports(backdrop-filter)` glass, `.sticky-header.header-hidden` with opacity + translate | Matches murd0ch `Index` / `index.css` behavior |
| Page shell | `page-frame` margins `mx-2 …`, warm `hsla` background | Closer to murd0ch geometry; less “air” than old `mx-5 my-5` |
| Desktop menu | `.menu-dropdown` + `maxHeight` / `overflowY` + delayed `max-height` transition | Prevents clipped tall menus |
| Mobile overlay | `position: fixed`, `z-index: 10000`, blur with **reduced blur on ≤480px** + `prefers-reduced-motion` fallback | Mobile blur budget |
| Scroll hide | Threshold `8`, direction ref, show when `y < 100` | murd0ch `Index` logic |
| Landing rhythm | `.parity-section-sep` after hero (CSS gradient + optional breathe) | Low-risk IllustDivider-style separator |
| Perf | Nav PNGs `loading="lazy"`; hero caricature `eager` + `fetchPriority="high"` | Above-fold vs menu icons |

## Next (higher effort / content)

| Priority | Gap | Suggested follow-up |
|----------|-----|---------------------|
| P1 | **Illustrated section dividers** (static PNG + optional MP4 loops) between major LP blocks | Reuse `IllustDivider` pattern from newsc0rp; host short loops in Supabase storage like murd0ch |
| P1 | **Hero / nav asset hierarchy** — murd0ch uses larger emblem grid in dropdown; pr0ducent has **more nav rows** (different IA) | Optional size pass on `nav-icons` (44px+) without crowding the grid |
| P2 | **Motion library** — murd0ch LP uses more staggered reveals; pr0ducent relies on `fade-up` + Framer in places | Extend `fade-up` / section observers or keep CSS-only for perf |
| P2 | **WebP/AVIF for nav icons** | Pipeline: `?format=webp` or build step; keep PNG fallbacks if needed |
| P3 | **Floating toolbar** — murd0ch has `FloatingToolbar` on LP; pr0ducent differs by product | Only if IA warrants persistent anchors |

## Asset loading map (policy)

| Asset | Policy | Rationale |
|-------|--------|-----------|
| Hero caricature (`caricature-founder-nobg.png`) | `eager`, `fetchPriority="high"` | LCP / above-fold |
| `PageFrame` nav icons (`src/assets/nav-icons/*.png`) | `lazy` | Below fold until menu opens; many files |
| Builder logos / tables | Default `lazy` (browser) unless already optimized | Below-fold grids |

## Reduced motion

- `prefers-reduced-motion`: sticky transition simplified; menu overlay animation off; `.menu-dropdown` falls back to solid fill; `.parity-section-sep` animation off; existing `illust-*` keyframes already gated in `index.css`.

## References

- murd0ch shell: `newsc0rp-main/src/pages/Index.tsx`, `newsc0rp-main/src/index.css` (`.sticky-header`, `.menu-dropdown`, `.menu-overlay-mobile`)
- pr0ducent: `src/components/PageFrame.tsx`, `src/index.css`, `src/pages/Index.tsx`
