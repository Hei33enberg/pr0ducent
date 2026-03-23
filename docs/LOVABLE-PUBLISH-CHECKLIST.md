# Lovable Cloud — Pull, Publish, feature flags

## For operator (after each significant merge to `main`)

1. Open the project in **Lovable** (or the linked frontend host).
2. **Git → Pull / Sync** from branch **`main`** of the GitHub repo (same as `origin/main`).
3. Wait for the build to finish; check logs for TypeScript errors.
4. **Publish** to production only after PM approval.

Backend (**Supabase**) does not update via Lovable Publish — run migrations and Edge Functions in Supabase / CLI separately ([SPRINT-CLOSE.md](./SPRINT-CLOSE.md)).

## `VITE_FF_*` variables (Lovable / Vercel / build)

These drive [`src/lib/featureFlags.ts`](../src/lib/featureFlags.ts). Value **`false`** disables a feature (string compared to `"false"`).

| Variable | Default (when unset) | Effect of `=false` |
|----------|----------------------|---------------------|
| `VITE_FF_MARKETPLACE` | on | Hides Marketplace routing / nav. |
| `VITE_FF_MULTI_BUILDER_STREAM` | on | Disables multi-builder stream overlay in Compare canvas. |
| `VITE_FF_BYOA` | on | Hides BYOA tab in User Dashboard. |

**Dev:** `DEV_INSPECTOR` is enabled only in `import.meta.env.DEV` (local), not in production.

## VBP spec link in UI

Optionally set **`VITE_VBP_PROTOCOL_URL`** (e.g. public `vibecoding-broker-protocol` repo after creation). If empty, the footer uses the default URL from code (see Footer).

## Sprint 3 AG (benchmark + social)

After migrations and Edge merge to `main`: **[LOVABLE-SPRINT3-PROMPT.md](./LOVABLE-SPRINT3-PROMPT.md)** (short copy-paste for operator) and **[AG-SPRINT3-HANDOFF.md](./AG-SPRINT3-HANDOFF.md)** (full handoff).

## Related

- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
- [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md)
