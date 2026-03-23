# Shared “stable” — shell (murd0ch · p0xi · pr0ducent)

One visual language (typography, tokens, `page-frame` shell, glass, wash-e, header), **different content layouts** per product LP.

## Sources of truth

| What | Where |
|------|--------|
| Tokens, multi-product section | `newsc0rp-main/src/styles/design-tokens.md` (sibling repo) |
| pr0ducent — CSS / components | [`NEWSCORP-DESIGN-SYSTEM.md`](./NEWSCORP-DESIGN-SYSTEM.md), [`DESIGN-TOKENS.md`](./DESIGN-TOKENS.md), [`src/index.css`](../src/index.css) |
| Parity and gaps (checklist) | [`PR0DUCENT-PARITY-GAPS.md`](./PR0DUCENT-PARITY-GAPS.md) |
| LP smoke checklist | [`LP-CHECKLIST.md`](./LP-CHECKLIST.md) |

## Shared guidelines (shell)

- **Page frame:** `page-frame` — outer margins, rounding, warm background; do not break chips or the input with random `min-h` on the hero grid.
- **Header:** same height scale as murd0ch LP — `h-12 sm:h-14 md:h-16`, horizontal padding `px-4 sm:px-6 md:px-8 lg:px-12`, subtle `border-b` / `section-divider` when the menu is closed.
- **Logo (pr0ducent):** `BrandText` in header — **same clamp as murd0ch Index:** `clamp(1.6rem, 2.5vw + 0.8rem, 2.4rem)`; `header` variant: digit **1.8em**, ™ **0.4em`, digit `line-height` **0.8**.
- **CTA “Get Started”:** like murd0ch header: `px-4 md:px-6 py-2 md:py-2.5 text-[11px] sm:text-xs`, `rounded-full`, sans semibold.
- **Hamburger:** hit area **`w-8 h-8`**; icon **20×12px** (lines **1.5px**), X animation with **±5.5px** offset — see `.hamburger-*` in `src/index.css`.
- **Menu:** `gap-2.5` between CTA and hamburger; emblems in ~48px (desktop) / ~56px (mobile overlay) grid — see parity doc.
- **Hero — shared:** wash-e (`.hero-wash--*`), serif on H1, gradient accent on key title fragment, breathing room under sticky (`scroll-mt` on section). **Hero illustration:** static (like murd0ch `HeroSection`); **no** `illust-float` — that class stays for other blocks (e.g. `IllustDivider` in newsc0rp), not the main portrait.
- **Sections below hero (murd0ch-style):** no icons on `h1`/`h2`; order **eyebrow** (uppercase, `tracking-[0.18em]`, `text-muted-foreground`) → **large serif title** (`clamp` ~2.5–5rem) → **subtitle** sans in muted color.

## Product split (LP)

| Product | First-screen intent |
|---------|---------------------|
| **murd0ch** | Story-first: narrative, large illustration, CTA after context |
| **pr0ducent** | Prompt-first: headline + short copy, then **chips + field + builders** — illustration supports, does not block action |

On mobile **pr0ducent** keeps order: **headline → caricature → chips → field** (`order-*` grid in `HeroSection.tsx`). **Prompt chips:** `flex flex-wrap` — **no** horizontal scroll/swipe; on narrow widths they wrap to the next row (no `overflow-x-auto`).

## pr0ducent — reference metrics (code)

- **H1:** `font-size: clamp(2.65rem, 5.5vw + 0.95rem, 5.85rem)`, `leading-[0.9]`.
- **Caricature:** `object-contain object-bottom`, `max-w` / `max-h` limits per breakpoint (incl. `sm`…`xl`), no artificial `min-h` on the illustration column — so chips are not pushed down on short viewports.

When you change these values: sync the entry in [`PR0DUCENT-PARITY-GAPS.md`](./PR0DUCENT-PARITY-GAPS.md) and run smoke from [`LP-CHECKLIST.md`](./LP-CHECKLIST.md).
