import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ToolSelectionGrid } from "@/components/ToolSelectionGrid";
import { PROMPT_TEMPLATES, DEMO_TEMPLATE } from "@/config/prompt-templates";
import { USE_CASE_TAGS } from "@/config/use-case-tags";
import type { AccountModel } from "@/types/experiment";
import { Zap, Sparkles, BarChart3, Shield } from "lucide-react";
import caricatureFounder from "@/assets/caricature-founder-nobg.png";

interface HeroSectionProps {
  onSubmit: (prompt: string, selectedTools: string[], accountModel: AccountModel, useCaseTags?: string[]) => void;
  selectedTools: string[];
  onSelectedToolsChange: (tools: string[]) => void;
  heroRef?: React.RefObject<HTMLDivElement | null>;
}

export function HeroSection({ onSubmit, selectedTools, onSelectedToolsChange, heroRef }: HeroSectionProps) {
  const [prompt, setPrompt] = useState("");
  const [accountModel, setAccountModel] = useState<AccountModel>("broker");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!prompt.trim() || selectedTools.length === 0) return;
    onSubmit(prompt.trim(), selectedTools, accountModel, selectedTags.length > 0 ? selectedTags : undefined);
  };

  const handleTemplateClick = (template: typeof PROMPT_TEMPLATES[0]) => {
    setPrompt(template.prompt);
    setSelectedTags(template.tags);
    setIsExpanded(true);
  };

  const handleDemo = () => {
    const demo = DEMO_TEMPLATE;
    setPrompt(demo.prompt);
    setSelectedTags(demo.tags);
    onSubmit(demo.prompt, selectedTools, accountModel, demo.tags);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  return (
    <section ref={heroRef} className="section-divider relative" style={{ minHeight: "calc(80svh - 4rem)" }}>
      {/* Animated gradient washes */}
      <div className="absolute pointer-events-none hero-wash hero-wash--peach" aria-hidden="true" />
      <div className="absolute pointer-events-none hero-wash hero-wash--rose" aria-hidden="true" />
      <div className="absolute pointer-events-none hero-wash hero-wash--gold" aria-hidden="true" />

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20">
        {/* Hero grid — copy + caricature */}
        <div className="mx-auto max-w-5xl grid grid-cols-[1fr_auto] md:grid-cols-[1fr_1fr] gap-4 md:gap-8 items-center mb-10">
          {/* Left — copy */}
          <div className="space-y-4 md:space-y-6 text-left">
            <h1
              className="font-serif leading-[0.92] tracking-[-0.02em] fade-up visible-immediate"
              style={{ fontSize: "clamp(2.2rem, 5vw + 0.8rem, 7rem)", color: "#000" }}
            >
              One prompt.
              <br />
              Many
              <br />
              <span className="text-accent-gradient">builders.</span>
            </h1>
            <p className="font-sans text-sm sm:text-base md:text-xl text-muted-foreground max-w-lg leading-relaxed fade-up stagger-1 visible-immediate">
              Run your idea through multiple AI app builders in parallel and see real prototypes side by side.
            </p>
          </div>

          {/* Right — caricature */}
          <div className="flex items-center justify-end fade-up stagger-1 visible-immediate">
            <img
              src={caricatureFounder}
              alt="pr0ducent founder caricature"
              className="w-[100px] sm:w-[140px] md:w-[220px] lg:w-[280px] object-contain select-none"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Prompt templates */}
          <div className="flex flex-wrap justify-center gap-2 mb-5 fade-up stagger-1 visible-immediate">
            {PROMPT_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleTemplateClick(tpl)}
                className="glass-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-foreground font-sans"
              >
                <span>{tpl.emoji}</span>
                <span>{tpl.label}</span>
              </button>
            ))}
          </div>

          {/* Prompt input */}
          <div className="space-y-4 fade-up stagger-2 visible-immediate">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your app idea… e.g. 'Build a project management tool with Kanban boards, team chat, and Stripe billing'"
                className="min-h-[120px] text-base bg-card/80 backdrop-blur-sm shadow-lg border-border/50 resize-none rounded-xl p-5 focus-visible:ring-accent/30 font-sans"
                onFocus={() => setIsExpanded(true)}
              />
            </div>

            {/* Config panel */}
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
            >
              <div className="glass-card rounded-xl p-5 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 font-sans">Use Case (optional)</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {USE_CASE_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all border font-sans ${
                          selectedTags.includes(tag.id)
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border bg-background text-muted-foreground hover:border-accent/30"
                        }`}
                      >
                        <span>{tag.emoji}</span>
                        <span>{tag.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <ToolSelectionGrid
                  selectedTools={selectedTools}
                  onSelectionChange={onSelectedToolsChange}
                  accountModel={accountModel}
                  onAccountModelChange={setAccountModel}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || selectedTools.length === 0}
                className="bg-foreground text-background px-8 py-3.5 text-sm font-semibold rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 font-sans"
              >
                <Zap className="w-4 h-4" />
                Run Multi-Builder Test
                {selectedTools.length > 0 && (
                  <span className="bg-background/20 px-2 py-0.5 rounded-md text-xs">
                    {selectedTools.length} tool{selectedTools.length !== 1 && "s"}
                  </span>
                )}
              </button>
              <button
                onClick={handleDemo}
                className="glass-card px-6 py-3 text-sm rounded-full inline-flex items-center gap-2 font-sans font-medium hover:scale-[1.02] transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" />
                Try Demo Prompt
              </button>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-sans fade-up stagger-3 visible-immediate">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Real prototypes, not mockups</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Objective side-by-side comparison</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>We earn via referrals — you keep control</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
