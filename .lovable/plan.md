

# Plan: Kompleksowa naprawa i rozbudowa pr0ducent

## Podsumowanie

Naprawiamy nawigację, logo, kalkulator; podpinamy crony (sync builderów + blog); poprawiamy logotypy builderów; przebudowujemy tabelę porównawczą; dodajemy mock generator dla wszystkich builderów; wstawiamy przykładowe runy; optymalizujemy UI/UX/performance.

---

## 1. Naprawa nawigacji i logo

**Problem:** Logo na podstronach (np. /auth, /pricing) nie kieruje do `/` bo `handleLogoClick` wymaga `experiment`. Linki `#comparison`, `#faq` nie działają na podstronach (tych sekcji tam nie ma). Kalkulator brak w menu.

**Rozwiązanie:**
- `PageFrame.tsx`: Logo `onClick` → zawsze `navigate("/")`. Linki z `#` na podstronach → `navigate("/#comparison")` itd.
- Dodać link do Kalkulatora w `navLinks` i `FloatingToolbar`
- Footer: dodać link do Kalkulatora

---

## 2. Kalkulator na stronie głównej

**Problem:** Kalkulator jest na osobnej stronie `/calculator`, trudno go znaleźć.

**Rozwiązanie:**
- Dodać sekcję `<CalculatorSection />` na `Index.tsx` (wersja inline, uproszczona) z linkiem "Full Calculator →" do `/calculator`
- Umieścić ją między `BuilderComparisonTable` a `FAQ`

---

## 3. Poprawne logotypy builderów

**Problem:** Wiele builderów ma puste `logoUrl` (antigravity, build0, orchids, floot), a niektóre URL mogą być nieaktualne.

**Rozwiązanie w `src/config/tools.ts`:**
- Zaktualizować URL logotypów do działających favicon/logo (lub użyć Google favicon proxy: `https://www.google.com/s2/favicons?domain=example.com&sz=64`)
- Dla builderów bez oficjalnej strony → użyć placeholdera z pierwszą literą (już działa, ale poprawić fallback w komponentach)

---

## 4. Cron: Synchronizacja danych builderów

**Problem:** `sync-builder-data` istnieje jako edge function, ale nie ma crona.

**Rozwiązanie:**
- Włączyć extensions `pg_cron` i `pg_net` (migration)
- Utworzyć cron job (SQL insert, nie migration) wywołujący `sync-builder-data` co 24h
- Dodać RLS insert policy na `builder_sync_data` i `builder_pricing_plans` dla service_role (już mają upsert w edge function z service key)

---

## 5. Cron: Automatyczne artykuły na bloga

**Problem:** `generate-blog-post` istnieje, ale nie jest zautomatyzowany.

**Rozwiązanie:**
- Stworzyć nową edge function `cron-blog-generator` która:
  - Generuje rotacyjnie tematy (porównania builderów, analizy ofert, update roundupy, best-for-X)
  - Wywołuje `generate-blog-post` z `autoTranslate: true`
  - Publikuje jako draft (admin zatwierdza) lub auto-publish
- Dodać cron job co 3 dni wywołujący `cron-blog-generator`

---

## 6. Dokumentacja builderów pod SEO

**Rozwiązanie:**
- Nowa strona `/builders/:id` z pełnym profilem buildera (dane z `builder_sync_data` + `builder_pricing_plans`)
- Route w `App.tsx` → `BuilderProfile.tsx`
- Zawiera: opis, pricing tiers, AI models, features, changelog, PVI score, community rating, link referralowy
- Linkowane z tabeli porównawczej i footera
- Strona `/builders` jako index z listą wszystkich builderów

---

## 7. Przebudowa tabeli porównawczej

**Problem:** Tabela jest "brzydka, nieprawdziwa, słaba" — dane statyczne, layout ciasny, brak wizualnego wow.

**Rozwiązanie:**
- Przeprojektować na card-based layout zamiast tabeli (lepsze na mobile)
- Każdy builder jako karta z: logo, PVI score bar, kluczowe metryki, pricing, CTA
- Dodać filtry: kategoria, price range, feature checklist
- Dane z DB (builder_sync_data + builder_pricing_plans) zamiast statycznych z `tools.ts`
- Wyróżnić partnera (Lovable) wizualnie ale nie nachalnie
- Dodać porównanie 2-3 builderów side-by-side (select & compare)

---

## 8. Mock generator dla wszystkich builderów

**Problem:** Tylko v0 ma real API. Reszta potrzebuje mocków które wyglądają jak prawdziwy build.

**Rozwiązanie:**
- Rozbudować `mock-experiment.ts`: po "completed" generować mock preview (screenshot placeholder, bardziej realistyczne opisy)
- W `ComparisonCanvas` dodać animację generowania (typing, progress steps) zamiast prostego spinnera
- Każdy builder tile: pokazać mock screenshot z gradientem i nazwą buildera
- Przygotować placeholder preview images per builder (np. generowane CSS gradients + tekst)

---

## 9. Przykładowe runy w Runs Now

**Problem:** Brak danych, strona pusta.

**Rozwiązanie:**
- Seed database z przykładowymi eksperymentami (migration z insert do `experiments` i `experiment_runs`)
- Oznaczone jako `is_public = true`, `is_free_run = true`
- Różne prompty i kombinacje builderów

---

## 10. Optymalizacja performance, UI, UX, design

**Rozwiązanie:**
- Lazy load stron: `React.lazy()` + `Suspense` dla wszystkich route'ów
- Obrazki: lazy loading, proper `loading="lazy"` na logo builderów
- Reduce bundle: dynamiczny import framer-motion w komponentach poniżej foldu
- Dark mode fix: logo `color: "#000"` → użyć `text-foreground`
- Mobile: poprawić responsywność tabeli porównawczej
- Smooth page transitions
- Skeleton loaders dla danych z DB (pricing plans, ratings)

---

## Kolejność implementacji

1. Naprawa nawigacji + logo (quick wins)
2. Logotypy builderów
3. Mock generator + przykładowe runy
4. Przebudowa tabeli porównawczej
5. Kalkulator inline na głównej
6. Strony dokumentacji builderów
7. Crony (sync + blog)
8. Optymalizacja performance

---

## Pliki do utworzenia/edycji

| Plik | Akcja |
|------|-------|
| `src/components/PageFrame.tsx` | Edit - nawigacja, logo |
| `src/components/FloatingToolbar.tsx` | Edit - dodać Calculator |
| `src/components/Footer.tsx` | Edit - dodać Calculator link |
| `src/config/tools.ts` | Edit - logotypy |
| `src/pages/Index.tsx` | Edit - inline calculator sekcja |
| `src/components/BuilderComparisonTable.tsx` | Rewrite - card layout |
| `src/components/ComparisonCanvas.tsx` | Edit - mock previews |
| `src/lib/mock-experiment.ts` | Edit - lepsze mocki |
| `src/pages/BuilderProfile.tsx` | Create |
| `src/pages/BuildersIndex.tsx` | Create |
| `src/components/InlineCalculator.tsx` | Create |
| `supabase/functions/cron-blog-generator/index.ts` | Create |
| `src/App.tsx` | Edit - nowe route'y, lazy loading |
| Migration: pg_cron jobs | SQL insert |
| Migration: seed example experiments | SQL insert |

