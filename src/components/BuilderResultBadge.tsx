import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuilderResult } from "@/hooks/useBuilderApi";

interface BuilderResultBadgeProps {
  result?: BuilderResult;
}

export function BuilderResultBadge({ result }: BuilderResultBadgeProps) {
  if (!result) return null;

  if (result.status === "generating") {
    return (
      <Badge variant="outline" className="gap-1 text-[10px] font-medium border-0 bg-warning/15 text-warning">
        <Loader2 className="w-3 h-3 animate-spin" />
        v0 generating…
      </Badge>
    );
  }

  if (result.status === "error") {
    return (
      <Badge variant="outline" className="gap-1 text-[10px] font-medium border-0 bg-destructive/15 text-destructive">
        <AlertCircle className="w-3 h-3" />
        API error
      </Badge>
    );
  }

  if (result.status === "completed") {
    return (
      <div className="space-y-1.5">
        <Badge variant="outline" className="gap-1 text-[10px] font-medium border-0 bg-success/15 text-success">
          <CheckCircle2 className="w-3 h-3" />
          Real v0 result • {((result.generationTimeMs || 0) / 1000).toFixed(1)}s
        </Badge>

        <div className="flex gap-1.5">
          {result.chatUrl && (
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                window.open(result.chatUrl, "_blank");
              }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open in v0
            </Button>
          )}
          {result.previewUrl && (
            <Button
              size="sm"
              variant="default"
              className="text-[10px] h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                window.open(result.previewUrl, "_blank");
              }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Live Preview
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
