# POP Bridge Registry (TOP 10–15, vibe-coding category)

Źródło priorytetyzacji: [Product Hunt — Vibe coding](https://www.producthunt.com/categories/vibe-coding) oraz narzędzia powtarzalnie wymieniane w launchach tej kategorii.  
**Cel:** jedna tabela prawdy dla bizdevu, inżynierii i polityki ryzyka.

## Klasyfikacja `bridge_mode`

| Wartość | Znaczenie |
|---------|-----------|
| `api_native` | Publiczne API (REST/SDK) pod programatyczne uruchamianie buildów i statusu — preferowany tor do POP/VBP. |
| `api_partial` | Ograniczona powierzchnia (np. URL-trigger, embed) — most wymaga normalizacji; pełny POP wymaga rozszerzenia po stronie partnera. |
| `browser_only` | Brak stabilnego publicznego API — tylko UI; ewentualny most przez przeglądarkę (wysokie ryzyko ToS/utrzymania). |
| `no_go` | Tymczasowo wyłączone z mostów (ToS, brak powierzchni, lub wyłącznie po umowie). |

## Rejestr (stan roboczy — weryfikuj przy każdym pilocie)

| # | Builder | `bridge_mode` | Powierzchnia integracji (skrót) | Ryzyko / uwagi | Ścieżka do natywnego POP |
|---|---------|---------------|----------------------------------|----------------|---------------------------|
| 1 | **v0 (Vercel)** | `api_native` | Platform API (beta) + SDK (`v0-sdk`) | Rate limits, warunki beta | Już wzorcowy tor w repo (`run-on-v0`, klucz platformowy). |
| 2 | **Cursor** | `api_native` | Cloud Agents API (programmatic agents) | Beta; model inny niż „prompt→hosted app” | Mapowanie semantyki na `run_tasks` / artefakty repo. |
| 3 | **Lovable** | `api_partial` | [Build with URL](https://docs.lovable.dev/integrations/build-with-url) (autosubmit + prompt) | Brak publicznego dispatch/status jak VBP; URL length limits; user musi wybrać workspace | Partner wdraża `POST /vbp/v1/dispatch` + status/webhook. |
| 4 | **Replit** | `browser_only` | Agent w workspace; brak publicznego „dispatch z zewnątrz” w dokumentacji | ToS: m.in. zakaz scrapingu, nadużyć automatyzacji — most RPA tylko za zgodą prawną | Enterprise / partner API lub dedykowany endpoint. |
| 5 | **Bolt.new (StackBlitz)** | `browser_only` | WebContainers + UI; brak publicznego Bolt API jak VBP | Ewentualnie SDK StackBlitz do embedów, nie do pełnego agenta | Partner API lub formalny program partnerski. |
| 6 | **Firebase Studio** | `browser_only` | Agent w Google/Firebase; preview w ekosystemie | Integracja poza publicznym VBP wymaga ścieżki Google Cloud | Partner program / Gemini App Prototyping API roadmap. |
| 7 | **Webflow** | `api_partial` | Data/Designer API dla treści; AI site builder głównie w produkcie | Generacja stron może nie mieć jednego „dispatch prompt→app” API | MCP/LLM docs + ewentualne workflow partnerskie. |
| 8 | **Builder.io** | `api_partial` | Visual builder + GitHub; API pod content/design | Semantyka „agent PR” vs „single-shot app” | Wspólny model artefaktów (repo URL, preview). |
| 9 | **Framer** | `api_partial` | API/plugin ekosystem; AI w produkcie | Nie zawsze jeden run = jeden deploy | Handoff preview URL + claim. |
| 10 | **Bubble** | `browser_only` | Głównie no-code w UI | Publiczne API pod pełny broker rzadkie | Partner workflow lub iframe handoff. |
| 11 | **Glide** | `api_partial` | API pod dane / nie zawsze pod „AI build z promptu” | Dopasowanie do modelu runów | Partial POP (status z ich systemu). |
| 12 | **Softr** | `api_partial` | REST pod Airtable/data | Podobnie jak Glide | Partial. |
| 13 | **Windsurf** | `api_native` / `api_partial` | IDE + ewentualne API (weryfikuj aktualny changelog) | Model bliżej repo niż hosted app | Mapowanie na artefakty kodu. |
| 14 | **Anything** (PH) | `browser_only` | Produkt launchowy — weryfikuj API | Wysoka zmienność | Po stabilizacji — klasyfikacja. |
| 15 | **Alta / „AI app generator”** (PH) | `browser_only` | Różne launchy — weryfikuj | Często bez publicznego API | Pilot indywidualny. |

## Priorytet wdrożenia mostów (aggressive mode — zgodnie z polityką)

1. **`api_native` najpierw** — v0, Cursor (jeśli biznesowo pasuje), Windsurf gdy potwierdzone API.
2. **`api_partial`** — Lovable (URL), Webflow/Builder.io/Framer/Glide/Softr — krótszy czas do demo, średnie ryzyko driftu.
3. **`browser_only`** — tylko z [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md), feature-flagiem i kill-switch.

## Powiązane

- [POP-BRIDGE-ARCHITECTURE.md](./POP-BRIDGE-ARCHITECTURE.md) — komponenty mostów.
- [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md) — kiedy wolno aggressive bridge.
- [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md) — discovery techniczne pod natywny VBP.
