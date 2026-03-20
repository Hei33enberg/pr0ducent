import { useNavigate } from "react-router-dom";
import { PageFrame } from "@/components/PageFrame";
import AmbientBackground from "@/components/AmbientBackground";
import { BUILDER_TOOLS } from "@/config/tools";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default function BuildersIndex() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-2">
              All AI Builders
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Explore {BUILDER_TOOLS.length} AI app builders — in-depth profiles, pricing, and features.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BUILDER_TOOLS.map((tool) => (
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
                      <span className="text-sm font-bold font-sans">{tool.name}</span>
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
      </PageFrame>
    </div>
  );
}
