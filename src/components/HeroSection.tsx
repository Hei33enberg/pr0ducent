import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ToolSelectionGrid } from "@/components/ToolSelectionGrid";
import { BUILDER_TOOLS } from "@/config/tools";
import { PROMPT_TEMPLATES, DEMO_TEMPLATE } from "@/config/prompt-templates";
import { USE_CASE_TAGS } from "@/config/use-case-tags";
import type { AccountModel } from "@/types/experiment";
import { Zap, Shield, BarChart3, Sparkles } from "lucide-react";

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
    <section ref={heroRef} className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-12">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1] mb-4">
            One prompt.{" "}
            <span className="bg-gradient-to-r from-primary to-featured bg-clip-text text-transparent">
              Many builders.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Run your idea through multiple AI app builders in parallel and see real prototypes side by side.
          </p>
        </motion.div>

        {/* Prompt templates */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-5"
        >
          {PROMPT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleTemplateClick(tpl)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all text-xs font-medium text-foreground shadow-sm"
            >
              <span>{tpl.emoji}</span>
              <span>{tpl.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Prompt input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-4"
        >
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your app idea… e.g. 'Build a project management tool with Kanban boards, team chat, and Stripe billing'"
              className="min-h-[120px] text-base bg-card shadow-lg border-border/50 resize-none rounded-xl p-5 focus-visible:ring-primary/30"
              onFocus={() => setIsExpanded(true)}
            />
          </div>

          {/* Config panel */}
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl border border-border/50 shadow-lg p-5 space-y-5">
              {/* Use-case tags */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Use Case (optional)</h3>
                <div className="flex flex-wrap gap-1.5">
                  {USE_CASE_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                        selectedTags.includes(tag.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
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
                onSelectionChange={setSelectedTools}
                accountModel={accountModel}
                onAccountModelChange={setAccountModel}
              />
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!prompt.trim() || selectedTools.length === 0}
              className="h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl"
            >
              <Zap className="w-5 h-5 mr-2" />
              Run Multi-Builder Test
              {selectedTools.length > 0 && (
                <span className="ml-2 bg-primary-foreground/20 px-2 py-0.5 rounded-md text-sm">
                  {selectedTools.length} tool{selectedTools.length !== 1 && "s"}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleDemo}
              className="h-12 px-6 text-sm rounded-xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try Demo Prompt
            </Button>
          </div>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
        >
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
        </motion.div>
      </div>
    </section>
  );
}
