import { copy } from "@/lib/copy";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, ArrowUpDown, X } from "lucide-react";

export type SortOption = "default" | "score" | "speed" | "name";

interface CanvasFiltersProps {
  hiddenTools: Set<string>;
  onToggleTool: (toolId: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableToolIds: string[];
}

export function CanvasFilters({
  hiddenTools,
  onToggleTool,
  sortBy,
  onSortChange,
  availableToolIds,
}: CanvasFiltersProps) {
  const { tools: allTools } = useBuilderCatalog();
  const tools = allTools.filter((tool) => availableToolIds.includes(tool.id));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
        <Filter className="w-3.5 h-3.5" />
        <span>{copy["canvas.filter"]}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tools.map((tool) => {
          const hidden = hiddenTools.has(tool.id);
          return (
            <Badge
              key={tool.id}
              variant={hidden ? "outline" : "secondary"}
              className={`cursor-pointer text-[10px] transition-opacity ${hidden ? "opacity-40" : ""}`}
              onClick={() => onToggleTool(tool.id)}
            >
              {tool.name}
              {hidden && <X className="w-2.5 h-2.5 ml-1" />}
            </Badge>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="h-7 text-xs w-32 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">{copy["canvas.sortDefault"]}</SelectItem>
            <SelectItem value="score">{copy["canvas.sortScore"]}</SelectItem>
            <SelectItem value="speed">{copy["canvas.sortSpeed"]}</SelectItem>
            <SelectItem value="name">{copy["canvas.sortName"]}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
