# pr0ducent™ — Project Knowledge

> Paste this file into Lovable → Settings → Manage Knowledge

---

## Brand Identity

**Name:** pr0ducent™ (lowercase, zero instead of "o", trademark symbol)
**Tagline:** Compare AI builders. Choose the best tool for your project.
**Domain:** pr0ducent.lovable.app
**Language:** Bilingual — English (default) + Polish

---

## Visual System

### Aesthetic

"Warm high-end editorial" — inspired by premium print magazines. Clean, sophisticated, with warmth. Not cold-tech, not playful-startup. Think: Monocle meets Product Hunt.

### Typography

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Headings | Cormorant Garamond | 400, 600, 700 | All h1–h6 elements, brand logotype |
| Body | Space Grotesk | 400, 500, 600, 700 | All body text, UI labels, buttons |
| Code | JetBrains Mono | — | Code snippets, monospace data |

**Rules:**
- Headings: `font-serif`, `font-bold`, `tracking-tight`, `letter-spacing: -0.02em`
- Body: `font-sans`, antialiased
- Never use headings font for body text or vice versa
- `text-wrap: balance` on headings, `pretty` on body

### Color Palette (HSL)

| Token | Light Mode Value | Role |
|-------|-----------------|------|
| `--background` | `0 0% 100%` | Page background |
| `--foreground` | `0 0% 2%` | Primary text |
| `--primary` | `0 0% 0%` | Buttons, interactive |
| `--primary-foreground` | `0 0% 100%` | Text on primary |
| `--secondary` | `0 0% 96%` | Secondary surfaces |
| `--muted` | `30 15% 97%` | Muted backgrounds |
| `--muted-foreground` | `0 0% 45%` | Secondary text |
| `--accent` | `4 85% 65%` | Coral accent |
| `--accent-foreground` | `0 0% 100%` | Text on accent |
| `--border` | `0 0% 88%` | Borders |
| `--success` | `142 71% 45%` | Success states |
| `--warning` | `38 92% 50%` | Warning states |
| `--destructive` | `0 84% 60%` | Error/delete |
| `--featured` | `4 85% 65%` | Featured builder highlight |
| `--radius` | `0.125rem` | Border radius (sharp) |

**Body background override:** `hsl(30, 20%, 97%)` — warm off-white

**Rules:**
- Never use raw hex/rgb colors in components
- Always use semantic Tailwind tokens: `text-foreground`, `bg-muted`, `text-accent`, etc.
- All colors must be HSL
- Coral accent for CTAs and highlights only — not for large surfaces

### Iconography

- **Library:** lucide-react (SVG icons only)
- **ABSOLUTE BAN on emoji** — no emoji anywhere in the UI
- Icon sizes: `w-3.5 h-3.5` (nav), `w-4 h-4` (standard), `w-5 h-5` (mobile)

### Effects & Surfaces

| Effect | Implementation |
|--------|---------------|
| Glass card | `.glass-card` — semi-transparent white, blur, layered shadows |
| Page frame | `.page-frame` — 2px black border, 20px radius, white bg |
| Sticky header | `.sticky-header` — frosted glass with backdrop-filter |
| Ambient background | CSS radial gradients (peach, rose, gold, violet) |
| Section gradients | `.section-gradient-peach`, `-rose`, `-gold` |
| Dark sections | `.section-dark` with `.dot-grid-bg` |

### Animation

- Scroll reveal: `.fade-up` + `.visible` (translateY 10px, 250ms ease-out)
- Stagger: `.stagger-0` through `.stagger-3` (70ms intervals)
- Background: `wash-drift-1/2/3` (18–26s infinite)
- Illustration: `illust-rotate` (120s), `illust-float` (10s), `illust-pulse` (8s)
- Page transitions: framer-motion AnimatePresence (opacity + translateY, 300ms)

---

## Architecture Rules

### Component Patterns

- Small, focused components (single responsibility)
- shadcn/ui primitives in `src/components/ui/`
- Custom components in `src/components/`
- Pages in `src/pages/`
- All routes lazy-loaded with `React.lazy()` + `<Suspense>`

### State Management

- Server state: `@tanstack/react-query`
- Local UI state: `useState`
- Auth context: `useAuth()` hook
- i18n context: `useTranslation()` hook

### Data Flow

- Supabase client: `import { supabase } from "@/integrations/supabase/client"`
- NEVER edit `src/integrations/supabase/client.ts` or `types.ts`
- NEVER edit `.env`
- Edge functions in `supabase/functions/`

### Builder Config

All builder tools defined in `src/config/tools.ts` with:
- `id`, `name`, `logoUrl`, `featured`, `strengths`, `description`
- `mockDelayRange`, `stack`, `hosting`, `pricing`, `category`
- Lovable is the only `featured: true` builder

---

## Content & Copy Rules

- Bilingual: all user-facing text via `t("key")` from `src/lib/i18n.tsx`
- Translation files: `src/locales/en.json` + `src/locales/pl.json`
- Professional tone — not casual, not corporate
- No buzzwords ("revolutionize", "seamless", "unleash")
- Data should look organic (not round numbers like "10x" or "99.9%")

---

## SEO

- Title: `<60 chars` with keyword
- Meta description: `<160 chars`
- Single `<h1>` per page
- Semantic HTML
- JSON-LD for FAQ pages
- Lazy loading images
- `robots.txt` and `sitemap.xml` in `/public`

---

## Supported Builders (10)

Lovable (featured), Replit, Vercel v0, Cursor, Base44, Antigravity, Build0, Orchids, Floot, Bolt.new

---

## Key Pages

| Page | Purpose |
|------|---------|
| Homepage (`/`) | Hero prompt, comparison table, feature matrix, pricing, calculator, FAQ, blog |
| Runs Now (`/runs-now`) | Public experiments feed with filters + community ratings |
| Builder profiles (`/builders/:id`) | Individual builder details |
| Blog (`/blog`) | AI-generated articles about builders |
| Calculator (`/calculator`) | PVI cost comparison calculator |
| Pricing (`/pricing`) | Subscription plans |

---

## Backend orchestration (technical)

- **Docs:** `docs/ORCHESTRATOR.md` (flow, tables, adapters), `docs/DEVELOPMENT-STATUS.md` (migrations, functions, secrets), `docs/SPRINT-CLOSE.md` (deploy/smoke prompts).
- **Live builder:** v0 via `dispatch-builders` + `poll-v0-status`; other tools benchmark until new adapters ship.

---

## Do NOT

- Use emoji in the UI (lucide-react icons only)
- Use raw colors (always semantic tokens)
- Edit `client.ts`, `types.ts`, or `.env`
- Store roles on profiles table (separate `user_roles` table)
- Use anonymous signups
- Auto-confirm email signups unless explicitly asked
- Use inline styles for colors (use Tailwind classes)
