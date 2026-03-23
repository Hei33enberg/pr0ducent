# VBP — integration simulation (staging / local)

Goal: a **repeatable dry-run** without a production partner — confirm that minimal VBP implementation, orchestrator, and (optional) webhook work end-to-end.

## 1. Local: minimal-node + validator

1. Run the example from [protocol/vibecoding-broker-protocol/examples/minimal-node/README.md](../protocol/vibecoding-broker-protocol/examples/minimal-node/README.md) on a known port (e.g. `http://localhost:3456`).
2. From `protocol/vibecoding-broker-protocol/validator`:

   ```bash
   npm install
   node cli.mjs http://localhost:3456/vbp/v1
   ```

   Expected: validation passes or reports concrete gaps per [VBP-SPEC.md](./VBP-SPEC.md).

## 2. Staging Supabase: test row

1. In a **staging** project (not production) add or update a row in `builder_integration_config`:
   - `integration_type` matching the VBP adapter (`vbp` / path from [ORCHESTRATOR.md](./ORCHESTRATOR.md)),
   - `api_base_url` pointing at your server — if the broker cannot reach `localhost`, use a tunnel (ngrok, Cloudflare Tunnel) and paste the public HTTPS URL with `/vbp/v1` suffix if required.
2. Ensure repo migrations are applied on staging (VBP columns, circuit breaker, etc.).

## 3. Orchestrator smoke

1. Sign in a test user in the app wired to **staging** Supabase.
2. Run one multi-builder round with `tool_id` tied to the config above — via UI or per [ORCHESTRATOR.md](./ORCHESTRATOR.md) (`dispatch-builders` → `run_tasks` → `run_events`).
3. Verify: `run_tasks` reaches a terminal state, `builder_results` has expected fields.

## 4. Webhook (optional)

1. If minimal-node or your server sends completion to `pbp-webhook`, send a sample payload per [WEBHOOK-PAYLOAD-CONTRACT.md](./WEBHOOK-PAYLOAD-CONTRACT.md) (HMAC signature if enabled on staging).
2. Verify idempotency: duplicate identical bodies should not corrupt state.

## 5. Success checklist (simulation)

Simplified from [POP-PILOT-SUCCESS-CRITERIA.md](./POP-PILOT-SUCCESS-CRITERIA.md):

- [ ] Validator passes on the public base URL.
- [ ] One dispatch from the broker ends in success or a controlled error with a log in `run_events`.
- [ ] `pbp-webhook` (if used) updates rows without duplicates on retry.

## Related

- [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md)
- [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md)
