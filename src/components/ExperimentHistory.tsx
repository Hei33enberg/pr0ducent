import { motion } from "framer-motion";
import type { Experiment } from "@/types/experiment";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Trash2, FlaskConical, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getToolById } from "@/config/tools";
import { useTranslation } from "@/lib/i18n";

interface ExperimentHistoryProps {
  experiments: Experiment[];
  onSelect: (exp: Experiment) => void;
  onDelete?: (expId: string) => void;
}

export function ExperimentHistory({ experiments, onSelect, onDelete }: ExperimentHistoryProps) {
  const { t } = useTranslation();

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-lg font-serif font-bold text-foreground">{t("history.title")}</h2>
      </div>

      {experiments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-dashed border-border bg-muted/30 p-10 flex flex-col items-center gap-3"
        >
          <FlaskConical className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground text-center font-sans">
            {t("history.empty")}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {experiments.map((exp, i) => {
            const completed = exp.runs.filter((r) => r.status === "completed").length;
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
      )}
    </section>
  );
}
