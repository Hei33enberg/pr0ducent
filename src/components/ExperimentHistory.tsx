import { copy } from "@/lib/copy";
import { motion } from "framer-motion";
import type { Experiment } from "@/types/experiment";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";

interface ExperimentHistoryProps {
  experiments: Experiment[];
  onSelect: (exp: Experiment) => void;
  onDelete?: (expId: string) => void;
}

/** Past runs list. Homepage renders this only when `experiments.length > 0`. */
export function ExperimentHistory({ experiments, onSelect, onDelete }: ExperimentHistoryProps) {
  const { getToolById } = useBuilderCatalog();

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-sans mb-3">
          {copy["history.eyebrow"]}
        </p>
        <h2
          className="font-serif font-bold tracking-[-0.02em] text-foreground leading-tight"
          style={{ fontSize: "clamp(2.25rem, 4vw + 0.5rem, 3.25rem)" }}
        >
          {copy["history.title"]}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground font-sans mt-3">{copy["history.subtitle"]}</p>
      </header>

      <div className="space-y-3">
        {experiments.map((exp, i) => {
          return (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelect(exp)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate font-sans">
                      {exp.prompt}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap font-sans">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(exp.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {exp.selectedTools.length} tools
                      </Badge>
                      <div className="flex items-center gap-1.5 ml-1">
                        {exp.runs.map((r, ri) => {
                          const tool = getToolById(r.toolId);
                          return (
                            <div
                              key={ri}
                              title={`${tool?.name || r.toolId}: ${r.status}`}
                              className="w-4 h-4 rounded-full flex items-center justify-center bg-muted/50 border border-border/50"
                            >
                              {r.status === "completed" ? (
                                <CheckCircle2 className="w-3 h-3 text-success" />
                              ) : r.status === "error" ? (
                                <AlertCircle className="w-3 h-3 text-destructive" />
                              ) : (
                                <Loader2 className="w-3 h-3 text-primary animate-spin" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {exp.useCaseTags && exp.useCaseTags.length > 0 && exp.useCaseTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(exp.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
