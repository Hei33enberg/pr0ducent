# Marketplace + remix (stub)

Public demos from **expired phantom sessions** (VBP) will surface here: static preview assets, remix lineage, attribution to source builder.

**Next steps**

- Table `public_marketplace_demos` (or reuse `experiments.is_public` + frozen artifact snapshot).
- Edge: `remix-experiment` calling builder `POST /vbp/v1/remix/{run_id}` when VBP is available.
- UI: grid of community demos; `VbpClaimButton` + share.

Until then, use `VbpClaimButton` + `DemoPreviewFrame` on authenticated compare flows.
