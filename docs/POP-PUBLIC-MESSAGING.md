# VBP — komunikacja publiczna (bridge, ToS, partner trust)

Ten dokument **uspójnia przekaz** na stronie [pr0ducent.com/docs](https://pr0ducent.com/docs), w socialach i w mailach do buildera. Techniczne źródła: [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md), [POP-BRIDGE-ARCHITECTURE.md](./POP-BRIDGE-ARCHITECTURE.md).

## Jak mówimy o VBP

- **VBP (Vibecoding Broker Protocol)** — jedyna nazwa protokołu w copy (spec, OpenAPI, partnerzy).
- **PBP** tylko tam, gdzie odnosi się do historycznego endpointu `pbp-webhook`.

## Bridge mode (tymczasowe obejścia)

**Publiczna linia:**

- „Zanim partner wdroży pełny VBP, możemy pokazać **ograniczony** most (np. URL handoff), żeby zmierzyć popyt i leady. To **nie zastępuje** partnerskiej integracji API.”
- „Mosty wysokiego ryzyka (np. automatyzacja UI bez zgody) **nie są** domyślną strategią — wymagają polityki prawnej i kill-switch.”

**Czego nie obiecujemy:**

- Że obejdziemy ToS lub API buildera w sposób trwały bez ich zgody.
- Że broker gwarantuje pełny „live stream” postępu u każdego buildera bez ich kontraktu (SSE/webhook/poll).

## ToS i compliance

- Odsyłamy do regulaminu partnera; u nas: [POP-LEGAL-RISK-MATRIX.md](./POP-LEGAL-RISK-MATRIX.md).
- Zachęcamy do **pilota VBP** zamiast długiego utrzymania mostów.

## Handoff i konta użytkowników

- Jasno: **wiele builderów = wiele kont po stronie buildera**, chyba że ustalicie SSO — [POP-PARTNER-OBJECTIONS.md](./POP-PARTNER-OBJECTIONS.md).

## Open source

- „Spec i narzędzia walidacji są **publiczne**; pełny hosted broker i wrażliwe operacje — nie.” — [POP-OSS-SCOPE.md](./POP-OSS-SCOPE.md).
