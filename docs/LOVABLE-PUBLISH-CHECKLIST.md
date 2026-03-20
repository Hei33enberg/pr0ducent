# Lovable Cloud — Pull, Publish, feature flags

## Dla operatora (po każdym większym merge na `main`)

1. Otwórz projekt w **Lovable** (lub powiązany hosting frontu).
2. **Git → Pull / Sync** z brancha **`main`** repozytorium GitHub (to samo co `origin/main`).
3. Poczekaj na zakończenie buildu; sprawdź logi, czy nie ma błędów TypeScript.
4. **Publish** do produkcji dopiero po akceptacji PM.

Backend (**Supabase**) nie aktualizuje się przez Lovable Publish — migracje i Edge Functions robi się w Supabase / CLI osobno ([SPRINT-CLOSE.md](./SPRINT-CLOSE.md)).

## Zmienne `VITE_FF_*` (Lovable / Vercel / build)

Sterują [`src/lib/featureFlags.ts`](../src/lib/featureFlags.ts). Wartość **`false`** wyłącza funkcję (string porównywany z `"false"`).

| Zmienna | Domyślnie (gdy brak) | Efekt `=false` |
|---------|----------------------|----------------|
| `VITE_FF_MARKETPLACE` | włączone | Ukrywa routing / nav Marketplace. |
| `VITE_FF_MULTI_BUILDER_STREAM` | włączone | Wyłącza nakładkę streamu wielu builderów w Compare canvas. |
| `VITE_FF_BYOA` | włączone | Ukrywa zakładkę BYOA w User Dashboard. |

**Dev:** `DEV_INSPECTOR` jest włączony tylko w `import.meta.env.DEV` (lokalnie), nie na produkcji.

## Link do specyfikacji VBP w UI

Opcjonalnie ustaw **`VITE_VBP_PROTOCOL_URL`** (np. publiczne repo `vibecoding-broker-protocol` po utworzeniu). Jeśli puste, stopka używa domyślnego URL z kodu (zobacz Footer).

## Powiązane

- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
- [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md)
