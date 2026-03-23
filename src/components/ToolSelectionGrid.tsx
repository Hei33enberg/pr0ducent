import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToolSelectionGridProps {
  selectedTools: string[];
  onSelectionChange: (tools: string[]) => void;
  /** Tighter spacing for hero / dense layouts */
  compact?: boolean;
}

export function ToolSelectionGrid({
  selectedTools,
  onSelectionChange,
  compact = false,
}: ToolSelectionGridProps) {
  const { tools } = useBuilderCatalog();
  const toggleTool = (id: string) => {
    if (selectedTools.includes(id)) {
      onSelectionChange(selectedTools.filter((t) => t !== id));
    } else {
      onSelectionChange([...selectedTools, id]);
    }
  };

  return (
    <div>
      <div className={cn("flex items-center justify-between", compact ? "mb-2" : "mb-3")}>
        <h3 className={cn("font-semibold text-foreground font-sans", compact ? "text-xs" : "text-sm")}>
          Select Builders
        </h3>
        <button
          onClick={() =>
            selectedTools.length === tools.length
              ? onSelectionChange(tools.filter((t) => t.featured).map((t) => t.id))
              : onSelectionChange(tools.map((t) => t.id))
          }
          className={cn("text-primary hover:underline font-sans", compact ? "text-[11px]" : "text-xs")}
        >
          {selectedTools.length === tools.length ? "Deselect all" : "Select all"}
        </button>
      </div>
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
          compact ? "gap-1.5" : "gap-2"
        )}
      >
        {tools.map((tool) => {
          const isSelected = selectedTools.includes(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={cn(
                "relative flex items-center rounded-lg border transition-all text-left",
                compact ? "gap-1.5 p-2" : "gap-2 p-3",
                isSelected
                  ? tool.featured
                    ? "border-featured bg-featured/5 shadow-md"
                    : "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30",
                tool.featured && "ring-1 ring-featured/20"
              )}
            >
              <Checkbox
                checked={isSelected}
                className="pointer-events-none"
              />
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "font-medium text-foreground truncate",
                    compact ? "text-[11px] leading-tight" : "text-xs"
                  )}
                >
                  {tool.name}
                </div>
              </div>
              {tool.featured && (
                <Badge className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0 bg-featured text-featured-foreground border-0">
                  ★
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
