# VBP — roadmap v0 i mostów

## v0 (adapter referencyjny)

- Ścieżka **API-first** dla v0 Platform API: adapter w kodzie (`v0-adapter`), `poll-v0-status` dla użytkowników anon — bez zmiany modelu domeny orchestratora.
- Utrzymuj zgodność z [ORCHESTRATOR.md](./ORCHESTRATOR.md); przy zmianach API v0 aktualizuj adapter i smoke po deployu Edge.

## Mosty (bridge mode)

- **Rejestr:** [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md) — kolejność: preferuj `api_native` / `api_partial` przed `browser_only`.
- **Flagi:** `VITE_FF_BRIDGE_MODE`, `VITE_FF_BRIDGE_AGGRESSIVE` w [src/lib/featureFlags.ts](../src/lib/featureFlags.ts); polityka: [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md).
- **KPI:** [POP-ROI-METRICS.md](./POP-ROI-METRICS.md) — każdy most musi mieć mierzalny exit path do **natywnego VBP**.

## Docelowy stan

- Partnerzy z pełnym API: **natywny VBP** (`/vbp/v1`, webhook, conformance).
- v0 pozostaje osobną ścieżką produktową (nie „most” do zastąpienia VBP).
- Mosty tylko tam, gdzie partner nie ma jeszcze publicznego API — z planem migracji do VBP.
