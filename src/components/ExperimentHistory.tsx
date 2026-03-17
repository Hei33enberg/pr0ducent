import { motion } from "framer-motion";
import type { Experiment } from "@/types/experiment";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Beaker } from "lucide-react";

interface ExperimentHistoryProps {
  experiments: Experiment[];
  onSelect: (exp: Experiment) => void;
}

export function ExperimentHistory({ experiments, onSelect }: ExperimentHistoryProps) {
  if (experiments.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-4">
        <Beaker className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Past Experiments</h2>
      </div>
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
                    <div className="text-sm font-medium text-foreground truncate">
                      {exp.prompt}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(exp.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {exp.selectedTools.length} tools
                      </Badge>
                      <span>
                        {completed}/{exp.runs.length} completed
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
