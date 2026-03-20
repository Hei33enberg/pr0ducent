# Wiring Lovable, Bolt, Replit (outbound adapters)

Until partners ship **VBP**, pr0ducent uses dedicated or **generic-rest** adapters.

## Lovable

- **Status:** No public “dispatch prompt” API documented for third-party brokers at parity with in-app builds.
- **Path:** Partner program → issue scoped API keys → map to `integration_type = vbp` or `generic_rest` once URLs and payloads are known.
- **Secrets:** store under `builder_integration_config.api_secret_env` (e.g. `LOVABLE_PARTNER_KEY`).

## Bolt.new / StackBlitz WebContainers

- **Status:** Primary flows are browser/session-based; check enterprise / partner APIs.
- **Path:** Same as Lovable — prefer **VBP** so Bolt maintains the integration surface.

## Replit

- **Status:** Public APIs exist for agents/deployments; confirm ToS for broker-style dispatch.
- **Path:** Likely `generic_rest` with `api_base_url` + `request_template` + `response_id_path` after API review.

## After wiring

1. Set `tier = 1` or `2`, `enabled = true`, correct `integration_type`.
2. Run [SMOKE-TEST-ORCHESTRATOR.md](./SMOKE-TEST-ORCHESTRATOR.md) for that `tool_id`.
3. Add `builder_crawl_sources` rows for official docs.
