# pr0ducent™

> AI Builder Comparison Platform — test, compare, and choose the best AI app builder for your project.

## What is pr0ducent?

pr0ducent lets you enter a prompt and run it through multiple AI builders simultaneously (Lovable, v0, Bolt, Cursor, Replit, and more). You get a side-by-side comparison with scores, pros/cons, generation time, and community ratings.

## Tech Stack

- **Frontend:** React 18 · TypeScript · Vite 8 · Tailwind CSS
- **Backend:** Lovable Cloud (Supabase)
- **Auth:** Email/password via Supabase Auth
- **i18n:** English & Polish
- **Fonts:** Cormorant Garamond (headings) · Space Grotesk (body) · JetBrains Mono (code)

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/     # UI components
│   └── ui/         # shadcn/ui primitives
├── config/         # Builder tools, prompt templates, features
├── hooks/          # Auth, API, mobile detection
├── lib/            # Utilities, i18n, experiment services
├── locales/        # EN/PL translation files
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

Proprietary. All rights reserved.
