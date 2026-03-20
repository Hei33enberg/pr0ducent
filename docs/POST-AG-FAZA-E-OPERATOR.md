# Operator (Lovable) — po commicie `e5b616d` i migracjach Cursor

## Ty (człowiek w UI Lovable)

1. **Settings → GitHub → Pull** z brancha **`main`** (najnowszy front + typy).
2. Poczekaj na **build** → **Publish** po akceptacji PM.
3. **Nie** uruchamiaj ponownie migracji ani redeployu Edge, jeśli Supabase jest już zsynchronizowany z repo — chyba że Cursor dodał **nowy** plik w `supabase/migrations/` (wtedy `db push` / pipeline).

## Cursor (repo)

- Po dodaniu migracji **`20260330120000_extend_builder_leaderboard_mv.sql`**: zastosuj ją na projekcie Supabase, potem ewentualnie **odśwież typy** w [`src/integrations/supabase/types.ts`](../src/integrations/supabase/types.ts) jeśli generujesz je z CLI.
- Deploy Edge: **`benchmark-probe-group-b`**, **`benchmark-ai-batch-skeleton`** (szkielet 501) razem z istniejącymi funkcjami.

Powiązane: [POST-AG-FAZA-E-QA.md](./POST-AG-FAZA-E-QA.md), [SCORE-BUILDER-OUTPUT-GRUPA-B.md](./SCORE-BUILDER-OUTPUT-GRUPA-B.md).
