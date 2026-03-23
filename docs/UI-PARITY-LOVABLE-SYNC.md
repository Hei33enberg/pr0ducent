# UI parity — sync with Lovable / murd0ch (status 2026-03)

This document **does not replace** [BRAND-GUIDELINES.md](./BRAND-GUIDELINES.md) or [DESIGN-TOKENS.md](./DESIGN-TOKENS.md); it describes **what is already on `main` after recent Lovable merges** and **what we closed with Cursor** so the “pr0ducent vs murd0ch” plan is enforceable.

## Recent Lovable changes (short notes from `main` history)

Recent commits include *Overhauled layout and navigation*, *Layout and UI polish*, *Align UI to murd0ch frame*. The repo now includes:

| Area | What shipped |
|------|----------------|
| **Frame / nav** | `PageFrame` — illustrated nav icons (`src/assets/nav-icons/*.png`), layout aligned with “glass + page-frame” |
| **Brand** | `BrandText.tsx` — wordmark with enlarged digit + optional ™ |
| **Landing rhythm** | `Index.tsx` — sections in `section-gradient-*` / `section-wash-*`, `BigHeadline`, rhythm across alternating backgrounds |
| **Illustrations** | `IllustDivider.tsx`, `useInView` — pattern like murd0ch (lazy / fade) |
| **CSS** | Extended `index.css` (wash variants, dark / gradient sections) |
| **App.css** | Cleaned of Vite boilerplate (only what is needed remains) |

## “UI vs murd0ch” plan matrix — status

| Element | murd0ch / plan | pr0ducent (current) |
|---------|----------------|---------------------|
| HSL tokens in `:root` | Yes | Yes — `src/index.css` |
| `gradient-canvas` + `page-frame` | Yes | Yes — `AmbientBackground`, `PageFrame` |
| `BrandText` | Yes | Yes |
| Sections with alternating rhythm | Yes | Yes — landing + `section-*` classes |
| Floating toolbar (LP scrollspy) | Yes (large LP) | No — product uses hamburger + routing; **intentional** |
| Asset generation pipeline (fal/Kling) | Yes in newsc0rp | Out of scope for pr0ducent; hero uses static caricature |
| **How it works** on home | Was in older layout | Restored in `Index` (footer `#how-it-works` works) |
| Brand favicon | Target: own | `public/favicon.svg` + link in `index.html` |
| `prefers-reduced-motion` for illustrations | Good practice | Rules in `index.css` for `.illust-*` |

## Definition of Done — new UI sections (short)

1. Colors: **`hsl(var(--…))` / Tailwind classes** (`text-foreground`, `bg-muted`, …), not raw hex in components (exceptions: e.g. gradient defined in CSS).
2. Headings: **brand serif** from global rules; in `.section-dark*` sections text contrast per tokens.
3. Sections: one of the **canonical surface classes** (`section-gradient-peach`, `section-wash-teal`, `section-dark`, … — see `index.css`).
4. Illustration animations: **`.illust-float`** etc.; respect **reduced motion**.
5. Wordmark: **`BrandText`**, not manual `span` (except migrating old files).

Fuller list: [DESIGN-TOKENS.md](./DESIGN-TOKENS.md) (*Compliance* section).

## Lovable Cloud verification (operator snapshot)

Below: typical audit result when Lovable checks **actual schema state** vs **44 files** in `supabase/migrations/`.  
**Note:** `supabase_migrations.schema_migrations` may show **different timestamps in names** than GitHub files if migrations were once pasted manually or applied with another tool — **the team’s source of truth is the repo + object match** (tables, RPC, MV), not only rows in `schema_migrations`.

| Area | Expected state (aligned with `main`) |
|------|--------------------------------------|
| **Migrations / schema** | Objects from 44 migrations present: `run_jobs`, `run_tasks`, `run_events`, broker pool / lease, BYOA + RPC, `builder_rate_limits`, `builder_try_dispatch_slot`, MV `builder_leaderboard`, arena / benchmark, etc. |
| **Builder config** | v0: enabled, tier 1; replit: ready, disabled until real API; rest benchmark / disabled per seeds |
| **Edge `config.toml`** | e.g. `dispatch-builders` JWT, `process-task-queue` without JWT (service role), `pbp-webhook` per repo |
| **Secrets** | At least `SUPABASE_SERVICE_ROLE_KEY`, `V0_API_KEY`, Stripe/Perplexity as needed, `EDGE_ALLOWED_ORIGINS` |
| **Frontend** | Build OK → **Publish** in Lovable |

If the audit confirms objects and secrets, **Publish the app** is a sensible next step; after publish run a short smoke (signed-in user → run, queue does not stick in `queued`).

## Prompt for Lovable operator (cloud Supabase + deploy)

**Paste in Lovable after Pull from GitHub and before Publish** if this release touches **backend** or you are unsure cloud is in sync with `main`:

```text
You are the Lovable operator for pr0ducent (frontend on Lovable, Supabase in the cloud).

1) Repo: in the Lovable project, Sync / Pull from GitHub `main` so it matches origin/main.

2) Supabase (cloud) — migrations:
   - Open SQL migrations from the repo: folder supabase/migrations/ in timestamp order.
   - Run on the Lovable-linked Supabase project ALL migrations that are not yet applied (do not skip orchestrator / VBP if they are on main).
   - After migrations: verify tables run_tasks, run_jobs, builder_integration_config, etc. match docs/ORCHESTRATOR.md and docs/DEVELOPMENT-STATUS.md.

3) Edge Functions — redeploy if they changed in this release:
   - Required when queue changes: process-task-queue (service role), dispatch-builders.
   - If webhooks: pbp-webhook.
   - Check supabase/config.toml (verify_jwt) for each function after deploy.

4) Secrets: ensure Supabase Functions have at least SUPABASE_SERVICE_ROLE_KEY, and builder keys per docs (V0_API_KEY etc.).

5) Frontend: npm run build locally or build in Lovable without errors; Publish hosting.

6) Smoke: signed-in user → run builder comparison; verify run_tasks leave queued (worker / inline fallback per docs/QUEUE-OBSERVABILITY.md).
```

Deploy details and checklists: [LOVABLE-PUBLISH-CHECKLIST.md](./LOVABLE-PUBLISH-CHECKLIST.md), [SPRINT-CLOSE.md](./SPRINT-CLOSE.md), [DEVELOPMENT-STATUS.md](./DEVELOPMENT-STATUS.md).
