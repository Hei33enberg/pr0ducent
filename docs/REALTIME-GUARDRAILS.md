# Realtime — guardrails (plan AG)

Zalecenia przy **wielu narzędziach na jednym promptcie** i przyszłym rankingu / głosowaniu.

## Kanały

- **Jeden kanał (lub subskrypcja) na `experiment_id`**, nie osobno na każde `tool_id` — ogranicza liczbę połączeń i rerenderów przy 10+ builderach.

## Źródło zdarzeń

- Preferuj **broadcast** (`broadcast` / kanał aplikacyjny) tam, gdzie to ma sens, zamiast `postgres_changes` na każdą tabelę — mniej obciążenia przy dużej liczbie wierszy.
- **Throttle** aktualizacji UI (np. score/progress) — nie każdą kratkę eventu mapuj na stan React; agreguj krótkimi oknami czasu.

## Dane „ciężkie”

- **Score / PVI / leaderboard:** licz **poza** krytyczną ścieżką renderu (worker, cron, MV), w UI tylko odświeżanie wyniku lub subskrypcja gotowego widoku.
- **Materialized view** (np. `builder_leaderboard`) + odświeżanie **pg_cron** (np. co 15 min) — nie przy każdym evencie w realtime.

## Głosy komentarze

- **Paginacja** komentarzy / głosów; **vote throttle** (anti-abuse) — osobna polityka produktowa.

## Powiązane

- [QUEUE-OBSERVABILITY.md](./QUEUE-OBSERVABILITY.md)
- [PVI-ORCHESTRATION-MAP.md](./PVI-ORCHESTRATION-MAP.md)
