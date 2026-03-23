# VBP — macierz ryzyk prawnych i ToS (bridge vs natywny)

**Cel:** świadome decyzje przed włączeniem mostów agresywnych lub zbieraniem danych u partnerów. **Nie zastępuje** konsultacji z prawnikiem.

## Oś: typ integracji

| Typ | Opis | Typowy poziom ryzyka |
|-----|------|----------------------|
| **Natywny VBP** | Publiczne API buildera zgodne z [VBP-SPEC.md](./VBP-SPEC.md), umowa partnerska | Niski (kontraktowe warunki jasne) |
| **api_partial** | URL-trigger, embed, ograniczone API | Średni (zmienność, brak statusu) |
| **browser_only** | Automatyzacja UI bez publicznego API | Wysoki (ToS, zmiany UI, abuse) |

## Przykładowe kategorie ryzyka

| Ryzyko | Opis | Mitygacja |
|--------|------|-----------|
| **Naruszenie ToS** | Automatyzacja logowania, scraping, obejścia limitów | Tylko za pisemną zgodą lub programem partnerskim; inaczej `no_go`. |
| **Odpowiedzialność za treść** | Prompty użytkowników generują nielegalne treści u partnera | Polityki trust & safety po obu stronach; reporting. |
| **Dane osobowe** | Przekazywanie identyfikatorów w `user_context` | Minimalizacja; ROPA/DPA jeśli EU; zgody użytkownika. |
| **IP / licencje kodu** | Kto posiada wygenerowany kod | Zgodnie z regulaminem buildera; ujawnienie w pitchu. |
| **Atrybucja i spory** | Spór o prowizję | Pisemny model ([POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md)), jedno źródło prawdy eventów. |

## Kill-switch

Jeśli partner zgłosi naruszenie lub zmieni ToS: **natychmiastowe wyłączenie** mostu w konfiguracji (`bridge_mode = no_go` w [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md)) — procedura: [POP-BRIDGE-RUNBOOK.md](./POP-BRIDGE-RUNBOOK.md).

## Replit (przykład)

Publiczne [Terms of Service](https://replit.com/terms-of-service) zawierają m.in. zakazy wobec **scrapingu**, **reverse-engineeringu**, **nadużycia zasobów** i **tworzenia kont automatycznie**. Mosty RPA bez zgody wiążą się z wysokim ryzykiem — traktuj jako **wymagające umowy** lub `no_go`.
