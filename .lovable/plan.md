
# pr0ducent — Project Plan

## Overview

**pr0ducent™** is an AI builder comparison platform. Users enter a prompt, select AI builders (Lovable, v0, Bolt, Cursor, Replit, etc.), and get a side-by-side comparison of generated outputs — scores, pros/cons, time-to-prototype, and community ratings.

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite 8 |
| Styling | Tailwind CSS 3 + custom CSS utilities |
| State | React Query (server) + useState (local) |
| Backend | Lovable Cloud (Supabase) |
| Auth | Supabase Auth (email/password) |
| Database | PostgreSQL via Supabase |
| Edge Functions | Deno (Supabase Edge Functions) |
| i18n | Custom React context (EN/PL) |
| Routing | React Router v6 (lazy-loaded) |

---

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Index | Hero + comparison + calculator + FAQ + blog |
| `/auth` | Auth | Login/signup |
| `/pricing` | Pricing | Plans & pricing |
| `/calculator` | Calculator | PVI cost calculator |
| `/blog` | Blog | AI-generated blog posts |
| `/blog/:slug` | BlogPost | Single post |
| `/builders` | BuildersIndex | All builders listing |
| `/builders/:id` | BuilderProfile | Individual builder profile |
| `/runs-now` | RunsNow | Public experiments feed |
| `/experiment/:id` | PublicExperiment | Shared experiment view |
| `/dashboard` | UserDashboard | User account |
| `/dashboard/updates` | BuilderDashboard | Builder sync updates |
| `/dashboard/notifications` | Notifications | User notifications |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `experiments` | User comparison experiments |
| `experiment_runs` | Individual builder runs per experiment |
| `builder_results` | Raw API results from builders |
| `builder_ratings` | Community ratings per builder |
| `builder_pricing_plans` | Pricing data per builder |
| `builder_price_history` | Historical pricing snapshots |
| `builder_sync_data` | Synced builder metadata |
| `blog_posts` | AI-generated blog content |
| `profiles` | User profiles |
| `subscriptions` | User subscription plans |
| `user_roles` | Admin/moderator/user roles |
| `user_notifications` | In-app notifications |
| `notification_subscriptions` | Notification preferences |
| `run_comments` | Comments on experiments |
| `referral_clicks` | Affiliate referral tracking |

---

## Edge Functions

| Function | Purpose |
|----------|---------|
| `run-on-v0` | Send prompt to v0 API |
| `poll-v0-status` | Poll v0 generation status |
| `sync-builder-data` | Sync builder metadata via AI |
| `generate-blog-post` | Generate blog content via AI |
| `cron-blog-generator` | Scheduled blog generation |
| `translate-content` | Translate content EN↔PL |
| `create-checkout` | Stripe checkout session |
| `stripe-webhook` | Stripe webhook handler |

---

## Key Components

| Component | Role |
|-----------|------|
| `PageFrame` | App shell with nav, logo, mobile menu |
| `HeroSection` | Prompt input + tool selection + templates |
| `ComparisonCanvas` | Side-by-side builder results |
| `BuilderComparisonTable` | Builder comparison cards |
| `FeatureMatrix` | Feature support matrix |
| `PlanComparisonTable` | Pricing plans comparison |
| `InlineCalculator` | Cost calculator widget |
| `FAQ` | FAQ accordion with JSON-LD |
| `AmbientBackground` | Animated gradient background |

---

## Supported Builders

Lovable, Replit, Vercel v0, Cursor, Base44, Antigravity, Build0, Orchids, Floot, Bolt.new

---

## Implementation Status

- [x] Navigation & logo fixes
- [x] Builder logos (Google favicon proxy)
- [x] Mock experiment generator
- [x] Seed example experiments
- [x] Builder comparison table
- [x] Feature matrix
- [x] Pricing plans table
- [x] Inline calculator
- [x] Builder profiles & index
- [x] Blog system (AI-generated)
- [x] Social features (ratings, comments)
- [x] RunsNow feed with filters
- [x] Auth system
- [x] i18n (EN/PL)
- [x] Lazy loading all routes
- [ ] Real v0 API integration (partial)
- [ ] Cron jobs (sync + blog)
- [ ] Stripe payments (partial)
