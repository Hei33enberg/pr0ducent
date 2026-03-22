import { useTranslation } from "@/lib/i18n";
import { PenLine, Layers, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: PenLine, key: "step1" },
  { icon: Layers, key: "step2" },
  { icon: Trophy, key: "step3" },
] as const;

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="section-gradient-gold py-10 md:py-14">
      <motion.div
        className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-center mb-6">
          {t("howItWorks.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="bg-card border border-border/50 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground font-sans">{i + 1}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-accent shrink-0" />
                    <h3 className="text-sm font-serif font-bold text-foreground leading-tight">
                      {t(`howItWorks.${step.key}.title`)}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                    {t(`howItWorks.${step.key}.desc`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
