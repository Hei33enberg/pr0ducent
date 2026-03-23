# Contributing to VBP

Thanks for helping make the **Vibecoding Broker Protocol (VBP)** clearer and easier to adopt.

## What belongs in this repo

- JSON Schemas and OpenAPI under `schemas/` and `openapi/`
- Validator under `validator/`
- Examples under `examples/`
- SDK stubs under `sdk/`
- Documentation that applies to **any** broker implementing VBP

Broker-specific deployment (Supabase Edge, billing, etc.) lives in the main application monorepo, not here.

## Quickstart for contributors

1. Read [CONFORMANCE.md](./CONFORMANCE.md) (Verified / Partial / Experimental).
2. Run the validator against a test base URL: `cd validator && npm install && node cli.mjs <baseUrl>`.
3. For schema changes, keep [GOVERNANCE.md](./GOVERNANCE.md) in mind (versioned paths, RFC for breaking changes).

## Adding a builder row to the compatibility matrix

Edit [COMPATIBILITY-MATRIX.md](./COMPATIBILITY-MATRIX.md) and open a PR. Include:

- Builder name and public docs URL (if any)
- Observed conformance level and date
- Notes (poll-only, webhook-only, etc.)

## Issue templates

Use the GitHub templates under `.github/ISSUE_TEMPLATE/`:

- **New builder** — onboarding a new platform
- **Schema gap** — spec vs reality
- **Compatibility report** — validator or integration results

## Code of conduct

Be constructive; integration work is full of vendor-specific quirks. Prefer reproducible examples and links to public docs.
