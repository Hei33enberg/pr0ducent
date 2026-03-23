# pr0ducent™

> AI Builder Comparison Platform — test, compare, and choose the best AI app builder for your project.

**Open source (MIT).** Fork, adapt, and plug in your own vibe‑AI apps — see [LICENSE](./LICENSE) and [CONTRIBUTING.md](./CONTRIBUTING.md). Production secrets and hosting stay on your side.

## What is pr0ducent?

pr0ducent lets you enter a prompt and run it through multiple AI builders simultaneously (Lovable, v0, Bolt, Cursor, Replit, and more). You get a side-by-side comparison with scores, pros/cons, generation time, and community ratings.

## Tech Stack

- **Frontend:** React 18 · TypeScript · Vite 8 · Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Auth:** Email/password via Supabase Auth
- **Copy:** English only (`src/locales/en.json` via `src/lib/copy.ts`)
- **Fonts:** Cormorant Garamond (headings) · Space Grotesk (body) · JetBrains Mono (code)

## Getting Started

```bash
npm install
npm run dev
```

## Performance

Front-end bundle, image, and motion conventions are documented in [`docs/PERFORMANCE.md`](./docs/PERFORMANCE.md).

## Project Structure

```
src/
├── components/     # UI components
│   └── ui/         # shadcn/ui primitives
├── config/         # Builder tools, prompt templates, features
├── hooks/          # Auth, API, mobile detection
├── lib/            # Utilities, copy loader, experiment services
├── locales/        # English UI strings (`en.json`)
├── pages/          # Route pages
├── types/          # TypeScript types
└── integrations/   # Supabase client & types

supabase/
├── functions/      # Edge functions (Deno)
└── config.toml     # Supabase configuration
```

## Design System

- **Aesthetic:** Warm high-end editorial ("newsc0rp")
- **Radius:** 0.125rem (sharp, editorial)
- **Colors:** Warm HSL neutrals with coral accent (4° 85% 65%)
- **Effects:** Glassmorphism, ambient gradient washes, subtle animations
- **Icons:** lucide-react only (no emoji)

## License

[MIT License](./LICENSE) — see the file for full text.

**Trademark:** The name *pr0ducent* and related branding may be subject to rights separate from the code license; do not imply endorsement when redistributing forks.
