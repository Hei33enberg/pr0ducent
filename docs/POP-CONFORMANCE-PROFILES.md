# VBP — profile conformance i brama produkcyjna

Bazuje na [protocol/vibecoding-broker-protocol/CONFORMANCE.md](../protocol/vibecoding-broker-protocol/CONFORMANCE.md). Poziomy **Verified / Partial / Experimental** opisują jakość integracji; **Production gate** to warunki włączenia routingu na produkcji u brokera.

## Poziomy (zgodność z implementacją buildera)

| Profil | Wymagania | Użycie |
|--------|-----------|--------|
| **Verified** | Validator (`npm run vbp-validate` / `validator/cli.mjs`) przechodzi na `api_base_url`; wymagane trasy i kształty odpowiedzi zgodne z [VBP-SPEC.md](./VBP-SPEC.md). | Lista rekomendowanych, badge w UI (polityka produktu). |
| **Partial** | Dispatch + **jedna** ścieżka zakończenia (poll **lub** webhook); znane luki udokumentowane (np. brak exportu = 501). | Wczesny partner, jasny disclaimer. |
| **Experimental** | W rozwoju; integracja może być wyłączona lub za flagą. | Staging / demo. |

## Brama **Production** (broker — pr0ducent)

Integracja nie powinna być włączona na produkcji (`builder_integration_config.enabled`, tier ≤2), dopóki nie są spełnione:

| # | Warunek | Uwagi |
|---|---------|--------|
| 1 | **Webhook security** | `VBP_WEBHOOK_SECRET` ustawiony; `VBP_WEBHOOK_SECRET_REQUIRED=true` na produkcji ([POP-SECURITY-MODEL.md](./POP-SECURITY-MODEL.md)). |
| 2 | **Terminal states** | `completed` / `failed` mapowane do `builder_results` + `run_tasks` bez hangów. |
| 3 | **Idempotencja** | Duplikaty webhooków nie psują stanu (`pbp_webhook_deliveries`). |
| 4 | **Rate limits** | Wpis w `builder_rate_limits` zgodny z umową z partnerem. |
| 5 | **Observability** | `run_events` z `trace_id` / `run_task_id` dla ścieżki audytu. |
| 6 | **Pilot** | Zakończony z wynikiem Verified lub Partial z [POP-PILOT-SUCCESS-CRITERIA.md](./POP-PILOT-SUCCESS-CRITERIA.md). |

## Security gate (skrót)

Pełny opis: [POP-SECURITY-MODEL.md](./POP-SECURITY-MODEL.md).  
**Reguła:** brak podpisu webhooków przy wymaganym sekrecie = **blokada** włączenia produkcyjnego routingu.

## Zgodność ze spec a drift

Przy każdej zmianie [VBP-SPEC.md](./VBP-SPEC.md) lub schematów JSON:

1. Aktualizacja `protocol/vibecoding-broker-protocol/schemas/`.
2. Przejście CI `vbp-protocol` (workflow w repo).
3. Aktualizacja adapterów Edge (`vbp-adapter`, `pbp-webhook`, `poll-builder-status`).

Zob. [BUILDER-PIPELINE-HARDENING-AUDIT.md](./BUILDER-PIPELINE-HARDENING-AUDIT.md).
