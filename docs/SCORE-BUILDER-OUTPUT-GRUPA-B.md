# score-builder-output — następna iteracja (Grupa B)

**Cel:** uzupełnić wymiary z headless probe / AI **poza** krytyczną ścieżką Edge (timeout, koszt).

## Lighthouse (batch lub worker ≤ ~25 s na URL)

- **Wejście:** `builder_results.preview_url` po stabilnym buildzie.
- **Wyjście (kolumny):** `score_web_vitals`, `score_accessibility`, `score_mobile_responsiveness` (oraz ewentualnie fragment pod deploy readiness).
- **Miejsce uruchomienia:** osobny worker (GHA scheduled, zewnętrzny runner, krótki job kolejki) — **nie** pełny Lighthouse w jednym długim invoke `score-builder-output`, chyba że twardy limit czasu i mały scope.

## AI scoring (screenshot / code)

- **Modele:** GPT-4o / Gemini Vision (decyzja produktowa: koszt, jakość).
- **Wyjście (kolumny):** `score_ui_quality`, `score_code_quality`, `score_completeness` + rozszerzenie `ai_reasoning` JSONB per wymiar.
- **Batch:** co N minut / limit tokenów — zgodnie z planem AG (Grupa C częściowo może iść tą samą ścieżką).

## Kontrakt

- Aktualizacja wiersza w `builder_benchmark_scores` po `builder_result_id` / `run_task_id`.
- Po zapisie: kolejny `REFRESH` MV (lub poleganie na `pg_cron` co 10 min).

Powiązane: [PVI-ORCHESTRATION-MAP.md](./PVI-ORCHESTRATION-MAP.md), [AG-SPRINT3-HANDOFF.md](./AG-SPRINT3-HANDOFF.md).
