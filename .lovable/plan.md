

# Następne kroki MVP — na podstawie analizy SWOT i Business Model Canvas

## Co już mamy
- Canvas porównawczy z mockowanymi wynikami, scoring, filtry, sortowanie, winner banner
- Auth (email) + Supabase persistence + localStorage fallback dla gości
- Referral tracking + dark mode + historia eksperymentów

## Co warto dodać w MVP (priorytetyzowane)

### 1. Prompt templates / przykłady use-case'ów
Analiza wskazuje segmenty: indie hackerzy, PM-owie, agencje. Każdy ma inne potrzeby. Dodanie gotowych szablonów promptów ("E-commerce store", "SaaS dashboard", "Portfolio site") obniża barierę wejścia i pokazuje wartość od razu.

- **Gdzie**: `HeroSection.tsx` — klikalne chipy nad textarea
- **Dane**: nowy plik `src/config/prompt-templates.ts` z ~6 szablonami
- **Efekt**: kliknięcie wstawia tekst do pola prompt

### 2. Export / share wyników eksperymentu
Analiza mówi o value dla agencji ("udowodnić klientowi, że wybór był racjonalny"). Możliwość udostępnienia linku do wyników lub eksportu.

- **Share link**: publiczny route `/experiment/:id` z read-only widokiem canvasu
- **Migracja DB**: dodać kolumnę `is_public boolean default false` do `experiments`
- **RLS**: dodać policy SELECT dla `is_public = true` (bez auth)
- **Komponent**: `ShareButton` w headerze canvasu — kopiuje link + toggle public/private

### 3. Strona SEO "vs" / porównawcza (landing)
Analiza wymienia SEO na frazy "Lovable vs Replit vs v0" jako kluczowy kanał. Statyczna strona porównawcza z danymi z `tools.ts`.

- **Route**: `/compare` lub `/vs`
- **Komponent**: `src/pages/Compare.tsx` — tabela porównawcza (stack, hosting, strengths) + CTA "Run your own test"
- **SEO**: meta tagi, structured data

### 4. Limit testów dla gości + soft paywall
Analiza mówi o "free z ograniczoną liczbą testów/miesiąc". Prosty mechanizm:

- **localStorage counter**: goście mogą uruchomić max 3 eksperymenty
- **Po limicie**: modal zachęcający do rejestracji (nie blokujący przeglądania historii)
- **Zalogowani**: bez limitu w MVP

### 5. Use-case tagi na eksperymentach
Pozwala później agregować dane ("jakie typy apek testują userzy") — cenione przez vendorów wg analizy.

- **UI**: opcjonalny select/tagi w `HeroSection` przy submicie (e-commerce, SaaS, portfolio, internal tool, mobile app)
- **DB**: kolumna `use_case_tags text[]` w `experiments`
- **Historia**: pokazuje tagi obok promptu

### 6. Lepszy onboarding — demo bez konta
Analiza podkreśla "szybki test demo bez konta". Już to mamy (goście mogą testować), ale warto dodać:

- **Demo button**: "Try with sample prompt" — uruchamia predefiniowany eksperyment jednym klikiem
- **Gdzie**: pod głównym CTA w `HeroSection`

---

## Kolejność implementacji

1. Prompt templates + demo button (najszybsze, największy wpływ na konwersję)
2. Use-case tagi (mała zmiana DB + UI)
3. Share/export wyników (nowy route + RLS)
4. Limit testów dla gości
5. Strona porównawcza SEO

## Zakres zmian technicznych

| Zadanie | Pliki | DB migration |
|---|---|---|
| Prompt templates | `prompt-templates.ts`, `HeroSection.tsx` | — |
| Demo button | `HeroSection.tsx` | — |
| Use-case tagi | `HeroSection.tsx`, `ToolSelectionGrid.tsx`, `ExperimentHistory.tsx`, `experiment.ts` | `ALTER TABLE experiments ADD use_case_tags text[] DEFAULT '{}'` |
| Share link | nowy `pages/Experiment.tsx`, `ComparisonCanvas.tsx`, `App.tsx` | `ALTER TABLE experiments ADD is_public boolean DEFAULT false` + nowa RLS policy |
| Guest limit | `Index.tsx`, nowy `components/GuestLimitModal.tsx` | — |
| Strona SEO | nowy `pages/Compare.tsx`, `App.tsx` | — |

