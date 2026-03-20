

# Phase 6: pr0ducent — Mega Comparison Engine, Social Layer & Monetization

## Overview

This phase transforms pr0ducent from a comparison tool into a full platform with:
1. Mega pricing/feature comparison table on homepage (all plans, promotions, credits, AI models used)
2. Value calculator with normalized "pr0ducent Value Index" score
3. Live pricing history dashboard
4. Social layer (comments, ratings, public runs feed)
5. "Runs Now" live feed tab (streaming free user prompts)
6. User dashboard (build history, scores, remix links)
7. Subscription tiers based on prompt credits
8. Auth gate (free prompt submission, registration required for results)
9. UI/UX fixes (compact HowItWorks, stronger prompt input, i18n fix, newsc0rp-style nav icons)
10. Blog integration on homepage (builder updates as blog posts + recent posts list)

---

## A. Quick UI/UX Fixes

### 1. Language detection fix
- Remove browser auto-detection from `detectLocale()` in `src/lib/i18n.tsx`
- Default always to `"en"` unless cookie/localStorage has explicit user choice
- Use cookie (`document.cookie`) instead of just localStorage for persistence

### 2. Compact HowItWorks
- Reduce padding from `py-16 md:py-24` to `py-8 md:py-12`
- Make cards horizontal (icon + text side-by-side) instead of vertical
- Single row on desktop, compact stack on mobile

### 3. Stronger prompt input
- Add `border-2 border-foreground/30` + `shadow-xl` to Textarea
- Increase contrast: `bg-card` (not `/80`), stronger focus ring `ring-foreground/40`

### 4. Nav icons (newsc0rp floating toolbar style)
- Add small illustrative emoji/icons next to each nav link label
- Map: Compare → ⚔️, Blog → 📰, Updates → 🔄, How It Works → 🧭, FAQ → ❓, Runs Now → 🔴
- Add floating bottom toolbar (from newsc0rp) for section navigation on homepage

### 5. Blog posts on homepage
- Show latest full blog post (builder update) as a featured card
- Show list of 5 recent posts below it
- Fetch from `blog_posts` table (status = 'published')

---

## B. Mega Builder Comparison Table (Homepage)

### New data model
Extend `builder_sync_data` or create `builder_pricing_plans` table:

```sql
CREATE TABLE builder_pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  plan_name TEXT NOT NULL, -- free, pro, team, enterprise
  monthly_price NUMERIC(10,2),
  annual_price NUMERIC(10,2),
  credits_included INTEGER,
  credit_unit TEXT, -- 'messages', 'generations', 'tokens', etc.
  overage_cost NUMERIC(10,4),
  features JSONB DEFAULT '[]',
  promo_active BOOLEAN DEFAULT false,
  promo_description TEXT,
  promo_expires_at TIMESTAMPTZ,
  ai_models TEXT[] DEFAULT '{}',
  dev_environment TEXT, -- 'VS Code fork', 'WebContainer', 'Cloud IDE', etc.
  languages_supported TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tool_id, plan_name)
);

CREATE TABLE builder_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  monthly_price NUMERIC(10,2),
  annual_price NUMERIC(10,2),
  credits_included INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT now()
);
-- Both public read, service-role write
```

### Table sections on homepage
1. **Plan tiers** — Free / Pro / Team / Enterprise rows per builder
2. **Credit economy** — credits included, credit unit, overage cost
3. **AI Models** — which models each builder uses (GPT-4o, Claude, Gemini, etc.)
4. **Dev environment** — WebContainer, Cloud IDE, VS Code fork, etc.
5. **Active promotions** — highlighted promo badges with expiry dates
6. **Feature matrix** — existing checkmarks expanded
7. **pr0ducent Value Index** — calculated score per plan

---

## C. pr0ducent Value Index (Calculator)

### Formula concept
A single normalized score (0-100) per plan that considers:

```
PVI = w1 * (credits / price) + w2 * features_score + w3 * speed_score + w4 * model_quality + w5 * ecosystem_score
```

Where:
- `credits/price` = cost efficiency (credits per dollar)
- `features_score` = count of features / total possible features * 100
- `speed_score` = normalized inverse of avg build time
- `model_quality` = weighted score based on AI models used (GPT-5 > GPT-4o > etc.)
- `ecosystem_score` = git + deploy + collaboration + backend presence

### Calculator page (`/calculator`)
- User selects: expected prompts/month, required features (checkboxes), preferred AI models
- Shows ranked results: "Best value for YOUR needs" with PVI scores
- Breakdown chart per builder showing where value comes from

