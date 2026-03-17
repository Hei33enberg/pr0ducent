

# Potężna tabela porównawcza builderów na stronie głównej

## Cel
Dodać na stronę główną (pod HeroSection, nad historią eksperymentów) dużą, horyzontalnie przesuwalną tabelę porównawczą **wszystkich 10 builderów** — widoczną od razu, bez klikania. Tabela ma być interaktywna, informacyjna i zachęcać do uruchomienia testu.

## Struktura tabeli

Kolumny = buildery (10 sztuk), wiersze = cechy. Pierwsza kolumna (cechy) jest "sticky" — przyklejona do lewej krawędzi podczas przewijania.

### Wiersze tabeli:
1. **Nagłówek** — logo/ikona + nazwa + badge "★ Partner" dla featured
2. **Opis** — jednozdaniowy opis buildera
3. **Stack** — technologie (React + TS + Tailwind...)
4. **Hosting** — gdzie deplouje
5. **Cechy** (checkmark/X) — ~12 feature'ów: Full-stack, One-click deploy, Backend, UI library, Collaboration, Git, Mobile-first, Enterprise, In-browser dev, Design systems, No-code friendly, API integration
6. **Strengths** — badges z mocnymi stronami
7. **Avg build time** — mockowany zakres czasu (z `mockDelayRange`)
8. **CTA** — przycisk "Test this builder" który pre-selectuje go w HeroSection

## Rozszerzenie danych w `tools.ts`

Dodać do `BuilderTool`:
- `pricing: string` — np. "Free tier + $25/mo", "Free", "$20/mo"
- `category: string` — np. "Full-stack builder", "Code editor", "UI generator"

Rozbudować `COMPARISON_FEATURES` — przenieść z `Compare.tsx` do osobnego pliku `src/config/comparison-features.ts` i rozszerzyć do ~12 cech, obejmujących wszystkie 10 narzędzi.

## Komponent `BuilderComparisonTable.tsx`

Nowy komponent w `src/components/BuilderComparisonTable.tsx`:

- **Kontener**: `overflow-x-auto` z custom scrollbar styling, opcjonalnie `ScrollArea` z radix
- **Sticky first column**: CSS `sticky left-0` z `z-10` i `bg-background` żeby nie nachodziła na dane
- **Nagłówki kolumn**: logo + nazwa + category badge, sticky top przy scrollu pionowym
- **Wiersze cech**: alternujące tło `bg-muted/20` co drugi wiersz
- **Checkmarki**: zielona ikona `CheckCircle2` vs szara `XCircle`
- **Hover**: podświetlenie całej kolumny (CSS `:hover` na `td` lub state)
- **Responsywność**: na mobile widać 1.5 kolumny + hint "swipe →" z gradientem fade na prawej krawędzi
- **CTA wiersz**: każda kolumna ma przycisk "Test [nazwa]" — callback do `onSelectTool(toolId)` który scrolluje do HeroSection i pre-selectuje narzędzie

## Integracja z `Index.tsx`

Tabela pojawia się pod `HeroSection`, nad `ExperimentHistory`:

```text
Header
HeroSection (prompt + tool selection)
BuilderComparisonTable (nowa sekcja)
ExperimentHistory
```

Callback `onSelectTool` z tabeli:
1. Scrolluje do HeroSection (smooth scroll)
2. Ustawia narzędzie jako jedyne zaznaczone w `ToolSelectionGrid`

Wymaga podniesienia stanu `selectedTools` do `Index.tsx` i przekazania go do `HeroSection` jako prop.

## Pliki do zmiany

| Plik | Zmiana |
|---|---|
| `src/config/tools.ts` | Dodać `pricing`, `category` do interfejsu i danych |
| `src/config/comparison-features.ts` | Nowy plik — wyciągnięta i rozbudowana lista cech |
| `src/components/BuilderComparisonTable.tsx` | Nowy komponent — cała tabela |
| `src/pages/Index.tsx` | Dodać tabelę między Hero a historią, podnieść stan `selectedTools` |
| `src/components/HeroSection.tsx` | Przyjmować `selectedTools` i `onSelectionChange` jako props (controlled) |
| `src/pages/Compare.tsx` | Zaimportować cechy z `comparison-features.ts` zamiast local const |

