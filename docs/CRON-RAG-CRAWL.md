# Scheduling `rag-crawl-builder`

Edge Function: `supabase/functions/rag-crawl-builder`  
Auth: `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` (same as `process-task-queue`).

## Supabase Dashboard

1. **Database → Extensions:** ensure `pg_net` (and optionally `pg_cron`) enabled if you schedule from SQL.
2. **Cron** or external scheduler: HTTP POST to  
   `https://<project-ref>.supabase.co/functions/v1/rag-crawl-builder`  
   every **6 hours** with service role bearer.

## Populate sources

```sql
INSERT INTO public.builder_crawl_sources (tool_id, source_url, source_type, crawl_interval_hours, enabled)
VALUES
  ('v0', 'https://v0.dev/docs', 'api_docs', 24, true)
ON CONFLICT (tool_id, source_url) DO NOTHING;
```

Adjust URLs per builder. Crawler respects `crawl_interval_hours` and checksum deduplication.
