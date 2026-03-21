# PBP webhook payload contract (`pbp-webhook`)

Authoritative handler: `supabase/functions/_shared/vbp-webhook-apply.ts` (invoked from `supabase/functions/pbp-webhook/index.ts`).

## Identity

Resolve `builder_results` / `run_tasks` using:

- `experiment_id` + `tool_id`, or
- `provider_run_id` (lookup latest `builder_results` row).

Fields may appear on the root JSON or inside `payload` (nested object). The broker merges both when resolving IDs.

## Event string (`normalizeWebhookEvent`)

The lifecycle keyword is derived from the first non-empty string among, in order:

`event` → `type` → `event_type` → `status` (root), then the same keys on the nested `payload` object if the root did not yield a value.

Implementation: `supabase/functions/_shared/webhook-event.ts` (also covered by `src/lib/webhook-event.test.ts`).

## Handled lifecycle values

| Normalized event | Effect |
|------------------|--------|
| `artifact_ready`, `artifact`, `preview_ready`, `deploy_ready` | Requires a preview URL (`preview_url`, `final_preview_url`, `deploy_url`, `url`, or nested equivalents). Sets `generating` / `building` as applicable. |
| `completed`, `success`, `done` | Marks run completed; optional preview URL. |
| `failed`, `error`, `cancelled`, `timeout` | Marks error; uses `message` / `error` (root or nested). |

Unhandled events return `applied: false` with `detail: unhandled_event:…`.

## User-facing docs

`/docs` (Developer Portal) must stay aligned with this table when examples change.
