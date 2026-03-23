# Newsc0rp design system (pr0ducent)

This repo follows the **shared Newsc0rp stable** design language together with **murd0ch** and **p0xi**. Do not maintain a second full brandbook here.

## Single source of truth

**Master brandbook (edit once):** `newsc0rp-main/src/styles/design-tokens.md` in the **`newsc0rp-main`** repository. With a local sibling layout (`pr0ducent-main` and `newsc0rp-main` under the same parent), open: [`design-tokens.md`](../../newsc0rp-main/src/styles/design-tokens.md). On GitHub, open the **newsc0rp-main** repo and browse the same path—there is no single cross-repo link inside this repository’s remote.

That document includes:

- Typography (Cormorant Garamond + Space Grotesk)
- HSL semantic tokens and surfaces
- Ambient gradient / page frame / section patterns
- Illustration & FAL asset pipeline
- **§15 Multi-product** — rules for murd0ch vs `/p0xi` vs pr0ducent (washes, hero art, voice)

## pr0ducent-specific notes

- **Product focus:** multi-builder orchestration, benchmarks, PVI-style scoring — see [`AGENTS.md`](../AGENTS.md) and [`DESIGN-TOKENS.md`](./DESIGN-TOKENS.md) for this repo’s implementation details.
- **Implementation:** [`src/index.css`](../src/index.css), [`docs/DESIGN-TOKENS.md`](./DESIGN-TOKENS.md). Align token changes with the master file above; avoid drifting accent, background, or heading rules away from §15 without updating the master.

## Lovable Cloud (CSS / tokens / fonts)

When you change global styles or fonts in this repo:

1. Pull from GitHub (`main` or your deploy branch).
2. Build / fix errors (`npm run build` locally if needed).
3. Publish in Lovable so hosted CSS updates.
4. Smoke: home hero, nav (desktop + mobile), one inner page with cards.

Redeploy Supabase Edge Functions **only** if the change is not pure frontend.

## Related docs

- [`CROSS-PRODUCT-SHELL.md`](./CROSS-PRODUCT-SHELL.md) — wspólne wytycznice shell (murd0ch / pr0ducent / p0xi) + metryki referencyjne pr0ducent
- [`PR0DUCENT-PARITY-GAPS.md`](./PR0DUCENT-PARITY-GAPS.md) — checklista parity z murd0ch, hero, menu
- [`DESIGN-TOKENS.md`](./DESIGN-TOKENS.md) — pr0ducent token reference
- [`DEVELOPMENT-STATUS.md`](./DEVELOPMENT-STATUS.md) — stack and status
