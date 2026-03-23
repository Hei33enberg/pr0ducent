# VBP — pitch dla partnerów (builderów)

**Protokół:** Vibecoding Broker Protocol (VBP) — [VBP-SPEC.md](./VBP-SPEC.md).

## Problem

Brokery porównujące buildery (prompt → aplikacja) potrzebują **jednego kontraktu**: start runu, status, artefakty, handoff użytkownika, telemetria kosztów. Bez standardu każdy broker pisze integrację na wyłączność — kosztowne dla buildera i nie skaluje się.

## Propozycja wartości dla buildera

1. **Jedna integracja → wielu brokerów** — implementujesz VBP (`/vbp/v1/dispatch`, status lub webhook, opcjonalnie SSE), dostęp do ekosystemu brokerów zgodnych z VBP.
2. **Atrybucja leadów** — `user_context`, `claim_token`, referencje w handoff; broker może mierzyć konwersje do konta u Ciebie ([POP-ROI-METRICS.md](./POP-ROI-METRICS.md)).
3. **Poziom zaufania** — conformance „Verified / Partial” ([POP-CONFORMANCE-PROFILES.md](./POP-CONFORMANCE-PROFILES.md)), otwarty validator i schematy w repo OSS.
4. **Bezpieczeństwo** — klucz partnera, podpis webhooków HMAC, idempotencja ([POP-SECURITY-MODEL.md](./POP-SECURITY-MODEL.md)).

## Co musisz wdrożyć (minimum)

- `POST /vbp/v1/dispatch` → `202` + `provider_run_id`.
- **Completion path:** albo `GET /vbp/v1/status/{id}` (poll), albo `POST` na `webhook_url` brokera z podpisanym JSON.
- Opcjonalnie: `claim_token` + strona claim dla upgrade z demo do konta.

Szczegóły: [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md).

## Model współpracy (do doprecyzowania legal/commercial)

Warianty: rev-share od nowych płacących użytkowników, CPA za kwalifikowany signup, flat fee za pilot.  
Ramka: [POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md).

## Obiekcje — gotowe odpowiedzi

[POP-PARTNER-OBJECTIONS.md](./POP-PARTNER-OBJECTIONS.md).

## Następny krok

1. 30-min discovery ([PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md)).  
2. Pilot 2 tygodnie — staging + validator + jeden smoke E2E ([POP-PILOT-SUCCESS-CRITERIA.md](./POP-PILOT-SUCCESS-CRITERIA.md)).
