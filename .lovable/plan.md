

# pr0ducent -- Full Audit & Development Plan

## Current State Summary

The app is an "AI builder comparator" -- user enters a prompt, it runs through multiple AI app builders (v0, Lovable, Bolt, etc.) and shows side-by-side results. Currently: editorial design with Cormorant Garamond + Space Grotesk, warm coral palette, page frame with border, sticky glass header, caricature illustration. Backend on Lovable Cloud with experiments/runs/profiles tables. Only v0 integration is live; other builders use mock data with hardcoded scores.

---

## A. DESIGN / UI / UX AUDIT

### Issues Found

1. **Inconsistent branding**: Auth page (`/auth`) and Compare page (`/compare`) still show old "PromptLab" branding with `Beaker` icon instead of pr0ducent logo
2. **Public experiment page** (`/experiment/:id`) also uses old branding
3. **No footer** anywhere -- missing legal, links, social, newsletter
4. **No mobile hamburger menu** -- header only has logo + CTA, no navigation links
5. **Missing "About" / "How it works" section** on homepage
6. **Missing pricing/value prop section** for the platform itself
7. **No 404 page** styled to match brand (exists but likely default)
8. **Copy is mixed PL/EN** -- some UI in Polish (CanvasFilters, GuestLimitModal, WinnerBanner, ShareButton, Auth), rest in English. No i18n system.
9. **No loading states** for initial page load (auth check)
10. **Comparison table** has no responsive solution -- just horizontal scroll with no indicator on mobile
11. **ExperimentHistory** section always shows even when empty for logged-in users (shows Polish empty state)
12. **No dark mode** despite `darkMode: ["class"]` in Tailwind config
13. **Trust bar** ("Real prototypes, not mockups") could be stronger with actual numbers/logos

### Missing Sections (Homepage)

- "How it works" (3-step explainer)
- Social proof / logos of supported builders
- Testimonials / press mentions placeholder
- FAQ section
- Footer with links, legal, social

### Navigation

- No main nav beyond logo + auth CTA
- Missing links: Compare, About, Pricing, Blog (future)
- Mobile: needs collapsible menu

---

## B. COPY & i18n

### Current Problem
Mixed Polish/English throughout. No translation system.

### Plan
1. Create `src/lib/i18n.ts` with a simple key-value translation system (React context + hook)
2. Support `en` and `pl` initially, with language auto-detect from browser + manual toggle
3. Extract all hardcoded strings into translation keys
4. Files affected: every component with user-facing text (~15 files)

---

## C. SEO / GEO / AEO

### SEO
1. **Meta tags**: Update `index.html` with proper OG tags, canonical URL
2. **Per-route meta**: Add `react-helmet-async` for dynamic `<title>` and `<meta>` per route
3. **Structured data**: Extend JSON-LD on `/compare` with `SoftwareApplication` schema for each builder
4. **Sitemap**: Generate `public/sitemap.xml` with all static routes
5. **robots.txt**: Already exists and is good
6. **SEO landing pages**: Create `/compare/lovable-vs-v0`, `/compare/lovable-vs-cursor` etc. as static routes with rich content and JSON-LD

### GEO (Generative Engine Optimization)
1. Add FAQ schema markup (FAQPage JSON-LD) for common questions
2. Structure content with clear H1-H3 hierarchy answering "what is the best AI app builder"
3. Add "People also ask" style expandable FAQ section

### AEO (Answer Engine Optimization)
1. Featured snippet-optimized content blocks on `/compare`
2. Concise definition paragraphs at top of comparison pages
3. Table markup with clear headers for comparison matrices

---

## D. SCORING SYSTEM -- The Core Feature Redesign

### Current Problem
Scores are **completely fake** -- hardcoded per builder in `mock-experiment.ts` with +/-5 random noise. This is the biggest integrity issue in the entire product.

### Proposed Architecture: AI-Powered Scoring Orchestra

```text
User Prompt
    |
    v
[Edge Function: orchestrate-scoring]
    |
    +---> [1] Send prompt to each builder API
    |         (v0 already done, extend to others)
    |
    +---> [2] Collect outputs (code, preview URL, files)
    |
    +---> [3] AI Scoring Pipeline (edge function: score-build)
    |         |
    |         +---> Agent 1: UI/UX Analyzer
    |         |     - Screenshot the preview URL
    |         |     - Send screenshot to Gemini vision model
    |         |     - Evaluate: layout, spacing, typography, 
    |         |       color harmony, responsiveness, accessibility
    |         |     - Output: uiQuality score + reasoning
    |         |
    |         +---> Agent 2: Code Quality Analyzer  
    |         |     - Parse generated files/code
    |         |     - Send to AI with rubric:
    |         |       TypeScript usage, error handling,
    |         |       component structure, backend completeness
    |         |     - Output: backendLogic score + reasoning
    |         |
    |         +---> Agent 3: Speed Benchmarker
    |         |     - Measure actual time-to-first-prototype
    |         |     - Normalize against baseline
    |         |     - Output: speed score (objective, no AI needed)
    |         |
    |         +---> Agent 4: Editability Assessor
    |               - Evaluate code readability, modularity
    |               - Check for hardcoded values, config patterns
    |               - Output: easeOfEditing score + reasoning
    |
    +---> [4] Aggregate scores, store in DB
    |         - Each score includes AI reasoning (transparency)
    |         - Store raw AI responses for audit trail
    |
    +---> [5] Return to frontend via realtime subscription
```

### Implementation Steps

