

# PromptLab — Plan budowy MVP z Supabase (po polsku)

## Podsumowanie decyzji

- **Model brokerowy**: generujemy prototypy na naszych kontach, klient nie musi mieć kont w builderach
- **Mockowane wyniki**: bez prawdziwych API na razie, ale architektura gotowa na podłączenie
- **Supabase backend**: auth (email magic link + Google OAuth), baza danych, RLS
- **Profile użytkowników**: tabela `profiles` z nazwą, avatarem, preferencjami

---

## Faza 1 — Supabase: baza danych i auth

### 1.1 Schemat bazy danych

```text
profiles
├── id (uuid, FK → auth.users.id)
├── display_name (text)
├── avatar_url (text, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)

experiments
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users.id)
├── prompt (text)
├── account_model (text: 'broker')
├── selected_tools (text[])
├── created_at (timestamptz)
└── updated_at (timestamptz)

experiment_runs
├── id (uuid, PK)
├── experiment_id (uuid, FK → experiments.id)
├── tool_id (text)
├── status (text: queued/running/completed/error)
├── started_at (timestamptz)
├── completed_at (timestamptz, nullable)
├── time_to_prototype (float, nullable)
├── description (text)
├── scores (jsonb) — {uiQuality, backendLogic, speed, easeOfEditing}
├── pros (jsonb) — string[]
└── cons (jsonb) — string[]

referral_clicks
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users.id)
├── experiment_id (uuid, FK → experiments.id)
├── tool_id (text)
└── clicked_at (timestamptz)
```

### 1.2 RLS (Row Level Security)

- `profiles`: użytkownik czyta/edytuje tylko swój profil
- `experiments`: użytkownik widzi tylko swoje eksperymenty
- `experiment_runs`: dostęp przez experiment → user_id
- `referral_clicks`: użytkownik widzi tylko swoje kliknięcia
- Trigger na `auth.users` → automatyczne tworzenie wiersza w `profiles`

### 1.3 Autentykacja

- Email magic link + opcjonalnie Google OAuth
- Strona logowania/rejestracji (`/auth`)
- Tryb gościa: jeden eksperyment demo bez konta, potem prompt do rejestracji
- Komponent `AuthGuard` do ochrony historii i dashboardu

---

## Faza 2 — Migracja z localStorage na Supabase

### 2.1 Serwis danych

- Nowy `src/lib/experiment-service.ts` — CRUD na Supabase zamiast localStorage
- `createExperiment()` → INSERT do `experiments` + `experiment_runs`
- `getExperiments()` → SELECT z filtrami user_id
- `updateRunStatus()` → UPDATE statusu runu
- `logReferralClick()` → INSERT do `referral_clicks`

### 2.2 Orkiestracja (nadal client-side)

- Po utworzeniu eksperymentu w Supabase, klient odpala mockowane timery (jak teraz)
- Statusy aktualizowane w bazie przez serwis
- Gdy wszystkie runy skończone → oznacz eksperyment jako completed

---

## Faza 3 — Ulepszenia UX

### 3.1 Canvas

- **Filtrowanie**: pokaż/ukryj poszczególne narzędzia na canvasie
- **Sortowanie**: po score, szybkości, nazwie
- **Winner banner**: po zakończeniu wszystkich runów — podświetl najlepsze narzędzie

### 3.2 Detail panel

- Mockowana oś czasu budowy (prompt → scaffolding → UI → backend → deploy)
- Pełne pros/cons z edytorską narracją

### 3.3 Historia

- Lista eksperymentów z Supabase (zamiast localStorage)
- Usuwanie eksperymentów
- Empty state gdy brak historii

### 3.4 Dark mode

- Toggle w headerze
- Już mamy CSS variables w `index.css` — wystarczy dodać `.dark` class toggle

### 3.5 Referral tracking

- Dodać `referralUrl` do `BuilderTool` config
- Kliknięcie "Continue in [Tool]" → zapis do `referral_clicks` + redirect

---

## Struktura plików (docelowa)

```text
src/
  config/tools.ts              ← definicje builderów + referralUrl
  types/experiment.ts          ← typy (rozszerzone)
  lib/
    experiment-service.ts      ← Supabase CRUD
    mock-orchestrator.ts       ← mockowane timery i score'y
    referral.ts                ← tracking kliknięć
  components/
    HeroSection.tsx            ← (istniejący)
    ToolSelectionGrid.tsx      ← (istniejący)
    ComparisonCanvas.tsx       ← + filtry, sortowanie, winner
    ToolDetailPanel.tsx        ← + timeline
    ExperimentHistory.tsx      ← z Supabase
    ThemeToggle.tsx            ← dark mode
    CanvasFilters.tsx          ← filtry/sort
    WinnerBanner.tsx           ← najlepsze narzędzie
    AuthPage.tsx               ← logowanie/rejestracja
    AuthGuard.tsx              ← ochrona tras
  pages/
    Index.tsx                  ← (istniejący)
    Auth.tsx                   ← strona logowania
```

---

## Kolejność implementacji

1. Włącz Supabase (Lovable Cloud) + migracje schematów
2. Auth (email magic link) + profiles + AuthPage
3. Migracja experiment CRUD z localStorage na Supabase
4. Canvas: filtry, sortowanie, winner banner
5. Dark mode toggle
6. Referral tracking
7. Detail panel timeline

Każdy krok to osobny, mały commit — zachowujemy prostotę obecnego UI.

