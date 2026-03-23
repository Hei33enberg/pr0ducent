# POP Bridge — polityka ryzyka (aggressive mode)

**Cel:** umożliwić szybkie demo wartości bez narażania firmy na naruszenie ToS partnerów lub reputacji.

## Zasady decyzyjne

1. **Domyślnie wyłączone:** `VITE_FF_BRIDGE_AGGRESSIVE` jest `false` ([featureFlags.ts](../src/lib/featureFlags.ts)).
2. **Bridge Mode** (`VITE_FF_BRIDGE_MODE`) musi być `true`, zanim aggressive ma znaczenie.
3. **Przegląd prawny** przed pierwszym wdrożeniem `browser_only` na produkcję — macierz: [POP-LEGAL-RISK-MATRIX.md](./POP-LEGAL-RISK-MATRIX.md).
4. **Zgoda partnera** — preferowana pisemna (email od partnerships lub umowa pilot); bez zgody: tylko `api_native` / `api_partial` z publicznie dozwolonym API/URL.

## Kiedy aggressive bridge jest **dozwolony**

| Warunek | Opis |
|---------|------|
| Rejestr | Builder oznaczony jako `browser_only` w [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md) + uzasadnienie biznesowe. |
| Kill-switch | Procedura z [POP-BRIDGE-RUNBOOK.md](./POP-BRIDGE-RUNBOOK.md) znana zespołowi on-call. |
| Limity | Niskie równoległość, circuit breaker, brak masowej automatyzacji kont. |
| Telemetria | ROI mierzony ([POP-ROI-METRICS.md](./POP-ROI-METRICS.md)); jeśli ROI < próg — wyłączenie. |

## Kiedy **zakazane** (`no_go`)

- Partner wyraźnie zabrania automatyzacji UI w regulaminie **i** brak pisemnej derogacji.
- Działania powodujące **scraping treści** lub **reverse engineering** API (np. fragmenty [Replit ToS](https://replit.com/terms-of-service)).
- Brak ownera odpowiedzialnego za utrzymanie mostu (ryzyko „zombie integration”).

## Eskalacja

1. PM + eng oceniają incydent w ciągu 24h.
2. Wyłączenie flag zgodnie z runbookiem.
3. Aktualizacja rejestru i ewentualnie komunikat do partnera.

## Powiązane

- [POP-BRIDGE-ARCHITECTURE.md](./POP-BRIDGE-ARCHITECTURE.md)
- [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md)
