# Builder registry — single source of truth (checklist)

- **Runtime catalog:** [`src/contexts/BuilderCatalogContext.tsx`](../src/contexts/BuilderCatalogContext.tsx) loads `builder_integration_config` and merges with [`mergeBuilderCatalog`](../src/lib/builder-catalog.ts) + static defaults from [`src/config/tools.ts`](../src/config/tools.ts).
- **Hooks:** `useBuilderCatalog` and alias `useBuildersRegistry` — one context; components listing builders should take `tools` from here, not duplicate arrays.
- **Fallback:** on network error / empty row the context falls back to `BUILDER_TOOLS` — intentional; marketing metadata still lives in `tools.ts`.
- **Exception:** [`src/lib/mock-experiment.ts`](../src/lib/mock-experiment.ts) imports `BUILDER_TOOLS` for offline mocks — OK outside production UI paths.
