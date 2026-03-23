# VBP — zakres open source (cały monorepo)

**Strategia:** repozytorium **pr0ducent** jest udostępnione na licencji **MIT** ([LICENSE](../LICENSE)) — włącznie z frontendem, Edge Functions, migracjami Supabase i bundlem protokołu VBP. Celem jest **szybkie skalowanie**, forkowanie i integracja z innymi aplikacjami vibe‑AI; model biznesowy może ewoluować niezależnie od kodu.

Nazewnictwo protokołu: wyłącznie **VBP** — [VBP-POP-BRANDING.md](./VBP-POP-BRANDING.md).

## Co jest w repo (wszystko pod MIT)

| Obszar | Zawartość |
|--------|-----------|
| `src/` | Aplikacja React (Vite) |
| `supabase/` | Funkcje Edge (Deno), `config.toml`, migracje |
| `protocol/vibecoding-broker-protocol/` | Spec, schematy, validator, przykłady, SDK |
| `docs/` | Dokumentacja operacyjna i partnerska |

## Co **nie** jest w repo (świadomie)

- **Sekrety produkcyjne** — klucze API, `service_role`, webhook secrets; każdy operator ustawia je u siebie (Supabase Dashboard, Vercel env, itd.).
- **Hostowany ruch produkcyjny** — deployment i SLA są po stronie użytkownika forka; ten projekt jest **kodem referencyjnym**, nie usługą SaaS.

## Uwagi prawne / marka

- Nazwa **pr0ducent** i logo mogą podlegać prawom osobno od licencji MIT na kod — sprawdź nagłówki plików i README przed użyciem marki w produkcie.

## Dla contributorów

- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [protocol/vibecoding-broker-protocol/CONTRIBUTING.md](../protocol/vibecoding-broker-protocol/CONTRIBUTING.md)
