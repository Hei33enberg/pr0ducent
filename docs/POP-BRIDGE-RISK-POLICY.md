# VBP Bridge — risk policy (aggressive mode)

**Goal:** enable fast value demos without exposing the company to partner ToS violations or reputational damage.

## Decision rules

1. **Off by default:** `VITE_FF_BRIDGE_AGGRESSIVE` is `false` ([featureFlags.ts](../src/lib/featureFlags.ts)).
2. **Bridge Mode** (`VITE_FF_BRIDGE_MODE`) must be `true` before aggressive mode applies.
3. **Legal review** before first `browser_only` deployment to production — matrix: [POP-LEGAL-RISK-MATRIX.md](./POP-LEGAL-RISK-MATRIX.md).
4. **Partner consent** — preferably written (email from partnerships or pilot contract); without consent: only `api_native` / `api_partial` with publicly allowed API/URL.

## When aggressive bridge is **allowed**

| Condition | Description |
|-----------|-------------|
| Registry | Builder marked `browser_only` in [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md) + business justification. |
| Kill-switch | Procedure from [POP-BRIDGE-RUNBOOK.md](./POP-BRIDGE-RUNBOOK.md) known to on-call. |
| Limits | Low concurrency, circuit breaker, no mass account automation. |
| Telemetry | ROI measured ([POP-ROI-METRICS.md](./POP-ROI-METRICS.md)); if ROI below threshold — disable. |

## When **forbidden** (`no_go`)

- Partner explicitly forbids UI automation in terms **and** there is no written derogation.
- Actions that imply **content scraping** or **API reverse engineering** (e.g. [Replit ToS](https://replit.com/terms-of-service) excerpts).
- No owner responsible for maintaining the bridge (“zombie integration” risk).

## Escalation

1. PM + eng assess incident within 24h.
2. Disable flags per runbook.
3. Update registry and optionally notify partner.

## Related

- [POP-BRIDGE-ARCHITECTURE.md](./POP-BRIDGE-ARCHITECTURE.md)
- [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md)
