# Vibecoding Broker Protocol (VBP)

This folder mirrors what will live in a dedicated public GitHub repo **`pr0ducent/vibecoding-broker-protocol`**.

## Contents (source of truth in app repo)

| App repo path | Purpose |
|---------------|---------|
| [docs/VBP-SPEC.md](../../docs/VBP-SPEC.md) | Normative spec (v0.1) |
| [docs/vbp-schemas/](../../docs/vbp-schemas/) | JSON Schema fragments |
| [supabase/functions/_shared/adapters/vbp-adapter.ts](../../supabase/functions/_shared/adapters/vbp-adapter.ts) | Reference broker-side client behavior |

## Planned OSS repo layout

```
vibecoding-broker-protocol/
  spec/v1.md              # copy of VBP-SPEC
  schemas/                # copy of vbp-schemas
  sdk/typescript/
  sdk/python/
  examples/express-builder/
  examples/hono-builder/
  validator/              # npx vbp-validate <baseUrl>
  badge/vbp-certified.svg
```

## Validator (stub)

See [validator/package.json](./validator/package.json). Full HTTP probing will iterate dispatch → status → artifacts compliance checks.
