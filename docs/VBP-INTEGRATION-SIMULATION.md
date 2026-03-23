# VBP — symulacja integracji (staging / lokalnie)

Cel: **powtarzalny dry-run** bez produkcyjnego partnera — potwierdzić, że minimalna implementacja VBP, orchestrator i (opcjonalnie) webhook działają end-to-end.

## 1. Lokalnie: minimal-node + validator

1. Uruchom przykład z [protocol/vibecoding-broker-protocol/examples/minimal-node/README.md](../protocol/vibecoding-broker-protocol/examples/minimal-node/README.md) na znanym porcie (np. `http://localhost:3456`).
2. Z katalogu `protocol/vibecoding-broker-protocol/validator`:

   ```bash
   npm install
   node cli.mjs http://localhost:3456/vbp/v1
   ```

   Oczekiwany wynik: walidacja przejdzie lub raportuje konkretne braki zgodne z [VBP-SPEC.md](./VBP-SPEC.md).

## 2. Staging Supabase: wiersz testowy

1. W projekcie **staging** (nie produkcja) dodaj lub zaktualizuj wiersz w `builder_integration_config`:
   - `integration_type` zgodny z adapterem VBP (`vbp` / ścieżka z [ORCHESTRATOR.md](./ORCHESTRATOR.md)),
   - `api_base_url` wskazujący na Twój serwer — jeśli broker nie widzi `localhost`, użyj tunelu (ngrok, Cloudflare Tunnel) i wklej publiczny HTTPS URL z sufiksem `/vbp/v1` jeśli wymagany.
2. Upewnij się, że migracje z repo są na stagingu (kolumny VBP, circuit breaker, itd.).

## 3. Smoke orchestratora

1. Zaloguj użytkownika testowego w aplikacji podpiętej do **staging** Supabase.
2. Uruchom jedną rundę multi-buildera z `tool_id` powiązanym z powyższą konfiguracją — przez UI lub zgodnie z [ORCHESTRATOR.md](./ORCHESTRATOR.md) (`dispatch-builders` → `run_tasks` → `run_events`).
3. Sprawdź: `run_tasks` przechodzi w stan terminalny, `builder_results` zawiera oczekiwane pola.

## 4. Webhook (opcjonalnie)

1. Jeśli minimal-node lub Twój serwer wysyła completion na `pbp-webhook`, wyślij przykładowy payload zgodny z [WEBHOOK-PAYLOAD-CONTRACT.md](./WEBHOOK-PAYLOAD-CONTRACT.md) (podpis HMAC jeśli włączony na stagingu).
2. Zweryfikuj idempotencję: podwójne identyczne body nie powinny psuć stanu.

## 5. Checklist sukcesu (symulacja)

Uproszczona wersja [POP-PILOT-SUCCESS-CRITERIA.md](./POP-PILOT-SUCCESS-CRITERIA.md):

- [ ] Validator przechodzi na publicznym URL bazowym.
- [ ] Jeden dispatch z brokera kończy się statusem sukcesu lub kontrolowanym błędem z logiem w `run_events`.
- [ ] `pbp-webhook` (jeśli używany) aktualizuje wiersze bez duplikatów przy retry.

## Powiązane

- [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md)
- [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md)
