import { BUILDER_TOOLS } from "@/config/tools";
import { COMPARISON_FEATURES } from "@/config/comparison-features";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Beaker, Zap, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

const TOP_TOOLS = BUILDER_TOOLS.filter((t) =>
  ["lovable", "replit", "v0", "cursor", "bolt"].includes(t.id)
);

export default function Compare() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Beaker className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground tracking-tight">PromptLab</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-3">
            AI App Builder Comparison 2025
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lovable vs Replit vs Vercel v0 vs Cursor vs Bolt — porównanie najlepszych AI app builderów.
            Sprawdź, który najlepiej pasuje do Twojego projektu.
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-x-auto mb-12"
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Feature</th>
                {TOP_TOOLS.map((tool) => (
                  <th key={tool.id} className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-foreground">{tool.name}</span>
                      {tool.featured && (
                        <Badge className="text-[9px] bg-featured text-featured-foreground border-0">★ Partner</Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="p-3 text-muted-foreground font-medium">Stack</td>
                {TOP_TOOLS.map((tool) => (
                  <td key={tool.id} className="p-3 text-center text-xs text-foreground">{tool.stack}</td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 text-muted-foreground font-medium">Hosting</td>
                {TOP_TOOLS.map((tool) => (
                  <td key={tool.id} className="p-3 text-center text-xs text-foreground">{tool.hosting}</td>
                ))}
              </tr>
              {COMPARISON_FEATURES.map((feature) => (
                <tr key={feature.label} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-foreground">{feature.label}</td>
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
                <td className="p-3 text-muted-foreground font-medium">Key strengths</td>
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h2 className="text-xl font-bold text-foreground">Nie ufaj tabelkom — przetestuj sam!</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Wpisz swój prompt i porównaj wyniki w realnych prototypach, nie na papierze.
          </p>
          <Button size="lg" onClick={() => navigate("/")} className="rounded-xl shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 mr-2" />
            Uruchom porównanie
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </main>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "AI App Builder Comparison — Lovable vs Replit vs v0 vs Cursor vs Bolt",
            description:
              "Compare the best AI app builders side by side. Test Lovable, Replit, Vercel v0, Cursor, and Bolt with one prompt.",
            url: `${window.location.origin}/compare`,
          }),
        }}
      />
    </div>
  );
}
