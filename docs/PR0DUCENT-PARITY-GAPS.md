# pr0ducent vs murd0ch / p0xi — parity gaps (balanced)

**Status:** Living checklist. Goal: the same **interaction + rhythm** as the newsc0rp shell, not 1:1 content or IA.

**Canonical brand / tokens (stajnia):** master reference in newsc0rp — [`newsc0rp-main/src/styles/design-tokens.md`](../../newsc0rp-main/src/styles/design-tokens.md) (relative link works when `newsc0rp-main` is a sibling folder of `pr0ducent-main` in the workspace).

---

## Menu: murd0ch vs pr0ducent (metryki)

| Element | murd0ch (`newsc0rp-main/src/pages/Index.tsx`) | pr0ducent (`src/components/PageFrame.tsx`) | Notes |
|---------|-----------------------------------------------|--------------------------------------------|--------|
| Header horizontal padding | `px-4 sm:px-6 md:px-8 lg:px-12` | `px-5 sm:px-6 md:px-8 lg:px-12` | Slightly more inset on small screens so logo clears `page-frame` corner radius |
| Header row height | `h-12 sm:h-14 md:h-16` | Same | — |
| Logo link | Plain `<a>`, flex, no `h-full` stretch | `py-1`, `self-center`, no `h-full` | Avoids logo “stuck” to top border |
| CTA + hamburger gap | `gap-2.5` | `gap-2.5` | Aligned |
| Dropdown emblem size | `w-12 h-12 sm:w-14 sm:h-14` (48–56px) | **48px** (desktop grid), **56px** (mobile overlay) | IA differs (more items); sizes match emblem scale |
| Dropdown grid gap | `gap-1` in murd0ch | `gap-2` | Room for larger icons |
| Blur policy | Sticky / dropdown / overlay | Same classes in `src/index.css` | Avoid stacking `backdrop-filter` on every card — shell only |

---

## Hero / LP

| Topic | Status | Follow-up |
|-------|--------|-----------|
| Gradient washes (`hero-wash--*`) | Done | — |
| Caricature scale / max-height | Tuned (`max-h` tiers: mobile `60vh`, sm `70vh`, md+ `78vh`) | Regressions: check very short viewports |
| IllustDivider + MP4 loops between sections | **Next** | Port `IllustDivider` + storage URLs pattern from newsc0rp LP |
| Section spacing / `parity-section-sep` | Done (CSS separator after hero on `Index`) | Optional: more separators between major blocks |

---

## Animacje — inventory

| Mechanism | Where | Engine | Reduced motion |
|-----------|-------|--------|----------------|
| Sticky header hide/show | `PageFrame` | JS scroll + CSS transition | Yes (simplified transform in `index.css`) |
| Menu dropdown open | `PageFrame` | Inline `scaleY` / `opacity` / `maxHeight` | — |
| Mobile overlay enter | `.menu-overlay-mobile` | CSS `@keyframes menu-overlay-in` | Disabled when `prefers-reduced-motion` |
| Hero washes | `.hero-wash--*` | CSS `animation` (drift) | Gated in `index.css` |
| Caricature | `.illust-float` | CSS keyframes | Gated |
| LP separator | `.parity-section-sep` | CSS gradient + optional breathe | Breathe off when reduced motion |
| Fade-up sections | `.fade-up` | CSS | — |
| Builder panel expand | `HeroSection` | **Framer Motion** `AnimatePresence` | Consider respecting `prefers-reduced-motion` in a later pass |
| Staggered nav rows on open | Not implemented | Optional CSS `animation-delay` on children | Low priority; keep GPU-light |

**Policy:** LP marketing = prefer **CSS-first**; app-like interactions may use Framer sparingly.

---

## Done (recent remediation)

| Area | What shipped |
|------|----------------|
| Sticky header | `top` offsets, `@supports(backdrop-filter)`, `.sticky-header.header-hidden` |
| Page shell | `page-frame` margins, warm `hsla` background |
| Desktop menu | `.menu-dropdown`, `maxHeight` / `overflowY`, transitions |
| Mobile overlay | Fixed, `z-index`, blur budget on small screens |
| Scroll hide | Threshold `8`, show when `y < 100` |
| Nav emblem scale | 48 / 56px aligned to murd0ch dropdown |
| Hero geometry | Tighter grid gap, `items-start md:items-center`, smaller margin to prompt block |
| Perf | Nav PNGs `lazy`; hero `eager` + `fetchPriority="high"` |

## Next (higher effort / content)

| Priority | Gap | Suggested follow-up |
|----------|-----|---------------------|
| P1 | Illustrated section dividers + optional MP4 | `IllustDivider` from newsc0rp; Supabase storage for clips |
| P2 | WebP/AVIF for `nav-icons` | Build pipeline or `?format=webp` |
| P2 | Framer + `prefers-reduced-motion` in `HeroSection` | Match `index.css` behavior |
| P3 | Floating toolbar on LP | Only if IA needs persistent anchors |

---

## Asset loading map

| Asset | Policy | Rationale |
|-------|--------|-----------|
| Hero caricature | `eager`, `fetchPriority="high"` | LCP |
| `PageFrame` nav icons | `lazy` | Many files; menu not always open |
| Below-fold tables / logos | `lazy` (default) | Perf |

## Reduced motion

Sticky, overlay, `.menu-dropdown` solid fallback, `.parity-section-sep` breathe, `illust-*`, hero washes — see [`src/index.css`](../src/index.css).

## References

- murd0ch: `newsc0rp-main/src/pages/Index.tsx`, `newsc0rp-main/src/index.css`
- pr0ducent: `src/components/PageFrame.tsx`, `src/components/HeroSection.tsx`, `src/index.css`, `src/pages/Index.tsx`
- Shared design system: `newsc0rp-main/src/styles/design-tokens.md`
