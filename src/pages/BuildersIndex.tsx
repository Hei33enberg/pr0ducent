import { useNavigate } from "react-router-dom";
import { PageFrame } from "@/components/PageFrame";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Footer } from "@/components/Footer";
import AmbientBackground from "@/components/AmbientBackground";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default function BuildersIndex() {
  const { tools } = useBuilderCatalog();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner">
          <PageBreadcrumb crumbs={[{ label: "All Builders" }]} />
          <div className="text-center mb-8">
            <h1
              className="font-serif font-bold tracking-[-0.02em] mb-2"
              style={{ fontSize: "clamp(2.2rem, 4vw + 0.8rem, 4.5rem)" }}
            >
              All AI Builders
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Explore {tools.length} AI app builders — in-depth profiles, pricing, and features.
            </p>
          </div>

          <div className="section-wash-indigo rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map((tool) => (
              <Card
                key={tool.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/builders/${tool.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {tool.logoUrl ? (
                      <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6 object-contain" loading="lazy" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{tool.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold font-sans">{tool.name}</h2>
                      {tool.featured && <Badge className="text-[8px] px-1 py-0 bg-primary/10 text-primary border-primary/20">Partner</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-sans truncate">{tool.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </PageFrame>
    </div>
  );
}
