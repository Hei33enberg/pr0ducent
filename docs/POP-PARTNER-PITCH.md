# VBP — partner pitch (builders)

**Protocol:** Vibecoding Broker Protocol (VBP) — [VBP-SPEC.md](./VBP-SPEC.md).

## Problem

Brokers comparing builders (prompt → app) need **one contract**: start run, status, artifacts, user handoff, cost telemetry. Without a standard every broker builds a one-off integration — expensive for builders and does not scale.

## Value proposition for builders

1. **One integration → many brokers** — implement VBP (`/vbp/v1/dispatch`, status or webhook, optional SSE), access brokers compatible with VBP.
2. **Lead attribution** — `user_context`, `claim_token`, references in handoff; broker can measure conversions to accounts on your side ([POP-ROI-METRICS.md](./POP-ROI-METRICS.md)).
3. **Trust level** — “Verified / Partial” conformance ([POP-CONFORMANCE-PROFILES.md](./POP-CONFORMANCE-PROFILES.md)), open validator and schemas in the OSS repo.
4. **Security** — partner key, HMAC webhook signatures, idempotency ([POP-SECURITY-MODEL.md](./POP-SECURITY-MODEL.md)).

## What you must ship (minimum)

- `POST /vbp/v1/dispatch` → `202` + `provider_run_id`.
- **Completion path:** either `GET /vbp/v1/status/{id}` (poll) or `POST` to broker `webhook_url` with signed JSON.
- Optional: `claim_token` + claim page to upgrade from demo to account.

Details: [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md).

## Partnership model (to refine legal/commercial)

Options: rev-share on new paying users, CPA for qualified signup, flat pilot fee.  
Framework: [POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md).

## Objections — ready answers

[POP-PARTNER-OBJECTIONS.md](./POP-PARTNER-OBJECTIONS.md).

## Next step

1. 30-min discovery ([PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md)).  
2. 2-week pilot — staging + validator + one E2E smoke ([POP-PILOT-SUCCESS-CRITERIA.md](./POP-PILOT-SUCCESS-CRITERIA.md)).
