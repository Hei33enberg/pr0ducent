

# Hotfix: Kill All Transparency — Solid UI

## Root Cause

The screenshot shows content bleeding through because multiple layers use semi-transparent backgrounds:

1. **`.page-frame`** — `background: hsla(0, 0%, 100%, 0.92)` (92% opacity) — the gradient-canvas shows through the entire page content area
2. **`.sticky-header`** — `hsla(30, 18%, 95%, 0.60)` with `backdrop-filter: blur(28px)` — bleeds through when scrolling
3. **`.header-glass`** — `background: transparent` — completely see-through
4. **`.nav-dropdown-glass`** — `hsla(30, 18%, 95%, 0.98)` — nearly solid but still leaks
5. **`.menu-overlay-mobile`** — `hsla(30, 18%, 95%, 0.97)` — same issue

## Fix

All five classes go fully opaque. Remove all `backdrop-filter` and `@supports` blocks.

### `src/index.css` changes:

| Selector | Before | After |
|----------|--------|-------|
| `.page-frame` | `hsla(0,0%,100%,0.92)` | `hsl(30, 20%, 97%)` (matches body bg) |
| `.sticky-header` | `hsla(30,18%,95%,0.92)` | `hsl(30, 18%, 95%)` |
| `@supports backdrop-filter` block | overrides to 0.60 + blur | **DELETE ENTIRE BLOCK** |
| `.sticky-header.menu-open` | separate override | **DELETE** (no longer needed) |
| `.header-glass` | `background: transparent` | `background: transparent` (keep — inherits from parent) |
| `.nav-dropdown-glass` | `hsla(..., 0.98)` + backdrop-filter | `hsl(30, 18%, 95%)`, no blur |
| `.menu-overlay-mobile` | `hsla(..., 0.97)` + backdrop-filter | `hsl(30, 18%, 95%)`, no blur |

### `src/components/PageFrame.tsx` changes:

- Remove `menu-open` class toggle (no longer needed since header is always solid)
- Simplify: `className={`sticky-header ${shouldHide ? 'header-hidden' : ''}`}`

### Files:
- `src/index.css` — make 5 selectors solid, delete `@supports` block and `.menu-open` override
- `src/components/PageFrame.tsx` — remove `menu-open` class logic

Zero backend changes. Zero component logic changes.

