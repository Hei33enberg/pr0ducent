import { useTranslation } from "@/lib/i18n";
import { PenLine, Layers, Trophy } from "lucide-react";

const steps = [
  { icon: PenLine, key: "step1" },
  { icon: Layers, key: "step2" },
  { icon: Trophy, key: "step3" },
] as const;

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="section-gradient-gold py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-center mb-12">
          {t("howItWorks.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="glass-card rounded-2xl p-6 text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground font-sans">{i + 1}</span>
                </div>
                <Icon className="w-7 h-7 mx-auto text-accent" />
                <h3 className="text-lg font-serif font-bold text-foreground">
                  {t(`howItWorks.${step.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  {t(`howItWorks.${step.key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
