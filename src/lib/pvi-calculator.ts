/**
 * @module PVI Marketing Calculator — plan comparison (Calculator, Compare, InlineCalculator)
 * pr0ducent Value Index (PVI) Calculator
 * Normalized 0-100 score per builder plan
 */

// AI model quality weights
const MODEL_SCORES: Record<string, number> = {
  "gpt-5": 100,
  "gpt-4o": 90,
  "gpt-4": 85,
  "claude-4": 95,
  "claude-3.5-sonnet": 88,
  "claude-3-opus": 92,
  "gemini-2.5-pro": 88,
  "gemini-2.5-flash": 80,
  "gemini-pro": 75,
  "codestral": 70,
  "deepseek-v3": 72,
  "llama-3": 65,
};

// Feature presence scoring
const ECOSYSTEM_FEATURES = [
  "git", "one-click-deploy", "collaboration", "backend",
  "in-browser", "design-systems", "api-integration", "mobile-first",
] as const;

export interface PVIPlan {
  tool_id: string;
  plan_name: string;
  monthly_price: number;
  credits_included: number;
  credit_unit: string;
  ai_models: string[];
  features: string[];
  dev_environment: string;
}

export interface PVIWeights {
  costEfficiency: number;
  features: number;
  modelQuality: number;
  ecosystem: number;
}

const DEFAULT_WEIGHTS: PVIWeights = {
  costEfficiency: 0.35,
  features: 0.25,
  modelQuality: 0.25,
  ecosystem: 0.15,
};

export function calculatePVI(plan: PVIPlan, weights: PVIWeights = DEFAULT_WEIGHTS): number {
  // 1. Cost efficiency (credits per dollar, normalized 0-100)
  const price = plan.monthly_price || 0.01; // avoid div by zero
  const credits = plan.credits_included || 0;
  const creditsPerDollar = credits / price;
  // Normalize: 0 cred/$ = 0, 100 cred/$ = 100 (capped)
  const costScore = Math.min(creditsPerDollar * 2, 100);

  // 2. Features score (count of features / max possible)
  const featuresScore = plan.features.length > 0
    ? Math.min((plan.features.length / 15) * 100, 100)
    : 0;

  // 3. Model quality (best model score)
  const modelScores = plan.ai_models.map((m) => {
    const key = m.toLowerCase().replace(/\s+/g, "-");
    for (const [modelKey, score] of Object.entries(MODEL_SCORES)) {
      if (key.includes(modelKey)) return score;
    }
    return 50; // unknown model baseline
  });
  const modelQuality = modelScores.length > 0 ? Math.max(...modelScores) : 30;

  // 4. Ecosystem score
  const ecosystemHits = ECOSYSTEM_FEATURES.filter((f) =>
    plan.features.some((pf) => pf.toLowerCase().includes(f.replace("-", " ").replace("_", " ")))
  ).length;
  const ecosystemScore = (ecosystemHits / ECOSYSTEM_FEATURES.length) * 100;

  // Weighted sum
  const raw =
    weights.costEfficiency * costScore +
    weights.features * featuresScore +
    weights.modelQuality * modelQuality +
    weights.ecosystem * ecosystemScore;

  return Math.round(Math.min(raw, 100));
}

export function getPVILabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-green-600" };
  if (score >= 60) return { label: "Good", color: "text-blue-600" };
  if (score >= 40) return { label: "Fair", color: "text-yellow-600" };
  return { label: "Basic", color: "text-muted-foreground" };
}
