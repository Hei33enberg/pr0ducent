import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { COMPARISON_FEATURES } from "@/config/comparison-features";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Zap, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { PageFrame } from "@/components/PageFrame";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";

const TOP_IDS = ["lovable", "replit", "v0", "cursor", "bolt"];

export default function Compare() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tools } = useBuilderCatalog();
  const TOP_TOOLS = tools.filter((tool) => TOP_IDS.includes(tool.id));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner">
          <PageBreadcrumb crumbs={[{ label: "Compare" }]} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-3">
              {t("compare.title")}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto font-sans">
              {t("compare.subtitle")}
            </p>
          </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-x-auto mb-12"
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium font-sans">Feature</th>
                {TOP_TOOLS.map((tool) => (
                  <th key={tool.id} className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-foreground font-sans">{tool.name}</span>
                      {tool.featured && (
                        <Badge className="text-[9px] bg-featured text-featured-foreground border-0">★ Partner</Badge>
                      )}
                      {tool.integrationEnabled && (
                        <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-700 dark:text-emerald-400">
                          POP live
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="p-3 text-muted-foreground font-medium font-sans">Stack</td>
                {TOP_TOOLS.map((tool) => (
                  <td key={tool.id} className="p-3 text-center text-xs text-foreground font-sans">{tool.stack}</td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 text-muted-foreground font-medium font-sans">Hosting</td>
                {TOP_TOOLS.map((tool) => (
                  <td key={tool.id} className="p-3 text-center text-xs text-foreground font-sans">{tool.hosting}</td>
                ))}
              </tr>
              {COMPARISON_FEATURES.map((feature) => (
                <tr key={feature.label} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-foreground font-sans">{feature.label}</td>
                  {TOP_TOOLS.map((tool) => (
                    <td key={tool.id} className="p-3 text-center">
                      {feature.tools.includes(tool.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-border/50">
                <td className="p-3 text-muted-foreground font-medium font-sans">Key strengths</td>
                {TOP_TOOLS.map((tool) => (
                  <td key={tool.id} className="p-3">
                    <div className="flex flex-wrap justify-center gap-1">
                      {tool.strengths.slice(0, 2).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground max-w-xl mx-auto mb-8 font-sans">
          {t("help.comparePageNote")}
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h2 className="text-xl font-serif font-bold text-foreground">{t("compare.ctaTitle")}</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto font-sans">
            {t("compare.ctaSubtitle")}
          </p>
          <Button size="lg" onClick={() => navigate("/")} className="rounded-xl shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 mr-2" />
            {t("compare.runComparison")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "AI App Builder Comparison — Lovable vs Replit vs v0 vs Cursor vs Bolt",
            description: "Compare AI app builders side by side with live v0 runs and benchmark profiles for Lovable, Replit, Cursor, and Bolt.",
            url: `${window.location.origin}/compare`,
          }),
        }}
      />
    </div>
  );
}
