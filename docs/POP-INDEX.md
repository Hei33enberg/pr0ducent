# VBP (Vibecoding Broker Protocol) — documentation index

**Naming canon:** use **VBP** only — [VBP-POP-BRANDING.md](./VBP-POP-BRANDING.md). Files in the repo still use the `POP-*` path prefix (history); content refers to VBP.

## Start here (one-pagers)

- [POP-START-HERE.md](./POP-START-HERE.md) — partner map (30 min → pilot → conformance)
- [POP-OSS-SCOPE.md](./POP-OSS-SCOPE.md) — what is open source and what is not
- [POP-PUBLIC-MESSAGING.md](./POP-PUBLIC-MESSAGING.md) — bridge mode and ToS messaging (public docs)

## Start here

| Document | Description |
|----------|-------------|
| [VBP-SPEC.md](./VBP-SPEC.md) | Normative HTTP specification |
| [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md) | Discovery 30 min + pilot |
| [POP-PARTNER-PITCH.md](./POP-PARTNER-PITCH.md) | Builder pitch |
| [POP-CONFORMANCE-PROFILES.md](./POP-CONFORMANCE-PROFILES.md) | Verified / Partial / Production gate profiles |

## Business and negotiation

- [POP-PARTNER-OBJECTIONS.md](./POP-PARTNER-OBJECTIONS.md)
- [POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md)
- [POP-BUSINESS-NEGOTIATION-CHECKLIST.md](./POP-BUSINESS-NEGOTIATION-CHECKLIST.md)
- [POP-LEGAL-RISK-MATRIX.md](./POP-LEGAL-RISK-MATRIX.md)
- [POP-PILOT-SUCCESS-CRITERIA.md](./POP-PILOT-SUCCESS-CRITERIA.md)

## Security and conformance

- [POP-SECURITY-MODEL.md](./POP-SECURITY-MODEL.md)
- [POP-CONFORMANCE-PROFILES.md](./POP-CONFORMANCE-PROFILES.md)
- [BUILDER-PIPELINE-HARDENING-AUDIT.md](./BUILDER-PIPELINE-HARDENING-AUDIT.md)

## Bridge mode (before native VBP)

- [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md)
- [POP-BRIDGE-ARCHITECTURE.md](./POP-BRIDGE-ARCHITECTURE.md) — feature flags: `VITE_FF_BRIDGE_MODE`, `VITE_FF_BRIDGE_AGGRESSIVE` ([featureFlags.ts](../src/lib/featureFlags.ts))
- [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md)
- [POP-BRIDGE-RUNBOOK.md](./POP-BRIDGE-RUNBOOK.md)
- [POP-ROI-METRICS.md](./POP-ROI-METRICS.md)

## OSS publication

- [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md)
- [protocol/vibecoding-broker-protocol/README.md](../protocol/vibecoding-broker-protocol/README.md)
- [protocol/vibecoding-broker-protocol/examples/POP-QUICKSTART.md](../protocol/vibecoding-broker-protocol/examples/POP-QUICKSTART.md) — “90 minute” partner path

## Orchestration in the product

- [ORCHESTRATOR.md](./ORCHESTRATOR.md)
- [DEVELOPMENT-STATUS.md](./DEVELOPMENT-STATUS.md)

## Delivery (Vercel, Lovable, simulation)

- [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md) — frontend on Vercel + Supabase (primary path)
- [VERCEL-SUPABASE-STEP-BY-STEP.md](./VERCEL-SUPABASE-STEP-BY-STEP.md) — deployment walkthrough
- [LOVABLE-SECONDARY-LP.md](./LOVABLE-SECONDARY-LP.md) — secondary Lovable role (LP / murd0ch)
- [VBP-INTEGRATION-SIMULATION.md](./VBP-INTEGRATION-SIMULATION.md) — dry-run integration on staging
- [VBP-ROADMAP-V0-BRIDGES.md](./VBP-ROADMAP-V0-BRIDGES.md) — v0, bridges, native VBP goal
- [GITHUB-COPILOT-VBP-REPO-PROMPT.md](./GITHUB-COPILOT-VBP-REPO-PROMPT.md) — prompt for publishing the public spec repo
- [GITHUB-SETTINGS-SOLO-AND-TEAM.md](./GITHUB-SETTINGS-SOLO-AND-TEAM.md) — PRs, Stripe in Sponsor, solo → team
- [DISCUSSIONS-WELCOME-COPY.md](./DISCUSSIONS-WELCOME-COPY.md) — Discussions welcome post copy
- [GITHUB-COPILOT-OSS-SETUP-PROMPT.md](./GITHUB-COPILOT-OSS-SETUP-PROMPT.md) — Copilot prompt (`.github` files, not Settings)
- [GITHUB-WHO-DOES-WHAT.md](./GITHUB-WHO-DOES-WHAT.md) — Cursor vs Copilot vs you + prompt + manual checklist
