# pr0ducent™ — Design Tokens Reference

## CSS Custom Properties

Defined in `src/index.css` → `:root`

### Core

```
--background:          0 0% 100%
--foreground:          0 0% 2%
--card:                0 0% 100%
--card-foreground:     0 0% 0%
--popover:             0 0% 100%
--popover-foreground:  0 0% 0%
```

### Interactive

```
--primary:             0 0% 0%
--primary-foreground:  0 0% 100%
--secondary:           0 0% 96%
--secondary-foreground:0 0% 0%
--accent:              4 85% 65%        ← coral
--accent-foreground:   0 0% 100%
```

### Semantic

```
--success:             142 71% 45%
--success-foreground:  0 0% 100%
--warning:             38 92% 50%
--warning-foreground:  0 0% 100%
--destructive:         0 84% 60%
--destructive-foreground: 0 0% 100%
```

### Featured (builder highlight)

```
--featured:            4 85% 65%
--featured-foreground: 0 0% 100%
--featured-glow:       4 85% 65%
```

### Sidebar

```
--sidebar-background:  0 0% 98%
--sidebar-foreground:  0 0% 20%
--sidebar-primary:     0 0% 10%
--sidebar-border:      0 0% 85%
```

### Layout

```
--radius:              0.125rem         ← sharp editorial corners
--border:              0 0% 88%
--input:               0 0% 85%
--ring:                0 0% 0%
--muted:               30 15% 97%       ← warm off-white
--muted-foreground:    0 0% 45%
```

## Tailwind Mapping

| CSS Variable | Tailwind Class |
|-------------|----------------|
| `--background` | `bg-background` |
| `--foreground` | `text-foreground` |
| `--primary` | `bg-primary`, `text-primary` |
| `--accent` | `bg-accent`, `text-accent` |
| `--muted` | `bg-muted`, `text-muted-foreground` |
| `--border` | `border-border` |
| `--destructive` | `bg-destructive`, `text-destructive` |
| `--success` | `bg-success`, `text-success` |
| `--warning` | `bg-warning` |
| `--featured` | `bg-featured`, `text-featured` |

## Typography Scale

| Element | Font | Size | Weight | Tracking |
|---------|------|------|--------|----------|
| h1 | Cormorant Garamond | `text-4xl md:text-5xl` | 700 | `-0.02em` |
| h2 | Cormorant Garamond | `text-3xl md:text-4xl` | 700 | `-0.02em` |
| h3 | Cormorant Garamond | `text-2xl md:text-3xl` | 700 | `-0.02em` |
| Body | Space Grotesk | `text-sm` / `text-base` | 400 | normal |
| Label | Space Grotesk | `text-xs` | 600 | `tracking-wider` |
| Code | JetBrains Mono | `text-sm` | 400 | normal |

## Spacing Scale

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64` (px)

- Section padding: `py-16 md:py-24` (varies for rhythm)
- Component padding: `px-4 sm:px-6 md:px-8`
- Card padding: `p-5` or `p-6`
- Max content width: `max-w-5xl` (general), `max-w-3xl` (text-heavy)

## Border Radius

```
--radius: 0.125rem

lg: var(--radius)            = 0.125rem
md: calc(var(--radius) - 2px)
sm: calc(var(--radius) - 4px)
```

Override for specific components:
- Page frame: `20px` (large container)
- Glass cards: `rounded-xl` (12px)
- Buttons (pill): `rounded-full`
- Inputs: `rounded-lg`

## Shadow System

### Glass Card
```css
box-shadow:
  0 2px 12px hsla(0,0%,0%,0.04),
  0 8px 40px hsla(0,0%,0%,0.06),
  inset 0 1px 0 hsla(0,0%,100%,0.5);
```

### Glass Card (hover)
```css
box-shadow:
  0 4px 20px hsla(0,0%,0%,0.07),
  0 16px 56px hsla(0,0%,0%,0.10),
  inset 0 1px 0 hsla(0,0%,100%,0.7);
```

## Animation Tokens

| Name | Duration | Easing | Use |
|------|----------|--------|-----|
| Fade up | 250ms | ease-out | Scroll reveal |
| Stagger | 70ms intervals | — | Sequential children |
| Page transition | 300ms | default | Route changes |
| Wash drift 1 | 18s | ease-in-out | Background blob 1 |
| Wash drift 2 | 22s | ease-in-out | Background blob 2 |
| Wash drift 3 | 26s | ease-in-out | Background blob 3 |
| Pulse glow | 2s | ease-in-out | Featured badge |
| Status pulse | 1.5s | ease-in-out | Status indicators |
