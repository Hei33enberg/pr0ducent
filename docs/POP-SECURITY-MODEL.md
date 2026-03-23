# VBP — model bezpieczeństwa (brokera i buildera)

Normatywne szczegóły API: [VBP-SPEC.md](./VBP-SPEC.md). Implementacja brokera: [ORCHESTRATOR.md](./ORCHESTRATOR.md), [BUILDER-PIPELINE-HARDENING-AUDIT.md](./BUILDER-PIPELINE-HARDENING-AUDIT.md).

## Tożsamość i uwierzytelnianie

| Kierunek | Mechanizm |
|----------|-----------|
| Broker → Builder | `Authorization: Bearer <partner_api_key>` (klucz wydany builderem dla brokera). Opcjonalnie `broker_auth_token` w body dispatch do weryfikacji tożsamości brokera (`VBP_BROKER_OUTBOUND_SECRET`). |
| Builder → Broker (webhook) | HMAC-SHA256 nad **surowym** ciałem JSON; nagłówki `X-VBP-Signature` / aliasy zgodnie ze spec. |

## Sekrety i konfiguracja (pr0ducent)

- `VBP_WEBHOOK_SECRET` — weryfikacja przychodzących webhooków do `pbp-webhook`.
- `VBP_WEBHOOK_SECRET_REQUIRED=true` — tryb „fail closed” gdy sekret nie ustawiony (produkcja zalecana).
- Klucze partnerów buildera: `VBP_PARTNER_KEY` lub per-tool `api_secret_env` w `builder_integration_config`.

## Idempotencja i replay

- Tabela `pbp_webhook_deliveries` — deduplikacja po hash surowego body (zob. Edge `pbp-webhook`).
- Partnerzy powinni używać stabilnych payloadów; broker odrzuca duplikaty po sukcesie parsowania.

## Korelacja i audyt

- `run_id` (UUID zadania brokera) = `run_task_id`.
- `experiment_id`, `tool_id`, `provider_run_id` — mapowanie w `builder_results` / `run_events`.
- `trace_id` — opcjonalnie end-to-end w eventach.

## Dane użytkownika

- `user_context` w dispatch jest minimalny (np. `intent_id` / `experiment_id`); **nie** przekazujemy haseł ani pełnych profili.
- Handoff: `claim_token` jednorazowy po stronie buildera (best practice).

## Zagrożenia i mitygacja

| Zagrożenie | Mitygacja |
|------------|-----------|
| Fałszywy webhook bez HMAC | Wymóg sekretu w prod; opcjonalnie IP allowlist u partnera. |
| Przeciążenie dispatch | Rate limits (`builder_rate_limits`), circuit breaker w config. |
| Key leak | Rotacja kluczy, osobne klucze staging/prod, BYOA oddzielnie (Vault). |

## Production gate

Przed oznaczeniem integracji jako produkcyjnej: [POP-CONFORMANCE-PROFILES.md](./POP-CONFORMANCE-PROFILES.md) (profil **Production**).
