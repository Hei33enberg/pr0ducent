# VBP — publikacja publicznego repo (DevRel + Cursor)

Cel: osobne repo **`pr0ducent/vibecoding-broker-protocol`** (lub nazwa zgodna z marką), żeby buildery miały jedno miejsce: spec, schematy, OpenAPI, validator, przykłady.

## Źródło w monorepo

Katalog: [`protocol/vibecoding-broker-protocol/`](../protocol/vibecoding-broker-protocol/README.md)

## Kroki (checklist)

1. Utwórz **puste** publiczne repo na GitHubie (org `pr0ducent` lub obecny właściciel produktu).
2. Sklonuj je lokalnie i skopiuj zawartość `protocol/vibecoding-broker-protocol/` na root nowego repo (lub użyj `git subtree split` / ręcznego mirror).
3. Dodaj **README** z linkiem z powrotem do aplikacji brokera i do [docs/VBP-SPEC.md](./VBP-SPEC.md) w monorepo (do czasu pełnej migracji spec na `spec/v1.md`).
4. Włącz **GitHub Actions** — możesz skopiować job walidacji JSON z [`.github/workflows/vbp-protocol.yml`](../.github/workflows/vbp-protocol.yml).
5. Ustaw w **Vercel** (docelowy host frontu — [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md)) zmienną **`VITE_VBP_PROTOCOL_URL`** na URL nowego repo (README lub strona GitHub Pages jeśli dodasz). Preview deployments też powinny mieć spójny URL lub fallback z `.env.example`.
6. Ogłoszenie: **VBP** + pierwszy partner pilotowy ([VBP-POP-BRANDING.md](./VBP-POP-BRANDING.md)).
7. Opcjonalnie zautomatyzuj kroki 1–4 przez prompt w [GITHUB-COPILOT-VBP-REPO-PROMPT.md](./GITHUB-COPILOT-VBP-REPO-PROMPT.md).

## Zawartość minimum

- `openapi/vbp-v1.openapi.yaml`
- `schemas/*.json`
- `validator/cli.mjs` + `npm run vbp-validate`
- `examples/minimal-node/`
- `badge/vbp-certified.svg`

## Powiązane

- [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md) — discovery, pilot, macierz zgodności
- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
