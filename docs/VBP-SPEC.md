# Vibecoding Broker Protocol (VBP) v0.1

Open standard between **broker platforms** (e.g. pr0ducent) and **AI app builders**. Builders expose a small REST surface; brokers dispatch prompts, stream progress, and hand off users (leads).

**Version:** 0.1 (draft)  
**JSON Schemas:** [vbp-schemas/](./vbp-schemas/)

## Goals

- One integration surface per builder (no N custom scrapers).
- **Phantom sessions**: ephemeral demos with TTL; **claim** upgrades to a real account.
- **Telemetry**: completed runs report `billing_cost_tokens` / `compute_units_used` for honest cost comparison.
- **Export**: optional `GET …/export/{run_id}` (ZIP or GitHub URL) — missing export lowers “openness” score in broker UI.

## Base URL

Brokers configure `api_base_url` pointing at the builder’s VBP root, e.g. `https://api.builder.com/vbp/v1`.

## Authentication

- Builder issues a **partner API key** to the broker.
- Broker sends `Authorization: Bearer <partner_key>` on every request.
- Optional: `VBP_BROKER_OUTBOUND_SECRET` in dispatch body for builder to verify broker identity.

## Endpoints

### A. `POST /dispatch` — start build

**Response:** prefer `202 Accepted` with body below.

Request/response schemas: [vbp-schemas/dispatch-request.json](./vbp-schemas/dispatch-request.json), [dispatch-response.json](./vbp-schemas/dispatch-response.json).

Key fields:

- `run_id`: broker’s task id (we send `run_task_id` UUID).
- `webhook_url`: broker’s `pbp-webhook` / `vbp-webhook` URL for push events (optional if SSE is enough).
- Response: `provider_run_id`, `stream_url` (SSE), `claim_token`, `phantom_ttl_hours`.

### B. `GET /stream/{provider_run_id}` — SSE

Events (JSON per `data:` line):

- `status_update` — `{ "step": "…", "progress": 0.25 }`
- `artifact_ready` — `{ "type": "preview_url"|"screenshot"|"deploy_url", "url": "…" }`
- `completed` — `{ "final_preview_url", "billing_cost_tokens", "compute_units_used", "tech_stack": [] }`
- `error` — `{ "message", "retryable": true }`

### C. `GET /status/{provider_run_id}` — poll fallback

When SSE is not available. Schema: [vbp-schemas/status-response.json](./vbp-schemas/status-response.json).

### D. `GET /artifacts/{provider_run_id}`

Full artifact bundle (URLs, optional file list). Schema: [vbp-schemas/artifacts-response.json](./vbp-schemas/artifacts-response.json).

### E. `GET /export/{provider_run_id}`

Returns `application/zip` or JSON `{ "github_repo_url": "…" }`. If not implemented, return `501`.

### F. Claim (handoff)

Standard claim URL pattern (builder-hosted):

`https://{builder_domain}/vbp/claim?token={claim_token}&ref={broker_user_or_intent_id}`

Builder creates or attaches a user, attributes `ref` as affiliate / referral.

### G. `POST /remix/{provider_run_id}`

Fork for a new prompt / user. Schema: [vbp-schemas/remix-request.json](./vbp-schemas/remix-request.json).

## Webhooks (builder → broker)

`POST webhook_url` with optional header `X-VBP-Signature: sha256=<hmac>` over raw body (secret agreed out-of-band). pr0ducent receiver: `supabase/functions/pbp-webhook` (also accepts legacy `X-PBP-Signature` / `x-pbp-signature`; duplicate identical raw bodies are deduped after successful JSON parse). Optional env: `VBP_WEBHOOK_SECRET_REQUIRED=true` fails closed if secret missing.

### Signing header aliases (single HMAC over raw bytes)

| Name | Notes |
|------|--------|
| `X-VBP-Signature` | Normative in this spec (`sha256=<hex>` or raw hex) |
| `x-vbp-signature` | Same header; HTTP stacks normalize case |
| `X-PBP-Signature` / `x-pbp-signature` | Legacy alias accepted by pr0ducent |

### `dispatch` body: `webhook_url`

- **JSON Schema:** `webhook_url` is **not** in the `required` array — required in practice when the builder does **not** rely on SSE/`/stream/{run_id}` only (see `dispatch-request.json` property description).

## MCP mapping (informative)

Optional MCP server exposing tools: `vbp_dispatch`, `vbp_stream`, `vbp_status`, `vbp_artifacts`, `vbp_export`, `vbp_claim`, `vbp_remix` — same semantics as REST.

## Certification

- **`npx vbp-validate <baseUrl>`** (see `protocol/vibecoding-broker-protocol/validator`) checks required routes and response shapes.
- **VBP Certified** badge → higher ranking in broker recommendation (product policy).

## pr0ducent implementation

- Adapter: `supabase/functions/_shared/adapters/vbp-adapter.ts`
- Webhook: `supabase/functions/pbp-webhook/index.ts`
- Queue: `process-task-queue` + `dispatch-builders` (async drain + inline fallback)
