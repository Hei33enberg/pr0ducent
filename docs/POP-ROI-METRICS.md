# VBP — metryki ROI i atrybucja (broker + partner)

## Cele pomiaru

- Udowodnić partnerowi **wartość kanału** (leady, handoff, konwersje).
- Optymalizować **koszt** orchestracji i mostów (bridge vs natywny VBP).

## Zdarzenia w produkcie (pr0ducent)

| Zdarzenie | Źródło | Tabela / kod |
|-----------|--------|----------------|
| Klik CTA handoff | Frontend | `referral_clicks` — [experiment-service.ts](../src/lib/experiment-service.ts) `logReferralClick` |
| Handoff zapisany | Frontend | `referral_conversions` z `conversion_type: builder_handoff` — `logReferralHandoff` |
| Eksperyment / run | Orchestrator | `experiments`, `run_jobs`, `run_tasks`, `builder_results`, `run_events` — [ORCHESTRATOR.md](./ORCHESTRATOR.md) |

## Metryki wewnętrzne (MVP)

| Metryka | Definicja | Użycie |
|---------|-----------|--------|
| **Leads** | Liczba `referral_clicks` per `tool_id` w oknie czasu | Wolumen zainteresowania |
| **Handoffs** | Liczba `referral_conversions` per `tool_id` | Głębsza intencja niż sam klik |
| **CTA rate** | handoffs / unikalne eksperymenty z danym tool | Jakość dopasowania UX |
| **Time-to-artifact** | `completed_at` − start runu (z `run_tasks` / `builder_results`) | SLA per builder |

Zapytania SQL: agregacja po `tool_id`, `created_at` — dashboard można zbudować w Supabase SQL / Metabase / wewnętrznym panelu.

## Metryki dla partnera (do negocjacji)

| Metryka | Opis |
|---------|------|
| **Qualified leads** | Zdefiniowane wspólnie (np. handoff + minimalny czas sesji u partnera) |
| **Attributed signups** | Wymaga eksportu lub API od buildera — poza samym MVP brokera |
| **Rev-share basis** | Przychód × współczynnik × okno atrybucji — [POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md) |

## Dashboard (plan)

1. **Faza 1:** Zapytania SQL + arkusz (CSV) dla partnera pilota.
2. **Faza 2:** Widok w aplikacji admin/partner (read-only) na `referral_*` z agregacją.
3. **Faza 3:** Webhook lub dzienny export do partnera (wymaga umowy).

## UTM / ref

- Spójne parametry w URL buildera: `utm_source=pr0ducent`, `utm_medium=broker`, `ref=<experiment_or_intent>` — uzgodnić z partnerem.
- [VBP] Zachowaj zgodność z polityką prywatności (nie przekazuj PII w URL bez potrzeby).

## Powiązane

- [POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md)
- [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md)
