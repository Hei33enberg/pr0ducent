# VBP — Quickstart (90 minutes)

Goal: a minimal local builder that passes the validator and can serve as a partner template.

## Steps

1. **Run the Node example** — [minimal-node/README.md](./minimal-node/README.md).
2. **Run the validator** from the `validator/` directory:

   ```bash
   cd validator && npm install && node cli.mjs https://localhost:PORT/vbp/v1
   ```

   (Replace the URL with your test server base.)

3. **Check conformance** — [CONFORMANCE.md](../CONFORMANCE.md) (Verified vs Partial).
4. **Compare with the broker** — staging `pbp-webhook` + partner key per [PARTNER-ONBOARDING.md](../../../docs/PARTNER-ONBOARDING.md).

## Monorepo docs

- [docs/VBP-SPEC.md](../../../docs/VBP-SPEC.md)
- [docs/POP-INDEX.md](../../../docs/POP-INDEX.md)
