# Audyt schematu — Phase E (benchmark + leaderboard + arena)

## Migracja `20260328120000_sprint3_benchmark_social.sql` (commit `0e96c74` / linia bazowa Sprint 3)

| Wymaganie | Status |
|-----------|--------|
| 10 kolumn `score_*` (0–100, NUMERIC + CHECK) | Tak: speed, reliability, cost_efficiency, deploy_readiness, mobile_responsiveness, accessibility, web_vitals, ui_quality, completeness, code_quality |
| `pvi_score`, `scoring_model`, `ai_reasoning` JSONB | Tak |
| `UNIQUE(builder_result_id)` | Tak |
| RLS odczyt dla eksperymentów **public** (`anon` + `authenticated`) | Tak — polityka „Anyone can view benchmark scores for public experiments” |
| RLS odczyt właściciela | Tak — „Users can view benchmark scores for own experiments” |
| MV `builder_leaderboard` + **UNIQUE (`tool_id`)** | Tak — `builder_leaderboard_tool_id_uidx` (wymagane do `REFRESH … CONCURRENTLY`). Migracja `20260330120000_extend_builder_leaderboard_mv.sql` dodaje `avg_speed`, `avg_ui_quality`, `avg_code_quality` (agregaty z `builder_benchmark_scores`). |
| `GRANT SELECT` na MV dla `anon`, `authenticated` | Tak |

Zapis z Edge (`score-builder-output`) używa `SCORING_MODEL_VERSION` + JSON `ai_reasoning` zgodnie z kolumnami powyżej.

## Migracja `20260329100000_builder_arena_votes_leaderboard_cron.sql`

| Element | Opis |
|---------|------|
| `builder_arena_votes` | `experiment_id`, `tool_a_id`, `tool_b_id`, `winner_tool_id` (NULL = remis), `user_id` **nullable** (anon), RLS INSERT/SELECT na eksperymentach **public** + SELECT dla właściciela |
| `pg_cron` | Job `refresh-builder-leaderboard` — `*/10 * * * *` → `REFRESH MATERIALIZED VIEW CONCURRENTLY public.builder_leaderboard` |

Jeśli `cron.schedule` w migracji zwróci ostrzeżenie (np. uprawnienia), ten sam SQL wykonać w Supabase SQL Editor jako superuser — patrz [AG-SPRINT3-HANDOFF.md](./AG-SPRINT3-HANDOFF.md).

## Następna iteracja: Grupa B w `score-builder-output`

Szczegóły planu (Lighthouse / AI, poza długim Edge): [SCORE-BUILDER-OUTPUT-GRUPA-B.md](./SCORE-BUILDER-OUTPUT-GRUPA-B.md).

## Pairwise — `user_votes` vs `builder_arena_votes`

- **Proste up/down** na wyniku: tabela `user_votes` (`vote_kind = 'result'`).
- **Arena (para A/B):** tabela `builder_arena_votes` — UI już w `src/hooks/usePairwiseVote.ts`.
