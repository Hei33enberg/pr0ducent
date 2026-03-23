# Vercel + Supabase — przewodnik krok po kroku (główny tor dostarczenia)

**Jak to nazwać:** źródłem prawdy dla **kodu aplikacji** jest **GitHub `main`**. **Supabase** jest systemem danych (Postgres, Auth, Edge Functions). **Vercel** hostuje tylko **build frontu** (statyczny `dist/`). Edge Functions wdrażasz **z tego repo** przez CLI Supabase — nie przez Vercel.

---

## Zanim zaczniesz

- Konto **GitHub** z dostępem do repo `pr0ducent`.
- Konto **Supabase** (własne — pełna kontrola nad migracjami i sekretami Edge).
- Konto **Vercel** (darmowy tier wystarczy na start).
- Lokalnie: `node`, `npm`, opcjonalnie `supabase` CLI ([instrukcja](https://supabase.com/docs/guides/cli)).

---

## Krok 1 — Supabase: projekt docelowy

1. W [Supabase Dashboard](https://supabase.com/dashboard) utwórz **nowy projekt** (region jak najbliżej użytkowników) **albo** użyj istniejącego, jeśli już migrujesz z Lovable-linked — wtedy upewnij się, że **schema = migracje z repo** ([AGENTS.md](../AGENTS.md): nie „ucinać” Edge pod starą bazę).
2. Zapisz:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** (Publishable) → w tym projekcie frontend używa **`VITE_SUPABASE_PUBLISHABLE_KEY`** ([`src/integrations/supabase/client.ts`](../src/integrations/supabase/client.ts)).

---

## Krok 2 — Migracje i Edge Functions (backend)

1. Zainstaluj CLI: `npm i -g supabase` (lub `npx supabase`).
2. W katalogu repo: `supabase link --project-ref <twój_ref>` (token z Dashboard → Settings → API).
3. Wdróż migracje: `supabase db push` (lub pipeline zgodny z waszym procesem — ważne: stan DB = `supabase/migrations/`).
4. Ustaw **sekrety** funkcji Edge w Dashboard → Edge Functions → Secrets (np. `V0_API_KEY`, `VBP_WEBHOOK_SECRET`, …) — te **nie** idą do Vercel.
5. Wdróż funkcje: `supabase functions deploy --project-ref <ref>` (lub skrypt CI / dokumentacja w `docs/`).

---

## Krok 3 — Auth: redirecty pod Vercel

1. W Supabase: **Authentication → URL Configuration**.
2. Dodaj do **Redirect URLs**:
   - produkcję: `https://twoja-domena.pl/**` oraz `https://<projekt>.vercel.app/**`
   - preview (opcjonalnie): `https://*.vercel.app/**` (jeśli polityka bezpieczeństwa pozwala) **albo** konkretne URL-e preview z Vercela.
3. **Site URL** ustaw na docelowy adres produkcyjny (po cutoverze).

Bez tego logowanie po przekierowaniu z OAuth/email zwróci na zły host.

---

## Krok 4 — Vercel: pierwszy deploy

1. [vercel.com](https://vercel.com) → **Add New… → Project** → Import **GitHub** → wybierz `Hei33enberg/pr0ducent` (lub fork).
2. Framework: wykryje **Vite**; build: `npm run build`, output: `dist` (zgodnie z [`vercel.json`](../vercel.json) w repo).
3. **Environment Variables** (Production + Preview):

   | Zmienna | Skąd |
   |---------|------|
   | `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API → anon public |
   | `VITE_VBP_PROTOCOL_URL` | opcjonalnie URL publicznego repo protokołu (GitHub) |
   | `VITE_FF_*` | według potrzeb ([`featureFlags.ts`](../src/lib/featureFlags.ts)) |

4. **Deploy**. Po zielonym buildzie otwórz URL `*.vercel.app` i sprawdź logowanie + jeden flow (np. odczyt z tabeli).

---

## Krok 5 — Realtime (jeśli używacie)

W Supabase upewnij się, że publikacja Realtime obejmuje tabele używane w UI (`builder_results`, `run_events`, `run_tasks` itd.) — patrz sekcja Realtime w [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md).

---

## Krok 6 — Cutover DNS (produkcja)

1. Gdy staging na Vercel jest OK: w **DNS** domeny produkcyjnej ustaw rekordy wg [Vercel → domena → DNS](https://vercel.com/docs/concepts/projects/domains) (zwykle CNAME na `cname.vercel-dns.com` lub A na wskazane IP).
2. W Vercel przypisz **Custom Domain** do projektu.
3. Zaktualizuj ponownie **Supabase Redirect URLs** jeśli produkcyjny URL się zmienia.
4. Zostaw stary host (Lovable) jako fallback do czasu pewności; potem wyłącz.

---

## Krok 7 — Smoke po migracji

- Logowanie / wylogowanie.
- Jedna akcja zapisu do DB (np. eksperyment).
- Jedna funkcja Edge wymagająca JWT (np. dispatch) — zgodnie z [ORCHESTRATOR.md](./ORCHESTRATOR.md).
- Monitoruj logi Edge i `run_events` przy pierwszych produkcyjnych runach.

---

## Co zrobiłem w repozytorium (automatycznie)

- Plik [`vercel.json`](../vercel.json): build Vite, katalog `dist`, **rewrite** pod **React Router** (ścieżki client-side nie zwracają 404).
- Ten dokument + poprawka checklisty w [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md) (poprawny klucz Vite).

---

## Lovable po cutoverze

Okazjonalnie LP / murd0ch — merge do `main`; deploy aplikacji pr0ducent z **Vercel**, nie jako jedyne źródło prawdy — [LOVABLE-SECONDARY-LP.md](./LOVABLE-SECONDARY-LP.md).
