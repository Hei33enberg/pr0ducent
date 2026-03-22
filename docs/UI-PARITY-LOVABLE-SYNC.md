# UI parity — sync z Lovable / murd0ch (stan 2026-03)

Ten dokument **nie zastępuje** [BRAND-GUIDELINES.md](./BRAND-GUIDELINES.md) ani [DESIGN-TOKENS.md](./DESIGN-TOKENS.md); opisuje **co już jest na `main` po ostatnich merge’ach z Lovable** oraz **co domknęliśmy z Cursor**, żeby plan „pr0ducent vs murd0ch” był egzekwowalny.

## Ostatnie zmiany z Lovable (skrót z historii `main`)

Najnowsze commity to m.in. *Overhauled layout and navigation*, *Layout and UI polish*, *Align UI to murd0ch frame*. W repo pojawiły się m.in.:

| Obszar | Co jest |
|--------|---------|
| **Frame / nav** | `PageFrame` — ilustrowane ikony nawigacji (`src/assets/nav-icons/*.png`), układ zgodny z „glass + page-frame” |
| **Brand** | `BrandText.tsx` — wordmark z powiększoną cyfrą + opcjonalne ™ |
| **Landing rhythm** | `Index.tsx` — sekcje w `section-gradient-*` / `section-wash-*`, `BigHeadline`, porządek pod naprzemienne tła |
| **Ilustracje** | `IllustDivider.tsx`, `useInView` — wzorzec jak w murd0ch (lazy / fade) |
| **CSS** | Rozszerzony `index.css` (m.in. wash variants, sekcje ciemne / gradient) |
| **App.css** | Oczyśczone z boilerplate Vite (zostaje tylko to, co potrzebne) |

## Macierz planu „UI vs murd0ch” — status

| Element | murd0ch / plan | pr0ducent (stan) |
|---------|----------------|-------------------|
| Tokeny HSL w `:root` | Tak | Tak — `src/index.css` |
| `gradient-canvas` + `page-frame` | Tak | Tak — `AmbientBackground`, `PageFrame` |
| `BrandText` | Tak | Tak |
| Sekcje z naprzemiennym rytmem | Tak | Tak — landing + klasy `section-*` |
| Floating toolbar (scrollspy LP) | Tak (duży LP) | Nie — produkt ma hamburger + routing; **celowe** |
| Pipeline generowania assetów (fal/Kling) | Tak w newsc0rp | Poza zakresem pr0ducent; hero używa statycznej karykatury |
| **How it works** na home | Było w starszym układzie | Przywrócone w `Index` (footer `#how-it-works` działa) |
| Favicon marki | Docelowo własny | `public/favicon.svg` + link w `index.html` |
| `prefers-reduced-motion` dla ilustracji | Dobry zwyczaj | Reguły w `index.css` dla `.illust-*` |

## Definition of Done — nowe sekcje UI (skrót)

1. Kolory: **`hsl(var(--…))` / klasy Tailwind** (`text-foreground`, `bg-muted`, …), nie surowe hex w komponentach (wyjątki: np. gradient zdefiniowany w CSS).
2. Nagłówki: **serif brand** z globalnych reguł; w sekcjach `.section-dark*` kontrast tekstu jak w tokenach.
3. Sekcje: jedna z **kanonicznych klas** powierzchni (`section-gradient-peach`, `section-wash-teal`, `section-dark`, … — patrz `index.css`).
4. Animacje ilustracji: klasy **`.illust-float`** itd.; szanuj **reduced motion**.
5. Wordmark: **`BrandText`**, nie ręczne `span` (poza migracją starych plików).

Pełniejsza lista: [DESIGN-TOKENS.md](./DESIGN-TOKENS.md) (sekcja *Compliance*).

## Weryfikacja Lovable Cloud (snapshot operatora)

