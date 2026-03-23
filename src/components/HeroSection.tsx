import { copy } from "@/lib/copy";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToolSelectionGrid } from "@/components/ToolSelectionGrid";
import { HERO_PROMPT_CHIPS, HERO_PROMPT_EXTRAS, type PromptTemplate } from "@/config/prompt-templates";
import type { AccountModel } from "@/types/experiment";
import { Zap, BarChart3, Shield, ChevronDown, List } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import caricatureFounder from "@/assets/caricature-founder-nobg.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeroSectionProps {
  onSubmit: (prompt: string, selectedTools: string[], accountModel: AccountModel, useCaseTags?: string[]) => void;
  selectedTools: string[];
  onSelectedToolsChange: (tools: string[]) => void;
  heroRef?: React.RefObject<HTMLDivElement | null>;
}

export function HeroSection({ onSubmit, selectedTools, onSelectedToolsChange, heroRef }: HeroSectionProps) {
  const [prompt, setPrompt] = useState("");
  const [accountModel] = useState<AccountModel>("broker");
  const [showBuilders, setShowBuilders] = useState(true);

  const handleSubmit = () => {
    if (!prompt.trim() || selectedTools.length === 0) return;
    onSubmit(prompt.trim(), selectedTools, accountModel);
  };

  const handleTemplateClick = (template: PromptTemplate) => {
    setPrompt(template.prompt);
    setShowBuilders(true);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (e.target.value.trim().length > 0 && !showBuilders) {
      setShowBuilders(true);
    }
  };

  const chipRow = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 fade-up visible-immediate">
      {HERO_PROMPT_CHIPS.map((tpl) => {
        const Icon = tpl.icon;
        return (
          <button
            key={tpl.id}
            type="button"
            onClick={() => handleTemplateClick(tpl)}
            className="bg-card border border-border/50 shadow-sm inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] md:text-xs font-medium text-foreground font-sans hover:border-foreground/25 transition-colors"
          >
            <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span className="whitespace-nowrap">{tpl.label}</span>
          </button>
        );
      })}
      {HERO_PROMPT_EXTRAS.length > 0 ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-auto rounded-full border-border/50 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] md:text-xs font-medium font-sans gap-1 shadow-sm shrink-0"
            >
              <List className="w-3 h-3 shrink-0" />
              {copy["hero.morePrompts"]}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            sideOffset={8}
            avoidCollisions={false}
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="hero-more-prompts-menu max-h-[min(42vh,232px)] w-[min(calc(100vw-2rem),18rem)] overflow-y-auto overscroll-contain p-1.5 shadow-lg z-[600] border-border/80 bg-popover"
          >
            {HERO_PROMPT_EXTRAS.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <DropdownMenuItem
                  key={tpl.id}
                  className="cursor-pointer gap-2 py-2 text-[13px]"
                  onSelect={() => handleTemplateClick(tpl)}
                >
                  <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{tpl.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );

  const promptBlock = (
    <div className="space-y-2.5 sm:space-y-3 fade-up stagger-2 visible-immediate">
      <div className="relative w-full">
        <Textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder={copy["hero.promptPlaceholder"]}
          className="min-h-[88px] sm:min-h-[100px] md:min-h-[110px] w-full text-sm sm:text-base bg-card shadow-lg border-2 border-foreground/25 resize-y rounded-lg sm:rounded-xl p-3 sm:p-4 focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:border-foreground/40 font-sans"
        />
      </div>

      <AnimatePresence>
        {showBuilders && (
          <motion.div
            initial={false}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border/50 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
              <ToolSelectionGrid
                compact
                selectedTools={selectedTools}
                onSelectionChange={onSelectedToolsChange}
              />
            </div>

            <div className="flex items-center justify-center mt-3 sm:mt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!prompt.trim() || selectedTools.length === 0}
                className="bg-foreground text-background px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 font-sans"
              >
                <Zap className="w-4 h-4" />
                {copy["hero.runTest"]}
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
  );

  const caricature = (
    <div className="flex items-end justify-center sm:justify-end w-full max-sm:max-w-[min(96vw,420px)] mx-auto sm:mx-0 fade-up stagger-1 visible-immediate">
      <img
        src={caricatureFounder}
        alt="pr0ducent founder caricature"
        className="w-full max-w-[min(96vw,420px)] sm:max-w-[min(100%,400px)] md:max-w-[min(100%,460px)] lg:max-w-[min(100%,500px)] xl:max-w-[min(100%,540px)] h-auto max-h-[min(48vh,420px)] sm:max-h-[min(52vh,480px)] md:max-h-[min(58vh,540px)] lg:max-h-[min(62vh,600px)] object-contain object-bottom select-none pointer-events-none"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );

  return (
    <section
      ref={heroRef}
      className="section-divider relative scroll-mt-[calc(5.5rem+env(safe-area-inset-top))] md:scroll-mt-[calc(6rem+env(safe-area-inset-top))]"
      style={{ minHeight: "auto" }}
    >
      <div className="absolute pointer-events-none hero-wash hero-wash--peach" aria-hidden="true" />
      <div className="absolute pointer-events-none hero-wash hero-wash--rose" aria-hidden="true" />
      <div className="absolute pointer-events-none hero-wash hero-wash--gold" aria-hidden="true" />

      {/* Extra top padding so the hero H1 clears the sticky header visually (page-frame pt-* only reserves space). */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 pt-8 sm:pt-10 md:pt-12 pb-4 sm:pb-6 md:pb-8 lg:pb-10">
        {/*
          Layout:
          - md+: row1 = headline+subtitle | illustration; row2 = chips+dropdown (full); row3 = input+builders (full)
          - mobile: headline → illustration → chips → input+builders (order-1..4)
        */}
        <div className="mx-auto max-w-6xl lg:max-w-7xl grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 lg:gap-x-12 gap-y-5 sm:gap-y-6 sm:items-start">
          <div className="order-1 sm:col-start-1 sm:row-start-1 space-y-3 sm:space-y-5 text-left min-w-0 self-start">
            <h1
              className="font-serif leading-[0.9] tracking-[-0.02em] text-foreground fade-up visible-immediate"
              style={{ fontSize: "clamp(2.65rem, 5.5vw + 0.95rem, 5.85rem)" }}
            >
              {copy["hero.title1"]}
              <br />
              {copy["hero.title2"]}
              <br />
              <span className="text-accent-gradient">{copy["hero.title3"]}</span>
            </h1>
            <p className="font-sans text-sm sm:text-base md:text-xl text-muted-foreground max-w-[44ch] leading-relaxed fade-up stagger-1 visible-immediate">
              {copy["hero.subtitle"]}
            </p>
          </div>

          <div className="order-2 sm:col-start-2 sm:row-start-1 min-w-0 flex flex-col justify-end items-center sm:items-end pt-2 sm:pt-0 self-end">
            {caricature}
          </div>

          <div className="order-3 sm:col-span-2 space-y-2.5 w-full min-w-0 pt-1 sm:pt-0">
            {chipRow}
          </div>

          <div className="order-4 sm:col-span-2 w-full min-w-0 max-w-4xl sm:max-w-none">
            {promptBlock}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-5 sm:mt-6 md:mt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-sans fade-up stagger-3 visible-immediate">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>{copy["hero.trustReal"]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{copy["hero.trustObjective"]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>{copy["hero.trustReferrals"]}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
