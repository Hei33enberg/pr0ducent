# Builder catalog (vibe-coding)

Curated inventory for orchestration and VBP outreach. **API status** is best-effort — verify before production wiring.

| id | name | url | integration_type | api_status | notes |
|----|------|-----|-------------------|------------|-------|
| v0 | Vercel v0 | https://v0.dev | rest_api | public API | Live in pr0ducent (`v0-adapter`) |
| lovable | Lovable | https://lovable.dev | vbp_target | partner / closed | Prefer VBP; broker key program |
| bolt | Bolt.new | https://bolt.new | browser / partner | limited public | WebContainers; VBP launch candidate |
| replit | Replit | https://replit.com | rest_api | API exists | Agents API — verify quotas |
| cursor | Cursor | https://cursor.com | mcp / desktop | IDE-bound | BYOA path; not headless broker |
| windsurf | Windsurf | https://windsurf.com | mcp / ide | evolving | Codeium stack |
| replit_agent | Replit Agent | https://replit.com | rest_api | see Replit | Same platform |
| base44 | Base44 | https://base44.com | unknown | TBD | Benchmark profile today |
| antigravity | Antigravity | https://antigravity.dev | unknown | TBD | Benchmark profile |
| build0 | Build0 | https://build0.dev | unknown | TBD | Benchmark profile |
| orchids | Orchids | https://orchids.dev | unknown | TBD | Benchmark profile |
| floot | Floot | https://floot.ai | unknown | TBD | Benchmark profile |
| github_copilot | GitHub Copilot | https://github.com/features/copilot | ide | N/A for broker | BYOA only |
| framer | Framer | https://framer.com | rest/partner | site builder | Different modality |
| webflow | Webflow | https://webflow.com | rest | CMS/API | Different modality |
| bubble | Bubble | https://bubble.io | rest | plugin | Workflow apps |
| flutterflow | FlutterFlow | https://flutterflow.io | unknown | TBD | Mobile |
| glide | Glide | https://www.glideapps.com | unknown | TBD | Sheets-first |
| teleporthq | TeleportHQ | https://teleporthq.io | unknown | TBD | Design-to-code |
| create_xyz | Create | https://create.xyz | unknown | TBD | |
| devin | Devin | https://devin.ai | partner | waitlist | Cognition |
| ph_category | Product Hunt — Vibe Coding | https://www.producthunt.com/categories/vibe-coding | — | discovery | **Source of truth for new tools** |

## Research workflow

1. Pull new products from the PH category regularly (manual or scripted).
2. For each candidate: docs URL → insert into `builder_crawl_sources` for `rag-crawl-builder`.
3. Classify: `vbp` (implement VBP), `rest_api` (generic-rest or dedicated), `browser`, `none` (benchmark only).
4. Open partner conversation: VBP compliance + `VBP_CERTIFIED` listing boost.

See [VBP-SPEC.md](./VBP-SPEC.md) and [SMOKE-TEST-ORCHESTRATOR.md](./SMOKE-TEST-ORCHESTRATOR.md).
