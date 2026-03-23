# VBP — publishing a public repo (DevRel + Cursor)

The **full monorepo is MIT** ([LICENSE](../LICENSE)) — you can **publish a single** `pr0ducent` repo and then links to `blob/main/docs/...` and `tree/main/protocol/...` work for everyone without a separate mirror.

**Optionally** — a separate lightweight **`…/vibecoding-broker-protocol`** repo with only the spec (subtree / copy), if you want a clear split between “protocol only” and the full app and shorter clone times for integrators.

Goal of the separate repo: one place for builders: spec, schemas, OpenAPI, validator, examples — without the full frontend.

## Source in the monorepo

Directory: [`protocol/vibecoding-broker-protocol/`](../protocol/vibecoding-broker-protocol/README.md)

## Steps (checklist)

1. Create an **empty** public repo on GitHub (org `pr0ducent` or current product owner).
2. Clone it locally and copy `protocol/vibecoding-broker-protocol/` to the root of the new repo (or use `git subtree split` / manual mirror).
3. Add a **README** linking back to the broker app and to [docs/VBP-SPEC.md](./VBP-SPEC.md) in the monorepo (until the spec fully migrates to `spec/v1.md`).
4. Enable **GitHub Actions** — you can copy the JSON validation job from [`.github/workflows/vbp-protocol.yml`](../.github/workflows/vbp-protocol.yml).
5. In **Vercel** (target frontend host — [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md)) set **`VITE_VBP_PROTOCOL_URL`** to the new repo URL (README or GitHub Pages if you add it). Preview deployments should use a consistent URL or fallback from `.env.example`.
6. Announce **VBP** + first pilot partner ([VBP-POP-BRANDING.md](./VBP-POP-BRANDING.md)).
7. Optionally automate steps 1–4 with the prompt in [GITHUB-COPILOT-VBP-REPO-PROMPT.md](./GITHUB-COPILOT-VBP-REPO-PROMPT.md).

## Minimum contents

- `openapi/vbp-v1.openapi.yaml`
- `schemas/*.json`
- `validator/cli.mjs` + `npm run vbp-validate`
- `examples/minimal-node/`
- `badge/vbp-certified.svg`

## Related

- [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md) — discovery, pilot, conformance matrix
- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
