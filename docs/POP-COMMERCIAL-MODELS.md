# VBP — commercial models and billing (framework)

**Disclaimer:** not legal or tax advice — align with counsel before signing.

## Goals for the builder

- New users from broker channels (discovery).
- Predictable cost of integration support (pilot → production).
- Clear **attribution** (which broker sent which user).

## Goals for the broker (pr0ducent)

- Balance orchestration costs (Edge, queue, scoring).
- Fair presentation of tools (benchmark vs live).
- Data for partner settlements.

## Settlement variants

| Model | When | Notes |
|-------|------|--------|
| **Rev-share** | Builder pays % of revenue from users attributed to POP | Requires “qualified account” definition and attribution window (e.g. 30–90 days). |
| **CPA** | Payment per qualified signup or first payment | Easier to measure; fraud risk — verification on builder side. |
| **Flat pilot** | Fixed fee for technical pilot + support | Good to start without heavy tracking. |
| **Hybrid** | Low flat + lower rev-share | Often acceptable to both sides. |

## Billing events (wire to product)

1. **Lead:** user clicked CTA “Continue in {Builder}” — log `referral_clicks` (broker).
2. **Handoff:** `logReferralHandoff` / `referral_conversions` with `conversion_type: builder_handoff` (implementation in [experiment-service.ts](../src/lib/experiment-service.ts)).
3. **Conversion at builder:** partner confirms (e.g. webhook to broker, export file, partner dashboard) — **beyond MVP** needs a contract.

## Attribution rules (negotiable)

- **First-touch** vs **last-touch** — pick one per program.
- **Time window** — e.g. 30 days from first POP click.
- **Dedup** — one user = one conversion per window (e.g. by `user_id` or email hash on builder side).

## Related

- [POP-ROI-METRICS.md](./POP-ROI-METRICS.md)
- [POP-BUSINESS-NEGOTIATION-CHECKLIST.md](./POP-BUSINESS-NEGOTIATION-CHECKLIST.md)
