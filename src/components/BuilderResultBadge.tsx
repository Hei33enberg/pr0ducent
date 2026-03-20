import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Loader2, CheckCircle2, AlertCircle, Maximize2 } from "lucide-react";
import type { BuilderResult } from "@/hooks/useBuilderApi";

interface BuilderResultBadgeProps {
  result?: BuilderResult;
}

export function BuilderResultBadge({ result }: BuilderResultBadgeProps) {
  const [showFullPreview, setShowFullPreview] = useState(false);

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
      <div className="space-y-1.5">
        <Badge variant="outline" className="gap-1 text-[10px] font-medium border-0 bg-destructive/15 text-destructive">
          <AlertCircle className="w-3 h-3" />
          {result.error || "API error"}
        </Badge>
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
      </div>
    );
  }

  if (result.status === "completed") {
    return (
      <>
        <div className="space-y-1.5">
          <Badge variant="outline" className="gap-1 text-[10px] font-medium border-0 bg-success/15 text-success">
            <CheckCircle2 className="w-3 h-3" />
            Real v0 • {((result.generationTimeMs || 0) / 1000).toFixed(1)}s
          </Badge>

          <div className="flex gap-1.5">
            {result.previewUrl && (
              <Button
                size="sm"
                variant="default"
                className="text-[10px] h-6 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullPreview(true);
                }}
              >
                <Maximize2 className="w-3 h-3 mr-1" />
                Full Preview
              </Button>
            )}
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
          </div>
        </div>

        {result.previewUrl && (
          <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
            <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 overflow-hidden">
              <DialogHeader className="px-4 py-3 border-b border-border">
                <DialogTitle className="text-sm flex items-center gap-2">
                  v0 Live Preview
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[10px] h-6 px-2 ml-auto"
                    onClick={() => window.open(result.previewUrl, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in new tab
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <iframe
                src={result.previewUrl}
                title="v0 full preview"
                className="w-full flex-1 border-0"
                style={{ height: "calc(85vh - 56px)" }}
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return null;
}
