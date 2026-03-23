# VBP — open source scope (full monorepo)

**Strategy:** the **pr0ducent** repository is under the **MIT** license ([LICENSE](../LICENSE)) — including the frontend, Supabase Edge Functions, migrations, and the VBP protocol bundle. The goal is **fast scaling**, forking, and integration with other vibe-AI apps; the business model can evolve independently of the code.

Protocol naming: **VBP** only — [VBP-POP-BRANDING.md](./VBP-POP-BRANDING.md).

## What is in the repo (all under MIT)

| Area | Contents |
|------|----------|
| `src/` | React app (Vite) |
| `supabase/` | Edge Functions (Deno), `config.toml`, migrations |
| `protocol/vibecoding-broker-protocol/` | Spec, schemas, validator, examples, SDK |
| `docs/` | Operational and partner documentation |

## What is **not** in the repo (by design)

- **Production secrets** — API keys, `service_role`, webhook secrets; each operator sets these in their own Supabase Dashboard, Vercel env, etc.
- **Hosted production traffic** — deployment and SLA are on the fork operator; this project is **reference code**, not a SaaS.

## Legal / brand

- The **pr0ducent** name and logo may be governed separately from the MIT license on the code — check file headers and README before using the brand in production.

## For contributors

- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [protocol/vibecoding-broker-protocol/CONTRIBUTING.md](../protocol/vibecoding-broker-protocol/CONTRIBUTING.md)
