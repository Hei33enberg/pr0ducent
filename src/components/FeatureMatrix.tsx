import { COMPARISON_FEATURES } from "@/config/comparison-features";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { useTranslation } from "@/lib/i18n";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

export function FeatureMatrix() {
  const { tools } = useBuilderCatalog();
  const { t } = useTranslation();

  return (
    <section id="features" className="max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <header className="text-center mb-10 max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-sans mb-3">
            {t("featureMatrix.eyebrow")}
          </p>
          <h2 className="font-serif font-bold tracking-[-0.02em] text-foreground text-3xl sm:text-4xl md:text-5xl leading-tight">
            {t("featureMatrix.title")}
          </h2>
          <p className="text-base text-muted-foreground font-sans mt-4">
            {t("featureMatrix.subtitle")}
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-semibold text-foreground sticky left-0 bg-muted/50 min-w-[160px]">
                  {t("featureMatrix.featureCol")}
                </th>
                {tools.map((tool) => (
                  <th
                    key={tool.id}
                    className={`p-3 text-center font-semibold min-w-[80px] ${
                      tool.featured ? "text-primary" : "text-foreground"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded bg-background flex items-center justify-center overflow-hidden">
                        {tool.logoUrl ? (
                          <img
                            src={tool.logoUrl}
                            alt={tool.name}
                            className="w-4 h-4 object-contain"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-[9px] font-bold text-muted-foreground">${tool.name[0]}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-[9px] font-bold text-muted-foreground">{tool.name[0]}</span>
                        )}
                      </div>
                      <span className="text-[10px] leading-tight">{tool.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((feature, i) => (
                <tr
                  key={feature.id}
                  className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className={`p-3 font-medium text-foreground sticky left-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                    {feature.label}
                  </td>
                  {tools.map((tool) => {
                    const has = feature.tools.includes(tool.id);
                    return (
                      <td key={tool.id} className="p-3 text-center">
                        {has ? (
                          <Check className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            {/* Feature count footer */}
            <tfoot>
              <tr className="bg-muted/50 border-t border-border">
                <td className="p-3 font-bold text-foreground sticky left-0 bg-muted/50">
                  {t("featureMatrix.totalRow")}
                </td>
                {tools.map((tool) => {
                  const count = COMPARISON_FEATURES.filter((f) => f.tools.includes(tool.id)).length;
                  return (
                    <td key={tool.id} className="p-3 text-center font-bold text-foreground">
                      {count}/{COMPARISON_FEATURES.length}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
