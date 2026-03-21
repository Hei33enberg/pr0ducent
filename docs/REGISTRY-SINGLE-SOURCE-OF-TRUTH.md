# Builder registry — single source of truth (checklist)

- **Runtime catalog:** [`src/contexts/BuilderCatalogContext.tsx`](../src/contexts/BuilderCatalogContext.tsx) ładuje `builder_integration_config` i scala z [`mergeBuilderCatalog`](../src/lib/builder-catalog.ts) + statyczne defaults z [`src/config/tools.ts`](../src/config/tools.ts).
- **Hooki:** `useBuilderCatalog` i alias `useBuildersRegistry` — jeden kontekst; komponenty listujące buildery powinny brać `tools` stąd, nie duplikować tablic.
- **Fallback:** przy błędzie sieci / pustym wierszu kontekst wraca do `BUILDER_TOOLS` — to zamierzone; marketingowe metadane nadal żyją w `tools.ts`.
- **Wyjątek:** [`src/lib/mock-experiment.ts`](../src/lib/mock-experiment.ts) importuje `BUILDER_TOOLS` do mocków offline — OK poza ścieżką produkcyjną UI.
