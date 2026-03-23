# Contributing to pr0ducent

Thanks for helping grow the stack. This repository is **open source (MIT)** — see [LICENSE](./LICENSE).

## Quick start

```bash
npm install
npm run dev
npm run test
npm run build
```

## Where to contribute

| Area | Notes |
|------|--------|
| Web app (`src/`) | React, Vite, Tailwind — match existing patterns |
| Edge Functions (`supabase/functions/`) | Deno — run `npm run test:deno` where applicable |
| Protocol bundle (`protocol/vibecoding-broker-protocol/`) | Spec, schemas, validator — see [protocol/vibecoding-broker-protocol/CONTRIBUTING.md](./protocol/vibecoding-broker-protocol/CONTRIBUTING.md) |
| Docs (`docs/`) | Markdown; keep VBP naming per [docs/VBP-POP-BRANDING.md](./docs/VBP-POP-BRANDING.md) |

## Pull requests

- Open PRs against `main`.
- Describe **what** and **why**; link issues if any.
- Do not commit secrets (`.env`, API keys). Use `.env.example` for public variable names only.

## Security

Do not open public issues for undisclosed vulnerabilities — email maintainers or use GitHub Security Advisories if enabled on the repo.
