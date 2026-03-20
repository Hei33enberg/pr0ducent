import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Monitor, Smartphone, Tablet, ExternalLink, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type ViewportSize = "mobile" | "tablet" | "desktop";

interface DemoPreviewFrameProps {
  previewUrl: string | null | undefined;
  toolName: string;
  screenshotUrl?: string | null;
  className?: string;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}

export function DemoPreviewFrame({ previewUrl, toolName, screenshotUrl, className, onFullscreen, isFullscreen = false }: DemoPreviewFrameProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const src = previewUrl?.trim() || null;
  const shot = screenshotUrl?.trim() || null;

  const handleRefresh = () => {
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    if (src) {
      window.open(src, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={cn("flex flex-col rounded-xl overflow-hidden border border-border bg-card w-full h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border">
        {/* URL / Tool Info */}
        <div className="flex items-center gap-2 max-w-[40%] overflow-hidden">
          <div className="flex gap-1.5 opacity-50 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/80" />
          </div>
          <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-background text-muted-foreground truncate border border-border/50 select-all">
            {src ? src.replace(/^https?:\/\//, '') : (shot ? "Screenshot Preview" : "Waiting for deployment...")}
          </div>
        </div>

        {/* Viewport Toggles & Actions */}
        <div className="flex items-center gap-1">
          <div className="hidden sm:flex bg-background border border-border/50 rounded-md p-0.5 mr-2">
            <button
              onClick={() => setViewport("mobile")}
              className={cn("p-1.5 rounded-sm transition-colors", viewport === "mobile" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              title="Mobile (375px)"
              disabled={!src}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={cn("p-1.5 rounded-sm transition-colors", viewport === "tablet" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              title="Tablet (768px)"
              disabled={!src}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport("desktop")}
              className={cn("p-1.5 rounded-sm transition-colors", viewport === "desktop" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              title="Desktop (100%)"
              disabled={!src}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleRefresh} title="Refresh demo" disabled={!src}>
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleOpenExternal} title="Open in new tab" disabled={!src}>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          {onFullscreen && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hidden lg:flex" onClick={onFullscreen} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden bg-muted/10 min-h-[200px]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)/0.1) 1px, transparent 0)",
          backgroundSize: "24px 24px"
        }}
      >
        <AnimatePresence>
          {isLoading && src && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center p-4 text-center"
            >
              <div className="flex flex-col items-center gap-3 glass-card px-6 py-4 rounded-xl shadow-lg border border-border/50">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs font-mono text-muted-foreground">Booting container for {toolName}...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {src ? (
          <div
            className={cn(
              "transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] origin-top bg-background shadow-2xl relative flex flex-col items-center",
              viewport === "mobile" ? "w-[375px] h-[812px] rounded-[2.5rem] border-[12px] border-foreground/10 overflow-hidden" :
              viewport === "tablet" ? "w-[768px] h-[1024px] rounded-xl border-8 border-foreground/10 overflow-hidden" :
              "w-full h-full border-0 rounded-none shadow-inner"
            )}
            style={{
              transform: viewport !== "desktop" && !isFullscreen ? "scale(min(0.8, 100%)) translateY(5%)" : "none"
            }}
          >
            <iframe
              key={key}
              ref={iframeRef}
              src={src}
              title={`${toolName} demo`}
              className="w-full h-full flex-1 border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        ) : shot ? (
          <div className="w-full h-full p-4 flex items-center justify-center overflow-auto bg-background/50 backdrop-blur-sm">
             <img src={shot} alt="Screenshot" className="max-w-full max-h-[400px] object-contain rounded-md shadow-lg border border-border/50" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="glass-card px-4 py-3 rounded-xl flex items-center gap-2 text-sm text-muted-foreground border border-border/50">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Waiting for preview stream...</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
