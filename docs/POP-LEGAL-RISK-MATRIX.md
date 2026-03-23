# VBP — legal and ToS risk matrix (bridge vs native)

**Goal:** informed decisions before enabling aggressive bridges or collecting partner data. **Does not replace** legal counsel.

## Axis: integration type

| Type | Description | Typical risk level |
|------|-------------|---------------------|
| **Native VBP** | Builder’s public API per [VBP-SPEC.md](./VBP-SPEC.md), partner agreement | Low (contractual terms clear) |
| **api_partial** | URL trigger, embed, limited API | Medium (volatility, missing status) |
| **browser_only** | UI automation without public API | High (ToS, UI changes, abuse) |

## Example risk categories

| Risk | Description | Mitigation |
|------|-------------|------------|
| **ToS violation** | Login automation, scraping, limit bypass | Only with written consent or partner program; otherwise `no_go`. |
| **Content liability** | User prompts generate illegal content at partner | Trust & safety policies on both sides; reporting. |
| **Personal data** | Identifiers in `user_context` | Minimize; ROPA/DPA if EU; user consent. |
| **IP / code licenses** | Who owns generated code | Per builder terms; disclose in pitch. |
| **Attribution disputes** | Commission dispute | Written model ([POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md)), single source of truth for events. |

## Kill-switch

If a partner reports a violation or changes ToS: **immediate disable** of the bridge in config (`bridge_mode = no_go` in [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md)) — procedure: [POP-BRIDGE-RUNBOOK.md](./POP-BRIDGE-RUNBOOK.md).

## Replit (example)

Public [Terms of Service](https://replit.com/terms-of-service) include restrictions on **scraping**, **reverse engineering**, **resource abuse**, and **automated account creation**. RPA bridges without consent carry high risk — treat as **contract-required** or `no_go`.
