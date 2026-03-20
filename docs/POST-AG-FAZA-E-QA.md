# QA — Phase E po integracji typów i workera Grupy B

## Strony

| Ścieżka | Oczekiwane |
|---------|------------|
| `/leaderboard` | Gdy MV ma wiersze: realne `avg_pvi`, `avg_ui_quality`, `avg_code_quality`, `total_runs` (bez „k” dla &lt; 1000). Gdy pusta: fallback mock (OK). |
| `/arena` | Głos zapisuje się do `builder_arena_votes`; remis = `winner_tool_id` null. |
| `/builders/:id` | Radar + histogram bez błędów runtime. |
| Compare | Po `score-builder-output`: w `builder_benchmark_scores` są wiersze; po chwili **Grupa B** (HTTP probe) aktualizuje kolumny B + `pvi_score`. |

## Smoke checklist

1. Uruchom build z podglądem → wywołaj scoring (flow produktowy do `score-builder-output`).
2. W Supabase sprawdź `builder_benchmark_scores`: pojawiają się `score_deploy_readiness`, `score_web_vitals`, … po probe.
3. Poczekaj na cron MV (max ~10 min) lub `REFRESH MATERIALIZED VIEW CONCURRENTLY` — `/leaderboard` powinien pokazać realne dane zamiast mocków.

## Znane ograniczenia

- Grupa B w Edge to **lekki HTTP probe**, nie pełny Lighthouse — docelowo zewnętrzny runner (patrz [SCORE-BUILDER-OUTPUT-GRUPA-B.md](./SCORE-BUILDER-OUTPUT-GRUPA-B.md)).
- Grupa C: [`benchmark-ai-batch-skeleton`](../supabase/functions/benchmark-ai-batch-skeleton/index.ts) zwraca **501** do czasu implementacji batch AI.
