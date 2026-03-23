# VBP (Vibecoding Broker Protocol) — indeks dokumentacji

**Kanon nazewnictwa:** wyłącznie **VBP** — [VBP-POP-BRANDING.md](./VBP-POP-BRANDING.md). Pliki w repozytorium nadal używają prefiksu `POP-*` w ścieżkach (historia); treść odnosi się do VBP.

## Start tutaj (1 strona)

- [POP-START-HERE.md](./POP-START-HERE.md) — mapa dla partnera (30 min → pilot → conformance)
- [POP-OSS-SCOPE.md](./POP-OSS-SCOPE.md) — co jest open source, czego nie
- [POP-PUBLIC-MESSAGING.md](./POP-PUBLIC-MESSAGING.md) — komunikacja bridge mode i ToS (publiczne docs)

## Start tutaj

| Dokument | Opis |
|----------|------|
| [VBP-SPEC.md](./VBP-SPEC.md) | Normatywna specyfikacja HTTP |
| [PARTNER-ONBOARDING.md](./PARTNER-ONBOARDING.md) | Discovery 30 min + pilot |
| [POP-PARTNER-PITCH.md](./POP-PARTNER-PITCH.md) | Pitch dla buildera |
| [POP-CONFORMANCE-PROFILES.md](./POP-CONFORMANCE-PROFILES.md) | Profile Verified / Partial / Production gate |

## Biznes i negocjacje

- [POP-PARTNER-OBJECTIONS.md](./POP-PARTNER-OBJECTIONS.md)
- [POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md)
- [POP-BUSINESS-NEGOTIATION-CHECKLIST.md](./POP-BUSINESS-NEGOTIATION-CHECKLIST.md)
- [POP-LEGAL-RISK-MATRIX.md](./POP-LEGAL-RISK-MATRIX.md)
- [POP-PILOT-SUCCESS-CRITERIA.md](./POP-PILOT-SUCCESS-CRITERIA.md)

## Bezpieczeństwo i conformance

- [POP-SECURITY-MODEL.md](./POP-SECURITY-MODEL.md)
- [POP-CONFORMANCE-PROFILES.md](./POP-CONFORMANCE-PROFILES.md)
- [BUILDER-PIPELINE-HARDENING-AUDIT.md](./BUILDER-PIPELINE-HARDENING-AUDIT.md)

## Bridge mode (przed natywnym VBP)

- [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md)
- [POP-BRIDGE-ARCHITECTURE.md](./POP-BRIDGE-ARCHITECTURE.md) — feature flags: `VITE_FF_BRIDGE_MODE`, `VITE_FF_BRIDGE_AGGRESSIVE` ([featureFlags.ts](../src/lib/featureFlags.ts))
- [POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md)
- [POP-BRIDGE-RUNBOOK.md](./POP-BRIDGE-RUNBOOK.md)
- [POP-ROI-METRICS.md](./POP-ROI-METRICS.md)

## Publikacja OSS

- [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md)
- [protocol/vibecoding-broker-protocol/README.md](../protocol/vibecoding-broker-protocol/README.md)
- [protocol/vibecoding-broker-protocol/examples/POP-QUICKSTART.md](../protocol/vibecoding-broker-protocol/examples/POP-QUICKSTART.md) — ścieżka „90 min” dla partnera

## Orkiestracja w produkcie

- [ORCHESTRATOR.md](./ORCHESTRATOR.md)
- [DEVELOPMENT-STATUS.md](./DEVELOPMENT-STATUS.md)

## Dostarczenie (Vercel, Lovable, symulacja)

- [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md) — front na Vercel + Supabase (główny tor)
- [VERCEL-SUPABASE-KROK-PO-KROKU.md](./VERCEL-SUPABASE-KROK-PO-KROKU.md) — przewodnik wdrożeniowy (PL)
- [LOVABLE-SECONDARY-LP.md](./LOVABLE-SECONDARY-LP.md) — rola poboczna Lovable (LP / murd0ch)
- [VBP-INTEGRATION-SIMULATION.md](./VBP-INTEGRATION-SIMULATION.md) — dry-run integracji na staging
- [VBP-ROADMAP-V0-BRIDGES.md](./VBP-ROADMAP-V0-BRIDGES.md) — v0, mosty, cel natywny VBP
- [GITHUB-COPILOT-VBP-REPO-PROMPT.md](./GITHUB-COPILOT-VBP-REPO-PROMPT.md) — prompt do publikacji publicznego repo specu
- [GITHUB-SETTINGS-SOLO-AND-TEAM.md](./GITHUB-SETTINGS-SOLO-AND-TEAM.md) — PR, Stripe w Sponsor, solo → zespół
- [DISCUSSIONS-WELCOME-COPY.md](./DISCUSSIONS-WELCOME-COPY.md) — tekst powitalny Discussions
- [GITHUB-COPILOT-OSS-SETUP-PROMPT.md](./GITHUB-COPILOT-OSS-SETUP-PROMPT.md) — prompt Copilot (pliki `.github`, nie Settings)
- [GITHUB-KTO-CO-ROBI.md](./GITHUB-KTO-CO-ROBI.md) — Cursor vs Copilot vs Ty + prompt + checklista ręczna
