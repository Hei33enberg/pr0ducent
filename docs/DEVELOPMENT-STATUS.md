# pr0ducent — Development Status

## Date

2026-03-20

## What Was Implemented

- Product messaging was aligned with current execution model:
  - `v0` runs are live.
  - other builders are benchmark profiles (same prompt + scoring model), not direct live integrations yet.
- Route `/compare` was wired and made first-class in navigation.
- i18n and brand consistency were improved:
  - removed trophy emoji from winner copy,
  - moved hardcoded footer and header labels into translation dictionaries,
  - localized v0 API timeout/failure messages via translation keys.
- Housekeeping updates:
  - package name changed to `pr0ducent`,
  - duplicate toast stack simplified to one runtime toaster (`sonner`) in app shell,
  - mock preview gradients switched from raw palette classes to semantic design tokens.

## Architecture Snapshot

- Frontend: React + TypeScript + Vite + Tailwind + shadcn/ui
- Data/Auth/Cloud: Supabase (Postgres, Auth, Edge Functions)
- Routing: `react-router-dom` with lazy route loading
- i18n: custom EN/PL dictionary context (`src/lib/i18n.tsx`)

## Current Execution Model (Important)

- Live generation integration: `v0` only (`run-on-v0` + `poll-v0-status`).
- Other builders are represented by benchmark/mock runs for side-by-side comparison UX.

## Files Updated In This Iteration

- `package.json`
- `src/App.tsx`
- `src/components/BuilderRatingStars.tsx`
- `src/components/Footer.tsx`
- `src/components/PageFrame.tsx`
- `src/hooks/useBuilderApi.ts`
- `src/lib/mock-experiment.ts`
- `src/locales/en.json`
- `src/locales/pl.json`
- `src/pages/Compare.tsx`

## Notes For Next Tasks

- If product direction changes toward fully live multi-builder orchestration, extend `useBuilderApi` with per-builder adapters and explicit status badges (`live`, `benchmark`, `coming soon`).
- If conversions matter on compare page, keep copy tightly synced with real backend capabilities to avoid trust drift.