Poniżej: typowy wynik audytu, gdy Lovable sprawdza **stan faktyczny schematu** vs **44 pliki** w `supabase/migrations/`.  
**Uwaga:** tabela `supabase_migrations.schema_migrations` może pokazywać **inne timestampy w nazwie** niż pliki z GitHuba, jeśli migracje były kiedyś wklejane ręcznie lub aplikowane innym narzędziem — **źródłem prawdy dla zespołu jest repo + zgodność obiektów** (tabele, RPC, MV), nie wyłącznie lista wierszy w `schema_migrations`.

| Obszar | Oczekiwany stan (zgodny z `main`) |
|--------|-----------------------------------|
| **Migracje / schema** | Obiekty z 44 migracji obecne: `run_jobs`, `run_tasks`, `run_events`, broker pool / lease, BYOA + RPC, `builder_rate_limits`, `builder_try_dispatch_slot`, MV `builder_leaderboard`, arena / benchmark, itd. |
| **Builder config** | v0: enabled, tier 1; replit: gotowy, wyłączony do realnego API; reszta benchmark / disabled wg seedów |
| **Edge `config.toml`** | Np. `dispatch-builders` JWT, `process-task-queue` bez JWT (service role), `pbp-webhook` wg repo |
| **Sekrety** | Min. `SUPABASE_SERVICE_ROLE_KEY`, `V0_API_KEY`, Stripe/Perplexity wg potrzeb, `EDGE_ALLOWED_ORIGINS` |
| **Frontend** | Build OK → **Publish** w Lovable |

Jeśli audyt potwierdza obiekty i sekrety, **Publish aplikacji** jest sensownym następnym krokiem; po publikacji warto krótki smoke (zalogowany user → run, kolejka nie wisi w `queued`).

## Prompt dla operatora Lovable (cloud Supabase + deploy)

**Wklej w Lovable po Pull z GitHub i przed Publish**, jeśli ten release dotyka **backendu** albo nie jesteś pewien, czy cloud jest zsynchronizowany z `main`:

```text
Jesteś operatorem Lovable dla pr0ducent (frontend na Lovable, Supabase w chmurze).

1) Repo: w projekcie Lovable zrób Sync / Pull z GitHub `main` tak, aby był ten sam commit co origin/main.

2) Supabase (cloud) — migracje:
   - Otwórz SQL migracje z repo: folder supabase/migrations/ w kolejności timestampów.
   - Uruchom na projekcie Lovable-linked Supabase WSZYSTKIE migracje, których jeszcze nie ma (nie pomijaj orchestratora / VBP jeśli są w main).
   - Po migracjach: sprawdź że tabele run_tasks, run_jobs, builder_integration_config itd. są zgodne z docs/ORCHESTRATOR.md i docs/DEVELOPMENT-STATUS.md.

3) Edge Functions — redeploy jeśli zmieniły się w tym releasie:
   - Obowiązkowo przy zmianach kolejki: process-task-queue (service role), dispatch-builders.
   - W razie webhooków: pbp-webhook.
   - Sprawdź supabase/config.toml (verify_jwt) dla każdej funkcji po deploy.

4) Sekrety: upewnij się że w Supabase Functions są ustawione m.in. SUPABASE_SERVICE_ROLE_KEY, oraz klucze builderów zgodnie z docs (V0_API_KEY itd.).

5) Frontend: npm run build lokalnie lub build w Lovable bez błędów; Publish hosting.

6) Smoke: zalogowany user → uruchom porównanie builderów; sprawdź że run_tasks przechodzą z queued (worker / inline fallback wg docs/QUEUE-OBSERVABILITY.md).
```

Szczegóły deployu i checklisty: [LOVABLE-PUBLISH-CHECKLIST.md](./LOVABLE-PUBLISH-CHECKLIST.md), [SPRINT-CLOSE.md](./SPRINT-CLOSE.md), [DEVELOPMENT-STATUS.md](./DEVELOPMENT-STATUS.md).
