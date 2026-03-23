# Vibecoding Broker Protocol (VBP)

Mirror of what can be published as **`pr0ducent/vibecoding-broker-protocol`** on GitHub.

## Layout

| Path | Purpose |
|------|---------|
| [openapi/vbp-v1.openapi.yaml](./openapi/vbp-v1.openapi.yaml) | OpenAPI 3.1 sketch (paths + schema refs) |
| [schemas/](./schemas/) | JSON Schema (synced with `docs/vbp-schemas/` in app repo) |
| [validator/cli.mjs](./validator/cli.mjs) | `npm run vbp-validate -- <baseUrl>` — HTTP probe dispatch + status |
| [examples/minimal-node/](./examples/minimal-node/) | Local demo server for validator |
| [examples/POP-QUICKSTART.md](./examples/POP-QUICKSTART.md) | Partner 90‑minute integration path |
| [sdk/typescript/client.ts](./sdk/typescript/client.ts) | Minimal broker-side TS client (copy/publish) |
| [sdk/python/vbp_client/](./sdk/python/vbp_client/) | Minimal broker-side Python client |
| [GOVERNANCE.md](./GOVERNANCE.md) | Versioning + RFC process |
| [CONFORMANCE.md](./CONFORMANCE.md) | Verification levels + broker checklist |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute (schemas, validator, matrix) |
| [COMPATIBILITY-MATRIX.md](./COMPATIBILITY-MATRIX.md) | Community builder compatibility table |
| [.github/ISSUE_TEMPLATE/](./.github/ISSUE_TEMPLATE/) | Issue templates (builder, spec, compat) |

## Normative spec (app monorepo)

- [docs/VBP-SPEC.md](../../docs/VBP-SPEC.md)
- [docs/VBP-POP-BRANDING.md](../../docs/VBP-POP-BRANDING.md) — VBP vs „pr0ducent Open Protocol”
- [docs/POP-PUBLIC-REPO-STEPS.md](../../docs/POP-PUBLIC-REPO-STEPS.md) — wydzielenie tego folderu do publicznego repo GitHub
- [docs/POP-INDEX.md](../../docs/POP-INDEX.md) — pełny indeks POP (partner, bridge, ROI, conformance)

## Broker implementation

- [supabase/functions/_shared/adapters/vbp-adapter.ts](../../supabase/functions/_shared/adapters/vbp-adapter.ts)

## CI

Monorepo workflow **vbp-protocol** validates JSON schemas under `protocol/.../schemas` and `docs/vbp-schemas`.
