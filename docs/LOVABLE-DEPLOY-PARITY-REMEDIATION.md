# Lovable / Antigravity — deploy after UI parity remediation

Use this after merging **parity remediation** (menu shell, `PageFrame`, LP separator) to `main`.

## Scope

- **Frontend / CSS / React only** — no Supabase migrations or Edge function changes in this slice unless you added them separately.
- **GitHub:** Pull latest `main` → build → publish on Lovable.

## Operator checklist (pasteable)

1. **Pull** from GitHub (`main`).
2. **Build** (Lovable “Build” or local `npm ci && npm run build`).
3. **Publish** (Lovable deploy).

## Smoke (5–10 min)

- [ ] **Home `/`** — hero spacing feels balanced (no excessive gap under sticky header); scroll down/up: header hides/shows; no layout jump.
- [ ] **Menu desktop (sm+)** — open hamburger: dropdown scrolls if content is tall; no clipped bottom rows; backdrop blur visible (or solid fallback if `backdrop-filter` unsupported).
- [ ] **Menu mobile** — full-screen overlay; scroll nav; language + CTA strip at bottom; body scroll locked while open.
- [ ] **`/pricing`**, **`/compare`**, **`/runs-now`**, **`/marketplace`**, **`/blog`**, **`/dashboard`** — first paint below header OK; breadcrumbs + `page-inner` unchanged.
- [ ] **`prefers-reduced-motion`** (OS setting): no harsh overlay animation; header still usable.

## Supabase / backend

- **Migrations:** none required for this UI-only change.
- **Edge functions:** redeploy **not** required for this slice alone.

## Prompt for Lovable / AG (short)

> Pull `main` and publish. This release aligns `PageFrame` with the murd0ch shell: sticky header glass, desktop `menu-dropdown` scroll, mobile overlay blur + z-index, tighter page-frame margins, and a CSS-only section separator on the home LP. No DB migrations or Edge deploys for this slice. Smoke: home hero + hamburger menu desktop/mobile + pricing + dashboard.
