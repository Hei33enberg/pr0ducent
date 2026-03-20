# Drugi (i kolejne) builder — playbook

## Kolejność decyzji

1. **Czy partner ma publiczne API lub wdroży VBP?**  
   - Tak, VBP → `builder_integration_config.integration_type = 'vbp'`, `api_base_url`, `api_secret_env`, tier 1–2, `enabled = true`.  
   - Tak, REST ale nie VBP → `integration_type = 'rest_api'`, wypełnij `request_template`, `response_id_path`, `poll_*` zgodnie z [`generic-rest-adapter.ts`](../supabase/functions/_shared/adapters/generic-rest-adapter.ts).  
   - Nie → zostaje **benchmark** do czasu partnerstwa ([WIRE-BUILDERS.md](./WIRE-BUILDERS.md)).

2. **Sekrety** — w Supabase Edge Secrets dodaj klucz wskazany przez `api_secret_env` (np. `LOVABLE_PARTNER_KEY`).

3. **Rate limits** — wstaw lub zaktualizuj wiersz w `builder_rate_limits` dla `tool_id` (domyślnie tylko `v0` ma wiersz z migracji).

4. **Test** — [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md) + [SMOKE-TEST-ORCHESTRATOR.md](./SMOKE-TEST-ORCHESTRATOR.md) z `selectedTools` zawierającym nowe `tool_id`.

5. **Frontend** — [`useBuilderApi`](../src/hooks/useBuilderApi.ts) dla narzędzi bez dedykowanego poll-u (nie-v0) odświeża `builder_results` z bazy w tle; VBP może później dodać SSE zamiast poll-u.

## Rekomendowany następny kandydat (produkt)

- **Replit** — publiczne API agentów (weryfikacja ToS).  
- **Lovable / Bolt** — wymagają umowy partnera lub ich implementacji **VBP** po Twojej stronie standardu ([VBP-SPEC.md](./VBP-SPEC.md)).

## Powiązanie z Open Protocol

Gdy builder wdroży VBP, **nie** potrzebujesz osobnego adaptera w kodzie — wystarczy konfiguracja + `vbp-adapter`.
