

# pr0ducent — Phase 5: Content Engine, Builder Sync Dashboard & Notifications

## Overview

This phase adds four major systems:
1. **AI Content Engine** (blog posts, social media, translations) powered by Claude Sonnet via Vercel AI SDK + Perplexity for research
2. **Builder Updates Dashboard** with daily cron sync of builder changelogs/pricing/features
3. **Enriched comparison table** with live-synced data and "last synced" timestamps
4. **User notification system** (opt-in alerts for builder updates)

---

## A. Prerequisites — API Keys & Connectors

1. **Claude Sonnet (Anthropic)**: Need `ANTHROPIC_API_KEY` — will ask user to provide it via `add_secret`
2. **Perplexity**: Already available in workspace (`perp_murd0ch`). Link to project via `connect` tool. Will be used in edge functions via `PERPLEXITY_API_KEY`
3. **LOVABLE_API_KEY**: Already available (for Lovable AI gateway as fallback)

---

## B. Database Schema (New Tables)

### `builder_sync_data`
Stores the latest synced info for each builder (pricing tiers, features, changelog entries, status).

```sql
CREATE TABLE builder_sync_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL UNIQUE,
  pricing_tiers JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  changelog JSONB DEFAULT '[]',
  official_url TEXT,
  docs_url TEXT,
  status TEXT DEFAULT 'active',
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  raw_perplexity_response JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- No RLS needed — public read, service-role write via edge functions
ALTER TABLE builder_sync_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read builder data" ON builder_sync_data FOR SELECT TO anon, authenticated USING (true);
```

### `blog_posts`
AI-generated blog content (articles, social posts).

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT DEFAULT 'blog',
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  ai_model_used TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published posts" ON blog_posts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins can manage posts" ON blog_posts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
```

### `notification_subscriptions`
User opt-in for builder update alerts.

```sql
CREATE TABLE notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_ids TEXT[] DEFAULT '{}',
  notify_changelog BOOLEAN DEFAULT true,
  notify_pricing BOOLEAN DEFAULT true,
  notify_blog BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subs" ON notification_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### `user_notifications`
Actual notifications delivered to users.

```sql
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON user_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON user_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;
```

---

## C. Edge Functions

### 1. `sync-builder-data` (Cron — daily)
- Uses **Perplexity** (`sonar-pro`) to research each builder's latest pricing, features, changelog
- Stores results in `builder_sync_data`
- Creates `user_notifications` for subscribed users when changes detected
- Triggered via `pg_cron` daily at 06:00 UTC

### 2. `generate-blog-post` (Admin-triggered or Cron)
- Uses **Claude Sonnet** (via Anthropic API with `ANTHROPIC_API_KEY`) for writing
- Uses **Perplexity** for research/fact-checking
- Flow: Perplexity researches topic → Claude writes SEO-optimized article → stores in `blog_posts`
- Supports categories: `blog`, `social_twitter`, `social_linkedin`, `comparison`
- Auto-generates PL translation using Claude

### 3. `translate-content` (On-demand)
- Takes any content + target language
- Uses Claude Sonnet for high-quality translation
- Updates `blog_posts` with translated versions (creates new row with same slug + language suffix)

---

## D. Frontend — New Pages & Components

### New Routes
- `/blog` — Blog listing page with published posts
- `/blog/:slug` — Individual blog post with SEO meta
- `/dashboard/updates` — Builder updates dashboard (all synced data)
- `/dashboard/notifications` — User notification center

### New Components
- `src/pages/Blog.tsx` — Blog listing with category filters
- `src/pages/BlogPost.tsx` — Single post with JSON-LD Article schema
- `src/pages/BuilderDashboard.tsx` — Rich dashboard showing:
  - Per-builder cards with pricing tiers, feature matrix, changelog timeline
  - "Last synced: X hours ago" badge per builder
  - Diff view highlighting what changed since last sync
- `src/components/NotificationBell.tsx` — Header bell icon with unread count, dropdown
- `src/components/NotificationSettings.tsx` — Opt-in toggles per builder + category
- `src/components/BuilderPricingGrid.tsx` — Detailed pricing comparison (free/pro/team/enterprise per builder)
- `src/components/BuilderChangelog.tsx` — Timeline of changes per builder

### Enhanced Comparison Table
- Replace hardcoded data in `BuilderComparisonTable` with live data from `builder_sync_data`
- Add pricing tier rows (Free, Pro, Team, Enterprise) with actual prices
- Add "Last synced" footer row
- Add expandable detail rows per builder

### Navigation Updates
- Add Blog + Dashboard links to header nav
- Add notification bell to header (authenticated users)

---

## E. Cron Setup

Use `pg_cron` + `pg_net` to call `sync-builder-data` daily:
```sql
SELECT cron.schedule(
  'daily-builder-sync',
  '0 6 * * *',
  $$ SELECT net.http_post(
    url := 'https://fhfkkxdjogkkobnsedyo.supabase.co/functions/v1/sync-builder-data',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <anon_key>"}'::jsonb,
    body := '{"trigger":"cron"}'::jsonb
  ) $$
);
```

---

## F. Implementation Order

1. **Connect Perplexity** to project + ask user for `ANTHROPIC_API_KEY`
2. **DB migrations** — all 4 new tables
3. **Edge function: `sync-builder-data`** — Perplexity research + store
4. **Edge function: `generate-blog-post`** — Claude writing + Perplexity research
5. **Edge function: `translate-content`** — Claude translation
6. **Cron job** — daily sync via pg_cron
7. **Frontend: Builder Dashboard** — `/dashboard/updates` with synced data
8. **Frontend: Enhanced Comparison Table** — live data from `builder_sync_data`
9. **Frontend: Blog pages** — `/blog` listing + `/blog/:slug` posts
10. **Frontend: Notifications** — bell, settings, realtime subscription
11. **Navigation & i18n** — add new routes to nav, translate new strings

---

## Technical Notes

- **Claude Sonnet** is called via `https://api.anthropic.com/v1/messages` with `ANTHROPIC_API_KEY` from edge functions — NOT through Lovable AI gateway (which doesn't support Anthropic models)
- **Perplexity** is called via `https://api.perplexity.ai/chat/completions` with `PERPLEXITY_API_KEY` from connector
- Blog posts stored in DB, not as static files — enables dynamic i18n and admin management
- `builder_sync_data` is the single source of truth for the comparison table — replaces hardcoded `tools.ts` data over time
- Realtime subscription on `user_notifications` for live bell updates