---

## D. Daily Pricing Dashboard

### Route: `/pricing`
- Per-builder cards showing all plan tiers with current prices
- Price history chart (line chart, last 90 days) per builder
- Promotion alerts with countdown timers
- "Last synced" timestamp per builder
- Credit calculator: "With X prompts/month, you'd spend $Y at Builder Z"

### Sync enhancement
Update `sync-builder-data` edge function to also populate `builder_pricing_plans` and `builder_price_history` tables from Perplexity research.

---

## E. Social Layer

### New tables

```sql
CREATE TABLE run_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE builder_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tool_id, experiment_id)
);
```

### Components
- `RunComments` — comment thread under each public experiment
- `BuilderRatingStars` — star rating + optional review per builder per experiment
- Aggregate ratings shown on comparison table and builder cards

---

## F. "Runs Now" Live Feed

### Route: `/runs-now` (new tab in header)
- Real-time feed of all free-user experiments as they happen
- Shows: prompt (truncated), selected builders, status (running/completed), time elapsed
- Clicking a run → requires login to see results
- Uses Supabase Realtime subscription on `experiments` table (where `is_public = true`)

### Table modification
- Add `is_free_run BOOLEAN DEFAULT false` to experiments
- Enable realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE experiments;`

---

## G. Auth Gate: Free Prompt, Paid Results

### Flow change
1. Anyone can type a prompt and click "Run" — no login required
2. Experiment is created, runs start executing
3. When user tries to VIEW results → modal: "Sign up free to see your results"
4. After registration, results are linked to their account
5. Anonymous experiments stored with session ID, claimed on registration

### Implementation
- Store anonymous session ID in cookie
- On auth, migrate experiments from session to user
- `ComparisonCanvas` checks auth status before showing results

---

## H. User Dashboard (`/dashboard`)

### Sections
1. **Build History** — all past experiments with prompt, date, builders used, scores
2. **Builder Ratings** — user's ratings and reviews
3. **Remix Links** — for each completed run, deep link to builder's platform with referral tracking
4. **Credit Usage** — prompts used this month, remaining in plan
5. **Subscription Management** — current plan, upgrade CTA

---

## I. Subscription Tiers

### Plans

| Plan | Prompts/mo | Price | Features |
|------|-----------|-------|----------|
| Free | 3 | $0 | Single builder per run, delayed results |
| Pro | 30 | $9/mo | All builders, instant results, history |
| Business | 100 | $29/mo | Priority, API access, team sharing |

### New table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  prompts_used INTEGER DEFAULT 0,
  prompts_limit INTEGER DEFAULT 3,
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT now() + interval '30 days',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
```

### Enforcement
- Check prompt count before allowing new experiment
- Show upgrade modal when limit reached
- Referral links include `?ref=pr0ducent_<uid>` for affiliate tracking

---

## J. Implementation Order (Phases)

### Phase 6a (UI/UX + Foundation)
1. Fix i18n (no browser detection, cookie storage, default EN)
2. Compact HowItWorks section
3. Stronger prompt input styling
4. Nav icons + floating toolbar
5. Blog posts section on homepage

### Phase 6b (Data Layer)
6. DB migrations: `builder_pricing_plans`, `builder_price_history`, `run_comments`, `builder_ratings`, `subscriptions`
7. Update `sync-builder-data` to populate pricing tables
8. Seed initial pricing data for all 10 builders

### Phase 6c (Mega Comparison + Calculator)
9. Rebuild `BuilderComparisonTable` with plan-level pricing rows, AI models, promotions
10. Build PVI calculator page
11. Build pricing dashboard with history charts

### Phase 6d (Social + Live Feed)
12. Run comments + builder ratings components
13. "Runs Now" live feed page with realtime
14. Auth gate (free prompt, login for results)

### Phase 6e (User Dashboard + Subscriptions)
15. User dashboard page
16. Subscription system + prompt counting
17. Referral link generation with UID tracking

---

## Technical Notes

- PVI formula weights will be configurable via `builder_sync_data.raw_perplexity_response` metadata
- Price history uses daily snapshots from cron sync
- Realtime for "Runs Now" requires adding `experiments` to `supabase_realtime` publication
- Anonymous experiment claiming uses a `session_id` cookie + migration on signup
- All referral links use `?ref=pr0ducent_{user_id}` format matching existing `referral_clicks` table
- Subscription enforcement happens both client-side (UX) and via RLS policies (security)

