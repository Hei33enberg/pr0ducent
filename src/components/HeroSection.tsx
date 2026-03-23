import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ToolSelectionGrid } from "@/components/ToolSelectionGrid";
import { PROMPT_TEMPLATES } from "@/config/prompt-templates";
import type { AccountModel } from "@/types/experiment";
import { Zap, BarChart3, Shield, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import caricatureFounder from "@/assets/caricature-founder-nobg.png";

interface HeroSectionProps {
  onSubmit: (prompt: string, selectedTools: string[], accountModel: AccountModel, useCaseTags?: string[]) => void;
  selectedTools: string[];
  onSelectedToolsChange: (tools: string[]) => void;
  heroRef?: React.RefObject<HTMLDivElement | null>;
}

export function HeroSection({ onSubmit, selectedTools, onSelectedToolsChange, heroRef }: HeroSectionProps) {
  const [prompt, setPrompt] = useState("");
  const [accountModel] = useState<AccountModel>("broker");
  const [showBuilders, setShowBuilders] = useState(false);
  const [showMoreTemplates, setShowMoreTemplates] = useState(false);

  const handleSubmit = () => {
    if (!prompt.trim() || selectedTools.length === 0) return;
    onSubmit(prompt.trim(), selectedTools, accountModel);
  };

  const handleTemplateClick = (template: typeof PROMPT_TEMPLATES[0]) => {
    setPrompt(template.prompt);
    setShowBuilders(true);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (e.target.value.trim().length > 0 && !showBuilders) {
      setShowBuilders(true);
    }
  };

  const visibleTemplates = showMoreTemplates ? PROMPT_TEMPLATES : PROMPT_TEMPLATES.slice(0, 7);

  return (
    <section ref={heroRef} className="section-divider relative" style={{ minHeight: "auto" }}>
      {/* Animated gradient washes */}
      <div className="absolute pointer-events-none hero-wash hero-wash--peach" aria-hidden="true" />
      <div className="absolute pointer-events-none hero-wash hero-wash--rose" aria-hidden="true" />
      <div className="absolute pointer-events-none hero-wash hero-wash--gold" aria-hidden="true" />

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20">
        {/* Hero grid — copy + caricature */}
        <div className="mx-auto max-w-6xl lg:max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-14 items-end mb-10 md:mb-14">
          {/* Left — copy */}
          <div className="space-y-4 md:space-y-6 text-left">
            <h1
              className="font-serif leading-[0.92] tracking-[-0.02em] text-foreground fade-up visible-immediate"
              style={{ fontSize: "clamp(2.2rem, 5vw + 0.8rem, 7rem)" }}
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

          {/* Right — caricature (transparent PNG, large, no frame — murd0ch-style hero) */}
          <div className="flex items-end justify-center md:justify-end fade-up stagger-1 visible-immediate">
            <img
              src={caricatureFounder}
              alt="pr0ducent founder caricature"
              className="illust-float w-[min(92vw,380px)] sm:w-[min(90vw,440px)] md:w-full md:max-w-[min(100%,520px)] lg:max-w-[min(100%,600px)] xl:max-w-[min(100%,680px)] h-auto max-h-[min(78vh,720px)] object-contain object-bottom select-none pointer-events-none"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Prompt templates — chips above input */}
          <div className="flex flex-wrap justify-center gap-2 mb-5 fade-up stagger-1 visible-immediate">
            {visibleTemplates.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateClick(tpl)}
                  className="bg-card border border-border/50 shadow-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-foreground font-sans"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tpl.label}</span>
                </button>
              );
            })}
            {!showMoreTemplates && (
              <button
                onClick={() => setShowMoreTemplates(true)}
                className="bg-card border border-border/50 shadow-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground font-sans hover:text-foreground transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>+{PROMPT_TEMPLATES.length - 7} more</span>
              </button>
            )}
          </div>

          {/* Prompt input */}
          <div className="space-y-4 fade-up stagger-2 visible-immediate">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Describe your app idea… e.g. 'Build a project management tool with Kanban boards, team chat, and Stripe billing'"
                className="min-h-[120px] text-base bg-card shadow-xl border-2 border-foreground/25 resize-none rounded-xl p-5 focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:border-foreground/40 font-sans"
              />
            </div>

            {/* Builder selection — shown only after interaction */}
            <AnimatePresence>
              {showBuilders && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                    <ToolSelectionGrid
                      selectedTools={selectedTools}
                      onSelectionChange={onSelectedToolsChange}
                    />
                  </div>

                  <div className="flex items-center justify-center mt-4">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
