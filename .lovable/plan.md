

# Plan: Menu Design Overhaul — newsc0rp Style

## Problem

Current pr0ducent menu uses tiny Lucide SVG icons (generic line icons) with no subtitles. The newsc0rp reference uses **hand-drawn sketch-style emblem images** (48-56px) with bold labels + subtitle descriptions, creating a rich editorial feel. Current menu looks bare and unfinished.

## What needs to change

### 1. Generate hand-drawn sketch icons for each nav item

The newsc0rp project uses AI-generated monochrome ink sketch illustrations as menu emblems. pr0ducent needs the same treatment — 9 unique icons generated and saved to `src/assets/nav-icons/`:

| Nav Item | Icon concept |
|----------|-------------|
| Home | Blueprint sketch of a house/building facade |
| Arena | Sketch of crossed swords / colosseum |
| Leaderboard | Sketch of a trophy / podium chart |
| Compare | Sketch of a compass / side-by-side scales |
| Calculator | Sketch of an abacus / mechanical calculator |
| Pricing | Sketch of price tags / coins stack |
| Blog | Sketch of a newspaper / printing press |
| Runs Now | Sketch of a radio tower / broadcast antenna |
| FAQ | Sketch of a question mark magnifying glass |
| Marketplace | Sketch of a market stall / shopping bag (if FF enabled) |

Style: "Monochrome black ink lines, engineering sketch style, technical blueprint, clean detailed line art, cross-hatching for shadows, no text, no labels, no color, high contrast black on white, transparent background."

These will be generated via the Lovable AI image generation model (`google/gemini-3.1-flash-image-preview`) and saved as PNG files.

### 2. Add subtitles to each nav item

Following the newsc0rp pattern, each menu item gets a short subtitle:

| Item | Subtitle |
|------|----------|
| Home | Back to main |
| Arena | Head-to-head battles |
| Leaderboard | Builder rankings |
| Compare | Side-by-side tools |
| Calculator | ROI estimator |
| Pricing | Plans & billing |
| Blog | News & insights |
| Runs Now | Live experiments |
| FAQ | Common questions |
| Marketplace | Templates & remixes |

### 3. Refactor PageFrame menu rendering

- Change `navLinks` to include `subtitle: string` and `emblem: string` (imported image) instead of `icon: LucideIcon`
- Menu item layout: `img` (48x48 emblem) + stacked `label` (bold uppercase) + `subtitle` (muted small text)
- Exactly matches newsc0rp pattern from lines 211-224

### 4. Hamburger animation (CSS lines → animated X)

Replace the Lucide `<Menu>` / `<X>` toggle with the newsc0rp animated 3-line hamburger using CSS transforms (rotate on open).

### 5. Menu open/close animation

Add `scaleY` transition from newsc0rp instead of abrupt show/hide:
```css
transform: menuOpen ? "scaleY(1)" : "scaleY(0)"
opacity: menuOpen ? 1 : 0
transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease
```

### 6. Mobile menu — full-screen overlay

On mobile (`sm:hidden`), use a full-screen overlay with larger icons (64px), single-column layout, and sticky CTA button at bottom — matching newsc0rp's `menu-overlay-mobile` pattern.

## Files to create/edit

| File | Action |
|------|--------|
| `src/assets/nav-icons/*.png` | Create ~10 generated sketch icons |
| `src/components/PageFrame.tsx` | Major refactor: emblem images, subtitles, hamburger animation, mobile overlay |
| `src/index.css` | Add `menu-overlay-mobile` styles, refine `.nav-dropdown-glass` transition |

## What stays the same

- Nav links list (routes, labels, translations)
- Logo component
- Auth section (account/sign-out/get started)
- Overall page-frame structure
- Backend — zero changes

