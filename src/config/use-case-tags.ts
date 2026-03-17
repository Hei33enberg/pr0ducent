export interface UseCaseTag {
  id: string;
  label: string;
  emoji: string;
}

export const USE_CASE_TAGS: UseCaseTag[] = [
  { id: "e-commerce", label: "E-commerce", emoji: "🛒" },
  { id: "saas", label: "SaaS", emoji: "📊" },
  { id: "portfolio", label: "Portfolio", emoji: "🎨" },
  { id: "internal-tool", label: "Internal Tool", emoji: "🔧" },
  { id: "marketplace", label: "Marketplace", emoji: "🏪" },
  { id: "mobile", label: "Mobile App", emoji: "📱" },
  { id: "social", label: "Social", emoji: "💬" },
  { id: "other", label: "Other", emoji: "✨" },
];
