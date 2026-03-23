# VBP Bridge Registry (TOP 10–15, vibe-coding category)

Prioritization source: [Product Hunt — Vibe coding](https://www.producthunt.com/categories/vibe-coding) and tools repeatedly mentioned in that category’s launches.  
**Goal:** one source of truth for bizdev, engineering, and risk policy.

## `bridge_mode` classification

| Value | Meaning |
|-------|---------|
| `api_native` | Public API (REST/SDK) for programmatic builds and status — preferred path for POP/VBP. |
| `api_partial` | Limited surface (e.g. URL trigger, embed) — bridge needs normalization; full POP needs partner-side extension. |
| `browser_only` | No stable public API — UI only; possible browser bridge (high ToS / maintenance risk). |
| `no_go` | Temporarily out of bridges (ToS, no surface, or contract-only). |

## Registry (working — verify each pilot)

| # | Builder | `bridge_mode` | Integration surface (short) | Risk / notes | Path to native POP |
|---|---------|---------------|------------------------------|--------------|---------------------|
| 1 | **v0 (Vercel)** | `api_native` | Platform API (beta) + SDK (`v0-sdk`) | Rate limits, beta terms | Reference path in repo (`run-on-v0`, platform key). |
| 2 | **Cursor** | `api_native` | Cloud Agents API (programmatic agents) | Beta; model differs from “prompt→hosted app” | Map semantics to `run_tasks` / repo artifacts. |
| 3 | **Lovable** | `api_partial` | [Build with URL](https://docs.lovable.dev/integrations/build-with-url) (autosubmit + prompt) | No public dispatch/status like VBP; URL length limits; user must pick workspace | Partner ships `POST /vbp/v1/dispatch` + status/webhook. |
| 4 | **Replit** | `browser_only` | Agent in workspace; no public “dispatch from outside” in docs | ToS: e.g. no scraping abuse — RPA bridge only with legal sign-off | Enterprise / partner API or dedicated endpoint. |
| 5 | **Bolt.new (StackBlitz)** | `browser_only` | WebContainers + UI; no public Bolt API like VBP | Maybe StackBlitz SDK for embeds, not full agent | Partner API or formal partner program. |
| 6 | **Firebase Studio** | `browser_only` | Agent in Google/Firebase; preview in ecosystem | Integration beyond public VBP needs Google Cloud path | Partner program / Gemini App Prototyping API roadmap. |
| 7 | **Webflow** | `api_partial` | Data/Designer API for content; AI site builder mostly in product | Site generation may lack one “dispatch prompt→app” API | MCP/LLM docs + optional partner workflows. |
| 8 | **Builder.io** | `api_partial` | Visual builder + GitHub; API for content/design | Semantics “agent PR” vs “single-shot app” | Shared artifact model (repo URL, preview). |
| 9 | **Framer** | `api_partial` | API/plugin ecosystem; AI in product | Not always one run = one deploy | Handoff preview URL + claim. |
| 10 | **Bubble** | `browser_only` | Mostly no-code in UI | Rare public API for full broker | Partner workflow or iframe handoff. |
| 11 | **Glide** | `api_partial` | API for data / not always “AI build from prompt” | Fit to run model | Partial POP (status from their system). |
| 12 | **Softr** | `api_partial` | REST to Airtable/data | Similar to Glide | Partial. |
| 13 | **Windsurf** | `api_native` / `api_partial` | IDE + possible API (verify current changelog) | Model closer to repo than hosted app | Map to code artifacts. |
| 14 | **Anything** (PH) | `browser_only` | Launch product — verify API | High churn | Reclassify after stabilization. |
| 15 | **Alta / “AI app generator”** (PH) | `browser_only` | Various launches — verify | Often no public API | Individual pilot. |

## Bridge rollout priority (aggressive mode — per policy)

1. **`api_native` first** — v0, Cursor (if it fits), Windsurf when API is confirmed.
2. **`api_partial`** — Lovable (URL), Webflow/Builder.io/Framer/Glide/Softr — faster demo, medium drift risk.
3. **`browser_only`** — only with [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md), feature flag, and kill-switch.

## Related

- [POP-BRIDGE-ARCHITECTURE.md](./POP-BRIDGE-ARCHITECTURE.md) — bridge components.
- [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md) — when aggressive bridge is allowed.
- [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md) — technical discovery for native VBP.
