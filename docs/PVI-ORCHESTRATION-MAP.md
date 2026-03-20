# PVI (10 wymiarów) — mapowanie na warstwę orkiestracji

Cel: jedna strona łącząca plan AG (benchmark produktu) z istniejącym brokerem (`run_tasks`, `builder_results`, VBP).

## Grupy kosztu (jak w planie AG)

| Grupa | Wymiary (przykładowe nazwy) | Skąd dane w architekturze brokera |
|-------|-----------------------------|-----------------------------------|
| **A — z pipeline** | Speed, Reliability, Cost efficiency | `run_tasks` (czasy statusów, `attempt_count`), `run_events` (`orchestrator.*`, `builder.*`), `run_jobs.metadata`, VBP `billing_cost_tokens` / `compute_units_used` gdy builder dostarczy ([VBP-SPEC.md](./VBP-SPEC.md)) |
| **B — headless po buildzie** | Deploy readiness, Mobile score, a11y, Web Vitals | URL z `builder_results.preview_url` / `deploy_url` po `artifact_ready` / `completed`; job async (Edge cron, worker lub GHA) zapisuje wyniki do wiersza powiązanego z `experiment_id`, `tool_id`, `run_task_id` |
| **C — AI batch** | UI quality, Completeness, Code quality | Kolejka batchy (co N min, budżet tokenów), wejście: artefakt + metadane; `score-builder-output` jako punkt startowy (baseline + reasoning), rozszerzenie o tabelę metryk per wymiar |

## Kontrakt VBP / POP

- Buildery zgodne z VBP raportują telemetrię i eksport w jednym modelu; broker nie duplikuje logiki v0 — ważne jest mapowanie pól na wymiary kosztów (Grupa A) i ewentualnie webhook zdarzeń ([VBP-SPEC.md](./VBP-SPEC.md), publiczny bundle: [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md)).

## Tabele i rozszerzenia (kierunek)

- Dziś: `experiment_runs.scores` (JSON), `builder_results`, `run_events`.
- Docelowo: osobna tabela np. `builder_metric_scores` (`experiment_id`, `tool_id`, `run_task_id`, `dimension`, `value`, `source`) zamiast rozpychania wszystkiego w jednym JSON — bez blokowania MVP; migracja w osobnym sprincie.

## Powiązane

- [ORCHESTRATOR.md](./ORCHESTRATOR.md)
- [score-builder-output](../supabase/functions/score-builder-output/index.ts)
