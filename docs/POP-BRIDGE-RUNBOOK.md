# POP Bridge — runbook operacyjny

## Włączenie mostu (staging)

1. Zweryfikuj wpis w [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md) (`bridge_mode`, ryzyko).
2. Ustaw `VITE_FF_BRIDGE_MODE=true` w środowisku frontu (staging).
3. Skonfiguruj `builder_integration_config` (tier, `enabled`, limity) — nie włączaj produkcji bez [POP-CONFORMANCE-PROFILES.md](./POP-CONFORMANCE-PROFILES.md) dla natywnego VBP.
4. Smoke: jeden run → oczekiwany terminal w `builder_results`.

## Włączenie trybu aggressive (browser)

1. **Zgoda** zgodnie z [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md) (legal + partner).
2. `VITE_FF_BRIDGE_MODE=true` **oraz** `VITE_FF_BRIDGE_AGGRESSIVE=true`.
3. Monitoruj błędy i koszt; niski limit równoległych jobów.

## Kill-switch (natychmiastowy)

1. Ustaw `VITE_FF_BRIDGE_AGGRESSIVE=false` lub `VITE_FF_BRIDGE_MODE=false`.
2. Wyłącz `enabled` dla danego `tool_id` w `builder_integration_config` (jeśli dotyczy).
3. Otwórz incydent wewnętrzny: notatka w rejestrze (kolumna „uwagi”) + komunikat do partnera jeśli wina po stronie API.

## Po incydencie

- Zaktualizuj [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md) (tryb `no_go` lub nowe warunki).
- Retrospektywa: czy most powinien zostać zastąpiony natywnym VBP.

## Kontakty

- Tech: zespół odpowiedzialny za Edge (`supabase/functions/*`).
- Biz: partner owner z [POP-BUSINESS-NEGOTIATION-CHECKLIST.md](./POP-BUSINESS-NEGOTIATION-CHECKLIST.md).
