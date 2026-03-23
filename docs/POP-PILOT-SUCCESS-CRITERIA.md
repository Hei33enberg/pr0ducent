# POP — kryteria sukcesu pilota (2 tygodnie)

Szablon — dostosuj liczby do partnera. Techniczna checklista: [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md).

## Cele minimalne (must-have)

| Kryterium | Jak zmierzyć |
|-----------|----------------|
| **Dispatch działa** | `POST /vbp/v1/dispatch` → `202` + `provider_run_id` na staging |
| **Completion path** | Co najmniej jeden terminal: webhook **lub** poll status → `builder_results.status = completed` |
| **Conformance** | `validator/cli.mjs` przechodzi na `api_base_url` partnera (poziom Partial minimum) |
| **Bezpieczeństwo** | Webhook z podpisem HMAC na staging; sekret skonfigurowany po obu stronach |

## Cele pożądane (should-have)

| Kryterium | Jak zmierzyć |
|-----------|----------------|
| Claim / handoff | Użytkownik może przejść z demo do konta u buildera (`claim_token` lub URL) |
| Observability | Korelacja `trace_id` / `run_id` widoczna w logach po obu stronach |
| Limity | Zadeklarowane rate limity; brak sustained 429 bez backoffu |

## Cele rozwojowe (could-have)

- SSE lub postęp przez webhooki pośrednie.
- Export artefaktu (ZIP / repo URL) zgodnie z VBP.

## Wynik końcowy pilota

| Wynik | Warunek |
|-------|---------|
| **Verified** | Must-have + should-have większość; brak krytycznych bugów przez 1 tydzień |
| **Partial** | Must-have; dokumentowane luki (np. brak exportu) |
| **Nie kontynuuj** | Nieosiągnięte must-have lub veto prawne |

Powiązane: [protocol/vibecoding-broker-protocol/CONFORMANCE.md](../protocol/vibecoding-broker-protocol/CONFORMANCE.md).
