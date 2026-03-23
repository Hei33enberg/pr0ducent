# VBP — partner objections and responses

Use in conversations with the builder’s product / legal / engineering. Technical source of truth: [VBP-SPEC.md](./VBP-SPEC.md).

## “We don’t want to give the user relationship to the broker”

**Response:** The broker does not replace your product — it **routes comparison and the first run**. Handoff stays with you: `claim_token`, claim page, normal user account. Users still pick a builder by output quality; the broker shortens the path to discovery.

## “Another standard — we already have API / MCP”

**Response:** POP/VBP is a **narrow contract** (prompt → run → artifact → claim); it does not replace MCP or A2A. You can use any tools internally; at the broker boundary you need stable HTTP + optional webhook/SSE.

## “Brand cannibalization”

**Response:** Conformance and marketing: **“POP Verified”** as a quality badge; the broker can show the partner logo per guidelines. We negotiate placement (e.g. “Open in {Builder}”) instead of an anonymous embed.

## “Rate limits and inference cost”

**Response:** The broker should send `run_id`, respect **429** and **per-partner rate limits** (`builder_rate_limits` on broker side). Pilots start small with caps; contracts can include SLA and caps.

## “Security: webhook spoofing, replay”

**Response:** **HMAC** over raw body (`X-VBP-Signature`), secret out of band; the receiving broker deduplicates payloads. See [POP-SECURITY-MODEL.md](./POP-SECURITY-MODEL.md).

## “We don’t have resources for full SSE”

**Response:** **Minimal POP profile:** dispatch + **poll status** or **webhook**; SSE is optional in the spec ([VBP-SPEC.md](./VBP-SPEC.md)).

## “Reverse engineering / browser automation”

**Response:** We do not ask for that as the target integration. Native VBP is preferred. Browser bridges are **temporary** and under risk policy ([POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md)).

## “Conversion attribution — dispute over who ‘won’”

**Response:** Shared events: **referral click** (CTA), **conversion** (handoff with `claim_token` or confirmed signup with `ref`). Contract: attribution window, deduplication, logging on both sides ([POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md)).

## “Shelf project”

**Typical causes:** unclear ROI, scope too wide, no owner on the builder side.  
**Mitigation:** pilot with clear KPIs ([POP-PILOT-SUCCESS-CRITERIA.md](./POP-PILOT-SUCCESS-CRITERIA.md)), minimal conformance profile, one broker as reference.
