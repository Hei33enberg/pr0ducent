# Growth lane roadmap (post-audit)

Tracks **Priorytet 2** from the audit plan: second live builder, BYOA, marketplace depth, CI/load maturity.

## Second builder live

- Register adapter + `builder_integration_config` row for the new engine.
- Smoke: dispatch → poll/webhook → `builder_results` / `run_events` as for Tier 1/2.
- Frontend: surface in `BuilderCatalogContext` / compare flows (no duplicate hook sources).

## BYOA (bring-your-own adapter)

- Backend: stable auth for external orchestrator callbacks; optional lineage fields for marketplace.
- Frontend: dedicated onboarding tab and status surfacing (errors, retries).

## Marketplace

- Presentation layer for listings and lineage; keep contracts versioned with `/docs`.

## CI and load testing

- **CI:** `.github/workflows/ci.yml` — unit tests + production build on push/PR. Run `npm run lint` locally until legacy ESLint debt is cleared.
- **E2E (local):** `npm run test:e2e` — Playwright smoke (`e2e/happy-path.spec.ts`, starts Vite on port 8080).
- **E2E (staging):** `.github/workflows/staging-e2e.yml` — manual run against real backend (`docs/GITHUB-ACTIONS-STAGING-E2E.md`).
- **Load:** baseline script `scripts/load/dispatch-smoke.k6.js` (requires [k6](https://k6.io/) installed); point `BASE_URL` / JWT at staging, track p95 for `dispatch-builders` and pollers.
- **Cloud checklist:** [LOVABLE-OPERATIONS.md](./LOVABLE-OPERATIONS.md).

## Hand-off

AG avoids Edge/migration changes without sync; Cursor avoids copy/UX changes without AG ticket. After webhook or poller changes, update `docs/WEBHOOK-PAYLOAD-CONTRACT.md` and `/docs` UI.
