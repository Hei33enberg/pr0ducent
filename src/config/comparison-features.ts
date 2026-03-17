export interface ComparisonFeature {
  id: string;
  label: string;
  tools: string[];
}

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  { id: "fullstack", label: "Full-stack generation", tools: ["lovable", "replit", "bolt", "build0", "floot"] },
  { id: "one-click-deploy", label: "One-click deploy", tools: ["lovable", "replit", "v0", "bolt", "build0"] },
  { id: "backend", label: "Backend included", tools: ["lovable", "replit", "base44", "floot", "bolt", "build0"] },
  { id: "ui-library", label: "UI component library", tools: ["lovable", "v0", "orchids", "bolt"] },
  { id: "collaboration", label: "Collaborative editing", tools: ["replit", "cursor"] },
  { id: "git", label: "Git integration", tools: ["lovable", "cursor", "replit"] },
  { id: "mobile-first", label: "Mobile-first", tools: ["antigravity"] },
  { id: "enterprise", label: "Enterprise workflows", tools: ["floot", "base44"] },
  { id: "in-browser", label: "In-browser dev", tools: ["bolt", "replit", "v0", "lovable"] },
  { id: "design-systems", label: "Design systems", tools: ["lovable", "v0", "orchids"] },
  { id: "no-code", label: "No-code friendly", tools: ["lovable", "base44", "build0", "antigravity"] },
  { id: "api-integration", label: "API integration", tools: ["floot", "replit", "cursor", "lovable", "bolt"] },
];
