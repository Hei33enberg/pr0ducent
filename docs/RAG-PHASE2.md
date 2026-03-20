# RAG & monetization — phase 2 (planned)

Deferred from orchestrator sprint close to keep refactors shippable.

## RAG

- Table `builder_crawl_sources` (tool_id, source_type, url, crawl_frequency, optional css_selector).
- Edge function `rag-crawl-builder` (scheduled): fetch → hash → skip unchanged → chunk → optional **pgvector** embedding column (requires extension + cost approval).
- Edge function `rag-query`: semantic search for Score Orchestra / calculator / UX copy.
- Extend [`sync-builder-data`](../supabase/functions/sync-builder-data/index.ts) or replace gradually; keep `builder_knowledge_chunks` + `builder_ingest_alerts` as foundation.

## Monetization

- `builder_credit_costs` (tool_id, tier, credits_per_run).
- Subscription `credits_balance` / plan tier columns (migrate carefully vs existing `prompts_used` / `prompts_limit`).
- Pre-deduct credits on dispatch; partial refund on fail-before-build.
- Remix marketplace: `remix_listings`, `remix_purchases` — validate with a **public gallery** MVP before paid credits.

## Estimates / constraints

- OpenAI embeddings + crawl bandwidth: budget line item (tens of USD/month at moderate scale).
- Browser bridge for Tier 2: separate worker (Fly.io, Modal, Cloud Run), not Supabase Edge.
