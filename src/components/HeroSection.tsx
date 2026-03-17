import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolSelectionGrid } from "@/components/ToolSelectionGrid";
import { BUILDER_TOOLS } from "@/config/tools";
import type { AccountModel } from "@/types/experiment";
import { Zap, Shield, BarChart3 } from "lucide-react";

interface HeroSectionProps {
  onSubmit: (prompt: string, selectedTools: string[], accountModel: AccountModel) => void;
}

export function HeroSection({ onSubmit }: HeroSectionProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>(
    BUILDER_TOOLS.filter((t) => t.featured).map((t) => t.id)
  );
  const [accountModel, setAccountModel] = useState<AccountModel>("broker");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (!prompt.trim() || selectedTools.length === 0) return;
    onSubmit(prompt.trim(), selectedTools, accountModel);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
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
            <div className="bg-card rounded-xl border border-border/50 shadow-lg p-5">
              <ToolSelectionGrid
                selectedTools={selectedTools}
                onSelectionChange={setSelectedTools}
                accountModel={accountModel}
                onAccountModelChange={setAccountModel}
              />
            </div>
          </motion.div>

          <div className="flex justify-center">
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
