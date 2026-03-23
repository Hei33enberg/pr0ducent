# Lovable — rola poboczna (LP, murd0ch)

**Lovable nie jest docelowym hostem ani jedynym operatorem** całego produktu pr0ducent (broker, orchestrator, Edge). Pełna kontrola nad CI, sekretami i schematem jest na **GitHub + Vercel + Supabase** — zob. [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md).

## Kiedy używać Lovable

- Szybkie iteracje nad **landingami** i stronami marketingowymi w ekosystemie (np. **murd0ch** w `newsc0rp-main`, inne LP).
- Eksperymenty UI, które i tak kończą jako merge do `main` na GitHubie.

## Zasady

1. **Merge do `main`** — każda zmiana, która ma wejść do produktu pr0ducent, musi trafić do repozytorium GitHub; Lovable jest edytorem, nie źródłem prawdy.
2. **Deploy aplikacji pr0ducent** — oficjalny tor: **Vercel** po zielonym buildzie z `main`, nie wyłącznie „Publish” w Lovable.
3. **Supabase** — unikaj rozjechania się między schematem w panelu Lovable a migracjami w repo; przy pracy backendowej używaj projektu pod kontem zespołu i [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md).

## Podsumowanie

| Tor | Rola |
|-----|------|
| GitHub + Vercel + Supabase | Docelowy rozwój orchestratora i frontu pr0ducent |
| Lovable | Okazjonalnie: LP / murd0ch / szybkie UI — zawsze z synchronizacją do `main` |
