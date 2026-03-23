# VBP conformance

## Levels

| Level | Meaning |
|--------|---------|
| **Verified** | Passes `validator/cli.mjs` against live `api_base_url`; required routes and shapes match. |
| **Partial** | Dispatch + status OR webhook works; artifacts/export optional. |
| **Experimental** | In development; not listed for production broker routing. |

## Broker checklist (pr0ducent)

1. `POST /vbp/v1/dispatch` returns `202` + `provider_run_id` (or documented sync contract).
2. Either `GET /vbp/v1/status/{id}` **or** webhooks to the broker `pbp-webhook` URL with signed payloads.
3. Terminal states align with [status-response.json](./schemas/status-response.json) (`completed` / `failed` / …).
4. Optional: `GET /artifacts/…`, `GET /export/…` (501 acceptable for export).

**Production gate (pr0ducent broker):** see [docs/POP-CONFORMANCE-PROFILES.md](../../docs/POP-CONFORMANCE-PROFILES.md) — webhook secret, rate limits, pilot sign-off before production routing.

## Running the validator

```bash
cd validator && npm install && node cli.mjs https://your-builder.example.com/vbp/v1
```

CI: mirror [.github/workflows/vbp-protocol.yml](../../.github/workflows/vbp-protocol.yml) when this tree is published as a standalone repository.
