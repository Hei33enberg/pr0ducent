import { ShoppingCart, BarChart3, Palette, Wrench, Store, Smartphone, MessageCircle, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface UseCaseTag {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const USE_CASE_TAGS: UseCaseTag[] = [
  { id: "e-commerce", label: "E-commerce", icon: ShoppingCart },
  { id: "saas", label: "SaaS", icon: BarChart3 },
  { id: "portfolio", label: "Portfolio", icon: Palette },
  { id: "internal-tool", label: "Internal Tool", icon: Wrench },
  { id: "marketplace", label: "Marketplace", icon: Store },
  { id: "mobile", label: "Mobile App", icon: Smartphone },
  { id: "social", label: "Social", icon: MessageCircle },
  { id: "other", label: "Other", icon: Sparkles },
];
