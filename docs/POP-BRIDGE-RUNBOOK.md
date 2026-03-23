# VBP Bridge — operational runbook

## Enabling a bridge (staging)

1. Verify the entry in [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md) (`bridge_mode`, risk).
2. Set `VITE_FF_BRIDGE_MODE=true` in the frontend environment (staging).
3. Configure `builder_integration_config` (tier, `enabled`, limits) — do not enable production without [POP-CONFORMANCE-PROFILES.md](./POP-CONFORMANCE-PROFILES.md) for native VBP.
4. Smoke: one run → expected terminal state in `builder_results`.

## Enabling aggressive mode (browser)

1. **Approval** per [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md) (legal + partner).
2. `VITE_FF_BRIDGE_MODE=true` **and** `VITE_FF_BRIDGE_AGGRESSIVE=true`.
3. Monitor errors and cost; low limit on concurrent jobs.

## Kill-switch (immediate)

1. Set `VITE_FF_BRIDGE_AGGRESSIVE=false` or `VITE_FF_BRIDGE_MODE=false`.
2. Disable `enabled` for that `tool_id` in `builder_integration_config` if applicable.
3. Open an internal incident: note in the registry (“notes” column) + message to partner if the fault is on the API side.

## After an incident

- Update [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md) (`no_go` mode or new conditions).
- Retrospective: should the bridge be replaced by native VBP?

## Contacts

- Tech: team owning Edge (`supabase/functions/*`).
- Biz: partner owner from [POP-BUSINESS-NEGOTIATION-CHECKLIST.md](./POP-BUSINESS-NEGOTIATION-CHECKLIST.md).
