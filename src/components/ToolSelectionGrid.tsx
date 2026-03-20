import { BUILDER_TOOLS } from "@/config/tools";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToolSelectionGridProps {
  selectedTools: string[];
  onSelectionChange: (tools: string[]) => void;
}

export function ToolSelectionGrid({
  selectedTools,
  onSelectionChange,
}: ToolSelectionGridProps) {
  const toggleTool = (id: string) => {
    if (selectedTools.includes(id)) {
      onSelectionChange(selectedTools.filter((t) => t !== id));
    } else {
      onSelectionChange([...selectedTools, id]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground font-sans">Select Builders</h3>
        <button
          onClick={() =>
            selectedTools.length === BUILDER_TOOLS.length
              ? onSelectionChange(BUILDER_TOOLS.filter((t) => t.featured).map((t) => t.id))
              : onSelectionChange(BUILDER_TOOLS.map((t) => t.id))
          }
          className="text-xs text-primary hover:underline font-sans"
        >
          {selectedTools.length === BUILDER_TOOLS.length ? "Deselect all" : "Select all"}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {BUILDER_TOOLS.map((tool) => {
          const isSelected = selectedTools.includes(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-lg border p-3 transition-all text-left",
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
                <div className="text-xs font-medium text-foreground truncate">{tool.name}</div>
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
