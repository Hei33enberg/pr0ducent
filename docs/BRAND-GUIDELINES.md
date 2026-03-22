# pr0ducent™ — Brand Guidelines

## Logo

The pr0ducent™ wordmark uses **Cormorant Garamond Bold** with a distinctive oversized zero:

```
pr0ducent™
```

- The "0" is 1.6em (160% of base size), weight 800
- The "™" is 0.4em, weight 600, superscript, in Space Grotesk
- Letter-spacing: `-0.02em` on the zero
- Color: `text-foreground` (black in light mode)
- Never use a logo image — the wordmark is always rendered as styled text

### Logo Variants

| Context | Size | Implementation |
|---------|------|----------------|
| Header nav | `clamp(1.4rem, 2.5vw + 0.6rem, 2.2rem)` | Fluid responsive |
| Footer | `1.5rem` | Fixed |
| Favicon | `public/favicon.svg` (wordmark “0” on dark tile) | Also `favicon.ico` if present for legacy clients |

### Logo Don'ts

- Never change the typeface
- Never make the "0" the same size as other characters
- Never add color to individual characters
- Never use emoji or icons alongside the logo
- Never rotate or skew the logo

## Voice & Tone

### Personality

Professional, knowledgeable, trustworthy. Like a well-informed colleague who's tested everything and gives you straight answers.

### Do

- Be direct and specific
- Use data and comparisons
- Acknowledge trade-offs honestly
- Write concise, scannable copy

### Don't

- Use hyperbolic language ("revolutionary", "game-changing")
- Use buzzwords ("seamless", "unleash", "elevate")
- Talk down to users
- Make unsubstantiated claims
- Use emoji anywhere in the UI

## Color Usage

### Primary Palette

| Color | HSL | Use |
|-------|-----|-----|
| Black | `0 0% 0%` | Primary text, buttons, borders |
| White | `0 0% 100%` | Backgrounds, button text |
| Warm Off-White | `30 20% 97%` | Body background |
| Coral | `4 85% 65%` | Accent, CTAs, featured items |

### Supporting

| Color | HSL | Use |
|-------|-----|-----|
| Muted Gray | `0 0% 45%` | Secondary text |
| Light Gray | `0 0% 88%` | Borders |
| Warm Muted | `30 15% 97%` | Muted backgrounds |
| Green | `142 71% 45%` | Success states |
| Amber | `38 92% 50%` | Warning states |
| Red | `0 84% 60%` | Error/destructive |

### Gradient Washes (Background)

- **Peach:** `hsla(27, 95%, 75%, 0.45)` — top-left
- **Rose:** `hsla(343, 85%, 75%, 0.40)` — top-right
- **Gold:** `hsla(47, 95%, 75%, 0.35)` — bottom-center
- **Violet:** `hsla(260, 60%, 85%, 0.20)` — center (subtle)

## Typography

### Font Stack

```
Headings: 'Cormorant Garamond', Georgia, serif
Body:     'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif
Code:     'JetBrains Mono', monospace
```

### Font Loading

All fonts self-hosted as WOFF2 in `/public/fonts/`. `font-display: block` to prevent FOUT.
Latin + Latin Extended subsets supported.

## Photography & Imagery

- No stock photography
- Abstract ambient gradients for backgrounds
- Builder logos via Google favicon proxy or official assets
- Illustrations: minimal, geometric, editorial style
- Caricature founder image for hero section

## Spacing & Layout

- **Page frame:** Black 2px border, 20px radius, contains all content
- **Max width:** 1400px (page frame), 1280px (content)
- **Content margins:** `px-4 sm:px-6 md:px-8 lg:px-12`
- **Section rhythm:** Alternate padding values, never same vertically

## Component Patterns

### Buttons

- **Primary:** `bg-foreground text-background rounded-full px-6 py-2.5 text-xs font-semibold`
- **Ghost:** `hover:bg-foreground/5 rounded-lg`
- **Active state:** `scale-[0.98]` on press

### Cards

- Glass card style with semi-transparent white background
- Layered box-shadows (outer + inset)
- Shadow deepens on hover
- `rounded-xl` (12px)

### Navigation

- Sticky header with frosted glass effect
- Inherits page-frame border radius
- Desktop: inline nav links with lucide icons
- Mobile: hamburger → dropdown menu
