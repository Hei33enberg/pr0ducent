import { useNavigate } from "react-router-dom";
import { PageFrame } from "@/components/PageFrame";
import AmbientBackground from "@/components/AmbientBackground";
import { Footer } from "@/components/Footer";
import { CheckCircle2, X, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Zap,
    prompts: "3 prompts / month",
    description: "Try the platform with zero commitment.",
    features: [
      { text: "1 builder per run", included: true },
      { text: "Basic comparison scores", included: true },
      { text: "Public experiment sharing", included: true },
      { text: "Delayed results", included: true },
      { text: "All builders", included: false },
      { text: "Full history export", included: false },
      { text: "API access", included: false },
    ],
    cta: "Start Free",
    variant: "outline" as const,
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    icon: Crown,
    prompts: "30 prompts / month",
    description: "For individual developers who ship fast.",
    features: [
      { text: "All builders per run", included: true },
      { text: "Full comparison scores", included: true },
      { text: "Public & private experiments", included: true },
      { text: "Instant results", included: true },
      { text: "Full build history", included: true },
      { text: "Priority queue", included: false },
      { text: "API access", included: false },
    ],
    cta: "Upgrade to Pro",
    variant: "default" as const,
    highlight: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/mo",
    icon: Building2,
    prompts: "100 prompts / month",
    description: "For teams and power users.",
    features: [
      { text: "All builders per run", included: true },
      { text: "Full comparison scores", included: true },
      { text: "Public & private experiments", included: true },
      { text: "Instant results", included: true },
      { text: "Full build history", included: true },
      { text: "Priority queue", included: true },
      { text: "API access", included: true },
    ],
    cta: "Upgrade to Business",
    variant: "outline" as const,
    highlight: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCta = (planName: string) => {
    if (planName === "Free") {
      navigate(user ? "/dashboard" : "/auth");
    } else {
      // Will be wired to Stripe checkout
      if (!user) {
        navigate(`/auth?next=/pricing`);
      } else {
        // TODO: Stripe checkout
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-sans max-w-xl mx-auto">
              Start free. Upgrade when you need more power. No hidden fees, no surprises.
            </p>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-6 md:p-8 flex flex-col transition-all ${
                    plan.highlight
                      ? "bg-foreground text-background ring-2 ring-foreground shadow-2xl scale-[1.02] md:scale-105"
                      : "glass-card border border-border/60"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] font-bold font-sans px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Icon className={`w-5 h-5 ${plan.highlight ? "text-background/70" : "text-muted-foreground"}`} />
                    <h3 className="text-lg font-bold font-sans">{plan.name}</h3>
                  </div>

                  <div className="mb-1">
                    <span className="text-4xl font-bold font-serif">{plan.price}</span>
                    <span className={`text-sm font-sans ${plan.highlight ? "text-background/60" : "text-muted-foreground"}`}>
                      {plan.period}
                    </span>
                  </div>

                  <p className={`text-xs font-sans mb-1 ${plan.highlight ? "text-background/80" : "text-accent"}`}>
                    {plan.prompts}
                  </p>

                  <p className={`text-sm font-sans mb-6 ${plan.highlight ? "text-background/60" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-2 text-sm font-sans">
                        {f.included ? (
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-background/70" : "text-accent"}`} />
                        ) : (
                          <X className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-background/30" : "text-muted-foreground/30"}`} />
                        )}
                        <span className={!f.included ? (plan.highlight ? "text-background/30" : "text-muted-foreground/40") : ""}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCta(plan.name)}
                    variant={plan.highlight ? "secondary" : plan.variant}
                    className={`w-full rounded-full font-sans font-semibold ${
                      plan.highlight ? "bg-background text-foreground hover:bg-background/90" : ""
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* FAQ teaser */}
          <div className="text-center mt-12 md:mt-16">
            <p className="text-sm text-muted-foreground font-sans">
              Questions? Check out our{" "}
              <a
                href="/#faq"
                onClick={(e) => { e.preventDefault(); navigate("/"); setTimeout(() => document.querySelector("#faq")?.scrollIntoView({ behavior: "smooth" }), 100); }}
                className="underline hover:text-foreground transition-colors"
              >
                FAQ
              </a>{" "}
              or reach out anytime.
            </p>
          </div>
        </div>

        <Footer />
      </PageFrame>
    </div>
  );
}
