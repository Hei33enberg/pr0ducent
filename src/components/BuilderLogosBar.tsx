import { BUILDER_TOOLS } from "@/config/tools";

const TOP_BUILDERS = BUILDER_TOOLS.filter((t) =>
  ["lovable", "v0", "bolt", "cursor", "replit"].includes(t.id)
);

export function BuilderLogosBar() {
  return (
    <section className="py-10 md:py-14 section-divider">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-6">
          Supported builders
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {TOP_BUILDERS.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold font-sans">
                {tool.name[0]}
              </div>
              <span className="text-sm font-medium font-sans">{tool.name}</span>
            </div>
          ))}
          <span className="text-xs text-muted-foreground/40 font-sans">+{BUILDER_TOOLS.length - TOP_BUILDERS.length} more</span>
        </div>
      </div>
    </section>
  );
}
