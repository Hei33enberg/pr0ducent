# Antigravity — after Pull/Publish to production

Run after PM/Lovable publishes frontend synced with `main`.

## Feature flags

In the hosting panel (Lovable / Vercel) check values:

- `VITE_FF_MARKETPLACE` — should Marketplace be visible to users?
- `VITE_FF_MULTI_BUILDER_STREAM` — multi-builder stream in canvas.
- `VITE_FF_BYOA` — BYOA tab in dashboard.

Source of truth in code: [`src/lib/featureFlags.ts`](../src/lib/featureFlags.ts).

## Functionality

1. **Home — signed in:** one v0 run; tiles and Realtime without console errors.
2. **GuestOrchestrationBanner:** copy and visibility per PM intent.
3. **Claim / handoff:** CTA does not sit empty — hides until backend returns `claim_token` / URL (VBP or next builder).
4. **DevExperimentInspector:** local only (`import.meta.env.DEV`); should not be available on prod — quick smoke in incognito.
5. **Copy:** new user-facing strings added to `src/locales/en.json` and used via `copy` from `src/lib/copy.ts`.

## Merge rules (reminder)

- Do not commit `supabase/migrations/` or `supabase/functions/` without backend lane (Cursor) agreement.
- Shared: `src/integrations/supabase/types.ts`, `src/config/tools.ts` — backend first, then rebase UI.

## Related

- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
