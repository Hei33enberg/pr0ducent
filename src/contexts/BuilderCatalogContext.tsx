import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BUILDER_TOOLS, type BuilderTool } from "@/config/tools";
import { mergeBuilderCatalog, type BuilderCatalogRow } from "@/lib/builder-catalog";

type BuilderCatalogContextValue = {
  tools: BuilderTool[];
  loading: boolean;
  getToolById: (id: string) => BuilderTool | undefined;
};

const BuilderCatalogContext = createContext<BuilderCatalogContextValue | null>(null);

export function BuilderCatalogProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<BuilderTool[]>(BUILDER_TOOLS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase.from("builder_integration_config").select("*");
      if (cancelled) return;
      if (error || !data?.length) {
        setTools(BUILDER_TOOLS);
        setLoading(false);
        return;
      }
      setTools(mergeBuilderCatalog(BUILDER_TOOLS, data as BuilderCatalogRow[]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getToolById = useCallback(
    (id: string) => tools.find((t) => t.id === id),
    [tools]
  );

  const value = useMemo(
    () => ({ tools, loading, getToolById }),
    [tools, loading, getToolById]
  );

  return <BuilderCatalogContext.Provider value={value}>{children}</BuilderCatalogContext.Provider>;
}

export function useBuilderCatalog(): BuilderCatalogContextValue {
  const ctx = useContext(BuilderCatalogContext);
  if (!ctx) {
    throw new Error("useBuilderCatalog must be used within BuilderCatalogProvider");
  }
  return ctx;
}

/** Sprint 4 / AG naming — alias of {@link useBuilderCatalog}. */
export const useBuildersRegistry = useBuilderCatalog;

/** Sprint 4 / AG naming — alias of {@link BuilderCatalogProvider}. */
export { BuilderCatalogProvider as BuildersRegistryProvider };
