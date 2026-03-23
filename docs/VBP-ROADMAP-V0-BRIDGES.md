# VBP — v0 and bridges roadmap

## v0 (reference adapter)

- **API-first** path for the v0 Platform API: adapter in code (`v0-adapter`), `poll-v0-status` for anonymous users — without changing the orchestrator domain model.
- Stay aligned with [ORCHESTRATOR.md](./ORCHESTRATOR.md); when the v0 API changes, update the adapter and smoke after Edge deploy.

## Bridges (bridge mode)

- **Registry:** [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md) — order: prefer `api_native` / `api_partial` before `browser_only`.
- **Flags:** `VITE_FF_BRIDGE_MODE`, `VITE_FF_BRIDGE_AGGRESSIVE` in [src/lib/featureFlags.ts](../src/lib/featureFlags.ts); policy: [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md).
- **KPI:** [POP-ROI-METRICS.md](./POP-ROI-METRICS.md) — every bridge needs a measurable exit path to **native VBP**.

## Target state

- Partners with full API: **native VBP** (`/vbp/v1`, webhook, conformance).
- v0 stays a separate product path (not a “bridge” to replace VBP).
- Bridges only where the partner has no public API yet — with a plan to migrate to VBP.
