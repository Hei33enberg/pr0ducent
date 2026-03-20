# Sprint 3 AG — handoff (Cursor ↔ AG ↔ Lovable)

Źródło prawdy dla benchmarku społecznościowego i leaderboardu: migracja
`supabase/migrations/20260328120000_sprint3_benchmark_social.sql` (tabele `builder_benchmark_scores`,
`user_votes`, `user_comments`, MV `builder_leaderboard`).

## Różnice względem draftu AG w Notion/Docs

- **MV `builder_leaderboard`:** uproszczony agregat per `tool_id` (bez LATERAL po głosach w MV — głosy są w osobnych tabelach; UI może łączyć lub dodać drugą MV później). **UNIQUE (`tool_id`)** na MV umożliwia `REFRESH MATERIALIZED VIEW CONCURRENTLY`.
- **`user_votes`:** kolumna `vote_kind` (`result` | `pairwise`) — insert RLS na razie tylko dla `vote_kind = 'result'`. **Pairwise Arena = parking lot** do stabilnego E2/E3; pełna Arena może wymagać osobnej tabeli par lub rozszerzenia schematu.
- **PVI marketingowy** (`src/lib/pvi-calculator.ts`) vs **PVI benchmark** (`src/lib/pvi-engine.ts`, wymiary 1–10) — nie mieszać copy ani nazw w UI.

## Grupa A / B / C w `score-builder-output`

- **Grupa A (teraz):** Edge Function `supabase/functions/score-builder-output/index.ts` zapisuje częściowe wymiary + `pvi_score` do `builder_benchmark_scores` (pipeline + rubryka).
- **Grupa B/C + Lighthouse:** poza długim invoke Edge — kolejka, cron lub worker (patrz `docs/PVI-ORCHESTRATION-MAP.md`).

## Operator: `pg_cron` + odświeżanie MV

Rozszerzenie `pg_cron` jest w migracji bazowej projektu. Po wdrożeniu migracji Sprint 3 osoba z dostępem do Supabase może zaplanować job (dostosuj interwał):

```sql
SELECT cron.schedule(
  'refresh-builder-leaderboard',
  '*/10 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY public.builder_leaderboard$$
);
```

**Repo:** migracja `20260329100000_builder_arena_votes_leaderboard_cron.sql` próbuje zarejestrować ten job (co **10 min**). Jeśli `cron.schedule` z migracji SQL nie jest dozwolony w Waszym planie — ten sam SQL wykonać ręcznie w SQL Editor (jednorazowo).

Audyt kompletności schematu Sprint 3 + arena: [AG-PHASE-E-SCHEMA-AUDIT.md](./AG-PHASE-E-SCHEMA-AUDIT.md).

## Prompt dla Lovable (po merge na `main`)

1. W projekcie Lovable: **Settings → GitHub → Pull** z `main` (commity: migracja + ewentualnie UI AG + Edge).
2. **Build → Publish** po akceptacji PM.
3. Supabase: `supabase db push` / migracje z CI + **deploy Edge Functions** jeśli zmieniono `score-builder-output`.
4. Opcjonalnie: job `pg_cron` jak wyżej.
5. Smoke: `docs/PM-RUN-CHECKLIST.md` — strona `/leaderboard` może być pusta do czasu pierwszych wierszy w `builder_benchmark_scores`; po `REFRESH` MV pokazuje dane.

## Phase 1 AG (A + C) na `main`

Po zamknięciu zadań bez zależności DB: merge UI → Lovable **Pull → Publish** (jak wyżej).

## Kolejność z planu Sprint 3 (skrót)

0. Migracja + RLS  
1. Phase 1 AG (A + C)  
2. Rozszerzenie scoringu / workerów (A pełniej, B stopniowo)  
3. Phase 2 AG (E1–E2–E5) podłączone pod tabele  
4. `pg_cron` + Phase 3 (E3, E4)  
5. Phase 4 Marketplace  
6. Phase 5 (VBP + Arena pairwise — na końcu)

## Linki

- Zamknięcie sprintu / testy: [SPRINT-CLOSE.md](./SPRINT-CLOSE.md)  
- Orkiestracja PVI: [PVI-ORCHESTRATION-MAP.md](./PVI-ORCHESTRATION-MAP.md)
