# Vibecoding Broker Protocol (VBP)

Mirror of what can be published as **`pr0ducent/vibecoding-broker-protocol`** on GitHub.

## Layout

| Path | Purpose |
|------|---------|
| [openapi/vbp-v1.openapi.yaml](./openapi/vbp-v1.openapi.yaml) | OpenAPI 3.1 sketch (paths + schema refs) |
| [schemas/](./schemas/) | JSON Schema (synced with `docs/vbp-schemas/` in app repo) |
| [validator/cli.mjs](./validator/cli.mjs) | `npm run vbp-validate -- <baseUrl>` — HTTP probe dispatch + status |
| [examples/minimal-node/](./examples/minimal-node/) | Local demo server for validator |

## Normative spec (app monorepo)

- [docs/VBP-SPEC.md](../../docs/VBP-SPEC.md)
- [docs/VBP-POP-BRANDING.md](../../docs/VBP-POP-BRANDING.md) — VBP vs „pr0ducent Open Protocol”
- [docs/POP-PUBLIC-REPO-STEPS.md](../../docs/POP-PUBLIC-REPO-STEPS.md) — wydzielenie tego folderu do publicznego repo GitHub

## Broker implementation

- [supabase/functions/_shared/adapters/vbp-adapter.ts](../../supabase/functions/_shared/adapters/vbp-adapter.ts)

## CI

Monorepo workflow **vbp-protocol** validates JSON schemas under `protocol/.../schemas` and `docs/vbp-schemas`.
