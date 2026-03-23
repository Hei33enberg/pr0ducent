# Realtime — guardrails (AG plan)

Recommendations for **many tools on one prompt** and future ranking / voting.

## Channels

- **One channel (or subscription) per `experiment_id`**, not per `tool_id` — limits connection count and rerenders with 10+ builders.

## Event source

- Prefer **broadcast** (`broadcast` / app channel) where it makes sense instead of `postgres_changes` on every table — less load with many rows.
- **Throttle** UI updates (e.g. score/progress) — do not map every event tick to React state; aggregate with short time windows.

## Heavy data

- **Score / PVI / leaderboard:** compute **off** the critical render path (worker, cron, MV); in the UI only refresh result or subscribe to a ready view.
- **Materialized view** (e.g. `builder_leaderboard`) + **pg_cron** refresh (e.g. every 15 min) — not on every realtime event.

## Votes and comments

- **Pagination** for comments / votes; **vote throttle** (anti-abuse) — separate product policy.

## Related

- [QUEUE-OBSERVABILITY.md](./QUEUE-OBSERVABILITY.md)
- [PVI-ORCHESTRATION-MAP.md](./PVI-ORCHESTRATION-MAP.md)
