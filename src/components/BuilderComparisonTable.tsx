import { useRef, useState } from "react";
import { BUILDER_TOOLS } from "@/config/tools";
import { COMPARISON_FEATURES } from "@/config/comparison-features";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface BuilderComparisonTableProps {
  onSelectTool: (toolId: string) => void;
}

export function BuilderComparisonTable({ onSelectTool }: BuilderComparisonTableProps) {
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2">
            All Builders at a Glance
          </h2>
          <p className="text-sm text-muted-foreground">
            Scroll horizontally to compare all {BUILDER_TOOLS.length} tools — or pick one and test it instantly.
          </p>
        </div>

        <div className="relative">
          {/* Fade hint right */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none rounded-r-xl" />

          <div
            ref={scrollRef}
            className="overflow-x-auto rounded-xl border border-border bg-card shadow-lg scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          >
            <table className="w-max min-w-full text-sm border-collapse">
              {/* Header */}
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-30 bg-card p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px] border-r border-border/50">
                    Feature
                  </th>
                  {BUILDER_TOOLS.map((tool) => (
                    <th
                      key={tool.id}
                      className={`p-4 text-center min-w-[140px] transition-colors duration-150 ${
                        hoveredCol === tool.id ? "bg-primary/5" : ""
                      }`}
                      onMouseEnter={() => setHoveredCol(tool.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        {tool.logoUrl ? (
                          <img
                            src={tool.logoUrl}
                            alt={tool.name}
                            className="w-6 h-6 rounded object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {tool.name[0]}
                          </div>
                        )}
                        <span className="font-semibold text-foreground text-xs">{tool.name}</span>
                        {tool.featured && (
                          <Badge className="text-[8px] px-1.5 py-0 bg-featured text-featured-foreground border-0">
                            ★ Partner
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">{tool.category}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Description */}
                <Row label="Description" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol}>
                  {BUILDER_TOOLS.map((tool) => (
                    <td
                      key={tool.id}
                      className={cellClass(hoveredCol, tool.id)}
                      onMouseEnter={() => setHoveredCol(tool.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <span className="text-xs text-muted-foreground leading-tight">{tool.description}</span>
                    </td>
                  ))}
                </Row>

                {/* Stack */}
                <Row label="Tech Stack" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol} alt>
                  {BUILDER_TOOLS.map((tool) => (
                    <td
                      key={tool.id}
                      className={cellClass(hoveredCol, tool.id, true)}
                      onMouseEnter={() => setHoveredCol(tool.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <span className="text-xs font-mono text-foreground">{tool.stack}</span>
                    </td>
                  ))}
                </Row>

                {/* Hosting */}
                <Row label="Hosting" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol}>
                  {BUILDER_TOOLS.map((tool) => (
                    <td
                      key={tool.id}
                      className={cellClass(hoveredCol, tool.id)}
                      onMouseEnter={() => setHoveredCol(tool.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <span className="text-xs text-foreground">{tool.hosting}</span>
                    </td>
                  ))}
                </Row>

                {/* Pricing */}
                <Row label="Pricing" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol} alt>
                  {BUILDER_TOOLS.map((tool) => (
                    <td
                      key={tool.id}
                      className={cellClass(hoveredCol, tool.id, true)}
                      onMouseEnter={() => setHoveredCol(tool.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <span className="text-xs font-medium text-foreground">{tool.pricing}</span>
                    </td>
                  ))}
                </Row>

                {/* Feature checkmarks */}
                {COMPARISON_FEATURES.map((feature, idx) => (
                  <Row
                    key={feature.id}
                    label={feature.label}
                    hoveredCol={hoveredCol}
                    setHoveredCol={setHoveredCol}
                    alt={idx % 2 === 0}
                  >
                    {BUILDER_TOOLS.map((tool) => (
                      <td
                        key={tool.id}
                        className={cellClass(hoveredCol, tool.id, idx % 2 === 0)}
                        onMouseEnter={() => setHoveredCol(tool.id)}
                        onMouseLeave={() => setHoveredCol(null)}
                      >
                        {feature.tools.includes(tool.id) ? (
                          <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground/20 mx-auto" />
                        )}
                      </td>
                    ))}
                  </Row>
                ))}

                {/* Strengths */}
                <Row label="Key Strengths" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol}>
                  {BUILDER_TOOLS.map((tool) => (
                    <td
                      key={tool.id}
                      className={cellClass(hoveredCol, tool.id)}
                      onMouseEnter={() => setHoveredCol(tool.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <div className="flex flex-wrap justify-center gap-1">
                        {tool.strengths.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  ))}
                </Row>

                {/* Avg build time */}
                <Row label="Avg Build Time" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol} alt>
                  {BUILDER_TOOLS.map((tool) => (
                    <td
                      key={tool.id}
                      className={cellClass(hoveredCol, tool.id, true)}
                      onMouseEnter={() => setHoveredCol(tool.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <span className="text-xs text-foreground font-medium">
                        {tool.mockDelayRange[0]}–{tool.mockDelayRange[1]}s
                      </span>
                    </td>
                  ))}
                </Row>

                {/* CTA */}
                <tr className="border-t border-border">
                  <td className="sticky left-0 z-10 bg-card p-4 border-r border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Action</span>
                  </td>
                  {BUILDER_TOOLS.map((tool) => (
                    <td
                      key={tool.id}
                      className={`p-3 text-center transition-colors duration-150 ${
                        hoveredCol === tool.id ? "bg-primary/5" : ""
                      }`}
                      onMouseEnter={() => setHoveredCol(tool.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <Button
                        size="sm"
                        variant={tool.featured ? "default" : "outline"}
                        className="text-[11px] h-7 px-3 rounded-lg"
                        onClick={() => onSelectTool(tool.id)}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Test
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function cellClass(hoveredCol: string | null, toolId: string, alt = false) {
  return `p-3 text-center transition-colors duration-150 ${
    hoveredCol === toolId ? "bg-primary/5" : alt ? "bg-muted/20" : ""
  }`;
}

function Row({
  label,
  children,
  hoveredCol,
  setHoveredCol,
  alt = false,
}: {
  label: string;
  children: React.ReactNode;
  hoveredCol: string | null;
  setHoveredCol: (id: string | null) => void;
  alt?: boolean;
}) {
  return (
    <tr className="border-b border-border/50">
      <td
        className={`sticky left-0 z-10 p-3 text-xs font-medium text-foreground border-r border-border/50 ${
          alt ? "bg-muted/20" : "bg-card"
        }`}
      >
        {label}
      </td>
      {children}
    </tr>
  );
}
