# Lovable — secondary role (LP, murd0ch)

**Lovable is not the target host or sole operator** for the full pr0ducent product (broker, orchestrator, Edge). Full control of CI, secrets, and schema is on **GitHub + Vercel + Supabase** — see [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md).

## When to use Lovable

- Fast iterations on **landing pages** and marketing surfaces in the ecosystem (e.g. **murd0ch** in `newsc0rp-main`, other LPs).
- UI experiments that still end as a merge to `main` on GitHub.

## Rules

1. **Merge to `main`** — every change that should ship in pr0ducent must land in the GitHub repo; Lovable is an editor, not the source of truth.
2. **Deploy the pr0ducent app** — official path: **Vercel** after a green build from `main`, not only “Publish” in Lovable.
3. **Supabase** — avoid drift between the schema in the Lovable panel and migrations in the repo; for backend work use a project under the team account and [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md).

## Summary

| Path | Role |
|------|------|
| GitHub + Vercel + Supabase | Target development of orchestrator and pr0ducent frontend |
| Lovable | Occasional: LP / murd0ch / fast UI — always synced to `main` |
