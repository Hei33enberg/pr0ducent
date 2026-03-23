# VBP — public messaging (bridge, ToS, partner trust)

This document **aligns messaging** on [pr0ducent.com/docs](https://pr0ducent.com/docs), in social posts, and in emails to builders. Technical sources: [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md), [POP-BRIDGE-ARCHITECTURE.md](./POP-BRIDGE-ARCHITECTURE.md).

## How we talk about VBP

- **VBP (Vibecoding Broker Protocol)** — the only protocol name in copy (spec, OpenAPI, partners).
- **PBP** only where it refers to the historical `pbp-webhook` endpoint.

## Bridge mode (temporary workarounds)

**Public line:**

- “Before a partner ships full VBP, we can show a **limited** bridge (e.g. URL handoff) to measure demand and leads. It **does not replace** a partner API integration.”
- “High-risk bridges (e.g. UI automation without consent) are **not** the default strategy — they require legal policy and a kill-switch.”

**What we do not promise:**

- That we will permanently circumvent a builder’s ToS or API without their consent.
- That the broker guarantees a full “live stream” of progress for every builder without their contract (SSE/webhook/poll).

## ToS and compliance

- We refer to the partner’s terms; our matrix: [POP-LEGAL-RISK-MATRIX.md](./POP-LEGAL-RISK-MATRIX.md).
- We encourage a **VBP pilot** instead of long-lived bridge maintenance.

## Handoff and user accounts

- Clear: **many builders = many accounts on the builder side**, unless you agree on SSO — [POP-PARTNER-OBJECTIONS.md](./POP-PARTNER-OBJECTIONS.md).

## Open source

- “Spec and validation tools are **public**; the full hosted broker and sensitive operations are not.” — [POP-OSS-SCOPE.md](./POP-OSS-SCOPE.md).
