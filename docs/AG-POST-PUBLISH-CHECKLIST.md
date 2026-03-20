# Antigravity — po Pull/Publish na produkcję

Wykonaj po tym, jak PM/Lovable opublikuje front zsynchronizowany z `main`.

## Feature flags

W panelu hostingu (Lovable / Vercel) sprawdź wartości:

- `VITE_FF_MARKETPLACE` — czy Marketplace ma być widoczny dla userów?
- `VITE_FF_MULTI_BUILDER_STREAM` — stream wielu builderów w canvas.
- `VITE_FF_BYOA` — zakładka BYOA w dashboardzie.

Źródło prawdy w kodzie: [`src/lib/featureFlags.ts`](../src/lib/featureFlags.ts).

## Funkcjonalność

1. **Home — zalogowany:** jeden run z v0; kafelki i Realtime bez błędów w konsoli.
2. **GuestOrchestrationBanner:** copy i widoczność zgodnie z intencją PM.
3. **Claim / handoff:** przycisk CTA nie „wisi” pusty — znika, dopóki backend nie zwróci `claim_token` / URL (VBP lub kolejny builder).
4. **DevExperimentInspector:** tylko lokalnie (`import.meta.env.DEV`); na prod nie powinno być dostępne — szybki smoke w trybie incognito.
5. **i18n:** klucze EN/PL dla nowych stringów.

## Reguły merge (przypomnienie)

- Nie commituj `supabase/migrations/` ani `supabase/functions/` bez uzgodnienia z backend lane (Cursor).
- Shared: `src/integrations/supabase/types.ts`, `src/config/tools.ts` — najpierw backend, potem rebase UI.

## Powiązane

- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
