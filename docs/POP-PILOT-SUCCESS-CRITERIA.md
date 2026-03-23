# VBP — pilot success criteria (2 weeks)

Template — adjust numbers to the partner. Technical checklist: [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md).

## Minimum goals (must-have)

| Criterion | How to measure |
|-----------|------------------|
| **Dispatch works** | `POST /vbp/v1/dispatch` → `202` + `provider_run_id` on staging |
| **Completion path** | At least one terminal: webhook **or** poll status → `builder_results.status = completed` |
| **Conformance** | `validator/cli.mjs` passes against partner `api_base_url` (Partial minimum) |
| **Security** | Webhook with HMAC signature on staging; secret configured on both sides |

## Desired goals (should-have)

| Criterion | How to measure |
|-----------|------------------|
| Claim / handoff | User can move from demo to builder account (`claim_token` or URL) |
| Observability | `trace_id` / `run_id` correlation visible in logs on both sides |
| Limits | Declared rate limits; no sustained 429 without backoff |

## Stretch goals (could-have)

- SSE or progress via intermediate webhooks.
- Artifact export (ZIP / repo URL) per VBP.

## Pilot outcome

| Outcome | Condition |
|---------|-----------|
| **Verified** | Most must-have + should-have; no critical bugs for 1 week |
| **Partial** | Must-have; documented gaps (e.g. no export) |
| **Do not continue** | Must-have not met or legal veto |

Related: [protocol/vibecoding-broker-protocol/CONFORMANCE.md](../protocol/vibecoding-broker-protocol/CONFORMANCE.md).
