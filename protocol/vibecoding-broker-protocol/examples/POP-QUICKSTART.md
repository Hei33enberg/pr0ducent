# VBP — Quickstart (90 minutes)

Cel: lokalny builder minimalny, który przechodzi walidator i może posłużyć jako szablon dla partnerów.

## Kroki

1. **Uruchom przykład Node** — [minimal-node/README.md](./minimal-node/README.md).
2. **Odpal validator** z katalogu `validator/`:

   ```bash
   cd validator && npm install && node cli.mjs https://localhost:PORT/vbp/v1
   ```

   (Zastąp URL bazą Twojego serwera testowego.)

3. **Sprawdź conformance** — [CONFORMANCE.md](../CONFORMANCE.md) (Verified vs Partial).
4. **Porównaj z brokerem** — staging `pbp-webhook` + klucz partnera zgodnie z [PARTNER-ONBOARDING.md](../../../docs/PARTNER-ONBOARDING.md).

## Dokumentacja monorepo

- [docs/VBP-SPEC.md](../../../docs/VBP-SPEC.md)
- [docs/POP-INDEX.md](../../../docs/POP-INDEX.md)