1. **New DB table**: `scoring_results` with columns: `run_id`, `dimension` (ui/backend/speed/editing), `score` (0-100), `reasoning` (text), `model_used`, `raw_response` (jsonb), `created_at`
2. **Edge function `score-build`**: Takes builder output (code + screenshot URL) and runs it through Lovable AI (Gemini 2.5 Pro for vision analysis of screenshots, Gemini Flash for code analysis)
3. **Scoring rubric config**: `src/config/scoring-rubric.ts` with detailed criteria per dimension, versioned
4. **Transparency UI**: Each score in the UI becomes clickable, showing the AI's reasoning
5. **Fallback**: If real API integration not available for a builder, show "Estimated score" badge with lower confidence indicator

### Scoring Dimensions (Expanded)

| Dimension | Method | Source |
|-----------|--------|--------|
| UI Quality | Vision AI on screenshot | Gemini Pro |
| Code Quality | Code analysis | Gemini Flash |
| Backend Completeness | Code + feature detection | Gemini Flash |
| Speed | Wall-clock measurement | Objective |
| Editability | Code structure analysis | Gemini Flash |
| Deployment Ready | Check for deploy config | Heuristic |
| Accessibility | Lighthouse-style checks | Heuristic + AI |

### Anti-Bias Measures
- Rotate prompt order sent to AI scorer
- Include builder name only after scoring (blind evaluation)
- Log all raw AI responses for auditability
- Version the scoring rubric; show which version was used

---

## E. BUILDER INTEGRATIONS

### Currently Live
- **v0**: Full async API integration with polling

### Priority Queue (per memory: v0, Lovable, Floot, Orchids)
1. **Lovable**: Use Lovable API (needs research on programmatic access)
2. **Floot**: Needs API investigation
3. **Orchids**: Needs API investigation
4. **Bolt.new**: WebContainer API investigation

For builders without APIs: clearly label as "Community Score" based on historical data, not live generation.

---

## F. IMPLEMENTATION PLAN (Ordered)

### Phase 1: Foundation (Steps 1-4)
1. **Unify branding** -- Update Auth, Compare, PublicExperiment, NotFound pages to use pr0ducent brand + PageFrame
2. **Add i18n system** -- Create translation context, extract strings, add PL/EN toggle to header
3. **Add missing homepage sections** -- "How it works", builder logos bar, FAQ, footer
4. **Fix navigation** -- Add nav links to header, mobile hamburger menu

### Phase 2: SEO & Discoverability (Steps 5-6)
5. **SEO infrastructure** -- react-helmet-async, sitemap.xml, JSON-LD schemas, canonical URLs
6. **SEO landing pages** -- `/compare/lovable-vs-v0` etc. with rich comparison content

### Phase 3: Scoring System (Steps 7-10)
7. **DB migration** -- Create `scoring_results` table with RLS
8. **Edge function `score-build`** -- AI scoring pipeline using Lovable AI (Gemini models)
9. **Scoring rubric config** -- Detailed criteria per dimension
10. **Scoring transparency UI** -- Clickable scores showing AI reasoning, confidence badges

### Phase 4: Polish (Steps 11-12)
11. **Responsive audit** -- Fix mobile layouts, comparison table UX
12. **Loading states & error handling** -- Skeleton screens, proper error boundaries

---

## Technical Details

### i18n approach
Simple React context with `useTranslation()` hook returning `t(key)` function. JSON dictionaries in `src/locales/en.json` and `src/locales/pl.json`. No heavy library needed for 2 languages.

### Scoring edge function
Uses Lovable AI gateway (`LOVABLE_API_KEY` already available). Two calls per build:
- Vision call (Gemini 2.5 Pro) with screenshot for UI scoring
- Text call (Gemini Flash) with code for backend/editability scoring

### New DB table
```sql
CREATE TABLE scoring_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_run_id UUID NOT NULL,
  dimension TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  reasoning TEXT,
  confidence REAL DEFAULT 0.8,
  model_used TEXT,
  rubric_version TEXT DEFAULT 'v1',
  raw_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Files to create
- `src/lib/i18n.tsx` -- i18n context + hook
- `src/locales/en.json`, `src/locales/pl.json` -- translations
- `src/components/Footer.tsx` -- site footer
- `src/components/HowItWorks.tsx` -- 3-step explainer
- `src/components/FAQ.tsx` -- expandable FAQ with JSON-LD
- `src/components/BuilderLogosBar.tsx` -- trust/social proof
- `src/components/LanguageToggle.tsx` -- PL/EN switch
- `src/components/MobileMenu.tsx` -- hamburger nav
- `src/config/scoring-rubric.ts` -- scoring criteria
- `src/components/ScoreDetail.tsx` -- transparency UI for scores
- `supabase/functions/score-build/index.ts` -- AI scoring
- SEO comparison pages as route components

### Files to modify
- `src/components/PageFrame.tsx` -- add nav, language toggle, mobile menu
- `src/pages/Auth.tsx` -- rebrand to pr0ducent
- `src/pages/Compare.tsx` -- rebrand, enhance SEO
- `src/pages/PublicExperiment.tsx` -- rebrand
- `src/pages/NotFound.tsx` -- brand-consistent 404
- `src/components/ComparisonCanvas.tsx` -- integrate real scoring UI
- `src/components/ToolDetailPanel.tsx` -- show AI reasoning
- `src/App.tsx` -- wrap with i18n provider, add new routes
- `index.html` -- enhanced meta tags
- `src/lib/mock-experiment.ts` -- replace hardcoded scores with scoring service calls

