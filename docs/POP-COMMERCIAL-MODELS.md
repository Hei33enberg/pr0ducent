# VBP — modele komercyjne i rozliczenia (ramka)

**Disclaimer:** nie jest poradą prawną ani podatkową — ustal z counsel przed podpisem.

## Cele dla buildera

- Nowi użytkownicy z kanału brokerów (discovery).
- Przewidywalny koszt wsparcia integracji (pilot → produkcja).
- Jasna **atrybucja** (kto przyszedł z którego brokera).

## Cele dla brokera (pr0ducent)

- Zrównoważenie kosztów orchestracji (Edge, kolejka, scoring).
- Uczciwa prezentacja narzędzi (benchmark vs live).
- Dane do rozliczeń z partnerami.

## Warianty rozliczeń

| Model | Kiedy | Uwagi |
|-------|--------|--------|
| **Rev-share** | Builder płaci % od przychodu od użytkowników przypisanych do POP | Wymaga definicji „qualified account” i okna atrybucji (np. 30–90 dni). |
| **CPA** | Płatność za kwalifikowany signup lub pierwszą płatność | Prostsze w pomiarze; ryzyko fraudu — weryfikacja po stronie buildera. |
| **Flat pilot** | Stała opłata za pilot techniczny + wsparcie | Dobre na start bez złożonego trackingu. |
| **Hybrid** | Niski flat + niższy rev-share | Często akceptowalne dla obu stron. |

## Zdarzenia rozliczeniowe (do spięcia z produktem)

1. **Lead:** użytkownik kliknął CTA „Kontynuuj w {Builder}” — log `referral_clicks` (broker).
2. **Handoff:** `logReferralHandoff` / `referral_conversions` z `conversion_type: builder_handoff` (implementacja w [experiment-service.ts](../src/lib/experiment-service.ts)).
3. **Konwersja u buildera:** partner potwierdza (np. webhook do brokera, plik eksportu, dashboard partnerski) — **poza MVP** wymaga umowy.

## Zasady atrybucji (negocjacyjne)

- **First-touch** vs **last-touch** — ustal jedno dla danego programu.
- **Okno czasowe** — np. 30 dni od pierwszego kliknięcia z POP.
- **Dedup** — jeden użytkownik = jedna konwersja na okno (np. po `user_id` lub email hash po stronie buildera).

## Powiązane

- [POP-ROI-METRICS.md](./POP-ROI-METRICS.md)
- [POP-BUSINESS-NEGOTIATION-CHECKLIST.md](./POP-BUSINESS-NEGOTIATION-CHECKLIST.md)
