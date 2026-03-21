# VBP / POP governance

## Versioning

- **Spec** (`docs/VBP-SPEC.md` in the broker monorepo): semantic versioning of protocol behavior (`v0.1`, `v0.2`, …).
- **JSON Schemas** and **OpenAPI** in this bundle track the same minor version.
- **Breaking changes** require a new major or explicit deprecation window (documented in `CHANGELOG.md` when published as a standalone repo).

## RFC process

1. Open a GitHub Discussion or RFC issue with: problem, proposed API shape, migration path.
2. Maintainers review for compatibility with existing brokers (e.g. pr0ducent) and builders.
3. Accepted RFCs are implemented behind versioned paths (`/vbp/v1/…`) before default routing moves.

## Roles

- **Maintainers**: merge spec + reference implementations, cut releases.
- **Contributors**: PRs for schemas, validator, SDKs, docs; must pass `npm run vbp-validate` (validator package) where applicable.

## Trademark

Marketing name **pr0ducent Open Protocol (POP)**; technical identifier **VBP** — see [VBP-POP-BRANDING.md](../../docs/VBP-POP-BRANDING.md) in the application repo.
